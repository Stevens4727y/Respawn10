from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


def inicio(request):
    return JsonResponse({
        'mensaje': 'Backend Respawn10 funcionando correctamente',
        'rutas': {
            'autenticacion': '/api/auth/',
            'reportes': '/api/reportes/',
            'inventario': '/api/inventario/',
            'distribucion': '/api/distribucion/',
            'infraestructura': '/api/infraestructura/',
            'solicitudes': '/api/solicitudes/',
            'administracion': '/admin/',
        },
    })

urlpatterns = [
    path('', inicio, name='inicio'),
    path('admin/',              admin.site.urls),
    path('api/auth/',           include('usuarios.urls')),
    path('api/reportes/',       include('Reportes.urls')),
    path('api/inventario/',     include('Inventario.urls')),
    path('api/distribucion/',   include('Distribucion.urls')),
    path('api/infraestructura/', include('Infraestructura.urls')),
    path('api/solicitudes/',    include('Solicitudes.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)