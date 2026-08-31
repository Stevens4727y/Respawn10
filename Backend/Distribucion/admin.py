from django.contrib import admin
from .models import Distribucion


@admin.register(Distribucion)
class DistribucionAdmin(admin.ModelAdmin):
    list_display = ('id', 'tipo_movimiento', 'estado', 'cantidad_enviada', 'escuela', 'item', 'usuario')
    list_filter = ('estado', 'tipo_movimiento', 'escuela')
    search_fields = ('observaciones', 'escuela__nombre', 'item__nombre', 'usuario__email')
    ordering = ('-fecha_envio',)
