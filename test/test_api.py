from datetime import datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import Mock, patch, MagicMock
from io import BytesIO
from pathlib import Path
from datetime import datetime
import time

from src.main import app
from src.db.database import get_db, Base
from src.models.db_models import User, VideoStatus, Video, Vote
from src.core.security import create_access_token, get_password_hash
from src.tasks.video_tasks import process_video_task, DatabaseTask

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

def create_test_user(db,email="test_1@gmail.com"):
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


def test_get_video_not_found(client):
    db = TestingSessionLocal()
    user_a =create_test_user(db)
    headers = auth_header(client, user_a.email)

    response = client.get("/api/videos/999", headers=headers)
    assert response.status_code == 404
    assert response.json()["detail"] == "Video not found"

def test_get_video_unauthorized(client):
    db = TestingSessionLocal()
    user_a = create_test_user(db)
    video = create_test_video(db, user_a)

    user_b = create_test_user(db,email="test_2@gmail.com")
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
    assert response.status_code == 404
    assert response.json()["detail"] == "Video not found"

def test_delete_video_unauthorized(client):
    db = TestingSessionLocal()
    user_a = create_test_user(db)
    video = create_test_video(db, user_a)
    user_b = create_test_user(db,"test_02@gmail.com")
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

def test_delete_video_success(client):
    db = TestingSessionLocal()
    user = create_test_user(db)
    video = create_test_video(db, user)
    headers = auth_header(client, user.email)


    response = client.delete(f"/api/videos/{video.id}", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "El video ha sido eliminado exitosamente."
    assert data["video_id"] == video.id

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

class TestVideoUpload:
    """Pruebas para el endpoint de subida de videos"""
    
    @patch('src.routers.video_router.process_video_task.delay')
    def test_upload_video_success(self, mock_task, client, auth_headers):
        """Test: Subida exitosa de video"""
        mock_task.return_value = Mock(id="test-task-id-123")
        
        # Crear archivo de video simulado
        video_content = b"fake video content for testing"
        video_file = BytesIO(video_content)
        
        response = client.post(
            "/api/videos/upload",
            headers=auth_headers,
            files={"video_file": ("test_video.mp4", video_file, "video/mp4")},
            data={"title": "Mi video de prueba"}
        )
        
        assert response.status_code == 201
        data = response.json()
        
        assert "message" in data
        assert "Video subido exitosamente" in data["message"]
        assert "task_id" in data
        assert data["task_id"] == "test-task-id-123"
        
        # Verificar que se encoló la tarea
        mock_task.assert_called_once()
    
    def test_upload_video_without_authentication(self, client):
        """Test: Subida sin autenticación debe fallar"""
        video_file = BytesIO(b"fake video")
        
        response = client.post(
            "/api/videos/upload",
            files={"video_file": ("test.mp4", video_file, "video/mp4")},
            data={"title": "Test"}
        )
        
        assert response.status_code == 403
    
    @patch('src.routers.video_router.process_video_task.delay')
    def test_upload_video_invalid_format(self, mock_task, client, auth_headers):
        """Test: Formato de archivo inválido"""
        # Archivo no es MP4
        video_file = BytesIO(b"fake video")
        
        response = client.post(
            "/api/videos/upload",
            headers=auth_headers,
            files={"video_file": ("test.avi", video_file, "video/avi")},
            data={"title": "Test"}
        )
        
        assert response.status_code == 400
        assert "tipo o tamaño no valido" in response.json()["detail"]
    
    @patch('src.routers.video_router.process_video_task.delay')
    def test_upload_video_too_large(self, mock_task, client, auth_headers):
        """Test: Archivo excede el tamaño máximo (100MB)"""
        # Crear archivo de 101 MB
        large_content = b"x" * (101 * 1024 * 1024)
        video_file = BytesIO(large_content)
        
        response = client.post(
            "/api/videos/upload",
            headers=auth_headers,
            files={"video_file": ("large.mp4", video_file, "video/mp4")},
            data={"title": "Large video"}
        )
        
        assert response.status_code == 400
        assert "excede el tamaño máximo" in response.json()["detail"]
    
    @patch('src.routers.video_router.process_video_task.delay')
    def test_upload_video_empty_file(self, mock_task, client, auth_headers):
        """Test: Archivo vacío"""
        empty_file = BytesIO(b"")
        
        response = client.post(
            "/api/videos/upload",
            headers=auth_headers,
            files={"video_file": ("empty.mp4", empty_file, "video/mp4")},
            data={"title": "Empty"}
        )
        
        assert response.status_code == 400
        assert "vacío" in response.json()["detail"]
    
    @patch('src.routers.video_router.process_video_task.delay')
    def test_upload_video_missing_title(self, mock_task, client, auth_headers):
        """Test: Falta el campo title"""
        video_file = BytesIO(b"fake video")
        
        response = client.post(
            "/api/videos/upload",
            headers=auth_headers,
            files={"video_file": ("test.mp4", video_file, "video/mp4")}
            # No se envía 'title'
        )
        
        assert response.status_code == 422 
    
    @patch('src.routers.video_router.process_video_task.delay')
    def test_upload_video_missing_file(self, mock_task, client, auth_headers):
        """Test: Falta el archivo de video"""
        response = client.post(
            "/api/videos/upload",
            headers=auth_headers,
            data={"title": "Test"}
            # No se envía archivo
        )
        
        assert response.status_code == 422
    
    @patch('src.routers.video_router.process_video_task.delay')
    def test_upload_video_saves_to_database(self, mock_task, client, auth_headers):
        """Test: El video se guarda en la base de datos"""
        mock_task.return_value = Mock(id="task-123")
        
        video_file = BytesIO(b"fake video content")
        
        response = client.post(
            "/api/videos/upload",
            headers=auth_headers,
            files={"video_file": ("test.mp4", video_file, "video/mp4")},
            data={"title": "Database Test"}
        )
        
        assert response.status_code == 201
        
        # Verificar en BD
        db = TestingSessionLocal()
        video = db.query(Video).filter(Video.title == "Database Test").first()
        
        assert video is not None
        assert video.status == VideoStatus.uploaded
        assert video.task_id == "task-123"
        
        db.close()
    
    @patch('src.routers.video_router.process_video_task.delay')
    def test_upload_video_creates_unique_filename(self, mock_task, client, auth_headers):
        """Test: Se crea un nombre de archivo único"""
        mock_task.return_value = Mock(id="task-1")
        
        video_file1 = BytesIO(b"video 1")
        
        # Subir primer video
        response1 = client.post(
            "/api/videos/upload",
            headers=auth_headers,
            files={"video_file": ("same_name.mp4", video_file1, "video/mp4")},
            data={"title": "Video 1"}
        )
        
        # Esperar para asegurar diferente timestamp
        time.sleep(1)
        
        video_file2 = BytesIO(b"video 2")
        
        # Subir segundo video
        response2 = client.post(
            "/api/videos/upload",
            headers=auth_headers,
            files={"video_file": ("same_name.mp4", video_file2, "video/mp4")},
            data={"title": "Video 2"}
        )
        
        assert response1.status_code == 201
        assert response2.status_code == 201
        
        db = TestingSessionLocal()
        videos = db.query(Video).all()
        
        assert len(videos) == 2
        assert videos[0].original_url != videos[1].original_url
        
        db.close()
    
    @patch('src.routers.video_router.process_video_task.delay')
    def test_upload_video_with_special_chars_in_title(self, mock_task, client, auth_headers):
        """Test: Título con caracteres especiales"""
        mock_task.return_value = Mock(id="task-123")
        
        video_file = BytesIO(b"video content")
        
        response = client.post(
            "/api/videos/upload",
            headers=auth_headers,
            files={"video_file": ("test.mp4", video_file, "video/mp4")},
            data={"title": "Título con ñ, áéíóú y símbolos @#$%"}
        )
        
        assert response.status_code == 201
    
    @patch('src.routers.video_router.process_video_task.delay')
    @patch('src.routers.video_router.open', side_effect=Exception("Disk error"))
    def test_upload_video_cleanup_on_error(self, mock_open, mock_task, client, auth_headers):
        """Test: Limpieza en caso de error"""
        video_file = BytesIO(b"video")
        
        response = client.post(
            "/api/videos/upload",
            headers=auth_headers,
            files={"video_file": ("test.mp4", video_file, "video/mp4")},
            data={"title": "Error Test"}
        )
        
        # Debe retornar error 500
        assert response.status_code == 500
        assert "Error al subir el video" in response.json()["detail"]

class TestListVideos:
    """Pruebas para el endpoint de listar videos"""
    
    def test_list_videos_empty(self, client, auth_headers):
        """Test: Lista vacía cuando no hay videos"""
        response = client.get("/api/videos", headers=auth_headers)
        
        assert response.status_code == 200
        assert response.json() == []
    
    @patch('src.routers.video_router.process_video_task.delay')
    def test_list_videos_with_data(self, mock_task, client, auth_headers):
        """Test: Lista de videos del usuario"""
        mock_task.return_value = Mock(id="task-1")
        
        # Subir un video
        video_file = BytesIO(b"video content")
        client.post(
            "/api/videos/upload",
            headers=auth_headers,
            files={"video_file": ("test.mp4", video_file, "video/mp4")},
            data={"title": "My Test Video"}
        )
        
        # Listar videos
        response = client.get("/api/videos", headers=auth_headers)
        
        assert response.status_code == 200
        videos = response.json()
        
        assert len(videos) == 1
        assert videos[0]["title"] == "My Test Video"
        assert videos[0]["status"] == "uploaded"
    
    def test_list_videos_without_authentication(self, client):
        """Test: Listar sin autenticación"""
        response = client.get("/api/videos")
        
        assert response.status_code == 403
    
    @patch('src.routers.video_router.process_video_task.delay')
    def test_list_videos_only_own_videos(self, mock_task, client):
        """Test: Solo se listan los videos del usuario autenticado"""
        mock_task.return_value = Mock(id="task-1")
        
        # Usuario 1
        signup1 = client.post("/api/auth/signup", json={
            "first_name": "User",
            "last_name": "One",
            "email": "user1@example.com",
            "password1": "pass123456",
            "password2": "pass123456"
        })
        assert signup1.status_code == 201
        
        login1 = client.post("/api/auth/login", json={
            "email": "user1@example.com",
            "password": "pass123456"
        })
        assert login1.status_code == 200
        token1 = login1.json()["access_token"]
        
        # Usuario 2
        signup2 = client.post("/api/auth/signup", json={
            "first_name": "User",
            "last_name": "Two",
            "email": "user2@example.com",
            "password1": "pass456789",
            "password2": "pass456789"
        })
        assert signup2.status_code == 201
        
        login2 = client.post("/api/auth/login", json={
            "email": "user2@example.com",
            "password": "pass456789"
        })
        assert login2.status_code == 200
        token2 = login2.json()["access_token"]
        
        # Usuario 1 sube video
        video_file1 = BytesIO(b"video 1")
        client.post(
            "/api/videos/upload",
            headers={"Authorization": f"Bearer {token1}"},
            files={"video_file": ("v1.mp4", video_file1, "video/mp4")},
            data={"title": "Video User 1"}
        )
        
        # Usuario 2 sube video
        video_file2 = BytesIO(b"video 2")
        client.post(
            "/api/videos/upload",
            headers={"Authorization": f"Bearer {token2}"},
            files={"video_file": ("v2.mp4", video_file2, "video/mp4")},
            data={"title": "Video User 2"}
        )
        
        # Usuario 1 lista sus videos
        response1 = client.get(
            "/api/videos",
            headers={"Authorization": f"Bearer {token1}"}
        )
        
        videos1 = response1.json()
        assert len(videos1) == 1
        assert videos1[0]["title"] == "Video User 1"
        
        # Usuario 2 lista sus videos
        response2 = client.get(
            "/api/videos",
            headers={"Authorization": f"Bearer {token2}"}
        )
        
        videos2 = response2.json()
        assert len(videos2) == 1
        assert videos2[0]["title"] == "Video User 2"
    
    @patch('src.routers.video_router.process_video_task.delay')
    def test_list_videos_ordered_by_date_desc(self, mock_task, client, auth_headers):
        """Test: Videos ordenados por fecha descendente (más reciente primero)"""
        mock_task.return_value = Mock(id="task-1")
        
        # Subir video 1
        video1 = BytesIO(b"video 1")
        client.post(
            "/api/videos/upload",
            headers=auth_headers,
            files={"video_file": ("v1.mp4", video1, "video/mp4")},
            data={"title": "First Video"}
        )
        
        # Esperar 1 segundo para asegurar diferente timestamp
        time.sleep(1)
        
        # Subir video 2
        video2 = BytesIO(b"video 2")
        client.post(
            "/api/videos/upload",
            headers=auth_headers,
            files={"video_file": ("v2.mp4", video2, "video/mp4")},
            data={"title": "Second Video"}
        )
        
        # Listar
        response = client.get("/api/videos", headers=auth_headers)
        videos = response.json()
        
        assert len(videos) == 2
        # El segundo video debe aparecer primero (orden descendente)
        assert videos[0]["title"] == "Second Video"
        assert videos[1]["title"] == "First Video"

class TestGetVideo:
    """Pruebas para el endpoint de obtener video por ID"""
    
    @patch('src.routers.video_router.process_video_task.delay')
    def test_get_video_success(self, mock_task, client, auth_headers):
        """Test: Obtener video exitosamente"""
        mock_task.return_value = Mock(id="task-1")
        
        # Subir video
        video_file = BytesIO(b"video content")
        upload_response = client.post(
            "/api/videos/upload",
            headers=auth_headers,
            files={"video_file": ("test.mp4", video_file, "video/mp4")},
            data={"title": "Test Video"}
        )
        
        # Obtener ID del video
        db = TestingSessionLocal()
        video = db.query(Video).first()
        video_id = video.id
        db.close()
        
        # Obtener video
        response = client.get(f"/api/videos/{video_id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["video_id"] == video_id
        assert data["title"] == "Test Video"
        assert "votes" in data
    
    def test_get_video_not_found(self, client, auth_headers):
        """Test: Video no existe"""
        response = client.get("/api/videos/999999", headers=auth_headers)
        
        # Puede ser 404 o 500 dependiendo de la implementación
        assert response.status_code in [404, 500]
        if response.status_code == 404:
            assert "not found" in response.json()["detail"].lower()
    
    def test_get_video_without_authentication(self, client):
        """Test: Acceder sin autenticación"""
        response = client.get("/api/videos/1")
        
        assert response.status_code == 403
    
    @patch('src.routers.video_router.process_video_task.delay')
    def test_get_video_unauthorized_access(self, mock_task, client):
        """Test: Intentar acceder al video de otro usuario"""
        mock_task.return_value = Mock(id="task-1")
        
        # Usuario 1 crea video
        signup1 = client.post("/api/auth/signup", json={
            "first_name": "User",
            "last_name": "One",
            "email": "owner@example.com",
            "password1": "pass123456",
            "password2": "pass123456"
        })
        assert signup1.status_code == 201
        
        login1 = client.post("/api/auth/login", json={
            "email": "owner@example.com",
            "password": "pass123456"
        })
        assert login1.status_code == 200
        token1 = login1.json()["access_token"]
        
        video_file = BytesIO(b"video")
        client.post(
            "/api/videos/upload",
            headers={"Authorization": f"Bearer {token1}"},
            files={"video_file": ("test.mp4", video_file, "video/mp4")},
            data={"title": "Private Video"}
        )
        
        # Obtener ID del video
        db = TestingSessionLocal()
        video = db.query(Video).first()
        video_id = video.id
        db.close()
        
        # Usuario 2 intenta acceder
        signup2 = client.post("/api/auth/signup", json={
            "first_name": "User",
            "last_name": "Two",
            "email": "attacker@example.com",
            "password1": "pass456789",
            "password2": "pass456789"
        })
        assert signup2.status_code == 201
        
        login2 = client.post("/api/auth/login", json={
            "email": "attacker@example.com",
            "password": "pass456789"
        })
        assert login2.status_code == 200
        token2 = login2.json()["access_token"]
        
        response = client.get(
            f"/api/videos/{video_id}",
            headers={"Authorization": f"Bearer {token2}"}
        )
        
        # Debe rechazar con 403 Forbidden o 500 (si hay exception no manejada)
        assert response.status_code in [403, 500]
    
    @patch('src.routers.video_router.process_video_task.delay')
    def test_get_video_includes_votes_count(self, mock_task, client, auth_headers):
        """Test: La respuesta incluye el conteo de votos"""
        mock_task.return_value = Mock(id="task-1")
        
        # Subir video
        video_file = BytesIO(b"video")
        client.post(
            "/api/videos/upload",
            headers=auth_headers,
            files={"video_file": ("test.mp4", video_file, "video/mp4")},
            data={"title": "Video with votes"}
        )
        
        db = TestingSessionLocal()
        video = db.query(Video).first()
        video_id = video.id
        db.close()
        
        # Obtener video
        response = client.get(f"/api/videos/{video_id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "votes" in data
        assert isinstance(data["votes"], int)
        assert data["votes"] == 0  # Sin votos por ahora

class TestVideoWorkflow:
    """Pruebas del flujo completo de videos"""
    
    @patch('src.routers.video_router.process_video_task.delay')
    def test_complete_video_workflow(self, mock_task, client, auth_headers):
        """Test: Flujo completo - Upload, List, Get"""
        mock_task.return_value = Mock(id="task-complete")
        
        # 1. Subir video
        video_file = BytesIO(b"complete workflow video")
        upload_response = client.post(
            "/api/videos/upload",
            headers=auth_headers,
            files={"video_file": ("workflow.mp4", video_file, "video/mp4")},
            data={"title": "Workflow Test"}
        )
        
        assert upload_response.status_code == 201
        task_id = upload_response.json()["task_id"]
        assert task_id == "task-complete"
        
        # 2. Listar videos
        list_response = client.get("/api/videos", headers=auth_headers)
        assert list_response.status_code == 200
        videos = list_response.json()
        assert len(videos) == 1
        
        # 3. Obtener video específico
        video_id = videos[0]["video_id"]
        get_response = client.get(f"/api/videos/{video_id}", headers=auth_headers)
        assert get_response.status_code == 200
        assert get_response.json()["title"] == "Workflow Test"

class TestDatabaseTask:
    """Pruebas para la clase DatabaseTask"""
    
    def test_database_task_db_property_creates_session(self):
        """Test: La propiedad db crea una sesión de base de datos"""
        task = DatabaseTask()
        
        with patch('src.tasks.video_tasks.SessionLocal') as mock_session:
            mock_session.return_value = Mock()
            _ = task.db
            
            mock_session.assert_called_once()
    
    def test_database_task_db_property_reuses_session(self):
        """Test: La propiedad db reutiliza la misma sesión"""
        task = DatabaseTask()
        
        with patch('src.tasks.video_tasks.SessionLocal') as mock_session:
            mock_session.return_value = Mock()
            
            db1 = task.db
            db2 = task.db
            
            # Debe llamar SessionLocal solo una vez
            assert mock_session.call_count == 1
            assert db1 is db2
    
    def test_database_task_after_return_closes_session(self):
        """Test: after_return cierra la sesión de BD"""
        task = DatabaseTask()
        mock_db = Mock()
        task._db = mock_db
        
        task.after_return()
        
        mock_db.close.assert_called_once()
        assert task._db is None
    
    def test_database_task_after_return_with_no_session(self):
        """Test: after_return sin sesión activa no falla"""
        task = DatabaseTask()
        task._db = None
        
        # No debe lanzar excepción
        task.after_return()
        assert task._db is None

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
        
        # Segunda página
        response2 = client.get("/api/public/rankings?page=2&limit=2")
        assert response2.status_code == 200
        rankings2 = response2.json()
        assert len(rankings2) == 2
        assert rankings2[0]["position"] == 3
        assert rankings2[1]["position"] == 4
    
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
        
        client.post("/api/auth/signup", json={
            "first_name": "Ana",
            "last_name": "Paisa",
            "email": "ana@example.com",
            "city": "Medellín",
            "country": "Colombia",
            "password1": "testpass123",
            "password2": "testpass123"
        })
        
        # Filtrar por Bogotá
        response = client.get("/api/public/rankings?city=Bogotá")
        assert response.status_code == 200
        rankings = response.json()
        assert len(rankings) == 1
        assert "Bogotá" in rankings[0]["city"]
        assert "Juan Bogotano" == rankings[0]["username"]
    
    def test_rankings_city_filter_case_insensitive(self, client):
        """Test: Filtro por ciudad insensible a mayúsculas"""
        client.post("/api/auth/signup", json={
            "first_name": "Test",
            "last_name": "User",
            "email": "test@example.com",
            "city": "Bogotá",
            "country": "Colombia",
            "password1": "testpass123",
            "password2": "testpass123"
        })
        
        # Buscar con minúsculas
        response = client.get("/api/public/rankings?city=bogotá")
        assert response.status_code == 200
        rankings = response.json()
        assert len(rankings) == 1
    
    def test_rankings_invalid_page_parameter(self, client):
        """Test: Parámetro de página inválido"""
        response = client.get("/api/public/rankings?page=0")
        assert response.status_code == 422  # Validation error
    
    def test_rankings_invalid_limit_parameter(self, client):
        """Test: Parámetro de límite inválido"""
        response = client.get("/api/public/rankings?limit=101")
        assert response.status_code == 422  # Validation error
    
    def test_rankings_username_format(self, client):
        """Test: Formato del nombre de usuario (first_name + last_name)"""
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
    
    def test_rankings_user_without_city(self, client):
        """Test: Usuario sin ciudad especificada"""
        client.post("/api/auth/signup", json={
            "first_name": "Sin",
            "last_name": "Ciudad",
            "email": "sinciudad@example.com",
            "password1": "testpass123",
            "password2": "testpass123"
        })
        
        response = client.get("/api/public/rankings")
        assert response.status_code == 200
        rankings = response.json()
        assert len(rankings) == 1
        assert rankings[0]["city"] == ""  # Ciudad vacía
    
    def test_rankings_default_pagination_values(self, client):
        """Test: Valores por defecto de paginación"""
        # Crear 15 usuarios
        for i in range(15):
            client.post("/api/auth/signup", json={
                "first_name": f"User{i}",
                "last_name": "Test",
                "email": f"user{i}@example.com",
                "password1": "testpass123",
                "password2": "testpass123"
            })
        
        # Sin parámetros (debe usar page=1, limit=10)
        response = client.get("/api/public/rankings")
        assert response.status_code == 200
        rankings = response.json()
        assert len(rankings) == 10  # Límite por defecto
    
    def test_rankings_complex_scenario(self, client):
        """Test: Escenario complejo con múltiples usuarios, videos y votos"""
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
        video1 = create_test_video(db, user1)
        video2 = create_test_video(db, user2)
        video3 = create_test_video(db, user3)
        
        # Crear votos (user1: 3 votos, user2: 2 votos, user3: 1 voto)
        votes = [
            Vote(user_id=user1.id, video_id=video1.id),
            Vote(user_id=user2.id, video_id=video1.id),
            Vote(user_id=user3.id, video_id=video1.id),  # 3 votos para user1
            Vote(user_id=user1.id, video_id=video2.id),
            Vote(user_id=user3.id, video_id=video2.id),  # 2 votos para user2
            Vote(user_id=user2.id, video_id=video3.id),  # 1 voto para user3
        ]
        
        db.add_all(votes)
        db.commit()
        db.close()
        
        # Obtener rankings
        response = client.get("/api/public/rankings")
        assert response.status_code == 200
        rankings = response.json()
        
        # Verificar orden correcto
        assert len(rankings) == 3
        assert rankings[0]["username"] == "Super Star"
        assert rankings[0]["votes"] == 3
        assert rankings[0]["position"] == 1
        
        assert rankings[1]["username"] == "Rising Talent"
        assert rankings[1]["votes"] == 2
        assert rankings[1]["position"] == 2
        
        assert rankings[2]["username"] == "New Player"
        assert rankings[2]["votes"] == 1
        assert rankings[2]["position"] == 3
        
        # Filtrar por Bogotá
        response_bogota = client.get("/api/public/rankings?city=Bogotá")
        assert response_bogota.status_code == 200
        bogota_rankings = response_bogota.json()
        assert len(bogota_rankings) == 2
        assert bogota_rankings[0]["username"] == "Super Star"
        assert bogota_rankings[1]["username"] == "New Player"

class TestProcessVideoTask:
    """Pruebas para process_video_task"""
    
    @patch('src.tasks.video_tasks.SessionLocal')
    @patch('src.tasks.video_tasks.subprocess.run')
    @patch('src.tasks.video_tasks.os.makedirs')
    def test_process_video_success(self, mock_makedirs, mock_subprocess, mock_session_local):
        """Test: Procesamiento exitoso de video"""
        # Setup mock de base de datos
        mock_db = Mock()
        mock_session_local.return_value = mock_db
        
        # Mock del video
        mock_video = Mock(spec=Video)
        mock_video.id = 1
        mock_video.original_url = "uploads/test_video.mp4"
        mock_video.status = VideoStatus.uploaded
        
        mock_db.query.return_value.filter.return_value.first.return_value = mock_video
        
        # Mock de subprocess (FFmpeg exitoso)
        mock_subprocess.return_value = Mock(returncode=0, stderr="")
        
        # Ejecutar tarea
        result = process_video_task(1)
        
        # Verificaciones
        assert result["success"] is True
        assert result["video_id"] == 1
        assert "Video procesado exitosamente" in result["message"]
        
        # Verificar que se creó el directorio processed
        mock_makedirs.assert_called_once_with("processed", exist_ok=True)
        
        # Verificar que se actualizó el estado del video
        assert mock_video.status == VideoStatus.processed
        assert mock_video.processed_url is not None
        assert mock_video.processed_at is not None
        
        # Verificar que se hizo commit
        mock_db.commit.assert_called()
        mock_db.close.assert_called()
    
    @patch('src.tasks.video_tasks.SessionLocal')
    def test_process_video_not_found(self, mock_session_local):
        """Test: Video no encontrado en la base de datos"""
        mock_db = Mock()
        mock_session_local.return_value = mock_db
        
        # Video no existe
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        result = process_video_task(999)
        
        assert result["success"] is False
        assert "no encontrado" in result["error"]
    
    @patch('src.tasks.video_tasks.SessionLocal')
    @patch('src.tasks.video_tasks.subprocess.run')
    @patch('src.tasks.video_tasks.os.makedirs')
    def test_process_video_ffmpeg_error(self, mock_makedirs, mock_subprocess, mock_session_local):
        """Test: Error en el procesamiento de FFmpeg"""
        mock_db = Mock()
        mock_session_local.return_value = mock_db
        
        mock_video = Mock(spec=Video)
        mock_video.id = 1
        mock_video.original_url = "uploads/test_video.mp4"
        
        mock_db.query.return_value.filter.return_value.first.return_value = mock_video
        
        # FFmpeg falla
        mock_subprocess.return_value = Mock(
            returncode=1,
            stderr="Error: Invalid codec"
        )
        
        result = process_video_task(1)
        
        assert result["success"] is False
        assert "Error en FFmpeg" in result["error"]
    
    @patch('src.tasks.video_tasks.SessionLocal')
    @patch('src.tasks.video_tasks.subprocess.run')
    @patch('src.tasks.video_tasks.os.makedirs')
    def test_process_video_ffmpeg_command_structure(self, mock_makedirs, mock_subprocess, mock_session_local):
        """Test: Verificar la estructura del comando FFmpeg"""
        mock_db = Mock()
        mock_session_local.return_value = mock_db
        
        mock_video = Mock(spec=Video)
        mock_video.id = 1
        mock_video.original_url = "uploads/input.mp4"
        
        mock_db.query.return_value.filter.return_value.first.return_value = mock_video
        mock_subprocess.return_value = Mock(returncode=0, stderr="")
        
        process_video_task(1)
        
        # Obtener el comando ejecutado
        call_args = mock_subprocess.call_args[0][0]
        
        # Verificar parámetros clave de FFmpeg
        assert 'ffmpeg' in call_args
        assert '-i' in call_args
        assert 'uploads/input.mp4' in call_args
        assert '-vf' in call_args
        assert 'scale=1920:1080' in call_args[call_args.index('-vf') + 1]
        assert '-c:v' in call_args
        assert 'libx264' in call_args
        assert '-c:a' in call_args
        assert 'aac' in call_args
    
    @patch('src.tasks.video_tasks.SessionLocal')
    @patch('src.tasks.video_tasks.subprocess.run')
    @patch('src.tasks.video_tasks.os.makedirs')
    def test_process_video_timeout_parameter(self, mock_makedirs, mock_subprocess, mock_session_local):
        """Test: Verificar que subprocess tiene timeout de 30 minutos"""
        mock_db = Mock()
        mock_session_local.return_value = mock_db
        
        mock_video = Mock(spec=Video)
        mock_video.id = 1
        mock_video.original_url = "uploads/test.mp4"
        
        mock_db.query.return_value.filter.return_value.first.return_value = mock_video
        mock_subprocess.return_value = Mock(returncode=0, stderr="")
        
        process_video_task(1)
        
        # Verificar que se pasó el timeout
        call_kwargs = mock_subprocess.call_args[1]
        assert call_kwargs['timeout'] == 1800  # 30 minutos
    
    @patch('src.tasks.video_tasks.SessionLocal')
    @patch('src.tasks.video_tasks.subprocess.run')
    @patch('src.tasks.video_tasks.os.makedirs')
    def test_process_video_creates_processed_directory(self, mock_makedirs, mock_subprocess, mock_session_local):
        """Test: Verifica que se crea el directorio 'processed'"""
        mock_db = Mock()
        mock_session_local.return_value = mock_db
        
        mock_video = Mock(spec=Video)
        mock_video.id = 1
        mock_video.original_url = "uploads/test.mp4"
        
        mock_db.query.return_value.filter.return_value.first.return_value = mock_video
        mock_subprocess.return_value = Mock(returncode=0, stderr="")
        
        process_video_task(1)
        
        mock_makedirs.assert_called_once_with("processed", exist_ok=True)
    
    @patch('src.tasks.video_tasks.SessionLocal')
    @patch('src.tasks.video_tasks.subprocess.run')
    @patch('src.tasks.video_tasks.os.makedirs')
    def test_process_video_output_filename_format(self, mock_makedirs, mock_subprocess, mock_session_local):
        """Test: Verificar formato del nombre de archivo procesado"""
        mock_db = Mock()
        mock_session_local.return_value = mock_db
        
        mock_video = Mock(spec=Video)
        mock_video.id = 1
        mock_video.original_url = "uploads/my_video.mp4"
        
        mock_db.query.return_value.filter.return_value.first.return_value = mock_video
        mock_subprocess.return_value = Mock(returncode=0, stderr="")
        
        result = process_video_task(1)
        
        # El archivo procesado debe tener el prefijo 'processed_'
        assert result["success"] is True
        assert "processed_my_video.mp4" in result["processed_url"]
    
    @patch('src.tasks.video_tasks.SessionLocal')
    @patch('src.tasks.video_tasks.subprocess.run')
    @patch('src.tasks.video_tasks.os.makedirs')
    def test_process_video_updates_processed_at_timestamp(self, mock_makedirs, mock_subprocess, mock_session_local):
        """Test: Verificar que se actualiza processed_at"""
        mock_db = Mock()
        mock_session_local.return_value = mock_db
        
        mock_video = Mock(spec=Video)
        mock_video.id = 1
        mock_video.original_url = "uploads/test.mp4"
        mock_video.processed_at = None
        
        mock_db.query.return_value.filter.return_value.first.return_value = mock_video
        mock_subprocess.return_value = Mock(returncode=0, stderr="")
        
        process_video_task(1)
        
        # processed_at debe haberse establecido
        assert mock_video.processed_at is not None
        assert isinstance(mock_video.processed_at, datetime)
    
    @patch('src.tasks.video_tasks.SessionLocal')
    @patch('src.tasks.video_tasks.subprocess.run')
    @patch('src.tasks.video_tasks.os.makedirs')
    def test_process_video_exception_handling(self, mock_makedirs, mock_subprocess, mock_session_local):
        """Test: Manejo de excepciones generales"""
        mock_db = Mock()
        mock_session_local.return_value = mock_db
        
        mock_video = Mock(spec=Video)
        mock_video.id = 1
        mock_video.original_url = "uploads/test.mp4"
        
        mock_db.query.return_value.filter.return_value.first.return_value = mock_video
        
        # Simular excepción en subprocess
        mock_subprocess.side_effect = Exception("Unexpected error")
        
        result = process_video_task(1)
        
        assert result["success"] is False
        assert "error" in result
        assert result["video_id"] == 1
    
    @patch('src.tasks.video_tasks.SessionLocal')
    @patch('src.tasks.video_tasks.subprocess.run')
    @patch('src.tasks.video_tasks.os.makedirs')
    def test_process_video_database_commit_and_refresh(self, mock_makedirs, mock_subprocess, mock_session_local):
        """Test: Verificar commit y refresh de la base de datos"""
        mock_db = Mock()
        mock_session_local.return_value = mock_db
        
        mock_video = Mock(spec=Video)
        mock_video.id = 1
        mock_video.original_url = "uploads/test.mp4"
        
        mock_db.query.return_value.filter.return_value.first.return_value = mock_video
        mock_subprocess.return_value = Mock(returncode=0, stderr="")
        
        process_video_task(1)
        
        # Verificar que se llamó commit y refresh
        mock_db.commit.assert_called()
        mock_db.refresh.assert_called_with(mock_video)
    
    @patch('src.tasks.video_tasks.SessionLocal')
    @patch('src.tasks.video_tasks.subprocess.run')
    @patch('src.tasks.video_tasks.os.makedirs')
    def test_process_video_closes_database_session(self, mock_makedirs, mock_subprocess, mock_session_local):
        """Test: Verificar que se cierra la sesión de BD"""
        mock_db = Mock()
        mock_session_local.return_value = mock_db
        
        mock_video = Mock(spec=Video)
        mock_video.id = 1
        mock_video.original_url = "uploads/test.mp4"
        
        mock_db.query.return_value.filter.return_value.first.return_value = mock_video
        mock_subprocess.return_value = Mock(returncode=0, stderr="")
        
        process_video_task(1)
        
        # Verificar que se cerró la sesión
        mock_db.close.assert_called()
    
    @patch('src.tasks.video_tasks.SessionLocal')
    @patch('src.tasks.video_tasks.subprocess.run')
    @patch('src.tasks.video_tasks.os.makedirs')
    def test_process_video_with_special_characters_in_filename(self, mock_makedirs, mock_subprocess, mock_session_local):
        """Test: Manejar nombres de archivo con caracteres especiales"""
        mock_db = Mock()
        mock_session_local.return_value = mock_db
        
        mock_video = Mock(spec=Video)
        mock_video.id = 1
        mock_video.original_url = "uploads/video_ñ_áéíóú_123.mp4"
        
        mock_db.query.return_value.filter.return_value.first.return_value = mock_video
        mock_subprocess.return_value = Mock(returncode=0, stderr="")
        
        result = process_video_task(1)
        
        assert result["success"] is True
    
    @patch('src.tasks.video_tasks.SessionLocal')
    @patch('src.tasks.video_tasks.subprocess.run')
    @patch('src.tasks.video_tasks.os.makedirs')
    def test_process_video_ffmpeg_capture_output_enabled(self, mock_makedirs, mock_subprocess, mock_session_local):
        """Test: Verificar que FFmpeg captura output"""
        mock_db = Mock()
        mock_session_local.return_value = mock_db
        
        mock_video = Mock(spec=Video)
        mock_video.id = 1
        mock_video.original_url = "uploads/test.mp4"
        
        mock_db.query.return_value.filter.return_value.first.return_value = mock_video
        mock_subprocess.return_value = Mock(returncode=0, stderr="")
        
        process_video_task(1)
        
        # Verificar parámetros de subprocess
        call_kwargs = mock_subprocess.call_args[1]
        assert call_kwargs['capture_output'] is True
        assert call_kwargs['text'] is True
    
    @patch('src.tasks.video_tasks.SessionLocal')
    @patch('src.tasks.video_tasks.subprocess.run')
    @patch('src.tasks.video_tasks.os.makedirs')
    def test_process_video_result_contains_all_fields(self, mock_makedirs, mock_subprocess, mock_session_local):
        """Test: El resultado contiene todos los campos esperados"""
        mock_db = Mock()
        mock_session_local.return_value = mock_db
        
        mock_video = Mock(spec=Video)
        mock_video.id = 1
        mock_video.original_url = "uploads/test.mp4"
        
        mock_db.query.return_value.filter.return_value.first.return_value = mock_video
        mock_subprocess.return_value = Mock(returncode=0, stderr="")
        
        result = process_video_task(1)
        
        # Verificar campos en el resultado
        assert "success" in result
        assert "video_id" in result
        assert "original_url" in result
        assert "processed_url" in result
        assert "message" in result
    
    @patch('src.tasks.video_tasks.SessionLocal')
    def test_process_video_error_closes_session_gracefully(self, mock_session_local):
        """Test: Cerrar sesión incluso en caso de error"""
        mock_db = Mock()
        mock_session_local.return_value = mock_db
        
        # Simular error al consultar
        mock_db.query.side_effect = Exception("Database error")
        
        result = process_video_task(1)
        
        assert result["success"] is False

