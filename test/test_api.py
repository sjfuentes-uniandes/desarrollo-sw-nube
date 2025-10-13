from datetime import datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
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

# ---------------------- GET /api/videos/{video_id} ----------------------
def create_test_user(db):
    user = User(
        first_name="John",
        last_name="Doe",
        email="test_1@gmail.com",
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

    user_b = create_test_user(db)
    response = client.get(f"/api/videos/{video.id}", headers=auth_header(user_b))

    assert response.status_code == 403
    assert response.json()["detail"] == "You are not authorized"

def test_get_video_success(client):
    db = TestingSessionLocal()
    user = create_test_user(db)
    video = create_test_video(db, user)

    vote = Vote(user_id=user.id, video_id=video.id)
    db.add(vote)
    db.commit()

    response = client.get(f"/api/videos/{video.id}", headers=auth_header(user))
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == video.id
    assert data["votes"] == 1

# ---------------------- DELETE /api/videos/{video_id} ----------------------

def test_delete_video_not_found(client):
    db = TestingSessionLocal()
    user = create_test_user(db)

    response = client.delete("/api/videos/999", headers=auth_header(user))
    assert response.status_code == 404
    assert response.json()["detail"] == "Video not found"

def test_delete_video_unauthorized(client):
    db = TestingSessionLocal()
    user_a = create_test_user(db)
    video = create_test_video(db, user_a)
    user_b = create_test_user(db)

    response = client.delete(f"/api/videos/{video.id}", headers=auth_header(user_b))
    assert response.status_code == 403
    assert response.json()["detail"] == "You are not authorized"

def test_delete_video_public(client):
    db = TestingSessionLocal()
    user = create_test_user(db)
    video = create_test_video(db, user, VideoStatus.public)

    response = client.delete(f"/api/videos/{video.id}", headers=auth_header(user))
    assert response.status_code == 400
    assert response.json()["detail"] == "Video is public"

def test_delete_video_success(client):
    db = TestingSessionLocal()
    user = create_test_user(db)
    video = create_test_video(db, user)

    response = client.delete(f"/api/videos/{video.id}", headers=auth_header(user))
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "El video ha sido eliminado exitosamente."
    assert data["video_id"] == video.id