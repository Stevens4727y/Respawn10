from django.test import TestCase

from usuarios.models import Departamento, Institucion, Rol, Usuario
from usuarios.serializers import UsuarioAsignacionSerializer


class RoleCompatibilityTests(TestCase):
    def test_admin_mined_role_is_treated_as_national_admin(self):
        admin = Rol.objects.create(nombre='Admin MINED', descripcion='Admin', permisos='total')
        self.assertTrue(admin.es_admin_nacional)

    def test_supervisor_director_teacher_roles_are_detected(self):
        supervisor = Rol.objects.create(nombre='Supervisor', descripcion='Supervisor', permisos='departamento')
        director = Rol.objects.create(nombre='Director', descripcion='Director', permisos='institucion')
        docente = Rol.objects.create(nombre='Docente', descripcion='Docente', permisos='institucion')

        self.assertTrue(supervisor.es_supervisor)
        self.assertTrue(director.es_director)
        self.assertTrue(docente.es_docente)

    def test_user_scope_helpers_follow_role_names(self):
        admin = Usuario.objects.create_user(
            email='admin@mined.gob.ni',
            password='testpass123',
            nombre='Admin',
            apellido='Prueba',
            rol=Rol.objects.create(nombre='Admin MINED', descripcion='Admin', permisos='total'),
        )
        self.assertTrue(admin.es_admin_nacional)
        self.assertTrue(admin.tiene_alcance_nacional)

    def test_assign_supervisor_to_department_and_director_to_institution(self):
        departamento = Departamento.objects.create(nombre='Managua', codigo='MGA')
        institucion = Institucion.objects.create(
            nombre='UNI',
            codigo='UNI-001',
            departamento=departamento,
            tipo='UNIVERSIDAD_PUBLICA',
        )
        supervisor_rol = Rol.objects.create(nombre='Supervisor', descripcion='Supervisor', permisos='departamento')
        director_rol = Rol.objects.create(nombre='Director', descripcion='Director', permisos='institucion')
        docente_rol = Rol.objects.create(nombre='Docente', descripcion='Docente', permisos='institucion')

        supervisor_data = UsuarioAsignacionSerializer(instance=Usuario.objects.create_user(
            email='supervisor@test.com',
            password='testpass123',
            nombre='Belia',
            apellido='Prueba',
            rol=supervisor_rol,
        ), data={'rol': supervisor_rol.id, 'departamento_asignado': departamento.id, 'institucion': None})
        self.assertTrue(supervisor_data.is_valid(), supervisor_data.errors)
        self.assertEqual(supervisor_data.validated_data['departamento_asignado'], departamento)

        director_data = UsuarioAsignacionSerializer(instance=Usuario.objects.create_user(
            email='director@test.com',
            password='testpass123',
            nombre='Douglas',
            apellido='Prueba',
            rol=director_rol,
        ), data={'rol': director_rol.id, 'institucion': institucion.id, 'departamento_asignado': None})
        self.assertTrue(director_data.is_valid(), director_data.errors)
        self.assertEqual(director_data.validated_data['institucion'], institucion)

        docente_data = UsuarioAsignacionSerializer(instance=Usuario.objects.create_user(
            email='docente@test.com',
            password='testpass123',
            nombre='Edwin',
            apellido='Prueba',
            rol=docente_rol,
        ), data={'rol': docente_rol.id, 'institucion': institucion.id, 'departamento_asignado': None})
        self.assertTrue(docente_data.is_valid(), docente_data.errors)
        self.assertEqual(docente_data.validated_data['institucion'], institucion)
