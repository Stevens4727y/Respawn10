from rest_framework import serializers

from .models import Distribucion


class DistribucionSerializer(serializers.ModelSerializer):
    escuela_nombre = serializers.CharField(source='escuela.nombre', read_only=True)
    item_nombre = serializers.CharField(source='item.nombre', read_only=True)
    usuario_nombre = serializers.SerializerMethodField(read_only=True)
    
    def get_usuario_nombre(self, obj):
        if obj.usuario:
            return f"{obj.usuario.nombre} {obj.usuario.apellido}"
        return None
    
    class Meta:
        model = Distribucion
        fields = [
            'id', 'tipo_movimiento', 'cantidad_enviada', 'fecha_envio',
            'fecha_recepcion', 'estado', 'responsable_envio', 'observaciones',
            'solicitud', 'escuela', 'item', 'usuario',
            'escuela_nombre', 'item_nombre', 'usuario_nombre'
        ]
