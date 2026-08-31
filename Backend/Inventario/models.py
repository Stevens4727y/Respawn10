from django.db import models
from usuarios.models import Escuela


class CategoriaItem(models.Model):
    nombre      = models.CharField(max_length=100)
    descripcion = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'categoria_item'
        verbose_name = 'Categoría de Item'

    def __str__(self):
        return self.nombre


class Item(models.Model):
    nombre        = models.CharField(max_length=150)
    descripcion   = models.CharField(max_length=300, blank=True, null=True)
    unidad_medida = models.CharField(max_length=50)
    categoria     = models.ForeignKey(
        CategoriaItem,
        on_delete=models.PROTECT,
        related_name='items'
    )

    class Meta:
        db_table = 'item'
        verbose_name = 'Item'

    def __str__(self):
        return self.nombre


class Inventario(models.Model):
    cantidad_total      = models.IntegerField(default=0)
    cantidad_bueno      = models.IntegerField(default=0)
    cantidad_regular    = models.IntegerField(default=0)
    cantidad_malo       = models.IntegerField(default=0)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    observaciones       = models.CharField(max_length=500, blank=True, null=True)
    escuela             = models.ForeignKey(
        Escuela,
        on_delete=models.CASCADE,
        related_name='inventarios'
    )
    item                = models.ForeignKey(
        Item,
        on_delete=models.PROTECT,
        related_name='inventarios'
    )

    class Meta:
        db_table = 'inventario'
        verbose_name = 'Inventario'

    def __str__(self):
        return f'{self.escuela} - {self.item}'