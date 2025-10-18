# =============================================================================
# SCRIPTS PARA EJECUTAR PRUEBAS DE CARGA CON LOCUST
# =============================================================================

# -----------------------------------------------------------------------------
# PASO 1: Construir la imagen de Locust
# -----------------------------------------------------------------------------
Write-Host "🔨 Construyendo imagen de Locust..." -ForegroundColor Cyan
docker build -t load-test-locust ./load_testing

# -----------------------------------------------------------------------------
# PASO 2: Crear usuario de prueba (ejecutar solo una vez)
# -----------------------------------------------------------------------------
Write-Host "`n📝 Creando usuario de prueba..." -ForegroundColor Cyan
Write-Host "Usar Postman o curl para crear el usuario:" -ForegroundColor Yellow
Write-Host @"
POST http://localhost/api/auth/signup
Body (form-data):
{
  "first_name": "Test",
  "last_name": "LoadTest",
  "email": "test@loadtest.com",
  "password1": "TestPassword123",
  "password2": "TestPassword123",
  "city": "Bogota",
  "country": "Colombia"
}
"@ -ForegroundColor White

Write-Host "`nPresiona Enter cuando hayas creado el usuario..." -ForegroundColor Yellow
Read-Host

# -----------------------------------------------------------------------------
# ESCENARIO 1: SMOKE TEST (5 usuarios, 1 minuto)
# -----------------------------------------------------------------------------
Write-Host "`n🔍 ESCENARIO 1: SMOKE TEST" -ForegroundColor Green
Write-Host "5 usuarios concurrentes por 60 segundos" -ForegroundColor Gray
Write-Host "Presiona Enter para iniciar o Ctrl+C para saltar..." -ForegroundColor Yellow
Read-Host

docker run --rm `
  --network desarrollo-sw-nube_default `
  -p 8089:8089 `
  -v ${PWD}/load_testing:/locust `
  load-test-locust `
  -f /locust/locustfile.py `
  --host=http://nginx `
  --users 5 `
  --spawn-rate 1 `
  --run-time 60s `
  --headless `
  --html=/locust/report_smoke.html `
  --csv=/locust/results_smoke

Write-Host "✅ Smoke test completado. Resultados en load_testing/report_smoke.html" -ForegroundColor Green

# -----------------------------------------------------------------------------
# ESCENARIO 2: RAMP-UP TEST (0 a 100 usuarios en 3 min, mantener 5 min)
# -----------------------------------------------------------------------------
Write-Host "`n📈 ESCENARIO 2: RAMP-UP TEST - 100 USUARIOS" -ForegroundColor Green
Write-Host "Escalado: 0 -> 100 usuarios en 3 min" -ForegroundColor Gray
Write-Host "Duración total: 8 minutos (3 ramp-up + 5 sostenido)" -ForegroundColor Gray
Write-Host "Presiona Enter para iniciar o Ctrl+C para saltar..." -ForegroundColor Yellow
Read-Host

docker run --rm `
  --network desarrollo-sw-nube_default `
  -p 8089:8089 `
  -v ${PWD}/load_testing:/locust `
  load-test-locust `
  -f /locust/locustfile.py `
  --host=http://nginx `
  --users 100 `
  --spawn-rate 0.55 `
  --run-time 8m `
  --headless `
  --html=/locust/report_rampup_100.html `
  --csv=/locust/results_rampup_100

Write-Host "✅ Test de 100 usuarios completado" -ForegroundColor Green

# -----------------------------------------------------------------------------
# ESCENARIO 3: RAMP-UP TEST (0 a 200 usuarios)
# -----------------------------------------------------------------------------
Write-Host "`n📈 ESCENARIO 3: RAMP-UP TEST - 200 USUARIOS" -ForegroundColor Green
Write-Host "Presiona Enter para iniciar o Ctrl+C para saltar..." -ForegroundColor Yellow
Read-Host

docker run --rm `
  --network desarrollo-sw-nube_default `
  -p 8089:8089 `
  -v ${PWD}/load_testing:/locust `
  load-test-locust `
  -f /locust/locustfile.py `
  --host=http://nginx `
  --users 200 `
  --spawn-rate 1.1 `
  --run-time 8m `
  --headless `
  --html=/locust/report_rampup_200.html `
  --csv=/locust/results_rampup_200

Write-Host "✅ Test de 200 usuarios completado" -ForegroundColor Green

# -----------------------------------------------------------------------------
# ESCENARIO 4: RAMP-UP TEST (0 a 300 usuarios)
# -----------------------------------------------------------------------------
Write-Host "`n📈 ESCENARIO 4: RAMP-UP TEST - 300 USUARIOS" -ForegroundColor Green
Write-Host "Presiona Enter para iniciar o Ctrl+C para saltar..." -ForegroundColor Yellow
Read-Host

docker run --rm `
  --network desarrollo-sw-nube_default `
  -p 8089:8089 `
  -v ${PWD}/load_testing:/locust `
  load-test-locust `
  -f /locust/locustfile.py `
  --host=http://nginx `
  --users 300 `
  --spawn-rate 1.66 `
  --run-time 8m `
  --headless `
  --html=/locust/report_rampup_300.html `
  --csv=/locust/results_rampup_300

Write-Host "✅ Test de 300 usuarios completado" -ForegroundColor Green

# -----------------------------------------------------------------------------
# RESUMEN
# -----------------------------------------------------------------------------
Write-Host "`n" -NoNewline
Write-Host "="*80 -ForegroundColor Cyan
Write-Host "✅ TODAS LAS PRUEBAS COMPLETADAS" -ForegroundColor Green
Write-Host "="*80 -ForegroundColor Cyan
Write-Host "`nResultados disponibles en:" -ForegroundColor Yellow
Write-Host "  📊 load_testing/report_smoke.html" -ForegroundColor White
Write-Host "  📊 load_testing/report_rampup_100.html" -ForegroundColor White
Write-Host "  📊 load_testing/report_rampup_200.html" -ForegroundColor White
Write-Host "  📊 load_testing/report_rampup_300.html" -ForegroundColor White
Write-Host "`nCSV con métricas detalladas:" -ForegroundColor Yellow
Write-Host "  📈 load_testing/results_*.csv" -ForegroundColor White
Write-Host "="*80 -ForegroundColor Cyan
