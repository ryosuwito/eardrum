from django.contrib import admin
from django.contrib.auth.models import User

from .models import (
    Mentorship,
    Country,
)

# Register your models here.

class CountryAdmin(admin.ModelAdmin):
    list_display = ('name', 'country_code', )

class MentorshipAdmin(admin.ModelAdmin):
    list_filter = ('employment_status', 'department', 'country', 'work_pass',)

    def get_form(self, request, obj=None, **kwargs):
        form = super(MentorshipAdmin, self).get_form(request, obj, **kwargs)
        if obj:
            form.base_fields['mentor'].queryset = User.objects.exclude(pk=obj.user.pk)
            form.base_fields['teammate'].queryset = User.objects.exclude(pk=obj.user.pk)
        return form

    def mentors(self, obj):
        return ", ".join([user.username for user in obj.mentor.all()])
        
    def teammates(self, obj):
        return ", ".join([user.username for user in obj.mentor.all()])

    list_display = ('user', 'mentors', 'employment_status', 'department', 'country', 'work_pass', 'join_date', 'children',)
    filter_horizontal = ('mentor','teammate',)


admin.site.register(Mentorship, MentorshipAdmin)
admin.site.register(Country, CountryAdmin)
