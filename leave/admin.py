from django.contrib import admin
from django.apps import apps
from .models import (
    Country,
    ConfigEntry,
)

app = apps.get_app_config('leave')

# Register your models here.
excluded_models = [Country, ConfigEntry]

for model_name, model in app.models.items():
    if model in excluded_models:
        continue
    admin.site.register(model)

class CountryAdmin(admin.ModelAdmin):
    list_display = ('name', 'country_code', )

class ConfigEntryAdmin(admin.ModelAdmin):
    list_display = ('name',)

admin.site.register(ConfigEntry, ConfigEntryAdmin)
admin.site.register(Country, CountryAdmin)