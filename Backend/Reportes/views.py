from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import ReporteDaño
from .serializers import ReporteDañoSerializer


class ReporteListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        user = request.user
        if user.es_admin_nacional:
            reportes = ReporteDaño.objects.all().order_by('-fecha_reporte')
        elif user.escuela:
            reportes = ReporteDaño.objects.filter(
                inventario__escuela=user.escuela
            ).order_by('-fecha_reporte')
        elif user.departamento_asignado:
            reportes = ReporteDaño.objects.filter(
                inventario__escuela__municipio__departamento=user.departamento_asignado
            ).order_by('-fecha_reporte')
        else:
            reportes = ReporteDaño.objects.none()

        serializer = ReporteDañoSerializer(
            reportes, many=True, context={'request': request}
        )
        return Response(serializer.data)

    def post(self, request):
        serializer = ReporteDañoSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save(usuario=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReporteDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return ReporteDaño.objects.get(pk=pk)
        except ReporteDaño.DoesNotExist:
            return None

    def get(self, request, pk):
        reporte = self.get_object(pk)
        if not reporte:
            return Response({'error': 'Reporte no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ReporteDañoSerializer(reporte, context={'request': request})
        return Response(serializer.data)

    def patch(self, request, pk):
        # Solo Admin puede cambiar el estado
        reporte = self.get_object(pk)
        if not reporte:
            return Response({'error': 'Reporte no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ReporteDañoSerializer(
            reporte, data=request.data,
            partial=True, context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        # Solo Admin MINED puede borrar reportes
        if not request.user.es_admin_nacional:
            return Response(
                {'error': 'Solo Admin MINED puede borrar reportes'},
                status=status.HTTP_403_FORBIDDEN
            )
        reporte = self.get_object(pk)
        if not reporte:
            return Response({'error': 'Reporte no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        reporte.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)