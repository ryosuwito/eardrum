from django.db import models


class Guideline(models.Model):
    key = models.CharField(max_length=255, primary_key=True)
    content = models.TextField()
