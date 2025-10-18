# =============================================================================
# CREAR USUARIO DE PRUEBA PARA LOAD TESTING
# =============================================================================

Write-Host "📝 Creando usuario de prueba para Locust..." -ForegroundColor Cyan
Write-Host ""

$url = "http://localhost/api/auth/signup"
$body = @{
    first_name = "Test"
    last_name = "LoadTest"
    email = "test@loadtest.com"
    password1 = "TestPassword123"
    password2 = "TestPassword123"
    city = "Bogota"
    country = "Colombia"
}

try {
    Write-Host "Enviando petición a: $url" -ForegroundColor Gray
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"
    
    Write-Host "✅ Usuario creado exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Credenciales para Locust:" -ForegroundColor Yellow
    Write-Host "  Email: test@loadtest.com" -ForegroundColor White
    Write-Host "  Password: TestPassword123" -ForegroundColor White
    Write-Host ""
    Write-Host "Usuario creado:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $statusDescription = $_.Exception.Response.StatusDescription
    
    if ($statusCode -eq 400) {
        Write-Host "⚠️  El usuario probablemente ya existe" -ForegroundColor Yellow
        Write-Host "Puedes continuar con las pruebas usando:" -ForegroundColor Gray
        Write-Host "  Email: test@loadtest.com" -ForegroundColor White
        Write-Host "  Password: TestPassword123" -ForegroundColor White
    } else {
        Write-Host "❌ Error al crear usuario: $statusCode - $statusDescription" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Presiona Enter para continuar..." -ForegroundColor Yellow
Read-Host
