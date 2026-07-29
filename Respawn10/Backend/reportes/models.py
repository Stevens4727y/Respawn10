from django.db import models
from usuarios.models import Usuario
from inventario.models import Inventario


class ReporteDaño(models.Model):
    URGENCIA_CHOICES = [
        ('Bajo',    'Bajo'),
        ('Medio',   'Medio'),
        ('Alto',    'Alto'),
        ('Critico', 'Crítico'),
    ]
    ESTADO_CHOICES = [
        ('Pendiente',  'Pendiente'),
        ('En proceso', 'En proceso'),
        ('Resuelto',   'Resuelto'),
    ]

    descripcion_daño = models.CharField(max_length=500)
    nivel_urgencia   = models.CharField(max_length=20, choices=URGENCIA_CHOICES)
    estado           = models.CharField(max_length=30, choices=ESTADO_CHOICES, default='Pendiente')
    foto             = models.ImageField(upload_to='reportes/', blank=True, null=True)
    fecha_reporte    = models.DateTimeField(auto_now_add=True)
    fecha_resolucion = models.DateTimeField(blank=True, null=True)
    observaciones    = models.CharField(max_length=500, blank=True, null=True)
    inventario       = models.ForeignKey(
        Inventario,
        on_delete=models.CASCADE,
        related_name='reportes'
    )
    usuario          = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        related_name='reportes'
    )

    class Meta:
        db_table = 'reporte_daño'
        verbose_name = 'Reporte de Daño'

    def __str__(self):
        return f'{self.nivel_urgencia} - {self.estado}'