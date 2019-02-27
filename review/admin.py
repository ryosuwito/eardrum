from django.contrib import admin

from review.models import (
    Question,
    Bucket,
    Request,
    Review,
)

# Register your models here.

admin.site.register(Question)
admin.site.register(Bucket)
admin.site.register(Request)
admin.site.register(Review)
