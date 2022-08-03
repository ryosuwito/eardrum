from django.contrib.auth.models import User
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

# @receiver(post_save, sender=Leave)
# def post_save_mentorship(sender, instance=None, created=False, **kwargs):
#     try:
#         if (not created) and instance.user and instance.status=='approved':
#             departments = ['HR','OP','SA']
#             profile = User.objects.get(username = instance.user).mentorship
#             print(instance.status)
#             print(profile.department)
#             if profile.department in departments :
#                 #send mail here
#                 pass
#     except Exception as e:
#         print(e)

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

class AutoSendEmailRule(models.Model):
    name = models.CharField(max_length=260, verbose_name="Template name")
    receiver = models.ManyToManyField(User,  related_name="receivers", related_query_name="receivers", blank=True)
    TRIGGER_CHOICES = (
        ("ON_APPROVED", "On Leave Approved"),
        ("ON_CREATED", "On Leave Created"),
        ("ON_REJECTED", "On Leave Rejected"),
        ("ON_LEAVE_DATE", "On Leave Date"),
    )
    trigger = models.CharField(max_length=100, blank=True, verbose_name="Select trigger rules") 
    CC_LIST_CHOICES = (
        ("HR_TEAM", "HR Team"),
        ("TEAM_LEAD", "User's Team Lead"),
        ("TEAM_MATES", "User's Teammates"),
        ("MENTOR", "User's Mentor"),
    )
    cc = models.CharField(max_length=100, blank=True, verbose_name="Select cc list")
    all_users_on_leave = models.BooleanField(default=False, verbose_name="Get all users list for template")
    all_users_on_leave = models.TextField(
        verbose_name="""Email Template\n
        keyword :\n
        [type] = type of leave \n
        [name] = username, [team] = department\n
        [start] = start_date, [end] = end_date
        """)
    INTERVAL_CHOICES = (
        ("EVERY_MORNING", "Every 8 am SGT"),
        ("ON_TRIGGER", "On Trigger"),
    )
    interval = models.CharField(max_length=20,
                    choices=INTERVAL_CHOICES,
                    default="ON_TRIGGER")