from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import SolicitudRecurso
from .serializers import SolicitudRecursoSerializer


class SolicitudListCreateView(generics.ListCreateAPIView):
	queryset = SolicitudRecurso.objects.select_related('escuela', 'item', 'usuario').all()
	serializer_class = SolicitudRecursoSerializer
	permission_classes = [IsAuthenticated]

	def perform_create(self, serializer):
		serializer.save(usuario=self.request.user)


class SolicitudDetailView(generics.RetrieveUpdateDestroyAPIView):
	queryset = SolicitudRecurso.objects.select_related('escuela', 'item', 'usuario').all()
	serializer_class = SolicitudRecursoSerializer
	permission_classes = [IsAuthenticated]
