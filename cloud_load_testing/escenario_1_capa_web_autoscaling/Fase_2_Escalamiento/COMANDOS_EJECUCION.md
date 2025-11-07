# Comandos de Ejecución - Fase 2 Escalamiento

## 🚀 Comandos Rápidos

### Escenario 1 - 100 Usuarios ✅ (YA EJECUTADO)

```powershell
cd C:\Users\nicol\Documents\DSNB\desarrollo-sw-nube\cloud_load_testing\escenario_1_capa_web_autoscaling\Fase_2_Escalamiento\Escenario_100_usuarios

jmeter -n -t "WebApp_Carga_AWS_100usuarios.jmx" `
       -l "resultados\resultados_100usuarios.csv" `
       -e -o "dashboards"

# Abrir dashboard
Start-Process "dashboards\index.html"
```

---

### Escenario 2 - 200 Usuarios ⏳ (PENDIENTE)

```powershell
cd C:\Users\nicol\Documents\DSNB\desarrollo-sw-nube\cloud_load_testing\escenario_1_capa_web_autoscaling\Fase_2_Escalamiento\Escenario_200_usuarios

jmeter -n -t "WebApp_Carga_AWS_200usuarios.jmx" `
       -l "resultados\resultados_200usuarios.csv" `
       -e -o "dashboards"

# Abrir dashboard
Start-Process "dashboards\index.html"
```

---

### Escenario 3 - 300 Usuarios ⏳ (PENDIENTE)

```powershell
cd C:\Users\nicol\Documents\DSNB\desarrollo-sw-nube\cloud_load_testing\escenario_1_capa_web_autoscaling\Fase_2_Escalamiento\Escenario_300_usuarios

jmeter -n -t "WebApp_Carga_AWS_300usuarios.jmx" `
       -l "resultados\resultados_300usuarios.csv" `
       -e -o "dashboards"

# Abrir dashboard
Start-Process "dashboards\index.html"
```

---

## 📊 Análisis Post-Ejecución

### Ver resultados CSV

```powershell
# Escenario 1
Get-Content "Escenario_100_usuarios\resultados\resultados_100usuarios.csv" | Measure-Object -Line

# Escenario 2
Get-Content "Escenario_200_usuarios\resultados\resultados_200usuarios.csv" | Measure-Object -Line

# Escenario 3
Get-Content "Escenario_300_usuarios\resultados\resultados_300usuarios.csv" | Measure-Object -Line
```

### Comparar tamaños de archivos

```powershell
Get-ChildItem "Escenario_*\resultados\*.csv" | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize
```

### Abrir todos los dashboards

```powershell
Start-Process "Escenario_100_usuarios\dashboards\index.html"
Start-Process "Escenario_200_usuarios\dashboards\index.html"
Start-Process "Escenario_300_usuarios\dashboards\index.html"
```

---

## ⚠️ Checklist Pre-Ejecución

```powershell
# 1. Verificar video de prueba
Test-Path "C:\Users\nicol\Documents\DSNB\desarrollo-sw-nube\uploads\sample_2560x1440.mp4"

# 2. Verificar token en archivos JMX
Select-String -Path "Escenario_200_usuarios\WebApp_Carga_AWS_200usuarios.jmx" -Pattern "Bearer eyJ" | Select-Object -First 1
Select-String -Path "Escenario_300_usuarios\WebApp_Carga_AWS_300usuarios.jmx" -Pattern "Bearer eyJ" | Select-Object -First 1

# 3. Limpiar carpetas de resultados anteriores (opcional)
Remove-Item "Escenario_200_usuarios\resultados\*" -Force -ErrorAction SilentlyContinue
Remove-Item "Escenario_200_usuarios\dashboards\*" -Recurse -Force -ErrorAction SilentlyContinue

Remove-Item "Escenario_300_usuarios\resultados\*" -Force -ErrorAction SilentlyContinue
Remove-Item "Escenario_300_usuarios\dashboards\*" -Recurse -Force -ErrorAction SilentlyContinue

# 4. Verificar conectividad con ALB
curl -I http://video-app-alb-313685749.us-east-1.elb.amazonaws.com/api/health
```

---

## 🔄 Actualizar Token (Si es necesario)

Si el token expira, ejecutar:

```powershell
# 1. Hacer login
curl -X POST http://video-app-alb-313685749.us-east-1.elb.amazonaws.com/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"testuser@example.com\",\"password\":\"TestPass123!\"}'

# 2. Copiar el nuevo token

# 3. Actualizar todos los archivos JMX
$newToken = "PEGAR_NUEVO_TOKEN_AQUI"

(Get-Content "Escenario_100_usuarios\WebApp_Carga_AWS_100usuarios.jmx") -replace 'Bearer eyJ[^"]*', "Bearer $newToken" | Set-Content "Escenario_100_usuarios\WebApp_Carga_AWS_100usuarios.jmx"

(Get-Content "Escenario_200_usuarios\WebApp_Carga_AWS_200usuarios.jmx") -replace 'Bearer eyJ[^"]*', "Bearer $newToken" | Set-Content "Escenario_200_usuarios\WebApp_Carga_AWS_200usuarios.jmx"

(Get-Content "Escenario_300_usuarios\WebApp_Carga_AWS_300usuarios.jmx") -replace 'Bearer eyJ[^"]*', "Bearer $newToken" | Set-Content "Escenario_300_usuarios\WebApp_Carga_AWS_300usuarios.jmx"
```

---

## 📸 Capturas de CloudWatch

Durante cada ejecución, capturar en estos momentos:

### T+0 (Inicio)
- ASG: Desired/Running instances
- CloudWatch: CPU baseline

### T+3 (Peak de usuarios)
- ASG: CPU metrics
- CloudWatch: ¿Trigger de scaling?

### T+5 (Mitad del hold)
- ASG: Nuevas instancias (si las hay)
- ALB: Target Group health

### T+8 (Final)
- ASG: Estado final
- Métricas consolidadas

---

## 🎯 Métricas AWS a Monitorear

Abrir antes de ejecutar:

1. **EC2 → Auto Scaling Groups → [ASG_NAME]**
   - Activity tab (scaling events)
   - Instances tab (desired/running/pending)

2. **CloudWatch → Dashboards**
   - CPU Utilization
   - Request Count
   - Response Time

3. **EC2 → Load Balancers → video-app-alb**
   - Monitoring tab
   - Target Groups → Healthy targets

---

**Última actualización:** 2025-11-04
