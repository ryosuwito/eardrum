from django.db import models
from django.contrib.auth.models import User

from auditlog.registry import auditlog

# Create your models here.


class OKR(models.Model):
    issuer = models.ForeignKey(User, on_delete=models.CASCADE)
    quarter = models.CharField(max_length=10)
    year = models.CharField(max_length=10)

    content = models.TextField(blank='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return '{}-{}-{}'.format(self.year, self.quarter, self.issuer.username)


auditlog.register(OKR, exclude_fields=['created_at', 'updated_at'])
