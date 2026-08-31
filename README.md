# Respawn10

Sistema web para la gestión de inventario, infraestructura, distribución, solicitudes y reportes de instituciones educativas. El proyecto está compuesto por una API REST construida con Django REST Framework y un frontend desarrollado en React + TypeScript con Vite.

## 1. Objetivo del sistema

Respawn10 centraliza la operación escolar del MINED en un único panel para:

- gestionar inventarios por escuela y por departamento;
- registrar reportes de daño en recursos educativos;
- manejar solicitudes de recursos y reparación;
- visualizar la infraestructura y el estado general;
- permitir auditoría, trazabilidad de acciones y control de acceso por rol.

## 2. Estructura del proyecto

```text
Respawn10/
├── Backend/                     # API Django + DRF + SQLite
│   ├── config/                  # settings, urls, ASGI/WSGI
│   ├── usuarios/                # auth, roles, alcance, seeders
│   ├── Inventario/              # catálogo y stock
│   ├── Infraestructura/         # infraestructura y mantenimientos
│   ├── Distribucion/            # distribución de recursos
│   ├── Solicitudes/             # solicitudes de recursos
│   ├── Reportes/                # reportes de daño
│   ├── Auditoria/               # registro de auditoría
│   ├── requirements.txt         # dependencias Python
│   ├── manage.py                # CLI de Django
│   └── db.sqlite3               # base de datos local
├── Frontend/                    # app React + TypeScript + Vite
│   ├── src/                     # componentes, páginas, contexto
│   ├── package.json             # dependencias y scripts del frontend
│   ├── vite.config.ts          # configuración Vite
│   └── index.html              # entrada de la app
├── README.md                    # documentación técnica y operación
└── Usuarios10.py                # script auxiliar del proyecto
```

## 3. Roles del sistema

Los permisos están definidos por rol y por alcance:

- Admin MINED: acceso nacional total
- Supervisor: alcance por departamento
- Director: alcance por institución/escuela
- Docente: acceso institucional para registrar incidencias y solicitudes
- Estudiante: acceso limitado
- Auditor: solo lectura

La lógica de alcance está implementada en el modelo de usuarios y se utiliza en los views para filtrar datos por departamento o institución.

## 4. Requisitos previos

- Python 3.12+
- Node.js 18+
- npm
- Git
- PowerShell o terminal con acceso a la línea de comandos

## 5. Instalación local

### 5.1 Backend

Desde la carpeta `Respawn10/Backend`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver 0.0.0.0:8000
```

La API queda disponible en:

- http://127.0.0.1:8000/
- http://127.0.0.1:8000/api/auth/

### 5.2 Frontend

Desde la carpeta `Respawn10/Frontend`:

```powershell
npm install
npm run dev
```

La interfaz queda disponible normalmente en:

- http://localhost:5173/

## 6. Variables de entorno

El proyecto usa configuración local en Django. Para entorno real, es recomendable definir un archivo `.env` con valores seguros.

Ejemplo mínimo:

```dotenv
SECRET_KEY=tu_clave_super_segura
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
```

> Nunca subir a Git información sensible como `.env`, credenciales de producción, tokens ni bases de datos locales.

## 7. Datos de demostración

La orden `python manage.py seed_data` crea roles, departamentos, instituciones, escuelas, inventarios y usuarios de prueba.

Usuarios cargados por default:

| Usuario | Rol |
| --- | --- |
| steven@mined.gob.ni | Admin MINED |
| belia@mined.gob.ni | Supervisor |
| douglas@mined.gob.ni | Director |
| edwin@mined.gob.ni | Docente |
| auditor@mined.gob.ni | Auditor |
| admin@demo.com | Admin MINED |
| supervisor@demo.com | Supervisor |
| director@demo.com | Director |
| docente@demo.com | Docente |
| estudiante@demo.com | Estudiante |
| auditor@demo.com | Auditor |

Contraseña de demostración:

```text
Respawn2025*
```

En producción debe reemplazarse por credenciales reales y la base de datos de prueba debe eliminarse.

## 8. Flujo principal de uso

### 8.1 Inicio de sesión

- El login usa el email y la contraseña del usuario.
- La API devuelve access token y refresh token.
- El frontend guarda los datos del usuario en localStorage.

### 8.2 Inventario

- Un usuario con rol `Admin MINED` puede ver todo el inventario.
- Un `Supervisor` filtra por departamento.
- `Director` y `Docente` ven el inventario de su institución.
- `Auditor` tiene acceso de solo lectura.

### 8.3 Reportes de daño

- Cualquier usuario con capacidad opera el reporte.
- El admin nacional puede ver todos los reportes.
- Un usuario con alcance institucional ve únicamente los que correspondan a su escuela.
- El estado del reporte puede actualizarse desde el backend o desde la interfaz.

### 8.4 Solicitudes

- El flujo permite registrar solicitudes de recursos y asignar estado.
- La vista principal se filtra por alcance del usuario según rol.

## 9. API principal

### Autenticación

```http
POST /api/auth/login/
POST /api/auth/logout/
GET  /api/auth/perfil/
GET  /api/auth/departamentos/
GET  /api/auth/instituciones/
```

### Módulos principales

```http
GET /api/inventario/
GET /api/inventario/inventarios/
GET /api/reportes/
POST /api/reportes/
GET /api/solicitudes/
POST /api/solicitudes/
GET /api/infraestructura/
GET /api/distribucion/
```

### Autorización

Todas las rutas protegidas usan `IsAuthenticated` y validan el rol y el alcance del usuario antes de responder.

## 10. Validación y pruebas

Backend:

```powershell
cd Respawn10\Backend
python manage.py check
python manage.py test
```

Frontend:

```powershell
cd Respawn10\Frontend
npm run build
npm run lint
```

## 11. Recomendaciones para producción

- cambiar todas las credenciales demo;
- usar un `SECRET_KEY` fuerte;
- configurar `DEBUG=False`;
- agregar `ALLOWED_HOSTS` y `CORS_ALLOWED_ORIGINS` reales;
- mover la base de datos a PostgreSQL o MySQL;
- configurar HTTPS y backups;
- no publicar `db.sqlite3`, `.env` ni archivos de media locales.

## 12. Nota sobre GitHub

El proyecto se dejó preparado con documentación técnica y flujo de ejecución local. Si deseas publicarlo en GitHub, desde la raíz del proyecto puedes inicializar el repositorio y subirlo con:

```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <URL_DEL_REPOSITORIO>
git push -u origin main
```

> En este momento no había un repositorio Git configurado dentro del workspace, por lo que la publicación final debe hacerse con la URL real del repositorio remoto.
