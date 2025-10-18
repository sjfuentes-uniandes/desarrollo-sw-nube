# =============================================================================
# DETENER STACK DE OBSERVABILIDAD
# =============================================================================

Write-Host "="*80 -ForegroundColor Yellow
Write-Host "🛑 DETENIENDO STACK DE OBSERVABILIDAD" -ForegroundColor Yellow
Write-Host "="*80 -ForegroundColor Yellow
Write-Host ""

cd load_testing

$keepData = Read-Host "¿Deseas conservar los datos históricos? (s/n)"

if ($keepData -eq "n" -or $keepData -eq "N") {
    Write-Host "🗑️  Deteniendo y eliminando contenedores con datos..." -ForegroundColor Yellow
    docker-compose -f docker-compose.observability.yml down -v
    Write-Host "✅ Servicios detenidos y volúmenes eliminados" -ForegroundColor Green
} else {
    Write-Host "⏹️  Deteniendo servicios (conservando datos)..." -ForegroundColor Yellow
    docker-compose -f docker-compose.observability.yml stop
    Write-Host "✅ Servicios detenidos (datos conservados)" -ForegroundColor Green
}

Write-Host ""
Write-Host "="*80 -ForegroundColor Green
Write-Host "✅ OBSERVABILIDAD DETENIDA" -ForegroundColor Green
Write-Host "="*80 -ForegroundColor Green
Write-Host ""

if ($keepData -eq "s" -or $keepData -eq "S") {
    Write-Host "💾 Los datos se conservaron en volúmenes Docker" -ForegroundColor Cyan
    Write-Host "💡 Para reiniciar: .\load_testing\start_observability.ps1" -ForegroundColor Yellow
} else {
    Write-Host "🗑️  Todos los datos históricos fueron eliminados" -ForegroundColor Yellow
}

Write-Host ""
