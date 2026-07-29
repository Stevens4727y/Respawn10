from rest_framework import serializers
from .models import CategoriaItem, Item, Inventario


class CategoriaItemSerializer(serializers.ModelSerializer):
    class Meta:
        model  = CategoriaItem
        fields = ['id', 'nombre', 'descripcion']


class ItemSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)

    class Meta:
        model  = Item
        fields = ['id', 'nombre', 'descripcion', 'unidad_medida', 'categoria', 'categoria_nombre']


class InventarioSerializer(serializers.ModelSerializer):
    escuela_nombre  = serializers.CharField(source='escuela.nombre',  read_only=True)
    item_nombre     = serializers.CharField(source='item.nombre',     read_only=True)
    categoria_nombre= serializers.CharField(source='item.categoria.nombre', read_only=True)
    unidad_medida   = serializers.CharField(source='item.unidad_medida',    read_only=True)

    class Meta:
        model  = Inventario
        fields = [
            'id', 'cantidad_total', 'cantidad_bueno',
            'cantidad_regular', 'cantidad_malo',
            'fecha_actualizacion', 'observaciones',
            'escuela', 'item',
            'escuela_nombre', 'item_nombre',
            'categoria_nombre', 'unidad_medida',
        ]