# flake8: noqa
from django.db import models
from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.db.models.signals import pre_save
from django.dispatch import receiver
from auditlog.registry import auditlog
from . import signals
from datetime import datetime, timedelta

from leave.models import ConfigEntry, ProratedLeave, HolidayLeave
import json
# Create your models here.

class LowerCaseField(models.CharField):
    def __init__(self, *args, **kwargs):
        super(LowerCaseField, self).__init__(*args, **kwargs)

    def get_prep_value(self, value):
        return str(value).upper()

class Country(models.Model):
    name = models.CharField(max_length=260)
    country_code = LowerCaseField(max_length=2, unique=True)    
    def __str__(self):
        return self.name
    class Meta:
        verbose_name = "Country"
        verbose_name_plural = "Countries"

class Mentorship(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="mentorship", null=True)
    mentor = models.ManyToManyField(User,  related_name="mentees", related_query_name="mentees", blank=True)
    teammate = models.ManyToManyField(User,  related_name="teammates", related_query_name="teammates", blank=True)
    EMPLOYMENT_STATUS_CHOICES = (
        ("INTERN", "Intern"),
        ("EMPLOYEE", "Employee"),
        ("PEMPLOYEE", "Past Employee"),
    )
    employment_status = models.CharField(max_length=10,
                    choices=EMPLOYMENT_STATUS_CHOICES,
                    default="EMPLOYEE")
    DEPARTMENT_CHOICES = (
        ('HR', 'HR'),
        ('BO', 'Backoffice'),
        ('SA', 'System Admin'),
        ('OP', 'Operations'),
        ('DA', 'Data'),
        ('DV', 'Developer'),
        ('RS', 'Researcher'),
    )
    WORK_PASS_CHOICES = (
        ('SGC', 'SG Citizen'),
        ('PRS', 'Permanent Resident'),
        ('EPS', 'Employment Pass'),
        ('SPS', 'S Pass'),
    )
    country = models.ForeignKey(Country, on_delete=models.SET_NULL, null=True, blank=False)
    work_pass = models.CharField(max_length=3, choices=WORK_PASS_CHOICES, default=None, null=True, blank=True,  help_text="For Singapore employees only, otherwise it'll be ignored")
    department = models.CharField(max_length=2, choices=DEPARTMENT_CHOICES, default=None, null=True, blank=False)
    join_date = models.DateField(default=None, null=True)
    children= models.IntegerField(default=0, null=True, blank=True, editable=False)
    children_birth_year = models.CharField(max_length=255, default=None, null=True, blank=True, help_text="Year(s) separated by semicolon (;)")
    def __str__(self):
        return self.user.username

    def __str__(self):
        if len(self.mentor.all()) > 0:
            return "{}: {} - Mentors : {}".format(self.get_employment_status_display(), self.user.username, ", ".join([m.username for m in self.mentor.all()]))
        return self.user.username

    def get_mentors_name(self):
        if len(self.mentor.all()) > 0:
            return ", ".join(self.mentor.values_list('username', flat=True))
        return "-"

    def isMentor(self, user):
        return self.mentor.filter(id=user.id).count() > 0
    
    class Meta:
        verbose_name = "Account Profile"
        verbose_name_plural = "Account Profiles"

auditlog.register(Mentorship, exclude_fields=['created_at', 'updated_at'])
post_save.connect(signals.create_user_mentorship, sender = User, dispatch_uid="my_unique_identifier")

class LeaveRule(models.Model):
    LEAVE_TYPE_CHOICES = (
        ("PR", "Personal"),
        ("CO", "Compassionate"),
        ("CC", "Childcare"),
        ("MD", "Medical"),
        ("WH", "Work From Home"),
    )
    WORK_PASS_CHOICES = (
        ('SGC', 'SG Citizen'),
        ('PRS', 'Permanent Resident'),
        ('EPS', 'Employment Pass'),
        ('SPS', 'S Pass'),
    )
    country = models.ForeignKey(Country, on_delete=models.SET_NULL, null=True, blank=False)
    work_pass = models.CharField(max_length=3, choices=WORK_PASS_CHOICES, default=None, null=True, blank=True, 
                                 help_text="For Singapore employees only, otherwise it'll be ignored")
    leave_type = models.CharField(max_length=2,
                    choices=LEAVE_TYPE_CHOICES,
                    default="PR")
    year = models.CharField(max_length=4, help_text="Year when this rule will be applied")
    days = models.IntegerField(default=0, help_text="Leave limit in days/year per child")
    children_max_age = models.IntegerField(default=0, help_text="Maximum age of eligible child <br> \
                                           Only applied to Childcare Leave")
    max_days = models.IntegerField(default=0, help_text="Maximum leave days/year <br>\
                                           (leave will be counted as days * number of eligible child) <br>\
                                           Only applied to Childcare Leave")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

def get_extra(instance):
    extra = None
    ce = ConfigEntry.objects.filter(name="leave_type_{}".format(datetime.now().year)).first()
    if ce :
        extra = json.loads(ce.extra)

    pr = ProratedLeave.objects.filter(name="{}_leave_{}".format(instance.user.username, datetime.now().year)).first()
    if pr :
        extra = json.loads(pr.extra)
    return extra

def save_personal_extra(extra, instance):
    if not extra:
        return
    pr = ProratedLeave.objects.filter(name="{}_leave_{}".format(instance.user.username, datetime.now().year)).first()
    if not pr:
        ProratedLeave.objects.create(
            user=instance.user,
            name="{}_leave_{}".format(instance.user.username, datetime.now().year),
            extra=json.dumps(extra)
        )
    else :
        pr.extra = json.dumps(extra, indent=2)
        pr.save()

def update_personal_childcare_leave(mentorship):
    rule = LeaveRule.objects.filter(
                                    country=mentorship.country,
                                    work_pass = mentorship.work_pass,
                                    leave_type = "CC",
                                    year = datetime.now().year
                                    ).first()
    days = 0 
    if rule and mentorship.children_birth_year:
        eligible_children = 0
        for birth_year in mentorship.children_birth_year.split(";"):
            if int(birth_year) + rule.children_max_age >= datetime.now().year:
                eligible_children += 1
        if eligible_children:
            days = eligible_children * rule.days
            days = days if days <= rule.max_days else rule.max_days

    extra = get_extra(mentorship)

    pro_rated_leaves = []
    for leave in extra:
        if leave["name"] == "childcare":
            leave["limitation"] = days
        pro_rated_leaves.append(leave)
    save_personal_extra(pro_rated_leaves, mentorship)

@receiver(post_save, sender=LeaveRule)
def update_country_leave_rules(sender, instance, **kwargs):
    leave_type = {
        "PR": "personal",
        "CO": "compassionate",
        "CC": "childcare",
        "MD": "medical",
        "WH": "work_from_home",
    }
    users = Mentorship.objects.filter(country = instance.country).all()
    for user in users:
        if instance.leave_type == "CC":
            update_personal_childcare_leave(user)
        else :
            pro_rated_leaves = []
            extra = get_extra(user)
            for leave in extra:
                if leave["name"] == leave_type[instance.leave_type]:
                    leave["limitation"] = instance.days
                pro_rated_leaves.append(leave)
            save_personal_extra(pro_rated_leaves, user)

def update_singapore_holiday(instance=None):
    additional = 0
    if instance.country.country_code == "SG":
        hl = HolidayLeave.objects.get_or_create(user=instance.user, year=datetime.now().year)[0]
        sample = HolidayLeave.objects.filter(year = datetime.now().year).first()
        if sample:
            hl.days = sample.days
            hl.save()
            additional = sample.days
    return additional

def update_children_amount(instance=None):
    if instance.children_birth_year:
        try:
            instance.children = len(instance.children_birth_year.split(";"))
            if len(instance.children_birth_year) > 0 and instance.children == 0:
                instance.children = 1
        except:
            pass
    else:
       instance.children = 0 

def update_work_pass(instance=None):
    singapore = Country.objects.get_or_create(name="Singapore", country_code="SG")[0]
    if instance.work_pass and instance.country != singapore:
        instance.work_pass = None

def update_join_date(instance=None):
    extra = None
    ce = ConfigEntry.objects.filter(name="leave_type_{}".format(datetime.now().year)).first()
    if ce :
        extra = json.loads(ce.extra)
    if instance.join_date and extra:
        this_start_year = datetime.fromisoformat("{}-01-01 00:00:00".format(datetime.now().year))
        this_end_year = datetime.fromisoformat("{}-12-31 00:00:00".format(datetime.now().year))
        this_year_days = (this_end_year - this_start_year).days
        join_with_time = datetime(
            year=instance.join_date.year, 
            month=instance.join_date.month,
            day=instance.join_date.day,
        )
        delta = this_end_year - join_with_time
        pro_rated_leaves = []
        for leave in extra:
            if leave["name"] == "personal":
                holiday = update_singapore_holiday(instance)
                additional = (delta.days/this_year_days) * (leave["limitation"] + holiday)
                final = round(additional*2) / 2 - holiday
                leave["limitation"] = final if final < leave["limitation"] else leave["limitation"]
            pro_rated_leaves.append(leave)
        save_personal_extra(pro_rated_leaves, instance)

@receiver(pre_save, sender=Mentorship)
def presave_mentorship(sender, instance=None, created=False, **kwargs):
    update_work_pass(instance)
    update_children_amount(instance)
    update_singapore_holiday(instance)
    update_join_date(instance)
    update_personal_childcare_leave(instance)