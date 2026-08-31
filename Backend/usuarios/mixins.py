class FiltradoPorAlcanceMixin:
    """
    Mixin reutilizable que filtra querysets según el alcance del usuario.

    Uso:
        class MiView(FiltradoPorAlcanceMixin, APIView):
            def get(self, request):
                qs = self.filtrar_por_alcance(MiModelo.objects.all(), request.user)
    """

    # Campos del modelo que apuntan a departamento e institución
    campo_departamento = 'escuela__municipio__departamento'
    campo_institucion  = 'escuela'

    def filtrar_por_alcance(self, queryset, user):
        """Filtra el queryset según el rol y alcance del usuario."""

        if not user.is_authenticated:
            return queryset.none()

        # Admin MINED → ve todo
        if user.tiene_alcance_nacional:
            return queryset

        # Supervisor / Auditor → solo su departamento
        if user.tiene_alcance_departamental:
            if user.departamento_asignado:
                return queryset.filter(
                    **{self.campo_departamento: user.departamento_asignado}
                )
            return queryset.none()

        # Director / Docente / Estudiante → solo su institución/escuela
        if user.tiene_alcance_institucional:
            if user.escuela:
                return queryset.filter(
                    **{self.campo_institucion: user.escuela}
                )
            return queryset.none()

        return queryset.none()

    def usuario_puede_acceder_objeto(self, obj, user):
        """
        Verifica si el usuario puede acceder a un objeto específico.
        Protege contra manipulación de IDs.
        """
        if user.tiene_alcance_nacional:
            return True

        # Obtener departamento del objeto
        try:
            dept_obj = self._obtener_departamento_objeto(obj)
        except Exception:
            return False

        if user.tiene_alcance_departamental:
            return dept_obj == user.departamento_asignado

        if user.tiene_alcance_institucional:
            try:
                inst_obj = self._obtener_institucion_objeto(obj)
                return inst_obj == user.escuela
            except Exception:
                return False

        return False

    def _obtener_departamento_objeto(self, obj):
        """Navega la relación para obtener el departamento del objeto."""
        partes = self.campo_departamento.split('__')
        valor  = obj
        for parte in partes:
            valor = getattr(valor, parte, None)
            if valor is None:
                return None
        return valor

    def _obtener_institucion_objeto(self, obj):
        """Navega la relación para obtener la institución del objeto."""
        partes = self.campo_institucion.split('__')
        valor  = obj
        for parte in partes:
            valor = getattr(valor, parte, None)
            if valor is None:
                return None
        return valor