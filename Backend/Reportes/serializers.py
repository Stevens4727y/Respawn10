from rest_framework import serializers
from .models import ReporteDaño
from usuarios.models import Usuario
from Inventario.models import Inventario


class ReporteDañoSerializer(serializers.ModelSerializer):
    usuario_nombre   = serializers.CharField(source='usuario.nombre',          read_only=True)
    escuela_nombre   = serializers.CharField(source='inventario.escuela.nombre', read_only=True)
    item_nombre      = serializers.CharField(source='inventario.item.nombre',    read_only=True)
    foto_url         = serializers.SerializerMethodField()

    class Meta:
        model  = ReporteDaño
        fields = [
            'id', 'descripcion_daño', 'nivel_urgencia', 'estado',
            'foto', 'foto_url', 'fecha_reporte', 'fecha_resolucion',
            'observaciones', 'inventario', 'usuario',
            'usuario_nombre', 'escuela_nombre', 'item_nombre',
        ]
        read_only_fields = ['fecha_reporte', 'usuario']

    def get_foto_url(self, obj):
        request = self.context.get('request')
        if obj.foto and request:
            return request.build_absolute_uri(obj.foto.url)
        return None