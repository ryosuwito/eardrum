# Generated by Django 2.1.7 on 2021-12-20 11:49

from django.db import migrations, models
import okr_app.models


class Migration(migrations.Migration):

    dependencies = [
        ('okr_app', '0003_auto_20211214_2146'),
    ]

    operations = [
        migrations.AlterField(
            model_name='okrfile',
            name='file',
            field=models.FileField(blank=True, null=True, upload_to=okr_app.models.okrfilename),
        ),
    ]
