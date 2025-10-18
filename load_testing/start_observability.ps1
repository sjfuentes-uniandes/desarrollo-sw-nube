# =============================================================================
# INICIAR STACK DE OBSERVABILIDAD
# =============================================================================
# Este script levanta Prometheus + Grafana + Exporters para las pruebas
# =============================================================================

Write-Host "="*80 -ForegroundColor Cyan
Write-Host "🚀 INICIANDO STACK DE OBSERVABILIDAD" -ForegroundColor Cyan
Write-Host "="*80 -ForegroundColor Cyan
Write-Host ""

# Verificar que la aplicación principal esté corriendo
Write-Host "🔍 Verificando servicios principales..." -ForegroundColor Yellow
$mainServices = docker ps --filter "name=desarrollo-sw-nube" --format "{{.Names}}"

if ($mainServices.Count -eq 0) {
    Write-Host "❌ Los servicios principales no están corriendo" -ForegroundColor Red
    Write-Host "💡 Ejecuta primero: docker-compose up -d" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "¿Quieres iniciarlos ahora? (s/n)"
    
    if ($continue -eq "s" -or $continue -eq "S") {
        Write-Host "🚀 Iniciando servicios principales..." -ForegroundColor Cyan
        docker-compose up -d
        Write-Host "✅ Servicios principales iniciados" -ForegroundColor Green
        Write-Host "⏳ Esperando 10 segundos para que se estabilicen..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
    } else {
        Write-Host "⚠️  Abortando..." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "✅ Servicios principales detectados:" -ForegroundColor Green
$mainServices | ForEach-Object { Write-Host "   • $_" -ForegroundColor White }
Write-Host ""

# Levantar stack de observabilidad
Write-Host "🐳 Levantando servicios de observabilidad..." -ForegroundColor Cyan
Write-Host ""

cd load_testing
docker-compose -f docker-compose.observability.yml up -d

Write-Host ""
Write-Host "⏳ Esperando a que los servicios estén listos..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar estado
Write-Host ""
Write-Host "📊 Verificando estado de los servicios..." -ForegroundColor Cyan
$observabilityServices = docker ps --filter "name=observability" --format "table {{.Names}}\t{{.Status}}"

Write-Host $observabilityServices
Write-Host ""

# URLs de acceso
Write-Host "="*80 -ForegroundColor Green
Write-Host "✅ STACK DE OBSERVABILIDAD LISTO" -ForegroundColor Green
Write-Host "="*80 -ForegroundColor Green
Write-Host ""
Write-Host "📊 URLs de Acceso:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   🎨 Grafana Dashboard:" -ForegroundColor Cyan
Write-Host "      http://localhost:3000" -ForegroundColor White
Write-Host "      Usuario: admin" -ForegroundColor Gray
Write-Host "      Password: admin" -ForegroundColor Gray
Write-Host ""
Write-Host "   📈 Prometheus:" -ForegroundColor Cyan
Write-Host "      http://localhost:9090" -ForegroundColor White
Write-Host ""
Write-Host "   🐳 cAdvisor (Contenedores):" -ForegroundColor Cyan
Write-Host "      http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "   🖥️  Node Exporter (Sistema):" -ForegroundColor Cyan
Write-Host "      http://localhost:9100" -ForegroundColor White
Write-Host ""
Write-Host "="*80 -ForegroundColor Green
Write-Host ""
Write-Host "💡 Consejos:" -ForegroundColor Yellow
Write-Host "   1. Abre Grafana y verás el dashboard preconfigura do" -ForegroundColor White
Write-Host "   2. El dashboard se actualiza cada 5 segundos" -ForegroundColor White
Write-Host "   3. Ahora puedes ejecutar las pruebas con Locust" -ForegroundColor White
Write-Host "   4. Las métricas se capturarán automáticamente" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Siguiente paso:" -ForegroundColor Cyan
Write-Host "   .\load_testing\run_load_tests.ps1" -ForegroundColor White
Write-Host ""
Write-Host "🛑 Para detener la observabilidad:" -ForegroundColor Red
Write-Host "   .\load_testing\stop_observability.ps1" -ForegroundColor White
Write-Host ""

# Abrir Grafana automáticamente
$openBrowser = Read-Host "¿Abrir Grafana en el navegador? (s/n)"
if ($openBrowser -eq "s" -or $openBrowser -eq "S") {
    Start-Process "http://localhost:3000"
    Write-Host "✅ Grafana abierto en el navegador" -ForegroundColor Green
}

Write-Host ""
Write-Host "Presiona Enter para continuar..." -ForegroundColor Gray
Read-Host
