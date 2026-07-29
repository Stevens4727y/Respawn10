from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/',          admin.site.urls),
    path('api/auth/',       include('usuarios.urls')),
    path('api/reportes/',   include('reportes.urls')),
    path('api/inventario/', include('inventario.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)