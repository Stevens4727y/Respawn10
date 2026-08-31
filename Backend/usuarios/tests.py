from django.test import TestCase

from usuarios.models import Rol, Usuario


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
