from django.contrib.auth.models import User

from rest_framework import serializers
from markdownx import utils

from okr_app.models import OKR, OKRFile


class OKRFileSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = OKRFile
        fields = '__all__'
        read_only_fields = ['created_at']

    def get_name(self, obj):
        fullname = obj.file.name.split('/')[-1]
        return fullname.split('_', 1)[-1]


class LightOKRSerializer(serializers.ModelSerializer):
    class Meta:
        model = OKR
        fields = ['id', 'quarter', 'year', 'issuer', 'html_content', 'files']

    issuer = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all())
    files = OKRFileSerializer(many=True, read_only=True)

    html_content = serializers.SerializerMethodField()

    def get_html_content(self, obj):
        return utils.markdownify(obj.content)


class OKRSerializer(serializers.ModelSerializer):
    class Meta:
        model = OKR
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    issuer = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all())
    files = OKRFileSerializer(many=True, read_only=True)
