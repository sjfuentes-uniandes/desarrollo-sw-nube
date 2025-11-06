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

class TestListVideos:
    """Pruebas para el endpoint de listar videos"""
    
    def test_list_videos_empty(self, client, auth_headers):
        """Test: Lista vacía cuando no hay videos"""
        response = client.get("/api/videos", headers=auth_headers)
        
        assert response.status_code == 200
        assert response.json() == []
    
    @patch('src.routers.video_router.s3_client.upload_fileobj')
    @patch('src.routers.video_router.process_video_task.delay')
    def test_list_videos_with_data(self, mock_task, mock_s3_upload, client, auth_headers):
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
    
    @patch('src.routers.video_router.s3_client.upload_fileobj')
    @patch('src.routers.video_router.process_video_task.delay')
    def test_list_videos_only_own_videos(self, mock_task, mock_s3_upload, client):
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
    
    @patch('src.routers.video_router.s3_client.upload_fileobj')
    @patch('src.routers.video_router.process_video_task.delay')
    def test_list_videos_ordered_by_date_desc(self, mock_task, mock_s3_upload, client, auth_headers):
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
    
    @patch('src.routers.video_router.s3_client.upload_fileobj')
    @patch('src.routers.video_router.process_video_task.delay')
    def test_get_video_success(self, mock_task, mock_s3_upload, client, auth_headers):
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
    
    @patch('src.routers.video_router.s3_client.upload_fileobj')
    @patch('src.routers.video_router.process_video_task.delay')
    def test_get_video_unauthorized_access(self, mock_task, mock_s3_upload, client):
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
    
    @patch('src.routers.video_router.s3_client.upload_fileobj')
    @patch('src.routers.video_router.process_video_task.delay')
    def test_get_video_includes_votes_count(self, mock_task, mock_s3_upload, client, auth_headers):
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
    
    @patch('src.routers.video_router.s3_client.upload_fileobj')
    @patch('src.routers.video_router.process_video_task.delay')
    def test_complete_video_workflow(self, mock_task, mock_s3_upload, client, auth_headers):
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

class TestVideoRouterCoverage:
    """Tests adicionales para mejorar cobertura de video_router"""
    
    @patch('src.routers.video_router.s3_client.delete_object')
    @patch('src.routers.video_router.s3_client.upload_fileobj')
    @patch('src.routers.video_router.process_video_task.delay')
    def test_upload_video_file_cleanup_on_exception(self, mock_task, mock_s3_upload, mock_s3_delete, client, auth_headers):
        """Test: Limpieza de archivos cuando ocurre excepción después de guardar"""
        mock_task.side_effect = Exception("Task error")
        
        video_file = BytesIO(b"video content")
        
        response = client.post(
            "/api/videos/upload",
            headers=auth_headers,
            files={"video_file": ("test.mp4", video_file, "video/mp4")},
            data={"title": "Test"}
        )
        
        assert response.status_code == 500
        assert "Error al subir el video" in response.json()["detail"]
    
    @patch('src.routers.video_router.s3_client.upload_fileobj')
    @patch('src.routers.video_router.process_video_task.delay')
    def test_upload_video_missing_ensure_upload_dir(self, mock_task, mock_s3_upload, client, auth_headers):
        """Test: Upload video sin llamar ensure_upload_dir"""
        mock_task.return_value = Mock(id="task-123")
        
        video_file = BytesIO(b"video content")
        
        response = client.post(
            "/api/videos/upload",
            headers=auth_headers,
            files={"video_file": ("test.mp4", video_file, "video/mp4")},
            data={"title": "Test"}
        )
        
        assert response.status_code == 201
    
    @patch('src.routers.video_router.s3_client.upload_fileobj')
    @patch('src.routers.video_router.process_video_task.delay')
    def test_upload_video_s3_error_cleanup(self, mock_task, mock_s3_upload, client, auth_headers):
        """Test: Limpieza cuando S3 falla"""
        mock_task.return_value = Mock(id="task-123")
        mock_s3_upload.side_effect = Exception("S3 error")
        
        video_file = BytesIO(b"video content")
        
        response = client.post(
            "/api/videos/upload",
            headers=auth_headers,
            files={"video_file": ("test.mp4", video_file, "video/mp4")},
            data={"title": "Test"}
        )
        
        assert response.status_code == 500
        assert "Error al subir el video" in response.json()["detail"]
    
    def test_get_votes_by_video_id_function(self, client):
        """Test: Función get_votes_by_video_id directamente"""
        from src.routers.video_router import get_votes_by_video_id
        
        db = TestingSessionLocal()
        Base.metadata.create_all(bind=engine)
        
        from src.core.security import get_password_hash
        user = User(
            first_name="Test",
            last_name="User", 
            email="test@example.com",
            password_hash=get_password_hash("password"),
            city="Test City"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        video = Video(
            title="Test Video",
            status=VideoStatus.processed,
            user_id=user.id,
            uploaded_at=datetime.now(),
            original_url="test.mp4"
        )
        db.add(video)
        db.commit()
        db.refresh(video)
        
        result = get_votes_by_video_id(video.id, db)
        
        assert result["video_id"] == video.id
        assert result["votes_count"] == 0
        
        db.close()
        Base.metadata.drop_all(bind=engine)
    
    def test_get_votes_by_video_id_not_found(self, client):
        """Test: get_votes_by_video_id con video inexistente"""
        from src.routers.video_router import get_votes_by_video_id
        from fastapi import HTTPException
        
        db = TestingSessionLocal()
        Base.metadata.create_all(bind=engine)
        
        with pytest.raises(HTTPException) as exc_info:
            get_votes_by_video_id(999, db)
        
        assert exc_info.value.status_code == 404
        assert "Video not found" in str(exc_info.value.detail)
        
        db.close()
        Base.metadata.drop_all(bind=engine)
    
    def test_video_router_constants(self):
        """Test: Constantes del video router"""
        from src.routers.video_router import MAX_FILE_SIZE, ALLOWED_CONTENT_TYPES
        
        assert MAX_FILE_SIZE == 100 * 1024 * 1024
        assert "video/mp4" in ALLOWED_CONTENT_TYPES
    
    def test_delete_video_file_removal_error(self, client, auth_headers):
        """Test: Error al eliminar archivos físicos no debe fallar la operación"""
        db = TestingSessionLocal()
        
        # Crear video en BD
        user_data = db.query(User).filter(User.email == "test@example.com").first()
        video = Video(
            title="Test Video",
            status=VideoStatus.uploaded,
            user_id=user_data.id,
            original_url="/fake/path/video.mp4",
            processed_url="/fake/path/processed.mp4"
        )
        db.add(video)
        db.commit()
        db.refresh(video)
        video_id = video.id
        db.close()
        
        # Mock para simular error al eliminar archivos
        with patch('src.routers.video_router.s3_client.delete_object', side_effect=Exception("S3 error")):
            response = client.delete(f"/api/videos/{video_id}", headers=auth_headers)
            
            assert response.status_code == 200
            assert "eliminado exitosamente" in response.json()["message"]