from django.urls import path

from .views import SolicitudDetailView, SolicitudListCreateView

urlpatterns = [
    path('', SolicitudListCreateView.as_view(), name='solicitud-list'),
    path('<int:pk>/', SolicitudDetailView.as_view(), name='solicitud-detail'),
]