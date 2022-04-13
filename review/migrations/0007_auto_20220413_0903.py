# Generated by Django 2.1.7 on 2022-04-13 01:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('review', '0006_auto_20220111_1202'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bucket',
            name='extra',
            field=models.CharField(help_text='Weights of question in the format of "question_id:weight;question_id:weight;..."', max_length=255),
        ),
        migrations.AlterField(
            model_name='bucket',
            name='ordering',
            field=models.CharField(blank=True, default='', help_text='Ordering of questions will be listed in format of "question1_id,question2_id,question3_id,.."', max_length=255),
        ),
    ]
