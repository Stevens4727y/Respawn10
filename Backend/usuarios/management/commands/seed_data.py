from django.core.management.base import BaseCommand
from usuarios.models import (
    Rol, Departamento, Municipio, Escuela, Institucion, Usuario
)
from Inventario.models import CategoriaItem, Item, Inventario


class Command(BaseCommand):
    help = 'Carga datos iniciales del sistema SNIE'

    def handle(self, *args, **options):
        self.stdout.write('🚀 Iniciando carga de datos...')
        self._crear_roles()
        self._crear_departamentos()
        self._crear_municipios_demo()
        self._crear_instituciones_demo()
        self._crear_escuelas_demo()
        self._crear_inventario_demo()
        self._crear_usuarios_demo()
        self.stdout.write(self.style.SUCCESS('✅ Datos cargados correctamente'))

    def _crear_roles(self):
        roles = [
            ('Admin MINED', 'Administrador nacional con acceso total al sistema', 'total'),
            ('Supervisor', 'Supervisor de departamento con alcance geográfico', 'departamento'),
            ('Director', 'Director de institución educativa con alcance institucional', 'institucion'),
            ('Docente', 'Docente que registra incidencias y solicitudes', 'institucion'),
            ('Estudiante', 'Estudiante con acceso limitado', 'institucion'),
            ('Auditor', 'Solo lectura — monitoreo y control de calidad', 'lectura'),
        ]
        for nombre, desc, permisos in roles:
            rol, created = Rol.objects.get_or_create(
                nombre=nombre,
                defaults={'descripcion': desc, 'permisos': permisos}
            )
            if not created:
                rol.descripcion = desc
                rol.permisos = permisos
                rol.save(update_fields=['descripcion', 'permisos'])
            estado = '✅ Creado' if created else '🔄 Actualizado'
            self.stdout.write(f'{estado}: Rol {nombre}')

        legacy_roles = ['Admin', 'Usuario']
        for nombre in legacy_roles:
            Rol.objects.filter(nombre=nombre).update(nombre=f'{nombre} (legacy)')

    def _crear_departamentos(self):
        departamentos = [
            ('Managua',       'MGA'), ('León',          'LEO'),
            ('Chinandega',    'CHN'), ('Masaya',        'MSY'),
            ('Granada',       'GRN'), ('Carazo',        'CRZ'),
            ('Rivas',         'RVS'), ('Matagalpa',     'MTG'),
            ('Jinotega',      'JNG'), ('Estelí',        'EST'),
            ('Madriz',        'MDZ'), ('Nueva Segovia', 'NSG'),
            ('Boaco',         'BOC'), ('Chontales',     'CHT'),
            ('Río San Juan',  'RSJ'), ('RACN',          'RAN'),
            ('RACS',          'RAS'),
        ]
        for nombre, codigo in departamentos:
            d, created = Departamento.objects.get_or_create(
                codigo=codigo, defaults={'nombre': nombre}
            )
            if created:
                self.stdout.write(f'✅ Departamento: {nombre}')

    def _crear_municipios_demo(self):
        municipios = [
            ('Managua', 'MGA'),
            ('León', 'LEO'),
            ('Granada', 'GRN'),
            ('Matagalpa', 'MTG'),
        ]
        for nombre, codigo in municipios:
            dept = Departamento.objects.filter(codigo=codigo).first()
            if dept:
                Municipio.objects.get_or_create(
                    departamento=dept,
                    nombre=nombre,
                )

    def _crear_instituciones_demo(self):
        try:
            managua = Departamento.objects.get(codigo='MGA')
            granada = Departamento.objects.get(codigo='GRN')
            matagalpa = Departamento.objects.get(codigo='MTG')

            instituciones = [
                # Managua
                ('Centro Escolar República de Cuba',   'MINED',               'CEC-001', managua),
                ('Instituto Público Maestro Gabriel',  'MINED',               'IPM-001', managua),
                ('INATEC Managua',                     'INATEC',              'INA-MGA', managua),
                ('UNAN-Managua',                       'UNIVERSIDAD_PUBLICA', 'UNM-001', managua),
                ('UNI',                                'UNIVERSIDAD_PUBLICA', 'UNI-001', managua),
                # Granada
                ('Centro Escolar El Hormiguero',       'MINED',               'CEH-001', granada),
                ('Instituto Nacional de Granada',      'MINED',               'ING-001', granada),
                ('INATEC Granada',                     'INATEC',              'INA-GRN', granada),
                # Matagalpa
                ('Centro Escolar Sandino',             'MINED',               'CES-001', matagalpa),
                ('Instituto Técnico Matagalpa',        'INATEC',              'ITM-001', matagalpa),
            ]

            for nombre, tipo, codigo, dept in instituciones:
                inst, created = Institucion.objects.get_or_create(
                    codigo=codigo,
                    defaults={
                        'nombre': nombre, 'tipo': tipo,
                        'departamento': dept, 'activa': True,
                    }
                )
                if created:
                    self.stdout.write(f'✅ Institución: {nombre}')
        except Departamento.DoesNotExist as e:
            self.stdout.write(self.style.WARNING(f'⚠️ {e}'))

    def _crear_escuelas_demo(self):
        managua = Departamento.objects.filter(codigo='MGA').first()
        if not managua:
            return
        municipio_managua = Municipio.objects.filter(departamento=managua, nombre='Managua').first()
        if not municipio_managua:
            return

        escuelas = [
            ('Escuela República de Cuba', 'CEC-001', municipio_managua),
            ('UNI Managua', 'UNI-001', municipio_managua),
            ('INATEC Managua', 'INA-MGA', municipio_managua),
        ]

        for nombre, codigo, municipio in escuelas:
            institucion = Institucion.objects.filter(codigo=codigo).first()
            if institucion:
                Escuela.objects.get_or_create(
                    codigo_centro=codigo,
                    defaults={
                        'nombre': nombre,
                        'direccion': f'{nombre} - Managua',
                        'modalidad': 'Primaria',
                        'turno': 'Matutino',
                        'total_estudiantes': 110,
                        'total_docentes': 12,
                        'municipio': municipio,
                    }
                )

    def _crear_inventario_demo(self):
        escuelas = Escuela.objects.all()
        if not escuelas:
            return

        categorias = [
            ('Equipos', 'Recursos digitales y tecnológicos'),
            ('Mobiliario', 'Mesas, sillas y mobiliario escolar'),
            ('Infraestructura', 'Elementos físicos del plantel'),
        ]

        for nombre, descripcion in categorias:
            categoria, _ = CategoriaItem.objects.get_or_create(nombre=nombre, defaults={'descripcion': descripcion})
            for idx, item_nombre in enumerate([
                'Laptop', 'Proyector', 'Silla', 'Mesa', 'Extintor', 'Computadora'
            ], start=1):
                item, _ = Item.objects.get_or_create(
                    nombre=item_nombre,
                    defaults={'descripcion': f'{item_nombre} de uso escolar', 'unidad_medida': 'unidad', 'categoria': categoria}
                )
                for escuela in escuelas[:2]:
                    Inventario.objects.get_or_create(
                        escuela=escuela,
                        item=item,
                        defaults={
                            'cantidad_total': 10 + idx,
                            'cantidad_bueno': 7 + idx,
                            'cantidad_regular': 2,
                            'cantidad_malo': 1,
                            'observaciones': 'Inventario de prueba'
                        }
                    )

    def _crear_usuarios_demo(self):
        try:
            roles = {r.nombre: r for r in Rol.objects.all()}

            # Obtener instituciones y departamentos para asignar
            inst_cuba    = Institucion.objects.filter(codigo='CEC-001').first()
            inst_uni     = Institucion.objects.filter(codigo='UNI-001').first()
            dept_managua = Departamento.objects.filter(codigo='MGA').first()

            usuarios_demo = [
                {
                    'email': 'steven@mined.gob.ni',
                    'password': 'Respawn2025*',
                    'nombre': 'Steven',
                    'apellido': 'Barahona',
                    'rol': 'Admin MINED',
                    'is_staff': True,
                    'is_superuser': True,
                },
                {
                    'email': 'belia@mined.gob.ni',
                    'password': 'Respawn2025*',
                    'nombre': 'Belia',
                    'apellido': 'Espinoza',
                    'rol': 'Supervisor',
                    'departamento': dept_managua,
                    'descripcion_rol': 'Supervisor del departamento de Managua',
                },
                {
                    'email': 'douglas@mined.gob.ni',
                    'password': 'Respawn2025*',
                    'nombre': 'Douglas',
                    'apellido': 'Munguia',
                    'rol': 'Director',
                    'institucion': inst_uni,
                    'descripcion_rol': 'Director de la UNI',
                },
                {
                    'email': 'edwin@mined.gob.ni',
                    'password': 'Respawn2025*',
                    'nombre': 'Edwin',
                    'apellido': 'Blandon',
                    'rol': 'Docente',
                    'institucion': inst_uni,
                    'descripcion_rol': 'Docente de la UNI',
                },
                {
                    'email': 'auditor@mined.gob.ni',
                    'password': 'Respawn2025*',
                    'nombre': 'Auditor',
                    'apellido': 'MINED',
                    'rol': 'Auditor',
                    'descripcion_rol': 'Auditor de solo lectura',
                },
            ]

            for data in usuarios_demo:
                u, created = Usuario.objects.get_or_create(
                    email=data['email'],
                    defaults={
                        'nombre': data['nombre'],
                        'apellido': data['apellido'],
                        'password': data['password'],
                    }
                )

                if not created:
                    self.stdout.write(f'🔄 Actualizando: {data["email"]}')
                    u.nombre = data['nombre']
                    u.apellido = data['apellido']

                u.set_password(data['password'])
                u.rol = roles.get(data['rol'])
                u.departamento_asignado = data.get('departamento')
                u.institucion = data.get('institucion')
                u.is_staff = data.get('is_staff', False)
                u.is_superuser = data.get('is_superuser', False)
                u.save()

                desc = data.get('descripcion_rol', data['rol'])
                self.stdout.write(f'✅ {data["email"]} → {data["rol"]} ({desc})')

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error: {e}'))