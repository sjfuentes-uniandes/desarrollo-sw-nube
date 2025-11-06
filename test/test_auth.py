from datetime import datetime
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import Mock, patch, MagicMock, mock_open
from io import BytesIO
import os

# Set environment variables for testing
os.environ.setdefault('DATABASE_URL', 'sqlite:///./test.db')
os.environ.setdefault('SECRET_KEY', 'test-secret-key')
os.environ.setdefault('REDIS_URL', 'redis://localhost:6379/0')
os.environ.setdefault('S3_BUCKET_NAME', 'test-bucket')

# Mock boto3 before importing
with patch('boto3.client'):
    from src.main import app
    from src.db.database import get_db, Base
    from src.models.db_models import User, VideoStatus, Video, Vote
    from src.core.security import create_access_token, get_password_hash

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="function")
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)

def test_signup_success(client):
    response = client.post("/api/auth/signup", json={
        "first_name": "Test",
        "last_name": "User",
        "email": "test@example.com",
        "city": "Test City",
        "country": "Test Country",
        "password1": "testpass123",
        "password2": "testpass123"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["first_name"] == "Test"

def test_signup_password_mismatch(client):
    response = client.post("/api/auth/signup", json={
        "first_name": "Test",
        "last_name": "User",
        "email": "test@example.com",
        "password1": "testpass123",
        "password2": "different123"
    })
    assert response.status_code == 400
    assert "Las contraseñas no coinciden" in response.json()["detail"]

def test_signup_duplicate_email(client):
    # Create first user
    client.post("/api/auth/signup", json={
        "first_name": "Test",
        "last_name": "User",
        "email": "test@example.com",
        "password1": "testpass123",
        "password2": "testpass123"
    })
    
    # Try to create second user with same email
    response = client.post("/api/auth/signup", json={
        "first_name": "Another",
        "last_name": "User",
        "email": "test@example.com",
        "password1": "testpass123",
        "password2": "testpass123"
    })
    assert response.status_code == 400
    assert "Email ya está registrado" in response.json()["detail"]

def test_login_success(client):
    # Create user first
    client.post("/api/auth/signup", json={
        "first_name": "Test",
        "last_name": "User",
        "email": "test@example.com",
        "password1": "testpass123",
        "password2": "testpass123"
    })
    
    # Login
    response = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "testpass123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_credentials(client):
    response = client.post("/api/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "wrongpass"
    })
    assert response.status_code == 401
    assert "Credenciales inválidas" in response.json()["detail"]

def test_login_wrong_password(client):
    # Create user first
    client.post("/api/auth/signup", json={
        "first_name": "Test",
        "last_name": "User",
        "email": "test@example.com",
        "password1": "testpass123",
        "password2": "testpass123"
    })
    
    # Login with wrong password
    response = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "wrongpass"
    })
    assert response.status_code == 401
    assert "Credenciales inválidas" in response.json()["detail"]