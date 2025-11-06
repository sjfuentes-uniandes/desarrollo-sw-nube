from datetime import datetime
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import Mock, patch, MagicMock, mock_open
from io import BytesIO
from typing import List, Optional
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

class TestPublicRankings:
    """Pruebas para el endpoint público de rankings"""
    
    def test_rankings_empty_database(self, client):
        """Test: Rankings con base de datos vacía"""
        response = client.get("/api/public/rankings")
        
        assert response.status_code == 200
        assert response.json() == []
    
    def test_rankings_with_users_no_votes(self, client):
        """Test: Rankings con usuarios pero sin votos"""
        # Crear usuarios
        client.post("/api/auth/signup", json={
            "first_name": "Juan",
            "last_name": "Pérez",
            "email": "juan@example.com",
            "city": "Bogotá",
            "country": "Colombia",
            "password1": "testpass123",
            "password2": "testpass123"
        })
        
        client.post("/api/auth/signup", json={
            "first_name": "Ana",
            "last_name": "García",
            "email": "ana@example.com",
            "city": "Medellín",
            "country": "Colombia",
            "password1": "testpass123",
            "password2": "testpass123"
        })
        
        response = client.get("/api/public/rankings")
        
        assert response.status_code == 200
        rankings = response.json()
        assert len(rankings) == 2
        
        # Verificar estructura
        for ranking in rankings:
            assert "position" in ranking
            assert "username" in ranking
            assert "city" in ranking
            assert "votes" in ranking
            assert ranking["votes"] == 0
    
    def test_rankings_with_votes(self, client):
        """Test: Rankings con usuarios y votos"""
        db = TestingSessionLocal()
        
        # Crear usuarios
        user1 = create_test_user(db, "user1@example.com")
        user2 = create_test_user(db, "user2@example.com")
        
        # Crear videos
        video1 = create_test_video(db, user1)
        video2 = create_test_video(db, user2)
        
        # Crear votos (user1 tiene más votos)
        vote1 = Vote(user_id=user1.id, video_id=video1.id)
        vote2 = Vote(user_id=user2.id, video_id=video1.id)
        vote3 = Vote(user_id=user1.id, video_id=video2.id)
        
        db.add_all([vote1, vote2, vote3])
        db.commit()
        db.close()
        
        response = client.get("/api/public/rankings")
        
        assert response.status_code == 200
        rankings = response.json()
        assert len(rankings) == 2
        
        # Verificar orden (más votos primero)
        assert rankings[0]["votes"] >= rankings[1]["votes"]
        assert rankings[0]["position"] == 1
        assert rankings[1]["position"] == 2

class TestPublicVideos:
    """ Pruebas para el endpoint publico de videos """
    def test_list_empty_public_videos(self, client):
        """Test: Escenario sin videos publicos"""

        # Se consulta el endpoint sin tener videos publicos en la db
        response = client.get("/api/public/videos")

        # Verificar que la respuesta sea exitosa sin videos publicos
        assert response.status_code == 200

        # Verificar que la respuesta sea una lista vacia
        public_videos = response.json()
        assert public_videos == []

    def test_list_public_videos(self, client):
        """Test: Escenario con videos publicos y votos de prueba"""
        db = TestingSessionLocal()

        # Crear usuarios
        user1 = create_test_user(db, "superstar@example.com")
        user1.first_name = "Super"
        user1.last_name = "Star"
        user1.city = "Bogotá"
        
        user2 = create_test_user(db, "rising@example.com")
        user2.first_name = "Rising"
        user2.last_name = "Talent"
        user2.city = "Medellín"
        
        user3 = create_test_user(db, "newbie@example.com")
        user3.first_name = "New"
        user3.last_name = "Player"
        user3.city = "Bogotá"
        
        db.commit()
        
        # Crear videos
        video1 = create_test_video(db, user1, status=VideoStatus.public) # Video publico
        video2 = create_test_video(db, user2, status=VideoStatus.public) # Video publico
        video3 = create_test_video(db, user3) # Video en procesamiento

        # Se consulta el endpoint
        response = client.get("/api/public/videos")

        # Verificar que la respuesta sea exitosa
        assert response.status_code == 200

        # Verificar que solo se listan los videos publicos:
        public_videos = response.json()
        response_videos_ids = {i["id"] for i in public_videos}
        assert video1.id in response_videos_ids
        assert video2.id in response_videos_ids

        # Verificar que el video que está en procesamiento no esté en la lista
        assert video3.id not in response_videos_ids

class TestVotes:
    """ Pruebas para el endpoint post de los votos """

    def test_valid_own_video_vote(self, client):
        """Test: Crear un voto con datos validos, voto de un video propio"""
        db = TestingSessionLocal()

        # Crear usuario y video
        user = create_test_user(db, "superstar@example.com")
        video = create_test_video(db, user)

        # Se obtiene el header de autorización
        auth_header_user = auth_header(client, user.email)

        # Se consulta el endpoint con el header de autenticación y el usuario
        response = client.post(
            f"/api/public/videos/{video.id}/vote",
            headers=auth_header_user)
        
        # Verificar que la respuesta sea exitosa
        assert response.status_code == 200

        # Verificar el mensaje de la respuesta
        message = response.json()
        assert message["message"] == "Vote successfully registered"

    def test_invalid_unathorized_vote(self, client):
        """Test: Votar sin token de autorización"""

        db = TestingSessionLocal()

        # Crear usuario y video
        user = create_test_user(db, "superstar@example.com")
        video = create_test_video(db, user)

        # Se consulta el endpoint sin el header de autenticación y el usuario
        response = client.post(
            f"/api/public/videos/{video.id}/vote")
        
        # Verificar que la respuesta NO sea exitosa
        assert response.status_code == 403

    def test_invalid_double_vote(self, client):
        """Test: Crear un voto con datos validos e intentar volver a votar por el mismo video"""
        db = TestingSessionLocal()

        # Crear usuario y video
        user = create_test_user(db, "superstar@example.com")
        video = create_test_video(db, user)

        # Se obtiene el header de autorización
        auth_header_user = auth_header(client, user.email)

        # Se consulta el endpoint con el header de autenticación y el usuario
        response = client.post(
            f"/api/public/videos/{video.id}/vote",
            headers=auth_header_user)
        
        # Verificar que la respuesta sea exitosa
        assert response.status_code == 200

        # Se consulta el endpoint para intentar a volver a votar por el mismo video
        response = client.post(
            f"/api/public/videos/{video.id}/vote",
            headers=auth_header_user)
        
        # Verificar que el endpoint niegue el voto
        assert response.status_code == 400

        # Verificar el mensaje
        message = response.json()
        assert message["detail"] == "You have already voted for this video"

    def test_invalid_vote_none_video(self, client):
        """Test: Crear un voto con datos validos e intentar volver a votar por el mismo video"""
        db = TestingSessionLocal()

        # Crear usuario
        user = create_test_user(db, "superstar@example.com")

        # Se obtiene el header de autorización
        auth_header_user = auth_header(client, user.email)

        # Se consulta el endpoint con el header de autenticación y el usuario para un video inexistente
        response = client.post(
            f"/api/public/videos/999/vote",
            headers=auth_header_user)
        
        # Verificar que la respuesta NO sea exitosa
        assert response.status_code == 404

        # Verificar el mensaje
        message = response.json()
        assert message["detail"] == "Video not found"

class TestPublicRankingsExtended:
    """Pruebas adicionales para rankings públicos"""
    
    def test_rankings_pagination(self, client):
        """Test: Paginación de rankings"""
        # Crear múltiples usuarios
        for i in range(5):
            client.post("/api/auth/signup", json={
                "first_name": f"User{i}",
                "last_name": "Test",
                "email": f"user{i}@example.com",
                "city": "Bogotá",
                "country": "Colombia",
                "password1": "testpass123",
                "password2": "testpass123"
            })
        
        # Primera página (limit=2)
        response1 = client.get("/api/public/rankings?page=1&limit=2")
        assert response1.status_code == 200
        rankings1 = response1.json()
        assert len(rankings1) == 2
        assert rankings1[0]["position"] == 1
        assert rankings1[1]["position"] == 2
    
    def test_rankings_city_filter(self, client):
        """Test: Filtro por ciudad"""
        # Crear usuarios en diferentes ciudades
        client.post("/api/auth/signup", json={
            "first_name": "Juan",
            "last_name": "Bogotano",
            "email": "juan@example.com",
            "city": "Bogotá",
            "country": "Colombia",
            "password1": "testpass123",
            "password2": "testpass123"
        })
        
        response = client.get("/api/public/rankings?city=Bogotá")
        assert response.status_code == 200
        rankings = response.json()
        assert len(rankings) == 1
        assert "Bogotá" in rankings[0]["city"]
    
    def test_rankings_invalid_page_parameter(self, client):
        """Test: Parámetro de página inválido"""
        response = client.get("/api/public/rankings?page=0")
        assert response.status_code == 422  # Validation error
    
    def test_rankings_username_format(self, client):
        """Test: Formato del nombre de usuario"""
        client.post("/api/auth/signup", json={
            "first_name": "María José",
            "last_name": "González López",
            "email": "maria@example.com",
            "city": "Cali",
            "country": "Colombia",
            "password1": "testpass123",
            "password2": "testpass123"
        })
        
        response = client.get("/api/public/rankings")
        assert response.status_code == 200
        rankings = response.json()
        assert len(rankings) == 1
        assert rankings[0]["username"] == "María José González López"

class TestVotesExtended:
    """Pruebas adicionales para votos"""
    
    def test_valid_others_video_vote(self, client):
        """Test: Crear un voto con datos validos, voto de un video ajeno"""
        db = TestingSessionLocal()

        # Crear usuario
        user1 = create_test_user(db, "superstar@example.com")
        user2 = create_test_user(db, "rising@example.com")

        # Crear video
        video = create_test_video(db, user2)

        # Se obtiene el header de autorización del user1
        auth_header_user1 = auth_header(client, user1.email)

        # Se consulta el endpoint con el header de autenticación
        response = client.post(
            f"/api/public/videos/{video.id}/vote",
            headers=auth_header_user1)
        
        # Verificar que la respuesta sea exitosa
        assert response.status_code == 200

        # Verificar el mensaje de la respuesta
        message = response.json()
        assert message["message"] == "Vote successfully registered"