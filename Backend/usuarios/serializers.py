from rest_framework import serializers

from .models import Departamento, Institucion, Rol, Usuario


class UsuarioAsignacionSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(required=False, allow_blank=True)
    apellido = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    rol = serializers.PrimaryKeyRelatedField(queryset=Rol.objects.all(), required=False)
    departamento_asignado = serializers.PrimaryKeyRelatedField(
        queryset=Departamento.objects.all(), allow_null=True, required=False
    )
    institucion = serializers.PrimaryKeyRelatedField(
        queryset=Institucion.objects.all(), allow_null=True, required=False
    )
    rol_nombre = serializers.CharField(source='rol.nombre', read_only=True)
    departamento_nombre = serializers.CharField(source='departamento_asignado.nombre', read_only=True)
    institucion_nombre = serializers.CharField(source='institucion.nombre', read_only=True)

    class Meta:
        model = Usuario
        fields = [
            'id', 'nombre', 'apellido', 'email', 'activo', 'rol', 'rol_nombre',
            'departamento_asignado', 'departamento_nombre', 'institucion', 'institucion_nombre'
        ]

    def validate(self, attrs):
        rol = attrs.get('rol') or getattr(self.instance, 'rol', None)
        if not rol:
            return attrs

        nombre_rol = (rol.nombre or '').strip().lower()

        if nombre_rol == 'supervisor':
            departamento = attrs.get('departamento_asignado', getattr(self.instance, 'departamento_asignado', None))
            if not departamento:
                raise serializers.ValidationError({
                    'departamento_asignado': 'El supervisor debe tener un departamento asignado.'
                })
            attrs['institucion'] = None

        elif nombre_rol in {'director', 'docente'}:
            institucion = attrs.get('institucion', getattr(self.instance, 'institucion', None))
            if not institucion:
                raise serializers.ValidationError({
                    'institucion': 'El director y el docente deben tener una institución asignada.'
                })
            attrs['departamento_asignado'] = institucion.departamento
            attrs['institucion'] = institucion

        elif nombre_rol in {'admin mined', 'admin'}:
            attrs['departamento_asignado'] = None
            attrs['institucion'] = None

        return attrs
