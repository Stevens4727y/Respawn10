from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from usuarios.mixins import FiltradoPorAlcanceMixin
from Auditoria.services import registrar_desde_request
from .models import CategoriaItem, Item, Inventario
from .serializers import CategoriaItemSerializer, ItemSerializer, InventarioSerializer


class CategoriaListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categorias = CategoriaItem.objects.all()
        return Response(CategoriaItemSerializer(categorias, many=True).data)

    def post(self, request):
        if not request.user.es_admin_nacional:
            return Response({'error': 'Sin permiso'}, status=status.HTTP_403_FORBIDDEN)
        serializer = CategoriaItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ItemListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(ItemSerializer(Item.objects.all(), many=True).data)

    def post(self, request):
        if not request.user.es_admin_nacional:
            return Response({'error': 'Sin permiso'}, status=status.HTTP_403_FORBIDDEN)
        serializer = ItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InventarioListCreateView(FiltradoPorAlcanceMixin, APIView):
    permission_classes = [IsAuthenticated]
    campo_departamento  = 'escuela__municipio__departamento'
    campo_institucion   = 'escuela'

    def get(self, request):
        qs         = Inventario.objects.all().order_by('escuela__nombre')
        filtrados  = self.filtrar_por_alcance(qs, request.user)
        return Response(InventarioSerializer(filtrados, many=True).data)

    def post(self, request):
        # Auditor y Estudiante no pueden crear
        if request.user.es_auditor or request.user.es_estudiante:
            return Response({'error': 'Sin permiso para crear inventario'}, status=status.HTTP_403_FORBIDDEN)
        serializer = InventarioSerializer(data=request.data)
        if serializer.is_valid():
            obj = serializer.save()
            registrar_desde_request(request, 'CREATE', 'Inventario', 'Inventario', obj.id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InventarioDetailView(FiltradoPorAlcanceMixin, APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            obj = Inventario.objects.get(pk=pk)
        except Inventario.DoesNotExist:
            return None, False
        puede = self.usuario_puede_acceder_objeto(obj, user)
        return obj, puede

    def get(self, request, pk):
        obj, puede = self.get_object(pk, request.user)
        if not obj:
            return Response({'error': 'No encontrado'}, status=status.HTTP_404_NOT_FOUND)
        if not puede:
            return Response({'error': 'Sin permiso'}, status=status.HTTP_403_FORBIDDEN)
        return Response(InventarioSerializer(obj).data)

    def patch(self, request, pk):
        if request.user.es_auditor or request.user.es_estudiante:
            return Response({'error': 'Sin permiso'}, status=status.HTTP_403_FORBIDDEN)
        obj, puede = self.get_object(pk, request.user)
        if not obj:
            return Response({'error': 'No encontrado'}, status=status.HTTP_404_NOT_FOUND)
        if not puede:
            return Response({'error': 'Sin permiso'}, status=status.HTTP_403_FORBIDDEN)
        serializer = InventarioSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            registrar_desde_request(request, 'UPDATE', 'Inventario', 'Inventario', pk)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        if not request.user.es_admin_nacional:
            return Response({'error': 'Solo Admin MINED puede eliminar'}, status=status.HTTP_403_FORBIDDEN)
        obj, puede = self.get_object(pk, request.user)
        if not obj:
            return Response({'error': 'No encontrado'}, status=status.HTTP_404_NOT_FOUND)
        obj.delete()
        registrar_desde_request(request, 'DELETE', 'Inventario', 'Inventario', pk)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ResumenInventarioView(FiltradoPorAlcanceMixin, APIView):
    permission_classes = [IsAuthenticated]
    campo_departamento  = 'escuela__municipio__departamento'
    campo_institucion   = 'escuela'

    def get(self, request):
        qs = self.filtrar_por_alcance(Inventario.objects.all(), request.user)
        return Response({
            'total_items':   qs.count(),
            'total_bueno':   sum(i.cantidad_bueno   for i in qs),
            'total_regular': sum(i.cantidad_regular for i in qs),
            'total_malo':    sum(i.cantidad_malo    for i in qs),
            'total_general': sum(i.cantidad_total   for i in qs),
        })