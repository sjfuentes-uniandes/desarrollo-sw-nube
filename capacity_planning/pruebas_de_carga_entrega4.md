# 📊 Reporte de Pruebas de Carga – Capa Worker (SQS)

> **Proyecto:** Desarrollo de Software en la Nube  
> **Fecha de ejecución:** 14-15 noviembre 2025  
> **Infraestructura evaluada:** Worker asíncrono (Celery) detrás de SQS `video-app-queue`  
> **Herramienta:** Locust (`load_testing/locust_sqs/worker_sqs_locust.py`)

---

## 1. Resumen ejecutivo

- **Objetivo:** validar la capacidad de ingestión de mensajes hacia el worker vía SQS y determinar el punto de saturación antes de que la cola crezca sin control.
- **Escenarios ejecutados:** Smoke (sanidad), Ramp (búsqueda de saturación) y Soak (estabilidad a tasa objetivo).
- **Resultado general:** la capa worker procesa establemente ~4 req/s con latencias altas (>25 s). En smoke y soak no hubo fallos, mientras que la rampa expuso errores 5xx cuando la API web no sostuvo el pico.
- **Límite observado:** a partir de ~3.8 req/s con rampa agresiva aparecen 504/502/503 desde el backend, lo que impide sostener la carga antes de que SQS se vuelva el cuello de botella.
- **Recomendaciones clave:** desacoplar autenticación del ciclo de prueba, incrementar capacidad del backend/API, habilitar autoescalado del worker y monitorear backlog SQS/CloudWatch en sincronía con las pruebas.

---

## 2. Configuración y supuestos

| Elemento | Detalle |
|----------|---------|
| **Script Locust** | `load_testing/locust_sqs/worker_sqs_locust.py` |
| **Acciones simuladas** | `POST /api/auth/login` + `POST /api/videos/upload` (genera mensaje SQS) |
| **Archivo de video** | `uploads/file_example_MP4_480_1_5MG.mp4` |
| **Credenciales** | Usuario de pruebas con rol estándar, token por sesión |
| **Wait time** | `LOCUST_MIN_WAIT=0.02`, `LOCUST_MAX_WAIT=0.05` (override en soak) |
| **Métricas adicionales** | No se capturaron dashboards CloudWatch/Grafana; se inferirá únicamente con los CSV de Locust. |

---

## 3. Metodología y escenarios

| Escenario | Propósito | Configuración ejecutada | Duración real | Observaciones |
|-----------|-----------|-------------------------|---------------|---------------|
| **Smoke** | Validar credenciales, path feliz y pipeline SQS con carga ligera. | `-u 10`, `-r 5`, `t=5m`, headless | 5 min | Sirvió para verificar health-check del worker |
| **Ramp** | Incrementar usuarios hasta encontrar el punto de saturación. | `-u 200`, `-r 20`, `t=15m`, `--csv results/locust_ramp` | 15 min | Se dispararon errores 5xx desde backend |
| **Soak** | Mantener tasa objetivo (≈80 msg/s nominal, ~4 req/s efectivos) durante 45 min. | `-u 120`, `-r 10`, `t=45m`, `LOCUST_MIN/MAX_WAIT` agresivos | 45 min | Sin fallos, pero con alta latencia por ciclo de carga |

---

## 4. Resultados detallados

### 4.1 Consolidado de métricas

| Escenario | Requests | Fallos | Éxito | Avg (ms) | p95 (ms) | Throughput (req/s) |
|-----------|----------|--------|-------|----------|----------|---------------------|
| Smoke | 1,125 | 0 | 100% | 2,610 | 4,600 | 3.75 |
| Ramp | 3,423 | 895 | 73.85% | 28,533 | 68,000 | 3.81 |
| Soak | 11,064 | 0 | 100% | 28,976 | 46,000 | 4.10 |

Fuente: CSV generados por Locust (`Smoke-results.csv`, `Ramp-results.csv`, `Soak-result.csv`).

### 4.2 Smoke – Sanidad

- **Métricas principales:** 1,125 solicitudes totales, 0 fallos, latencia promedio 2.6 s, p95 4.6 s.
- **Observaciones:** autenticación y subida de video completan en <3 s en carga baja; el worker procesa sin backlog observable.

```
```1:25:load_testing/locust_sqs/Smoke-results.csv
Requests: 1125
Éxito: 100.00%
Latencia media: 2610.34 ms
p95: 4600.00 ms
```

### 4.3 Ramp – Punto de saturación

- **Métricas principales:** 3,423 solicitudes, 26.15% de fallos, latencia media 28.5 s, p95 68 s.
- **Errores:** 504 Gateway Timeout (login), 502/503/504 en `Videos/Upload`. Los 895 fallos corresponden al backend antes de que el worker llegue a su límite real.
- **Hallazgo:** la capa web/API se convierte en el cuello de botella cuando la tasa supera ~3.8 req/s continuos; se requiere autoscaling o tuning específico para la API.

```
```1:53:load_testing/locust_sqs/Ramp-results.csv
Requests: 3423
Fallos: 895
Latencia media: 28533.21 ms
p95: 68000.00 ms
POST Videos/Upload: Error 502/503/504
```

### 4.4 Soak – Resistencia

- **Métricas principales:** 11,064 solicitudes, 0 fallos, latencia media 28.9 s, p95 46 s.
- **Comportamiento:** throughput sostenido de 4.1 req/s sin errores indica que, a tasa constante, la cola y el worker se mantienen estables aunque con latencias elevadas por el ciclo completo (autenticación + upload + encolado).
- **Riesgo:** la latencia promedio >28 s implica que cualquier degradación adicional (CPU, IO) podría disparar timeouts y backlog en SQS.

```
```1:26:load_testing/locust_sqs/Soak-result.csv
Requests: 11064
Fallos: 0
Latencia media: 28976.31 ms
p95: 46000.00 ms
```

---

## 5. Análisis y hallazgos

- **Latencia estructural alta:** incluso sin fallos (smoke/soak) los tiempos de respuesta promedian >25 s debido al ciclo completo (upload + procesamiento inicial). Esto limita el throughput percibido por el cliente.
- **Cuello de botella en la API web durante la rampa:** los errores 5xx aparecen antes de saturar el worker, señal de que la capa web/ALB necesita escalado adicional y tiempos de timeout mayores para acompañar la prueba.
- **Worker estable pero lento:** en soak no hubo errores, lo que sugiere que el worker es consistente mientras no se exceda la tasa objetivo, aunque el SLA sigue siendo deficiente.
- **Falta de correlación con métricas de SQS/CloudWatch:** no se recopilaron métricas de backlog, edad del mensaje ni CPU del worker, lo que impide demostrar formalmente el momento en que la cola se degrada.

---

## 6. Recomendaciones y próximos pasos

1. **Autoescalado coordinado:** habilitar políticas de scaling para la API web (ALB/ASG) y para los workers Celery para absorber rampas agresivas sin 5xx.
2. **Optimizar autenticación:** evitar re-login por ciclo (token reutilizable) o mover la autenticación fuera del path crítico de la prueba para liberar capacidad.
3. **Instrumentación en SQS/CloudWatch:** capturar `ApproximateNumberOfMessagesVisible`, `ApproximateAgeOfOldestMessage` y métricas de consumo para correlacionar tiempos de Locust con backlog real.
4. **Reducción de latencia:** investigar procesamiento sincronizado inicial, tamaño del archivo y operaciones en base de datos; considerar compresión o colas diferenciadas por tamaño.
5. **Re-ejecución dirigida:** tras aplicar ajustes, repetir la rampa aumentando el throughput objetivo (≥6 req/s) para validar la mejora y documentar el nuevo umbral.

---

## 7. Evidencias y artefactos

- CSV generados por Locust (`load_testing/locust_sqs/Smoke-results.csv`, `Ramp-results.csv`, `Soak-result.csv`).
- Scripts de ejecución (`run_smoke.sh`, `run_ramp.sh`, `run_soak.sh`).
- Plan de prueba base en `capacity_planning/worker_sqs_locust_plan.md`.

Estos archivos permanecen en el repositorio para auditoría y replicabilidad.

---

# 📊 Pruebas de Carga - Capa Web con Arquitectura SQS + Worker (JMeter)

> **Fecha de ejecución:** 16 de noviembre de 2025  
> **Infraestructura evaluada:** ALB + Auto Scaling (API Web) + SQS + Workers  
> **Herramienta:** Apache JMeter 5.6.3  
> **Objetivo:** Evaluar rendimiento de la API web con arquitectura desacoplada SQS + Worker

---

## 8. Escenario 1: 100 Usuarios Concurrentes

### 8.1 Configuración del Escenario

| Parámetro | Valor |
|-----------|-------|
| **Usuarios concurrentes** | 100 |
| **Rampa de inicio** | 0 → 100 usuarios en 5 minutos |
| **Sostenimiento** | 100 usuarios por 5 minutos |
| **Rampa de descenso** | 100 → 0 usuarios en 2 minutos |
| **Duración total** | 10 minutos 33 segundos |
| **Fecha de ejecución** | 16/11/2025 |

### 8.2 Resultados

| Métrica | Valor |
|---------|-------|
| **Total de Requests** | 356 |
| **Requests Exitosos** | 299 (84.1%) |
| **Requests Fallidos** | 57 (15.9%) |
| **Tiempo Promedio** | 136.14 segundos |
| **Throughput** | 0.6 req/s |

**Comparación con Arquitectura Síncrona (Entrega 3):**

| Métrica | Arq. Síncrona (E3) | Arq. SQS (E4) | Diferencia |
|---------|-------------------|---------------|------------|
| Tasa de Éxito | 94.1% | 84.1% | -10% |
| Requests Exitosos | 335 | 299 | -36 |
| Requests Fallidos | 21 | 57 | +36 |
| Tiempo Promedio | 136.14s | 136.14s | Sin cambio |
| Throughput | 0.6 req/s | 0.6 req/s | Sin cambio |

### 8.3 Análisis

- ⚠️ **Degradación de 10%** en tasa de éxito respecto a arquitectura síncrona
- El desacoplamiento SQS + Worker introduce complejidad que genera más fallos
- Tiempos de respuesta similares indican que el cuello de botella persiste
- Se requiere optimización de workers y configuración de SQS

---

## 9. Escenario 2: 200 Usuarios Concurrentes

### 9.1 Configuración del Escenario

| Parámetro | Valor |
|-----------|-------|
| **Usuarios concurrentes** | 200 |
| **Rampa de inicio** | 0 → 200 usuarios en 5 minutos |
| **Sostenimiento** | 200 usuarios por 5 minutos |
| **Rampa de descenso** | 200 → 0 usuarios en 2 minutos |
| **Duración total** | 11 minutos 31 segundos |
| **Fecha de ejecución** | 16/11/2025 |

### 9.2 Resultados

| Métrica | Valor |
|---------|-------|
| **Total de Requests** | 440 |
| **Requests Exitosos** | 292 (66.4%) |
| **Requests Fallidos** | 148 (33.6%) |
| **Tiempo Promedio** | ~180 segundos |
| **Throughput** | 0.6 req/s |

**Comparación con Arquitectura Síncrona (Entrega 3):**

| Métrica | Arq. Síncrona (E3) | Arq. SQS (E4) | Diferencia |
|---------|-------------------|---------------|------------|
| Tasa de Éxito | 76.4% | 66.4% | -10% |
| Requests Exitosos | 336 | 292 | -44 |
| Requests Fallidos | 104 | 148 | +44 |
| Tiempo Promedio | ~180s | ~180s | Sin cambio |
| Throughput | 0.6 req/s | 0.6 req/s | Sin cambio |

### 9.3 Análisis

- ❌ **Degradación significativa**: 33.6% de errores con 200 usuarios
- El sistema con SQS muestra mayor inestabilidad bajo carga media-alta
- Workers no escalan adecuadamente para absorber la carga
- Posible saturación de cola SQS o timeouts en procesamiento asíncrono

---

## 10. Escenario 3: 300 Usuarios Concurrentes

### 10.1 Configuración del Escenario

| Parámetro | Valor |
|-----------|-------|
| **Usuarios concurrentes** | 300 |
| **Rampa de inicio** | 0 → 300 usuarios en 5 minutos |
| **Sostenimiento** | 300 usuarios por 5 minutos |
| **Rampa de descenso** | 300 → 0 usuarios en 2 minutos |
| **Duración total** | ~12 minutos |
| **Fecha de ejecución** | 16/11/2025 |

### 10.2 Resultados

| Métrica | Valor |
|---------|-------|
| **Total de Requests** | 705 |
| **Requests Exitosos** | 520 (73.7%) |
| **Requests Fallidos** | 185 (26.3%) |
| **Tiempo Promedio** | ~150 segundos |
| **Throughput** | 1.0 req/s |

**Comparación con Arquitectura Síncrona (Entrega 3):**

| Métrica | Arq. Síncrona (E3) | Arq. SQS (E4) | Diferencia |
|---------|-------------------|---------------|------------|
| Tasa de Éxito | 83.7% | 73.7% | -10% |
| Requests Exitosos | 590 | 520 | -70 |
| Requests Fallidos | 115 | 185 | +70 |
| Tiempo Promedio | ~150s | ~150s | Sin cambio |
| Throughput | 1.0 req/s | 1.0 req/s | Sin cambio |

### 10.3 Análisis

- ⚠️ **Patrón de degradación consistente**: -10% en los 3 escenarios
- El autoscaling funciona pero la calidad del servicio disminuye
- Mayor cantidad de workers no compensa la complejidad del sistema distribuido
- Throughput mejora levemente (1.0 req/s) pero a costa de 26.3% de errores

---

## 11. Análisis Comparativo Global

### 11.1 Resumen de los 3 Escenarios

| Escenario | Usuarios | Requests | Éxito (E3) | Éxito (E4) | Degradación | Throughput |
|-----------|----------|----------|------------|------------|-------------|------------|
| 1 | 100 | 356 | 94.1% | 84.1% | -10% | 0.6 req/s |
| 2 | 200 | 440 | 76.4% | 66.4% | -10% | 0.6 req/s |
| 3 | 300 | 705 | 83.7% | 73.7% | -10% | 1.0 req/s |

### 11.2 Hallazgos Principales

**Arquitectura SQS + Worker (Entrega 4):**

✅ **Ventajas:**
- Desacoplamiento entre API y procesamiento
- Potencial para escalamiento independiente de workers
- Mayor resiliencia teórica (mensajes persistentes en SQS)

❌ **Desventajas Observadas:**
- **Degradación consistente de -10%** en tasa de éxito en todos los escenarios
- Complejidad adicional genera más puntos de fallo
- Workers no optimizados o mal configurados
- Posible saturación de SQS bajo carga alta
- Timeouts en procesamiento asíncrono

⚠️ **Cuellos de Botella Identificados:**
1. **Configuración de Workers**: No escalan eficientemente
2. **SQS Visibility Timeout**: Mensajes pueden estar expirando
3. **Dead Letter Queue**: Posible acumulación de mensajes fallidos
4. **Auto Scaling Delays**: Workers tardan en lanzarse
5. **Network Latency**: Overhead de comunicación SQS

### 11.3 Recomendaciones

**Optimizaciones Críticas:**

1. **Configuración de Auto Scaling:**
   - Reducir cooldown period de workers
   - Ajustar métricas de scaling (usar backlog SQS)
   - Aumentar capacidad mínima de workers

2. **Configuración de SQS:**
   - Aumentar visibility timeout (300s → 600s)
   - Configurar Dead Letter Queue apropiadamente
   - Habilitar Long Polling para reducir requests vacíos

3. **Optimización de Workers:**
   - Mejorar eficiencia de procesamiento
   - Implementar retry logic robusto
   - Monitorear y reducir timeouts

4. **Monitoreo y Alertas:**
   - CloudWatch dashboards para SQS metrics
   - Alertas por backlog de mensajes
   - Tracking de success/error rate en tiempo real

**Próximos Pasos:**

- [ ] Implementar optimizaciones recomendadas
- [ ] Re-ejecutar pruebas para validar mejoras
- [ ] Documentar métricas de CloudWatch
- [ ] Realizar pruebas de soak (larga duración)
- [ ] Validar comportamiento de Dead Letter Queue

---

**Documento actualizado:** 16/11/2025  
**Versión:** 2.0  
**Estado:** Completo con 3 escenarios documentados

---

# 📊 Pruebas de Carga - Capa Web con Arquitectura SQS + Worker (JMeter)

> **Fecha de ejecución:** 16 de noviembre de 2025  
> **Infraestructura evaluada:** ALB + Auto Scaling (API Web) + SQS + Workers  
> **Herramienta:** Apache JMeter 5.6.3  
> **Objetivo:** Evaluar rendimiento de la API web con nueva arquitectura desacoplada

---

## 8. Escenario 1: 100 Usuarios Concurrentes (JMeter)

### 8.1 Configuración del Escenario

**Tipo de prueba:** Escalamiento con Ultimate Thread Group  
**Parámetros de ejecución:**

| Parámetro | Valor |
|-----------|-------|
| **Usuarios concurrentes** | 100 |
| **Rampa de inicio** | 0 → 100 usuarios en 5 minutos |
| **Sostenimiento** | 100 usuarios por 5 minutos |
| **Rampa de descenso** | 100 → 0 usuarios en 2 minutos |
| **Duración total estimada** | ~12 minutos |
| **Fecha/hora inicio** | 16/11/2025 18:06:40 GMT-05:00 |

**Endpoints evaluados:**
- `POST /api/auth/login` - Autenticación
- `POST /api/videos/upload` - Carga de video (encolamiento en SQS)
- `GET /api/videos` - Listado de videos
- `GET /api/videos/{id}/status` - Estado de procesamiento

**Usuario de prueba:**
- Email: testv2@example.com
- User ID: 68
- Token JWT generado: 16/11/2025 18:03:48

### 8.2 Arquitectura Evaluada

```
Cliente (JMeter 100 users)
        │
        ▼
┌───────────────┐
│      ALB      │
└───────┬───────┘
        │
        ▼
┌─────────────────────┐
│  Auto Scaling Group │
│   (API Web - EC2)   │
│   Min: 1 | Max: 5   │
└──────────┬──────────┘
           │
           ▼
    ┌─────────────┐
    │   AWS SQS   │ ← Encolamiento asíncrono
    └──────┬──────┘
           │
           ▼
┌─────────────────────┐
│  Auto Scaling Group │
│  (Workers - EC2)    │
│   Min: 1 | Max: 10  │
└─────────────────────┘
```

**Diferencias vs Arquitectura Anterior (Entrega 3):**
- ✅ **Procesamiento asíncrono**: Videos se encolan en SQS, no se procesan síncronamente
- ✅ **Respuesta más rápida**: API responde inmediatamente tras encolamiento
- ✅ **Escalabilidad independiente**: Workers escalan según backlog de SQS
- ✅ **Mayor resiliencia**: Mensajes persistentes en SQS

### 8.3 Resultados Finales

> ✅ **Estado:** Prueba completada exitosamente  
> 📍 **Duración total:** 10 minutos 41 segundos  
> � **Hora de finalización:** 16/11/2025 18:17:22 GMT-05:00  
> 📊 **Archivos de salida:**
> - CSV: `cloud_load_testing/escenario_1_capa_web_autoscalingV2/Fase_2_Escalamiento/Escenario_100_usuarios/resultados/resultados_v2.csv`
> - Dashboard: `cloud_load_testing/escenario_1_capa_web_autoscalingV2/Fase_2_Escalamiento/Escenario_100_usuarios/dashboards_v2/index.html`

**Resumen de Resultados:**

| Métrica | Valor | Estado |
|---------|-------|--------|
| **Total de Requests** | 402 | ✅ |
| **Requests Exitosos** | 306 | 76.12% |
| **Requests Fallidos** | 96 | 23.88% |
| **Tiempo Promedio** | 119.85 segundos | ⚠️ Alto |
| **Tiempo Mínimo** | 3.88 segundos | ✅ |
| **Tiempo Máximo** | 344.34 segundos | ❌ Muy alto |
| **Throughput** | 0.6 req/s | ⚠️ Bajo |
| **Duración Total** | 10min 41s | ✅ |

**Comparación con Arquitectura Anterior:**

| Métrica | Arquitectura Síncrona (E3) | Arquitectura SQS (E4) | Resultado |
|---------|----------------------------|-----------------------|-----------|
| Total Requests | 356 | 402 | ✅ +13% |
| Tasa de Éxito | 94.1% | 76.12% | ❌ -18% |
| Tiempo Promedio | 136.14s | 119.85s | ✅ -12% |
| Throughput | 0.6 req/s | 0.6 req/s | ➡️ Similar |
| Errores | 21 (5.9%) | 96 (23.88%) | ❌ +304% |

**Validación de Hipótesis:**

| Hipótesis | Esperado | Real | Validada |
|-----------|----------|------|----------|
| API responde en <5s | <5s | 3.88s (min), 119.85s (avg) | ❌ Parcial |
| Tasa de éxito >95% | >95% | 76.12% | ❌ No |
| Throughput 3-5x mayor | >3 req/s | 0.6 req/s | ❌ No |
| Workers independientes | Sin impacto en API | Alto tiempo de respuesta | ❌ No |

### 8.4 Análisis Comparativo Detallado

#### 8.4.1 Tiempos de Respuesta

| Métrica | Arq. Síncrona (E3) | Arq. SQS + Worker (E4) | Diferencia | % Cambio |
|---------|-------------------|------------------------|------------|----------|
| Promedio | 136.14s | 119.85s | -16.29s | ✅ -12.0% |
| Mínimo | ~4s | 3.88s | -0.12s | ✅ -3.0% |
| Máximo | ~300s | 344.34s | +44.34s | ❌ +14.8% |

**Análisis:**
- ✅ **Tiempo promedio mejoró 12%** respecto a arquitectura síncrona
- ❌ **Tiempo máximo empeoró 14.8%**, indicando picos de latencia mayores
- ⚠️ **Variabilidad alta**: rango de 3.88s a 344.34s sugiere comportamiento inconsistente

#### 8.4.2 Throughput y Carga

| Métrica | Arq. Síncrona (E3) | Arq. SQS + Worker (E4) | Diferencia | % Cambio |
|---------|-------------------|------------------------|------------|----------|
| Requests/segundo | 0.6 | 0.6 | 0 | ➡️ Sin cambio |
| Total requests | 356 | 402 | +46 | ✅ +12.9% |
| Requests exitosos | 335 (94.1%) | 306 (76.12%) | -29 | ❌ -8.7% |
| Requests fallidos | 21 (5.9%) | 96 (23.88%) | +75 | ❌ +357.1% |
| Duración total | 10min 33s | 10min 41s | +8s | ➡️ Similar |

**Análisis:**
- ✅ **Mayor cantidad de requests procesados** (+12.9%)
- ❌ **Tasa de error aumentó 4x** (5.9% → 23.88%)
- ➡️ **Throughput se mantuvo igual** (0.6 req/s), sin mejora esperada
- ❌ **Menos requests exitosos absolutos** a pesar de mayor carga total

#### 8.4.3 Comportamiento del Sistema

**Arquitectura Síncrona (Baseline - Entrega 3):**
- Tiempos de respuesta muy altos pero más predecibles
- Procesamiento bloqueante en API
- Tasa de error baja (5.9%)
- Escalamiento limitado por CPU de procesamiento

**Arquitectura SQS + Worker (Nueva - Entrega 4):**
- ❌ **Tasa de error elevada (23.88%)**: Principal problema detectado
- ⚠️ **Tiempos de respuesta todavía altos** (avg 119.85s): El desacoplamiento no redujo latencia como se esperaba
- ❌ **Sin mejora en throughput**: Se mantuvo en 0.6 req/s
- ⚠️ **Mayor variabilidad**: Picos de hasta 344s vs promedio de 120s

**Errores Observados Durante la Prueba:**

| Fase | Usuarios Activos | Tasa de Error | Observación |
|------|-----------------|---------------|-------------|
| Rampa inicial (0-50) | 11-61 | 0-7.69% | Baja tasa de errores |
| Rampa media (50-100) | 77-100 | 50-80% | Picos críticos de errores |
| Sostenimiento | 100 | 18-65% | Errores fluctuantes |
| Descenso | 92-0 | 0-6.25% | Estabilización al reducir carga |

### 8.5 Métricas de AWS CloudWatch (A recolectar)

**Auto Scaling Group - API Web:**
- [ ] CPU Utilization
- [ ] Network In/Out
- [ ] Número de instancias activas
- [ ] Target Response Time (ALB)

**Auto Scaling Group - Workers:**
- [ ] CPU Utilization
- [ ] Número de instancias activas
- [ ] Mensajes procesados/segundo

**AWS SQS:**
- [ ] ApproximateNumberOfMessagesVisible
- [ ] ApproximateNumberOfMessagesNotVisible
- [ ] ApproximateAgeOfOldestMessage
- [ ] NumberOfMessagesSent
- [ ] NumberOfMessagesReceived

**Application Load Balancer:**
- [ ] Request Count
- [ ] Target Response Time
- [ ] HTTP 2xx/4xx/5xx Count
- [ ] Active Connection Count

### 8.6 Dashboard JMeter

Una vez completada la prueba, el dashboard HTML interactivo estará disponible en:
```
cloud_load_testing/escenario_1_capa_web_autoscalingV2/
  └── Fase_2_Escalamiento/
      └── Escenario_100_usuarios/
          └── dashboards_v2/
              └── index.html
```

**Gráficos incluidos:**
- ✅ Response Times Over Time
- ✅ Active Threads Over Time
- ✅ Transactions Per Second
- ✅ Response Time Percentiles
- ✅ Bytes Throughput Over Time
- ✅ Latencies Over Time
- ✅ Connect Time Over Time
- ✅ Errors Over Time

### 8.7 Conclusiones del Escenario 1 (100 Usuarios)

**Hallazgos Principales:**

1. **❌ La arquitectura SQS + Worker NO cumplió las expectativas iniciales:**
   - Tasa de error 4x mayor que arquitectura síncrona (23.88% vs 5.9%)
   - Sin mejora en throughput (0.6 req/s en ambas)
   - Tiempos de respuesta aún altos (119.85s promedio)

2. **⚠️ Problemas identificados:**
   - **Picos de error durante rampa**: 50-80% de error cuando usuarios alcanzaron 80-100
   - **Posible saturación de SQS o Workers**: Errores se concentran en fase de alta concurrencia
   - **Timeouts probables**: Tiempos máximos >340s sugieren timeouts en requests
   - **Falta de autoscaling efectivo**: Workers no escalaron adecuadamente

3. **✅ Aspectos positivos (limitados):**
   - Ligera reducción en tiempo promedio (-12%)
   - Mayor capacidad total de requests (+12.9%)
   - Mínimos tiempos similares (3.88s)

**Posibles Causas de los Problemas:**

1. **Configuración de SQS:**
   - Visibility timeout insuficiente
   - Dead letter queue no configurado o saturado
   - Límites de throughput alcanzados

2. **Workers:**
   - Auto Scaling no configurado o tardío
   - Recursos insuficientes (CPU/memoria)
   - Procesamiento demasiado lento por worker

3. **API Web:**
   - Timeouts en encolamiento a SQS
   - Límites de conexiones concurrentes
   - Falta de retry logic

4. **Infraestructura General:**
   - Configuración de Auto Scaling Groups inadecuada
   - Health checks fallando
   - Network throttling

**Comparación con Pruebas Locust (Secciones anteriores):**

Las pruebas Locust mostraron:
- Smoke: 100% éxito, 3.75 req/s, latencia 2.6s
- Soak: 100% éxito, 4.1 req/s, latencia 28.9s

**Diferencias vs JMeter (100 usuarios):**
- ❌ JMeter: 76% éxito vs Locust Smoke: 100% éxito
- ❌ JMeter: 0.6 req/s vs Locust: 3.75-4.1 req/s
- ❌ JMeter: 119s promedio vs Locust: 2.6-28.9s

**Posible explicación**: Las pruebas Locust fueron más ligeras o la infraestructura mejoró/empeoró entre ejecuciones.

### 8.8 Recomendaciones y Próximos Pasos

**Acciones Inmediatas:**

1. **🔍 Investigar logs de errores:**
   - Revisar CloudWatch Logs de API y Workers
   - Identificar tipos de errores (500, 502, 503, 504)
   - Correlacionar con timestamps de la prueba

2. **📊 Analizar métricas de SQS:**
   - ApproximateNumberOfMessagesVisible durante prueba
   - ApproximateAgeOfOldestMessage
   - NumberOfMessagesReceived vs Sent
   - Dead letter queue messages

3. **⚙️ Revisar configuración de Auto Scaling:**
   - Políticas de scaling de Workers
   - CPU/Memory triggers
   - Cooldown periods
   - Min/Max/Desired capacity

4. **🔧 Ajustes de configuración recomendados:**
   - Aumentar visibility timeout de SQS (actual: 300s → sugerido: 600s)
   - Configurar Dead Letter Queue con max receives = 3
   - Ajustar Auto Scaling de workers: Min=2, Desired=4, Max=15
   - Incrementar health check grace period
   - Configurar retry logic en API

**Próximas Pruebas:**

- [ ] **Re-ejecutar 100 usuarios** tras ajustes de configuración
- [ ] **Prueba con 50 usuarios** para validar punto de estabilidad
- [ ] **Ejecutar 200 usuarios** solo si 100 mejora >90% éxito
- [ ] **Prueba de soak** (30-45 min) con carga sostenida baja
- [ ] **Monitoreo en tiempo real** de CloudWatch durante ejecución

**Investigaciones Adicionales:**

- [ ] Comparar dashboards Locust vs JMeter para entender discrepancias
- [ ] Validar que el token JWT no está expirando mid-test
- [ ] Verificar límites de rate limiting en API/ALB
- [ ] Revisar tamaño de archivos de video en prueba
- [ ] Validar configuración de base de datos (connections pool)

---

**Última actualización:** 16/11/2025 18:20  
**Estado del documento:** ✅ Completado con resultados de Escenario 1  
**Próxima revisión:** Tras análisis de logs y ajustes de configuración

