from django.contrib.auth.models import User

from rest_framework import serializers

from okr_app.models import OKR


class OKRSerializer(serializers.ModelSerializer):
    class Meta:
        model = OKR
        fields = '__all__'

    issuer = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all())
