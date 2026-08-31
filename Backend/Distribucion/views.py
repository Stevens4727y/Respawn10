from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Distribucion
from .serializers import DistribucionSerializer


class DistribucionListCreateView(generics.ListCreateAPIView):
	queryset = Distribucion.objects.select_related('solicitud', 'escuela', 'item').all()
	serializer_class = DistribucionSerializer
	permission_classes = [IsAuthenticated]


class DistribucionDetailView(generics.RetrieveUpdateDestroyAPIView):
	queryset = Distribucion.objects.select_related('solicitud', 'escuela', 'item').all()
	serializer_class = DistribucionSerializer
	permission_classes = [IsAuthenticated]
