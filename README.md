# Desarrollo de Software en la Nube

API completa para competencia de habilidades de jugadores desarrollada con FastAPI, PostgreSQL, Redis, Celery y Docker.

## Funcionalidades
- 🔐 **Autenticación JWT** - Registro y login de usuarios
- 🎥 **Gestión de Videos** - Subida, procesamiento y eliminación
- 🏆 **Sistema de Rankings** - Clasificación por votos
- ⚡ **Procesamiento Asíncrono** - Videos procesados con Celery
- 📊 **API Pública** - Rankings accesibles sin autenticación

## Equipo de Trabajo
| Apellidos        | Nombres         | email uniandes                                  |
|------------------|-----------------|--------------------------------------------------|
| Portillo Bucheli | Carlos Andres   | [c.portillo@uniandes.edu.co](mailto:c.portillo@uniandes.edu.co) |
| Fuentes Ríos     | Santiago Javier | [sj.fuentes@uniandes.edu.co](mailto:sj.fuentes@uniandes.edu.co) |
| Lasso Patiño     | Santiago Felipe | [s.lasso@uniandes.edu.co](mailto:s.lasso@uniandes.edu.co)       |
| Paez Tarazona    | Nicolas Samuel  | [n.paez@uniandes.edu.co](mailto:n.paez@uniandes.edu.co)         |


## Documentación Completa

Para instrucciones detalladas de instalación, configuración y uso del proyecto, consulte:

📖 **[Documentación Completa - Entrega 1](docs/Entrega_1/README.md)**

## Inicio Rápido

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd desarrollo-sw-nube

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con sus valores

# 3. Levantar servicios
docker-compose up -d

# 4. Probar API
curl http://localhost/

# 5. Ver documentación
open http://localhost/docs
```

## Endpoints Disponibles

### 🔐 Autenticación
- `POST /api/auth/signup` - Registro de usuarios
- `POST /api/auth/login` - Autenticación y obtención de JWT

### 🎥 Gestión de Videos (Requiere Autenticación)
- `POST /api/videos/upload` - Subir video (MP4, máx 100MB)
- `GET /api/videos` - Listar videos del usuario
- `GET /api/videos/{id}` - Obtener detalles de video
- `DELETE /api/videos/{id}` - Eliminar video

### 🏆 Rankings Públicos
- `GET /api/public/rankings` - Ranking de jugadores por votos

### 🔍 Utilidades
- `GET /` - Health check

## Estructura del Proyecto

```
├── src/                    # Código fuente de la aplicación
│   ├── core/              # Configuración central (Celery, seguridad)
│   ├── db/                # Configuración de base de datos
│   ├── models/            # Modelos SQLAlchemy
│   ├── routers/           # Endpoints de la API
│   ├── schemas/           # Esquemas Pydantic
│   ├── tasks/             # Tareas asíncronas Celery
│   └── main.py            # Aplicación principal
├── test/                   # Pruebas unitarias
├── collections/            # Colección Postman para pruebas
├── docs/Entrega_1/         # Documentación detallada
├── uploads/                # Videos originales
├── processed/              # Videos procesados
├── docker-compose.yml      # Configuración de servicios
└── requirements.txt        # Dependencias Python
```

