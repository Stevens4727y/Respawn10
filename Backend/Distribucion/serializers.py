from rest_framework import serializers

from .models import Distribucion


class DistribucionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Distribucion
        fields = '__all__'
