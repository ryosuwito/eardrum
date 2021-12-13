from django.shortcuts import get_object_or_404

from rest_framework import (viewsets, mixins)
from rest_framework.permissions import (IsAuthenticated, IsAdminUser)
from rest_framework.exceptions import PermissionDenied

from .serializers import (OKRSerializer, OKRFileSerializer, LightOKRSerializer)
from .models import OKR, OKRFile
from .permissions import IsApplicationAdminUser, IsOKROwner
# Create your views here.


class OKRViewset(viewsets.GenericViewSet,
                 mixins.CreateModelMixin,
                 mixins.RetrieveModelMixin,
                 mixins.ListModelMixin,
                 mixins.DestroyModelMixin,
                 mixins.UpdateModelMixin):
    """
    """
    permission_classes = [IsAuthenticated]
    serializer_class = OKRSerializer
    queryset = OKR.objects.all()

    def get_queryset(self):
        """
        """
        if IsApplicationAdminUser.has_permission(None, self.request, self):
            return self.queryset.all()
        else:
            return self.request.user.okr_set.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return LightOKRSerializer
        else:
            return self.serializer_class

    def create(self, request, *args, **kwargs):
        request.data['issuer'] = request.user.username
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not IsAdminUser.has_permission(None, request, self):
            if request.data.get('issuer', None):
                del request.data['issuer']
        return super().update(request, *args, **kwargs)


class OKRFileViewset(viewsets.GenericViewSet,
                     mixins.CreateModelMixin,
                     mixins.DestroyModelMixin,
                     mixins.RetrieveModelMixin,
                     mixins.ListModelMixin):
    """
    """
    permission_classes = [IsAuthenticated]
    serializer_class = OKRFileSerializer
    queryset = OKRFile.objects.all()

    def check_okr_permission(self, okr):
        return (IsApplicationAdminUser().has_permission(self.request, self) or
                IsOKROwner().has_object_permission(self.request, None, okr))

    def get_queryset(self):
        okr = None
        if self.request.GET.get("okr", None):
            okr = get_object_or_404(OKR, pk=self.request.GET.get("okr", None))
        elif self.kwargs.get("pk", None):
            okr = get_object_or_404(OKR, files=self.kwargs['pk'])

        if okr and self.check_okr_permission(okr):
            return self.queryset.filter(okr_id=okr.id)

        return self.queryset.none()

    def create(self, request, *args, **kwargs):
        okr = get_object_or_404(OKR, pk=request.data['okr'])
        if okr and self.check_okr_permission(okr):
            return super().create(request, *args, **kwargs)
        else:
            raise PermissionDenied({"error": "Not OKR owner."})
