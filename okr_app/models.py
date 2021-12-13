import uuid

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


def okrfilename(instance, filename):
    _filename = 'okr/{}/{}/{}_{}'.format(
        instance.okr.issuer,
        instance.okr.id,
        uuid.uuid4(),
        filename,
    )

    parts = filename.split('.')
    if len(parts) > 0:
        # last part is file extension
        _filename = '.'.join([_filename, parts[-1]])

    return _filename


class OKRFile(models.Model):
    okr = models.ForeignKey(OKR, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(blank=True, null=True, upload_to=okrfilename)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return '{}'.format(self.file)


auditlog.register(OKRFile, exclude_fields=['created_at'])
