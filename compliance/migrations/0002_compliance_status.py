# Generated by Django 2.1.7 on 2021-03-08 07:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('compliance', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='compliance',
            name='status',
            field=models.CharField(blank=True, default='pending', max_length=255),
        ),
    ]
