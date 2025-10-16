# Colección Postman - API de Competencia de Habilidades

## Descripción

Esta colección de Postman contiene todos los endpoints de la API para probar la funcionalidad completa de la plataforma de competencia de habilidades de jugadores.

## Contenido de la Colección

### 📁 Archivos Incluidos

- `desarrollo-sw-nube-api.postman_collection.json` - Colección principal
- `postman_environment.json` - Variables de entorno
- `README.md` - Esta documentación

### 🔗 Endpoints Incluidos

1. **Health Check** - Verificación del estado de la API
2. **User Signup** - Registro de nuevos usuarios
3. **User Login** - Autenticación y obtención de JWT
4. **Upload Video** - Subida de videos MP4
5. **List User Videos** - Listado de videos del usuario
6. **Get Video Details** - Detalles específicos de un video
7. **Delete Video** - Eliminación de videos
8. **Public Rankings** - Ranking público de jugadores

## 🚀 Configuración Rápida

### Paso 1: Importar en Postman

1. Abrir Postman
2. Clic en **Import**
3. Seleccionar `desarrollo-sw-nube-api.postman_collection.json`
4. Importar también `postman_environment.json`

### Paso 2: Configurar Entorno

1. Seleccionar el entorno **"Desarrollo SW Nube"**
2. Verificar que `base_url` esté configurado como `http://localhost`
3. Las demás variables se configuran automáticamente

### Paso 3: Ejecutar Pruebas

**Orden recomendado:**
1. Health Check
2. User Signup
3. User Login (guarda `access_token`)
4. Upload Video
5. List User Videos (guarda `test_video_id`)
6. Get Video Details
7. Public Rankings
8. Delete Video (opcional)

## 📋 Variables de Entorno

| Variable | Descripción | Se configura en |
|----------|-------------|-----------------|
| `base_url` | URL base de la API | Manual |
| `access_token` | JWT token de autenticación | User Login |
| `test_email` | Email del usuario de prueba | User Signup |
| `test_video_id` | ID del video para pruebas | List User Videos |

## 🧪 Tests Automatizados

Cada endpoint incluye tests automáticos que verifican:

- ✅ Códigos de estado HTTP correctos
- ✅ Estructura de respuesta válida
- ✅ Campos requeridos presentes
- ✅ Tipos de datos correctos
- ✅ Lógica de negocio (ordenamiento, validaciones)

### Ejecutar Tests con Newman

```bash
# Instalar Newman
npm install -g newman

# Ejecutar colección completa
newman run collections/desarrollo-sw-nube-api.postman_collection.json \
  -e collections/postman_environment.json \
  --env-var "base_url=http://localhost"

# Con reporte HTML
newman run collections/desarrollo-sw-nube-api.postman_collection.json \
  -e collections/postman_environment.json \
  --env-var "base_url=http://localhost" \
  -r html --reporter-html-export report.html
```

## 📊 Reportes y Métricas

### Métricas Incluidas

- Tiempo de respuesta por endpoint
- Tasa de éxito de tests
- Cobertura de casos de prueba
- Validación de contratos API

### Generar Reportes

```bash
# Reporte detallado con Newman
newman run collections/desarrollo-sw-nube-api.postman_collection.json \
  -e collections/postman_environment.json \
  --env-var "base_url=http://localhost" \
  -r cli,json,html \
  --reporter-json-export results.json \
  --reporter-html-export report.html
```

## 📚 Recursos Adicionales

- [Documentación de la API](../docs/Entrega_1/README.md)
- [Guía de instalación](../docs/Entrega_1/README.md)
- [Documentación interactiva](http://localhost/docs)
- [Documentación alternativa](http://localhost/redoc)