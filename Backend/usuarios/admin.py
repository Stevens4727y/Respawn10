from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Rol, Departamento, Municipio, Escuela, Usuario


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    model         = Usuario
    list_display  = ['email', 'nombre', 'apellido', 'rol', 'is_staff']
    ordering      = ['email']
    search_fields = ['email', 'nombre', 'apellido']

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Información personal', {
            'fields': ('nombre', 'apellido', 'telefono', 'rol', 'escuela')
        }),
        ('Permisos', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'activo')
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email', 'nombre', 'apellido',
                'password1', 'password2',
                'rol', 'is_staff', 'is_superuser'
            ),
        }),
    )


admin.site.register(Rol)
admin.site.register(Departamento)
admin.site.register(Municipio)
admin.site.register(Escuela)