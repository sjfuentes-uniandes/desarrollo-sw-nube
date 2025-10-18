# Queries de Prometheus Funcionales para Grafana

## ✅ Queries Verificadas que FUNCIONAN

### 1. CPU Usage % - Contenedor FastAPI
```promql
rate(container_cpu_usage_seconds_total{name=~".*fastapi.*"}[1m]) * 100
```
**Unidad:** `percent` (0-100)  
**Descripción:** Porcentaje de uso de CPU del contenedor FastAPI

---

### 2. CPU Usage % - Todos los Contenedores
```promql
rate(container_cpu_usage_seconds_total{name!=""}[1m]) * 100
```
**Legend Format:** `{{name}}`  
**Unidad:** `percent`  
**Descripción:** CPU de todos los contenedores de la aplicación

---

### 3. Memory Usage - Contenedor FastAPI (MB)
```promql
container_memory_working_set_bytes{name=~".*fastapi.*"} / 1024 / 1024
```
**Unidad:** `decmbytes` (MB)  
**Descripción:** Memoria en uso del contenedor FastAPI

---

### 4. Memory Usage - Todos los Contenedores
```promql
container_memory_working_set_bytes{name!=""} / 1024 / 1024
```
**Legend Format:** `{{name}}`  
**Unidad:** `decmbytes`

---

### 5. PostgreSQL - Conexiones Activas
```promql
pg_stat_database_numbackends{datname="desarrollo_sw_nube"}
```
**Unidad:** `short` (número entero)  
**Descripción:** Número de conexiones activas a la base de datos

---

### 6. PostgreSQL - Total de Consultas
```promql
rate(pg_stat_database_xact_commit{datname="desarrollo_sw_nube"}[1m])
```
**Unidad:** `ops` (operations per second)  
**Descripción:** Transacciones por segundo

---

### 7. Redis - Clientes Conectados
```promql
redis_connected_clients
```
**Unidad:** `short`  
**Descripción:** Número de clientes conectados a Redis

---

### 8. Redis - Operaciones por Segundo
```promql
rate(redis_commands_processed_total[1m])
```
**Unidad:** `ops`  
**Descripción:** Comandos de Redis procesados por segundo

---

### 9. Network I/O - FastAPI (Recepción)
```promql
rate(container_network_receive_bytes_total{name=~".*fastapi.*"}[1m])
```
**Unidad:** `Bps` (bytes per second)  
**Descripción:** Bytes recibidos por segundo

---

### 10. Network I/O - FastAPI (Transmisión)
```promql
rate(container_network_transmit_bytes_total{name=~".*fastapi.*"}[1m])
```
**Unidad:** `Bps`  
**Descripción:** Bytes transmitidos por segundo

---

## 📊 Cómo Crear Paneles en Grafana Manual mente

### Paso 1: Crear Nuevo Dashboard
1. Ir a http://localhost:3000
2. Login: `admin` / `admin`
3. Click en "+" → "Create" → "Dashboard"
4. Click en "Add a new panel"

### Paso 2: Configurar Panel de CPU
1. En "Metrics browser", pegar la query:
   ```
   rate(container_cpu_usage_seconds_total{name=~".*fastapi.*"}[1m]) * 100
   ```
2. En "Panel options" → "Title": `CPU Usage % - FastAPI`
3. En "Standard options" → "Unit": Seleccionar `Misc` → `percent (0-100)`
4. Click en "Apply"

### Paso 3: Configurar Panel de Memoria
1. Click en "Add panel"
2. Query:
   ```
   container_memory_working_set_bytes{name=~".*fastapi.*"} / 1024 / 1024
   ```
3. Title: `Memory Usage - FastAPI (MB)`
4. Unit: `Data` → `megabytes`
5. Click en "Apply"

### Paso 4: Configurar Panel de DB Connections
1. Click en "Add panel"
2. Query:
   ```
   pg_stat_database_numbackends{datname="desarrollo_sw_nube"}
   ```
3. Title: `PostgreSQL Active Connections`
4. Unit: `short`
5. Click en "Apply"

### Paso 5: Guardar Dashboard
1. Click en el icono de "Save" (arriba derecha)
2. Nombre: `Capacity Testing - Working Dashboard`
3. Click en "Save"

---

## 🔍 Verificar que las Queries Funcionan

Antes de crear paneles en Grafana, verifica en Prometheus:

1. Ir a: http://localhost:9090
2. En el campo "Expression", pegar cada query
3. Click en "Execute"
4. Si retorna datos, la query funciona ✅
5. Si retorna vacío, ajustar la query ❌

### Queries de Verificación Rápida:

**Ver todos los contenedores monitoreados:**
```promql
count by (name) (container_memory_working_set_bytes{name!=""})
```

**Ver servicios de la aplicación:**
```promql
up{job=~"postgres|redis|cadvisor"}
```

**Ver métricas disponibles:**
- http://localhost:9090/api/v1/label/__name__/values

---

## ⚠️ IMPORTANTE: Ejecutar Prueba MIENTRAS Monitoreas

Para que Grafana muestre datos de las pruebas de carga:

1. **PRIMERO:** Abrir Grafana y crear los paneles
2. **SEGUNDO:** Configurar rango de tiempo en "Last 15 minutes" con refresh "5s"
3. **TERCERO:** Ejecutar prueba de Locust
4. **CUARTO:** Observar cómo los paneles se actualizan en tiempo real
5. **QUINTO:** Capturar screenshots DURANTE o INMEDIATAMENTE DESPUÉS de la prueba

**NO** ejecutar la prueba primero y luego abrir Grafana, porque las métricas en tiempo real se verán mejor.

---

## 📸 Capturas Recomendadas

Durante una prueba de 100 usuarios (8 minutos):

1. **Minuto 0-2** (inicio): Baseline, sistema estable
2. **Minuto 3-5** (ramp-up): Incremento gradual de métricas
3. **Minuto 6-8** (sostenido): 100 usuarios activos, capacidad máxima
4. **Al finalizar**: Captura del dashboard completo

---

## 🎯 Dashboard Mínimo Funcional

Si quieres algo rápido, crea solo 3 paneles:

1. **CPU % - FastAPI**: `rate(container_cpu_usage_seconds_total{name=~".*fastapi.*"}[1m]) * 100`
2. **Memory MB - FastAPI**: `container_memory_working_set_bytes{name=~".*fastapi.*"} / 1024 / 1024`
3. **DB Connections**: `pg_stat_database_numbackends{datname="desarrollo_sw_nube"}`

Con esos 3 paneles ya tienes evidencia suficiente de los bottlenecks.

---

**Última actualización:** 18 de Octubre, 2025
