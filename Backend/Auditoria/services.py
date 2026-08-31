from .models import RegistroAuditoria


def registrar(
    usuario,
    accion,
    modulo,
    modelo='',
    objeto_id='',
    descripcion='',
    ip=None,
):
    """
    Registra una acción en el log de auditoría.

    Uso:
        from auditoria.services import registrar
        registrar(request.user, 'CREATE', 'Inventario', 'Inventario', str(obj.id))
    """
    try:
        RegistroAuditoria.objects.create(
            usuario_email  = getattr(usuario, 'email', str(usuario)),
            usuario_nombre = getattr(usuario, 'nombre', '') + ' ' + getattr(usuario, 'apellido', ''),
            rol            = getattr(usuario.rol, 'nombre', '') if usuario.rol else '',
            departamento   = getattr(usuario.departamento_asignado, 'nombre', '') if getattr(usuario, 'departamento_asignado', None) else '',
            institucion    = getattr(usuario.escuela, 'nombre', '') if getattr(usuario, 'escuela', None) else '',
            accion         = accion,
            modulo         = modulo,
            modelo         = modelo,
            objeto_id      = str(objeto_id),
            descripcion    = descripcion,
            direccion_ip   = ip,
        )
    except Exception as e:
        print(f'[AUDITORIA ERROR] {e}')


def registrar_desde_request(request, accion, modulo, modelo='', objeto_id='', descripcion=''):
    """Versión que extrae la IP del request automáticamente."""
    ip = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR'))
    if ip and ',' in ip:
        ip = ip.split(',')[0].strip()
    registrar(
        usuario     = request.user,
        accion      = accion,
        modulo      = modulo,
        modelo      = modelo,
        objeto_id   = objeto_id,
        descripcion = descripcion,
        ip          = ip,
    )
    