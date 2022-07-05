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

# , ,, Department, Mentor, Teammate, Employment Status, Join Date, Children 
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

@receiver(pre_save, sender=Mentorship)
def presave_children_amount(sender, instance=None, created=False, **kwargs):
    singapore = Country.objects.get_or_create(name="Singapore", country_code="SG")[0]
    if instance.children_birth_year:
        try:
            instance.children = len(instance.children_birth_year.split(";"))
            if len(instance.children_birth_year) > 0 and instance.children == 0:
                instance.children = 1
        except:
            pass
    if instance.work_pass and instance.country != singapore:
        instance.work_pass = None

@receiver(pre_save, sender=Mentorship)
def presave_join_date(sender, instance=None, created=False, **kwargs):
    if instance.join_date and instance.join_date.year == datetime.now().year:
        this_start_year = datetime.fromisoformat("{}-01-01 00:00:00".format(datetime.now().year))
        this_end_year = datetime.fromisoformat("{}-12-31 00:00:00".format(datetime.now().year))
        this_year_days = (this_end_year - this_start_year).days
        join_with_time = datetime(
            year=instance.join_date.year, 
            month=instance.join_date.month,
            day=instance.join_date.day,
        )
        delta = this_end_year - join_with_time
        ce = ConfigEntry.objects.get(name="leave_type_{}".format(datetime.now().year))
        pro_rated_leaves = []
        for leave in json.loads(ce.extra):
            leave["limitation"] = int((delta.days/this_year_days) * leave["limitation"])
            pro_rated_leaves.append(leave)
        
        pr = ProratedLeave.objects.filter(name="{}_leave_{}".format(instance.user.username, datetime.now().year))
        if not pr :
            ProratedLeave.objects.create(
                user=instance.user,
                name="{}_leave_{}".format(instance.user.username, datetime.now().year),
                extra=json.dumps(pro_rated_leaves)
            )
        else :
            pr[0].extra = json.dumps(pro_rated_leaves, indent=2)
            pr[0].save()

        if instance.country.country_code == "SG":
            hl = HolidayLeave.objects.get_or_create(user=instance.user, year=datetime.now().year)[0]
            sample = HolidayLeave.objects.filter(year = datetime.now().year).first()
            if sample:
                hl.days = sample.days
                hl.save()