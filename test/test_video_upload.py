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

class TestVideoUpload:
    """Pruebas para el endpoint de subida de videos"""
    
    @patch('src.routers.video_router.s3_client.upload_fileobj')
    @patch('src.routers.video_router.process_video_task.delay')
    def test_upload_video_success(self, mock_task, mock_s3_upload, client, auth_headers):
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
    
    @patch('src.routers.video_router.s3_client.upload_fileobj')
    @patch('src.routers.video_router.process_video_task.delay')
    def test_upload_video_invalid_format(self, mock_task, mock_s3_upload, client, auth_headers):
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
    
    @patch('src.routers.video_router.s3_client.upload_fileobj')
    @patch('src.routers.video_router.process_video_task.delay')
    def test_upload_video_too_large(self, mock_task, mock_s3_upload, client, auth_headers):
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
    
    @patch('src.routers.video_router.s3_client.upload_fileobj')
    @patch('src.routers.video_router.process_video_task.delay')
    def test_upload_video_empty_file(self, mock_task, mock_s3_upload, client, auth_headers):
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
    
    @patch('src.routers.video_router.s3_client.upload_fileobj')
    @patch('src.routers.video_router.process_video_task.delay')
    def test_upload_video_missing_title(self, mock_task, mock_s3_upload, client, auth_headers):
        """Test: Falta el campo title"""
        video_file = BytesIO(b"fake video")
        
        response = client.post(
            "/api/videos/upload",
            headers=auth_headers,
            files={"video_file": ("test.mp4", video_file, "video/mp4")}
            # No se envía 'title'
        )
        
        assert response.status_code == 422 
    
    @patch('src.routers.video_router.s3_client.upload_fileobj')
    @patch('src.routers.video_router.process_video_task.delay')
    def test_upload_video_missing_file(self, mock_task, mock_s3_upload, client, auth_headers):
        """Test: Falta el archivo de video"""
        response = client.post(
            "/api/videos/upload",
            headers=auth_headers,
            data={"title": "Test"}
            # No se envía archivo
        )
        
        assert response.status_code == 422
    
    @patch('src.routers.video_router.s3_client.upload_fileobj')
    @patch('src.routers.video_router.process_video_task.delay')
    def test_upload_video_saves_to_database(self, mock_task, mock_s3_upload, client, auth_headers):
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
    
    @patch('src.routers.video_router.s3_client.upload_fileobj')
    @patch('src.routers.video_router.process_video_task.delay')
    def test_upload_video_creates_unique_filename(self, mock_task, mock_s3_upload, client, auth_headers):
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
    
    @patch('src.routers.video_router.s3_client.upload_fileobj')
    @patch('src.routers.video_router.process_video_task.delay')
    def test_upload_video_with_special_chars_in_title(self, mock_task, mock_s3_upload, client, auth_headers):
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
    
    @patch('src.routers.video_router.s3_client.delete_object')
    @patch('src.routers.video_router.s3_client.upload_fileobj', side_effect=Exception("S3 error"))
    @patch('src.routers.video_router.process_video_task.delay')
    def test_upload_video_cleanup_on_error(self, mock_task, mock_s3_upload, mock_s3_delete, client, auth_headers):
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

class TestVideoUploadS3BucketOwnership:
    """Tests para ExpectedBucketOwner en video upload"""
    
    @patch('src.routers.video_router.BUCKET_OWNER', '123456789012')
    @patch('src.routers.video_router.s3_client.upload_fileobj')
    @patch('src.routers.video_router.process_video_task.delay')
    def test_upload_video_with_expected_bucket_owner(self, mock_task, mock_s3_upload, client, auth_headers):
        """Test: Upload incluye ExpectedBucketOwner"""
        mock_task.return_value = Mock(id="task-123")
        
        video_file = BytesIO(b"fake video content")
        
        response = client.post(
            "/api/videos/upload",
            headers=auth_headers,
            files={"video_file": ("test.mp4", video_file, "video/mp4")},
            data={"title": "Test Video"}
        )
        
        assert response.status_code == 201
        
        # Verificar que upload_fileobj fue llamado con ExpectedBucketOwner
        mock_s3_upload.assert_called_once()
        call_args = mock_s3_upload.call_args
        assert 'ExtraArgs' in call_args.kwargs
        assert call_args.kwargs['ExtraArgs']['ExpectedBucketOwner'] == '123456789012'
    
    @patch('src.routers.video_router.BUCKET_OWNER', None)
    @patch('src.routers.video_router.s3_client.upload_fileobj')
    @patch('src.routers.video_router.process_video_task.delay')
    def test_upload_video_without_bucket_owner(self, mock_task, mock_s3_upload, client, auth_headers):
        """Test: Upload sin ExpectedBucketOwner cuando BUCKET_OWNER es None"""
        mock_task.return_value = Mock(id="task-123")
        
        video_file = BytesIO(b"fake video content")
        
        response = client.post(
            "/api/videos/upload",
            headers=auth_headers,
            files={"video_file": ("test.mp4", video_file, "video/mp4")},
            data={"title": "Test Video"}
        )
        
        assert response.status_code == 201
        
        # Verificar que upload_fileobj fue llamado sin ExpectedBucketOwner
        mock_s3_upload.assert_called_once()
        call_args = mock_s3_upload.call_args
        assert 'ExtraArgs' in call_args.kwargs
        assert call_args.kwargs['ExtraArgs'] == {}
    
    @patch('src.routers.video_router.BUCKET_OWNER', '123456789012')
    @patch('src.routers.video_router.s3_client.delete_object')
    @patch('src.routers.video_router.s3_client.upload_fileobj', side_effect=Exception("Upload failed"))
    @patch('src.routers.video_router.process_video_task.delay')
    def test_upload_cleanup_with_expected_bucket_owner(self, mock_task, mock_s3_upload, mock_s3_delete, client, auth_headers):
        """Test: Cleanup incluye ExpectedBucketOwner en caso de error"""
        video_file = BytesIO(b"fake video content")
        
        response = client.post(
            "/api/videos/upload",
            headers=auth_headers,
            files={"video_file": ("test.mp4", video_file, "video/mp4")},
            data={"title": "Test Video"}
        )
        
        assert response.status_code == 500
        
        # Verificar que delete_object fue llamado con ExpectedBucketOwner
        mock_s3_delete.assert_called_once()
        call_args = mock_s3_delete.call_args
        assert 'ExpectedBucketOwner' in call_args.kwargs
        assert call_args.kwargs['ExpectedBucketOwner'] == '123456789012'