from django.contrib import admin

from okr_app.models import OKR, OKRFile

# Register your models here.


class OKRAdmin(admin.ModelAdmin):
    list_display = ('id', 'issuer', 'quarter', 'year')


class OKRFileAdmin(admin.ModelAdmin):
    list_display = ('id', 'file', 'okr')


admin.site.register(OKR, OKRAdmin)
admin.site.register(OKRFile, OKRFileAdmin)
