# Plan de pruebas de carga para la capa Worker (SQS)

## 1. Objetivo
Validar la escalabilidad de la capa worker desplegada detrás de la cola `https://sqs.us-east-1.amazonaws.com/396870647912/video-app-queue`, identificando:
- Capacidad máxima sostenible (mensajes/minuto) antes de que la cola crezca sin control.
- Comportamiento bajo picos (punto de saturación).
- Estabilidad en pruebas de resistencia y eventual necesidad de escalado automático.

## 2. Herramientas
- **Locust (Python)**: script `load_testing/locust_sqs/worker_sqs_locust.py` que autentica contra la API, sube videos y deja que la propia app genere las tareas Celery correctas.
- **AWS CloudWatch**: métricas nativas de SQS (`ApproximateNumberOfMessagesVisible`, `ApproximateAgeOfOldestMessage`, `NumberOfMessagesDeleted`, `NumberOfMessagesReceived`, `NumberOfMessagesSent`, `ApproximateNumberOfMessagesNotVisible`).
- **Métricas del worker**: logs o dashboards existentes (CPU, memoria, throughput, errores, métricas custom enviadas a CloudWatch o Prometheus/Grafana).

## 3. Preparación
1. **Credenciales AWS** (usuario IAM con permisos sobre SQS/S3 y cualquier otro servicio usado por el worker). Exportar antes de ejecutar:
   ```bash
   export AWS_ACCESS_KEY_ID=xxxx
   export AWS_SECRET_ACCESS_KEY=yyyy
   export AWS_SESSION_TOKEN=zzzz # si aplica
   export AWS_REGION=us-east-1
   export SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/396870647912/video-app-queue
   ```
2. **Credenciales API** (usuario válido en la aplicación): definir `API_EMAIL`, `API_PASSWORD` y URL del backend (`API_BASE_URL`, por ejemplo `https://api.video-app.com`).
3. **Archivo de video para pruebas**: disponible en `uploads/` (ej. `uploads/file_example_MP4_480_1_5MG.mp4`) o cualquier archivo MP4 <=100 MB subido a S3 por la aplicación.
4. **Instalar dependencias Python / Locust**:
   ```bash
   python3 -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   ```
5. **Variables específicas del script** (`.env`):
   ```bash
   API_BASE_URL=https://api.video-app.com
   API_EMAIL=test@loadtest.com
   API_PASSWORD=TestPassword123
   UPLOAD_FILE_PATH=uploads/file_example_MP4_480_1_5MG.mp4
   VIDEO_TITLE_PREFIX=LoadTest
   LOCUST_MIN_WAIT=0.02
   LOCUST_MAX_WAIT=0.05
   ```
6. **Monitoreo**: asegurarse de tener paneles listos en CloudWatch/Grafana y habilitar logs del worker.

## 4. Escenarios y parámetros
| Escenario | Propósito | Configuración por defecto |
|-----------|-----------|---------------------------|
| Smoke | Validar credenciales, formato y monitoreo. | `rate=5 msg/s`, `duration=2m` |
| Ramp | Encontrar punto de saturación con incrementos progresivos. | Etapas: 20 → 60 → 120 → 160 msg/s (configurable vía `RAMP_STAGES`). |
| Soak | Validar estabilidad a la tasa nominal objetivo (≥80 msg/s). | `rate=80 msg/s`, `duration=30m`. |

Ajustar tasas según la meta de throughput del worker. Todos los parámetros se pueden sobrescribir vía variables de entorno: `SMOKE_RPS`, `RAMP_START_RPS`, `RAMP_STAGES`, `SOAK_RPS`, etc.

## 5. Ejecución de las pruebas (Locust)
El script `load_testing/locust_sqs/worker_sqs_locust.py`:
- Inicia sesión contra `/api/auth/login`.
- Sube el archivo definido en `UPLOAD_FILE_PATH` usando `/api/videos/upload`.
- La app crea el registro en BD, sube a S3 y encola la tarea Celery; el mensaje resultante en SQS tiene el formato correcto automáticamente.

Ajusta la tasa efectiva combinando:
- `-u`: usuarios simultáneos (cada uno sube videos en loop).
- `-r`: usuarios por segundo que se agregan (rampa).
- `LOCUST_MIN_WAIT` / `LOCUST_MAX_WAIT`: pausa entre uploads por usuario.

1. **Smoke** (validación rápida, 10 usuarios, rampa 5/s, 5 min):
   ```bash
   locust -f load_testing/locust_sqs/worker_sqs_locust.py --headless -u 10 -r 5 -t 5m --only-summary
   ```

2. **Ramp** (incremento progresivo controlado por `-r`, detener cuando p95 o fallos superen el umbral):
   ```bash
   locust -f load_testing/locust_sqs/worker_sqs_locust.py --headless -u 200 -r 20 -t 15m --csv results/locust_ramp
   ```
   Ajustar `-u` (usuarios cíclos) y `-r` (spawn rate) para alcanzar la tasa deseada; cada usuario envía mensajes de forma continua con el `wait_time` definido por `LOCUST_MIN_WAIT/MAX_WAIT`.

3. **Soak** (tasa nominal estable durante ≥30 min):
   ```bash
   LOCUST_MIN_WAIT=0.02 LOCUST_MAX_WAIT=0.05 locust -f load_testing/locust_sqs/worker_sqs_locust.py --headless -u 120 -r 10 -t 45m --csv results/locust_soak
   ```

> Tips: ajusta `LOCUST_MIN_WAIT/MAX_WAIT`, el tamaño del archivo (`UPLOAD_FILE_PATH`) y los parámetros `-u/-r` para lograr la tasa deseada. Si necesitas múltiples archivos, prepara una carpeta y rota el path en el script antes de ejecutar.

## 6. Datos y métricas a recolectar
- **Locust**: métricas estándar (`p95`, `fail ratio`, `current_rps`) etiquetadas como `SQS/SendMessage`, CSVs con `--csv`, o reportes en la UI/web.
- **SQS**: métricas anteriores + DLQ (si existe). Observar backlog (mensajes visibles) para determinar si el worker consume al ritmo enviado.
- **Worker**: throughput (mensajes procesados/min), latencia promedio por trabajo, % de errores, escalamiento (número de instancias), CPU/memoria.
- **Correlación**: comparar timestamps de incremento de carga vs crecimiento de la cola y recursos del worker.

## 7. Criterios de aceptación / salidas
- Worker debe sostener la tasa objetivo (ej. 80 msg/s) sin que `ApproximateNumberOfMessagesVisible` crezca durante al menos 30 min.
- Latencia de envío a SQS p95 < 400 ms y tasa de fallos <1%.
- Sin errores críticos en worker (crashes, backlog en DLQ) y recursos <80% de utilización media.
- Punto de saturación identificado con justificación (ej. a 150 msg/s backlog crece y CPU llega a 95%).

## 8. Reporte

