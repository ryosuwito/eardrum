from rest_framework import serializers

from .models import Guideline


class GuidelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guideline
        fields = '__all__'
