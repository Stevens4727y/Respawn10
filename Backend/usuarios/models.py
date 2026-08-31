from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


# ══════════════════════════════════════════════
# ROL
# ══════════════════════════════════════════════
class Rol(models.Model):
    NOMBRES_VALIDOS = [
        ('Admin MINED', 'Admin MINED'),
        ('Supervisor', 'Supervisor'),
        ('Director', 'Director'),
        ('Docente', 'Docente'),
        ('Estudiante', 'Estudiante'),
        ('Auditor', 'Auditor'),
        ('Admin', 'Admin (legacy)'),
        ('Usuario', 'Usuario (legacy)'),
    ]
    nombre      = models.CharField(max_length=50, unique=True)
    descripcion = models.CharField(max_length=255)
    permisos    = models.CharField(max_length=500)

    class Meta:
        db_table = 'rol'

    def __str__(self):
        return self.nombre

    @staticmethod
    def _normalizar(nombre):
        return (nombre or '').strip().lower().replace('_', ' ')

    @property
    def es_admin_nacional(self):
        nombre = self._normalizar(self.nombre)
        return nombre in {'admin', 'admin mined'}

    @property
    def es_supervisor(self):
        return self._normalizar(self.nombre) == 'supervisor'

    @property
    def es_director(self):
        return self._normalizar(self.nombre) == 'director'

    @property
    def es_docente(self):
        return self._normalizar(self.nombre) == 'docente'

    @property
    def es_estudiante(self):
        return self._normalizar(self.nombre) == 'estudiante'

    @property
    def es_auditor(self):
        return self._normalizar(self.nombre) == 'auditor'


# ══════════════════════════════════════════════
# DEPARTAMENTO
# ══════════════════════════════════════════════
class Departamento(models.Model):
    nombre = models.CharField(max_length=100)
    codigo = models.CharField(max_length=10, unique=True)

    class Meta:
        db_table = 'departamento'

    def __str__(self):
        return self.nombre


# ══════════════════════════════════════════════
# MUNICIPIO
# ══════════════════════════════════════════════
class Municipio(models.Model):
    nombre       = models.CharField(max_length=100)
    departamento = models.ForeignKey(
        Departamento, on_delete=models.PROTECT,
        related_name='municipios'
    )

    class Meta:
        db_table = 'municipio'

    def __str__(self):
        return self.nombre


# ══════════════════════════════════════════════
# INSTITUCIÓN
# ══════════════════════════════════════════════
class Institucion(models.Model):
    TIPO_CHOICES = [
        ('MINED',                     'Centro MINED'),
        ('INATEC',                    'Centro INATEC'),
        ('UNIVERSIDAD_PUBLICA',       'Universidad Pública'),
        ('UNIVERSIDAD_COMUNITARIA',   'Universidad Comunitaria'),
        ('ESCUELA_NORMAL',            'Escuela Normal'),
        ('SEDE_UNIVERSITARIA_PUBLICA', 'Sede universitaria pública'),
        ('OTRA_INSTITUCION_EDUCATIVA_PUBLICA', 'Otra institución educativa pública'),
    ]

    nombre       = models.CharField(max_length=200)
    tipo         = models.CharField(max_length=50, choices=TIPO_CHOICES, default='MINED')
    codigo       = models.CharField(max_length=30, unique=True, blank=True, null=True)
    direccion    = models.CharField(max_length=300, blank=True)
    telefono     = models.CharField(max_length=20, blank=True)
    activa       = models.BooleanField(default=True)
    departamento = models.ForeignKey(
        Departamento, on_delete=models.PROTECT,
        related_name='instituciones'
    )
    municipio    = models.ForeignKey(
        Municipio, on_delete=models.SET_NULL,
        related_name='instituciones', null=True, blank=True
    )

    class Meta:
        db_table = 'institucion'

    def __str__(self):
        return self.nombre


# ══════════════════════════════════════════════
# ESCUELA (compatibilidad con módulos existentes)
# ══════════════════════════════════════════════
class Escuela(models.Model):
    MODALIDAD_CHOICES = [
        ('Primaria',   'Primaria'),
        ('Secundaria', 'Secundaria'),
        ('Preescolar', 'Preescolar'),
        ('Especial',   'Especial'),
    ]
    TURNO_CHOICES = [
        ('Matutino',   'Matutino'),
        ('Vespertino', 'Vespertino'),
        ('Nocturno',   'Nocturno'),
        ('Sabatino',   'Sabatino'),
    ]

    nombre            = models.CharField(max_length=200)
    codigo_centro     = models.CharField(max_length=20, unique=True)
    direccion         = models.CharField(max_length=300)
    telefono          = models.CharField(max_length=20, blank=True, null=True)
    modalidad         = models.CharField(max_length=50, choices=MODALIDAD_CHOICES)
    turno             = models.CharField(max_length=50, choices=TURNO_CHOICES)
    total_estudiantes = models.IntegerField(default=0)
    total_docentes    = models.IntegerField(default=0)
    activa            = models.BooleanField(default=True)
    municipio         = models.ForeignKey(
        Municipio, on_delete=models.PROTECT,
        related_name='escuelas'
    )

    class Meta:
        db_table = 'escuela'

    def __str__(self):
        return self.nombre


# ══════════════════════════════════════════════
# USUARIO MANAGER
# ══════════════════════════════════════════════
class UsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El email es obligatorio')
        email = self.normalize_email(email)
        user  = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff',     True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


# ══════════════════════════════════════════════
# USUARIO
# ══════════════════════════════════════════════
class Usuario(AbstractBaseUser, PermissionsMixin):
    nombre                 = models.CharField(max_length=100)
    apellido               = models.CharField(max_length=100)
    email                  = models.EmailField(unique=True)
    telefono               = models.CharField(max_length=20, blank=True, null=True)
    activo                 = models.BooleanField(default=True)
    fecha_creacion         = models.DateTimeField(auto_now_add=True)
    token_recuperacion     = models.CharField(max_length=255, blank=True, null=True)
    fecha_expiracion_token = models.DateTimeField(blank=True, null=True)

    # Rol
    rol = models.ForeignKey(
        Rol, on_delete=models.PROTECT,
        related_name='usuarios', null=True, blank=True
    )
    # Alcance geográfico
    departamento_asignado = models.ForeignKey(
        Departamento, on_delete=models.SET_NULL,
        related_name='usuarios', null=True, blank=True
    )
    # Alcance institucional
    institucion = models.ForeignKey(
        Institucion, on_delete=models.SET_NULL,
        related_name='usuarios', null=True, blank=True
    )
    # Compatibilidad con módulos existentes
    escuela = models.ForeignKey(
        Escuela, on_delete=models.SET_NULL,
        related_name='usuarios', null=True, blank=True
    )

    is_active  = models.BooleanField(default=True)
    is_staff   = models.BooleanField(default=False)

    groups = models.ManyToManyField(
        'auth.Group', blank=True, related_name='usuario_groups'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission', blank=True, related_name='usuario_permissions'
    )

    objects = UsuarioManager()

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['nombre', 'apellido']

    class Meta:
        db_table = 'usuario'

    def __str__(self):
        return f'{self.nombre} {self.apellido}'

    # ── Helpers de alcance para usar en views ──
    @property
    def es_admin_nacional(self):
        return self.rol and self.rol.es_admin_nacional

    @property
    def es_supervisor(self):
        return self.rol and self.rol.es_supervisor

    @property
    def es_director(self):
        return self.rol and self.rol.es_director

    @property
    def es_docente(self):
        return self.rol and self.rol.es_docente

    @property
    def es_estudiante(self):
        return self.rol and self.rol.es_estudiante

    @property
    def es_auditor(self):
        return self.rol and self.rol.es_auditor

    @property
    def tiene_alcance_nacional(self):
        return self.es_admin_nacional

    @property
    def tiene_alcance_departamental(self):
        return self.es_supervisor or self.es_auditor

    @property
    def tiene_alcance_institucional(self):
        return self.es_director or self.es_docente or self.es_estudiante