"""Locust script para generar tareas reales vía API y encolar trabajos Celery."""
import os
import time
from io import BytesIO
from typing import Optional

from locust import HttpUser, task, between, events
from locust.exception import StopUser

API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:8000')
LOGIN_EMAIL = os.getenv('API_EMAIL', 'test@loadtest.com')
LOGIN_PASSWORD = os.getenv('API_PASSWORD', 'TestPassword123')
UPLOAD_FILE_PATH = os.getenv('UPLOAD_FILE_PATH', 'uploads/file_example_MP4_480_1_5MG.mp4')
VIDEO_TITLE_PREFIX = os.getenv('VIDEO_TITLE_PREFIX', 'LoadTest Video')
MIN_WAIT = float(os.getenv('LOCUST_MIN_WAIT', '0.05'))
MAX_WAIT = float(os.getenv('LOCUST_MAX_WAIT', '0.2'))


class WorkerApiUser(HttpUser):
    """Usuario Locust que llama la API para crear tareas Celery."""

    host = API_BASE_URL
    wait_time = between(MIN_WAIT, MAX_WAIT)

    def __init__(self, environment):
        super().__init__(environment)
        self.token: Optional[str] = None
        self.video_bytes: Optional[bytes] = None
        self.video_filename: str = os.path.basename(UPLOAD_FILE_PATH)

    def on_start(self) -> None:
        self._load_video()
        self._login()

    def _load_video(self) -> None:
        if not os.path.exists(UPLOAD_FILE_PATH):
            raise StopUser(f"Archivo de prueba no encontrado: {UPLOAD_FILE_PATH}")
        with open(UPLOAD_FILE_PATH, 'rb') as file:
            self.video_bytes = file.read()
        if not self.video_bytes:
            raise StopUser(f"Archivo vacío: {UPLOAD_FILE_PATH}")

    def _login(self) -> None:
        response = self.client.post(
            '/api/auth/login',
            json={'email': LOGIN_EMAIL, 'password': LOGIN_PASSWORD},
            name='Auth/Login',
        )
        if response.status_code != 200:
            raise StopUser(f"Login falló ({response.status_code}): {response.text}")
        self.token = response.json().get('access_token')
        if not self.token:
            raise StopUser('Login respondió sin token JWT')

    def _auth_headers(self):
        if not self.token:
            self._login()
        return {'Authorization': f'Bearer {self.token}'}

    @task
    def upload_video(self) -> None:
        files = {
            'video_file': (self.video_filename, BytesIO(self.video_bytes), 'video/mp4'),
        }
        data = {
            'title': f"{VIDEO_TITLE_PREFIX} {int(time.time())}",
        }
        headers = self._auth_headers()
        with self.client.post(
            '/api/videos/upload',
            headers=headers,
            files=files,
            data=data,
            name='Videos/Upload',
            catch_response=True,
            timeout=180,
        ) as response:
            if response.status_code in (201, 202):
                response.success()
            elif response.status_code == 401:
                # Re-login once
                self._login()
                response.failure('401 - token expirado, reintentando siguiente iteración')
            else:
                response.failure(f"Error {response.status_code}: {response.text[:200]}")


@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    print('\n' + '=' * 80)
    print('🚀 Iniciando prueba de carga Worker vía API (Locust)')
    print('=' * 80)
    print(f"API: {API_BASE_URL}")
    print(f"Archivo: {UPLOAD_FILE_PATH}")
    print('=' * 80 + '\n')


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    stats = environment.stats.total
    success = stats.num_requests - stats.num_failures
    success_rate = (success / stats.num_requests * 100) if stats.num_requests else 0
    print('\n' + '=' * 80)
    print('✅ Prueba finalizada')
    print('=' * 80)
    print(f"Requests: {stats.num_requests}")
    print(f"Fallos: {stats.num_failures}")
    print(f"Éxito: {success_rate:.2f}%")
    print(f"Latencia media: {stats.avg_response_time:.2f} ms")
    print(f"p95: {stats.get_response_time_percentile(0.95):.2f} ms")
    print('=' * 80 + '\n')
