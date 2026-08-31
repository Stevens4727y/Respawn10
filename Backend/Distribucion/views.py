from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Distribucion
from .serializers import DistribucionSerializer


class DistribucionListCreateView(generics.ListCreateAPIView):
	serializer_class = DistribucionSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		"""Filtrar distribuciones según el alcance del usuario"""
		user = self.request.user
		if user.es_admin_nacional:
			return Distribucion.objects.select_related('solicitud', 'escuela', 'item', 'usuario').all()
		elif user.escuela:
			return Distribucion.objects.filter(escuela=user.escuela).select_related('solicitud', 'escuela', 'item', 'usuario')
		elif user.departamento_asignado:
			return Distribucion.objects.filter(
				escuela__municipio__departamento=user.departamento_asignado
			).select_related('solicitud', 'escuela', 'item', 'usuario')
		else:
			return Distribucion.objects.none()

	def perform_create(self, serializer):
		"""Registrar el usuario que solicita la distribución"""
		serializer.save(usuario=self.request.user)


class DistribucionDetailView(generics.RetrieveUpdateDestroyAPIView):
	serializer_class = DistribucionSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		"""Filtrar distribuciones según el alcance del usuario"""
		user = self.request.user
		if user.es_admin_nacional:
			return Distribucion.objects.select_related('solicitud', 'escuela', 'item', 'usuario').all()
		elif user.escuela:
			return Distribucion.objects.filter(escuela=user.escuela).select_related('solicitud', 'escuela', 'item', 'usuario')
		elif user.departamento_asignado:
			return Distribucion.objects.filter(
				escuela__municipio__departamento=user.departamento_asignado
			).select_related('solicitud', 'escuela', 'item', 'usuario')
		else:
			return Distribucion.objects.none()
