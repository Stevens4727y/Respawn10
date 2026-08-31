from django.urls import path

from .views import DistribucionDetailView, DistribucionListCreateView

urlpatterns = [
    path('', DistribucionListCreateView.as_view(), name='distribucion-list'),
    path('<int:pk>/', DistribucionDetailView.as_view(), name='distribucion-detail'),
]
