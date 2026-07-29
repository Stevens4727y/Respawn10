from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import CategoriaItem, Item, Inventario
from .serializers import CategoriaItemSerializer, ItemSerializer, InventarioSerializer


class CategoriaListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categorias = CategoriaItem.objects.all()
        serializer = CategoriaItemSerializer(categorias, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CategoriaItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ItemListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items      = Item.objects.all()
        serializer = ItemSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InventarioListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.rol and user.rol.nombre == 'Admin MINED':
            inventarios = Inventario.objects.all().order_by('escuela__nombre')
        elif user.escuela:
            inventarios = Inventario.objects.filter(
                escuela=user.escuela
            ).order_by('item__nombre')
        else:
            inventarios = Inventario.objects.none()

        serializer = InventarioSerializer(inventarios, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = InventarioSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InventarioDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Inventario.objects.get(pk=pk)
        except Inventario.DoesNotExist:
            return None

    def get(self, request, pk):
        inv = self.get_object(pk)
        if not inv:
            return Response({'error': 'No encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(InventarioSerializer(inv).data)

    def patch(self, request, pk):
        inv = self.get_object(pk)
        if not inv:
            return Response({'error': 'No encontrado'}, status=status.HTTP_404_NOT_FOUND)
        serializer = InventarioSerializer(inv, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        inv = self.get_object(pk)
        if not inv:
            return Response({'error': 'No encontrado'}, status=status.HTTP_404_NOT_FOUND)
        inv.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ResumenInventarioView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.rol and user.rol.nombre == 'Admin MINED':
            inventarios = Inventario.objects.all()
        elif user.escuela:
            inventarios = Inventario.objects.filter(escuela=user.escuela)
        else:
            inventarios = Inventario.objects.none()

        total_items    = inventarios.count()
        total_bueno    = sum(i.cantidad_bueno   for i in inventarios)
        total_regular  = sum(i.cantidad_regular for i in inventarios)
        total_malo     = sum(i.cantidad_malo    for i in inventarios)
        total_general  = sum(i.cantidad_total   for i in inventarios)

        return Response({
            'total_items':   total_items,
            'total_bueno':   total_bueno,
            'total_regular': total_regular,
            'total_malo':    total_malo,
            'total_general': total_general,
        })