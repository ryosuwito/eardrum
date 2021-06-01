from rest_framework import (
    viewsets,
    permissions,
)

from .models import Guideline
from .serializers import GuidelineSerializer


class GuidelineViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = Guideline.objects.all()
    serializer_class = GuidelineSerializer

    def get_queryset(self):
        return self.queryset.all()
