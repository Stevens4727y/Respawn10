from rest_framework import serializers

from .models import SolicitudRecurso


class SolicitudRecursoSerializer(serializers.ModelSerializer):
    escuela_nombre = serializers.CharField(source='escuela.nombre', read_only=True)
    item_nombre = serializers.CharField(source='item.nombre', read_only=True)

    class Meta:
        model = SolicitudRecurso
        fields = '__all__'
        read_only_fields = ['usuario', 'fecha_solicitud', 'fecha_respuesta']
