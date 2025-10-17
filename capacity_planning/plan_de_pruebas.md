# Plan de Pruebas de Capacidad

## 1. Plan de Análisis Detallado de la Aplicación

El propósito de este plan es evaluar el comportamiento y la capacidad máxima de los dos componentes principales de la arquitectura: la **Capa Web (API REST)** y la **Capa Worker (Procesamiento Asíncrono)**. El análisis se realizará de forma aislada para cada componente con el fin de identificar cuellos de botella específicos y obtener métricas de rendimiento claras.

Este documento detalla los escenarios de carga, las métricas a recolectar, los resultados que se esperan obtener y las recomendaciones iniciales para la escalabilidad de la solución, cumpliendo con los requisitos de la entrega.

---

## 2. Escenarios de Carga Planteados

### Escenario 1: Capacidad de la Capa Web (Usuarios Concurrentes)

* **Objetivo**: Determinar el número máximo de usuarios concurrentes que el endpoint de subida (`/api/videos/upload`) puede soportar sin degradar el servicio y cumpliendo los SLOs definidos.
* **Estrategia**: Se desacoplará la capa worker, haciendo que el endpoint devuelva un `202 Accepted` de inmediato para no depender del procesamiento asíncrono.
* **Fases de la Prueba**:
    1.  **Sanidad (Smoke)**: 5 usuarios durante 1 minuto para validar el entorno.
    2.  **Escalamiento Rápido (Ramp-up)**: Iniciar en 0 y aumentar hasta `X` usuarios en 3 minutos, manteniendo la carga por 5 minutos. Se repetirá con `X` creciente (100, 200, 300...) hasta observar degradación.
    3.  **Sostenida Corta**: Ejecutar una prueba de 5 minutos al 80% de la carga máxima `X` alcanzada sin degradación para confirmar la estabilidad.

### Escenario 2: Rendimiento de la Capa Worker (videos/min)

* **Objetivo**: Medir cuántos videos por minuto puede procesar un worker bajo diferentes configuraciones.
* **Estrategia**: Se inyectarán mensajes directamente en la cola (RabbitMQ/Redis) para aislar la prueba al rendimiento del worker.
* **Diseño Experimental**: Se probarán combinaciones de:
    * **Tamaño de video**: 50 MB y 100 MB.
    * **Concurrencia del worker**: 1, 2 y 4 procesos/hilos por nodo.

---

## 3. Métricas Seleccionadas

Las métricas clave a evaluar durante las pruebas serán:

### Para la Capa Web:
* **Latencia**: Percentil 95 (p95) del tiempo de respuesta del endpoint.
* **Throughput**: Peticiones por segundo (RPS) que el sistema puede manejar.
* **Tasa de Errores**: Porcentaje de respuestas con códigos de error (4xx y 5xx).
* **Utilización de Recursos**: Consumo de CPU y memoria de la API.

### Para la Capa Worker:
* **Throughput**: Videos procesados por minuto.
* **Tiempo Medio de Servicio**: Tiempo promedio para procesar un solo video.
* **Estabilidad de la Cola**: Crecimiento de la cola de mensajes a lo largo del tiempo.
* **Utilización de Recursos**: Consumo de CPU, memoria e I/O del worker.

---

## 4. Resultados Esperados

Los entregables de este análisis serán:

* **Curva de Rendimiento**:Gráfico que relaciona el número de usuarios concurrentes con la latencia y la tasa de errores de la API.
* **Determinación de Capacidad Máxima**: Rendimiento de la API (ej: "Soporta 450 usuarios concurrentes con 320 RPS, manteniendo un p95 < 1s").
* **Tabla de Capacidad del Worker**: Una tabla que resuma el throughput (videos/min) para cada combinación de tamaño de archivo y concurrencia.
* **Identificación de Cuellos de Botella**: Evidencia (logs, métricas de CPU, etc.) que señale los puntos de saturación del sistema.

---

## 5. Recomendaciones para Escalar la Solución

Basado en los resultados obtenidos, se formularán recomendaciones para mejorar la escalabilidad y estabilidad del sistema. Las recomendaciones iniciales a validar son:

* **Escalado Horizontal de la API**: Aumentar el número de réplicas del contenedor de la API para distribuir la carga de peticiones entrantes.
* **Escalado Horizontal de Workers**: Incrementar el número de workers para aumentar la capacidad de procesamiento paralelo de videos.
* **Optimización de Recursos**: Ajustar los límites de CPU y memoria asignados a los contenedores según la demanda observada.
* **Estrategias de Caching**: Implementar caché para el endpoint de rankings (`/api/public/rankings`) para reducir la carga en la base de datos, como se sugiere en la especificación.