from django.contrib import admin
from django.db import models
from django.http import HttpResponseRedirect
from django.shortcuts import render
from datetime import datetime, date, time
from account.models import Mentorship
from markdownx.widgets import AdminMarkdownxWidget
from .forms import BatchRequestForm
from .models import (
    Question,
    Bucket,
    Request,
    TemplateRequest
)


class QuestionAdmin(admin.ModelAdmin):
    formfield_overrides = {
        models.TextField: {'widget': AdminMarkdownxWidget}
    }


class BucketAdmin(admin.ModelAdmin):
    filter_horizontal = ['questions']


class RequestAdmin(admin.ModelAdmin):
    readonly_fields = ['review']


class TemplateRequestAdmin(admin.ModelAdmin):
    actions = ['create_batch']

    def create_batch(self, request, queryset):
        templates = queryset.all()
        pks = templates[0].pk
        selected_templates = request.POST.getlist("selected_templates")
        if 'apply' in request.POST:
            datestr = request.POST.get("close_at_0").split("-")
            timestr = request.POST.get("close_at_1").split(":")
            for selected in selected_templates:
                template = TemplateRequest.objects.get(pk=selected.split("/")[0])
                mentorship = template.mentorship.get(pk=selected.split("/")[1])
                for mentor in mentorship.mentor.all():
                    Request.objects.create(
                        reviewer=mentor,
                        reviewee=mentorship.user,
                        bucket=template.bucket,
                        close_at=datetime.combine(date(int(datestr[0]), int(datestr[1]), int(datestr[2])),
                                                  time(int(timestr[0]), int(timestr[1]), int(timestr[2]))),
                        quarter_and_year=request.POST.get("quarter_and_year"),
                    )
            self.message_user(request, 'Created {} new Requests'.format(len(selected_templates)))
            return HttpResponseRedirect(request.get_full_path())

        return render(request,
                      'admin/batch_request.html',
                      context={
                          'pks': pks,
                          'form': BatchRequestForm(),
                          'templates': templates
                      })

    def display_template_name(self, obj):
        return obj.title

    def display_bucket(self, obj):
        return obj.bucket.title

    def display_mentee(self, obj):
        mentorships = obj.mentorship.all()
        return ', '.join([m.user.username for m in mentorships])

    def get_form(self, request, obj=None, **kwargs):
        form = super(TemplateRequestAdmin, self).get_form(request, obj, **kwargs)
        form.base_fields['mentorship'].queryset = Mentorship.objects.exclude(mentor=None)
        return form
    filter_horizontal = ('mentorship',)
    create_batch.admin_order_field = 'create_batch'
    create_batch.short_description = "Create Batch Requests"
    display_bucket.short_description = 'Bucket'
    display_mentee.short_description = 'Reviewee'
    display_template_name.short_description = 'Template Name'
    list_display = ('display_template_name', 'display_mentee', 'display_bucket',)

# Register your models here.


admin.site.register(Question, QuestionAdmin)
admin.site.register(Bucket, BucketAdmin)
admin.site.register(Request, RequestAdmin)
admin.site.register(TemplateRequest, TemplateRequestAdmin)
