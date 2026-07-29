from django.db import models
from usuarios.models import Escuela, Usuario


class Infraestructura(models.Model):
    TIPO_CHOICES = [
        ('Aula',        'Aula'),
        ('Laboratorio', 'Laboratorio'),
        ('Oficina',     'Oficina'),
        ('Baño',        'Baño'),
        ('Cancha',      'Cancha'),
        ('Biblioteca',  'Biblioteca'),
        ('Comedor',     'Comedor'),
    ]
    ESTADO_CHOICES = [
        ('Bueno',         'Bueno'),
        ('Regular',       'Regular'),
        ('Malo',          'Malo'),
        ('En reparacion', 'En reparación'),
    ]

    nombre           = models.CharField(max_length=200)
    tipo             = models.CharField(max_length=100, choices=TIPO_CHOICES)
    estado           = models.CharField(max_length=30, choices=ESTADO_CHOICES, default='Bueno')
    capacidad        = models.IntegerField(blank=True, null=True)
    año_construccion = models.IntegerField(blank=True, null=True)
    area_m2          = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    observaciones    = models.CharField(max_length=500, blank=True, null=True)
    fecha_registro   = models.DateTimeField(auto_now_add=True)
    escuela          = models.ForeignKey(
        Escuela,
        on_delete=models.CASCADE,
        related_name='infraestructuras'
    )
    usuario          = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        related_name='infraestructuras'
    )

    class Meta:
        db_table = 'infraestructura'
        verbose_name = 'Infraestructura'

    def __str__(self):
        return f'{self.tipo} - {self.nombre}'


class Mantenimiento(models.Model):
    PRIORIDAD_CHOICES = [
        ('Baja',    'Baja'),
        ('Media',   'Media'),
        ('Alta',    'Alta'),
        ('Urgente', 'Urgente'),
    ]
    ESTADO_CHOICES = [
        ('Solicitado', 'Solicitado'),
        ('Programado', 'Programado'),
        ('En proceso', 'En proceso'),
        ('Completado', 'Completado'),
    ]
    TIPO_CHOICES = [
        ('Electrico',   'Eléctrico'),
        ('Plomeria',    'Plomería'),
        ('Pintura',     'Pintura'),
        ('Estructural', 'Estructural'),
        ('Equipos',     'Equipos'),
    ]

    tipo             = models.CharField(max_length=100, choices=TIPO_CHOICES)
    descripcion      = models.CharField(max_length=500)
    prioridad        = models.CharField(max_length=20, choices=PRIORIDAD_CHOICES)
    estado           = models.CharField(max_length=30, choices=ESTADO_CHOICES, default='Solicitado')
    fecha_solicitud  = models.DateTimeField(auto_now_add=True)
    fecha_completado = models.DateTimeField(blank=True, null=True)
    costo_estimado   = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    escuela          = models.ForeignKey(
        Escuela,
        on_delete=models.CASCADE,
        related_name='mantenimientos'
    )
    infraestructura  = models.ForeignKey(
        Infraestructura,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='mantenimientos'
    )
    usuario          = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        related_name='mantenimientos'
    )

    class Meta:
        db_table = 'mantenimiento'
        verbose_name = 'Mantenimiento'

    def __str__(self):
        return f'{self.tipo} - {self.escuela}'