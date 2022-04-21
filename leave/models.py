from django.db import models

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


class AdditionalLeave(models.Model):
    user = models.CharField(max_length=255)
    year = models.CharField(max_length=20, default=None)
    typ = models.CharField(max_length=255)
    days = models.IntegerField(max_length=30)
    created_at = models.DateTimeField(auto_now_add=True)
