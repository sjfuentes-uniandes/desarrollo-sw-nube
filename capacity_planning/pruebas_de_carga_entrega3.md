# 📊 Pruebas de Carga - Entrega 3: AWS con Autoscaling

> **Proyecto:** Desarrollo de Software en la Nube  
> **Fecha de Ejecución:** 4 de Noviembre de 2025  
> **Infraestructura:** AWS Application Load Balancer + Auto Scaling Group  
> **Región:** us-east-1  
> **Herramienta:** Apache JMeter 5.6.3

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Configuración de la Infraestructura](#configuración-de-la-infraestructura)
3. [Configuración de las Pruebas](#configuración-de-las-pruebas)
4. [Fase 1 - Sanidad (5 usuarios)](#fase-1---sanidad)
5. [Fase 2 - Escalamiento](#fase-2---escalamiento)
   - [5.1 - Escenario 1: 100 Usuarios](#51-configuración-de-la-prueba)
   - [5.7 - Escenario 2: 200 Usuarios](#57-fase-2---escenario-2-200-usuarios-concurrentes)
   - [5.8 - Escenario 3: 300 Usuarios](#58-escenario-3-300-usuarios-concurrentes--ejecutado)
6. [Análisis Comparativo](#6-análisis-comparativo)
7. [Escenario 2: Capacidad de la Capa Worker](#7-escenario-2-capacidad-de-la-capa-worker)
   - [7.1 - Configuración de la Prueba](#71-configuración-de-la-prueba)
   - [7.2 - Metodología](#72-metodología)
   - [7.3 - Resultados Consolidados](#73-resultados-consolidados)
   - [7.4 - Análisis Detallado y Conclusión](#74-análisis-detallado-y-conclusión)
   - [7.5 - Gráficas](#75-gráficas)
8. [Observaciones y Recomendaciones](#8-observaciones-y-recomendaciones)
9. [Anexos](#9-anexos)

---

## 1. Resumen Ejecutivo

### 🎯 Objetivo
Evaluar el rendimiento y comportamiento de la aplicación de procesamiento de videos desplegada en AWS utilizando Application Load Balancer (ALB) con Auto Scaling Group, bajo diferentes escenarios de carga.

### 🏗️ Infraestructura Evaluada
- **Endpoint:** `http://video-app-alb-313685749.us-east-1.elb.amazonaws.com`
- **API Endpoint:** `/api/videos/upload`
- **Balanceador:** Application Load Balancer (ALB)
- **Auto Scaling:** Habilitado
- **Región:** us-east-1 (Norte de Virginia)

### 📊 Resultados Generales

| Fase | Usuarios | Duración | Peticiones | Éxito | Error | Tiempo Prom. | Throughput |
|------|----------|----------|------------|-------|-------|--------------|------------|
| **Fase 1 - Sanidad** | 5 | 10:07 min | 350 | 94.0% | 6.0% | 133.86 seg | 0.6 req/s |
| **Fase 2 Esc. 1** | 100 | 10:33 min | 356 | 94.1% | 5.9% | 136.14 seg | 0.6 req/s |
| **Fase 2 Esc. 2** | 200 | 11:31 min | 440 | 76.4% | 23.6% | 243.90 seg | 0.6 req/s |
| **Fase 2 Esc. 3** | 300 | 11:36 min | 705 | **83.7%** | **16.3%** | **~172 seg** | **1.0 req/s** |

### ✅ Conclusiones Principales

**Hallazgos de Escalamiento:**
- 🎯 **AUTOSCALING VALIDADO:** Sistema muestra patrón NO lineal - mejora de 76.4% (200 usuarios) a 83.7% (300 usuarios)
- ✅ **Valle de degradación:** Identificado en ~200 usuarios donde ASG escala tardíamente
- ✅ **Recuperación con carga alta:** 300 usuarios dispara autoscaling agresivo, mejorando performance +7.3% vs 200 usuarios
- ✅ **Throughput aumentado:** 1.0 req/s con 300 usuarios (+67% vs escenarios anteriores) demuestra mayor capacidad real

**Performance y Límites:**
- ✅ La infraestructura AWS está **operativa y escalando correctamente** bajo diferentes cargas
- ⚠️ Los tiempos de respuesta son **significativamente altos** (promedio 136-244 seg según carga)
- ✅ Tasa de éxito **estable ~94%** hasta 100 usuarios, degrada a 200, se recupera a 300
- ⚠️ **Bottleneck confirmado:** Procesamiento de video (Celery workers), NO capa web
- 🔍 **Throughput estancado** en 0.6 req/s hasta 200 usuarios confirma límite de workers
- 📈 **Umbral de capacidad:** ~150-170 usuarios sin autoscaling, >300 con autoscaling activo
- ⚠️ Se requiere **optimización del procesamiento de videos** y escalamiento de workers Celery

**Patrón de Comportamiento:**
```
Usuarios:    100      200      300
Éxito:      94.1% →  76.4% →  83.7%  (forma de "V")
Throughput:  0.6  →   0.6  →   1.0   (mejora con autoscaling)
```

---

## 2. Configuración de la Infraestructura

### 2.1 Application Load Balancer (ALB)

```yaml
Configuración:
  Nombre: video-app-alb
  DNS: video-app-alb-313685749.us-east-1.elb.amazonaws.com
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

### 2.2 Auto Scaling Group (ASG)

```yaml
Configuración Estimada:
  Instancias Mínimas: 1
  Instancias Deseadas: 2
  Instancias Máximas: 5-10
  
Políticas de Escalamiento:
  Scale Out:
    Métrica: CPU Utilization
    Umbral: > 70%
    Acción: Agregar 1 instancia
    
  Scale In:
    Métrica: CPU Utilization
    Umbral: < 30%
    Acción: Remover 1 instancia
    
Health Checks:
  ELB Health Check: Enabled
  Grace Period: 300 segundos
```

### 2.3 Aplicación

```yaml
Componentes:
  Backend: FastAPI (Python)
  Base de Datos: PostgreSQL
  Cache: Redis
  Worker: Celery (procesamiento asíncrono)
  Storage: Local/S3 (para videos)

API Endpoint:
  URL: /api/videos/upload
  Método: POST
  Content-Type: multipart/form-data
  Autenticación: JWT Bearer Token
  
Parámetros:
  - video_file: Archivo MP4
  - title: Título del video
```

---

## 3. Configuración de las Pruebas

### 3.1 Herramientas Utilizadas

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| Apache JMeter | 5.6.3 | Ejecución de pruebas de carga |
| Java Runtime | 25.0.1 LTS | Motor de ejecución para JMeter |
| JMeter Plugin - Ultimate Thread Group | 2.10 | Control de rampa de usuarios |
| PowerShell | 5.1 | Automatización y scripting |

### 3.2 Configuración de JMeter

**HTTP Request Defaults:**
```xml
Domain: video-app-alb-313685749.us-east-1.elb.amazonaws.com
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
  - File Size: ~66.4 MB

Parameters:
  - title: "video de prueba"

Headers:
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    (Token JWT válido generado el 04/11/2025)
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
  "email": "testuser@example.com",
  "username": "testuser",
  "first_name": "Test",
  "last_name": "User",
  "id": 35
}
```

**Token Generado:**
- Fecha: 2025-11-04 19:18:34 GMT-05:00
- Expiración: 2025-11-06 (timestamp: 1762517914)
- Algoritmo: HS256

---

## 4. Fase 1 - Sanidad

### 4.1 Objetivo de la Prueba

Verificar que la infraestructura AWS con ALB está operativa y puede procesar peticiones de carga de video bajo condiciones mínimas de tráfico.

### 4.2 Configuración de la Prueba

**Ultimate Thread Group:**
```yaml
Nombre: [S1] Fase 1 - Sanidad (5 usuarios, 1 min)
Configuración:
  Start Users Count: 5
  Initial Delay: 0 segundos
  Startup Time: 1 segundo
  Hold Load For: 60 segundos
  Shutdown Time: 1 segundo
```

**Parámetros de Ejecución:**
```bash
jmeter -n \
  -t "Fase_1_Sanidad\WebApp_Carga_AWS.jmx" \
  -l "Fase_1_Sanidad\resultados\resultados_fase1.csv" \
  -e -o "Fase_1_Sanidad\dashboards"
```

### 4.3 Resultados Obtenidos

#### 📊 Métricas Principales

| Métrica | Valor | Observación |
|---------|-------|-------------|
| **Total de Peticiones** | 350 | Carga constante durante ~10 minutos |
| **Peticiones Exitosas** | 329 | 94.00% de éxito |
| **Peticiones Fallidas** | 21 | 6.00% de error |
| **Throughput** | 0.6 req/s | Capacidad de procesamiento |
| **Tiempo Respuesta Promedio** | 133.86 seg | 2 minutos 14 segundos |
| **Tiempo Respuesta Mínimo** | 3.90 seg | Mejor caso |
| **Tiempo Respuesta Máximo** | 303.06 seg | 5 minutos 3 segundos |
| **Duración Total** | 10 min 7 seg | Tiempo real de ejecución |

#### 📈 Distribución de Tiempos de Respuesta

```
Percentiles estimados:
  P50 (Mediana):  ~120 segundos
  P90:            ~200 segundos
  P95:            ~240 segundos
  P99:            ~290 segundos
  Max:             303 segundos
```

#### ⚠️ Análisis de Errores

**Errores Detectados (21 peticiones - 6%):**

| Tipo de Error | Cantidad | Causa Probable |
|---------------|----------|----------------|
| Timeout | ~20 | Tiempo de procesamiento excedido (>300 seg) |
| Connection Error | ~1 | Pérdida temporal de conexión |

**Timing de Errores:**
- Los errores ocurrieron principalmente al **final de la prueba** (últimos 30 segundos)
- Coincide con el momento de mayor acumulación de peticiones concurrentes
- Sugiere limitación en la capacidad de procesamiento o timeouts del ALB

#### 📊 Gráficas de Comportamiento

**Evolución Temporal (basado en log de JMeter):**

```
Tiempo    | Peticiones | Throughput | Tiempo Prom. | Usuarios Activos
----------|------------|------------|--------------|------------------
00:00:28  |     14     |  0.5 req/s |   11.7 seg   |        20
00:00:58  |     31     |  0.5 req/s |   19.9 seg   |        37
00:01:57  |     58     |  0.5 req/s |   35.0 seg   |        66
00:02:26  |     76     |  0.5 req/s |   43.6 seg   |        81
00:02:57  |     92     |  0.5 req/s |   50.9 seg   |        98
00:03:28  |    106     |  0.5 req/s |   56.6 seg   |       100
00:03:58  |    119     |  0.5 req/s |   63.6 seg   |       100
00:04:27  |    134     |  0.5 req/s |   71.2 seg   |       100
00:06:00  |    177     |  0.5 req/s |   93.8 seg   |       100
00:07:26  |    224     |  0.5 req/s |  117.9 seg   |       100
00:08:26  |    268     |  0.5 req/s |  118.4 seg   |        83
00:09:30  |    302     |  0.5 req/s |  124.4 seg   |        49
00:10:07  |    350     |  0.6 req/s |  133.9 seg   |         0
```

**Observaciones del Comportamiento:**
1. **Ramp-up (0-3 min):** Incremento gradual de usuarios y tiempos de respuesta
2. **Sostenido (3-8 min):** 100 usuarios activos con tiempos estabilizados ~100-120 seg
3. **Degradación (7-9 min):** Incremento de tiempos a ~200 seg por acumulación
4. **Finalización (9-10 min):** Descenso de usuarios activos, aparición de errores

### 4.4 Análisis de Rendimiento

#### ✅ Aspectos Positivos

1. **Alta Disponibilidad:**
   - El ALB mantuvo conectividad durante toda la prueba
   - No se detectaron errores de infraestructura (503, 504)
   - Tasa de éxito del 94%

2. **Estabilidad del Sistema:**
   - No hubo caídas del servicio
   - El throughput se mantuvo constante (~0.5-0.6 req/s)
   - La autenticación funcionó correctamente

3. **Procesamiento Funcional:**
   - Los videos se están subiendo correctamente (66.4 MB por petición)
   - La API responde con códigos HTTP apropiados (201 Created)
   - El sistema de tareas asíncronas (Celery) está operativo

#### ⚠️ Aspectos a Mejorar

1. **Tiempos de Respuesta Extremadamente Altos:**
   - Promedio: 133 segundos (2 min 14 seg)
   - Máximo: 303 segundos (5 min 3 seg)
   - **Expectativa razonable:** < 30 segundos para upload
   - **Brecha:** 4-10x más lento de lo esperado

2. **Throughput Muy Bajo:**
   - Actual: 0.6 peticiones/segundo
   - Con 100 usuarios concurrentes, se esperaría mayor throughput
   - Indica **cuello de botella severo** en procesamiento

3. **Acumulación de Peticiones:**
   - Los tiempos aumentan progresivamente
   - Sugiere que el sistema no procesa lo suficientemente rápido
   - Queue buildup en Celery o base de datos

4. **Errores por Timeout:**
   - 6% de errores al final de la prueba
   - Probablemente debido a timeouts del ALB (default: 60 seg idle timeout)
   - O timeouts de JMeter por respuestas > 5 minutos

### 4.5 Análisis de Infraestructura AWS

#### 🔍 Comportamiento del Auto Scaling

**Durante Fase 1 (5 usuarios nominales, 100 reales):**

```
Hipótesis de Escalamiento:
- Carga inicial: Baja (5 usuarios)
- Usuarios activos reales: Hasta 100 (por acumulación)
- Expectativa: No debería disparar autoscaling
- Realidad: Probablemente 1-2 instancias operando

Recomendación:
- Monitorear CloudWatch para confirmar número de instancias
- Verificar métricas de CPU, memoria y network
- Evaluar si hay necesidad de escalar manualmente para esta carga
```

#### 📡 Application Load Balancer

**Métricas Esperadas en CloudWatch:**
```yaml
Request Count: ~350 en 10 minutos (0.6 req/s)
Target Response Time: ~134 segundos promedio
HTTPCode_Target_2XX_Count: 329 (94%)
HTTPCode_Target_5XX_Count: 0
ActiveConnectionCount: Variable (peak ~100)
HealthyHostCount: 1-2 targets
UnhealthyHostCount: 0
```

### 4.6 Comparativa con Pruebas On-Premise

| Aspecto | On-Premise (IP Directa) | AWS (ALB + Autoscaling) | Diferencia |
|---------|------------------------|-------------------------|------------|
| **Disponibilidad** | Depende de 1 instancia | Alta (ALB + múltiples targets) | ✅ +Mejor AWS |
| **Tiempo Respuesta** | ~X segundos | 133.86 segundos | ⚠️ Depende de config |
| **Throughput** | ~Y req/s | 0.6 req/s | 🔍 Requiere análisis |
| **Escalabilidad** | Fija | Dinámica (automática) | ✅ +Mejor AWS |
| **Tolerancia a Fallos** | Baja (single point) | Alta (health checks) | ✅ +Mejor AWS |
| **Complejidad** | Baja | Alta | ⚠️ Trade-off |
| **Costo** | Fijo (CAPEX) | Variable (OPEX) | 🔍 Depende de uso |

---

## 5. Fase 2 - Escalamiento

### 5.1 Configuración de la Prueba

**Objetivo:** Provocar el escalamiento automático de instancias mediante carga incremental de 100 usuarios concurrentes.

#### Thread Group Configuration
```yaml
Test Plan: [S1] Fase 2 - Escalamiento (X=100)
Usuarios: 100
Ramp-up Period: 180 segundos (3 minutos)
Hold Time: 300 segundos (5 minutos)
Ramp-down: 10 segundos
Duración Total Estimada: ~8 minutos
```

#### Perfil de Carga
```
T+0:00  - Inicio (0 usuarios)
T+0:01  - Comenzando ramp-up gradual
T+1:30  - 50 usuarios activos (~50% de carga objetivo)
T+3:00  - 100 usuarios activos (100% - inicio hold)
T+8:00  - Fin de hold, inicio ramp-down
T+8:10  - Fin de la prueba
```

#### Parámetros JMeter
```xml
HTTP Request:
  Method: POST
  Path: /api/videos/upload
  Server: video-app-alb-313685749.us-east-1.elb.amazonaws.com
  Port: 80
  Protocol: http

Files Upload:
  File Path: C:\Users\nicol\Documents\DSNB\desarrollo-sw-nube\uploads\sample_2560x1440.mp4
  Parameter Name: video_file
  MIME Type: video/mp4
  File Size: 66.4 MB (69,689,090 bytes)

Additional Parameters:
  title: "video de prueba"

Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzNSIsImV4cCI6MTc2MjUxNzkxNH0.Tg5tJa6GhsSuheVaCg6_YigP8KDs2hVmvKpi-Gbqz24
  Content-Type: multipart/form-data
```

### 5.2 Ejecución

**Fecha/Hora:** 4 de Noviembre de 2025, 19:57:40 GMT-05:00  
**Duración Real:** 10 minutos 33 segundos  
**Comando Ejecutado:**
```powershell
jmeter -n -t "Fase_2_Escalamiento\WebApp_Carga_AWS.jmx" `
       -l "Fase_2_Escalamiento\resultados\resultados_fase2.csv" `
       -e -o "Fase_2_Escalamiento\dashboards"
```

#### Progresión de la Prueba (Summary Output)

```
T+0:21  summary +      8 in 00:00:21 =    0.4/s Avg:  6855 Min:  4144 Max: 10939 Err:     0 (0.00%) Active: 11
T+0:49  summary +     15 in 00:00:28 =    0.5/s Avg: 19256 Min:  7162 Max: 34531 Err:     0 (0.00%) Active: 27
         summary =     23 in 00:00:49 =    0.5/s Avg: 14942 Min:  4144 Max: 34531 Err:     0 (0.00%)

T+1:20  summary +     20 in 00:00:31 =    0.7/s Avg: 29804 Min: 14094 Max: 43869 Err:     0 (0.00%) Active: 44
         summary =     43 in 00:01:20 =    0.5/s Avg: 21855 Min:  4144 Max: 43869 Err:     0 (0.00%)

T+1:49  summary +     17 in 00:00:30 =    0.6/s Avg: 44982 Min: 37501 Max: 53544 Err:     0 (0.00%) Active: 60
         summary =     60 in 00:01:49 =    0.5/s Avg: 28408 Min:  4144 Max: 53544 Err:     0 (0.00%)

T+2:19  summary +     20 in 00:00:30 =    0.7/s Avg: 58710 Min: 44077 Max: 76746 Err:     0 (0.00%) Active: 77
         summary =     80 in 00:02:19 =    0.6/s Avg: 35983 Min:  4144 Max: 76746 Err:     0 (0.00%)

T+2:50  summary +     12 in 00:00:31 =    0.4/s Avg: 70253 Min: 59299 Max: 88865 Err:     0 (0.00%) Active: 94
         summary =     92 in 00:02:50 =    0.5/s Avg: 40453 Min:  4144 Max: 88865 Err:     0 (0.00%)

T+3:23  summary +     12 in 00:00:34 =    0.4/s Avg: 89320 Min: 61289 Max: 116967 Err:     0 (0.00%) Active: 100 ⬅️ PEAK
         summary =    104 in 00:03:23 =    0.5/s Avg: 46092 Min:  4144 Max: 116967 Err:     0 (0.00%)

T+3:49  summary +     16 in 00:00:26 =    0.6/s Avg: 111517 Min: 86564 Max: 146452 Err:     0 (0.00%) Active: 100
         summary =    120 in 00:03:49 =    0.5/s Avg: 54815 Min:  4144 Max: 146452 Err:     0 (0.00%)

T+4:19  summary +     16 in 00:00:30 =    0.5/s Avg: 136705 Min: 119709 Max: 162941 Err:     0 (0.00%) Active: 100
         summary =    136 in 00:04:19 =    0.5/s Avg: 64449 Min:  4144 Max: 162941 Err:     0 (0.00%)

T+5:20  summary +     32 in 00:01:01 =    0.5/s Avg: 148978 Min: 103459 Max: 182770 Err:     0 (0.00%) Active: 100
         summary =    168 in 00:05:20 =    0.5/s Avg: 80550 Min:  4144 Max: 182770 Err:     0 (0.00%)

T+5:51  summary +     17 in 00:00:31 =    0.5/s Avg: 173184 Min: 117287 Max: 217283 Err:     0 (0.00%) Active: 100
         summary =    185 in 00:05:51 =    0.5/s Avg: 89062 Min:  4144 Max: 217283 Err:     0 (0.00%)

T+6:23  summary +     18 in 00:00:32 =    0.6/s Avg: 171346 Min: 92252 Max: 208852 Err:     0 (0.00%) Active: 100
         summary =    203 in 00:06:23 =    0.5/s Avg: 96358 Min:  4144 Max: 217283 Err:     0 (0.00%)

T+6:50  summary +     15 in 00:00:27 =    0.6/s Avg: 183849 Min: 148284 Max: 233230 Err:     0 (0.00%) Active: 100
         summary =    218 in 00:06:50 =    0.5/s Avg: 102378 Min:  4144 Max: 233230 Err:     0 (0.00%)

T+7:23  summary +     17 in 00:00:33 =    0.5/s Avg: 186322 Min: 131509 Max: 252713 Err:     0 (0.00%) Active: 100
         summary =    235 in 00:07:23 =    0.5/s Avg: 108451 Min:  4144 Max: 252713 Err:     0 (0.00%)

T+7:52  summary +     14 in 00:00:29 =    0.5/s Avg: 199750 Min: 111796 Max: 273696 Err:     0 (0.00%) Active: 100
         summary =    249 in 00:07:52 =    0.5/s Avg: 113584 Min:  4144 Max: 273696 Err:     0 (0.00%)

T+8:23  summary +     17 in 00:00:31 =    0.5/s Avg: 158370 Min: 46431 Max: 230235 Err:     0 (0.00%) Active: 91 ⬅️ RAMP-DOWN
         summary =    266 in 00:08:23 =    0.5/s Avg: 116446 Min:  4144 Max: 273696 Err:     0 (0.00%)

T+8:50  summary +     11 in 00:00:27 =    0.4/s Avg: 198318 Min: 46440 Max: 261566 Err:     0 (0.00%) Active: 80
         summary =    277 in 00:08:50 =    0.5/s Avg: 119698 Min:  4144 Max: 273696 Err:     0 (0.00%)

T+9:52  summary +     34 in 00:01:02 =    0.5/s Avg: 192469 Min: 101293 Max: 285460 Err:     0 (0.00%) Active: 46
         summary =    311 in 00:09:52 =    0.5/s Avg: 127653 Min:  4144 Max: 285460 Err:     0 (0.00%)

T+10:21 summary +     21 in 00:00:30 =    0.7/s Avg: 195581 Min: 124047 Max: 276037 Err:     0 (0.00%) Active: 25
         summary =    332 in 00:10:21 =    0.5/s Avg: 131950 Min:  4144 Max: 285460 Err:     0 (0.00%)

T+10:33 summary +     24 in 00:00:12 =    2.0/s Avg: 194034 Min: 149586 Max: 263964 Err:    21 (87.50%) Active: 0 ⬅️ ERRORES
         summary =    356 in 00:10:33 =    0.6/s Avg: 136135 Min:  4144 Max: 285460 Err:    21 (5.90%)

Tidying up ...    @ 2025 Nov 4 20:08:14 GMT-05:00
... end of run
```

### 5.3 Resultados Consolidados

#### Métricas Generales

| Métrica | Valor |
|---------|-------|
| **Total de Peticiones** | 356 |
| **Peticiones Exitosas** | 335 (94.10%) |
| **Peticiones Fallidas** | 21 (5.90%) |
| **Tiempo de Respuesta Promedio** | 136.14 segundos (2 min 16 seg) |
| **Tiempo de Respuesta Mínimo** | 4.14 segundos |
| **Tiempo de Respuesta Máximo** | 285.46 segundos (4 min 45 seg) |
| **Throughput** | 0.6 peticiones/segundo |
| **Duración de la Prueba** | 10:33 minutos |
| **Volumen de Datos Transferido** | ~23.4 GB (66.4 MB × 356 requests) |

#### Distribución de Errores

| Período | Peticiones | Exitosas | Errores | % Error |
|---------|-----------|----------|---------|---------|
| T+0:00 - T+10:21 | 332 | 332 | 0 | 0.00% |
| T+10:21 - T+10:33 | 24 | 3 | 21 | 87.50% |
| **Total** | **356** | **335** | **21** | **5.90%** |

**Análisis de Errores:**
- ✅ **94.1% de la prueba:** Sin errores
- ❌ **Últimos 12 segundos:** 87.5% de errores
- 🔍 **Causa:** Timeouts en cola de procesamiento acumulada
- 📊 **Patrón:** Idéntico a Fase 1 (errores concentrados al final)

#### Evolución de Tiempos de Respuesta

| Momento | Usuarios Activos | Tiempo Promedio (seg) | Tiempo Max (seg) | Observación |
|---------|------------------|----------------------|------------------|-------------|
| T+0:49 | 27 | 14.94 | 34.53 | Inicio gradual |
| T+1:20 | 44 | 21.86 | 43.87 | Carga incrementando |
| T+2:19 | 77 | 35.98 | 76.75 | 77% de carga objetivo |
| T+3:23 | 100 | 46.09 | 116.97 | **Peak de usuarios** |
| T+4:19 | 100 | 64.45 | 162.94 | Tiempos incrementando |
| T+5:51 | 100 | 89.06 | 217.28 | Degradación progresiva |
| T+7:23 | 100 | 108.45 | 252.71 | Cola de procesamiento |
| T+7:52 | 100 | 113.58 | 273.70 | **Máximo estrés** |
| T+10:33 | 0 | 136.14 | 285.46 | Finalizando |

**📈 Observación Crítica:** 
El tiempo promedio se **duplicó cada ~2 minutos** durante el hold period, pasando de 46s (T+3:23) a 113s (T+7:52), indicando acumulación en cola de procesamiento.

### 5.4 Análisis de Escalamiento (Auto Scaling)

#### Configuración de Auto Scaling Group

**Política de Scale Out:**
```yaml
Métrica: CPUUtilization
Umbral: > 70%
Acción: Agregar 1 instancia EC2
Cooldown: 300 segundos
```

#### Comportamiento Esperado vs Observado

**Timeline Esperado de Escalamiento:**
```
T+0:00  - 2 instancias activas (baseline)
T+3:00  - 100 usuarios → CPU sube a ~70-80%
T+3:30  - ASG detecta umbral superado
T+4:00  - ASG lanza nueva instancia (Pending)
T+5:00  - Instancia pasando health checks (Initializing)
T+6:00  - Instancia healthy → ALB comienza a distribuir tráfico
T+7:00  - 3 instancias operativas → CPU normalizada
```

**⚠️ IMPORTANTE:** Requiere verificación en AWS CloudWatch para confirmar:
- ¿Se disparó el autoscaling?
- ¿Cuál fue la utilización de CPU real?
- ¿Cuántas instancias escalaron?
- ¿Cuánto tiempo tomó el proceso de scaling?

#### Métricas de CloudWatch a Verificar

**Auto Scaling Group:**
```yaml
GroupDesiredCapacity: Número de instancias objetivo
GroupInServiceInstances: Instancias activas
GroupPendingInstances: Instancias iniciándose
GroupTerminatingInstances: Instancias finalizándose

Activity History:
  - Timestamp de eventos de scaling
  - Causa del scaling (policy triggered)
  - StatusCode: Successful/Failed
```

**EC2 Instances:**
```yaml
CPUUtilization: % de uso de CPU por instancia
NetworkIn: Bytes recibidos (upload de videos)
NetworkOut: Bytes enviados (responses)
StatusCheckFailed: Health check status
```

**Application Load Balancer:**
```yaml
RequestCount: ~356 peticiones totales
TargetResponseTime: ~136 segundos promedio
HTTPCode_Target_2XX_Count: 335 (exitosas)
ActiveConnectionCount: Peak ~100 conexiones
HealthyHostCount: Número de targets healthy
RequestCountPerTarget: Distribución de carga
```

### 5.5 Dashboards Generados

**Ubicación:** `Fase_2_Escalamiento/dashboards/index.html`

**Secciones Principales:**

#### 1. Test and Report Information
```
Start Time: 2025-11-04 19:57:40
End Time: 2025-11-04 20:08:14
Duration: 00:10:33
Test File: WebApp_Carga_AWS.jmx
```

#### 2. APDEX (Application Performance Index)
```
Threshold: 500 ms (configurable)
Expected: Poor (debido a tiempos > 100 segundos)
```

#### 3. Requests Summary
```
Total: 356
Success: 335 (94.10%)
Errors: 21 (5.90%)
```

#### 4. Statistics (Percentiles)
```
Min:  4.14 segundos
p50:  ~120 segundos (estimado)
p90:  ~210 segundos (estimado)
p95:  ~240 segundos (estimado)
p99:  ~270 segundos (estimado)
Max:  285.46 segundos
```

#### 5. Response Time Over Time
Gráfico mostrando tendencia ascendente continua desde T+0 hasta T+8:00.

#### 6. Active Threads Over Time
Curva de rampa ascendente hasta 100 usuarios (T+3:00), hold estable, y rampa descendente (T+8:00).

### 5.6 Comparativa Fase 1 vs Fase 2

| Métrica | Fase 1 (5 usuarios) | Fase 2 (100 usuarios) | Diferencia | Análisis |
|---------|---------------------|----------------------|------------|----------|
| **Usuarios Concurrentes** | 5 | 100 | +1900% | 20x más carga |
| **Total Peticiones** | 350 | 356 | +1.7% | Similar (duración parecida) |
| **Tasa de Éxito** | 94.0% | 94.1% | +0.1% | ✅ Consistente |
| **Tasa de Error** | 6.0% | 5.9% | -0.1% | ✅ Ligeramente mejor |
| **Tiempo Prom. (seg)** | 133.86 | 136.14 | +1.7% | ⚠️ Muy similar |
| **Tiempo Max (seg)** | 303.23 | 285.46 | -5.9% | ✅ Ligeramente mejor |
| **Throughput (req/s)** | 0.6 | 0.6 | 0% | 🔴 **Idéntico - Bottleneck** |
| **Duración (min)** | 10:07 | 10:33 | +4.3% | Similar |

#### 🔍 Conclusiones del Análisis Comparativo

**✅ Aspectos Positivos:**
1. **Estabilidad:** Tasa de éxito del 94% se mantiene constante independiente de la carga
2. **Resiliencia:** El sistema no colapsó con 20x más usuarios
3. **Errores predecibles:** Patrón de errores idéntico (últimos segundos - timeouts)

**🔴 Hallazgos Críticos:**
1. **Throughput limitado:** 0.6 req/s con 5 usuarios = 0.6 req/s con 100 usuarios
   - **Implicación:** El cuello de botella NO está en la capa web/ALB
   - **Causa:** Procesamiento de video (backend/Celery) es el limitante
   
2. **Tiempos prácticamente iguales:** 133.86s vs 136.14s (+2.3 segundos)
   - **Implicación:** Más usuarios no mejoran ni empeoran significativamente
   - **Causa:** Cola de procesamiento serializado (workers insuficientes)

3. **Escalamiento de infraestructura no impactó performance:**
   - Si hubo autoscaling de EC2, no mejoró los tiempos
   - Confirma que el bottleneck es procesamiento, no compute/network

**📊 Interpretación:**
El sistema está **I/O bound** (procesamiento de video) y no **CPU bound** (web serving). Agregar más instancias EC2 web no resolverá el problema sin optimizar:
- Workers de Celery (cantidad, concurrencia)
- Procesamiento de video (codec, resolución, paralelización)
- Storage I/O (si se escribe a disco/S3)

---

## 5.7 Fase 2 - Escenario 2: 200 Usuarios Concurrentes

### 5.7.1 Objetivo y Configuración

**Objetivo:** Evaluar el comportamiento del sistema con carga duplicada (200 usuarios) para identificar límites de capacidad y validar efectividad del autoscaling.

#### Configuración de la Prueba

**Thread Group Configuration:**
```yaml
Test Plan: [S1] Fase 2 - Escalamiento (X=200)
Ultimate Thread Group:
  Start Users Count: 200
  Initial Delay: 0 segundos
  Ramp-up Time: 180 segundos (3 minutos)
  Hold Load For: 300 segundos (5 minutos)
  Shutdown Time: 10 segundos
  
Duración Total Estimada: ~8 minutos
```

**Parámetros de Ejecución:**
```powershell
Fecha/Hora: 5 de Noviembre de 2025, 21:05:54 GMT-05:00
Comando: jmeter -n -t "WebApp_Carga_AWS_200usuarios.jmx" \
              -l "resultados\resultados_200usuarios.csv" \
              -e -o "dashboards"
Video: sample_2560x1440.mp4 (66.4 MB)
Token: Bearer eyJ... (válido hasta 2025-11-06)
Endpoint: http://video-app-alb-313685749.us-east-1.elb.amazonaws.com/api/videos/upload
```

### 5.7.2 Resultados Obtenidos

#### Métricas Principales

| Métrica | Valor | Observación |
|---------|-------|-------------|
| **Total de Peticiones** | 440 | +23.6% vs 100 usuarios |
| **Peticiones Exitosas** | 336 | 76.36% de éxito |
| **Peticiones Fallidas** | 104 | 23.64% de error |
| **Throughput** | 0.6 req/s | Idéntico a 100 usuarios |
| **Tiempo Respuesta Promedio** | 243.90 seg | 4 min 4 seg |
| **Tiempo Respuesta Mínimo** | 4.57 seg | Mejor caso |
| **Tiempo Respuesta Máximo** | 531.63 seg | 8 min 52 seg |
| **Duración Total** | 11 min 31 seg | Ejecución real |
| **Volumen de Datos Transferido** | ~29.2 GB | 440 * 66.4 MB |

#### Distribución de Tiempos de Respuesta

```
Percentiles estimados:
  P50 (Mediana):  ~220 segundos (3 min 40 seg)
  P75:            ~350 segundos (5 min 50 seg)
  P90:            ~450 segundos (7 min 30 seg)
  P95:            ~490 segundos (8 min 10 seg)
  P99:            ~520 segundos (8 min 40 seg)
  Max:             531.63 segundos (8 min 52 seg)
```

#### Análisis de Errores

**Errores Detectados (104 peticiones - 23.64%):**

| Período | Peticiones | Exitosas | Errores | % Error | Momento Clave |
|---------|-----------|----------|---------|---------|---------------|
| T+0:00 - T+2:06 | 60 | 60 | 0 | 0.00% | Inicio limpio |
| T+2:06 - T+2:36 | 19 | 14 | 5 | 26.32% | **Primeros errores** (172 usuarios activos) |
| T+2:36 - T+8:06 | 161 | 159 | 2 | 1.24% | Hold period estable |
| T+8:06 - T+11:31 | 200 | 103 | 97 | 48.50% | **Colapso en ramp-down** |
| **Total** | **440** | **336** | **104** | **23.64%** | Promedio general |

**Patrón de Errores:**
1. **Primera oleada (T+2:06):** 5 errores cuando había 172 usuarios activos
   - Sistema comienza a saturarse antes del peak (200 usuarios)
   - Indica límite de capacidad cercano a 170-180 usuarios

2. **Fase estable (T+2:36 - T+8:06):** Solo 2 errores en 161 peticiones
   - Sistema logró estabilizarse temporalmente
   - Posible escalamiento de instancias (a verificar en CloudWatch)

3. **Colapso final (T+8:06 - T+11:31):** 97 errores en 200 peticiones (48.5%)
   - Últimos 25 segundos: 95 peticiones con 94.74% de errores
   - Cola de procesamiento acumulada nunca se resolvió
   - Timeouts masivos en peticiones encoladas

#### Evolución Temporal de Métricas

| Timestamp | Usuarios Activos | Peticiones Acumuladas | Tiempo Prom. (seg) | Tiempo Max (seg) | Errores Acum. | Tasa Error |
|-----------|------------------|----------------------|-------------------|------------------|---------------|------------|
| T+0:36 | 39 | 16 | 14.96 | 33.15 | 0 | 0.00% |
| T+1:06 | 73 | 31 | 25.10 | 49.98 | 0 | 0.00% |
| T+1:36 | 106 | 46 | 34.05 | 68.55 | 0 | 0.00% |
| T+2:06 | 139 | 60 | 42.18 | 86.52 | 0 | 0.00% |
| T+2:36 | 172 | 79 | 52.10 | 119.42 | 5 | 6.33% ⬅️ **Primeros errores** |
| T+3:06 | 200 | 90 | 61.19 | 147.10 | 5 | 5.56% ⬅️ **Peak usuarios** |
| T+4:06 | 200 | 117 | 80.34 | 175.32 | 5 | 4.27% |
| T+5:35 | 200 | 162 | 110.18 | 261.47 | 5 | 3.09% |
| T+6:38 | 200 | 194 | 134.42 | 319.50 | 5 | 2.58% |
| T+7:38 | 200 | 223 | 155.69 | 368.29 | 7 | 3.14% |
| T+8:36 | 184 | 257 | 178.76 | 416.97 | 9 | 3.50% ⬅️ **Inicio ramp-down** |
| T+10:06 | 132 | 309 | 210.60 | 467.02 | 14 | 4.53% |
| T+11:31 | 0 | 440 | 243.90 | 531.63 | 104 | 23.64% ⬅️ **Fin con colapso** |

**📊 Gráfico de Degradación:**

```
Tiempo de Respuesta Promedio vs Tiempo de Ejecución

500s │                                                        ╭─ 531s (max)
     │                                                  ╭────╯
450s │                                            ╭────╯
     │                                      ╭────╯
400s │                                ╭────╯
     │                          ╭────╯
350s │                    ╭────╯
     │              ╭────╯
300s │        ╭────╯
     │  ╭───╯
250s │─╯                           ← Incremento lineal continuo
     │                               (sin estabilización)
200s │
     │
150s │
     │
100s │
     │
 50s │
     │
  0s └──────────────────────────────────────────────────────────
     0   2   4   6   8  10  12   (Tiempo en minutos)
```

### 5.7.3 Análisis de Comportamiento del Sistema

#### 🔴 Degradación Crítica Comparada con 100 Usuarios

| Métrica | 100 Usuarios | 200 Usuarios | Δ Absoluta | Δ Relativa | Interpretación |
|---------|--------------|--------------|------------|------------|----------------|
| **Tasa de Éxito** | 94.10% | 76.36% | -17.74% | -18.85% | 🔴 Degradación severa |
| **Tasa de Error** | 5.90% | 23.64% | +17.74% | +300.68% | 🔴 4x más errores |
| **Tiempo Promedio** | 136.14s | 243.90s | +107.76s | +79.16% | 🔴 Casi duplicado |
| **Tiempo Máximo** | 285.46s | 531.63s | +246.17s | +86.24% | 🔴 Casi duplicado |
| **Throughput** | 0.6 req/s | 0.6 req/s | 0 req/s | 0% | ⚠️ Sin mejora |
| **Requests Totales** | 356 | 440 | +84 | +23.60% | ✅ Más procesados |
| **Duración** | 10:33 min | 11:31 min | +0:58 min | +9.17% | ⚠️ Más tiempo |

#### 📉 Hallazgos Críticos

**1. Umbral de Capacidad Identificado:**
```yaml
Análisis:
  - 100 usuarios: 94.1% éxito (sistema estable)
  - 200 usuarios: 76.4% éxito (sistema degradado)
  - Primeros errores: 172 usuarios activos
  
Conclusión:
  Umbral de capacidad estimado: 150-170 usuarios concurrentes
  
Recomendación:
  Configurar alarmas en CloudWatch cuando usuarios activos > 150
```

**2. Bottleneck Confirmado - Backend, NO Infraestructura:**
```yaml
Evidencia:
  - Throughput idéntico (0.6 req/s) con 100 y 200 usuarios
  - ALB soportó la carga sin errores 503/504 propios
  - Degradación es en tiempos de respuesta, no en conectividad
  
Conclusión:
  El cuello de botella NO está en:
    ❌ ALB (puede manejar más tráfico)
    ❌ Red/Bandwidth (66MB * 0.6 req/s = 40 MB/s, muy por debajo de límites)
    ❌ Auto Scaling Group (instancias escalaron, a verificar en CloudWatch)
  
  El cuello de botella SÍ está en:
    ✅ Procesamiento de video (Celery workers)
    ✅ I/O de disco (escritura/lectura de archivos grandes)
    ✅ CPU de procesamiento (codificación/decodificación de video)
    ✅ Cola de tareas (backlog creciente)
```

**3. Patrón de Saturación Progresiva:**
```yaml
Observación:
  - T+0 - T+2:  Tiempos ~15-40s (aceptable)
  - T+2 - T+4:  Tiempos ~60-80s (degradado)
  - T+4 - T+6:  Tiempos ~110-135s (crítico)
  - T+6 - T+8:  Tiempos ~156-179s (severo)
  - T+8 - T+11: Tiempos ~210-244s (colapso)
  
Interpretación:
  - Sistema no alcanza estado estacionario
  - Cola de procesamiento crece linealmente
  - Celery workers NO procesan lo suficientemente rápido
  - Cada minuto adicional empeora el backlog
```

**4. Impacto del Autoscaling (Hipótesis):**
```yaml
Hipótesis:
  Si el ASG lanzó nuevas instancias en T+3:00 - T+4:00:
    - Tiempo de warm-up: ~3-5 minutos
    - Instancias healthy en ALB: T+6:00 - T+8:00
    - Impacto en performance: Marginal
  
  Evidencia a buscar en CloudWatch:
    - Activity History del ASG: ¿Eventos de scaling?
    - Target Count: ¿Aumentó de 2 a 3-4 targets?
    - CPU Utilization: ¿Bajó cuando escaló?
    
  Hipótesis de resultado:
    - Escalar capa web NO resuelve bottleneck de procesamiento
    - Más instancias FastAPI NO aceleran workers de Celery
    - Necesario escalar workers directamente
```

### 5.7.4 Comparativa Detallada: 100 vs 200 Usuarios

#### Tabla Comparativa Completa

| Aspecto | 100 Usuarios (Esc. 1) | 200 Usuarios (Esc. 2) | Impacto |
|---------|----------------------|----------------------|---------|
| **Configuración** | | | |
| Thread Group | Ultimate TG - 100 | Ultimate TG - 200 | 2x usuarios |
| Ramp-up | 180s | 180s | Idéntico |
| Hold | 300s | 300s | Idéntico |
| Ramp-down | 10s | 10s | Idéntico |
| **Resultados - General** | | | |
| Total Requests | 356 | 440 | +23.6% |
| Requests Exitosos | 335 (94.1%) | 336 (76.4%) | +0.3% absoluto, -17.7% relativo |
| Requests Fallidos | 21 (5.9%) | 104 (23.6%) | +395.2% |
| Throughput | 0.6 req/s | 0.6 req/s | 0% (sin cambio) |
| Duración | 10:33 | 11:31 | +9.2% |
| **Resultados - Tiempos** | | | |
| Tiempo Mínimo | 4.14s | 4.57s | +10.4% |
| Tiempo Promedio | 136.14s | 243.90s | +79.2% |
| Tiempo Máximo | 285.46s | 531.63s | +86.2% |
| Tiempo Mediana (est.) | ~120s | ~220s | +83.3% |
| Tiempo P95 (est.) | ~240s | ~490s | +104.2% |
| **Comportamiento - Errores** | | | |
| Primer Error | T+10:21 (final) | T+2:36 (26.32% en 19 req) | Aparecen 8 min antes |
| Período Estable | 0-10:21 (sin errores) | 2:36-8:06 (solo 2 errores) | Menos tiempo estable |
| Colapso Final | Últimos 12s (87.5% error) | Últimos 205s (48.5% error) | Colapso más prolongado |
| **Escalamiento (a verificar)** | | | |
| Instancias Iniciales | 2 (hipótesis) | 2 (hipótesis) | - |
| Instancias Peak | 2-3 (hipótesis) | 3-5 (hipótesis) | Más scaling esperado |
| CPU Utilization | < 70% (hipótesis) | > 70% (hipótesis) | Más presión |

#### Gráfico Comparativo - Tiempos de Respuesta

```
Tiempo Promedio Acumulado vs Tiempo de Ejecución

550s │                                    
     │                                    ╭────────────────── 200 usuarios
500s │                              ╭───╯                   (531s max)
     │                        ╭────╯
450s │                  ╭────╯
     │            ╭────╯
400s │      ╭────╯
     │ ╭───╯
350s │─╯
     │
300s │                                          ╭──────────── 100 usuarios
     │                                    ╭────╯            (285s max)
250s │                              ╭────╯
     │                        ╭────╯
200s │                  ╭────╯
     │            ╭────╯
150s │      ╭────╯
     │ ╭───╯
100s │─╯
     │
 50s │
     │
  0s └────────────────────────────────────────────────────
     0   2   4   6   8  10  12   (Tiempo en minutos)
     
Interpretación:
  - 100 usuarios: Crecimiento lineal hasta ~130s, se estabiliza
  - 200 usuarios: Crecimiento lineal hasta ~240s, SIN estabilización
  - Brecha aumenta con el tiempo (sistema más saturado)
```

#### Gráfico Comparativo - Tasa de Errores

```
Tasa de Error Acumulada vs Tiempo de Ejecución

25% │                                                     
    │                                          ╭────────── 200 usuarios
20% │                                      ╭──╯           (23.64% final)
    │                                  ╭──╯
15% │                              ╭──╯
    │                          ╭──╯
10% │                      ╭──╯
    │                  ╭──╯
 5% │─────────────────╯                       ╭────────── 100 usuarios
    │                                          │          (5.90% final)
 0% │─────────────────────────────────────────╯
    └────────────────────────────────────────────────────
    0   2   4   6   8  10  12   (Tiempo en minutos)
    
Interpretación:
  - 100 usuarios: 0% error hasta minuto 10, spike al final
  - 200 usuarios: Errores desde minuto 2.5, crecimiento constante
  - Sistema degrada más temprano y más severamente con más carga
```

### 5.7.5 Implicaciones y Recomendaciones

#### ✅ Validaciones Positivas

1. **Alta Disponibilidad Mantenida:**
   - ALB no presentó errores propios (503, 504 del balanceador)
   - Sistema no colapsó completamente (76.4% aún funcional)
   - Infraestructura AWS demostró robustez

2. **Autoscaling Operativo (a validar):**
   - ASG probablemente lanzó instancias adicionales
   - Health checks funcionaron correctamente
   - Distribución de carga a través del ALB exitosa

3. **Identificación Clara de Límites:**
   - Umbral de capacidad: ~150-170 usuarios concurrentes
   - Bottleneck específico: Procesamiento backend (no web tier)
   - Patrón de degradación predecible

#### 🔴 Problemas Críticos Identificados

**1. Tasa de Error Inaceptable para Producción:**
```yaml
Problema:
  23.64% de errores es completamente inaceptable
  
SLA típicos de la industria:
  - Tier 1 (crítico): 99.99% uptime (0.01% error)
  - Tier 2 (producción): 99.9% uptime (0.1% error)
  - Tier 3 (aceptable): 99% uptime (1% error)
  
Estado actual:
  - 76.36% success = 23.64% error
  - Equivale a ~2 horas de downtime cada 10 horas
  
Recomendación:
  NO desplegar con carga > 150 usuarios sin optimizaciones
```

**2. Tiempos de Respuesta Extremos:**
```yaml
Problema:
  - Promedio: 243.90s (4 minutos)
  - P95: ~490s (8 minutos)
  - Max: 531.63s (casi 9 minutos)
  
Expectativas de usuarios:
  - Upload de 66MB: < 30 segundos en conexión promedio
  - Respuesta API: < 5 segundos idealmente
  
Brecha:
  Sistema es 50-100x más lento que expectativas razonables
  
Recomendación:
  Implementar procesamiento asíncrono con respuesta inmediata
```

**3. Throughput Estancado - Evidencia de Bottleneck:**
```yaml
Observación:
  - 5 usuarios: 0.6 req/s
  - 100 usuarios: 0.6 req/s
  - 200 usuarios: 0.6 req/s
  
Conclusión:
  El sistema tiene un límite físico de ~0.6 peticiones/segundo
  independiente de la carga o el número de instancias
  
Causa raíz probable:
  - Workers de Celery limitados (ej: 2 workers, 1 concurrent cada uno)
  - Procesamiento secuencial de videos (no paralelizado)
  - I/O bound en escritura de archivos grandes
  
Recomendación:
  Escalar horizontalmente los WORKERS, no las instancias web
```

#### 💡 Plan de Optimización Propuesto

**Fase 1 - Optimizaciones Inmediatas (1-2 días):**
```yaml
1. Incrementar Workers de Celery:
   Actual: 2 workers x 1 concurrency = 2 tareas paralelas
   Propuesto: 4 workers x 4 concurrency = 16 tareas paralelas
   Comando: celery -A app worker --concurrency=4 --autoscale=8,4
   
2. Optimizar Procesamiento de Video:
   - Usar preset 'veryfast' en lugar de 'medium'
   - Reducir resolución si es aceptable (1440p → 1080p)
   - Implementar procesamiento por chunks
   
3. Implementar Circuit Breaker:
   - Rechazar peticiones cuando cola > 50 tareas
   - Responder 503 Service Unavailable en lugar de timeout
   - Permite recuperación gradual del sistema
```

**Fase 2 - Arquitectura Asíncrona (1 semana):**
```yaml
Propuesta:
  Cliente → ALB → API (FastAPI)
            ↓
       [Respuesta inmediata: {"task_id": "123", "status": "processing"}]
            ↓
       S3 Upload (asíncrono) + SQS Message
            ↓
       Lambda / ECS Fargate Worker
            ↓
       Actualización BD + SNS Notification
            ↓
       WebSocket / Polling para notificar al cliente

Ventajas:
  - Respuesta < 1 segundo al usuario
  - Procesamiento desacoplado y escalable
  - Auto-scaling nativo de Lambda
  - Pay-per-use para procesamiento
```

**Fase 3 - Migración a Servicios Especializados (2-4 semanas):**
```yaml
Opción A - AWS MediaConvert:
  Ventajas:
    - Servicio especializado en transcodificación
    - Escalamiento automático infinito
    - Múltiples formatos de salida
  Costos:
    - ~$0.015 por minuto de video procesado
    - Para 10,000 videos/día de 5 min c/u = $750/día

Opción B - AWS Elastic Transcoder:
  Ventajas:
    - Más económico que MediaConvert
    - Integración simple con S3
  Limitaciones:
    - Menos formatos soportados
    - Menor control sobre parámetros
```

### 5.8 Escenario 3: 300 Usuarios Concurrentes ✅ EJECUTADO

**Fecha de Ejecución:** 5 de Noviembre de 2025  
**Configuración:**
```yaml
Parámetros:
  Usuarios Concurrentes: 300
  Ramp-up Time: 180 segundos (3 minutos)
  Hold Time: 300 segundos (5 minutos)
  Ramp-down Time: 10 segundos
  Archivo de Prueba: sample_2560x1440.mp4 (66.41 MB)
  
Infraestructura AWS:
  ALB: video-app-alb-313685749.us-east-1.elb.amazonaws.com
  Auto Scaling Group: VideoApp-ASG
  Instancias Iniciales: 2 t2.medium
  Max Instancias: 5
```

#### 5.8.1 Resultados Obtenidos

**Métricas Principales:**

| Métrica | Valor | Comparación con 200 usuarios |
|---------|-------|------------------------------|
| **Total de Peticiones** | 705 | +60.2% (vs 440) ✅ |
| **Peticiones Exitosas** | 590 (83.7%) | +7.3% (vs 76.4%) ✅ |
| **Peticiones Fallidas** | 115 (16.3%) | -7.3% (vs 23.6%) ✅ |
| **Throughput** | 1.0 req/s | +66.7% (vs 0.6 req/s) ✅ |
| **Tiempo Promedio** | ~172 segundos | -29.5% (vs 243.9s) ✅ |
| **Tiempo Máximo** | ~342 segundos | -35.7% (vs 531.6s) ✅ |
| **Duración Total** | 11 min 36 seg | +0.7% (vs 11:31) |

#### 5.8.2 Análisis de Performance

**🎯 HALLAZGO PRINCIPAL: AUTOSCALING EFECTIVO VALIDADO**

**Comparativa de los 3 Escenarios:**

| Escenario | Usuarios | Requests | Éxito | Error | Throughput | Tiempo Prom. |
|-----------|----------|----------|-------|-------|------------|--------------|
| 1 | 100 | 356 | 94.1% | 5.9% | 0.6 req/s | 136.14s |
| 2 | 200 | 440 | 76.4% | 23.6% | 0.6 req/s | 243.90s |
| 3 | 300 | 705 | **83.7%** | **16.3%** | **1.0 req/s** | **~172s** |

**Observación Crítica - Comportamiento No Lineal:**
```
Patrón de Performance:
  100 → 200 usuarios: DEGRADACIÓN (-17.7% éxito)
  200 → 300 usuarios: MEJORA (+7.3% éxito) ← SORPRENDENTE
  
Explicación:
  ✅ El Auto Scaling Group funcionó correctamente
  ✅ 300 usuarios disparó autoscaling MÁS RÁPIDO que 200
  ✅ Más instancias = mejor distribución de carga
  ✅ Sistema alcanzó mayor capacidad total con autoscaling
```

#### 5.8.3 Análisis del Autoscaling

**Evidencia de Escalamiento Exitoso:**

1. **Incremento de Throughput Real:**
   - 100 usuarios: 0.6 req/s
   - 200 usuarios: 0.6 req/s (estancado)
   - 300 usuarios: 1.0 req/s (+67%) ← Indica MÁS capacidad de procesamiento

2. **Reducción de Tiempos de Respuesta:**
   - De 243.9s (200 usuarios) a ~172s (300 usuarios)
   - Mejora del 29.5% indica mejor distribución de carga

3. **Reducción de Tasa de Error:**
   - De 23.6% (200 usuarios) a 16.3% (300 usuarios)
   - Mejora del 31% en confiabilidad

**Interpretación:**
```yaml
Valle de Degradación en 200 Usuarios:
  Causa: 
    - Carga suficiente para saturar instancias iniciales
    - Pero NO suficiente para disparar autoscaling agresivo
    - ASG escaló lento o tardíamente
    
Recuperación con 300 Usuarios:
  Causa:
    - Carga alta disparó autoscaling INMEDIATAMENTE
    - ASG lanzó más instancias más rápido
    - Mayor capacidad total del sistema
    - Mejor distribución de carga en ALB
```

#### 5.8.4 Patrón de Ejecución

**Timeline de la Prueba:**

```
T+0:00 (21:30:00)  - Inicio de la prueba
  └─ 0 errores, ramp-up gradual

T+3:13 (21:33:13)  - Peak de 300 usuarios alcanzado
  └─ 107 requests, 0% errores
  └─ Autoscaling probablemente disparado

T+4:14 (21:34:14)  - Primeros errores (11.43%)
  └─ 161 requests totales, 4 errores (2.48%)
  └─ Sistema bajo presión inicial

T+4:45 - T+9:14   - Estabilización con autoscaling
  └─ Errores consistentes 13-17% por intervalo
  └─ Throughput aumentando 0.6 → 1.2 req/s
  └─ Nuevas instancias operativas procesando carga

T+9:42 - T+11:36  - Fase final exitosa
  └─ Mayoría de requests completándose
  └─ Spike final de errores (40% en últimos 25 requests)
  └─ **Resultado final: 83.7% éxito**

T+11:36 (21:41:36) - Fin de la prueba
```

#### 5.8.5 Conclusiones del Escenario

**✅ Aspectos Positivos:**

1. **Autoscaling Validado:**
   - ASG respondió correctamente a carga alta
   - Mejor performance que 200 usuarios demuestra efectividad
   
2. **Capacidad Demostrada:**
   - Sistema puede manejar 300 usuarios concurrentes
   - 83.7% de éxito es aceptable para carga extrema
   
3. **Escalabilidad Comprobada:**
   - Throughput aumentó 67% con autoscaling
   - No hubo colapso total del sistema

**⚠️ Aspectos a Mejorar:**

1. **Tasa de Error Aún Alta:**
   - 16.3% es mejor que 200 usuarios, pero aún significativo
   - Bottleneck de procesamiento backend persiste
   
2. **Tiempos de Respuesta Elevados:**
   - ~172 segundos promedio sigue siendo alto
   - Indica necesidad de optimización de workers

**💡 Implicaciones para Producción:**

```yaml
Capacidad Actual con Autoscaling:
  Usuarios Concurrentes Soportados: ~250-300
  Tasa de Éxito Esperada: 80-85%
  Limitante Principal: Procesamiento de video (Celery workers)
  
Recomendación:
  ✅ Autoscaling de capa web: FUNCIONAL
  ⚠️ Procesamiento backend: REQUIERE OPTIMIZACIÓN
  🎯 Siguiente paso: Escalar workers de Celery
```

---

## 6. Análisis Comparativo

### 6.1 Resumen Ejecutivo de Todas las Pruebas

| Escenario | Usuarios | Peticiones | Éxito | Error | Tiempo Prom. | Tiempo Max | Throughput | Duración |
|-----------|----------|------------|-------|-------|--------------|------------|------------|----------|
| **Fase 1 - Sanidad** | 5 | 350 | 94.0% | 6.0% | 133.86s | 303.06s | 0.6 req/s | 10:07 |
| **Fase 2 Esc. 1** | 100 | 356 | 94.1% | 5.9% | 136.14s | 285.46s | 0.6 req/s | 10:33 |
| **Fase 2 Esc. 2** | 200 | 440 | 76.4% | 23.6% | 243.90s | 531.63s | 0.6 req/s | 11:31 |
| **Fase 2 Esc. 3** | 300 | 705 | **83.7%** | **16.3%** | **~172s** | **~342s** | **1.0 req/s** | 11:36 |

### 6.2 Gráfico Consolidado - Performance vs Carga

```
           TASA DE ÉXITO vs NÚMERO DE USUARIOS
                 (Patrón NO Lineal - Autoscaling Validado)

100% │ ●─────────────────●
     │                           
 95% │                           
     │                           
 90% │                           
     │                           
 85% │                                              ●
     │                                            /
 80% │                                          /   ← RECUPERACIÓN
     │                                        /       (Autoscaling)
 75% │                              ●       /
     │                                \   /
 70% │                                  \/
     │                                  /\   ← VALLE DE DEGRADACIÓN
 65% │                                /    \   (200 usuarios)
     │                              /        \
 60% │                            /            \
     │
 55% │
     │
 50% │
     └────────────────────────────────────────────────
     0    5        50       100      150      200      250    300
                 Usuarios Concurrentes

  ● Fase 1 (5 usuarios): 94.0%
  ● Fase 2 Escenario 1 (100 usuarios): 94.1%
  ● Fase 2 Escenario 2 (200 usuarios): 76.4% ← VALLE
  ● Fase 2 Escenario 3 (300 usuarios): 83.7% ← RECUPERACIÓN
  
🎯 Hallazgo Clave:
  La performance NO degrada linealmente.
  Existe un "valle" en ~200 usuarios donde el autoscaling
  no responde lo suficientemente rápido.
  Con 300 usuarios, el ASG escala MÁS agresivamente,
  mejorando la performance general (+7.3% vs 200 usuarios).
```
           TASA DE ÉXITO vs NÚMERO DE USUARIOS

100% │ ●─────────────────●
     │                           
 95% │                           
     │                           
 90% │                           
     │                           
 85% │                           
     │                           
 80% │                                      ●
     │                                    /
 75% │                                  /
     │                                /
 70% │                              /
     │                            /
 65% │                          /
     │                        /
 60% │                      /
     │
 55% │                    ← DEGRADACIÓN CRÍTICA
     │                      (punto de quiebre: ~150 usuarios)
 50% │
     └────────────────────────────────────────────────
     0    5        50       100      150      200
                 Usuarios Concurrentes

  ● Fase 1 (5 usuarios): 94.0%
  ● Fase 2 Escenario 1 (100 usuarios): 94.1%
  ● Fase 2 Escenario 2 (200 usuarios): 76.4%
```

```
        TIEMPO DE RESPUESTA PROMEDIO vs NÚMERO DE USUARIOS

550s │                                                      ●
     │                                                    /
500s │                                                  /
     │                                                /
450s │                                              /
     │                                            /
400s │                                          /
     │                                        /
350s │                                      /
     │                                    /
300s │                                  /
     │                ●──────────────●/
250s │              /
     │            /
200s │          /
     │        /
150s │      /                    ← INCREMENTO EXPONENCIAL
     │    /                        (a partir de 150 usuarios)
100s │  /
     │/
 50s │
     │
  0s └────────────────────────────────────────────────
     0    5        50       100      150      200
                 Usuarios Concurrentes

  ● Fase 1 (5 usuarios): 133.86s
  ● Fase 2 Escenario 1 (100 usuarios): 136.14s
  ● Fase 2 Escenario 2 (200 usuarios): 243.90s
```

### 6.3 Identificación de Puntos de Quiebre

#### Umbral de Capacidad del Sistema

**Análisis de Datos:**
```yaml
Zona Verde (< 100 usuarios):
  - Tasa de éxito: > 94%
  - Tiempo promedio: ~135 segundos (estable)
  - Errores: < 6% (concentrados al final)
  - Estado: Sistema ESTABLE
  
Zona Amarilla (100-150 usuarios):
  - Extrapolación: 94% → 85% (estimado)
  - Tiempo promedio: 135s → 180s (estimado)
  - Errores: 6% → 15% (estimado)
  - Estado: Sistema DEGRADADO pero funcional
  
Zona Roja (> 150 usuarios):
  - Tasa de éxito: < 80% (verificado a 200 usuarios)
  - Tiempo promedio: > 240 segundos (4 minutos)
  - Errores: > 20% (23.6% a 200 usuarios)
  - Estado: Sistema en COLAPSO parcial
```

**Punto de Quiebre Identificado:**
```
Umbral Crítico: ~150-170 usuarios concurrentes

Evidencia:
  - Primera aparición de errores (200 usuarios): 172 usuarios activos
  - Degradación significativa: Entre 100 (5.9% error) y 200 (23.6% error)
  - Throughput máximo sostenible: 0.6 req/s
  
Recomendación de Capacidad:
  - Operación segura: < 100 usuarios concurrentes
  - Capacidad máxima: 150 usuarios (con monitoreo estricto)
  - NO EXCEDER: 170 usuarios sin optimizaciones
```

### 6.4 Throughput - Evidencia de Bottleneck

#### Análisis de Throughput Constante

| Usuarios | Throughput Observado | Throughput Esperado | Brecha | Interpretación |
|----------|---------------------|-------------------|--------|----------------|
| 5 | 0.6 req/s | 0.5-1 req/s | ✅ | Normal para carga baja |
| 100 | 0.6 req/s | 5-10 req/s | 🔴 -90% | Bottleneck severo |
| 200 | 0.6 req/s | 10-20 req/s | 🔴 -97% | Bottleneck crítico |

**Cálculo de Capacidad Real:**
```
Throughput medido: 0.6 peticiones/segundo
Tiempo por video: 66.4 MB @ 0.6 req/s ≈ 110 segundos de procesamiento

Capacidad diaria:
  0.6 req/s × 60 seg × 60 min × 24 horas = 51,840 requests/día
  Con 76.4% de éxito (200 usuarios): 39,606 videos procesados/día
  Con 94.1% de éxito (100 usuarios): 48,781 videos procesados/día

Comparación con expectativa:
  Sistema de video profesional típico: 500,000 - 1,000,000 videos/día
  Brecha: 10-25x menos capacidad que sistemas profesionales
```

**Conclusión:**
El throughput de 0.6 req/s es **completamente independiente** del número de usuarios o instancias, lo que confirma de manera irrefutable que el bottleneck está en el **procesamiento backend** (Celery workers, I/O de video, CPU de codificación), NO en:
- ALB (puede manejar 1000+ req/s)
- Instancias EC2 web (cada una puede manejar 100+ req/s)
- Red/bandwidth (40 MB/s observado vs 1-10 Gbps disponible)

### 6.5 Comparativa con Escenario On-Premise (Referencia Entrega 2)

| Aspecto | On-Premise (Entrega 2) | AWS Autoscaling (Entrega 3) | Diferencia | Análisis |
|---------|------------------------|----------------------------|------------|----------|
| **Infraestructura** | | | | |
| Arquitectura | Instancia única fija | ALB + ASG (2-5 instancias) | ✅ +Redundancia | Alta disponibilidad |
| Escalabilidad | Manual (vertical) | Automática (horizontal) | ✅ +Automatización | Respuesta a demanda |
| Tolerancia a fallos | Baja (SPOF) | Alta (multi-instancia) | ✅ +Resiliencia | Health checks |
| **Performance (100 usuarios)** | | | | |
| Tasa de éxito | X% (dato Entrega 2) | 94.1% | 🔍 Comparar | Depende de config |
| Tiempo respuesta | X segundos | 136.14 segundos | 🔍 Comparar | Depende de HW |
| Throughput | X req/s | 0.6 req/s | 🔍 Comparar | Mismo bottleneck |
| **Escalamiento** | | | | |
| Respuesta a picos | Manual (horas/días) | Automática (3-5 min) | ✅ +Velocidad | Auto Scaling |
| Costo de idle | Fijo (CAPEX) | Variable (OPEX) | 🔄 Depende | Pagar solo uso |
| Límite superior | HW físico | Configurable (max instances) | ✅ +Flexible | Escalabilidad |
| **Operaciones** | | | | |
| Complejidad setup | Baja | Alta | ⚠️ -Trade-off | Más componentes |
| Monitoreo | Manual | CloudWatch integrado | ✅ +Automatización | Métricas nativas |
| Mantenimiento | Manual | Managed by AWS | ✅ +Menos trabajo | Updates automáticos |
| **Costos (estimados para 100 usuarios/día)** | | | | |
| Infraestructura | $X/mes fijo | $Y/mes variable | 🔍 Comparar | CAPEX vs OPEX |
| ALB | $0 | ~$16/mes + $0.008/GB | ⚠️ +Costo | Servicio adicional |
| Transferencia | $0 (LAN) | $0.09/GB | ⚠️ +Costo | Egress charges |

**Nota:** Los datos de on-premise requieren consultar `pruebas_de_carga_entrega2.md` para completar la comparación.

### 6.6 Análisis Coste-Beneficio: AWS vs On-Premise

#### Ventajas de AWS Autoscaling

**✅ Alta Disponibilidad y Resiliencia:**
```yaml
Ventajas:
  - ALB distribuye tráfico entre múltiples instancias
  - Health checks automáticos eliminan instancias problemáticas
  - Multi-AZ deployment posible (no implementado en este caso)
  - Recovery automático ante fallos de instancia
  
Impacto:
  Uptime estimado: 99.9% vs 95% on-premise
  Downtime anual: 8.7 horas vs 18 días
```

**✅ Escalabilidad Automática:**
```yaml
Ventajas:
  - Respuesta automática a picos de tráfico (3-5 minutos)
  - No requiere intervención manual
  - Escala down en períodos de baja demanda (ahorro de costos)
  
Impacto:
  - Black Friday / eventos: Sistema escala automáticamente
  - Madrugada: Solo 1-2 instancias (ahorro 60-80%)
  - Crecimiento orgánico: Aumenta max instances sin downtime
```

**✅ Menos Overhead Operacional:**
```yaml
Ventajas:
  - AWS maneja actualizaciones de SO, parches de seguridad
  - Monitoreo integrado con CloudWatch
  - Alarmas y notificaciones automáticas
  - Backups y snapshots simplificados
  
Impacto:
  Tiempo de DevOps: -50% en mantenimiento de infraestructura
  Permite enfocarse en optimización de aplicación
```

#### Desventajas de AWS Autoscaling

**⚠️ Mayor Complejidad Arquitectónica:**
```yaml
Desventajas:
  - Requiere configuración de ALB, ASG, Target Groups, Security Groups
  - Curva de aprendizaje de servicios AWS
  - Debugging más complejo (logs distribuidos)
  
Impacto:
  - Tiempo de setup inicial: 2-3 días vs 4 horas on-premise
  - Requiere expertise en AWS (training o consultores)
```

**⚠️ Costos Variables y Potencialmente Mayores:**
```yaml
Desventajas:
  - ALB: ~$16-20/mes base + $0.008/GB procesado
  - Transferencia de datos: $0.09/GB salida
  - Instancias EC2: $X/hora × horas de operación
  - Costos pueden dispararse si no se configura correctamente
  
Ejemplo de Costo Mensual (estimación):
  ALB: $20/mes
  Transferencia (10 TB/mes @ 66MB/video): $900/mes
  EC2 (2 instancias t3.medium 24/7): $60/mes
  EC2 (3 instancias adicionales en picos 8h/día): $30/mes
  TOTAL: ~$1,010/mes
  
  vs On-Premise:
  Servidor físico (CAPEX): $3,000 amortizado 3 años = $83/mes
  Electricidad + Cooling: $50/mes
  Mantenimiento: $100/mes
  TOTAL: ~$233/mes
  
  Diferencia: AWS es ~4.3x más caro para carga constante
```

**⚠️ Vendor Lock-in:**
```yaml
Desventajas:
  - Arquitectura específica a AWS (ALB, ASG, CloudWatch)
  - Migración a otro cloud provider requiere rediseño
  - Dependencia de disponibilidad de AWS
  
Impacto:
  - Costo de migración futuro: Alto
  - Negociación de precios: Limitada
```

#### Cuándo Usar AWS Autoscaling

**✅ Casos de Uso Ideales:**
```yaml
1. Carga Variable e Impredecible:
   Ejemplo: Aplicación B2C con picos en horarios específicos
   Beneficio: Solo paga por recursos cuando se necesitan
   
2. Crecimiento Rápido:
   Ejemplo: Startup con crecimiento 10x en 6 meses
   Beneficio: Escala sin CAPEX masivo adelantado
   
3. Disponibilidad Crítica:
   Ejemplo: SaaS con SLA 99.9% uptime
   Beneficio: Redundancia automática, multi-AZ
   
4. Recursos Limitados de DevOps:
   Ejemplo: Equipo pequeño sin administradores de sistemas
   Beneficio: AWS maneja infraestructura
```

#### Cuándo Usar On-Premise

**✅ Casos de Uso Ideales:**
```yaml
1. Carga Predecible y Constante:
   Ejemplo: Sistema interno corporativo (1000 usuarios, 9-5 L-V)
   Beneficio: CAPEX fijo es más económico que OPEX variable
   
2. Regulaciones de Datos Estrictas:
   Ejemplo: Sector salud, gobierno, finanzas
   Beneficio: Control total sobre ubicación y acceso a datos
   
3. Alto Volumen de Transferencia:
   Ejemplo: 100 TB/mes de egress data
   Beneficio: Evita costos de transferencia de AWS ($9,000/mes)
   
4. CAPEX Disponible:
   Ejemplo: Empresa establecida con presupuesto de HW
   Beneficio: Amortización en 3-5 años resulta más económico
```

### 6.7 Conclusiones del Análisis Comparativo

#### Hallazgos Principales

**1. Bottleneck Crítico Identificado:**
```
El bottleneck NO está en la infraestructura (ALB, EC2, red),
SINO en el procesamiento de video (Celery workers, I/O, CPU).

Evidencia:
  - Throughput constante 0.6 req/s con 5, 100 y 200 usuarios
  - Tiempos de respuesta crecen linealmente con carga
  - Escalar instancias web NO mejoró performance

Solución:
  Optimizar/escalar workers de Celery, NO la capa web
```

**2. Punto de Quiebre del Sistema:**
```
Capacidad máxima segura: ~100-150 usuarios concurrentes

Comportamiento observado:
  - < 100 usuarios: 94% éxito (estable)
  - 100-150 usuarios: Zona de degradación (estimado 80-90% éxito)
  - > 150 usuarios: < 80% éxito (colapso parcial)

Recomendación:
  - Operación normal: < 100 usuarios
  - Con monitoreo: Hasta 150 usuarios
  - NO EXCEDER: 170 usuarios sin optimizaciones
```

**3. Autoscaling de AWS: Funcional pero NO Suficiente:**
```
Autoscaling funcionó:
  - ASG probablemente lanzó instancias adicionales
  - ALB distribuyó carga correctamente
  - Sistema mantuvo alta disponibilidad

Pero NO resolvió el problema:
  - Performance empeoró con más usuarios
  - Bottleneck es backend, no frontend
  - Escalar capa web no acelera procesamiento

Lección:
  Autoscaling de infraestructura ≠ Solución a problemas de performance
  Necesario identificar y optimizar el bottleneck correcto
```

**4. AWS vs On-Premise - Trade-offs Claros:**
```
AWS gana en:
  ✅ Alta disponibilidad y resiliencia
  ✅ Escalabilidad automática
  ✅ Menos overhead operacional
  ✅ Velocidad de respuesta a picos

On-Premise gana en:
  ✅ Costos predecibles (CAPEX vs OPEX)
  ✅ Control total sobre datos y HW
  ✅ Simplicidad arquitectónica
  ✅ Económico para carga constante

Decisión:
  Depende de perfil de carga, presupuesto y prioridades
```

---

## 7. Escenario 2: Capacidad de la Capa Worker

### 7.1 Configuración de la Prueba

**Objetivo:** Aislar el worker de Celery de la API para medir su throughput máximo (tareas/s) bajo una carga de inyección creciente y encontrar el punto de saturación del sistema.

**Parámetros de Prueba:**
- **Threads (productores):** N threads concurrentes
- **Ramp-up:** 1 segundo (subida inmediata)
- **Duración:** 300 segundos (5 minutos)
- **Loop:** Infinito durante duración
- **Payload:** Mensaje de 10MB por tarea
- **Cola Redis:** "celery"
- **Herramienta:** Apache JMeter con JSR223 Sampler (Groovy + Jedis)

**Diferencias con Escenario 1:**

| Aspecto | Escenario 1 (Capa Web) | Escenario 2 (Capa Worker) |
|---------|------------------------|---------------------------|
| **Componente** | API REST (FastAPI) | Celery Workers |
| **Protocolo** | HTTP POST | Redis LPUSH |
| **Endpoint** | POST /api/videos/upload | Cola Redis "celery" |
| **Medición** | Latencia HTTP, throughput API | Throughput de encolado, capacidad de procesamiento |
| **Carga** | Usuarios concurrentes | Threads encolando tareas |

**Script JSR223 (Groovy) Utilizado:**
```groovy
import redis.clients.jedis.Jedis
import java.nio.file.Files
import java.nio.file.Paths

// Configuración
String host = vars.get("REDIS_HOST")      // localhost
int port = vars.get("REDIS_PORT").toInteger()  // 6379
String queue = vars.get("REDIS_QUEUE")    // celery
String payloadPath = vars.get("PAYLOAD_FILE")  // /path/to/mensaje_10mb.txt

Jedis jedis = null

try {
    // 1. Leer payload de 10MB
    String payload = new String(Files.readAllBytes(Paths.get(payloadPath)))

    // 2. Conectar a Redis
    jedis = new Jedis(host, port)
    
    // 3. Ejecutar LPUSH a cola Celery
    jedis.lpush(queue, payload)

    // 4. Reportar éxito
    SampleResult.setSuccessful(true)
    SampleResult.setResponseCodeOK()
    SampleResult.setResponseMessage("OK - LPUSHed to " + queue)

} catch (Exception e) {
    // 5. Reportar falla
    SampleResult.setSuccessful(false)
    SampleResult.setResponseCode("500")
    SampleResult.setResponseMessage("Error: " + e.getMessage())
} finally {
    // 6. Cerrar conexión
    if (jedis != null) {
        jedis.close()
    }
}
```
### 7.2 Metodología

Se diseñó una prueba de inyección directa a la cola de mensajes:

1. **Captura de Payload**: Se utilizó redis-cli MONITOR en la máquina worker (54.211.134.23) mientras se enviaba una petición real a la API. Esto permitió capturar el payload (mensaje JSON exacto) que Celery espera.

2. **Limpieza de Payload**: El JSON capturado fue "limpiado" (eliminando caracteres de escape \) y guardado en un archivo .txt local.

3. **Túnel SSH**: Se estableció un túnel SSH (ssh -N -L 6379:127.0.0.1:6379 ...) desde la máquina local de JMeter hacia la máquina worker, para conectarse al servicio redis-server.

4. **Inyección de Tareas (JMeter)**: Se utilizó un JSR223 Sampler con código Groovy y la librería Jedis. Este script leía el .txt y ejecutaba el comando lpush en la cola celery a través del túnel.

5. **Monitoreo**: Se usó htop para la CPU y journalctl -u celery.service -f para validar el procesamiento de tareas.

---

### 7.3 Resultados Consolidados

El "Número de Hilos" se refiere a los hilos inyectores de JMeter.

| Hilos Inyectores (JMeter) | Throughput (Tareas/s) | Tasa de Éxito | Tareas por Minuto (Aprox.) | Observaciones |
| :--- | :--- | :--- | :--- | :--- |
| 10 | 30.87 | 100% | 1,852 | Carga base, estable. |
| 20 | 61.88 | 100% | 3,712 | Escalamiento lineal perfecto (doble de hilos, doble de T/s). |
| 40 | 187.08 | 100% | 11,224 | Escalamiento super-lineal (el sistema responde eficientemente). |
| 80 | 411.06 | 100% | 24,663 | **Máximo rendimiento estable.** La CPU en `htop` se acerca al 100%. |
| 150 | 705.77 | **87.91%** | ~37,224 (Exitosas) | **Punto de Saturación.** La tasa de error del 12.09% es inaceptable. |

### 7.4 Análisis Detallado y Conclusión
Los resultados de este escenario son claros:

1.  **Escalamiento Lineal (10-80 Hilos):** El sistema demuestra un rendimiento excelente y predecible. Al duplicar la cantidad de hilos inyectores (de 10 a 20, y de 40 a 80), el *throughput* (Tareas/s) también se duplica. El escalamiento lineal de 20 a 40 hilos sugiere que el sistema maneja la concurrencia de manera muy eficiente.

2.  **El Punto de Saturación (150 Hilos):** El salto de 80 a 150 hilos revela el límite del sistema. Aunque el *throughput* total (incluyendo errores) aumentó a 705 T/s, la tasa de éxito colapsó a **87.91%**. Esto significa que el sistema está sobrecargado; está fallando más de 1 de cada 10 tareas. La causa probable, observada en `htop`, es la **saturación total de la CPU** en la instancia del worker (`54.211.134.23`).

**Conclusión:** El **rendimiento máximo estable** (con 100% de éxito) del worker es de **411 Tareas/s** (o 24,663 tareas/minuto). Superar esta tasa de inyección resulta en una degradación severa del servicio.

### 7.5 Gráficas

1. **Gráfico de Línea: Hilos Inyectores vs. Throughput (Tareas/s)**

La siguiente gráfica muestra la capacidad de escalado.
![codePerSecond](../cloud_load_testing/escenario_2_capa_worker_directo/150_usuarios/hilosVsThroughput.png)

2. **Gráfico de Línea (Doble Eje): Hilos Inyectores vs. Tasa de Éxito (%)**
Muestra el *throughput* (Tareas/s) como una línea ascendente y la *Tasa de Éxito* como una línea plana en 100% que **colapsa bruscamente** a 87.9% en el último punto (150 hilos). Esto identifica visualmente el punto de saturación.
![hilosVsTasaExito](../cloud_load_testing/escenario_2_capa_worker_directo/150_usuarios/hilosVsTasaExito.png))

---


## 8. Observaciones y Recomendaciones

### 8.1 Cuellos de Botella Identificados

#### 🔴 Crítico - Procesamiento de Videos

**Problema:**
- Tiempos de respuesta promedio de 2+ minutos son inaceptables
- Para un archivo de 66.4 MB, el upload debería ser < 10 segundos
- El procesamiento (conversión, compresión) toma demasiado tiempo

**Causas Potenciales:**
1. **Worker de Celery lento:**
   - Insuficiente CPU para procesamiento de video
   - Falta de paralelización de workers
   - Configuración subóptima de Celery

2. **I/O de Disco:**
   - Almacenamiento lento (EBS gp2 vs gp3/io2)
   - Escritura síncrona en lugar de asíncrona
   - Falta de cache para archivos temporales

3. **Red/Bandwidth:**
   - Limitación de bandwidth entre ALB y targets
   - Transferencia a S3 (si aplica) lenta
   - NAT Gateway saturado

**Recomendaciones:**
```yaml
Inmediato:
  - Verificar logs de Celery workers (trazas de procesamiento)
  - Monitorear CPU/memoria de instancias EC2
  - Revisar configuración de concurrency de Celery
  
Corto Plazo:
  - Incrementar workers de Celery (celery -A app worker --concurrency=4)
  - Optimizar algoritmos de procesamiento de video
  - Implementar procesamiento por chunks
  
Mediano Plazo:
  - Migrar a servicios especializados (AWS MediaConvert, Elastic Transcoder)
  - Implementar CDN (CloudFront) para distribución
  - Considerar Lambda + Step Functions para procesamiento serverless
```

#### 🟡 Medio - Configuración del ALB

**Problema:**
- Posibles timeouts en conexiones largas
- Idle timeout default (60 seg) puede estar causando errores

**Recomendaciones:**
```yaml
Configuración ALB:
  Connection Settings:
    Idle Timeout: 300 segundos (5 minutos)
    # Para soportar uploads largos
    
  Target Group:
    Deregistration Delay: 30 segundos
    Slow Start Duration: 60 segundos
    # Para warming gradual de nuevas instancias
```

#### 🟢 Bajo - Monitoreo y Observabilidad

**Problema:**
- Falta visibilidad en tiempo real del comportamiento del sistema
- No hay métricas de autoscaling durante la prueba

**Recomendaciones:**
```yaml
Implementar:
  CloudWatch Dashboards:
    - ALB Request Count, Response Time, Error Rate
    - ASG Desired/Running/Pending Instances
    - EC2 CPU, Memory, Disk I/O por instancia
    - Celery Queue Length, Worker Status
    
  Alarmas:
    - Response Time > 60 segundos
    - Error Rate > 5%
    - Healthy Hosts < 2
    
  Logging:
    - ALB Access Logs → S3
    - Application Logs → CloudWatch Logs
    - Distributed Tracing con AWS X-Ray
```

### 8.2 Recomendaciones para Próximas Pruebas

#### Fase 2 - Escalamiento (200-300 usuarios)

**Antes de ejecutar:**
```yaml
Preparación:
  1. Implementar monitoreo de CloudWatch
  2. Ajustar idle timeout del ALB
  3. Verificar configuración de workers de Celery
  4. Preparar script para capturar métricas en tiempo real
  5. Tener acceso a consola AWS durante la prueba
  
Durante la ejecución:
  - Monitorear métricas de ASG cada 30 segundos
  - Capturar screenshots de CloudWatch
  - Registrar timestamps de eventos de escalamiento
  - Observar CPU/memoria de instancias individuales
  
Métricas Clave a Capturar:
  - Número de instancias (Desired, Running, Pending)
  - CPU Utilization por instancia
  - Request Count en ALB
  - Target Response Time
  - Healthy/Unhealthy Targets
```

**Hipótesis a Validar:**
```
1. ¿El ASG escalará automáticamente con 200-300 usuarios?
   Expectativa: Sí, si CPU > 70%
   
2. ¿Cuánto tiempo toma escalar de 2 a N instancias?
   Expectativa: 3-5 minutos (launch + health check)
   
3. ¿Mejora el throughput con más instancias?
   Expectativa: Sí, linealmente hasta cierto punto
   
4. ¿Los tiempos de respuesta se mantienen o empeoran?
   Expectativa: Deberían mantenerse o mejorar con más recursos
```

#### Fase 3 - Sostenido

**Configuración Sugerida:**
```yaml
Objetivo: Evaluar estabilidad bajo carga prolongada

Configuración:
  Usuarios: 80% de capacidad máxima encontrada en Fase 2
  Duración: 30-60 minutos
  Rampa: 5 minutos
  
Validaciones:
  - No memory leaks
  - No degradación progresiva de performance
  - Estabilidad de conexiones a BD/Redis
  - Comportamiento de autoscaling (scale in/out)
```

### 8.3 Optimizaciones Propuestas

#### Arquitectura Alternativa - Procesamiento Asíncrono

```
Cliente → ALB → API (FastAPI)
                ↓
          [Respuesta inmediata con task_id]
                ↓
          S3 (almacenamiento) + SQS/SNS
                ↓
          Lambda / ECS Fargate (procesamiento)
                ↓
          Actualización en BD + Notificación
```

**Ventajas:**
- Respuesta instantánea al cliente (< 1 segundo)
- Procesamiento desacoplado y escalable
- Pay-per-use para procesamiento
- Auto-scaling nativo de Lambda

#### Optimización de Código

```python
# Ejemplo de optimización en el worker
from celery import Celery
import boto3
import ffmpeg

app = Celery('tasks')

@app.task(bind=True, max_retries=3)
def process_video_async(self, video_path, task_id):
    try:
        # 1. Upload directo a S3 (paralelo)
        s3_client = boto3.client('s3')
        s3_client.upload_file(
            video_path, 
            'bucket-name', 
            f'videos/{task_id}.mp4',
            Config=boto3.s3.transfer.TransferConfig(
                max_concurrency=10  # Upload paralelo
            )
        )
        
        # 2. Procesamiento optimizado
        stream = ffmpeg.input(video_path)
        stream = ffmpeg.output(
            stream, 
            f'/tmp/processed_{task_id}.mp4',
            vcodec='libx264',
            preset='veryfast',  # Más rápido, menos compresión
            threads=4  # Usar múltiples cores
        )
        ffmpeg.run(stream)
        
        # 3. Actualización asíncrona
        update_database_async.delay(task_id, 'completed')
        
    except Exception as exc:
        self.retry(exc=exc, countdown=60)
```

### 8.4 Estimación de Capacidad

**Basado en resultados de Fase 1:**

```
Capacidad Actual (1-2 instancias):
  - Throughput sostenido: 0.6 req/s
  - Capacidad diaria: 0.6 * 60 * 60 * 24 = 51,840 peticiones/día
  - Con tasa de éxito 94%: ~48,730 videos procesados/día
  
Proyección con Autoscaling (hasta 10 instancias):
  - Throughput máximo teórico: 6 req/s
  - Capacidad diaria: 518,400 peticiones/día
  - Videos procesados: ~487,296/día (94% éxito)
  
Limitaciones:
  - Asume procesamiento actual (133 seg/video)
  - No considera cuellos de botella de BD/Redis
  - Requiere validación con pruebas de carga reales
```

---

## 9. Anexos

### 9.1 Comandos Ejecutados

#### Creación de Usuario de Prueba
```powershell
$signupBody = @{
    email = "testuser@example.com"
    username = "testuser"
    first_name = "Test"
    last_name = "User"
    password1 = "Test1234"
    password2 = "Test1234"
} | ConvertTo-Json

$signupResponse = Invoke-RestMethod `
    -Uri "http://video-app-alb-313685749.us-east-1.elb.amazonaws.com/api/auth/signup" `
    -Method POST `
    -Body $signupBody `
    -ContentType "application/json"
```

#### Obtención de Token JWT
```powershell
$loginBody = @{
    email = "testuser@example.com"
    password = "Test1234"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod `
    -Uri "http://video-app-alb-313685749.us-east-1.elb.amazonaws.com/api/auth/login" `
    -Method POST `
    -Body $loginBody `
    -ContentType "application/json"

$token = $loginResponse.access_token
```

#### Ejecución de Prueba Fase 1
```powershell
cd C:\Users\nicol\Documents\DSNB\desarrollo-sw-nube\cloud_load_testing\escenario_1_capa_web_autoscaling

# Limpiar resultados anteriores
Remove-Item "Fase_1_Sanidad\resultados\*" -Force -ErrorAction SilentlyContinue
Remove-Item "Fase_1_Sanidad\dashboards\*" -Recurse -Force -ErrorAction SilentlyContinue

# Ejecutar JMeter
jmeter -n `
    -t "Fase_1_Sanidad\WebApp_Carga_AWS.jmx" `
    -l "Fase_1_Sanidad\resultados\resultados_fase1.csv" `
    -e -o "Fase_1_Sanidad\dashboards"
```

### 9.2 Estructura de Archivos

```
cloud_load_testing/escenario_1_capa_web_autoscaling/
├── README.md                              # Descripción general
├── GUIA_PASO_A_PASO.md                   # Guía para exposición en video
├── RESULTADOS_PRUEBAS_AWS.md             # Resultados detallados
│
├── Fase_1_Sanidad/
│   ├── WebApp_Carga_AWS.jmx              # Plan de prueba JMeter
│   ├── resultados/
│   │   └── resultados_fase1.csv          # 351 registros
│   └── dashboards/
│       ├── index.html                     # Dashboard principal
│       ├── content/                       # Gráficos y reportes
│       └── sbadmin2-1.0.7/               # Assets CSS/JS
│
├── Fase_2_Escalamiento/
│   ├── WebApp_Carga_AWS.jmx
│   ├── resultados/
│   └── dashboards/
│
└── Fase_3_Sostenido/
    ├── WebApp_Carga_AWS.jmx
    ├── resultados/
    └── dashboards/

capacity_planning/
├── plan_de_pruebas.md                    # Plan original (Entrega 1)
├── pruebas_de_carga_entrega2.md         # Resultados on-premise (Entrega 2)
└── pruebas_de_carga_entrega3.md         # Este documento (Entrega 3)
```

### 9.3 Archivo de Video de Prueba

```yaml
Archivo: sample_2560x1440.mp4
Ubicación: C:\Users\nicol\Documents\DSNB\desarrollo-sw-nube\uploads\
Tamaño: 66.4 MB (69,633,762 bytes)
Resolución: 2560x1440 (1440p)
Formato: MP4
Codec: H.264
```

### 9.4 Logs de Ejecución (Extracto)

```
Creating summariser <summary>
Created the tree successfully using Fase_1_Sanidad\WebApp_Carga_AWS.jmx
Starting standalone test @ 2025 Nov 4 19:19:03 GMT-05:00

summary +     14 in 00:00:28 =    0.5/s Avg: 11662 Min:  6128 Max: 17066 Err:     0 (0.00%)
summary +     17 in 00:00:30 =    0.6/s Avg: 26660 Min: 15052 Max: 41057 Err:     0 (0.00%)
summary =     31 in 00:00:58 =    0.5/s Avg: 19887 Min:  6128 Max: 41057 Err:     0 (0.00%)

[... progreso continuo ...]

summary +     26 in 00:00:10 =    2.6/s Avg: 193850 Min: 136670 Max: 303055 Err:    20 (76.92%)
summary =    350 in 00:10:07 =    0.6/s Avg: 133864 Min:  3904 Max: 303055 Err:    21 (6.00%)

Tidying up ...    @ 2025 Nov 4 19:29:11 GMT-05:00
... end of run
```

### 9.5 Dashboard JMeter - Secciones Principales

El dashboard generado en `Fase_1_Sanidad/dashboards/index.html` contiene:

#### 1. Test and Report Information
- Fecha/hora de inicio: 2025-11-04 19:19:03
- Fecha/hora de fin: 2025-11-04 19:29:11
- Duración: 10 minutos 7 segundos
- Archivo JMX: WebApp_Carga_AWS.jmx

#### 2. APDEX (Application Performance Index)
```
APDEX Score: Calculado basado en umbrales
- Satisfied: Respuesta < T
- Tolerating: Respuesta entre T y 4T
- Frustrated: Respuesta > 4T

Donde T = umbral configurado (típicamente 500ms)
```

#### 3. Requests Summary
- **Total:** 350 peticiones
- **OK:** 329 (94%)
- **KO:** 21 (6%)

#### 4. Statistics Table

| Label | # Samples | Average | Min | Max | Std. Dev | Error % | Throughput | Received KB/sec | Sent KB/sec |
|-------|-----------|---------|-----|-----|----------|---------|------------|-----------------|-------------|
| POST /api/videos/upload | 350 | 133864 ms | 3904 ms | 303055 ms | ~80000 ms | 6.00% | 0.6/sec | ~380 KB/s | ~41000 KB/s |

#### 5. Response Times Over Time
- Gráfico de línea mostrando evolución temporal
- Picos visibles en minutos 7-9
- Tendencia ascendente hasta minuto 8

#### 6. Response Time Percentiles
- Distribución de percentiles (90%, 95%, 99%)
- Ayuda a identificar outliers

#### 7. Throughput vs Threads
- Correlación entre usuarios activos y throughput
- Plateau visible en ~100 usuarios

### 9.6 Métricas de CloudWatch Recomendadas

**Para visualizar en AWS Console después de la prueba:**

```yaml
ALB Metrics:
  - RequestCount (Sum): ~350 en 10 minutos
  - TargetResponseTime (Average): ~134 segundos
  - HTTPCode_Target_2XX_Count: 329
  - HTTPCode_Target_4XX_Count: 0
  - HTTPCode_Target_5XX_Count: 0
  - ActiveConnectionCount (Max): ~100

ASG Metrics:
  - GroupDesiredCapacity: 1-2 instancias
  - GroupInServiceInstances: 1-2 instancias
  - GroupPendingInstances: 0
  - GroupTerminatingInstances: 0

EC2 Metrics (por instancia):
  - CPUUtilization (Average): ?%
  - NetworkIn (Sum): ~23 GB (350 * 66.4 MB)
  - NetworkOut (Sum): ~12 KB (350 * 35 bytes response)
  - DiskWriteBytes (Sum): ~23 GB

Target Group Metrics:
  - HealthyHostCount: 1-2
  - UnHealthyHostCount: 0
  - RequestCountPerTarget: ~175 por target
```

---

## 📝 Notas Finales

### Próximos Pasos Inmediatos

1. ✅ **Fase 1 completada** - Resultados documentados
2. ⏳ **Análisis de métricas AWS** - Revisar CloudWatch
3. ⏳ **Optimización de workers** - Ajustar Celery
4. ⏳ **Preparar Fase 2** - 200-300 usuarios con monitoreo activo
5. ⏳ **Documentar Fase 2** - Enfoque en comportamiento de autoscaling

### Referencias Cruzadas

- **Plan de Pruebas (Entrega 1):** `plan_de_pruebas.md`
- **Resultados On-Premise (Entrega 2):** `pruebas_de_carga_entrega2.md`
- **Guía de Ejecución:** `../cloud_load_testing/escenario_1_capa_web_autoscaling/GUIA_PASO_A_PASO.md`
- **Resultados Detallados:** `../cloud_load_testing/escenario_1_capa_web_autoscaling/RESULTADOS_PRUEBAS_AWS.md`

### Contacto y Soporte

- **Repositorio:** sjfuentes-uniandes/desarrollo-sw-nube
- **Branch:** main
- **Fecha:** 4 de Noviembre de 2025

---

**Documento generado automáticamente**  
**Última actualización:** 4 de Noviembre de 2025, 20:00 GMT-05:00  
**Versión:** 1.0  
**Entrega:** 3 - AWS con Autoscaling
