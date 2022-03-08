# Generated by Django 2.1.7 on 2022-01-07 03:02

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Mentorship',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('employment_status', models.CharField(choices=[('INTERN', 'Intern'), ('EMPLOYEE', 'Employee')],
                                                       default='EMPLOYEE', max_length=8)),
                ('mentor', models.ManyToManyField(blank=True, related_name='mentees',
                                                  related_query_name='mentees', to=settings.AUTH_USER_MODEL)),
                ('user', models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE,
                                              related_name='mentorship', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
