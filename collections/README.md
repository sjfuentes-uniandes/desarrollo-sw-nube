# Colección Postman - API Desarrollo SW Nube

## Descripción de la Aplicación

### ¿Qué es esta API?
Esta es una **API REST de autenticación de usuarios** desarrollada con tecnologías modernas que permite:

- 🔐 **Registro seguro de usuarios** con validación robusta de datos
- 🔑 **Autenticación JWT** para sesiones seguras
- 🛡️ **Encriptación de contraseñas** con bcrypt
- 📊 **Base de datos PostgreSQL** para persistencia
- 🐳 **Contenedorización completa** con Docker
- 🔄 **Proxy reverso Nginx** para producción
- ✅ **Pruebas automatizadas** y análisis de código

### Arquitectura
```
Cliente → Nginx (Puerto 80) → FastAPI (Puerto 8000) → PostgreSQL (Puerto 5432)
```

### Casos de Uso
- **Aplicaciones web** que necesiten sistema de usuarios
- **APIs móviles** con autenticación segura
- **Microservicios** de autenticación
- **Sistemas empresariales** con gestión de acceso

## Quick Start - ¡Empezar en 5 minutos!

### Paso 1: Preparar el Entorno
```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd desarrollo-sw-nube

# 2. Crear archivo de configuración
touch .env
```

### Paso 2: Configurar Variables (.env)
Copiar este contenido en el archivo `.env`:
```env
# Database
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/desarrollo_sw_nube
POSTGRES_DB=desarrollo_sw_nube
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# JWT (generar clave segura)
SECRET_KEY=tu-clave-secreta-de-64-caracteres-aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_SECONDS=3600
```

**Generar SECRET_KEY:**
```bash
# Ejecutar uno de estos comandos:
openssl rand -hex 32
# O
python -c "import secrets; print(secrets.token_hex(32))"
```

### Paso 3: Levantar la Aplicación
```bash
# Iniciar todos los servicios
docker-compose up -d

# Verificar que funciona
curl http://localhost/
# Debe retornar: "Healthcheck"
```

### Paso 4: Probar con Postman
1. **Importar colección**: `desarrollo-sw-nube-api.postman_collection.json`
2. **Importar entorno**: `postman_environment.json`
3. **Ejecutar requests** en orden:
   - Health Check
   - User Signup
   - User Login

### Paso 5: Pruebas Automatizadas (Opcional)
```bash
# Instalar Newman
npm install -g newman newman-reporter-html

# Ejecutar todas las pruebas
newman run collections/desarrollo-sw-nube-api.postman_collection.json \
  -e collections/postman_environment.json \
  --env-var "base_url=http://localhost"
```

## Descripción de la Colección
Esta colección contiene pruebas automatizadas para todos los endpoints de la API con múltiples escenarios de prueba por endpoint.

## Archivos
- `desarrollo-sw-nube-api.postman_collection.json` - Colección principal con requests y pruebas
- `postman_environment.json` - Variables de entorno para diferentes escenarios de despliegue

## Endpoints y Escenarios Incluidos

### 1. Health Check - `GET /`
**Escenarios:**
- ✅ **Éxito (200)**: Verificación de que la API está funcionando

### 2. Registro de Usuario - `POST /api/auth/signup`
**Escenarios en la colección:**
- ✅ **Éxito (201)**: Usuario creado correctamente
  ```json
  {
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan{{$timestamp}}@example.com",
    "password1": "mipassword123",
    "password2": "mipassword123"
  }
  ```

- ❌ **Error 400**: Contraseñas no coinciden
  ```json
  {
    "password1": "password123",
    "password2": "different456"
  }
  ```

- ❌ **Error 400**: Email duplicado
  ```json
  {
    "email": "usuario-existente@example.com"
  }
  ```

### 3. Login de Usuario - `POST /api/auth/login`
**Escenarios en la colección:**
- ✅ **Éxito (200)**: Login correcto, retorna JWT
  ```json
  {
    "email": "{{test_email}}",
    "password": "testpass123"
  }
  ```

- ❌ **Error 401**: Usuario no existe
  ```json
  {
    "email": "noexiste@example.com",
    "password": "cualquiera"
  }
  ```

- ❌ **Error 401**: Contraseña incorrecta
  ```json
  {
    "email": "usuario-valido@example.com",
    "password": "password-incorrecto"
  }
  ```

## Prerrequisitos

### 1. Configurar Variables de Entorno
**IMPORTANTE**: Crear archivo `.env` con las variables necesarias (no está en el repo por seguridad):

```bash
# Crear archivo .env
touch .env
```

**Contenido requerido para `.env`:**
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

**Para generar una SECRET_KEY segura, ejecuta uno de estos comandos:**
```bash
# Opción 1: Usando openssl
openssl rand -hex 32

# Opción 2: Usando Python
python -c "import secrets; print(secrets.token_hex(32))"

# Opción 3: Usando Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copia el resultado y úsalo como valor de `SECRET_KEY` en el archivo `.env`.

### 2. Levantar los servicios con Docker Compose
```bash
# Levantar todos los servicios (PostgreSQL, FastAPI, Nginx)
docker-compose up -d

# Verificar que los servicios estén corriendo
docker-compose ps
```

### 3. Instalar Newman y Reporter HTML
```bash
npm install -g newman
npm install -g newman-reporter-html
```

## Ejecutar Pruebas con Newman CLI

### Ejecutar Colección Localmente (con Docker Compose)
```bash
# Asegúrese de que docker-compose esté corriendo primero
docker-compose up -d

# Ejecutar pruebas contra la API local (puerto 80 via nginx)
newman run collections/desarrollo-sw-nube-api.postman_collection.json \
  -e collections/postman_environment.json \
  --env-var "base_url=http://localhost"
```

### Ejecutar Colección Contra API Desplegada
```bash
newman run collections/desarrollo-sw-nube-api.postman_collection.json \
  -e collections/postman_environment.json \
  --env-var "base_url=http://ip-de-su-servidor" \
  --env-var "deploy_url=http://ip-de-su-servidor"
```

### Generar Reporte HTML
```bash
# Instalar reporter HTML si no está instalado
npm install -g newman-reporter-html

# Con servicios Docker locales
docker-compose up -d
newman run collections/desarrollo-sw-nube-api.postman_collection.json \
  -e collections/postman_environment.json \
  --env-var "base_url=http://localhost" \
  --reporters html \
  --reporter-html-export reporte-newman.html
```

### Detener Servicios
```bash
# Detener servicios después de las pruebas
docker-compose down
```

## Variables de Entorno
- `base_url`: URL base para la API (por defecto: http://localhost)
- `deploy_url`: URL de la API desplegada (reemplazar con IP del servidor)
- `access_token`: Token JWT (se establece automáticamente por la prueba de login)

## Ejemplos de Request/Response

### Health Check
```http
GET http://localhost/
```
**Response 200:**
```json
"Healthcheck"
```

### Registro Exitoso
```http
POST http://localhost/api/auth/signup
Content-Type: application/json

{
  "first_name": "Ana",
  "last_name": "García",
  "email": "ana@example.com",
  "city": "Bogotá",
  "country": "Colombia",
  "password1": "mipassword123",
  "password2": "mipassword123"
}
```
**Response 201:**
```json
{
  "id": 1,
  "first_name": "Ana",
  "last_name": "García",
  "email": "ana@example.com",
  "city": "Bogotá",
  "country": "Colombia"
}
```

### Login Exitoso
```http
POST http://localhost/api/auth/login
Content-Type: application/json

{
  "email": "ana@example.com",
  "password": "mipassword123"
}
```
**Response 200:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
```

### Errores Comunes
**400 - Contraseñas no coinciden:**
```json
{
  "detail": "Las contraseñas no coinciden."
}
```

**400 - Email duplicado:**
```json
{
  "detail": "Email ya está registrado."
}
```

**401 - Credenciales inválidas:**
```json
{
  "detail": "Credenciales inválidas."
}
```

## Arquitectura de Servicios
La aplicación usa Docker Compose con:
- **PostgreSQL**: Base de datos (puerto interno 5432)
- **FastAPI**: API backend (puerto interno 8000)
- **Nginx**: Reverse proxy (puerto 80 - acceso externo)

Las pruebas se ejecutan contra Nginx en el puerto 80, que redirige al servicio FastAPI.