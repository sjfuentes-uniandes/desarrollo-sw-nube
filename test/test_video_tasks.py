"""
Pruebas unitarias para video_tasks.py
Cubre el procesamiento asíncrono de videos con Celery y FFmpeg
"""
import pytest
from unittest.mock import Mock, patch, MagicMock, call
import os
from datetime import datetime
from src.tasks.video_tasks import process_video_task, DatabaseTask
from src.models.db_models import Video, VideoStatus


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
        # No debe lanzar excepción, debe manejarla
