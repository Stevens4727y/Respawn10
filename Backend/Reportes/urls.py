from django.urls import path
from .views import ReporteListCreateView, ReporteDetailView

urlpatterns = [
    path('',      ReporteListCreateView.as_view(), name='reporte-list'),
    path('<int:pk>/', ReporteDetailView.as_view(), name='reporte-detail'),
]