# Generated by Django 2.1.7 on 2021-12-14 21:46

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('okr_app', '0002_okrfile'),
    ]

    operations = [
        migrations.AlterField(
            model_name='okrfile',
            name='okr',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                                    related_name='files', to='okr_app.OKR'),
        ),
    ]
