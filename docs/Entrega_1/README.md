# Documentación Completa - Desarrollo SW Nube API

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

API REST para autenticación de usuarios desarrollada con **FastAPI** que permite:
- Registro de nuevos usuarios
- Autenticación con JWT
- Gestión de sesiones seguras
- Validación de datos con Pydantic

### Características Principales
- ✅ Autenticación JWT
- ✅ Validación de datos robusta
- ✅ Base de datos PostgreSQL
- ✅ Contenedorización con Docker
- ✅ Proxy reverso con Nginx
- ✅ Pruebas automatizadas
- ✅ Análisis de código con SonarCloud
- ✅ CI/CD con GitHub Actions

## Arquitectura y Tecnologías

### Stack Tecnológico
- **Backend**: FastAPI (Python 3.11)
- **Base de Datos**: PostgreSQL 15
- **Proxy Reverso**: Nginx
- **Contenedorización**: Docker & Docker Compose
- **Autenticación**: JWT (JSON Web Tokens)
- **Validación**: Pydantic
- **Hashing**: bcrypt
- **Testing**: pytest
- **Análisis de Código**: SonarCloud
- **CI/CD**: GitHub Actions

## Requisitos del Sistema

### Software Requerido
- **Docker**: >= 20.10
- **Docker Compose**: >= 2.0
- **Git**: Para clonar el repositorio
- **Node.js**: >= 14 (para Newman - opcional)

### Recursos Mínimos
- **RAM**: 2GB disponibles
- **Disco**: 1GB espacio libre
- **Puertos**: 80, 5432 (disponibles)

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
│   │   └── security.py           # Autenticación y JWT
│   ├── db/                       # Base de datos
│   │   └── database.py           # Configuración SQLAlchemy
│   ├── models/                   # Modelos de datos
│   │   └── db_models.py          # Modelos SQLAlchemy
│   ├── routers/                  # Endpoints de la API
│   │   ├── auth_router.py        # Autenticación
│   │   └── usuario_router.py     # Gestión de usuarios
│   ├── schemas/                  # Esquemas Pydantic
│   │   └── pydantic_schemas.py   # Validación de datos
│   └── main.py                   # Aplicación principal
├── test/                         # Pruebas unitarias
│   └── test_api.py               # Tests de endpoints
├── collections/                  # Pruebas Postman
│   ├── desarrollo-sw-nube-api.postman_collection.json
│   ├── postman_environment.json
│   └── README.md
├── docs/Entrega_1/              # Documentación
│   └── README.md                # Este archivo
├── .github/workflows/           # CI/CD
│   └── ci.yml                   # GitHub Actions
├── docker-compose.yml           # Configuración Docker
├── Dockerfile                   # Imagen FastAPI
├── nginx.conf                   # Configuración Nginx
├── requirements.txt             # Dependencias Python
├── sonar-project.properties     # Configuración SonarCloud
└── README.md                    # Documentación principal
```

## API Endpoints

### Base URL
- **Local**: `http://localhost`
- **Producción**: `http://tu-servidor-ip`

### Endpoints Disponibles

#### 1. Health Check
```http
GET /
```
**Respuesta:**
```json
"Healthcheck"
```

#### 2. Registro de Usuario
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

**Respuesta Exitosa (201):**
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

**Errores Posibles:**
- `400`: "Las contraseñas no coinciden"
- `400`: "Email ya está registrado"

#### 3. Login de Usuario
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "juan@example.com",
    "password": "mipassword123"
}
```

**Respuesta Exitosa (200):**
```json
{
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer"
}
```

**Errores Posibles:**
- `401`: "Credenciales inválidas"

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

### Desarrollo Local
```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

### Producción
```bash
# Clonar en servidor
git clone <repository-url>
cd desarrollo-sw-nube

# Configurar .env para producción
cp .env.example .env
# Editar .env con valores de producción

# Levantar en producción
docker-compose up -d

# Verificar servicios
docker-compose ps
curl http://tu-servidor-ip/
```

### Variables de Producción
```env
# Usar valores seguros en producción
SECRET_KEY=clave-super-segura-de-64-caracteres-minimo
POSTGRES_PASSWORD=password-seguro-de-base-datos
DATABASE_URL=postgresql://postgres:password-seguro@postgres:5432/desarrollo_sw_nube
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

### Comandos Útiles

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ejecutar comando en contenedor
docker-compose exec fastapi bash

# Limpiar todo (cuidado: borra datos)
docker-compose down -v --remove-orphans
docker system prune -a

# Reconstruir imágenes
docker-compose build --no-cache
docker-compose up -d
```

### Contacto y Soporte

Para problemas o preguntas:
1. Revisar esta documentación
2. Verificar logs con `docker-compose logs`
3. Consultar issues en el repositorio
4. Crear nuevo issue con detalles del problema

## Sustentación

### Video Demostrativo

En este video se presenta la implementación completa del proyecto, demostrando:
- Arquitectura y diseño de la solución
- Funcionamiento de todos los endpoints
- Ejecución de pruebas automatizadas
- Integraciones con SonarCloud y CI/CD
- Despliegue con Docker Compose

**Video de Sustentación**: 🎥 *[Próximamente - Video será subido aquí]*

📄 **[Documento de Sustentación Completo](../../sustentacion/Entrega_1.md)**

### Puntos Clave de la Implementación

1. **API REST completa** con FastAPI y validación robusta
2. **Autenticación segura** con JWT y bcrypt
3. **Base de datos** PostgreSQL con SQLAlchemy ORM
4. **Contenedorización** completa con Docker Compose
5. **Proxy reverso** con Nginx para producción
6. **Pruebas automatizadas** con pytest y Postman/Newman
7. **Análisis de código** integrado con SonarCloud
8. **CI/CD pipeline** con GitHub Actions
9. **Documentación completa** para facilitar el uso

---

**¡La aplicación está lista para usar!** 🚀

Sigue los pasos de instalación y tendrás una API completamente funcional con autenticación JWT, base de datos PostgreSQL y todas las integraciones configuradas.