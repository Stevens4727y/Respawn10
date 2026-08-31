from django.db import models
from usuarios.models import Escuela, Usuario
from Inventario.models import Item


class SolicitudRecurso(models.Model):
    TIPO_CHOICES = [
        ('Recurso',    'Recurso'),
        ('Reparacion', 'Reparación'),
    ]
    ESTADO_CHOICES = [
        ('Pendiente',  'Pendiente'),
        ('Aprobada',   'Aprobada'),
        ('Rechazada',  'Rechazada'),
        ('Entregada',  'Entregada'),
    ]

    tipo_solicitud      = models.CharField(max_length=30, choices=TIPO_CHOICES, default='Recurso')
    cantidad_solicitada = models.IntegerField()
    justificacion       = models.CharField(max_length=500)
    estado              = models.CharField(max_length=30, choices=ESTADO_CHOICES, default='Pendiente')
    fecha_solicitud     = models.DateTimeField(auto_now_add=True)
    fecha_respuesta     = models.DateTimeField(blank=True, null=True)
    observaciones_resp  = models.CharField(max_length=500, blank=True, null=True)
    escuela             = models.ForeignKey(
        Escuela,
        on_delete=models.CASCADE,
        related_name='solicitudes'
    )
    usuario             = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        related_name='solicitudes'
    )
    item                = models.ForeignKey(
        Item,
        on_delete=models.PROTECT,
        related_name='solicitudes'
    )

    class Meta:
        db_table = 'solicitud_recurso'
        verbose_name = 'Solicitud de Recurso'

    def __str__(self):
        return f'{self.tipo_solicitud} - {self.escuela} - {self.estado}'