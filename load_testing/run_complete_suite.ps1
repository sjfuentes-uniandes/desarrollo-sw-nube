# =============================================================================
# SCRIPT MAESTRO - PRUEBAS DE CAPACIDAD COMPLETAS
# =============================================================================
# Ejecuta todo el flujo: Observabilidad → Pruebas → Análisis → Reporte
# =============================================================================

Write-Host "="*80 -ForegroundColor Cyan
Write-Host "🚀 SUITE COMPLETA DE PRUEBAS DE CAPACIDAD" -ForegroundColor Cyan
Write-Host "="*80 -ForegroundColor Cyan
Write-Host ""
Write-Host "Este script ejecutará:" -ForegroundColor Yellow
Write-Host "  1. Iniciar stack de observabilidad (Prometheus + Grafana)" -ForegroundColor White
Write-Host "  2. Crear usuario de prueba" -ForegroundColor White
Write-Host "  3. Ejecutar pruebas de carga con Locust" -ForegroundColor White
Write-Host "  4. Generar reporte con curvas y bottlenecks" -ForegroundColor White
Write-Host "  5. Detener observabilidad" -ForegroundColor White
Write-Host ""
Write-Host "⏱️  Duración estimada: 30-40 minutos" -ForegroundColor Gray
Write-Host ""

$continue = Read-Host "¿Continuar? (s/n)"
if ($continue -ne "s" -and $continue -ne "S") {
    Write-Host "❌ Abortado por el usuario" -ForegroundColor Red
    exit 0
}

$testName = Read-Host "`nNombre del test (ej: capacity_test_v1)"
if ($testName -eq "") {
    $testName = "capacity_test_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
}

Write-Host ""
Write-Host "📝 Test: $testName" -ForegroundColor Cyan
Write-Host ""

# =============================================================================
# PASO 1: INICIAR OBSERVABILIDAD
# =============================================================================
Write-Host "="*80 -ForegroundColor Green
Write-Host "PASO 1/5: Iniciando Stack de Observabilidad" -ForegroundColor Green
Write-Host "="*80 -ForegroundColor Green
Write-Host ""

.\load_testing\start_observability.ps1

Write-Host ""
Write-Host "✅ Observabilidad lista" -ForegroundColor Green
Write-Host "⏸️  Esperando 15 segundos para estabilización..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# =============================================================================
# PASO 2: CREAR USUARIO DE PRUEBA
# =============================================================================
Write-Host ""
Write-Host "="*80 -ForegroundColor Green
Write-Host "PASO 2/5: Creando Usuario de Prueba" -ForegroundColor Green
Write-Host "="*80 -ForegroundColor Green
Write-Host ""

.\load_testing\create_test_user.ps1

Write-Host ""
Write-Host "✅ Usuario creado" -ForegroundColor Green
Start-Sleep -Seconds 3

# =============================================================================
# PASO 3: EJECUTAR PRUEBAS
# =============================================================================
Write-Host ""
Write-Host "="*80 -ForegroundColor Green
Write-Host "PASO 3/5: Ejecutando Pruebas de Carga" -ForegroundColor Green
Write-Host "="*80 -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Mantén Grafana abierto para observar las métricas en tiempo real" -ForegroundColor Yellow
Write-Host "    http://localhost:3000" -ForegroundColor White
Write-Host ""

$startTime = Get-Date

$openGrafana = Read-Host "¿Abrir Grafana ahora? (s/n)"
if ($openGrafana -eq "s" -or $openGrafana -eq "S") {
    Start-Process "http://localhost:3000"
}

Write-Host ""
Write-Host "Iniciando pruebas en 5 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

.\load_testing\run_load_tests.ps1

$endTime = Get-Date
$duration = ($endTime - $startTime).TotalMinutes

Write-Host ""
Write-Host "✅ Pruebas completadas en $([math]::Round($duration, 1)) minutos" -ForegroundColor Green
Start-Sleep -Seconds 5

# =============================================================================
# PASO 4: GENERAR REPORTE
# =============================================================================
Write-Host ""
Write-Host "="*80 -ForegroundColor Green
Write-Host "PASO 4/5: Generando Reporte Final" -ForegroundColor Green
Write-Host "="*80 -ForegroundColor Green
Write-Host ""

.\load_testing\generate_capacity_report.ps1 -TestName $testName -DurationMinutes ([math]::Ceiling($duration))

Write-Host ""
Write-Host "✅ Reporte generado" -ForegroundColor Green
Start-Sleep -Seconds 3

# =============================================================================
# PASO 5: DETENER OBSERVABILIDAD (OPCIONAL)
# =============================================================================
Write-Host ""
Write-Host "="*80 -ForegroundColor Yellow
Write-Host "PASO 5/5: Detener Observabilidad" -ForegroundColor Yellow
Write-Host "="*80 -ForegroundColor Yellow
Write-Host ""

$stopObs = Read-Host "¿Detener stack de observabilidad ahora? (s/n)"
if ($stopObs -eq "s" -or $stopObs -eq "S") {
    .\load_testing\stop_observability.ps1
    Write-Host "✅ Observabilidad detenida" -ForegroundColor Green
} else {
    Write-Host "⚠️  Observabilidad sigue corriendo" -ForegroundColor Yellow
    Write-Host "💡 Para detenerla más tarde: .\load_testing\stop_observability.ps1" -ForegroundColor Gray
}

# =============================================================================
# RESUMEN FINAL
# =============================================================================
Write-Host ""
Write-Host "="*80 -ForegroundColor Cyan
Write-Host "✅ SUITE DE PRUEBAS COMPLETADA" -ForegroundColor Cyan
Write-Host "="*80 -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Resultados disponibles en:" -ForegroundColor Yellow
Write-Host "   • load_testing/reports/$testName*/REPORTE_CAPACIDAD.md" -ForegroundColor White
Write-Host "   • load_testing/report_*.html (Locust)" -ForegroundColor White
Write-Host ""
Write-Host "📈 Métricas capturadas:" -ForegroundColor Yellow
Write-Host "   ✅ Curvas: Usuarios → Latencia/Errores" -ForegroundColor Green
Write-Host "   ✅ RPS sostenido a capacidad máxima" -ForegroundColor Green
Write-Host "   ✅ Bottlenecks identificados con evidencias" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Revisa el reporte en REPORTE_CAPACIDAD.md" -ForegroundColor White
Write-Host "   2. Completa los valores faltantes con datos de Locust" -ForegroundColor White
Write-Host "   3. Toma capturas de Grafana y agrégalas al reporte" -ForegroundColor White
Write-Host "   4. Documenta conclusiones y recomendaciones" -ForegroundColor White
Write-Host ""
Write-Host "="*80 -ForegroundColor Cyan
Write-Host ""
