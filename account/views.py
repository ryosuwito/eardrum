from django.shortcuts import render
from django.contrib.auth import get_user_model

from rest_framework import viewsets

from .permissions import IsAuthenticated
from .serializers import UserSerializer

# Create your views here.

class UserViewset(viewsets.ModelViewSet):
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return  self.queryset.all()
