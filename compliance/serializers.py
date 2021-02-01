import json

from rest_framework import serializers

from .models import Compliance


class ComplianceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Compliance
        fields = '__all__'

    json_data = serializers.SerializerMethodField()

    def get_json_data(self, obj):
        try:
            ret = json.loads(obj.data)
        except Exception:
            ret = None

        return ret
