# Generated by Django 2.1.7 on 2021-12-10 06:39

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('okr_app', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='OKRFile',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(blank=True, null=True, upload_to='okr')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('okr', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='okr_app.OKR')),
            ],
        ),
    ]
