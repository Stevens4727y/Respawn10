from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView, LogoutView, PerfilView,
    DepartamentosView, InstitucionesView,
    RolesView, UsuariosListView, UsuarioDetalleView
)

urlpatterns = [
    path('login/',           LoginView.as_view(),          name='login'),
    path('logout/',          LogoutView.as_view(),         name='logout'),
    path('refresh/',         TokenRefreshView.as_view(),   name='token_refresh'),
    path('perfil/',          PerfilView.as_view(),         name='perfil'),
    path('roles/',           RolesView.as_view(),          name='roles'),
    path('usuarios/',        UsuariosListView.as_view(),   name='usuarios-list'),
    path('usuarios/<int:pk>/', UsuarioDetalleView.as_view(), name='usuario-detalle'),
    path('departamentos/',   DepartamentosView.as_view(),  name='departamentos'),
    path('instituciones/',   InstitucionesView.as_view(),  name='instituciones'),
]