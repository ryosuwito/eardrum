import datetime
import pytz
import logging

from django.db import models
from django.contrib.auth.models import User

from .settings import app_settings as review_settings
from account.models import Mentorship
# Create your models here.
from auditlog.registry import auditlog

Logger = logging.getLogger(__name__)


class Question(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True, null=False, default='')

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # This field is for adding some group title or summary comment to a bucket,
    # in those case the question is a dummy and not for answering. For example,
    # people want a summary comment at the end of the form or they want to separate
    # the question list into 2 or more groups with related questions so they want
    # a group title for each groups.
    typ = models.CharField(max_length=10, blank=True, null=False, default='')

    def __str__(self):
        return "(%s) %s" % (self.id, self.title)


class Bucket(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=False, default='')

    questions = models.ManyToManyField(Question)

    extra = models.CharField(
        max_length=255,
        help_text="Weights of question in the format of \"question_id:weight;question_id:weight;...\"")

    ordering = models.CharField(
        max_length=255, null=False, blank=True, default='',
        help_text="Ordering of questions will be listed in format of \"question1_id,question2_id,question3_id,..\"")

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return "(%s) %s" % (self.id, self.title)


class Request(models.Model):
    reviewer = models.ForeignKey(
        User,
        models.CASCADE,
        related_name='reviewer_requests',
        related_query_name='reviewer_request',
    )
    reviewee = models.ForeignKey(
        User,
        models.CASCADE,
        related_name='reviewee_requests',
        related_query_name='reviewee_request',
    )

    bucket = models.ForeignKey(Bucket, models.CASCADE)

    # Json as text
    review = models.TextField(blank=True, null=False, default="{}")

    # A point of time when the request will be closed, in other words.
    # It's only available to be updated between created_at and close_at
    close_at = models.DateTimeField(null=True, blank=True)

    quarter_and_year = models.CharField(
        max_length=10, null=False, blank=True, default='q,yyyy')

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def get_close_at(self):
        open_time = review_settings.REQUEST_WILL_BE_CLOSED_AFTER

        close_at = self.close_at if self.close_at is not None \
            else self.created_at + datetime.timedelta(hours=open_time)

        return close_at

    def is_request_valid_to_update(self):
        """
        Check if a request is valid to be updated or not.
        """
        now = pytz.utc.localize(datetime.datetime.now())

        return self.get_close_at() > now

    def __str__(self):
        return "(%s) %s - %s" % (self.id, self.reviewer.username, self.reviewee.username)


class TemplateRequest(models.Model):
    title = models.CharField(max_length=255, blank=False, null=False, default="")
    mentorship = models.ManyToManyField(Mentorship, related_name="template_requests")

    bucket = models.ForeignKey(Bucket, models.CASCADE)

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return 'Mentorship : {} - Bucket: {}'.format(
            ','.join([m.user.username for m in self.mentorship.all()]),
            self.bucket.title
            )


auditlog.register(TemplateRequest, exclude_fields=['created_at', 'updated_at'])
