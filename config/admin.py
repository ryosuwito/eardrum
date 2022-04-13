from django.contrib import admin

from .models import Entry

# Register your models here.


class EntryAdmin(admin.ModelAdmin):
    list_display = ('name', 'value')


admin.site.register(Entry, EntryAdmin)
