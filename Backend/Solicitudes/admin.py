from django.contrib import admin
from .models import SolicitudRecurso


@admin.register(SolicitudRecurso)
class SolicitudRecursoAdmin(admin.ModelAdmin):
    list_display = ('id', 'tipo_solicitud', 'estado', 'cantidad_solicitada', 'escuela', 'item', 'usuario')
    list_filter = ('estado', 'tipo_solicitud', 'escuela')
    search_fields = ('justificacion', 'escuela__nombre', 'item__nombre', 'usuario__email')
    ordering = ('-fecha_solicitud',)
