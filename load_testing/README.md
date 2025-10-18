# 🚀 Pruebas de Carga con Locust

Este directorio contiene todos los scripts y herramientas necesarias para realizar pruebas de capacidad de la capa web de la aplicación.

## 📋 Contenido

```
load_testing/
├── locustfile.py              # Script principal de Locust con escenarios de prueba
├── Dockerfile                 # Imagen Docker de Locust
├── create_test_user.ps1      # Crear usuario de prueba
├── run_load_tests.ps1        # Ejecutar todos los escenarios automatizados
├── run_locust_web.ps1        # Ejecutar Locust con UI web interactiva
├── monitor_resources.ps1      # Monitorear recursos durante las pruebas
└── README.md                  # Este archivo
```

## 🎯 Escenarios de Prueba

### Escenario 1: Smoke Test
- **Usuarios**: 5
- **Duración**: 1 minuto
- **Objetivo**: Verificar que el sistema funciona correctamente

### Escenario 2: Ramp-up 100 usuarios
- **Usuarios**: 0 → 100
- **Ramp-up**: 3 minutos
- **Duración sostenida**: 5 minutos
- **Objetivo**: Evaluar comportamiento con carga moderada

### Escenario 3: Ramp-up 200 usuarios
- **Usuarios**: 0 → 200
- **Ramp-up**: 3 minutos
- **Duración sostenida**: 5 minutos
- **Objetivo**: Identificar límites del sistema

### Escenario 4: Ramp-up 300 usuarios
- **Usuarios**: 0 → 300
- **Ramp-up**: 3 minutos
- **Duración sostenida**: 5 minutos
- **Objetivo**: Encontrar punto de quiebre

## 🚀 Inicio Rápido

### Prerrequisitos
✅ Docker instalado y corriendo
✅ Aplicación principal ejecutándose (`docker-compose up -d`)
✅ Puertos disponibles: 8089 (Locust), 3000 (Grafana), 9090 (Prometheus)

### Paso 1: Iniciar Stack de Observabilidad

```powershell
cd load_testing
.\start_observability.ps1
```

Esto levanta **Prometheus + Grafana + Exporters** para capturar métricas en tiempo real.
- 🎨 Grafana: http://localhost:3000 (admin/admin)
- 📈 Prometheus: http://localhost:9090

### Paso 2: Crear Usuario de Prueba

```powershell
.\create_test_user.ps1
```

### Paso 3: Ejecutar Pruebas Automatizadas

```powershell
.\run_load_tests.ps1
```

Este script ejecutará todos los escenarios secuencialmente y generará reportes HTML y CSV.

### Paso 4: Generar Reporte Final con Curvas y Bottlenecks

```powershell
.\generate_capacity_report.ps1 -TestName "rampup_300" -DurationMinutes 30
```

Esto exporta métricas de Prometheus, analiza bottlenecks y genera un reporte completo en Markdown con:
- ✅ Curvas: Usuarios → Latencia/Errores
- ✅ RPS sostenido a capacidad máxima
- ✅ Bottlenecks identificados con evidencias (CPU 90%, saturación de red, etc.)

### Paso 3 (Opcional): Ejecutar con UI Web

Si prefieres controlar las pruebas manualmente:

```powershell
.\run_locust_web.ps1
```

Luego abre http://localhost:8089 en tu navegador.

## 📊 Monitoreo de Recursos

En una terminal separada, ejecuta:

```powershell
.\monitor_resources.ps1
```

Este script mostrará en tiempo real:
- Uso de CPU por contenedor
- Consumo de memoria
- I/O de red y disco

Los datos se guardan en `monitor_YYYYMMDD_HHMMSS.log`

## 📈 Resultados

Después de ejecutar las pruebas, encontrarás:

### Reportes HTML
- `report_smoke.html` - Resultados del smoke test
- `report_rampup_100.html` - Resultados con 100 usuarios
- `report_rampup_200.html` - Resultados con 200 usuarios
- `report_rampup_300.html` - Resultados con 300 usuarios

### Archivos CSV
- `results_smoke_stats.csv` - Estadísticas detalladas
- `results_smoke_failures.csv` - Log de errores
- `results_rampup_*_stats.csv` - Stats de cada escenario
- `monitor_*.log` - Logs de recursos del sistema

## 🔍 Métricas Clave a Analizar

### En los Reportes HTML:
- **Total Requests**: Número total de peticiones
- **Failures**: Cantidad y tipo de errores
- **Median Response Time**: Tiempo de respuesta mediano
- **95th Percentile**: p95 (debe ser < 1000ms según SLO)
- **Requests/s**: Throughput del sistema
- **Users**: Usuarios concurrentes soportados

### En los CSVs:
- `Average Response Time` - Latencia promedio
- `Min/Max Response Time` - Rango de latencias
- `Requests per Second` - RPS sostenido
- `Failure Rate` - Porcentaje de errores

## ⚙️ Personalización

### Modificar el número de usuarios

Edita `run_load_tests.ps1` y cambia el parámetro `--users`:

```powershell
--users 100    # Cambia a 50, 150, 500, etc.
```

### Cambiar duración de la prueba

Modifica el parámetro `--run-time`:

```powershell
--run-time 8m    # Cambia a 5m, 10m, 15m, etc.
```

### Ajustar spawn rate (velocidad de creación de usuarios)

```powershell
--spawn-rate 1.1    # Usuarios por segundo
```

### Modificar comportamiento de usuarios

Edita `locustfile.py` y ajusta:
- `wait_time`: Tiempo entre requests
- Weights de las tasks: `@task(3)` = 3x más frecuente
- Endpoints a probar

## 🐛 Troubleshooting

### Error: "No puedo conectarme a la API"
**Solución**: Verifica que los servicios estén corriendo:
```powershell
docker-compose ps
```

### Error: "Login failed"
**Solución**: Asegúrate de haber creado el usuario de prueba:
```powershell
.\create_test_user.ps1
```

### Error: "Port 8089 already in use"
**Solución**: Detén cualquier instancia previa de Locust:
```powershell
docker ps | grep locust
docker stop <container_id>
```

### Los archivos CSV/HTML no se generan
**Solución**: Verifica que el volumen esté montado correctamente y que tengas permisos de escritura en el directorio `load_testing/`.

## 📚 Comandos Útiles

### Ver logs de Locust en tiempo real
```powershell
docker logs -f <locust_container_id>
```

### Ejecutar un test rápido de 30 segundos
```powershell
docker run --rm `
  --network desarrollo-sw-nube_default `
  -v ${PWD}/load_testing:/locust `
  load-test-locust `
  -f /locust/locustfile.py `
  --host=http://nginx `
  --users 10 `
  --spawn-rate 1 `
  --run-time 30s `
  --headless
```

### Limpiar resultados anteriores
```powershell
Remove-Item load_testing/report_*.html
Remove-Item load_testing/results_*.csv
Remove-Item load_testing/monitor_*.log
```

## 📖 Documentación Adicional

- [Locust Documentation](https://docs.locust.io/)
- [Plan de Pruebas Completo](../capacity_planning/plan_de_pruebas.md)
- [Análisis de Capacidad](../capacity_planning/)

## ✅ Checklist de Ejecución

- [ ] Servicios principales corriendo (`docker-compose ps`)
- [ ] Usuario de prueba creado (`create_test_user.ps1`)
- [ ] Imagen de Locust construida (`docker build`)
- [ ] Monitoreo iniciado en terminal separada (`monitor_resources.ps1`)
- [ ] Pruebas ejecutadas (`run_load_tests.ps1`)
- [ ] Resultados analizados (reportes HTML)
- [ ] Métricas documentadas
- [ ] Cuellos de botella identificados

---

**🎯 Objetivo**: Determinar la capacidad máxima de usuarios concurrentes que el sistema puede soportar manteniendo SLOs:
- p95 < 1000ms
- Tasa de error < 1%
- Sistema estable durante 5 minutos
