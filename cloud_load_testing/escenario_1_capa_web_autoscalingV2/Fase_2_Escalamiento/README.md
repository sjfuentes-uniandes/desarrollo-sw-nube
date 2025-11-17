# Fase 2 - Escalamiento con Autoscaling

## 📋 Descripción

Esta fase evalúa el comportamiento del Auto Scaling Group (ASG) bajo diferentes niveles de carga incremental. Se ejecutan tres escenarios con diferentes cantidades de usuarios concurrentes para observar cómo el sistema escala automáticamente.

## 🎯 Objetivo

Provocar y evaluar el escalamiento automático de instancias EC2 mediante carga progresiva, observando:
- Momento en que se dispara el autoscaling
- Tiempo de respuesta del ASG
- Distribución de carga entre instancias
- Impacto del escalamiento en el rendimiento

## 📁 Estructura de Escenarios

```
Fase_2_Escalamiento/
├── README.md                                    ← Este archivo
├── WebApp_Carga_AWS.jmx                         ← Archivo JMX original (100 usuarios)
│
├── Escenario_100_usuarios/                      ← Escenario 1: Carga moderada
│   ├── WebApp_Carga_AWS_100usuarios.jmx
│   ├── resultados/
│   │   └── resultados_fase2.csv                 ← Resultados ejecutados
│   └── dashboards/
│       └── index.html                           ← Dashboard generado
│
├── Escenario_200_usuarios/                      ← Escenario 2: Carga alta
│   ├── WebApp_Carga_AWS_200usuarios.jmx
│   ├── resultados/
│   └── dashboards/
│
└── Escenario_300_usuarios/                      ← Escenario 3: Carga muy alta
    ├── WebApp_Carga_AWS_300usuarios.jmx
    ├── resultados/
    └── dashboards/
```

## ⚙️ Configuración de Escenarios

### Escenario 1: 100 Usuarios (✅ EJECUTADO)

**Configuración:**
- **Usuarios:** 100
- **Ramp-up:** 180 segundos (3 minutos)
- **Hold:** 300 segundos (5 minutos)
- **Ramp-down:** 10 segundos
- **Duración total:** ~8 minutos

**Resultados Obtenidos:**
- Total Requests: 356
- Éxito: 94.1%
- Tiempo Promedio: 136.14 segundos
- Throughput: 0.6 req/s

**Estado:** ✅ Completado el 2025-11-04

---

### Escenario 2: 200 Usuarios

**Configuración:**
- **Usuarios:** 200
- **Ramp-up:** 180 segundos (3 minutos)
- **Hold:** 300 segundos (5 minutos)
- **Ramp-down:** 10 segundos
- **Duración total:** ~8 minutos

**Hipótesis:**
- Debería provocar escalamiento más agresivo
- CPU > 70% en múltiples instancias
- Posible lanzamiento de 2-3 instancias adicionales

**Estado:** ⏳ Pendiente de ejecución

---

### Escenario 3: 300 Usuarios

**Configuración:**
- **Usuarios:** 300
- **Ramp-up:** 180 segundos (3 minutos)
- **Hold:** 300 segundos (5 minutos)
- **Ramp-down:** 10 segundos
- **Duración total:** ~8 minutos

**Hipótesis:**
- Escalamiento máximo esperado
- Posible saturación del sistema
- Evaluación de límites del ASG (max instances)

**Estado:** ⏳ Pendiente de ejecución

---

## 🚀 Comandos de Ejecución

### Escenario 1 - 100 Usuarios (Ya ejecutado)

```powershell
cd C:\Users\nicol\Documents\DSNB\desarrollo-sw-nube\cloud_load_testing\escenario_1_capa_web_autoscaling\Fase_2_Escalamiento\Escenario_100_usuarios

jmeter -n -t "WebApp_Carga_AWS_100usuarios.jmx" `
       -l "resultados\resultados_100usuarios.csv" `
       -e -o "dashboards"
```

### Escenario 2 - 200 Usuarios

```powershell
cd C:\Users\nicol\Documents\DSNB\desarrollo-sw-nube\cloud_load_testing\escenario_1_capa_web_autoscaling\Fase_2_Escalamiento\Escenario_200_usuarios

jmeter -n -t "WebApp_Carga_AWS_200usuarios.jmx" `
       -l "resultados\resultados_200usuarios.csv" `
       -e -o "dashboards"
```

### Escenario 3 - 300 Usuarios

```powershell
cd C:\Users\nicol\Documents\DSNB\desarrollo-sw-nube\cloud_load_testing\escenario_1_capa_web_autoscaling\Fase_2_Escalamiento\Escenario_300_usuarios

jmeter -n -t "WebApp_Carga_AWS_300usuarios.jmx" `
       -l "resultados\resultados_300usuarios.csv" `
       -e -o "dashboards"
```

---

## 📊 Métricas a Monitorear

### En AWS CloudWatch (Durante cada ejecución)

**Auto Scaling Group:**
- GroupDesiredCapacity
- GroupInServiceInstances
- GroupPendingInstances
- Activity History (timestamps de scaling events)

**EC2 Instances:**
- CPUUtilization (por instancia)
- NetworkIn / NetworkOut
- StatusCheckFailed

**Application Load Balancer:**
- RequestCount
- TargetResponseTime
- HTTPCode_Target_2XX_Count
- HealthyHostCount
- RequestCountPerTarget (distribución)

### En JMeter Dashboard

- Total Requests
- Success Rate (%)
- Response Time (min, avg, max, p95, p99)
- Throughput (req/s)
- Error Rate (%)
- Active Threads Over Time

---

## 📸 Capturas Requeridas

Para cada escenario, capturar screenshots en los siguientes momentos:

**Momento 1 - T+0:** Inicio de la prueba
- ASG: Estado inicial (Desired/Running instances)
- CloudWatch: CPU baseline

**Momento 2 - T+3:** Fin del Ramp-up (peak de usuarios)
- ASG: CPU metrics (esperando > 70%)
- CloudWatch: Activity History (posibles scaling events)

**Momento 3 - T+5:** Mitad del Hold
- ASG: Nuevas instancias (si las hay) en estado Pending/InService
- ALB: Target Group con nuevos targets

**Momento 4 - T+8:** Fin de la prueba
- ASG: Estado final de instancias
- CloudWatch: Métricas consolidadas
- JMeter: Dashboard generado

---

## 🔍 Análisis Comparativo

Al completar los 3 escenarios, se debe realizar:

### Tabla Comparativa

| Métrica | 100 Usuarios | 200 Usuarios | 300 Usuarios |
|---------|--------------|--------------|--------------|
| Total Requests | 356 | ? | ? |
| Success Rate | 94.1% | ? | ? |
| Avg Response Time | 136.14s | ? | ? |
| Throughput | 0.6 req/s | ? | ? |
| Instancias Iniciales | 2 | 2 | 2 |
| Instancias Peak | ? | ? | ? |
| Scaling Events | ? | ? | ? |
| Tiempo hasta Scaling | ? | ? | ? |

### Gráficos Requeridos

1. **Usuarios vs Throughput**
2. **Usuarios vs Response Time**
3. **Usuarios vs Instancias EC2 Activas**
4. **Timeline de Scaling Events**

---

## ⚠️ Consideraciones Importantes

### Antes de Ejecutar

1. **Token JWT válido:** Verificar que no haya expirado
2. **AWS Console abierta:** CloudWatch listo para monitorear
3. **Carpetas limpias:** Asegurar que `resultados/` y `dashboards/` estén vacíos (o respaldados)
4. **Video de prueba:** Confirmar que existe en la ruta configurada
5. **Tiempo disponible:** Cada prueba toma ~10-12 minutos

### Durante la Ejecución

- **No cerrar la terminal** de PowerShell
- **Monitorear AWS Console** activamente
- **Capturar screenshots** en los momentos clave
- **Observar la consola** de JMeter para detectar errores tempranos

### Después de la Ejecución

- **Generar dashboard:** Verificar que se creó `dashboards/index.html`
- **Revisar CSV:** Confirmar que tiene datos en `resultados/*.csv`
- **Documentar resultados:** Actualizar `pruebas_de_carga_entrega3.md`
- **Screenshots:** Organizar capturas con nombres descriptivos

---

## 🎯 Hipótesis de Comportamiento Esperado

### Con 100 Usuarios
- Posible escalamiento de 2 → 3 instancias
- CPU entre 60-80%
- Tiempos de respuesta similares a Fase 1

### Con 200 Usuarios
- Escalamiento más agresivo: 2 → 4-5 instancias
- CPU > 70% garantizado
- Posible mejora en tiempos si el autoscaling es efectivo

### Con 300 Usuarios
- Escalamiento hasta límite del ASG
- CPU muy alta en todas las instancias
- Posible degradación si se alcanza el máximo de instancias
- Evaluación de límites del sistema

---

## 📚 Referencias

- **Documentación Principal:** `capacity_planning/pruebas_de_carga_entrega3.md`
- **Guía Paso a Paso:** `GUIA_PASO_A_PASO.md`
- **Resultados Fase 1:** `../Fase_1_Sanidad/`
- **AWS CloudWatch:** https://console.aws.amazon.com/cloudwatch/

---

**Última actualización:** 2025-11-04  
**Autor:** Equipo Desarrollo SW en la Nube
