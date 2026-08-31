from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Infraestructura, Mantenimiento
from .serializers import InfraestructuraSerializer, MantenimientoSerializer


class InfraestructuraListCreateView(generics.ListCreateAPIView):
	queryset = Infraestructura.objects.select_related('escuela', 'usuario').all()
	serializer_class = InfraestructuraSerializer
	permission_classes = [IsAuthenticated]

	def perform_create(self, serializer):
		serializer.save(usuario=self.request.user)


class InfraestructuraDetailView(generics.RetrieveUpdateDestroyAPIView):
	queryset = Infraestructura.objects.select_related('escuela', 'usuario').all()
	serializer_class = InfraestructuraSerializer
	permission_classes = [IsAuthenticated]


class MantenimientoListCreateView(generics.ListCreateAPIView):
	queryset = Mantenimiento.objects.select_related('escuela', 'infraestructura', 'usuario').all()
	serializer_class = MantenimientoSerializer
	permission_classes = [IsAuthenticated]

	def perform_create(self, serializer):
		serializer.save(usuario=self.request.user)


class MantenimientoDetailView(generics.RetrieveUpdateDestroyAPIView):
	queryset = Mantenimiento.objects.select_related('escuela', 'infraestructura', 'usuario').all()
	serializer_class = MantenimientoSerializer
	permission_classes = [IsAuthenticated]
