from django.contrib.auth import get_user_model

from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'is_admin')
        read_only_fields = ('id', 'username', 'email')

    is_admin = serializers.SerializerMethodField()

    def get_is_admin(self, obj):
        return obj.is_staff and obj.is_superuser
