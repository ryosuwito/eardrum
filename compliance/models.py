from django.db import models

from auditlog.registry import auditlog

# Create your models here.


class Compliance(models.Model):
    submit_by = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    typ = models.CharField(max_length=255)
    status = models.CharField(max_length=255, blank=True, default='pending')
    data = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


auditlog.register(Compliance, exclude_fields=['created_at', 'updated_at'])
