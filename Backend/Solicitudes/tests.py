from django.test import TestCase
from rest_framework.test import APIRequestFactory

from Inventario.models import CategoriaItem, Item
from Solicitudes.models import SolicitudRecurso
from Solicitudes.serializers import SolicitudRecursoSerializer
from Solicitudes.views import SolicitudListCreateView
from usuarios.models import Departamento, Escuela, Institucion, Municipio, Rol, Usuario


class SolicitudPermissionTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.departamento = Departamento.objects.create(nombre='Managua', codigo='MGA')
        self.municipio = Municipio.objects.create(nombre='Managua', departamento=self.departamento)
        self.institucion = Institucion.objects.create(
            nombre='UNI', codigo='UNI-001', departamento=self.departamento, tipo='UNIVERSIDAD_PUBLICA'
        )
        self.escuela = Escuela.objects.create(
            nombre='Escuela Test', codigo_centro='ESC-001', direccion='Dir', modalidad='Primaria',
            turno='Matutino', total_estudiantes=100, total_docentes=10, municipio=self.municipio
        )
        self.categoria = CategoriaItem.objects.create(nombre='Equipos', descripcion='Test')
        self.item = Item.objects.create(
            nombre='Laptop', descripcion='Laptop', unidad_medida='unidad', categoria=self.categoria
        )

    def _make_user(self, nombre, rol_name):
        rol = Rol.objects.create(nombre=rol_name, descripcion='Test', permisos='test')
        return Usuario.objects.create_user(
            email=f'{nombre.lower()}@test.com', password='pass123', nombre=nombre, apellido='User', rol=rol
        )

    def test_supervisor_can_create_solicitud(self):
        supervisor = self._make_user('Belia', 'Supervisor')
        supervisor.departamento_asignado = self.departamento
        supervisor.save()

        request = self.factory.post('/solicitudes/', {
            'cantidad_solicitada': 2,
            'justificacion': 'Necesitamos equipo',
            'escuela': self.escuela.id,
            'item': self.item.id,
        })
        request.user = supervisor
        view = SolicitudListCreateView()
        view.request = request

        serializer = SolicitudRecursoSerializer(data={
            'cantidad_solicitada': 2,
            'justificacion': 'Necesitamos equipo',
            'escuela': self.escuela.id,
            'item': self.item.id,
            'estado': 'Pendiente',
            'tipo_solicitud': 'Recurso',
        })
        self.assertTrue(serializer.is_valid(), serializer.errors)
        view.perform_create(serializer)
        self.assertEqual(SolicitudRecurso.objects.count(), 1)
        self.assertEqual(SolicitudRecurso.objects.first().usuario, supervisor)

    def test_director_can_create_solicitud(self):
        director = self._make_user('Douglas', 'Director')
        director.institucion = self.institucion
        director.save()

        request = self.factory.post('/solicitudes/', {
            'cantidad_solicitada': 1,
            'justificacion': 'Solicitamos material',
            'escuela': self.escuela.id,
            'item': self.item.id,
        })
        request.user = director
        view = SolicitudListCreateView()
        view.request = request

        serializer = SolicitudRecursoSerializer(data={
            'cantidad_solicitada': 1,
            'justificacion': 'Solicitamos material',
            'escuela': self.escuela.id,
            'item': self.item.id,
            'estado': 'Pendiente',
            'tipo_solicitud': 'Recurso',
        })
        self.assertTrue(serializer.is_valid(), serializer.errors)
        view.perform_create(serializer)
        self.assertEqual(SolicitudRecurso.objects.count(), 1)
        self.assertEqual(SolicitudRecurso.objects.first().usuario, director)
