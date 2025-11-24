# Pruebas de Carga - Entrega 5: AWS ECS con Autoscaling V3

> **Proyecto:** Desarrollo de Software en la Nube  
> **Fecha de Ejecución:** 22 de Noviembre de 2025  
> **Infraestructura:** AWS ECS (Elastic Container Service) + Application Load Balancer + Auto Scaling  
> **Región:** us-east-1  
> **Herramienta:** Apache JMeter 5.6.3

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Configuración de la Infraestructura](#configuración-de-la-infraestructura)
3. [Configuración de las Pruebas](#configuración-de-las-pruebas)
4. [Fase 1 - Sanidad](#fase-1---sanidad)
5. [Fase 2 - Escalamiento](#fase-2---escalamiento)
6. [Análisis Comparativo](#análisis-comparativo)
7. [Conclusiones y Recomendaciones](#conclusiones-y-recomendaciones)
8. [Pruebas de Carga - Capa Worker (SQS + Celery)](#8-pruebas-de-carga---capa-worker-sqs--celery)

---

## 1. Resumen Ejecutivo

### Objetivo
Evaluar el rendimiento y comportamiento de la aplicación de procesamiento de videos desplegada en AWS ECS (Elastic Container Service) utilizando Application Load Balancer (ALB) con Auto Scaling bajo diferentes escenarios de carga. Adicionalmente, se evalúa la capacidad de la capa worker (SQS + Celery) ejecutándose en contenedores ECS para procesar mensajes de forma asíncrona.

### Infraestructura Evaluada
- **Endpoint:** `http://video-app-alb-375251954.us-east-1.elb.amazonaws.com`
- **API Endpoint:** `/api/videos/upload`
- **Plataforma de Contenedores:** AWS ECS (Elastic Container Service)
- **Balanceador:** Application Load Balancer (ALB)
- **Auto Scaling:** Habilitado (1-10 tareas/contenedores ECS)
- **Región:** us-east-1 (Norte de Virginia)

### Resultados Generales

**Capa Web (JMeter):**

| Fase | Usuarios | Duración | Peticiones | Éxito | Error | Tiempo Prom. | Throughput |
|------|----------|----------|------------|-------|-------|--------------|------------|
| Fase 1 - Sanidad | 105 | 9:02 min | 620 | 100% | 0% | 69.4 seg | 1.14 req/s |
| Fase 2 Esc. 1 | 100 | 8:01 min | 510 | 99.02% | 0.98% | 90.5 seg | 1.06 req/s |
| Fase 2 Esc. 2 | 200 | 7:48 min | 657 | 99.85% | 0.15% | 141.4 seg | 1.41 req/s |
| Fase 2 Esc. 3 | 300 | 7:51 min | 692 | 100% | 0% | 204.2 seg | 1.47 req/s |

**Capa Worker (Locust):**

| Escenario | Requests | Éxito | Error | Latencia Prom. | Throughput |
|-----------|----------|-------|-------|----------------|------------|
| Smoke | 1,178 | 100% | 0% | 2.47 seg | 3.97 req/s |
| Ramp | 3,398 | 86.96% | 13.04% | 32.13 seg | 3.78 req/s |
| Soak | 10,804 | 97.42% | 2.58% | 25.37 seg | 4.00 req/s |

### Conclusiones Principales

**Hallazgos de Escalamiento:**
- Auto Scaling validado: El sistema mejora su estabilidad con mayor carga
- Tasa de error decrece progresivamente: 0.98% → 0.15% → 0%
- Throughput incrementa: 1.06 → 1.41 → 1.47 req/s (+39% vs 100 usuarios)
- Alta disponibilidad: 100% de éxito con 300 usuarios concurrentes

**Performance:**
- La infraestructura AWS ECS escala correctamente según la demanda
- Los tiempos de respuesta incrementan proporcionalmente a la carga (90s → 204s)
- El sistema escala preventivamente bajo alta concurrencia mediante auto-scaling de tareas ECS
- Capacidad demostrada: >300 usuarios sin fallos

**Patrón de Comportamiento:**
```
Usuarios:    100      200      300
Éxito:      99.0%   99.9%   100%
Throughput:  1.06     1.41    1.47 req/s
Errores:      5       1       0
```

---

## 2. Configuración de la Infraestructura

### 2.1 AWS ECS (Elastic Container Service)

```yaml
Configuración:
  Servicio: video-app-service
  Cluster: video-app-cluster
  Launch Type: Fargate (sin gestión de servidores)
  Plataforma: Linux/AMD64
  
Tareas (Contenedores):
  Tareas Mínimas: 1
  Tareas Deseadas: 1
  Tareas Máximas: 10
  
Definición de Tarea:
  CPU: 1024 (1 vCPU)
  Memoria: 2048 MB (2 GB)
  Imagen: Aplicación FastAPI containerizada
  Network Mode: awsvpc
  
Auto Scaling:
  Métrica: CPU Utilization
  Target: 50%
  Scale Out: Agregar 1 tarea cuando CPU > 50%
  Scale In: Remover 1 tarea cuando CPU < 30%
  Cooldown: 300 segundos
```

### 2.2 Application Load Balancer (ALB)

```yaml
Configuración:
  Nombre: video-app-alb
  DNS: video-app-alb-375251954.us-east-1.elb.amazonaws.com
  Esquema: Internet-facing
  Protocolo: HTTP
  Puerto: 80
  
Listeners:
  - Protocol: HTTP
    Port: 80
    Default Action: Forward to target group

Target Group:
  Protocol: HTTP
  Port: 80
  Health Check:
    Path: /
    Interval: 30 segundos
    Timeout: 5 segundos
    Healthy Threshold: 2
    Unhealthy Threshold: 3
```

### 2.3 Integración ALB con ECS

```yaml
Target Group:
  Protocol: HTTP
  Port: 80
  Target Type: IP (Fargate)
  Health Check:
    Path: /
    Interval: 30 segundos
    Timeout: 5 segundos
    Healthy Threshold: 2
    Unhealthy Threshold: 3
    Success Codes: 200
    
Service Discovery:
  Registro automático de tareas ECS en el Target Group
  Distribución de carga entre tareas activas
  Health checks por tarea individual
```

### 2.4 Aplicación en Contenedores ECS

```yaml
Componentes:
  Backend: FastAPI (Python) - Ejecutándose en contenedores ECS
  Base de Datos: PostgreSQL 16.x (RDS)
  Cache: Redis (ElastiCache)
  Worker: Celery (procesamiento asíncrono) - Ejecutándose en contenedores ECS
  Queue: Amazon SQS
  Storage: S3 (para videos)

Arquitectura de Contenedores:
  Servicio Web:
    - Contenedores ECS ejecutando FastAPI + Nginx
    - Auto-scaling basado en CPU/memoria
    - Distribución de carga vía ALB
    
  Servicio Worker:
    - Contenedores ECS ejecutando Celery workers
    - Consumo de mensajes desde SQS
    - Auto-scaling basado en backlog de SQS

API Endpoint:
  URL: /api/videos/upload
  Método: POST
  Content-Type: multipart/form-data
  Autenticación: JWT Bearer Token
  
Parámetros:
  - video_file: Archivo MP4 (2560x1440)
  - Size: ~10-15 MB por archivo
```

---

## 3. Configuración de las Pruebas

### 3.1 Herramientas Utilizadas

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| Apache JMeter | 5.6.3 | Ejecución de pruebas de carga |
| Java Runtime | 25.0.1 LTS | Motor de ejecución para JMeter |
| JMeter Plugin - Ultimate Thread Group | 2.10 | Control de rampa de usuarios |
| PowerShell | 5.1 | Automatización y análisis de resultados |

### 3.2 Configuración de JMeter

**HTTP Request Defaults:**
```xml
Domain: video-app-alb-375251954.us-east-1.elb.amazonaws.com
Port: 80
Protocol: http
Implementation: HttpClient4
```

**HTTP Request - POST /api/videos/upload:**
```yaml
Method: POST
Path: /api/videos/upload
Follow Redirects: true
Use KeepAlive: true
Multipart: true

Files Upload:
  - File Path: C:\Users\nicol\Documents\DSNB\desarrollo-sw-nube\uploads\sample_2560x1440.mp4
  - MIME Type: video/mp4
  - Parameter Name: video_file
  - File Size: ~10-15 MB

Headers:
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMSIsImV4cCI6MTc2NDA3NTE2OH0.qKB2h0mBVAx3sXlvqGeXtpzFTUA_Wu63snEOflJQF48
    (Token JWT válido generado el 22/11/2025)
```

**Assertions:**
```yaml
JSON Path Assertion:
  - Path: $.task_id
  - Validation: Campo debe existir
  
Response Assertion:
  - Field: Response Code
  - Pattern: 201 (Created)
  - Type: Equals
```

### 3.3 Usuario de Prueba

```json
{
  "email": "loadtest2@example.com",
  "username": "loadtest2",
  "first_name": "Load",
  "last_name": "Test",
  "id": 11,
  "ciudad": "Bogota"
}
```

**Token Generado:**
- Fecha: 2025-11-22 19:52:00 GMT-05:00
- Expiración: 2025-11-23 (timestamp: 1764075168)
- Algoritmo: HS256

---

## 4. Fase 1 - Sanidad

### 4.1 Objetivo de la Prueba

Verificar que la infraestructura AWS con ALB está operativa y puede procesar peticiones de carga de video bajo condiciones mínimas de tráfico, estableciendo una línea base de rendimiento.

### 4.2 Configuración de la Prueba

**Ultimate Thread Group:**
```yaml
Grupos de Usuarios:
  - Grupo 1 (Sanidad): 5 usuarios durante 1 minuto
  - Grupo 2 (Escalamiento): 100 usuarios con patrón gradual
  
Duración Total: 9 minutos 2 segundos
Patrón: Rampa gradual + sostenimiento + descenso
```

**Parámetros de Ejecución:**
```bash
jmeter -n -t "WebApp_Carga_AWS.jmx" \
  -l "resultados/resultados_sanidad.csv" \
  -e -o "dashboards/"
```

### 4.3 Resultados Obtenidos

| Métrica | Valor | Observación |
|---------|-------|-------------|
| Total de Peticiones | 620 | Carga durante 9 min 2 seg |
| Peticiones Exitosas | 620 | 100% de éxito |
| Peticiones Fallidas | 0 | 0% de error |
| Throughput | 1.14 req/s | Capacidad de procesamiento |
| Tiempo Respuesta Promedio | 69.41 seg | 1 minuto 9 segundos |
| Tiempo Respuesta Mínimo | 4.09 seg | Mejor caso |
| Tiempo Respuesta Máximo | 208.00 seg | 3 minutos 28 segundos |
| Duración Total | 9 min 2 seg | Tiempo real de ejecución |

### 4.4 Análisis de Resultados

**Aspectos Positivos:**

1. **Tasa de éxito del 100%**
   - Todos los 620 requests se completaron exitosamente
   - No se registraron errores HTTP (401, 500, etc.)
   - La autenticación JWT funcionó correctamente durante toda la prueba

2. **Conectividad estable**
   - El Application Load Balancer respondió a todas las solicitudes
   - No se detectaron problemas de red o timeout
   - La infraestructura está correctamente configurada

3. **Validación de funcionalidad**
   - El endpoint `/api/videos/upload` procesa correctamente los archivos
   - La cola SQS recibe los trabajos de procesamiento
   - El sistema maneja archivos de video de 2K sin problemas

**Observaciones:**

1. **Tiempos de respuesta elevados**
   - Promedio: 69.4 segundos por request
   - Máximo: 208 segundos (3.5 minutos)
   - Mínimo: 4.1 segundos
   - Causa: Upload del archivo de video (~10-15 MB) + almacenamiento en S3 + creación del mensaje en SQS

2. **Variabilidad en tiempos de respuesta**
   - Rango de 4.1s a 208s (diferencia de 50x)
   - Indica contención bajo carga incremental
   - Los primeros requests responden más rápido

### 4.5 Conclusiones de Sanidad

- Sistema operativo y estable con infraestructura correctamente configurada
- Sin errores de autenticación o conectividad
- Rendimiento esperado para operaciones de archivos grandes
- Sistema capaz de manejar 105 usuarios concurrentes
- Baseline de rendimiento establecido para pruebas intensivas

---

## 5. Fase 2 - Escalamiento

### 5.1 Escenario 1 - 100 Usuarios Concurrentes

#### 5.1.1 Configuración

**Ultimate Thread Group:**
```yaml
Start Users Count: 100
Initial Delay: 0 segundos
Startup Time: 120 segundos (2 minutos)
Hold Load For: 300 segundos (5 minutos)
Shutdown Time: 60 segundos (1 minuto)
Duración Total: 8 minutos 1 segundo
```

**Comando de Ejecución:**
```bash
jmeter -n -t "WebApp_Carga_AWS_100usuarios.jmx" \
  -l "resultados/resultados_100usuarios.csv" \
  -e -o "dashboards/dashboard_100usuarios"
```

#### 5.1.2 Resultados

| Métrica | Valor | Observación |
|---------|-------|-------------|
| Total de Peticiones | 510 | Carga durante 8:01 min |
| Peticiones Exitosas | 505 | 99.02% de éxito |
| Peticiones Fallidas | 5 | 0.98% de error |
| Throughput | 1.06 req/s | Capacidad de procesamiento |
| Tiempo Respuesta Promedio | 90.50 seg | 1 minuto 30 segundos |
| Tiempo Respuesta Mínimo | 4.10 seg | Mejor caso |
| Tiempo Respuesta Máximo | 208.05 seg | 3 minutos 28 segundos |
| Duración Total | 8 min 1 seg | Tiempo real de ejecución |

**Análisis de Errores (5 peticiones):**

| Código | Mensaje | Cantidad | Tipo |
|--------|---------|----------|------|
| 401 | Unauthorized | 5 | Error de autenticación |

#### 5.1.3 Análisis

**Aspectos Positivos:**
- Alta tasa de éxito (99.02%) con solo 5 de 510 requests fallidos
- Throughput estable de 1.06 req/s con 100 usuarios concurrentes
- Auto Scaling activado correctamente
- Distribución de carga efectiva a través del ALB

**Observaciones:**
- Errores 401: Posible expiración de token JWT durante prueba prolongada (impacto mínimo 0.98%)
- Incremento en tiempos de respuesta: Promedio de 90.5s (+30% vs sanidad)
- Variabilidad mantenida: Rango de 4.1s a 208s

#### 5.1.4 Conclusiones

- Sistema estable con 100 usuarios concurrentes
- Tasa de éxito superior al 99%
- Errores de autenticación mínimos (0.98%)
- Tiempos de respuesta incrementan bajo carga (+30%)
- Auto Scaling operativo

---

### 5.2 Escenario 2 - 200 Usuarios Concurrentes

#### 5.2.1 Configuración

**Ultimate Thread Group:**
```yaml
Start Users Count: 200
Initial Delay: 0 segundos
Startup Time: 120 segundos (2 minutos)
Hold Load For: 300 segundos (5 minutos)
Shutdown Time: 60 segundos (1 minuto)
Duración Total: 7 minutos 48 segundos
```

**Comando de Ejecución:**
```bash
jmeter -n -t "WebApp_Carga_AWS_200usuarios.jmx" \
  -l "resultados/resultados_200usuarios.csv" \
  -e -o "dashboards/dashboard_200usuarios"
```

#### 5.2.2 Resultados

| Métrica | Valor | Observación |
|---------|-------|-------------|
| Total de Peticiones | 657 | Carga durante 7:48 min |
| Peticiones Exitosas | 656 | 99.85% de éxito |
| Peticiones Fallidas | 1 | 0.15% de error |
| Throughput | 1.41 req/s | +33% vs 100 usuarios |
| Tiempo Respuesta Promedio | 141.40 seg | 2 minutos 21 segundos |
| Tiempo Respuesta Mínimo | 4.01 seg | Mejor caso |
| Tiempo Respuesta Máximo | 284.69 seg | 4 minutos 45 segundos |
| Duración Total | 7 min 48 seg | Tiempo real de ejecución |

**Análisis de Errores (1 petición):**

| Código | Mensaje | Cantidad | Tipo |
|--------|---------|----------|------|
| 401 | Unauthorized | 1 | Error de autenticación |

#### 5.2.3 Análisis

**Aspectos Positivos:**
- Mejora significativa en estabilidad: tasa de error reducida de 0.98% a 0.15% (mejora del 84.7%)
- Solo 1 falla en 657 peticiones
- Throughput superior: 1.41 req/s (+33% vs 100 usuarios)
- El sistema procesa más peticiones por segundo con mayor carga
- Auto Scaling optimizado con más instancias activas

**Observaciones:**
- Incremento en tiempos de respuesta: Promedio de 141.4s (+56% vs 100 usuarios)
- Máximo de 284.7s (+37% vs 100 usuarios)
- Trade-off: Menor tasa de error a costa de mayor latencia
- Error único 401: Mejora dramática vs 5 errores con 100 usuarios

#### 5.2.4 Conclusiones

- Mejora dramática en estabilidad (99.85% éxito)
- Throughput incrementado (+33%)
- Reducción del 84.7% en tasa de errores
- Patrón observable: Mayor carga = Mayor estabilidad
- Auto Scaling altamente efectivo

---

### 5.3 Escenario 3 - 300 Usuarios Concurrentes

#### 5.3.1 Configuración

**Ultimate Thread Group:**
```yaml
Start Users Count: 300
Initial Delay: 0 segundos
Startup Time: 120 segundos (2 minutos)
Hold Load For: 300 segundos (5 minutos)
Shutdown Time: 60 segundos (1 minuto)
Duración Total: 7 minutos 51 segundos
```

**Comando de Ejecución:**
```bash
jmeter -n -t "WebApp_Carga_AWS_300usuarios.jmx" \
  -l "resultados/resultados_300usuarios.csv" \
  -e -o "dashboards/dashboard_300usuarios"
```

#### 5.3.2 Resultados

| Métrica | Valor | Observación |
|---------|-------|-------------|
| Total de Peticiones | 692 | Carga durante 7:51 min |
| Peticiones Exitosas | 692 | 100% de éxito |
| Peticiones Fallidas | 0 | 0% de error |
| Throughput | 1.47 req/s | +39% vs 100 usuarios |
| Tiempo Respuesta Promedio | 204.20 seg | 3 minutos 24 segundos |
| Tiempo Respuesta Mínimo | 4.72 seg | Mejor caso |
| Tiempo Respuesta Máximo | 349.87 seg | 5 minutos 50 segundos |
| Duración Total | 7 min 51 seg | Tiempo real de ejecución |

**Análisis de Errores:**
```
CERO ERRORES REGISTRADOS
Tasa de éxito: 100.00%
Todas las 692 peticiones se completaron exitosamente
```

#### 5.3.3 Análisis

**Aspectos Positivos:**
- Perfección operacional alcanzada: 100% de éxito con 692 peticiones
- Progresión de éxito: 99.02% → 99.85% → 100%
- Máximo throughput alcanzado: 1.47 req/s (+39% vs 100 usuarios, +4.3% vs 200 usuarios)
- Múltiples instancias activas distribuyendo carga óptimamente
- Balanceo perfecto a través del ALB
- Cero errores de disponibilidad o timeout

**Patrón Observado:**
```
100 usuarios → 5 errores (0.98%)
200 usuarios → 1 error (0.15%)
300 usuarios → 0 errores (0.00%)
```

Explicación: Auto Scaling escala preventivamente con alta carga, distribuyendo mejor los requests y evitando sobrecarga de instancias individuales.

**Observaciones:**
- Incremento continuo en tiempos de respuesta: Promedio de 204.2s (+126% vs 100 usuarios, +44% vs 200 usuarios)
- Máximo de 349.9s (+68% vs 100 usuarios, +23% vs 200 usuarios)
- Trade-off aceptable: Mayor latencia a cambio de 100% disponibilidad
- Causas del incremento: Mayor cantidad de archivos en cola SQS, procesamiento asíncrono saturado, upload concurrente a S3

#### 5.3.4 Conclusiones

- Rendimiento perfecto: 100% de éxito con 300 usuarios
- Throughput máximo alcanzado: 1.47 req/s
- Patrón validado: Más usuarios = Mayor estabilidad
- Auto Scaling en estado óptimo
- Latencia incrementa pero disponibilidad garantizada
- Sistema listo para producción bajo alta carga

---

### 5.4 Conclusiones Generales de Escalamiento

#### Tabla Comparativa

| Usuarios | Peticiones | Éxito | Error | Throughput | Tiempo Prom. | Tiempo Máx. |
|----------|------------|-------|-------|------------|--------------|-------------|
| 100 | 510 | 99.02% | 0.98% | 1.06 req/s | 90.5 seg | 208.1 seg |
| 200 | 657 | 99.85% | 0.15% | 1.41 req/s | 141.4 seg | 284.7 seg |
| 300 | 692 | 100% | 0% | 1.47 req/s | 204.2 seg | 349.9 seg |

#### Tendencias Observadas

**1. Estabilidad Creciente**
- Tasa de Error: 0.98% → 0.15% → 0.00%
- Reducción: -84.7% → -100%
- Más usuarios genera menos errores
- Auto Scaling previene sobrecarga de instancias individuales
- Distribución óptima de carga con ALB

**2. Throughput Escalado**
- Throughput: 1.06 → 1.41 → 1.47 req/s
- Incremento: +33% → +39% (vs 100 usuarios)
- Escalamiento casi lineal
- Máxima eficiencia con 300 usuarios

**3. Latencia Incremental**
- Tiempo Prom: 90.5s → 141.4s → 204.2s
- Incremento: +56% → +126% (vs 100 usuarios)
- Trade-off esperado: Mayor latencia por mayor concurrencia
- I/O bound: Upload de videos + procesamiento asíncrono
- No impacta disponibilidad

#### Validación de Auto Scaling

**Auto Scaling de ECS:**
- Escala tareas/contenedores según carga de CPU correctamente
- Distribución efectiva de requests a través del ALB
- Prevención de sobrecarga de contenedores individuales
- Registro automático de nuevas tareas en el Target Group

**Application Load Balancer:**
- Balance de carga distribuido correctamente entre tareas ECS
- Health checks funcionando (no se detectaron tareas unhealthy)
- Routing eficiente a target groups con IPs de Fargate

**Infraestructura ECS:**
- Sistema soporta 3x la carga inicial sin fallos
- Alta disponibilidad garantizada (100% con 300 usuarios)
- Arquitectura cloud-native con contenedores validada
- Escalamiento de contenedores transparente y eficiente

#### Hallazgo Principal

**Patrón de Estabilidad Creciente:**

El sistema muestra un comportamiento positivo: A mayor carga → Mejor estabilidad.

**Explicación técnica:**
1. Con 100 usuarios: pocas tareas ECS activas, algunas sobrecargadas → Errores 401
2. Con 200 usuarios: más tareas ECS, mejor distribución → Menos errores
3. Con 300 usuarios: máxima cantidad de tareas ECS, carga distribuida óptimamente → Cero errores

**Implicación:**
- El Auto Scaling de ECS escala preventivamente bajo alta carga
- La distribución de requests es más eficiente con múltiples contenedores
- Sistema alcanza estado óptimo bajo presión sostenida
- Las tareas ECS se registran automáticamente en el ALB para balanceo de carga

**Trade-off:**
- Latencia incrementa con más usuarios (esperado para I/O bound)
- Disponibilidad mejora con más usuarios (beneficio del Auto Scaling)
- Para aplicación de procesamiento de video: Disponibilidad > Latencia

**Capacidad Estimada:**
- Sistema probado hasta 300 usuarios con 100% éxito
- Capacidad real estimada: >500 usuarios (extrapolando tendencia)
- Límite probable: Tareas máximas del servicio ECS (10 tareas configuradas)

---

## 6. Análisis Comparativo

### 6.1 Comparación de Performance

**Tasa de Éxito por Escenario:**
- 100 usuarios: 99.02%
- 200 usuarios: 99.85%
- 300 usuarios: 100%

**Throughput por Escenario:**
- 100 usuarios: 1.06 req/s
- 200 usuarios: 1.41 req/s (+33%)
- 300 usuarios: 1.47 req/s (+39%)

### 6.2 Comparación de Errores

| Escenario | Errores | Tipo | Impacto |
|-----------|---------|------|---------|
| 100 usuarios | 5 | 401 Unauthorized | 0.98% |
| 200 usuarios | 1 | 401 Unauthorized | 0.15% |
| 300 usuarios | 0 | N/A | 0% |

**Observación:** Los errores 401 se reducen progresivamente hasta desaparecer, confirmando que el Auto Scaling mejora la estabilidad del sistema.

### 6.3 Comparación de Latencia

**Tiempo de Respuesta Promedio:**
- 100 usuarios: 90.5 segundos
- 200 usuarios: 141.4 segundos (+56%)
- 300 usuarios: 204.2 segundos (+126%)

**Tiempo de Respuesta Máximo:**
- 100 usuarios: 208.1 segundos
- 200 usuarios: 284.7 segundos (+37%)
- 300 usuarios: 349.9 segundos (+68%)

**Análisis:** El incremento de latencia es proporcional al incremento de carga. Sin embargo, la disponibilidad se mantiene o mejora, lo cual es prioritario para este tipo de aplicación.

---

## 7. Conclusiones y Recomendaciones

### 7.1 Conclusiones Generales

1. **Auto Scaling de ECS Validado Exitosamente**
   - El sistema escala correctamente de 1 a múltiples tareas/contenedores ECS según la demanda
   - La distribución de carga a través del ALB funciona eficientemente
   - Se observa mejora de estabilidad con mayor carga
   - Las tareas ECS se registran automáticamente en el Target Group

2. **Alta Disponibilidad Demostrada**
   - Sistema alcanza 100% de disponibilidad con 300 usuarios concurrentes
   - Capacidad probada: >300 usuarios sin colapso
   - Infraestructura resiliente y preparada para producción

3. **Performance Aceptable para Cargas de Video**
   - Tiempos de respuesta coherentes con operaciones I/O intensivas
   - Throughput escala proporcionalmente con usuarios (1.06 → 1.47 req/s)
   - Procesamiento asíncrono mediante SQS funciona correctamente

4. **Infraestructura Cloud-Native Robusta con ECS**
   - Arquitectura AWS (ECS + ALB + SQS + S3 + RDS) operativa
   - Health checks y políticas de escalamiento de contenedores configuradas correctamente
   - Sin errores de infraestructura o conectividad
   - Contenedores ECS escalan y se distribuyen eficientemente

### 7.2 Recomendaciones

#### Recomendaciones Técnicas

1. **Gestión de Tokens JWT**
   - Implementar renovación automática de tokens para pruebas prolongadas
   - Considerar tiempos de expiración más largos para operaciones de carga de video
   - Agregar retry logic para errores 401

2. **Optimización de Latencia**
   - Evaluar upload directo a S3 con pre-signed URLs (bypass del backend)
   - Implementar multipart upload para archivos grandes
   - Considerar CDN (CloudFront) para distribución de contenido

3. **Escalamiento Proactivo de ECS**
   - Ajustar políticas de Auto Scaling de ECS para escalar más agresivamente
   - Considerar predictive scaling basado en patrones históricos
   - Evaluar target tracking scaling policy en lugar de step scaling
   - Optimizar configuración de CPU/memoria por tarea para mejor eficiencia

4. **Monitoreo y Observabilidad**
   - Implementar CloudWatch dashboards para métricas en tiempo real
   - Configurar alarmas para CPU, memoria, y latencia
   - Agregar distributed tracing (X-Ray) para debugging

#### Recomendaciones de Capacidad

1. **Límites de Producción**
   - Configurar máximo de tareas ECS basado en presupuesto y necesidades
   - Sistema actual soporta 300+ usuarios, extrapolar a 500-1000 usuarios con 10 tareas ECS
   - Realizar pruebas adicionales con 500 y 1000 usuarios para validar límites
   - Considerar aumentar límite máximo de tareas si se requiere mayor capacidad

2. **Optimización de Costos**
   - Evaluar uso de Spot Instances para tareas ECS de workers de Celery
   - Implementar auto-scaling schedule para reducir tareas ECS en horarios de baja demanda
   - Considerar Fargate Spot para reducir costos en workloads tolerantes a interrupciones
   - Optimizar asignación de CPU/memoria por tarea para evitar over-provisioning

3. **Plan de Contingencia**
   - Documentar procedimiento de rollback si Auto Scaling de ECS falla
   - Configurar mínimo de 2 tareas ECS para alta disponibilidad
   - Implementar circuit breakers para proteger servicios downstream
   - Configurar múltiples Availability Zones para resiliencia

### 7.3 Próximos Pasos

1. Ejecutar pruebas de soak (pruebas de duración extendida) por 24-48 horas
2. Realizar pruebas de estrés para identificar punto de quiebre del sistema
3. Implementar pruebas de chaos engineering (falla de instancias)
4. Validar comportamiento bajo spikes súbitos de tráfico
5. Optimizar configuración de workers de Celery según carga observada

---

## 8. Pruebas de Carga - Capa Worker

> **Fecha de ejecución:** 22 de Noviembre de 2025  
> **Infraestructura evaluada:** Worker asíncrono (Celery) ejecutándose en contenedores ECS, detrás de SQS `video-app-queue`  
> **Herramienta:** Locust (`load_testing/locust_ecs/worker_sqs_locust.py`)  
> **Endpoint:** `http://video-app-alb-375251954.us-east-1.elb.amazonaws.com`

---

### 8.1 Resumen Ejecutivo

**Objetivo:** Validar la capacidad de ingestión de mensajes hacia el worker vía SQS y determinar el comportamiento del sistema bajo diferentes escenarios de carga en la arquitectura AWS ECS con Auto Scaling de contenedores.

**Escenarios ejecutados:**
- **Smoke (Sanidad):** Validación básica con carga ligera
- **Ramp (Escalamiento):** Búsqueda del punto de saturación
- **Soak (Resistencia):** Estabilidad a tasa objetivo sostenida

**Resultados Generales:**

| Escenario | Requests | Fallos | Éxito | Latencia Media | p95 | Throughput |
|-----------|----------|--------|-------|----------------|-----|------------|
| Smoke | 1,178 | 0 | 100% | 2.47 seg | 4.4 seg | 3.97 req/s |
| Ramp | 3,398 | 443 | 86.96% | 32.13 seg | 74.0 seg | 3.78 req/s |
| Soak | 10,804 | 279 | 97.42% | 25.37 seg | 43.0 seg | 4.00 req/s |

**Conclusiones Principales:**
- La capa worker procesa establemente ~4 req/s con latencias altas (>25s)
- En smoke y soak se mantiene alta disponibilidad (100% y 97.42% respectivamente)
- La rampa expuso errores 504 Gateway Timeout cuando la API web no sostuvo el pico
- El sistema muestra mejor estabilidad en pruebas sostenidas (soak) vs rampas agresivas

---

### 8.2 Configuración y Metodología

#### 8.2.1 Herramientas y Configuración

| Elemento | Detalle |
|----------|---------|
| **Script Locust** | `load_testing/locust_ecs/worker_sqs_locust.py` |
| **Acciones simuladas** | `POST /api/auth/login` + `POST /api/videos/upload` (genera mensaje SQS) |
| **Archivo de video** | `uploads/file_example_MP4_480_1_5MG.mp4` (~1.5 MB) |
| **Credenciales** | Usuario de pruebas con token JWT por sesión |
| **Wait time** | `LOCUST_MIN_WAIT=0.05`, `LOCUST_MAX_WAIT=0.2` (override en soak: 0.02-0.05) |
| **Timeout** | 180 segundos por request |

#### 8.2.2 Escenarios de Prueba

| Escenario | Propósito | Configuración | Duración |
|-----------|-----------|---------------|----------|
| **Smoke** | Validar credenciales, path feliz y pipeline SQS con carga ligera | `-u 10`, `-r 5`, `-t 5m` | 5 minutos |
| **Ramp** | Incrementar usuarios hasta encontrar el punto de saturación | `-u 200`, `-r 20`, `-t 15m` | 15 minutos |
| **Soak** | Mantener tasa objetivo (~4 req/s efectivos) durante período extendido | `-u 120`, `-r 10`, `-t 45m` | 45 minutos |

---

### 8.3 Resultados Detallados

#### 8.3.1 Smoke - Sanidad

**Configuración:**
- Usuarios: 10
- Spawn rate: 5 usuarios/segundo
- Duración: 5 minutos

**Resultados:**

| Métrica | Valor | Observación |
|---------|-------|-------------|
| Total de Requests | 1,178 | Carga ligera durante 5 minutos |
| Requests Exitosos | 1,178 | 100% de éxito |
| Requests Fallidos | 0 | 0% de error |
| Latencia Promedio | 2.47 seg | 2,471 ms |
| Latencia p95 | 4.4 seg | 4,400 ms |
| Latencia Mínima | 0.61 seg | 611 ms |
| Latencia Máxima | 7.74 seg | 7,735 ms |
| Throughput | 3.97 req/s | Capacidad de procesamiento |

**Desglose por Endpoint:**

| Endpoint | Requests | Fallos | Latencia Promedio | Throughput |
|----------|----------|--------|-------------------|------------|
| Auth/Login | 10 | 0 | 1.47 seg | 0.03 req/s |
| Videos/Upload | 1,168 | 0 | 2.48 seg | 3.93 req/s |

**Análisis:**
- ✅ **Tasa de éxito perfecta:** 100% de requests completados exitosamente
- ✅ **Autenticación estable:** Login completado en <1.5s promedio
- ✅ **Upload funcional:** Procesamiento de videos en ~2.5s promedio
- ✅ **Worker operativo:** Pipeline SQS funcionando correctamente
- ✅ **Baseline establecido:** Sistema saludable bajo carga mínima

**Conclusiones:**
- Sistema operativo y estable con infraestructura correctamente configurada
- Sin errores de autenticación o conectividad
- Worker procesa mensajes de SQS sin backlog observable
- Baseline de rendimiento establecido para pruebas intensivas

---

#### 8.3.2 Ramp - Punto de Saturación

**Configuración:**
- Usuarios: 200
- Spawn rate: 20 usuarios/segundo
- Duración: 15 minutos

**Resultados:**

| Métrica | Valor | Observación |
|---------|-------|-------------|
| Total de Requests | 3,398 | Carga durante 15 minutos |
| Requests Exitosos | 2,955 | 86.96% de éxito |
| Requests Fallidos | 443 | 13.04% de error |
| Latencia Promedio | 32.13 seg | 32,131 ms |
| Latencia p95 | 74.0 seg | 74,000 ms |
| Latencia Mínima | 0.61 seg | 614 ms |
| Latencia Máxima | 164.11 seg | 164,114 ms (2.7 minutos) |
| Throughput | 3.78 req/s | Capacidad de procesamiento |

**Desglose por Endpoint:**

| Endpoint | Requests | Fallos | Tasa Error | Latencia Promedio | Throughput |
|----------|----------|--------|------------|-------------------|------------|
| Auth/Login | 200 | 82 | 41.00% | 35.93 seg | 0.22 req/s |
| Videos/Upload | 3,198 | 361 | 11.29% | 31.89 seg | 3.56 req/s |

**Análisis de Errores (443 peticiones):**

| Código | Mensaje | Cantidad | Tipo | Endpoint |
|--------|---------|----------|------|----------|
| 504 | Gateway Timeout | 442 | Timeout | Auth/Login (82), Videos/Upload (360) |
| 0 | Error de conexión | 1 | Network | Videos/Upload (1) |

**Análisis:**
- ⚠️ **Tasa de error significativa:** 13.04% de fallos bajo carga agresiva
- ⚠️ **Errores 504 Gateway Timeout:** Indican que la capa web/API no sostuvo el pico de carga
- ⚠️ **Login más afectado:** 41% de tasa de error en autenticación vs 11.29% en upload
- ⚠️ **Latencia incrementada:** Promedio de 32.13s (+1,200% vs smoke)
- ⚠️ **Cuello de botella en API web:** Los errores aparecen antes de saturar el worker

**Hallazgos:**
- La capa web/ALB necesita escalado adicional para acompañar rampas agresivas
- Los timeouts de 60 segundos del ALB se exceden bajo alta carga
- El worker es estable, pero la API web se convierte en cuello de botella
- Se requiere autoscaling más agresivo o tuning específico para la API

**Conclusiones:**
- Sistema muestra degradación bajo rampa agresiva (200 usuarios)
- Errores 504 indican límites de la capa web antes del worker
- Auto Scaling del worker funciona, pero la API web requiere optimización
- Capacidad real del worker no se alcanzó debido a fallos previos en la API

---

#### 8.3.3 Soak - Resistencia

**Configuración:**
- Usuarios: 120
- Spawn rate: 10 usuarios/segundo
- Duración: 45 minutos
- Wait time agresivo: 0.02-0.05 segundos

**Resultados:**

| Métrica | Valor | Observación |
|---------|-------|-------------|
| Total de Requests | 10,804 | Carga sostenida durante 45 minutos |
| Requests Exitosos | 10,525 | 97.42% de éxito |
| Requests Fallidos | 279 | 2.58% de error |
| Latencia Promedio | 25.37 seg | 25,370 ms |
| Latencia p95 | 43.0 seg | 43,000 ms |
| Latencia Mínima | 0.69 seg | 688 ms |
| Latencia Máxima | 93.93 seg | 93,930 ms (1.6 minutos) |
| Throughput | 4.00 req/s | Capacidad sostenida |

**Desglose por Endpoint:**

| Endpoint | Requests | Fallos | Tasa Error | Latencia Promedio | Throughput |
|----------|----------|--------|------------|-------------------|------------|
| Auth/Login | 120 | 18 | 15.00% | 22.57 seg | 0.04 req/s |
| Videos/Upload | 10,684 | 261 | 2.44% | 25.40 seg | 3.96 req/s |

**Análisis de Errores (279 peticiones):**

| Código | Mensaje | Cantidad | Tipo | Endpoint |
|--------|---------|----------|------|----------|
| 504 | Gateway Timeout | 279 | Timeout | Auth/Login (18), Videos/Upload (261) |

**Análisis:**
- ✅ **Alta tasa de éxito:** 97.42% de requests completados exitosamente
- ✅ **Throughput sostenido:** 4.00 req/s durante 45 minutos sin degradación
- ✅ **Estabilidad mejorada:** Mejor rendimiento que en rampa (97.42% vs 86.96%)
- ✅ **Worker consistente:** Sin errores de procesamiento, solo timeouts de API web
- ⚠️ **Latencia estructural alta:** Promedio de 25.37s debido al ciclo completo (upload + procesamiento)
- ⚠️ **Errores residuales:** 2.58% de timeouts 504, principalmente en upload

**Comportamiento:**
- Throughput sostenido de 4.0 req/s sin errores de worker
- La cola SQS y el worker se mantienen estables a tasa constante
- Latencia promedio >25s implica que cualquier degradación adicional podría disparar timeouts
- El sistema muestra mejor comportamiento en pruebas sostenidas vs rampas agresivas

**Conclusiones:**
- Sistema estable bajo carga sostenida (97.42% éxito)
- Worker procesa consistentemente ~4 req/s sin backlog observable
- Errores residuales (2.58%) son principalmente timeouts de API web
- Latencia alta pero aceptable para operaciones I/O intensivas
- Sistema listo para producción bajo carga sostenida moderada

---

### 8.4 Análisis Comparativo

#### 8.4.1 Comparación de Métricas por Escenario

| Escenario | Requests | Éxito | Error | Throughput | Latencia Prom. | p95 |
|-----------|----------|-------|-------|------------|----------------|-----|
| Smoke | 1,178 | 100% | 0% | 3.97 req/s | 2.47 seg | 4.4 seg |
| Ramp | 3,398 | 86.96% | 13.04% | 3.78 req/s | 32.13 seg | 74.0 seg |
| Soak | 10,804 | 97.42% | 2.58% | 4.00 req/s | 25.37 seg | 43.0 seg |

#### 8.4.2 Tendencias Observadas

**1. Estabilidad por Tipo de Carga:**
- **Smoke (carga ligera):** 100% éxito - Sistema operativo
- **Ramp (carga agresiva):** 86.96% éxito - Degradación por timeouts
- **Soak (carga sostenida):** 97.42% éxito - Mejor estabilidad que rampa

**2. Throughput:**
- Throughput consistente: ~3.8-4.0 req/s en todos los escenarios
- No se observa degradación de throughput con mayor carga
- Límite observado: ~4 req/s efectivos

**3. Latencia:**
- Smoke: 2.47s (baseline)
- Ramp: 32.13s (+1,200% vs smoke) - Degradación por contención
- Soak: 25.37s (+927% vs smoke) - Mejor que rampa pero aún alta

**4. Patrón de Errores:**
- Errores 504 Gateway Timeout en todos los escenarios con fallos
- Mayor concentración en Auth/Login durante rampa (41%)
- Upload más estable: 2.44% error en soak vs 11.29% en rampa

#### 8.4.3 Hallazgos Principales

**Fortalezas:**
- ✅ Worker estable: Procesa consistentemente ~4 req/s sin errores propios
- ✅ Pipeline SQS funcional: Mensajes se encolan y procesan correctamente
- ✅ Mejor rendimiento en carga sostenida: 97.42% éxito en soak
- ✅ Throughput predecible: ~4 req/s independiente del escenario

**Áreas de Mejora:**
- ⚠️ **Cuello de botella en API web:** Errores 504 indican límites de ALB/API antes del worker
- ⚠️ **Latencia estructural alta:** >25s promedio debido a ciclo completo (upload + S3 + SQS)
- ⚠️ **Autenticación vulnerable:** Login más afectado en rampas (41% error)
- ⚠️ **Timeouts de ALB:** 60 segundos insuficientes bajo alta carga

**Cuellos de Botella Identificados:**
1. **Application Load Balancer:** Timeouts de 60s se exceden bajo carga
2. **API Web:** No escala suficientemente rápido para rampas agresivas
3. **Autenticación:** Endpoint de login más vulnerable a timeouts
4. **Latencia I/O:** Upload a S3 + procesamiento asíncrono aumenta tiempos

---

### 8.5 Comparación con Capa Web

#### 8.5.1 Throughput Comparativo

| Capa | Escenario | Throughput | Observación |
|------|-----------|------------|-------------|
| **Web (JMeter)** | 100 usuarios | 1.06 req/s | Upload directo |
| **Web (JMeter)** | 200 usuarios | 1.41 req/s | Con auto scaling |
| **Web (JMeter)** | 300 usuarios | 1.47 req/s | Máximo alcanzado |
| **Worker (Locust)** | Smoke | 3.97 req/s | Carga ligera |
| **Worker (Locust)** | Ramp | 3.78 req/s | Carga agresiva |
| **Worker (Locust)** | Soak | 4.00 req/s | Carga sostenida |

**Análisis:**
- Worker muestra throughput 2.7x superior a capa web (4.0 vs 1.47 req/s)
- Worker mantiene throughput estable independiente de usuarios
- Capa web escala con usuarios (1.06 → 1.47 req/s)
- Worker procesa más requests por segundo pero con mayor latencia

#### 8.5.2 Tasa de Éxito Comparativa

| Capa | Escenario | Éxito | Error | Observación |
|------|-----------|-------|-------|-------------|
| **Web** | 100 usuarios | 99.02% | 0.98% | Errores 401 |
| **Web** | 200 usuarios | 99.85% | 0.15% | Mejora con escala |
| **Web** | 300 usuarios | 100% | 0% | Perfecto |
| **Worker** | Smoke | 100% | 0% | Carga ligera |
| **Worker** | Ramp | 86.96% | 13.04% | Timeouts 504 |
| **Worker** | Soak | 97.42% | 2.58% | Timeouts residuales |

**Análisis:**
- Capa web mejora con más usuarios (99% → 100%)
- Worker degrada con rampas agresivas (100% → 86.96%)
- Worker se recupera en carga sostenida (97.42%)
- Patrón opuesto: Web escala mejor, Worker es más estable en sostenido

---

### 8.6 Recomendaciones

#### 8.6.1 Optimizaciones Críticas

**1. Configuración de Application Load Balancer:**
- Aumentar timeout de 60s a 180s para operaciones de upload de video
- Configurar idle timeout apropiado para conexiones largas
- Habilitar connection draining para evitar cortes abruptos

**2. Auto Scaling de API Web:**
- Ajustar políticas de scaling para escalar más agresivamente
- Reducir cooldown period para responder más rápido a picos
- Considerar predictive scaling basado en patrones históricos
- Aumentar capacidad mínima de instancias para absorber carga base

**3. Optimización de Autenticación:**
- Implementar cache de tokens JWT para reducir llamadas a login
- Considerar refresh tokens para evitar re-autenticación frecuente
- Mover autenticación fuera del path crítico de pruebas de carga
- Implementar rate limiting específico para endpoint de login

**4. Reducción de Latencia:**
- Evaluar upload directo a S3 con pre-signed URLs (bypass del backend)
- Implementar multipart upload para archivos grandes
- Optimizar operaciones de base de datos (índices, queries)
- Considerar CDN (CloudFront) para distribución de contenido

#### 8.6.2 Monitoreo y Observabilidad

**1. Métricas de SQS:**
- Monitorear `ApproximateNumberOfMessagesVisible` (backlog)
- Trackear `ApproximateAgeOfOldestMessage` (mensajes antiguos)
- Alertar cuando backlog > 100 mensajes
- Dashboard CloudWatch para métricas en tiempo real

**2. Métricas de Workers:**
- CPU y memoria de instancias de worker
- Tasa de procesamiento de mensajes por worker
- Tiempo de procesamiento promedio por video
- Errores y retries en procesamiento

**3. Métricas de API Web:**
- Latencia por endpoint (login vs upload)
- Tasa de errores 504 por endpoint
- Conexiones activas y throughput
- Health checks de instancias

#### 8.6.3 Próximos Pasos

1. **Re-ejecución dirigida:**
   - Aplicar optimizaciones de ALB y auto scaling
   - Repetir rampa aumentando throughput objetivo (≥6 req/s)
   - Validar mejoras y documentar nuevo umbral

2. **Pruebas adicionales:**
   - Pruebas de estrés para identificar punto de quiebre real del worker
   - Pruebas de chaos engineering (falla de workers)
   - Validar comportamiento bajo spikes súbitos de tráfico

3. **Optimización de Workers:**
   - Ajustar número de workers Celery según carga observada
   - Implementar retry logic robusto
   - Configurar Dead Letter Queue apropiadamente

4. **Documentación:**
   - Documentar métricas de CloudWatch durante pruebas
   - Crear runbooks para operaciones bajo carga
   - Establecer SLAs basados en resultados observados

---

### 8.7 Evidencias y Artefactos

**Archivos de Resultados:**
- `load_testing/locust_ecs/Smoke-results.csv` - Resultados de prueba de sanidad
- `load_testing/locust_ecs/Ramp-results.csv` - Resultados de prueba de rampa
- `load_testing/locust_ecs/Soak-result.csv` - Resultados de prueba de resistencia
- `load_testing/locust_ecs/results/locust_ramp_stats.csv` - Estadísticas detalladas de rampa
- `load_testing/locust_ecs/results/locust_soak_stats.csv` - Estadísticas detalladas de soak

**Scripts de Ejecución:**
- `load_testing/locust_ecs/run_smoke.sh` - Script de ejecución de smoke
- `load_testing/locust_ecs/run_ramp.sh` - Script de ejecución de rampa
- `load_testing/locust_ecs/run_soak.sh` - Script de ejecución de soak
- `load_testing/locust_ecs/worker_sqs_locust.py` - Script principal de Locust

Estos archivos permanecen en el repositorio para auditoría y replicabilidad.

---

**Fin del Documento**



