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

