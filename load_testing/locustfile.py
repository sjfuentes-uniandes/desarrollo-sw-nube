"""
Locust Load Testing Script para API de Videos
Escenario 1: Capacidad de la Capa Web (Usuarios Concurrentes)
"""
import os
import random
from locust import HttpUser, task, between, events
from locust.env import Environment
import time

class VideoAPIUser(HttpUser):
    """
    Simula un usuario que interactúa con la API de videos
    """
    # Tiempo de espera entre requests (en segundos)
    wait_time = between(1, 3)
    
    def on_start(self):
        """
        Se ejecuta una vez cuando el usuario virtual inicia
        Realiza login y guarda el token JWT
        """
        # Credenciales de prueba (deberás crear este usuario primero)
        login_data = {
            "email": "test@loadtest.com",
            "password": "TestPassword123"
        }
        
        # Intentar hacer login
        with self.client.post("/api/auth/login", 
                             json=login_data,
                             catch_response=True) as response:
            if response.status_code == 200:
                try:
                    json_response = response.json()
                    self.token = json_response.get("access_token")
                    response.success()
                except Exception as e:
                    response.failure(f"Error parsing login response: {e}")
                    self.token = None
            else:
                response.failure(f"Login failed with status {response.status_code}")
                self.token = None
    
    @task(3)
    def upload_video(self):
        """
        Tarea principal: Subir un video
        Weight: 3 (se ejecuta 3 veces más que otras tareas)
        """
        if not self.token:
            return
        
        headers = {
            "Authorization": f"Bearer {self.token}"
        }
        
        # Simular archivo de video pequeño para la prueba
        # En producción usarías archivos reales
        video_size = random.choice([1024 * 1024 * 5, 1024 * 1024 * 10])  # 5MB o 10MB
        fake_video = b"0" * video_size
        
        files = {
            'video': ('test_video.mp4', fake_video, 'video/mp4')
        }
        
        data = {
            'title': f'Load Test Video {int(time.time())}'
        }
        
        with self.client.post("/api/videos/upload",
                             headers=headers,
                             files=files,
                             data=data,
                             catch_response=True,
                             timeout=30) as response:
            if response.status_code == 200 or response.status_code == 202:
                response.success()
            else:
                response.failure(f"Upload failed: {response.status_code}")
    
    @task(1)
    def list_videos(self):
        """
        Tarea secundaria: Listar videos del usuario
        Weight: 1
        """
        if not self.token:
            return
        
        headers = {
            "Authorization": f"Bearer {self.token}"
        }
        
        with self.client.get("/api/videos",
                            headers=headers,
                            catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"List videos failed: {response.status_code}")
    
    @task(1)
    def get_rankings(self):
        """
        Tarea terciaria: Obtener rankings públicos
        Weight: 1
        """
        with self.client.get("/api/public/rankings",
                            catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Get rankings failed: {response.status_code}")


class VideoUploadOnlyUser(HttpUser):
    """
    Usuario que SOLO sube videos (para pruebas específicas del endpoint upload)
    """
    wait_time = between(1, 2)
    
    def on_start(self):
        """Login y obtención de token"""
        login_data = {
            "email": "test@loadtest.com",
            "password": "TestPassword123"
        }
        
        with self.client.post("/api/auth/login", 
                             data=login_data,
                             catch_response=True) as response:
            if response.status_code == 200:
                try:
                    self.token = response.json().get("access_token")
                    response.success()
                except:
                    self.token = None
            else:
                self.token = None
    
    @task
    def upload_only(self):
        """Solo subir videos - para pruebas enfocadas"""
        if not self.token:
            return
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        # Video simulado de 5MB
        fake_video = b"0" * (1024 * 1024 * 5)
        files = {'video': ('test.mp4', fake_video, 'video/mp4')}
        data = {'title': f'Test {int(time.time())}'}
        
        self.client.post("/api/videos/upload",
                        headers=headers,
                        files=files,
                        data=data,
                        timeout=30)


# Event listeners para métricas personalizadas
@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    """Se ejecuta al inicio de las pruebas"""
    print("\n" + "="*80)
    print("🚀 INICIANDO PRUEBAS DE CARGA")
    print("="*80)
    print(f"Host objetivo: {environment.host}")
    print(f"Usuarios: {environment.parsed_options.num_users if hasattr(environment, 'parsed_options') else 'N/A'}")
    print("="*80 + "\n")


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    """Se ejecuta al finalizar las pruebas"""
    print("\n" + "="*80)
    print("✅ PRUEBAS FINALIZADAS")
    print("="*80)
    stats = environment.stats
    print(f"Total de requests: {stats.total.num_requests}")
    print(f"Total de fallos: {stats.total.num_failures}")
    print(f"Tasa de éxito: {((stats.total.num_requests - stats.total.num_failures) / stats.total.num_requests * 100):.2f}%")
    print(f"RPS promedio: {stats.total.total_rps:.2f}")
    print(f"Tiempo promedio respuesta: {stats.total.avg_response_time:.2f}ms")
    print(f"Percentil 95: {stats.total.get_response_time_percentile(0.95):.2f}ms")
    print("="*80 + "\n")
