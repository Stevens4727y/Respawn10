from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import SolicitudRecurso
from .serializers import SolicitudRecursoSerializer


class SolicitudListCreateView(generics.ListCreateAPIView):
	queryset = SolicitudRecurso.objects.select_related('escuela', 'item', 'usuario').all()
	serializer_class = SolicitudRecursoSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		"""Filtrar solicitudes según el alcance del usuario"""
		user = self.request.user
		if user.es_admin_nacional:
			return SolicitudRecurso.objects.select_related('escuela', 'item', 'usuario').all()
		elif user.escuela:
			return SolicitudRecurso.objects.filter(escuela=user.escuela).select_related('escuela', 'item', 'usuario')
		elif user.departamento_asignado:
			return SolicitudRecurso.objects.filter(
				escuela__municipio__departamento=user.departamento_asignado
			).select_related('escuela', 'item', 'usuario')
		else:
			return SolicitudRecurso.objects.none()

	def perform_create(self, serializer):
		# Solo Admin MINED puede crear solicitudes
		if not self.request.user.es_admin_nacional:
			from rest_framework.exceptions import PermissionDenied
			raise PermissionDenied('Solo Admin MINED puede crear solicitudes')
		serializer.save(usuario=self.request.user)


class SolicitudDetailView(generics.RetrieveUpdateDestroyAPIView):
	queryset = SolicitudRecurso.objects.select_related('escuela', 'item', 'usuario').all()
	serializer_class = SolicitudRecursoSerializer
	permission_classes = [IsAuthenticated]

	def destroy(self, request, *args, **kwargs):
		# Solo Admin MINED puede borrar solicitudes
		if not request.user.es_admin_nacional:
			from rest_framework.exceptions import PermissionDenied
			raise PermissionDenied('Solo Admin MINED puede borrar solicitudes')
		return super().destroy(request, *args, **kwargs)
