from django.db import models

# Create your models here.


class Entry(models.Model):
    name = models.CharField(max_length=255, null=False, blank=False, unique=True)
    value = models.TextField(null=False, blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
