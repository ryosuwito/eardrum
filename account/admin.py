from django.contrib import admin
from django.contrib.auth.models import User

from account.models import Mentorship

# Register your models here.


class MentorshipAdmin(admin.ModelAdmin):
    def get_form(self, request, obj=None, **kwargs):
        form = super(MentorshipAdmin, self).get_form(request, obj, **kwargs)
        if obj:
            form.base_fields['mentor'].queryset = User.objects.exclude(pk=obj.user.pk)
        return form

    def mentors(self, obj):
        return ", ".join([user.username for user in obj.mentor.all()])
    list_display = ('user', 'mentors', 'employment_status',)
    filter_horizontal = ('mentor',)


admin.site.register(Mentorship, MentorshipAdmin)
