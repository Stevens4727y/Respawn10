from rest_framework import serializers

from .models import Infraestructura, Mantenimiento


class InfraestructuraSerializer(serializers.ModelSerializer):
    escuela_nombre = serializers.CharField(source='escuela.nombre', read_only=True)

    class Meta:
        model = Infraestructura
        fields = '__all__'
        read_only_fields = ['usuario', 'fecha_registro']


class MantenimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mantenimiento
        fields = '__all__'
        read_only_fields = ['usuario', 'fecha_solicitud']
