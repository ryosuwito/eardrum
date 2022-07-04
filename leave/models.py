from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import pre_save
from django.dispatch import receiver
# Create your models here.



class Leave(models.Model):
    user = models.CharField(max_length=255)
    startdate = models.CharField(max_length=20)
    enddate = models.CharField(max_length=20)
    # TODO year is not able to be None
    year = models.CharField(max_length=20, default=None)
    typ = models.CharField(max_length=255)
    half = models.CharField(max_length=20)
    status = models.CharField(max_length=255)
    note = models.TextField(blank=True, default="")
    active = models.BooleanField(blank=True, default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['year']),
            models.Index(fields=['status']),
        ]


class ConfigEntry(models.Model):
    name = models.CharField(max_length=255, unique=True)
    value = models.CharField(max_length=255, blank=True, null=True)
    extra = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class LeaveMask(models.Model):
    name = models.CharField(max_length=260, unique=True)
    value = models.TextField()
    summary = models.TextField()
    capacity = models.TextField(default='{}')

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


class AdditionalLeave(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    year = models.CharField(max_length=20, default=None)
    typ = models.CharField(max_length=255)
    days = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.user.username


class AccountProfile(models.Model):    
    WORK_PASS_CHOICES = (
        ('SGC', 'SG Citizen'),
        ('PRS', 'Permanent Resident'),
        ('EPS', 'Employment Pass'),
        ('SPS', 'S Pass'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    country = models.ForeignKey(Country, on_delete=models.SET_NULL, null=True, blank=True)
    work_pass = models.CharField(max_length=3, choices=WORK_PASS_CHOICES, default=None, null=True, blank=True,  help_text="For Singaporean Only, otherwise it'll be ignored")
    join_date = models.DateField()
    children= models.IntegerField(default=0, null=True, blank=True, editable=False)
    children_birth_year = models.CharField(max_length=255, default=None, null=True, blank=True, help_text="Year(s) separated by semicolon (;)")
    def __str__(self):
        return self.user.username

@receiver(pre_save, sender=AccountProfile)
def presave_children_amount(sender, instance=None, created=False, **kwargs):
    singapore = Country.objects.get_or_create(name="Singapore", country_code="SG")[0]
    if instance.children_birth_year:
        try:
            instance.children_amount = len(instance.children_birth_year.split(";"))
        except:
            pass
    if instance.work_pass and instance.country != singapore:
        instance.work_pass = None
