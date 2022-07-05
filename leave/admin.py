from django.contrib import admin
from django.apps import apps
from .models import (
    ConfigEntry, ProratedLeave, HolidayLeave
)

app = apps.get_app_config('leave')

# Register your models here.
excluded_models = [ConfigEntry, ProratedLeave, HolidayLeave]

for model_name, model in app.models.items():
    if model in excluded_models:
        continue
    admin.site.register(model)

class ConfigEntryAdmin(admin.ModelAdmin):
    list_display = ('name',)
class ProratedLeaveAdmin(admin.ModelAdmin):
    list_display = ('name',)
class HolidayLeaveAdmin(admin.ModelAdmin):
    list_display = ('user',)

admin.site.register(HolidayLeave, HolidayLeaveAdmin)
admin.site.register(ProratedLeave, ProratedLeaveAdmin)
admin.site.register(ConfigEntry, ConfigEntryAdmin)
