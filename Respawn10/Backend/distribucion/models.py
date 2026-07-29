from django.db import models
from usuarios.models import Escuela
from inventario.models import Item
from solicitudes.models import SolicitudRecurso


class Distribucion(models.Model):
    MOVIMIENTO_CHOICES = [
        ('Entrada', 'Entrada'),
        ('Salida',  'Salida'),
    ]
    ESTADO_CHOICES = [
        ('Enviado',    'Enviado'),
        ('Recibido',   'Recibido'),
        ('Confirmado', 'Confirmado'),
    ]

    tipo_movimiento   = models.CharField(max_length=20, choices=MOVIMIENTO_CHOICES, default='Salida')
    cantidad_enviada  = models.IntegerField()
    fecha_envio       = models.DateTimeField(auto_now_add=True)
    fecha_recepcion   = models.DateTimeField(blank=True, null=True)
    estado            = models.CharField(max_length=30, choices=ESTADO_CHOICES, default='Enviado')
    responsable_envio = models.CharField(max_length=200, blank=True, null=True)
    observaciones     = models.CharField(max_length=500, blank=True, null=True)
    solicitud         = models.ForeignKey(
        SolicitudRecurso,
        on_delete=models.PROTECT,
        related_name='distribuciones'
    )
    escuela           = models.ForeignKey(
        Escuela,
        on_delete=models.CASCADE,
        related_name='distribuciones'
    )
    item              = models.ForeignKey(
        Item,
        on_delete=models.PROTECT,
        related_name='distribuciones'
    )

    class Meta:
        db_table = 'distribucion'
        verbose_name = 'Distribución'

    def __str__(self):
        return f'{self.tipo_movimiento} - {self.escuela} - {self.item}'