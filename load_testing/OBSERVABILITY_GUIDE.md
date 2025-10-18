# 🎯 SOLUCIÓN COMPLETA DE OBSERVABILIDAD CON PROMETHEUS + GRAFANA

## 📋 RESUMEN EJECUTIVO

He implementado una **solución completa de observabilidad** para tus pruebas de capacidad que genera exactamente los resultados que necesitas:

✅ **Curvas: Usuarios → Latencia/Errores**
✅ **RPS sostenido a capacidad máxima** (ej: "Soporta 450 usuarios a 320 RPS con p95 < 1.0s")
✅ **Bottlenecks con evidencias** (ej: "CPU 90% en API", "Saturación de ancho de banda")

---

## 🏗️ ARQUITECTURA DE LA SOLUCIÓN

```
┌─────────────────────────────────────────────────────────────────┐
│                    STACK DE OBSERVABILIDAD                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│  │  Locust  │───▶│Prometheus│───▶│ Grafana  │    │ Exporters│ │
│  │ (Pruebas)│    │(Métricas)│    │(Visualiz)│    │(cAdvisor)│ │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘ │
│       │                                                   │      │
│       │                                                   │      │
│       ▼                                                   ▼      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │          APLICACIÓN BAJO PRUEBA (Docker)                │   │
│  │  FastAPI │ Celery │ PostgreSQL │ Redis │ Nginx          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                     ┌────────────────┐
                     │ REPORTE FINAL  │
                     │ con Curvas y   │
                     │  Bottlenecks   │
                     └────────────────┘
```

---

## 📦 COMPONENTES IMPLEMENTADOS

### 1. **Prometheus** (puerto 9090)
- Time-series database para almacenar métricas
- Scraping cada 5 segundos de todos los servicios
- Retención de 7 días

### 2. **Grafana** (puerto 3000)
- Dashboard preconfigur ado con paneles clave:
  - 📊 Curva: Usuarios vs Latencia (p95 y p50)
  - 🚨 Tasa de Errores en tiempo real
  - 🔥 CPU % por contenedor (bottleneck)
  - 💾 Memoria por contenedor (bottleneck)
  - 🌐 Ancho de banda de red (bottleneck)
  - ⚡ RPS sostenido a capacidad máxima
- Actualización cada 5 segundos
- Usuario: admin / admin

### 3. **cAdvisor** (puerto 8080)
- Métricas detalladas de contenedores Docker
- CPU, memoria, red, disco de cada contenedor
- Sin overhead significativo

### 4. **Exporters**
- **Node Exporter**: Métricas del sistema host
- **PostgreSQL Exporter**: Métricas de la BD
- **Redis Exporter**: Métricas de Redis/Celery

### 5. **Locust** (puerto 8089)
- Generador de carga con múltiples escenarios
- Reportes HTML con estadísticas detalladas
- CSVs con datos granulares

---

## 🚀 GUÍA DE USO RÁPIDO

### Opción A: Suite Completa Automatizada (Recomendado)

```powershell
cd load_testing
.\run_complete_suite.ps1
```

Este script ejecuta TODO automáticamente:
1. ✅ Levanta Prometheus + Grafana
2. ✅ Crea usuario de prueba
3. ✅ Ejecuta pruebas de carga (Smoke + Ramp-ups)
4. ✅ Genera reporte con curvas y bottlenecks
5. ✅ Opcionalmente detiene observabilidad

**Duración:** ~30-40 minutos

---

### Opción B: Paso a Paso (Control Manual)

#### Paso 1: Iniciar Observabilidad
```powershell
cd load_testing
.\start_observability.ps1
```

Abre: http://localhost:3000 (Grafana) - Usuario: admin / admin

#### Paso 2: Crear Usuario de Prueba
```powershell
.\create_test_user.ps1
```

#### Paso 3: Ejecutar Pruebas
```powershell
.\run_load_tests.ps1
```

O con interfaz web:
```powershell
.\run_locust_web.ps1
# Abre http://localhost:8089
```

#### Paso 4: Generar Reporte Final
```powershell
.\generate_capacity_report.ps1 -TestName "mi_test" -DurationMinutes 30
```

#### Paso 5: Detener Observabilidad
```powershell
.\stop_observability.ps1
```

---

## 📊 RESULTADOS QUE OBTENDRÁS

### 1. Dashboard de Grafana en Tiempo Real

**Paneles disponibles:**
- 📈 Curva Usuarios vs Latencia (p95/p50)
- 🚨 Tasa de Errores (gauge)
- 🔥 CPU por Contenedor (con thresholds 70%/90%)
- 💾 Memoria por Contenedor
- 🌐 Ancho de Banda (RX/TX)
- ⚡ RPS Sostenido (gauge)

**Características:**
- Actualización cada 5 segundos
- Alertas visuales cuando se exceden thresholds
- Colores por severidad (verde/amarillo/rojo)
- Zoom y navegación temporal

### 2. Reportes HTML de Locust

- Estadísticas completas por endpoint
- Gráficos de latencia (min/med/max)
- Distribución de respuestas
- Lista de errores
- Throughput (RPS) en el tiempo

### 3. Reporte Final en Markdown

Ubicación: `load_testing/reports/[test_name]/REPORTE_CAPACIDAD.md`

**Contiene:**
- ✅ Capacidad máxima encontrada (usuarios, RPS, latencia)
- ✅ Curvas de rendimiento explicadas
- ✅ Bottlenecks identificados con tabla
- ✅ Evidencias (links a JSONs, HTMLs, CSVs)
- ✅ Recomendaciones de escalado
- ✅ Plantilla para capturas de Grafana

**Ejemplo de sección de bottlenecks:**
```markdown
| Servicio | Tipo | Valor Máximo | Severidad | Recomendación |
|----------|------|--------------|-----------|---------------|
| 🔴 FASTAPI | CPU | 92.3% | CRÍTICO | Escalar horizontalmente o aumentar CPU |
| 🟠 FASTAPI | ANCHO DE BANDA SUBIDA | 65.2 MB/s | CRÍTICO | Saturación de red - Optimizar payload |
| 🟡 POSTGRES | MEMORIA | 1850 MB | ALTO | Aumentar límite de memoria |
```

### 4. Datos Crudos para Análisis

- **JSONs**: Métricas exportadas de Prometheus
- **CSVs**: Datos granulares de Locust
- **Logs**: Monitoreo de recursos

---

## 🎯 CÓMO INTERPRETAR LOS RESULTADOS

### Identificar Capacidad Máxima

1. **En Grafana**: Observa cuándo la curva de latencia se dispara
2. **En Locust**: Revisa el RPS máximo sostenido
3. **Documenta**: "Soporta X usuarios a Y RPS con p95 < Z ms"

**Ejemplo:**
> "El sistema soporta **450 usuarios concurrentes** a **320 RPS** 
> manteniendo **p95 < 1000ms** y **tasa de error < 1%**"

### Identificar Bottlenecks

**En Grafana, busca:**
- 🔥 **CPU > 90%**: Bottleneck de procesamiento
- 💾 **Memoria creciente**: Posible memory leak
- 🌐 **Ancho de banda saturado**: Bottleneck de red
- 📊 **Latencia creciente**: Sistema sobrecargado

**En el Reporte:**
Los bottlenecks se identifican y documentan automáticamente con evidencias.

---

## 📸 CAPTURA DE EVIDENCIAS

### Desde Grafana:

1. Navega a: http://localhost:3000
2. Durante o después de las pruebas:
   - Toma captura del panel "Usuarios vs Latencia"
   - Toma captura del panel "CPU por Contenedor"
   - Toma captura del panel "Ancho de Banda"
   - Toma captura del panel "RPS Sostenido"
3. Guarda las imágenes en el directorio del reporte
4. Actualiza los links en REPORTE_CAPACIDAD.md

### Desde Locust:

Los reportes HTML se copian automáticamente al directorio del reporte.

---

## 🔧 CONFIGURACIÓN AVANZADA

### Ajustar Intervalo de Scraping

Edita `load_testing/observability/prometheus.yml`:
```yaml
global:
  scrape_interval: 5s  # Cambiar a 10s, 15s, etc.
```

### Agregar Más Paneles a Grafana

1. Accede a Grafana (http://localhost:3000)
2. Edita el dashboard "Pruebas de Capacidad"
3. Agrega paneles con queries de Prometheus
4. Guarda cambios

**Queries útiles:**
```promql
# Latencia p95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[1m]))

# RPS por endpoint
rate(http_requests_total[1m])

# Conexiones activas en PostgreSQL
pg_stat_activity_count

# Items en cola de Celery
redis_db_keys{db="0"}
```

### Modificar Thresholds de Bottlenecks

Edita `generate_capacity_report.ps1`:
```powershell
if ($maxCpu -gt 90) {  # Cambiar threshold de CPU
    $severity = "CRÍTICO"
}
```

---

## 🐛 TROUBLESHOOTING

### Grafana no muestra datos

**Solución:**
```powershell
# Verificar que Prometheus esté scraping
# Abre: http://localhost:9090/targets
# Todos los targets deben estar "UP"
```

### cAdvisor no funciona en Windows

**Solución:**
Es normal, cAdvisor tiene limitaciones en Windows. Alternativas:
- Usar Docker Desktop en modo Linux containers
- Ejecutar en WSL2
- Usar solo las métricas de Node Exporter

### Error "Unable to connect to Prometheus"

**Solución:**
```powershell
# Verificar que Prometheus esté corriendo
docker ps | grep prometheus

# Ver logs
docker logs observability-prometheus
```

### Locust no puede conectarse a la API

**Solución:**
```powershell
# Verificar red de Docker
docker network inspect desarrollo-sw-nube_default

# Asegurar que Locust esté en la misma red
```

---

## 📚 ARCHIVOS CREADOS

```
load_testing/
├── docker-compose.observability.yml      # Stack Prometheus+Grafana
├── start_observability.ps1               # Iniciar observabilidad
├── stop_observability.ps1                # Detener observabilidad
├── generate_capacity_report.ps1          # Generar reporte final
├── run_complete_suite.ps1                # Suite completa automatizada
├── locustfile.py                         # Escenarios de prueba
├── run_load_tests.ps1                    # Ejecutar pruebas automatizadas
├── run_locust_web.ps1                    # Ejecutar con UI web
├── create_test_user.ps1                  # Crear usuario de prueba
├── README.md                             # Documentación
├── OBSERVABILITY_GUIDE.md               # Esta guía
│
├── observability/
│   ├── prometheus.yml                    # Config de Prometheus
│   └── grafana/
│       ├── provisioning/
│       │   ├── datasources/
│       │   │   └── prometheus.yml        # Datasource de Prometheus
│       │   └── dashboards/
│       │       └── dashboards.yml        # Config de dashboards
│       └── dashboards/
│           └── capacity_test_dashboard.json  # Dashboard principal
│
└── reports/                              # Reportes generados
    └── [test_name]_[timestamp]/
        ├── REPORTE_CAPACIDAD.md         # Reporte principal
        ├── *.json                        # Métricas de Prometheus
        ├── report_*.html                 # Reportes de Locust
        └── results_*.csv                 # Datos granulares
```

---

## ✅ CHECKLIST DE EJECUCIÓN

### Antes de las Pruebas:
- [ ] Servicios principales corriendo (`docker-compose ps`)
- [ ] Stack de observabilidad iniciado (`start_observability.ps1`)
- [ ] Grafana accesible (http://localhost:3000)
- [ ] Usuario de prueba creado (`create_test_user.ps1`)
- [ ] Puertos libres: 3000, 9090, 8080, 8089

### Durante las Pruebas:
- [ ] Grafana abierto para monitoreo en tiempo real
- [ ] Observar curvas de latencia y CPU
- [ ] Tomar capturas en momentos clave
- [ ] Anotar cuando se observa degradación

### Después de las Pruebas:
- [ ] Generar reporte (`generate_capacity_report.ps1`)
- [ ] Completar valores faltantes en REPORTE_CAPACIDAD.md
- [ ] Agregar capturas de Grafana al reporte
- [ ] Documentar conclusiones
- [ ] Detener observabilidad (`stop_observability.ps1`)

---

## 🎓 PRÓXIMOS PASOS

1. **Ejecuta la suite completa:**
   ```powershell
   .\load_testing\run_complete_suite.ps1
   ```

2. **Revisa los resultados** en el reporte generado

3. **Completa el documento** con:
   - Valores de Locust (usuarios máximos, RPS, latencias)
   - Capturas de Grafana
   - Conclusiones y recomendaciones

4. **Presenta los resultados** con evidencias sólidas:
   - ✅ Curvas visuales
   - ✅ Bottlenecks identificados
   - ✅ Capacidad máxima documentada

---

## 🆘 SOPORTE

Si encuentras problemas:

1. Verifica los logs: `docker logs [container_name]`
2. Revisa el estado: `docker ps`
3. Consulta Prometheus targets: http://localhost:9090/targets
4. Revisa esta guía en la sección Troubleshooting

---

**¡Estás listo para realizar pruebas de capacidad profesionales con observabilidad completa!** 🚀

---

**Creado por:** GitHub Copilot
**Fecha:** $(Get-Date -Format "yyyy-MM-dd")
**Versión:** 1.0
