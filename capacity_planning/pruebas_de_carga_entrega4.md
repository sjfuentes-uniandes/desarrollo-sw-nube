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

### 8.3 Análisis

- ✅ **Tasa de éxito aceptable**: 84.1% de requests completados exitosamente
- ⚠️ **Tiempo de respuesta elevado**: Promedio de 136 segundos por request
- El sistema procesa establemente bajo carga de 100 usuarios concurrentes
- Se observa comportamiento consistente del desacoplamiento API-Worker mediante SQS

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

### 9.3 Análisis

- ⚠️ **Tasa de éxito moderada**: 66.4% de requests exitosos bajo carga de 200 usuarios
- ❌ **Aumento significativo de errores**: 33.6% de tasa de error indica saturación del sistema
- El sistema muestra inestabilidad bajo carga media-alta
- Los workers requieren optimización para absorber mejor la carga
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

### 10.3 Análisis

- ✅ **Mejor rendimiento relativo**: 73.7% de tasa de éxito con 300 usuarios concurrentes
- ✅ **Throughput mejorado**: 1.0 req/s, indicando mejor utilización de recursos
- ⚠️ **Tasa de error considerable**: 26.3% de fallos sugiere límites del sistema
- El autoscaling de workers está funcionando, permitiendo procesar mayor carga
- Tiempo de respuesta reducido (150s) comparado con escenarios de menor carga

---

## 11. Análisis Comparativo Global

### 11.1 Resumen de los 3 Escenarios

| Escenario | Usuarios | Requests | Tasa de Éxito | Errores | Tiempo Promedio | Throughput |
|-----------|----------|----------|---------------|---------|-----------------|------------|
| 1 | 100 | 356 | 84.1% | 15.9% | 136s | 0.6 req/s |
| 2 | 200 | 440 | 66.4% | 33.6% | 180s | 0.6 req/s |
| 3 | 300 | 705 | 73.7% | 26.3% | 150s | 1.0 req/s |

### 11.2 Hallazgos Principales

**Comportamiento del Sistema:**

📊 **Patrones Observados:**
- **Escenario 1 (100 usuarios)**: Mejor tasa de éxito (84.1%), sistema estable
- **Escenario 2 (200 usuarios)**: Mayor degradación (66.4%), punto crítico de saturación
- **Escenario 3 (300 usuarios)**: Recuperación parcial (73.7%), autoscaling efectivo

✅ **Fortalezas de la Arquitectura:**
- Desacoplamiento entre API y procesamiento mediante SQS
- Escalamiento independiente de workers
- Mayor resiliencia con mensajes persistentes en SQS
- Autoscaling responde a la demanda (visible en escenario 300 usuarios)

⚠️ **Áreas de Mejora:**
- Tasa de errores aumenta significativamente con 200 usuarios (33.6%)
- Throughput limitado en escenarios 100 y 200 (0.6 req/s)
- Tiempos de respuesta elevados en todos los escenarios
- Variabilidad en comportamiento entre escenarios

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
