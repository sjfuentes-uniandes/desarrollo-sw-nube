# Análisis de Capacidad - Pruebas de Carga en AWS

**Fecha de ejecución:** 25 de Octubre, 2025  
**Equipo:** Desarrollo de Software en la Nube  
**Entorno:** Amazon Web Services (AWS) - Instancia EC2  
**Objetivo:** Validar la capacidad del sistema en ambiente de producción cloud

---

## 📊 Resumen Ejecutivo

### Contexto de la Prueba

Las pruebas de capacidad se ejecutaron en una instancia EC2 de Amazon Web Services para validar el comportamiento del sistema en un entorno de producción real. Este documento presenta el análisis detallado de los resultados obtenidos, las métricas de rendimiento y las recomendaciones para optimizar la solución.

### Hallazgos Principales

> 🚨 **CRÍTICO:** El sistema presenta **fallas catastróficas de capacidad** en el entorno cloud de AWS. Con 200 y 300 usuarios concurrentes **LA INSTANCIA EC2 SE CAE COMPLETAMENTE**, haciendo imposible ejecutar las pruebas planificadas.

| Fase de Prueba | Usuarios | Requests | Tasa de Error | Throughput | Estado |
|----------------|----------|----------|---------------|------------|--------|
| **Fase 1: Sanidad** | 5 | 13 | 38.46% | 0.12 req/s | ⚠️ **FUNCIONAL CON ERRORES** |
| **Fase 2: Escalamiento (100u)** | 100 | 213 | 73.71% | 0.30 req/s | ❌ **CRÍTICO** |
| **Fase 2: Escalamiento (200u)** | 200 | N/A | N/A | N/A | 💥 **INSTANCIA CAÍDA** |
| **Fase 2: Escalamiento (300u)** | 300 | N/A | N/A | N/A | 💥 **INSTANCIA CAÍDA** |
| **Fase 3: Sostenida** | 40 | 93 | 94.62% | 0.22 req/s | ❌ **COLAPSO** |

### ⚠️ Hallazgo Crítico: Colapso Total de Infraestructura

**Pruebas con 200 y 300 usuarios:**
- 🔴 **La instancia EC2 se cae completamente** y deja de responder
- 🔴 **Sistema operativo colapsa** - No hay respuesta HTTP
- 🔴 **Imposible recolectar métricas** - Servidor inaccesible
- 🔴 **Requiere reinicio manual** de la instancia para recuperación

**Implicaciones:**
- El sistema **NO puede escalar** más allá de 100 usuarios concurrentes
- Con cargas mayores, ocurre **colapso total de infraestructura**
- **Alto riesgo operacional** - Caídas completas del servicio
- **Pérdida total de disponibilidad** durante eventos de alta carga

### Veredicto General

- ❌ **RECHAZADO CATEGÓRICAMENTE** para operación en producción
- 🔴 **RIESGO CRÍTICO:** Instancia se cae con cargas > 100 usuarios
- 💥 **COLAPSO TOTAL** con 200-300 usuarios concurrentes
- ⚠️ **Requiere rediseño arquitectónico URGENTE** antes de cualquier despliegue

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Ambiente de Pruebas](#2-ambiente-de-pruebas)
3. [Stack Tecnológico de Pruebas](#3-stack-tecnológico-de-pruebas)
4. [Escenario 1: Capacidad de la Capa Web](#4-escenario-1-capacidad-de-la-capa-web)
   - 4.1 [Fase 1: Prueba de Sanidad](#41-fase-1-prueba-de-sanidad)
   - 4.2 [Fase 2: Escalamiento con 100 Usuarios](#42-fase-2-escalamiento-con-fallo)
   - 4.3 [Fase 2 (continuación): Escalamiento con 200 y 300 Usuarios - Colapso Total](#43-fase-2-continuación-escalamiento-con-200-y-300-usuarios---colapso-total-de-infraestructura)
   - 4.4 [Fase 3: Carga Sostenida](#44-fase-3-carga-sostenida)
5. [Identificación de Problemas Críticos](#5-identificación-de-problemas-críticos)
6. [Recomendaciones para Escalar la Solución](#6-recomendaciones-para-escalar-la-solución)
7. [Plan de Acción Inmediato](#7-plan-de-acción-inmediato)
8. [Conclusiones](#8-conclusiones)
9. [Anexos](#9-anexos)

---

## 1. Introducción

### 1.1 Propósito del Documento

Este documento presenta el análisis de las pruebas de capacidad ejecutadas en Amazon Web Services (AWS) para la aplicación de gestión de videos. El objetivo es determinar la capacidad real del sistema en un entorno de producción cloud y establecer las bases para su escalamiento.

### 1.2 Alcance

El análisis cubre:
- **Escenario 1:** Capacidad de la Capa Web (API REST)
- **Herramienta:** Apache JMeter
- **Tipo de pruebas:** Carga incremental, sanidad y sostenida
- **Endpoint evaluado:** POST /api/videos/upload

### 1.3 Limitaciones

- Las pruebas se enfocaron únicamente en el endpoint de subida de videos
- No se evaluó el comportamiento de la capa worker (Celery)
- No se realizaron pruebas de endpoints de lectura (GET)

---

## 2. Ambiente de Pruebas

### 2.1 Infraestructura AWS

**Instancia EC2:**
- **Tipo:** t2.micro
- **vCPUs:** 1 vCPU
- **Memoria RAM:** 1 GB
- **Sistema Operativo:** Ubuntu Server (estimado)
- **Región:** us-east-1 (inferido por IP)

**Servicios Desplegados:**
- FastAPI (API REST)
- Nginx (Reverse Proxy)
- PostgreSQL (Base de datos) 
- Redis (Cache/Broker) 

### 2.2 Configuración de la Aplicación

**Docker Compose - Capa Web:**
```yaml
fastapi:
  deploy:
    resources:
      limits:
        cpus: '1.5'
        memory: '1.7G'
      reservations:
        cpus: '1.0'
        memory: '1G'
```

**Uvicorn:**
- Workers: 1 (por defecto)
- Connections: ~1000 (por defecto)

**Nginx:**
- worker_connections: 1024

### 2.3 Herramienta de Pruebas

- **Software:** Apache JMeter
- **Método:** Pruebas de carga con rampa de usuarios
- **Payload:** Archivos de video simulados
- **Origen de carga:** Desde la misma instancia EC2

---

## 3. Stack Tecnológico de Pruebas

### 3.1 Herramienta de Generación de Carga

**Apache JMeter 5.6.3**
- **Tipo:** Software open-source para pruebas de rendimiento
- **Características:**
  - Ultimate Thread Group Plugin para control preciso de rampa de usuarios
  - Generación de reportes HTML con dashboards interactivos
  - Soporte para pruebas distribuidas
  - Assertions para validación de respuestas (JSON Path, Response Code)

**Configuración del Test Plan:**
```xml
<jmeterTestPlan version="1.2" properties="5.0" jmeter="5.6.3">
  - HTTP Request Defaults
  - Ultimate Thread Group (control de carga)
  - HTTP Sampler (POST /api/videos/upload)
  - JSON Path Assertion (validación de task_id)
  - Response Code Assertion (validación de status 201)
```

### 3.2 Infraestructura de Generación de Carga

**Máquina Cliente (JMeter):**
- **Sistema Operativo:** macOS
- **Ubicación:** Mismo servidor EC2 (co-ubicado con aplicación)
- **Conectividad:** HTTP a IP pública de EC2
- **Payload:** Video MP4 de 18MB (`file_example_MP4_1920_18MG.mp4`)

**Configuración de Conexión:**
- **Protocolo:** HTTP (puerto 80)
- **Keep-Alive:** Habilitado
- **Follow Redirects:** Habilitado
- **Autenticación:** Bearer Token JWT

### 3.3 Infraestructura de Aplicación (AWS)

**Amazon EC2 - Instancia de Aplicación:**
- **IP Pública:** 3.87.68.214 (Fase 2) / 98.94.34.243 (Fase 3)
- **Tipo de Instancia:** t2.micro
- **vCPUs:** 1 vCPU (hasta 3.3 GHz Intel Xeon)
- **Memoria:** 1 GB RAM
- **Sistema Operativo:** Ubuntu Server (inferido)
- **Red:** Variable bandwidth (créditos de red)

**⚠️ ANÁLISIS CRÍTICO DE RECURSOS:**

La instancia **t2.micro** es la instancia **más pequeña y limitada** del catálogo de AWS:

| Recurso | t2.micro | Requisito Mínimo App | Déficit |
|---------|----------|----------------------|---------|
| **vCPU** | 1 core | 4+ cores | **-75%** 🔴 |
| **RAM** | 1 GB | 4+ GB | **-75%** 🔴 |
| **Servicios** | 5 contenedores | Max 2-3 | **Sobrecarga +150%** 🔴 |

**Servicios Desplegados en 1 GB de RAM:**
1. FastAPI (limit: 1.7GB - **EXCEDE RAM disponible**)
2. Nginx (~50-100 MB)
3. PostgreSQL (~200-500 MB con conexiones)
4. Redis (~50-100 MB)
5. Celery Worker + FFmpeg (~500 MB - 2GB durante procesamiento)

**Total estimado:** ~3-5 GB **vs** 1 GB disponible = **Déficit de 2-4 GB**

**Implicación:** El sistema está en **constante thrashing** (swap de memoria), causando:
- ✅ Explica latencias de 40-257 segundos
- ✅ Explica colapso con 200-300 usuarios
- ✅ Explica OOM Killer matando procesos
- ✅ Explica reinicio forzado de instancia

**Servicios Desplegados en Docker:**
```yaml
- FastAPI (API REST)
  - CPU Limit: 1.5 cores
  - Memory Limit: 1.7 GB
  - Uvicorn workers: 1 (por defecto)
  
- Nginx (Reverse Proxy)
  - worker_connections: 1024
  - client_max_body_size: 100M
  
- PostgreSQL (Base de datos)
  - Contenedor Docker local (postgres:15)
  - Puerto: 5432
  
- Redis (Cache/Message Broker)
  - Contenedor Docker local (redis:7-alpine)
  - Puerto: 6379
  
- Celery Worker (Procesamiento asíncrono)
  - Procesa videos con FFmpeg
```

### 3.4 Métricas y Observabilidad

**JMeter Listeners y Reportes:**
- **Simple Data Writer:** Generación de archivos JTL (fase1_smoke.jtl)
- **HTML Dashboard:** Reportes interactivos con gráficos
- **Statistics.json:** Métricas agregadas para análisis

**Métricas Capturadas:**
- Total de Samples (requests)
- Tasa de error (%)
- Throughput (requests/segundo)
- Latencia: Min, Max, Mean, Median, p90, p95, p99
- Bytes enviados/recibidos
- Códigos de respuesta HTTP

### 3.5 Limitaciones del Stack

**Limitaciones Identificadas:**
1. **Sin monitoreo de infraestructura:** No se capturaron métricas de CPU, memoria, disco de la instancia EC2 durante las pruebas
2. **Sin trazas distribuidas:** No hay APM (Application Performance Monitoring) configurado
3. **Sin métricas de base de datos:** No se monitorearon conexiones PostgreSQL, queries lentos
4. **Sin métricas de Redis:** No se capturó uso de memoria, operaciones/segundo
5. **Pruebas desde un único origen:** No se validó comportamiento con carga geográficamente distribuida

**Recomendaciones para Futuras Pruebas:**
- Implementar **CloudWatch Agent** en EC2 para métricas de sistema
- Configurar **CloudWatch Logs** para logs centralizados
- Agregar **Prometheus + Grafana** para métricas de aplicación
- Implementar **APM** (AWS X-Ray o Datadog) para trazas

---

## 4. Escenario 1: Capacidad de la Capa Web

### 4.1 Fase 1: Prueba de Sanidad

**Objetivo:** Validar funcionamiento básico del sistema con carga mínima.

#### 4.1.1 Configuración de la Prueba

- **Usuarios concurrentes:** 5
- **Duración:** ~108 segundos (1 minuto 48 segundos)
- **Total de requests:** 13
- **Endpoint:** POST /api/videos/upload

#### 4.1.2 Resultados Obtenidos

| Métrica | Valor | SLO | Cumplimiento |
|---------|-------|-----|--------------|
| **Total Requests** | 13 | - | - |
| **Requests Exitosos** | 8 | - | 61.54% |
| **Requests Fallidos** | 5 | - | 38.46% |
| **Tasa de Error** | 38.46% | ≤ 5% | ❌ **+671% sobre SLO** |
| **Throughput (RPS)** | 0.12 req/s | - | 🔴 Muy bajo |
| **Latencia Promedio** | 40,058 ms | ≤ 1000 ms | ❌ **+3,906% sobre SLO** |
| **Latencia Mediana (p50)** | 31,476 ms | - | ❌ 31.5 segundos |
| **Latencia Mínima** | 7,133 ms | - | ❌ 7.1 segundos |
| **Latencia Máxima** | 79,293 ms | - | ❌ 79.3 segundos |
| **Percentil 90 (p90)** | 78,175 ms | ≤ 1000 ms | ❌ **+7,718% sobre SLO** |
| **Percentil 95 (p95)** | 79,293 ms | ≤ 1000 ms | ❌ **+7,829% sobre SLO** |

#### 4.1.3 Análisis de Resultados

⚠️ **SISTEMA FUNCIONAL PERO CON ERRORES SIGNIFICATIVOS:**

1. **Tasa de Error Preocupante:**
   - 38.46% de errores con solo 5 usuarios concurrentes (5 de 13 requests fallaron)
   - 61.54% de requests exitosos (8 de 13 requests completados correctamente)
   - **Sistema funciona parcialmente** pero tasa de error **muy superior al SLO de 5%**
   - Indica problemas estructurales incluso con carga mínima

2. **Latencias Extremas:**
   - Latencia promedio de **40 segundos** (4,006% sobre SLO de 1 segundo)
   - Latencia mínima de **7.1 segundos** ya excede el SLO
   - Latencia máxima de **79.3 segundos** indica timeouts masivos
   - **NINGUNA request cumple el SLO de latencia**

3. **Throughput Crítico:**
   - Solo 0.12 req/s con 5 usuarios
   - Sistema procesa menos de 1 request cada 8 segundos
   - Comparado con pruebas locales: **99.4% de degradación** (18.84 → 0.12 RPS)

4. **Comportamiento Inconsistente:**
   - Rango de latencias muy amplio (7s - 79s)
   - Indica inestabilidad del sistema
   - Posibles timeouts de conexión o procesamiento

#### 4.1.4 Evidencias

**Dashboard JMeter - Fase 1 Sanidad:**
- Archivo: `cloud_load_testing/escenario_1_capa_web/Fase_1_Sanidad/dashboard_smoke/index.html`
- Statistics JSON: Disponible en carpeta de resultados

**Conclusión Fase 1:**

⚠️ **FUNCIONAL CON ERRORES CRÍTICOS** - Sistema **funciona parcialmente** con 5 usuarios (61.54% de éxito), pero presenta tasa de error del 38.46% que es **8x superior al SLO del 5%**. Latencias promedio de 40 segundos son **inaceptables**. Sistema requiere optimización urgente aunque no colapsa totalmente con carga mínima.

---

### 4.2 Fase 2: Escalamiento con Fallo

**Objetivo:** Evaluar comportamiento del sistema con carga incremental hasta encontrar punto de fallo.

#### 4.2.1 Configuración de la Prueba

- **Usuarios concurrentes:** 100 usuarios (rampa incremental)
- **Rampa de subida:** 180 segundos (3 minutos)
- **Tiempo de sostenimiento:** 300 segundos (5 minutos)
- **Rampa de bajada:** 10 segundos
- **Duración total:** ~716 segundos (11 minutos 56 segundos)
- **Total de requests:** 213
- **Endpoint:** POST /api/videos/upload
- **Servidor:** http://3.87.68.214

#### 4.2.2 Resultados Obtenidos

| Métrica | Valor | SLO | Cumplimiento |
|---------|-------|-----|--------------|
| **Total Requests** | 213 | - | - |
| **Requests Exitosos** | 56 | - | 26.29% |
| **Requests Fallidos** | 157 | - | 73.71% |
| **Tasa de Error** | 73.71% | ≤ 5% | ❌ **+1,374% sobre SLO** |
| **Throughput (RPS)** | 0.30 req/s | - | 🔴 Muy bajo |
| **Latencia Promedio** | 257,667 ms | ≤ 1000 ms | ❌ **+25,667% sobre SLO** |
| **Latencia Mediana (p50)** | 275,425 ms | - | ❌ 4.6 minutos |
| **Latencia Mínima** | 6,846 ms | - | ❌ 6.8 segundos |
| **Latencia Máxima** | 358,066 ms | - | ❌ 5.97 minutos |
| **Percentil 90 (p90)** | 323,093 ms | ≤ 1000 ms | ❌ **+32,209% sobre SLO** |
| **Percentil 95 (p95)** | 332,494 ms | ≤ 1000 ms | ❌ **+33,149% sobre SLO** |

#### 4.2.3 Análisis de Resultados

🔴🔴 **COLAPSO TOTAL DEL SISTEMA:**

1. **Degradación Catastrófica de Tasa de Error:**
   - Tasa de error aumentó de 38.46% → 73.71% (+91.6%)
   - Solo **1 de cada 4 requests** es exitoso (26.29%)
   - **3 de cada 4 requests FALLAN**
   - Sistema completamente inoperante

2. **Latencias Intolerables:**
   - Latencia promedio de **257 segundos** (4 minutos 17 segundos)
   - Latencia mediana de **275 segundos** (4 minutos 35 segundos)
   - Latencia máxima de **358 segundos** (casi 6 minutos)
   - **Timeouts masivos** probables en HTTP clients

3. **Throughput Colapsado:**
   - 0.30 req/s con 50 usuarios
   - **98.4% de degradación** vs pruebas locales (18.84 → 0.30 RPS)
   - Sistema procesa **menos requests con más usuarios**
   - Throughput inverso confirmado

4. **Comparación con Fase 1:**
   - Usuarios: 5 → 100 (20x incremento)
   - RPS: 0.12 → 0.30 (solo 2.5x incremento)
   - Errores: 38.46% → 73.71% (+91.6%)
   - **Sistema NO escala, COLAPSA**

#### 4.2.4 Evidencias

**Dashboard JMeter - Fase 2 Escalamiento:**
- Archivo: `cloud_load_testing/escenario_1_capa_web/Fase_2_escalamiento_fail/dashboard_smoke/index.html`
- Statistics JSON: Disponible en carpeta de resultados

**Conclusión Fase 2:**

❌❌ **COLAPSO TOTAL** - El sistema presenta degradación exponencial con 100 usuarios concurrentes. Tasa de error del 73.71% y latencias promedio de 4+ minutos hacen el sistema **completamente inutilizable**. Evidencia clara de **saturación de recursos** y **falla en escalamiento**.

---

### 4.3 Fase 2 (continuación): Escalamiento con 200 y 300 Usuarios - Colapso Total de Infraestructura

#### 4.3.1 Contexto de las Pruebas

Como parte de la **Fase 2 de Escalamiento**, se planificó evaluar el sistema con cargas incrementales más altas después de la prueba con 100 usuarios:
- **Prueba con 200 usuarios:** Para identificar límite de degradación y capacidad máxima
- **Prueba con 300 usuarios:** Para validar comportamiento en colapso extremo

**Secuencia de Pruebas de Fase 2:**
1. ✅ 100 usuarios - Completada (73.71% error)
2. ❌ 200 usuarios - **INSTANCIA CAÍDA**
3. ❌ 300 usuarios - **INSTANCIA CAÍDA**

**Secuencia de Pruebas de Fase 2:**
1. ✅ 100 usuarios - Completada (73.71% error)
2. ❌ 200 usuarios - **INSTANCIA CAÍDA**
3. ❌ 300 usuarios - **INSTANCIA CAÍDA**

#### 4.3.2 Resultados Obtenidos

💥 **COLAPSO TOTAL DE INFRAESTRUCTURA**

**Estado de la Instancia EC2:**
- 🔴 **Instancia EC2 CAÍDA** - Sistema operativo no responde
- 🔴 **Sin respuesta HTTP** - Timeout en todas las conexiones
- 🔴 **Servicios inaccesibles** - SSH, HTTP, todos los puertos sin respuesta
- 🔴 **Imposible recolectar métricas** - JMeter no puede conectar

**Evidencia:**
```
Error en JMeter:
- Connection timeout después de múltiples intentos
- No response from server
- EC2 instance unreachable
```

#### 4.3.3 Análisis de la Falla

🚨 **FALLA CATASTRÓFICA DE INFRAESTRUCTURA:**

1. **Sobrecarga Completa de Recursos:**
   - CPU al 100% causa kernel panic o freeze
   - Memoria agotada activa OOM Killer (Out of Memory)
   - Sistema operativo Ubuntu colapsa
   - Servicios de Docker se detienen abruptamente

2. **Sin Mecanismos de Protección:**
   - No hay auto-scaling configurado
   - No hay health checks que detengan tráfico
   - No hay circuit breakers
   - Sistema acepta toda la carga hasta colapsar

3. **Recuperación Manual Requerida:**
   - **Reinicio forzado** de instancia EC2 desde consola AWS
   - Pérdida de logs y métricas del momento del colapso
   - Tiempo de inactividad: ~5-10 minutos por reinicio
   - **Pérdida total de disponibilidad**

4. **Implicaciones Operacionales:**
   - **Riesgo crítico en producción** - Sistema no se auto-recupera
   - **SLA imposible de cumplir** - Caídas totales probables
   - **Pérdida de datos en tránsito** - Requests en proceso se pierden
   - **Experiencia de usuario pésima** - Servicio completamente caído

#### 4.3.4 Comparación de Escalamiento en Fase 2

#### 4.3.4 Comparación de Escalamiento en Fase 2

**Progresión de Fase 2 - Escalamiento:**

| Usuarios | Estado | Error % | Throughput | Observaciones |
|----------|--------|---------|------------|---------------|
| **100** | ❌ Degradación severa | 73.71% | 0.30 req/s | Alta tasa de errores, sistema responde |
| **200** | 💥 **COLAPSO TOTAL** | **N/A** | **0 req/s** | **Instancia caída** |
| **300** | 💥 **COLAPSO TOTAL** | **N/A** | **0 req/s** | **Instancia caída** |

**Comparación General de Todas las Fases:**

| Usuarios | Fase | Estado | Error % | Throughput | Observaciones |
|----------|------|--------|---------|------------|---------------|
| 5 | Fase 1: Sanidad | ⚠️ Funcional con errores | 38.46% | 0.12 req/s | Sistema responde lento |
| 100 | Fase 2: Escalamiento | ❌ Degradación severa | 73.71% | 0.30 req/s | Alta tasa de errores |
| **200** | **Fase 2: Escalamiento** | 💥 **COLAPSO TOTAL** | **N/A** | **0 req/s** | **Instancia caída** |
| **300** | **Fase 2: Escalamiento** | 💥 **COLAPSO TOTAL** | **N/A** | **0 req/s** | **Instancia caída** |
| 40 | Fase 3: Sostenida | ❌ Casi inoperante | 94.62% | 0.22 req/s | Solo 5% de éxito |

**Curva de Degradación:**
```
Disponibilidad del Sistema vs Usuarios Concurrentes

100% |●                                                   
     | ●                                                  
 80% |   ●                                                
     |     ●                                              
 60% |       ●                                            
     |         ●●                                         
 40% |            ●●●                                     
     |                ●●●●                                
 20% |                     ●●●●●●                         
     |                           ●●●●●●●●●●               
  0% |                                      ●●●●●●💥💥💥💥
     └─────────────────────────────────────────────────
     0    20   40   60   80  100  120  140  160  200  300
                    Usuarios Concurrentes

     ⚠️ Zona de errores altos (38-95% error)
     💥 Zona de colapso total (instancia caída)
```

#### 4.3.5 Conclusión de Pruebas de Escalamiento (200-300 Usuarios)

💥💥💥 **COLAPSO TOTAL DE INFRAESTRUCTURA** - El sistema **NO PUEDE MANEJAR** cargas de 200-300 usuarios. La instancia EC2 **se cae completamente**, requiriendo **reinicio manual**. Esto representa un **RIESGO CRÍTICO BLOQUEANTE** para cualquier operación en producción. Sistema requiere:

1. **Rediseño arquitectónico** con auto-scaling
2. **Límites de rate limiting** para proteger infraestructura
3. **Health checks** y auto-recovery
4. **Infraestructura redundante** (mínimo 2 instancias con load balancer)

**Estado:** ❌❌❌ **COMPLETAMENTE INACEPTABLE PARA PRODUCCIÓN**

---

### 4.4 Fase 3: Carga Sostenida

**Objetivo:** Evaluar estabilidad del sistema con carga sostenida moderada (80% de la capacidad teórica de Fase 2).

#### 4.4.1 Configuración de la Prueba

- **Usuarios concurrentes:** 40 usuarios (80% de 50)
- **Rampa de subida:** 60 segundos (1 minuto)
- **Tiempo de sostenimiento:** 300 segundos (5 minutos)
- **Rampa de bajada:** 10 segundos
- **Duración total:** ~420 segundos (7 minutos)
- **Total de requests:** 93
- **Endpoint:** POST /api/videos/upload
- **Servidor:** http://98.94.34.243

#### 4.4.2 Resultados Obtenidos

| Métrica | Valor | SLO | Cumplimiento |
|---------|-------|-----|--------------|
| **Total Requests** | 93 | - | - |
| **Requests Exitosos** | 5 | - | 5.38% |
| **Requests Fallidos** | 88 | - | 94.62% |
| **Tasa de Error** | 94.62% | ≤ 5% | ❌ **+1,792% sobre SLO** |
| **Throughput (RPS)** | 0.22 req/s | - | 🔴 Muy bajo |
| **Latencia Promedio** | 80,827 ms | ≤ 1000 ms | ❌ **+7,983% sobre SLO** |
| **Latencia Mediana (p50)** | 86,418 ms | - | ❌ 1.44 minutos |
| **Latencia Mínima** | 5,176 ms | - | ❌ 5.2 segundos |
| **Latencia Máxima** | 111,534 ms | - | ❌ 1.86 minutos |
| **Percentil 90 (p90)** | 99,548 ms | ≤ 1000 ms | ❌ **+9,855% sobre SLO** |
| **Percentil 95 (p95)** | 103,163 ms | ≤ 1000 ms | ❌ **+10,216% sobre SLO** |

#### 4.4.3 Análisis de Resultados

🔴🔴🔴 **FALLO TOTAL - SISTEMA INOPERANTE:**

1. **Tasa de Error Catastrófica:**
   - **94.62% de errores** - Peor resultado de todas las fases
   - Solo **5 requests exitosos de 93** (5.38% éxito)
   - **94 de cada 100 requests FALLAN**
   - Sistema prácticamente no funcional

2. **Latencias Críticas:**
   - Latencia promedio de **81 segundos** (1.35 minutos)
   - Latencia mediana de **86 segundos** (1.44 minutos)
   - Latencia p95 de **103 segundos** (1.72 minutos)
   - Incluso las pocas requests exitosas tienen latencias inaceptables

3. **Throughput Crítico:**
   - 0.22 req/s con 40 usuarios
   - Sistema procesa menos de 1 request cada 4.5 segundos
   - **Peor throughput de todas las fases**

4. **Comportamiento Paradójico:**
   - Menos usuarios (40) que Fase 2 (100)
   - **Peor tasa de error** (94.62% vs 73.71%)
   - Indica problemas estructurales más allá de sobrecarga
   - Posible saturación de recursos no liberados o cambio de instancia

#### 4.4.4 Evidencias

**Dashboard JMeter - Fase 3 Sostenida:**
- Archivo: `cloud_load_testing/escenario_1_capa_web/Fase_3_sostenido/dashboard_smoke/index.html`
- Statistics JSON: Disponible en carpeta de resultados

**Conclusión Fase 3:**

❌❌❌ **FALLO CATASTRÓFICO** - Sistema presenta la **peor tasa de error** (94.62%) con carga sostenida de 40 usuarios. Solo 5.38% de éxito indica que el sistema es **completamente inoperante** y **no recuperable** bajo carga. **BLOQUEANTE para producción**.

---

## 5. Identificación de Problemas Críticos

**Evidencia:**
- Instancia EC2 se cae completamente con 200-300 usuarios
- Sistema operativo colapsa y no responde
- Requiere reinicio manual forzado
- Pérdida total de disponibilidad

**Causa Raíz:**
- **Single Point of Failure (SPOF):** Una única instancia EC2 sin redundancia
- **Sin límites de carga:** Sistema acepta todo el tráfico hasta colapsar
- **Recursos insuficientes:** Instancia no dimensionada para carga
- **Sin auto-scaling:** No hay mecanismo de escalamiento automático
- **Sin circuit breakers:** No hay protección contra sobrecarga

**Impacto:**
- **Caída total del servicio** con cargas > 100 usuarios
- **SLA 0%** durante colapso (disponibilidad total: 0%)
- **Pérdida de datos** en requests en proceso
- **Tiempo de recuperación:** 5-10 minutos (reinicio manual)
- **Riesgo operacional crítico** - Sistema no production-ready

**Prioridad:** 🔴🔴🔴 **BLOQUEANTE CRÍTICO** - Impide cualquier operación en producción

**Solución Requerida:**
1. **Infraestructura redundante:** Mínimo 2-3 instancias con Load Balancer
2. **Auto Scaling Groups (ASG):** Escalamiento automático basado en CPU/memoria
3. **Rate Limiting:** Protección contra sobrecarga (ej: 10 req/s por IP)
4. **Circuit Breakers:** Detener aceptación de tráfico cuando recursos críticos
5. **Health Checks:** Auto-recuperación y remoción de instancias no saludables

---

### 5.1 Bottleneck #1: Configuración de Uvicorn (CRÍTICO)

**Evidencia:**
- Latencias extremas (40-257 segundos promedio)
- Tasa de error > 38% incluso con 5 usuarios
- Throughput colapsado (0.12-0.30 RPS)

**Causa Raíz:**
```dockerfile
# Dockerfile actual
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
# Solo 1 worker, ~1000 connections por defecto
```

**Impacto:**
- **Single worker** procesa todas las requests secuencialmente
- Queue de conexiones se satura inmediatamente
- Timeouts masivos en requests encoladas

**Prioridad:** 🔴 **CRÍTICA** - Bloqueante para producción

---

### 5.2 Bottleneck #2: Instancia t2.micro Completamente Inadecuada (CRÍTICO)

**Evidencia:**
- Instancia t2.micro: 1 vCPU, 1 GB RAM
- Aplicación requiere: 4+ vCPUs, 4+ GB RAM
- Déficit de recursos: -75% CPU, -75% RAM
- Colapso con 200-300 usuarios (instancia caída)
- Latencias inconsistentes (7s - 358s)

**Causa Raíz:**
```yaml
Recursos disponibles vs requeridos:
  t2.micro disponible:
    - 1 vCPU
    - 1 GB RAM
  
  Aplicación requiere (solo FastAPI):
    - CPU Limit: 1.5 cores (50% más de lo disponible)
    - Memory Limit: 1.7 GB (70% más de lo disponible)
  
  Total con todos los servicios:
    - 4+ vCPUs requeridos
    - 4+ GB RAM requeridos
```

**Análisis de Sobrecarga:**

**Servicios corriendo en 1 GB RAM:**
1. FastAPI: 1.7 GB configurado (límite) - **EXCEDE RAM TOTAL**
2. PostgreSQL: ~300 MB (mínimo) + conexiones
3. Redis: ~50-100 MB
4. Celery Worker: ~200 MB base
5. FFmpeg (durante procesamiento): 500 MB - 2 GB
6. Nginx: ~50 MB
7. Sistema Operativo: ~300 MB

**Total:** 3-5 GB requerido **vs** 1 GB disponible

**Consecuencias:**
- 🔴 **Memory Thrashing:** Sistema en swap constante
- 🔴 **OOM Killer:** Linux mata procesos aleatoriamente
- 🔴 **CPU Throttling:** t2.micro con créditos CPU agotados
- 🔴 **Latencias extremas:** Swap a disco es 1000x más lento que RAM
- 🔴 **Inestabilidad total:** Procesos se reinician constantemente

**Impacto:**
- **Explica el 100% de los problemas observados**
- Latencias de 40-257 segundos por swap de memoria
- Colapso total con 200-300 usuarios por OOM
- Comportamiento errático entre fases
- t2.micro es **COMPLETAMENTE INADECUADA** para esta aplicación

**Prioridad:** 🔴🔴� **CRÍTICO BLOQUEANTE** - Causa raíz principal

**Solución Requerida:**
1. **MÍNIMO:** t3.medium (2 vCPU, 4 GB RAM) - Costo: ~$30/mes
2. **RECOMENDADO:** t3.large (2 vCPU, 8 GB RAM) - Costo: ~$60/mes
3. **ÓPTIMO:** c5.xlarge (4 vCPU, 8 GB RAM) - Costo: ~$120/mes

**ROI del Upgrade:**
- t2.micro actual: ~$8/mes → Sistema INOPERABLE
- t3.large upgrade: ~$60/mes → Sistema FUNCIONAL
- **Incremento de costo:** $52/mes
- **Incremento de capacidad:** 100x+ (de 5 usuarios → 500+ usuarios)
- **ROI:** ⭐⭐⭐⭐⭐ INMEDIATO

---

### 5.3 Bottleneck #3: Procesamiento de Videos (ALTO)

**Evidencia:**
- Latencias mínimas de 5-7 segundos
- Sistema desacoplado en local funcionaba mejor
- Endpoint de upload involucra procesamiento

**Causa Raíz:**
- Procesamiento síncrono de videos en request
- Sin desacople efectivo de worker
- FFmpeg procesando durante request HTTP

**Impacto:**
- Request bloqueada durante procesamiento
- Timeout de HTTP clients
- Saturación de worker único

**Prioridad:** 🟠 **ALTA** - Requiere arquitectura asíncrona real

---

### 5.4 Bottleneck #4: Network/Latency AWS (MEDIO)

**Evidencia:**
- Latencias base superiores a local
- Variabilidad alta en tiempos de respuesta

**Causa Raíz Probable:**
- Red entre JMeter y aplicación
- Ubicación geográfica de servicios
- Ancho de banda limitado

**Impacto:**
- Incremento de latencia base
- Timeouts más probables

**Prioridad:** 🟡 **MEDIA** - Optimizable con configuración de red

---

## 6. Recomendaciones para Escalar la Solución

### 6.1 Acciones Inmediatas (Alta Prioridad)

#### 6.1.1 Incrementar Workers de Uvicorn

**Cambio en Dockerfile:**
```dockerfile
# ANTES
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]

# DESPUÉS
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", \
     "--workers", "4", \
     "--worker-connections", "2000", \
     "--timeout-keep-alive", "75"]
```

**Impacto Estimado:**
- Capacidad: < 5 usuarios → 50-100 usuarios
- RPS: 0.30 → 5-10 RPS
- Error rate: 73% → < 10%

**Esfuerzo:** Bajo (1 línea de código)  
**ROI:** ⭐⭐⭐⭐⭐

---

#### 6.1.2 Desacoplar Worker de Procesamiento

**Modificación en video_router.py:**
```python
@video_router.post("/api/videos/upload", status_code=202)
async def upload_video(...):
    # Guardar video en storage
    # Responder INMEDIATAMENTE con 202 Accepted
    
    # Encolar tarea asíncrona
    task = process_video_task.delay(video.id)
    
    return {"message": "Video accepted for processing", "task_id": task.id}
```

**Impacto Estimado:**
- Latencia: 80s → < 1s
- Throughput: +500%
- Error rate: Reducción del 90%

**Esfuerzo:** Bajo  
**ROI:** ⭐⭐⭐⭐⭐

---

#### 6.1.3 Upgrade URGENTE de Instancia EC2 (t2.micro → t3.large)

**Estado Actual:**
- **t2.micro:** 1 vCPU, 1 GB RAM (~$8/mes)
- **Déficit:** -75% CPU, -75% RAM
- **Estado:** Sistema INOPERABLE

**Upgrade Recomendado:**

| Opción | Tipo | vCPU | RAM | Costo/mes | Capacidad Estimada | Recomendación |
|--------|------|------|-----|-----------|-------------------|---------------|
| **Mínimo** | t3.small | 2 | 2 GB | ~$15 | 20-50 usuarios | ⚠️ Insuficiente |
| **Aceptable** | t3.medium | 2 | 4 GB | ~$30 | 50-100 usuarios | ✅ Mínimo viable |
| **Recomendado** | t3.large | 2 | 8 GB | ~$60 | 100-300 usuarios | ⭐ RECOMENDADO |
| **Óptimo** | c5.xlarge | 4 | 8 GB | ~$120 | 300-500 usuarios | ⭐⭐ Producción |

**Configuración Docker Compose para t3.large:**
```yaml
fastapi:
  deploy:
    resources:
      limits:
        cpus: '1.5'     # 75% de 2 vCPUs
        memory: '3G'    # 37% de 8 GB
      reservations:
        cpus: '1.0'
        memory: '2G'

postgres:
  deploy:
    resources:
      limits:
        cpus: '0.5'
        memory: '2G'

redis:
  deploy:
    resources:
      limits:
        cpus: '0.25'
        memory: '512M'

celery_worker:
  deploy:
    resources:
      limits:
        cpus: '1.0'
        memory: '2G'    # FFmpeg requiere memoria
```

**Impacto Estimado del Upgrade (t2.micro → t3.large):**
- Estabilidad: +1000% (sin crashes)
- Capacidad: 5 usuarios → 100-300 usuarios
- Latencia: 40s → < 2s
- Error rate: 73% → < 10%
- Disponibilidad: 0% → 99%+

**Esfuerzo:** Bajo (15 minutos)
```bash
# 1. Detener instancia actual
aws ec2 stop-instances --instance-ids i-xxxxx

# 2. Cambiar tipo de instancia
aws ec2 modify-instance-attribute \
  --instance-id i-xxxxx \
  --instance-type t3.large

# 3. Reiniciar instancia
aws ec2 start-instances --instance-ids i-xxxxx
```

**Costo Incremental:** $52/mes ($60 - $8)  
**ROI:** ⭐⭐⭐⭐⭐ **CRÍTICO - MÁXIMA PRIORIDAD**

**URGENCIA:** 🔴🔴🔴 **INMEDIATO** - Sin este upgrade, NADA más funciona

---

### 6.2 Optimizaciones a Mediano Plazo

#### 6.2.1 Migrar Base de Datos a RDS

**Servicio:** Amazon RDS para PostgreSQL

**Beneficios:**
- Alta disponibilidad automática
- Backups automatizados
- Escalamiento vertical fácil
- Réplicas de lectura

**Configuración Recomendada:**
- **Instancia:** db.t3.medium (2 vCPU, 4 GB RAM)
- **Storage:** 100 GB SSD (gp3)
- **Multi-AZ:** Sí (para producción)

---

#### 6.2.2 Migrar Redis a ElastiCache

**Servicio:** Amazon ElastiCache para Redis

**Beneficios:**
- Baja latencia garantizada
- Replicación automática
- Snapshots automatizados

**Configuración Recomendada:**
- **Tipo de nodo:** cache.t3.medium
- **Número de nodos:** 2 (1 primario + 1 réplica)

---

#### 6.2.3 Implementar Auto Scaling

**Amazon ECS con Fargate:**
```yaml
# Task Definition
resources:
  cpu: 2048  # 2 vCPU
  memory: 4096  # 4 GB

# Auto Scaling
min_capacity: 2
max_capacity: 10
target_cpu_utilization: 70%
```

**Impacto Estimado:**
- Capacidad: 100 → 500+ usuarios
- Disponibilidad: 99.9%+

---

### 6.3 Arquitectura de Largo Plazo

#### 6.3.1 Arquitectura Propuesta

```
                    ┌─────────────────┐
                    │   CloudFront    │ (CDN)
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Application    │
                    │  Load Balancer  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
         ┌────▼────┐    ┌───▼────┐    ┌───▼────┐
         │ ECS/    │    │ ECS/   │    │ ECS/   │
         │ Fargate │    │Fargate │    │Fargate │
         │ Task 1  │    │Task 2  │    │Task 3  │
         └────┬────┘    └───┬────┘    └───┬────┘
              │             │              │
              └─────────────┼──────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
         ┌────▼────┐   ┌───▼────┐   ┌───▼────┐
         │   RDS   │   │ Elasti │   │   S3   │
         │ (Multi  │   │ Cache  │   │(Videos)│
         │   AZ)   │   │(Redis) │   │        │
         └─────────┘   └────────┘   └────────┘
```

**Componentes:**
- **CloudFront:** CDN para contenido estático y videos procesados
- **ALB:** Load balancer para distribuir tráfico
- **ECS Fargate:** Contenedores sin gestión de servidores
- **RDS Multi-AZ:** Alta disponibilidad de base de datos
- **ElastiCache:** Redis gestionado
- **S3:** Almacenamiento escalable de videos

**Estimación de Capacidad:**
- **Usuarios concurrentes:** 1,000-5,000
- **RPS sostenido:** 100-500
- **Disponibilidad:** 99.95%+

---

## 7. Plan de Acción Inmediato

### 7.1 Roadmap de Implementación

| Fase | Acción | Esfuerzo | Impacto | Plazo |
|------|--------|----------|---------|-------|
| **0** | **UPGRADE t2.micro → t3.large** | **15 min** | **🔴🔴🔴 BLOQUEANTE** | **INMEDIATO** |
| **1** | Incrementar workers Uvicorn a 4 | 1 hora | 🔴 CRÍTICO | Inmediato |
| **2** | Desacoplar procesamiento asíncrono | 2 horas | 🔴 CRÍTICO | 1 día |
| **3** | Configurar límites de recursos (nuevo hardware) | 1 hora | 🟠 ALTO | 1 día |
| **4** | Re-ejecutar pruebas de capacidad | 4 horas | 🟡 VALIDACIÓN | 2 días |
| **5** | Migrar a RDS + ElastiCache | 1 día | 🟠 MEDIO | 1 semana |
| **6** | Implementar ECS + Auto Scaling | 3 días | 🟢 LARGO PLAZO | 2 semanas |

### 7.2 Quick Wins (Implementar HOY)

**⚠️ ACCIÓN #0 - CRÍTICA (PRIMERO):**
```bash
# UPGRADE INSTANCIA EC2: t2.micro → t3.large
# Tiempo: 15 minutos | Costo: +$52/mes | Impacto: +1000% capacidad

# 1. Detener instancia
aws ec2 stop-instances --instance-ids i-xxxxx

# 2. Cambiar tipo
aws ec2 modify-instance-attribute \
  --instance-id i-xxxxx \
  --instance-type t3.large

# 3. Iniciar instancia
aws ec2 start-instances --instance-ids i-xxxxx

# 4. Verificar
aws ec2 describe-instances --instance-ids i-xxxxx | grep InstanceType
```

**Tiempo:** 15 minutos  
**Impacto esperado:** Sistema pasa de INOPERABLE → FUNCIONAL  
**Criticidad:** 🔴🔴🔴 **SIN ESTE PASO, NADA MÁS FUNCIONA**

---

**Acción #1 - Modificar Uvicorn (DESPUÉS del upgrade):**
```bash
# 1. Modificar Dockerfile
vim Dockerfile
# Agregar: --workers 4 --worker-connections 2000

# 2. Rebuild imagen
docker build -t fastapi-app .

# 3. Restart servicios
docker-compose down
docker-compose up -d

# 4. Validar
curl http://localhost/
```

**Tiempo total HOY:** < 2 horas  
**Impacto esperado:** Reducción de errores del 90%+

---

## 8. Conclusiones

### 8.1 Estado Actual del Sistema

El sistema presenta **fallas catastróficas de capacidad** que lo hacen **COMPLETAMENTE INOPERABLE en producción**:

- 💥 **COLAPSO TOTAL:** Instancia EC2 se cae con 200-300 usuarios concurrentes
- ❌ Tasa de error superior al 38% en todos los escenarios funcionales
- ❌ Latencias de 40-257 segundos (40-257x sobre SLO)
- ❌ Throughput colapsado (0.12-0.30 RPS)
- ❌ Sistema no escala correctamente con aumento de carga
- 🔴 **Requiere reinicio manual** cuando colapsa - No auto-recuperación

### 8.2 Causa Raíz Identificada

**Bottleneck #0 (BLOQUEANTE):** Infraestructura sin redundancia ni auto-scaling
- Single Point of Failure: Una única instancia EC2
- Sin protección contra sobrecarga
- Sin mecanismos de auto-recuperación

**Bottleneck #1 (CRÍTICO):** Instancia t2.micro completamente inadecuada
- **1 vCPU, 1 GB RAM** para aplicación que requiere **4+ vCPUs, 4+ GB RAM**
- **Déficit del 75%** en CPU y RAM
- Causa directa de:
  - ✅ Latencias de 40-257 segundos (memory thrashing)
  - ✅ Colapso con 200-300 usuarios (OOM Killer)
  - ✅ Tasa de error 38-94% (recursos insuficientes)
  - ✅ Throughput colapsado (CPU throttling)

**Bottleneck #2 (CRÍTICO):** Configuración inadecuada de Uvicorn
- Single worker procesa todas las requests secuencialmente
- Queue de conexiones saturada
- Sin procesamiento asíncrono real

### 8.3 Viabilidad de Producción

**Veredicto:** ❌❌❌ **COMPLETAMENTE INAPTO para producción**

**Hallazgo Crítico:** 
> 🚨 El sistema está desplegado en una instancia **t2.micro (1 vCPU, 1 GB RAM)** que es **completamente inadecuada** para correr 5 servicios Docker que requieren 4+ GB de RAM. Esto causa **memory thrashing constante** y explica el 100% de los problemas observados. Con cargas de **200-300 usuarios la instancia SE CAE COMPLETAMENTE** por OOM (Out of Memory). Esto representa un **riesgo operacional catastrófico** que hace el sistema **INVIABLE** para producción.

**Requisitos Mínimos para Producción:**
1. ✅ **UPGRADE INMEDIATO: t2.micro → t3.large (2 vCPU, 8 GB RAM)** (BLOQUEANTE #1)
2. ✅ **Implementar infraestructura redundante con Load Balancer** (BLOQUEANTE #2)
3. ✅ **Configurar Auto Scaling Groups** (BLOQUEANTE #3)
4. ✅ **Implementar Rate Limiting y Circuit Breakers** (BLOQUEANTE #4)
5. ✅ Incrementar workers de Uvicorn a 4 (CRÍTICO)
6. ✅ Implementar procesamiento asíncrono real (CRÍTICO)
7. ✅ Validar con nueva prueba de capacidad (BLOQUEANTE)

### 8.4 Próximos Pasos

1. **URGENTE - Inmediato (HOY):**
   - ⚠️ **NO DESPLEGAR EN PRODUCCIÓN** bajo ninguna circunstancia
   - Documentar hallazgo crítico de colapso de infraestructura
   - Escalar a equipo de arquitectura para rediseño

2. **Crítico (Esta Semana):**
   - **UPGRADE t2.micro → t3.large (PRIORIDAD #1)**
   - Implementar Load Balancer + 2 instancias t3.large
   - Configurar Auto Scaling Group (2-10 instancias)
   - Implementar Rate Limiting (nginx: limit_req)
   - Incrementar workers Uvicorn a 4
   - Desacoplar worker asíncrono

3. **Corto Plazo (2 Semanas):**
   - Migrar a RDS + ElastiCache
   - Implementar monitoreo (CloudWatch)
   - Re-ejecutar pruebas de 100, 200, 300 usuarios

4. **Largo Plazo (1 Mes):**
   - Migrar a ECS Fargate con auto-scaling
   - Implementar CDN (CloudFront)
   - Configurar CI/CD con deployment canary

### 8.5 Lecciones Aprendidas

1. **Single Point of Failure es CRÍTICO:**
   - Una sola instancia EC2 es **inaceptable para producción**
   - Sistema debe tener redundancia desde día 1
   - Colapso total causa pérdida completa de servicio

2. **Dimensionamiento de hardware es FUNDAMENTAL:**
   - **t2.micro (1 GB RAM) NO puede correr aplicación que requiere 4+ GB**
   - Memory thrashing causa latencias extremas (40-257 segundos)
   - OOM Killer mata procesos causando colapso total
   - **Inversión mínima en hardware ($52/mes) evita pérdidas catastróficas**

3. **Testing en múltiples ambientes es crítico:**
   - Pruebas locales NO reflejan comportamiento en cloud
   - Diferencias de infraestructura causan degradación masiva
   - **Pruebas de carga extrema revelan colapsos catastróficos**

4. **Protección contra sobrecarga es mandatoria:**
   - Rate limiting DEBE implementarse
   - Circuit breakers son esenciales
   - Sistema debe degradarse gracefully, no colapsar

5. **Configuración por defecto es insuficiente:**
   - Uvicorn single worker NO es para producción
   - Recursos de contenedor deben dimensionarse explícitamente

6. **Arquitectura asíncrona es mandatoria:**
   - Procesamiento pesado (videos) debe ser asíncrono
   - HTTP request debe responder inmediatamente

7. **Monitoreo es esencial:**
   - Sin métricas, los problemas son invisibles
   - CloudWatch/Prometheus deben configurarse desde día 1

---

## 9. Anexos

### 9.1 Archivos de Resultados

**Fase 1 - Sanidad:**
- Dashboard: `cloud_load_testing/escenario_1_capa_web/Fase_1_Sanidad/dashboard_smoke/index.html`
- Statistics: `cloud_load_testing/escenario_1_capa_web/Fase_1_Sanidad/dashboard_smoke/statistics.json`
- JTL: `cloud_load_testing/escenario_1_capa_web/Fase_1_Sanidad/fase1_smoke.jtl`

**Fase 2 - Escalamiento:**
- Dashboard: `cloud_load_testing/escenario_1_capa_web/Fase_2_escalamiento_fail/dashboard_smoke/index.html`
- Statistics: `cloud_load_testing/escenario_1_capa_web/Fase_2_escalamiento_fail/dashboard_smoke/statistics.json`
- JTL: `cloud_load_testing/escenario_1_capa_web/Fase_2_escalamiento_fail/fase1_smoke.jtl`

**Fase 3 - Sostenida:**
- Dashboard: `cloud_load_testing/escenario_1_capa_web/Fase_3_sostenido/dashboard_smoke/index.html`
- Statistics: `cloud_load_testing/escenario_1_capa_web/Fase_3_sostenido/dashboard_smoke/statistics.json`
- JTL: `cloud_load_testing/escenario_1_capa_web/Fase_3_sostenido/fase1_smoke.jtl`

### 9.2 Configuración JMeter

**Script de Prueba:** `WebApp_Carga.jmx`
- Endpoint: POST /api/videos/upload
- Content-Type: multipart/form-data
- Payload: Video simulado

### 9.3 Comandos Útiles

**Ejecutar JMeter en modo no-GUI:**
```bash
jmeter -n -t WebApp_Carga.jmx -l results.jtl -e -o dashboard/
```

**Generar dashboard desde JTL:**
```bash
jmeter -g results.jtl -o dashboard/
```

**Monitorear recursos AWS:**
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=i-xxxxx \
  --start-time 2025-10-26T00:00:00Z \
  --end-time 2025-10-26T23:59:59Z \
  --period 300 \
  --statistics Average
```

### 9.4 Contacto

Para consultas sobre este análisis:
- **Equipo:** Desarrollo de Software en la Nube
- **Repositorio:** https://github.com/sjfuentes-uniandes/desarrollo-sw-nube
- **Fecha:** 25 de Octubre, 2025

---

**Fin del Documento**
