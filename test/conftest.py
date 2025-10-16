"""
Configuración compartida de fixtures para todos los tests
"""
import pytest

def pytest_configure(config):
    """Configuración inicial de pytest"""
    config.addinivalue_line(
        "markers", "api: marca tests relacionados con la API"
    )
    config.addinivalue_line(
        "markers", "video: marca tests relacionados con videos"
    )
