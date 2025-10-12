# Colección Postman - API Desarrollo SW Nube

## Descripción
Esta colección contiene pruebas automatizadas para todos los endpoints de la API con escenarios de prueba completos.

## Archivos
- `desarrollo-sw-nube-api.postman_collection.json` - Colección principal con requests y pruebas
- `postman_environment.json` - Variables de entorno para diferentes escenarios de despliegue

## Endpoints Incluidos
1. **Health Check** - `GET /`
2. **Registro de Usuario** - `POST /api/auth/signup`
3. **Login de Usuario** - `POST /api/auth/login`

## Escenarios de Prueba
### Casos Exitosos
- Health check retorna 200
- Registro de usuario con datos válidos
- Login con credenciales correctas

### Casos de Error
- Contraseñas no coinciden en registro (400)
- Email duplicado en registro (400)
- Credenciales inválidas en login (401)
- Contraseña incorrecta para usuario existente (401)

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

## Mensajes de Error Documentados
- **400 Bad Request**: "Las contraseñas no coinciden" / "Email ya está registrado"
- **401 Unauthorized**: "Credenciales inválidas"
- **200 OK**: Operaciones exitosas
- **201 Created**: Usuario creado exitosamente

## Arquitectura de Servicios
La aplicación usa Docker Compose con:
- **PostgreSQL**: Base de datos (puerto interno 5432)
- **FastAPI**: API backend (puerto interno 8000)
- **Nginx**: Reverse proxy (puerto 80 - acceso externo)

Las pruebas se ejecutan contra Nginx en el puerto 80, que redirige al servicio FastAPI.