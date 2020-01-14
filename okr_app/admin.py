from django.contrib import admin

from okr_app.models import OKR

# Register your models here.


class OKRAdmin(admin.ModelAdmin):
    list_display = ('id', 'issuer', 'quarter', 'year')


admin.site.register(OKR, OKRAdmin)
