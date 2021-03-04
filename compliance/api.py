import copy
import json

from rest_framework import (
    viewsets,
    permissions,
    status,
    response,
)

from .models import Compliance
from .serializers import (
    ComplianceSerializer,
    ComplianceAdminSerializer,
)


class ComplianceViewset(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Compliance.objects.all()

    def get_queryset(self):
        if permissions.IsAdminUser.has_permission(None, self.request, self):
            return self.queryset.all()
        else:
            return self.queryset.filter(submit_by=self.request.user.username)

    def get_serializer_class(self):
        if self.request.user.is_superuser:
            return ComplianceAdminSerializer

        return ComplianceSerializer

    def create(self, request, *args, **kwargs):
        data = copy.deepcopy(request.data)
        data['submit_by'] = request.user.username
        if not isinstance(data.get('data'), str):
            data['data'] = json.dumps(data.get('data'))

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return response.Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = copy.deepcopy(request.data)
        data['submit_by'] = request.user.username
        if not isinstance(data.get('data'), str):
            data['data'] = json.dumps(data.get('data'))
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return response.Response(serializer.data)
