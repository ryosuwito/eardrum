from django.contrib.auth.models import User

from rest_framework import serializers
from markdownx import utils

from okr_app.models import OKR


class LightOKRSerializer(serializers.ModelSerializer):
    class Meta:
        model = OKR
        fields = ['id', 'quarter', 'year', 'issuer', 'html_content']

    issuer = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all())

    html_content = serializers.SerializerMethodField()

    def get_html_content(self, obj):
        return utils.markdownify(obj.content)


class OKRSerializer(serializers.ModelSerializer):
    class Meta:
        model = OKR
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    issuer = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all())
