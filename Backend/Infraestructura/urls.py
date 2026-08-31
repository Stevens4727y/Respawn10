from django.urls import path

from .views import (
    InfraestructuraDetailView,
    InfraestructuraListCreateView,
    MantenimientoDetailView,
    MantenimientoListCreateView,
)

urlpatterns = [
    path('', InfraestructuraListCreateView.as_view(), name='infraestructura-list'),
    path('<int:pk>/', InfraestructuraDetailView.as_view(), name='infraestructura-detail'),
    path('mantenimientos/', MantenimientoListCreateView.as_view(), name='mantenimiento-list'),
    path('mantenimientos/<int:pk>/', MantenimientoDetailView.as_view(), name='mantenimiento-detail'),
]