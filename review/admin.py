from django.contrib import admin
from django.db import models

from markdownx.widgets import AdminMarkdownxWidget

from review.models import (
    Question,
    Bucket,
    Request,
)


class QuestionAdmin(admin.ModelAdmin):
    formfield_overrides = {
        models.TextField: {'widget': AdminMarkdownxWidget}
    }


class BucketAdmin(admin.ModelAdmin):
    filter_horizontal = ['questions']


class RequestAdmin(admin.ModelAdmin):
    readonly_fields = ['review']

# Register your models here.

admin.site.register(Question, QuestionAdmin)
admin.site.register(Bucket, BucketAdmin)
admin.site.register(Request, RequestAdmin)
