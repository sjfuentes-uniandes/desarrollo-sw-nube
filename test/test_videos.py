from datetime import datetime
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import Mock, patch, MagicMock, mock_open
from io import BytesIO
import time
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

def create_test_user(db, email="test_1@gmail.com"):
    user = User(
        first_name="John",
        last_name="Doe",
        email=email,
        password_hash=get_password_hash("mipassword123"),
        city="Bogota",
        country="Colombia",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def create_test_video(db, user, status=VideoStatus.processed):
    video = Video(
        title="Test Video",
        status=status,
        user_id=user.id,
        uploaded_at=datetime.now(),
        processed_at=datetime.now(),
        original_url="https://example.com",
        processed_url="https://example.com",
    )
    db.add(video)
    db.commit()
    db.refresh(video)
    return video

def auth_header(client, email, password="mipassword123"):
    response_login = client.post("/api/auth/login", json={
        "email": email,
        "password": password
    })

    assert response_login.status_code == 200, f"Login failed: {response_login.json()}"

    token = response_login.json().get("access_token")
    assert token, "No se devolvió token en el login"

    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def auth_headers(client):
    """Headers de autenticación para usuario de prueba"""
    client.post("/api/auth/signup", json={
        "first_name": "Test",
        "last_name": "User",
        "email": "test@example.com",
        "password1": "testpass123",
        "password2": "testpass123"
    })
    
    login_response = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "testpass123"
    })
    
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_get_video_not_found(client):
    db = TestingSessionLocal()
    user_a = create_test_user(db)
    headers = auth_header(client, user_a.email)

    response = client.get("/api/videos/999", headers=headers)
    assert response.status_code == 404
    assert response.json()["detail"] == "Video not found"

def test_get_video_unauthorized(client):
    db = TestingSessionLocal()
    user_a = create_test_user(db)
    video = create_test_video(db, user_a)

    user_b = create_test_user(db, email="test_2@gmail.com")
    headers = auth_header(client, user_b.email)

    response = client.get(f"/api/videos/{video.id}", headers=headers)

    assert response.status_code == 403
    assert response.json()["detail"] == "You are not authorized"

def test_get_video_success(client):
    db = TestingSessionLocal()
    user = create_test_user(db)
    video = create_test_video(db, user)

    vote = Vote(user_id=user.id, video_id=video.id)
    db.add(vote)
    db.commit()

    headers = auth_header(client, user.email)

    response = client.get(f"/api/videos/{video.id}", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["video_id"] == video.id
    assert data["votes"] == 1

def test_delete_video_not_found(client):
    db = TestingSessionLocal()
    user = create_test_user(db)
    headers = auth_header(client, user.email)

    response = client.delete("/api/videos/999", headers=headers)
    assert response.status_code == 404
    assert response.json()["detail"] == "Video not found"

def test_delete_video_unauthorized(client):
    db = TestingSessionLocal()
    user_a = create_test_user(db)
    video = create_test_video(db, user_a)
    user_b = create_test_user(db, "test_02@gmail.com")
    headers = auth_header(client, user_b.email)

    response = client.delete(f"/api/videos/{video.id}", headers=headers)
    assert response.status_code == 403
    assert response.json()["detail"] == "You are not authorized"

def test_delete_video_public(client):
    db = TestingSessionLocal()
    user = create_test_user(db)
    video = create_test_video(db, user, VideoStatus.public)
    headers = auth_header(client, user.email)

    response = client.delete(f"/api/videos/{video.id}", headers=headers)
    assert response.status_code == 400
    assert response.json()["detail"] == "Video is public"

@patch('src.routers.video_router.s3_client.delete_object')
def test_delete_video_success(mock_s3_delete, client):
    db = TestingSessionLocal()
    user = create_test_user(db)
    video = create_test_video(db, user)
    headers = auth_header(client, user.email)

    response = client.delete(f"/api/videos/{video.id}", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "El video ha sido eliminado exitosamente."
    assert data["video_id"] == video.id