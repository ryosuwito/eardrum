from rest_framework import (viewsets, mixins)
from rest_framework.permissions import (IsAuthenticated, IsAdminUser)

from .serializers import (OKRSerializer, LightOKRSerializer)
from .models import OKR

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
        if IsAdminUser.has_permission(None, self.request, self):
            return self.queryset.all()
        else:
            return self.request.user.okr_set.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return LightOKRSerializer
        else:
            return self.serializer_class

    def create(self, request, *args, **kwargs):
        if not IsAdminUser.has_permission(None, request, self):
            request.data['issuer'] = request.user.username
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not IsAdminUser.has_permission(None, request, self):
            if request.data['issuer']:
                del request.data['issuer']
        return super().update(request, *args, **kwargs)
