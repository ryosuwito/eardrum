# flake8: noqa
from django.db import models
from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.db.models.signals import pre_save
from django.dispatch import receiver
from auditlog.registry import auditlog
from . import signals
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


@receiver(pre_save, sender=Mentorship)
def presave_mentorship(sender, instance=None, created=False, **kwargs):
    update_work_pass(instance)
    update_children_amount(instance)
