# 📊 Cómo Importar el Dashboard de Capacity Testing en Grafana

## Método 1: Importación Manual (Recomendado - 2 minutos)

### Paso 1: Acceder a Grafana
1. Abre tu navegador en: **http://localhost:3000**
2. **Login:**
   - Usuario: `admin`
   - Contraseña: `admin`
3. Si solicita cambiar contraseña, haz clic en **"Skip"**

### Paso 2: Ir a la Página de Importación
1. En el menú lateral izquierdo, haz clic en el ícono **"+"** (Create)
2. Selecciona **"Import"**
   - O ve directamente a: http://localhost:3000/dashboard/import

### Paso 3: Cargar el Archivo JSON
1. Haz clic en **"Upload JSON file"**
2. Navega a la ruta:
   ```
   C:\Users\nicol\Documents\DSNB\desarrollo-sw-nube\load_testing\observability\grafana\dashboards\capacity_dashboard_working.json
   ```
3. Selecciona el archivo y haz clic en **"Abrir"**

### Paso 4: Configurar el Dashboard
1. En la pantalla de configuración:
   - **Name:** Capacity Testing - Metrics Dashboard (ya viene configurado)
   - **Folder:** General (dejar por defecto)
   - **Datasource:** Selecciona **"Prometheus"** en el dropdown
2. Haz clic en **"Import"**

### Paso 5: ✅ Verificar que Funciona
El dashboard debería abrirse automáticamente mostrando **8 paneles**:

1. 🔥 **CPU Usage % - FastAPI Container**
2. 💾 **Memory Usage - FastAPI Container (MB)**
3. 📊 **CPU Usage % - All Containers**
4. 🗄️ **PostgreSQL Active Connections**
5. 🔴 **Redis Connected Clients**
6. ⚡ **Redis Operations/sec**
7. 🌐 **Network I/O - FastAPI (bytes/sec)**
8. 💾 **Memory - All Containers (MB)**

**Si ves gráficas con datos = ✅ TODO FUNCIONA**

---

## Método 2: Verificación de Datos en Prometheus

Si el dashboard muestra "No data", verifica en Prometheus:

1. Abre: http://localhost:9090
2. En el campo "Expression", pega:
   ```
   container_memory_working_set_bytes
   ```
3. Haz clic en **"Execute"**
4. Si ves resultados = Prometheus tiene datos ✅

---

## Queries Utilizadas en el Dashboard

### Panel 1: CPU FastAPI
```promql
rate(container_cpu_usage_seconds_total{name=~".*fastapi.*"}[1m]) * 100
```

### Panel 2: Memoria FastAPI
```promql
container_memory_working_set_bytes{name=~".*fastapi.*"} / 1024 / 1024
```

### Panel 3: CPU Todos los Contenedores
```promql
rate(container_cpu_usage_seconds_total{name=~".*(fastapi|postgres|redis).*"}[1m]) * 100
```

### Panel 4: Conexiones PostgreSQL
```promql
pg_stat_database_numbackends{datname="desarrollo_sw_nube"}
```

### Panel 5: Clientes Redis
```promql
redis_connected_clients
```

### Panel 6: Operaciones Redis
```promql
rate(redis_commands_processed_total[1m])
```

### Panel 7: Network I/O
```promql
# RX (incoming)
rate(container_network_receive_bytes_total{name=~".*fastapi.*"}[1m])

# TX (outgoing)
rate(container_network_transmit_bytes_total{name=~".*fastapi.*"}[1m])
```

### Panel 8: Memoria Todos
```promql
container_memory_working_set_bytes{name=~".*(fastapi|postgres|redis).*"} / 1024 / 1024
```

---

## Configuración del Dashboard

- **Refresh:** 5 segundos (actualización automática)
- **Time Range:** Últimos 15 minutos
- **Timezone:** Browser (zona horaria local)

---

## Solución de Problemas

### Problema: "No data" en los paneles

**Causa 1:** Prometheus no está capturando métricas
```bash
# Verificar targets en Prometheus
http://localhost:9090/targets

# Todos los targets deben estar en estado "UP"
```

**Causa 2:** Los contenedores no están corriendo
```powershell
# Verificar contenedores
docker ps

# Deberías ver: fastapi, postgres, redis, nginx, celery_worker
```

**Causa 3:** Datasource no configurado
1. Ve a: Configuration → Data Sources
2. Debería existir "Prometheus" apuntando a http://prometheus:9090
3. Haz clic en "Test" para verificar conexión

---

### Problema: Dashboard no aparece después de importar

**Solución:**
1. Ve a: Dashboards → Browse
2. Busca "Capacity Testing - Metrics Dashboard"
3. Haz clic para abrirlo

**URL directa:**
```
http://localhost:3000/d/capacity-metrics-v1/capacity-testing-metrics-dashboard
```

---

## Próximos Pasos

Una vez que el dashboard esté funcionando:

1. ✅ Verificar que todos los paneles muestren datos
2. ✅ Configurar rango de tiempo apropiado (últimos 15 min)
3. ✅ Ejecutar prueba de carga de 100 usuarios
4. ✅ Observar métricas en tiempo real durante la prueba
5. ✅ Capturar screenshots de los paneles clave
6. ✅ Guardar capturas en `capacity_planning/graficos/`

---

## Capturas Recomendadas para el Informe

Durante/después de la prueba de 100 usuarios, capturar:

1. **Dashboard completo** → `escenario1_dashboard_completo.png`
2. **CPU FastAPI** (evidencia de saturación) → `escenario1_cpu_fastapi.png`
3. **Memoria FastAPI** → `escenario1_memoria_fastapi.png`
4. **DB Connections** (evidencia de pool) → `escenario1_db_connections.png`
5. **Network I/O** → `escenario1_network_io.png`

---

**Última actualización:** 18 de Octubre, 2025
