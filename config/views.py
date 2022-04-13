from django.shortcuts import (
    get_object_or_404,
)

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Entry
from . import utils

# Create your views here.


class ConfigViewset(viewsets.GenericViewSet):
    permission_classes = []
    queryset = Entry.objects.all()

    @action(detail=False, methods=['GET'])
    def grade_options(self, request, *args, **kwargs):
        instance = get_object_or_404(Entry, name='grade_options')

        return Response(utils.get_grade_options(instance.value))
