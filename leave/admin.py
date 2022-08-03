from django.contrib import admin
from django.apps import apps
from .models import (
    ConfigEntry, ProratedLeave, HolidayLeave, AutoSendEmailRule
)
from account.models import LeaveRule

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
    list_display = ('name','trigger','interval',)

admin.site.register(AutoSendEmailRule, AutoSendEmailRuleAdmin)
admin.site.register(HolidayLeave, HolidayLeaveAdmin)
admin.site.register(LeaveRule, LeaveRuleAdmin)
admin.site.register(ProratedLeave, ProratedLeaveAdmin)
admin.site.register(ConfigEntry, ConfigEntryAdmin)
