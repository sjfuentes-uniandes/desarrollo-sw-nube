# Documentación Completa - API de Competencia de Habilidades

## Tabla de Contenidos
1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Arquitectura y Tecnologías](#arquitectura-y-tecnologías)
3. [Requisitos del Sistema](#requisitos-del-sistema)
4. [Instalación y Configuración](#instalación-y-configuración)
5. [Estructura del Proyecto](#estructura-del-proyecto)
6. [API Endpoints](#api-endpoints)
7. [Pruebas](#pruebas)
8. [Integraciones](#integraciones)
9. [Despliegue](#despliegue)
10. [Solución de Problemas](#solución-de-problemas)
11. [Sustentación](#sustentación)

## Descripción del Proyecto

API REST completa para una plataforma de competencia de habilidades de jugadores desarrollada con **FastAPI** que incluye:

### 🎯 Funcionalidades Principales
- 🔐 **Autenticación JWT** - Registro y login de usuarios
- 🎥 **Gestión de Videos** - Subida, procesamiento y eliminación
- 🏆 **Sistema de Rankings** - Clasificación por votos
- ⚡ **Procesamiento Asíncrono** - Videos procesados con Celery
- 📊 **API Pública** - Rankings accesibles sin autenticación

### ✨ Características Técnicas
- ✅ Autenticación JWT con expiración configurable
- ✅ Procesamiento asíncrono de videos con Celery y Redis
- ✅ Sistema de rankings en tiempo real
- ✅ Validación robusta con Pydantic
- ✅ Base de datos PostgreSQL con SQLAlchemy ORM
- ✅ Contenedorización completa con Docker
- ✅ Proxy reverso con Nginx
- ✅ Pruebas automatizadas (pytest + Postman)
- ✅ Análisis de código con SonarCloud
- ✅ CI/CD con GitHub Actions

## Arquitectura y Tecnologías

### Modelo de datos
![Modelo de datos](../images/entidad-relacion.png)

### Diagrama de componentes
![Diagrama de componentes](../images/DiagramaComponentes.png)

### Diagrama de despliegue
![Diagrama de despliegue](../images/DiagramaDespliegue.png)

### Diagrama de flujo de procesos
![Flujo de procesos](../images/diagrama_flujo_procesos.png)



### Stack Tecnológico
- **Backend**: FastAPI (Python 3.11)
- **Base de Datos**: PostgreSQL 15
- **Cache/Broker**: Redis 7
- **Procesamiento**: Celery Workers
- **Proxy Reverso**: Nginx
- **Contenedorización**: Docker & Docker Compose
- **Autenticación**: JWT (JSON Web Tokens)
- **Validación**: Pydantic
- **Hashing**: bcrypt
- **Procesamiento Video**: FFmpeg
- **Testing**: pytest + Postman/Newman
- **Análisis de Código**: SonarCloud
- **CI/CD**: GitHub Actions


## Requisitos del Sistema

### Software Requerido
- **Docker**: >= 20.10
- **Docker Compose**: >= 2.0
- **Git**: Para clonar el repositorio
- **Node.js**: >= 14 (para Newman - opcional)

### Recursos Mínimos
- **RAM**: 4GB disponibles (para procesamiento de video)
- **Disco**: 5GB espacio libre (para almacenar videos)
- **Puertos**: 80, 5432, 6379 (disponibles)
- **CPU**: 2 cores (recomendado para Celery workers)

## Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd desarrollo-sw-nube
```

### 2. Configurar Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```bash
touch .env
```

**Contenido del archivo `.env`:**
```env
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/desarrollo_sw_nube
POSTGRES_DB=desarrollo_sw_nube
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# JWT Configuration
SECRET_KEY=tu-clave-secreta-generada
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_SECONDS=3600

# Redis/Celery Configuration
REDIS_URL=redis://redis:6379/0
```

**Generar SECRET_KEY segura:**
```bash
# Opción 1: OpenSSL
openssl rand -hex 32

# Opción 2: Python
python -c "import secrets; print(secrets.token_hex(32))"

# Opción 3: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Levantar los Servicios
```bash
# Construir e iniciar todos los servicios
docker-compose up -d

# Verificar que los servicios estén corriendo
docker-compose ps
```

### 4. Verificar Instalación
```bash
# Probar health check
curl http://localhost/

# Debería retornar: "Healthcheck"
```

## Estructura del Proyecto

```
desarrollo-sw-nube/
├── src/                          # Código fuente
│   ├── core/                     # Configuración central
│   │   ├── celery_app.py         # Configuración Celery
│   │   └── security.py           # Autenticación y JWT
│   ├── db/                       # Base de datos
│   │   └── database.py           # Configuración SQLAlchemy
│   ├── models/                   # Modelos de datos
│   │   └── db_models.py          # Modelos (User, Video, Vote)
│   ├── routers/                  # Endpoints de la API
│   │   ├── auth_router.py        # Autenticación
│   │   ├── usuario_router.py     # Gestión de usuarios
│   │   ├── video_router.py       # Gestión de videos
│   │   └── public_router.py      # Rankings públicos
│   ├── schemas/                  # Esquemas Pydantic
│   │   └── pydantic_schemas.py   # Validación de datos
│   ├── tasks/                    # Tareas asíncronas
│   │   └── video_tasks.py        # Procesamiento de videos
│   └── main.py                   # Aplicación principal
├── test/                         # Pruebas unitarias
│   └── test_api.py               # Tests completos de API
├── collections/                  # Pruebas Postman
│   ├── desarrollo-sw-nube-api.postman_collection.json
│   ├── postman_environment.json
│   └── README.md
├── load_testing/                 # 🆕 Infraestructura de pruebas de capacidad
│   ├── locustfile.py             # Script de pruebas de carga con Locust
│   ├── Dockerfile                # Imagen personalizada de Locust
│   ├── docker-compose.observability.yml  # Stack Prometheus/Grafana
│   ├── README.md                 # Guía de uso de pruebas de carga
│   ├── OBSERVABILITY_GUIDE.md    # Guía de observabilidad
│   ├── QUERIES_GRAFANA_FUNCIONALES.md  # Queries Prometheus útiles
│   ├── .gitignore                # Excluir archivos generados
│   ├── create_test_user.ps1      # Script para crear usuario de prueba
│   ├── run_load_tests.ps1        # Ejecutar pruebas individuales
│   ├── run_complete_suite.ps1    # Suite completa de pruebas
│   ├── start_observability.ps1   # Iniciar Prometheus/Grafana
│   ├── stop_observability.ps1    # Detener observabilidad
│   ├── observability/            # Configuración de observabilidad
│   │   ├── prometheus.yml        # Config Prometheus (scraping)
│   │   └── grafana/              
│   │       ├── COMO_IMPORTAR_DASHBOARD.md  # Instrucciones dashboard
│   │       └── dashboards/
│   │           └── capacity_dashboard_working.json  # Dashboard funcional
│   └── results/                  # Resultados de pruebas
│       ├── results_smoke_stats.csv         # Prueba smoke (5 usuarios)
│       ├── results_rampup_100_stats.csv    # Capacidad máxima (100u)
│       ├── results_rampup_200_stats.csv    # Degradación (200u)
│       ├── results_rampup_300_stats.csv    # Colapso (300u)
│       ├── results_sostenida_80_stats.csv  # Estabilidad (80u, 5min)
│       └── report_sostenida_80.html        # Reporte HTML prueba sostenida
├── capacity_planning/            # 🆕 Documentación de pruebas de capacidad
│   ├── plan_de_pruebas.md        # Plan completo Escenario 1 (Capa Web)
│   └── graficos/                 # Evidencias visuales de Grafana
├── docs/Entrega_1/              # Documentación
│   └── README.md                # Este archivo
├── uploads/                      # Videos originales
├── processed/                    # Videos procesados
├── .github/workflows/           # CI/CD
│   └── ci.yml                   # GitHub Actions
├── docker-compose.yml           # Configuración Docker
├── Dockerfile                   # Imagen FastAPI
├── nginx.conf                   # Configuración Nginx
├── requirements.txt             # Dependencias Python
├── sonar-project.properties     # Configuración SonarCloud
└── README.md                    # Documentación principal
```

### 🆕 Nuevas Carpetas - Pruebas de Capacidad

#### `load_testing/`
Infraestructura completa para pruebas de capacidad y observabilidad:
- **Locust**: Generador de carga para simular usuarios concurrentes
- **Prometheus**: Recolección de métricas del sistema (CPU, memoria, conexiones)
- **Grafana**: Visualización de métricas en tiempo real
- **Scripts automatizados**: Ejecución de pruebas y gestión de observabilidad
- **Resultados**: CSV con métricas de 5 pruebas ejecutadas

#### `capacity_planning/`
Documentación detallada del Escenario 1 (Capacidad Capa Web):
- **Plan de pruebas completo**: 2,000+ líneas con metodología, resultados y análisis
- **Capacidad máxima identificada**: 100 usuarios @ 18.84 RPS
- **Zona segura sostenida**: 80 usuarios @ 18.63 RPS (validado 5 minutos)
- **5 Bottlenecks identificados**: Con severidad y soluciones propuestas
- **Curvas de rendimiento**: Análisis de degradación y puntos de quiebre

## API Endpoints

### Base URL
- **Local**: `http://localhost`
- **Producción**: `http://tu-servidor-ip`

### Autenticación
La API utiliza JWT (JSON Web Tokens). Después del login, incluye el token:
```
Authorization: Bearer <token>
```

---

## 🔐 Endpoints de Autenticación

### POST /api/auth/signup
**Descripción:** Registro de nuevos usuarios

```http
POST /api/auth/signup
Content-Type: application/json

{
  "first_name": "Juan",
  "last_name": "Pérez", 
  "email": "juan@example.com",
  "city": "Bogotá",
  "country": "Colombia",
  "password1": "mipassword123",
  "password2": "mipassword123"
}
```

**Respuesta exitosa (201):**
```json
{
  "id": 1,
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan@example.com",
  "city": "Bogotá",
  "country": "Colombia"
}
```

**Errores:**
- `400` - Contraseñas no coinciden o email duplicado
- `422` - Datos de validación incorrectos

---

### POST /api/auth/login
**Descripción:** Autenticación de usuarios existentes

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "mipassword123"
}
```

**Respuesta exitosa (200):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

**Errores:**
- `401` - Credenciales inválidas

---

## 🎥 Endpoints de Videos (Requieren Autenticación)

### POST /api/videos/upload
**Descripción:** Subir video de habilidades

```http
POST /api/videos/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

# Form-data:
# video_file: [Archivo MP4, máximo 100MB]
# title: "Mi video de habilidades"
```

**Respuesta exitosa (201):**
```json
{
  "message": "Video subido exitosamente. Tarea creada.",
  "task_id": "abc123-def456-ghi789"
}
```

**Errores:**
- `400` - Formato inválido o archivo muy grande
- `401` - Token faltante o inválido
- `422` - Campos faltantes

---

### GET /api/videos
**Descripción:** Listar videos del usuario autenticado

```http
GET /api/videos
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
[
  {
    "video_id": 1,
    "title": "Mi video de habilidades",
    "status": "processed",
    "uploaded_at": "2024-01-15T10:30:00Z",
    "processed_at": "2024-01-15T10:35:00Z",
    "processed_url": "processed/processed_video_123.mp4"
  }
]
```

**Estados de video:**
- `uploaded` - Subido, pendiente de procesamiento
- `processed` - Procesado y listo
- `public` - Público y disponible para votación

---

### GET /api/videos/{video_id}
**Descripción:** Obtener detalles de un video específico

```http
GET /api/videos/1
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "video_id": 1,
  "title": "Mi video de habilidades",
  "status": "processed",
  "uploaded_at": "2024-01-15T10:30:00Z",
  "processed_at": "2024-01-15T10:35:00Z",
  "original_url": "uploads/user_1_1705312200.mp4",
  "processed_url": "processed/processed_user_1_1705312200.mp4",
  "votes": 15
}
```

**Errores:**
- `403` - Video no pertenece al usuario
- `404` - Video no encontrado

---

### DELETE /api/videos/{video_id}
**Descripción:** Eliminar video (solo si no es público)

```http
DELETE /api/videos/1
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "message": "El video ha sido eliminado exitosamente.",
  "video_id": 1
}
```

**Errores:**
- `400` - Video es público (no se puede eliminar)
- `403` - Video no pertenece al usuario
- `404` - Video no encontrado

---

## 🏆 Endpoints Públicos

### GET /api/public/rankings
**Descripción:** Ranking de jugadores por votos acumulados

**Parámetros de consulta:**
- `page` (opcional): Número de página (por defecto 1)
- `limit` (opcional): Elementos por página (1-100, por defecto 10)
- `city` (opcional): Filtrar por ciudad

```http
GET /api/public/rankings?page=1&limit=10&city=Bogotá
```

**Respuesta exitosa (200):**
```json
[
  {
    "position": 1,
    "username": "Juan Pérez",
    "city": "Bogotá",
    "votes": 1530
  },
  {
    "position": 2,
    "username": "Ana García",
    "city": "Medellín", 
    "votes": 1495
  }
]
```

**Errores:**
- `400` - Parámetros inválidos
- `422` - Validación de parámetros fallida

---

## 🔍 Endpoints de Utilidad

### GET /
**Descripción:** Health check de la API

```http
GET /
```

**Respuesta exitosa (200):**
```json
"Healthcheck"
```

---

## Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK - Operación exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Autenticación requerida |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 422 | Unprocessable Entity - Error de validación |
| 500 | Internal Server Error - Error del servidor |

---

## Flujo de Trabajo Típico

1. **Registro:** `POST /api/auth/signup`
2. **Login:** `POST /api/auth/login` (obtener token)
3. **Subir video:** `POST /api/videos/upload` (con token)
4. **Listar videos:** `GET /api/videos` (verificar estado)
5. **Ver ranking:** `GET /api/public/rankings` (público)
6. **Eliminar video:** `DELETE /api/videos/{id}` (opcional)

---

## Procesamiento de Videos

### Flujo de Procesamiento
1. **Upload** - Usuario sube video MP4 (máx 100MB)
2. **Validation** - Verificación de formato y tamaño
3. **Queue** - Tarea encolada en Celery/Redis
4. **Processing** - Worker procesa con FFmpeg (16:9, logos)
5. **Complete** - Estado cambia a 'processed'

### Notas Importantes
- **Tokens JWT:** Expiran en 1 hora por defecto
- **Videos:** Solo MP4, máximo 100MB
- **Procesamiento:** Los videos se procesan asíncronamente
- **Eliminación:** Solo videos no públicos pueden eliminarse
- **Rankings:** Se actualizan en tiempo real

## Pruebas

### 1. Pruebas Unitarias con pytest

```bash
# Instalar dependencias de desarrollo
pip install -r requirements.txt

# Ejecutar pruebas
pytest test/ -v

# Ejecutar con coverage
pytest test/ -v --cov=src --cov-report=html
```

### 2. Pruebas de API con Postman/Newman

#### Instalar Newman
```bash
npm install -g newman
npm install -g newman-reporter-html
```

#### Ejecutar Colección Postman
```bash
# Asegurar que los servicios estén corriendo
docker-compose up -d

# Ejecutar pruebas
newman run collections/desarrollo-sw-nube-api.postman_collection.json \
  -e collections/postman_environment.json \
  --env-var "base_url=http://localhost"

# Generar reporte HTML
newman run collections/desarrollo-sw-nube-api.postman_collection.json \
  -e collections/postman_environment.json \
  --env-var "base_url=http://localhost" \
  --reporters html \
  --reporter-html-export reporte-newman.html
```

### 3. Pruebas Manuales con curl

```bash
# Health check
curl http://localhost/

# Registro de usuario
curl -X POST http://localhost/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "city": "Test City",
    "country": "Test Country",
    "password1": "testpass123",
    "password2": "testpass123"
  }'

# Login
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

## Integraciones

### 1. SonarCloud
- **Análisis de código**: Calidad, seguridad, cobertura
- **Configuración**: `sonar-project.properties`
- **Integración**: GitHub Actions automático

#### Reporte de Análisis de SonarQube
![Summary SonarQube](../images/Sonarqube_summary.png)
![Reporte SonarQube](../images/sonar_report.png)

### 2. GitHub Actions (CI/CD)
- **Trigger**: Push a `main` o `develop`, Pull Requests
- **Pipeline**:
  1. Checkout código
  2. Setup Python 3.11
  3. Instalar dependencias
  4. Ejecutar pruebas con coverage
  5. Análisis SonarCloud
  6. Build Docker image
  7. Test contenedor

### 3. Docker Hub (Opcional)
- Configurar para push automático de imágenes
- Tags por versión y `latest`

## Despliegue

```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

## Solución de Problemas

### Problemas Comunes

#### 1. Error 502 Bad Gateway
```bash
# Verificar que FastAPI esté corriendo
docker-compose logs fastapi

# Reiniciar servicios
docker-compose restart
```

#### 2. Error de conexión a PostgreSQL
```bash
# Verificar PostgreSQL
docker-compose logs postgres

# Verificar variables de entorno
cat .env

# Reiniciar con volúmenes limpios
docker-compose down -v
docker-compose up -d
```

#### 3. Pruebas fallan por usuario duplicado
```bash
# Limpiar base de datos
docker-compose down -v
docker-compose up -d
```

#### 4. Puerto 80 ocupado
```bash
# Verificar qué usa el puerto
sudo lsof -i :80

# Cambiar puerto en docker-compose.yml
ports:
  - "8080:80"  # Usar puerto 8080
```