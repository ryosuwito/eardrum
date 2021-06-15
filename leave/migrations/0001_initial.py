# Generated by Django 2.1.7 on 2021-06-15 11:09

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Leave',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user', models.CharField(max_length=255)),
                ('startdate', models.CharField(max_length=20)),
                ('enddate', models.CharField(max_length=20)),
                ('typ', models.CharField(max_length=255)),
                ('half', models.CharField(max_length=20)),
                ('status', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
