from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class Rol(models.Model):
    nombre      = models.CharField(max_length=50)
    descripcion = models.CharField(max_length=255)
    permisos    = models.CharField(max_length=500)

    class Meta:
        db_table = 'rol'

    def __str__(self):
        return self.nombre


class Departamento(models.Model):
    nombre = models.CharField(max_length=100)
    codigo = models.CharField(max_length=10, unique=True)

    class Meta:
        db_table = 'departamento'

    def __str__(self):
        return self.nombre


class Municipio(models.Model):
    nombre       = models.CharField(max_length=100)
    departamento = models.ForeignKey(
        Departamento, on_delete=models.PROTECT, related_name='municipios'
    )

    class Meta:
        db_table = 'municipio'

    def __str__(self):
        return self.nombre


class Escuela(models.Model):
    MODALIDAD_CHOICES = [
        ('Primaria', 'Primaria'), ('Secundaria', 'Secundaria'),
        ('Preescolar', 'Preescolar'), ('Especial', 'Especial'),
    ]
    TURNO_CHOICES = [
        ('Matutino', 'Matutino'), ('Vespertino', 'Vespertino'),
        ('Nocturno', 'Nocturno'), ('Sabatino', 'Sabatino'),
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
        Municipio, on_delete=models.PROTECT, related_name='escuelas'
    )

    class Meta:
        db_table = 'escuela'

    def __str__(self):
        return self.nombre


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


class Usuario(AbstractBaseUser, PermissionsMixin):
    nombre                 = models.CharField(max_length=100)
    apellido               = models.CharField(max_length=100)
    email                  = models.EmailField(unique=True)
    telefono               = models.CharField(max_length=20, blank=True, null=True)
    activo                 = models.BooleanField(default=True)
    fecha_creacion         = models.DateTimeField(auto_now_add=True)
    token_recuperacion     = models.CharField(max_length=255, blank=True, null=True)
    fecha_expiracion_token = models.DateTimeField(blank=True, null=True)

    rol     = models.ForeignKey(
        Rol, on_delete=models.PROTECT,
        related_name='usuarios', null=True, blank=True
    )
    escuela = models.ForeignKey(
        Escuela, on_delete=models.SET_NULL,
        related_name='usuarios', null=True, blank=True
    )

    is_active = models.BooleanField(default=True)
    is_staff  = models.BooleanField(default=False)

    # ✅ Evita conflicto con auth.User
    groups = models.ManyToManyField(
        'auth.Group', blank=True,
        related_name='usuario_groups'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission', blank=True,
        related_name='usuario_permissions'
    )

    objects = UsuarioManager()

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['nombre', 'apellido']

    class Meta:
        db_table = 'usuario'

    def __str__(self):
        return f'{self.nombre} {self.apellido}'