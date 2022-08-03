from django.contrib import admin
from django.apps import apps
from django import forms
from django.contrib.auth.models import User
from django.contrib.admin import widgets
from .models import (
    ConfigEntry, ProratedLeave, HolidayLeave, AutoSendEmailRule
)
from account.models import LeaveRule
import json

app = apps.get_app_config('leave')

# Register your models here.
excluded_models = [ConfigEntry, ProratedLeave, HolidayLeave, AutoSendEmailRule]

for model_name, model in app.models.items():
    if model in excluded_models:
        continue
    admin.site.register(model)

class ConfigEntryAdmin(admin.ModelAdmin):
    list_display = ('name',)
class ProratedLeaveAdmin(admin.ModelAdmin):
    list_display = ('name',)
class LeaveRuleAdmin(admin.ModelAdmin):
    list_display = ('country','work_pass','leave_type','days','year',)
class HolidayLeaveAdmin(admin.ModelAdmin):
    list_display = ('user', 'days','year',)
    
class AutoSendEmailRuleAdmin(admin.ModelAdmin):
    list_filter = ('name','trigger','interval',)
    def get_form(self, request, obj=None, **kwargs):
        form = super(AutoSendEmailRuleAdmin, self).get_form(request, obj, **kwargs)
        form.base_fields['receiver'].queryset = User.objects.all()
        existing = obj.trigger.replace("[","").replace("]","").replace("'","").split(',')
        form.base_fields['trigger'].widget = widgets.FilteredSelectMultiple(verbose_name="Triggers",is_stacked=False, choices=AutoSendEmailRule.TRIGGER_CHOICES)
        form.base_fields['trigger'].initial =  existing
        print(form.base_fields['trigger'].initial)
        form.base_fields['cc'].widget = widgets.FilteredSelectMultiple(verbose_name="Triggers",is_stacked=False, choices=AutoSendEmailRule.CC_LIST_CHOICES)
        form.base_fields['email_template'].widget.attrs['placeholder'] = """
        *(it will iterate when All users on leave is checked)

        example: 
        Hi all, please note the following colleagues are on leave today:
        [n]. [name] - [team]

        rendered:
        Hi all, please note the following colleagues are on leave today:
        1. john - HR
        2. smith - Operations
        """
        return form
    list_display = ('name','trigger','interval',)
    filter_horizontal = ('receiver',)

admin.site.register(AutoSendEmailRule, AutoSendEmailRuleAdmin)
admin.site.register(HolidayLeave, HolidayLeaveAdmin)
admin.site.register(LeaveRule, LeaveRuleAdmin)
admin.site.register(ProratedLeave, ProratedLeaveAdmin)
admin.site.register(ConfigEntry, ConfigEntryAdmin)
