from django.contrib.auth import authenticate
from .models import Departamento, Institucion
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        if not email or not password:
            return Response(
                {'error': 'Email y contrasena requeridos'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(request, username=email, password=password)

        if user is None:
            return Response(
                {'error': 'Credenciales incorrectas'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
            'usuario': {
                'id':       user.id,
                'nombre':   user.nombre,
                'apellido': user.apellido,
                'email':    user.email,
                'rol':      user.rol.nombre if user.rol else None,
                'escuela':  user.escuela.nombre if user.escuela else None,
            }
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            token = RefreshToken(request.data.get('refresh'))
            token.blacklist()
            return Response(
                {'mensaje': 'Sesion cerrada'},
                status=status.HTTP_200_OK
            )
        except Exception:
            return Response(
                {'error': 'Token invalido'},
                status=status.HTTP_400_BAD_REQUEST
            )


class PerfilView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id':       user.id,
            'nombre':   user.nombre,
            'apellido': user.apellido,
            'email':    user.email,
            'rol':      user.rol.nombre if user.rol else None,
            'escuela':  user.escuela.nombre if user.escuela else None,
        })


class DepartamentosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        departamentos = Departamento.objects.prefetch_related('instituciones').order_by('nombre')
        return Response([
            {
                'id': departamento.id,
                'nombre': departamento.nombre,
                'codigo': departamento.codigo,
                'instituciones_count': departamento.instituciones.count(),
            }
            for departamento in departamentos
        ])


class InstitucionesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        instituciones = Institucion.objects.select_related('departamento', 'municipio').order_by('nombre')
        return Response([
            {
                'id': institucion.id,
                'nombre': institucion.nombre,
                'codigo': institucion.codigo,
                'tipo': institucion.get_tipo_display(),
                'tipo_codigo': institucion.tipo,
                'direccion': institucion.direccion,
                'telefono': institucion.telefono,
                'activa': institucion.activa,
                'departamento': institucion.departamento.nombre,
                'departamento_id': institucion.departamento_id,
                'municipio': institucion.municipio.nombre if institucion.municipio else None,
            }
            for institucion in instituciones
        ])