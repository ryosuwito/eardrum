from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
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

@receiver(post_save, sender=Leave)
def post_save_mentorship(sender, instance=None, created=False, **kwargs):
    print(created)
    print(instance)

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

class AdditionalLeave(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    year = models.CharField(max_length=4, default=None)
    typ = models.CharField(max_length=255)
    days = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.user.username

class ProratedLeave(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255, unique=True)
    value = models.CharField(max_length=255, blank=True, null=True)
    extra = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name = "Account Leave Limit"
        verbose_name_plural = "Account Leave Limits"

class HolidayLeave(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    year = models.CharField(max_length=4)
    days = models.IntegerField(default=0)
    extra = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)