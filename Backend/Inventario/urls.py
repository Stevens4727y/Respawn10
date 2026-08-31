from django.urls import path
from .views import (
    CategoriaListView,
    ItemListView,
    InventarioListCreateView,
    InventarioDetailView,
    ResumenInventarioView,
)

urlpatterns = [
    path('',                CategoriaListView.as_view(),       name='categoria-list'),
    path('items/',          ItemListView.as_view(),             name='item-list'),
    path('inventarios/',    InventarioListCreateView.as_view(), name='inventario-list'),
    path('inventarios/<int:pk>/', InventarioDetailView.as_view(), name='inventario-detail'),
    path('resumen/',        ResumenInventarioView.as_view(),    name='inventario-resumen'),
]