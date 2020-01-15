from django.contrib.auth.models import User

from rest_framework import serializers
from markdownx import utils

from okr_app.models import OKR


class LightOKRSerializer(serializers.ModelSerializer):
    class Meta:
        model = OKR
        fields = ['id', 'quarter', 'year', 'issuer']

    issuer = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all())


class OKRSerializer(serializers.ModelSerializer):
    class Meta:
        model = OKR
        fields = '__all__'

    issuer = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all())
