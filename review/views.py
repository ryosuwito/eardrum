from django.shortcuts import render

from rest_framework import (
    viewsets,
    mixins,
    # status,
)
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.decorators import action
from account.permissions import (
    IsAdminUser,
    IsAuthenticated,
)

from .serializers import RequestSerializer
from .models import Request


class UpdateModelMixin(object):
    """
    Update a model instance.
    """
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def perform_update(self, serializer):
        if not serializer.instance.is_request_valid_to_update():
            raise ValidationError('The request is closed.', 'the_request_is_closed')

        serializer.save()

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


class RequestViewSet(mixins.ListModelMixin,
                     mixins.RetrieveModelMixin,
                     UpdateModelMixin,
                     viewsets.GenericViewSet):
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Admin
        if IsAdminUser().has_permission(self.request, self):
            return self.queryset.all()

        # Reviewer
        return self.queryset.filter(reviewer=self.request.user)
