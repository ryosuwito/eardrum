from django.contrib.auth import get_user_model

from rest_framework import viewsets, mixins, decorators
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from .serializers import UserSerializer

# Create your views here.


class UserViewset(viewsets.GenericViewSet,
                  mixins.ListModelMixin):
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if IsAdminUser.has_permission(None, self.request, self):
            return self.queryset.all()
        else:
            return self.queryset.filter(pk=self.request.user.id)

    @decorators.action(methods=['get'], detail=False)
    def current_user(self, request, *args, **kwargs):
        return Response(self.get_serializer_class()(request.user).data)
