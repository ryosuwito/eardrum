from django.db import models
from django.contrib.auth.models import User

# Create your models here.


class Question(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Bucket(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    
    questions = models.ManyToManyField(Question)
    coefficients = models.CharField(max_length=255)

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Request(models.Model):
    reviewer = models.ForeignKey(
        User,
        models.DO_NOTHING,
        related_name='reviewer_requests',
        related_query_name='reviewer_request',
    )
    reviewee = models.ForeignKey(
        User,
        models.DO_NOTHING,
        related_name='reviewee_requests',
        related_query_name='reviewee_request',
    )
    
    bucket = models.ForeignKey(Bucket, models.DO_NOTHING)

    status = models.CharField(max_length=255)
    summary = models.CharField(max_length=255)

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    
class Review(models.Model):
    request = models.ForeignKey(Request, models.DO_NOTHING)
    question = models.ForeignKey(Question, models.DO_NOTHING)

    content = models.CharField(max_length=255)
    extra_content = models.TextField()

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
