import os
import boto3
import json

def get_secret(secret_name):
    """Obtener secreto de AWS Secrets Manager"""
    client = boto3.client('secretsmanager', region_name='us-east-1')
    response = client.get_secret_value(SecretId=secret_name)
    return json.loads(response['SecretString'])

def get_parameter(parameter_name):
    """Obtener parámetro de AWS Parameter Store"""
    client = boto3.client('ssm', region_name='us-east-1')
    response = client.get_parameter(Name=parameter_name, WithDecryption=True)
    return response['Parameter']['Value']

# Detectar si es worker basado en hostname
def is_worker_instance():
    import socket
    hostname = socket.gethostname().lower()
    is_worker = 'worker' in hostname
    print(f"DEBUG: hostname={hostname}, is_worker={is_worker}")
    return is_worker

# Cargar configuración
try:
    db_secret = get_secret('app/database-credentials')
    DATABASE_URL = f"postgresql://{db_secret['username']}:{db_secret['password']}@{db_secret['host']}:{db_secret['port']}/{db_secret['dbname']}"
    SECRET_KEY = get_secret('app/jwt-secret')['key']
    
    # Worker usa localhost, Web usa IP del worker
    if is_worker_instance():
        REDIS_URL = "redis://localhost:6379/0"
        print(f"DEBUG: Worker usando Redis local: {REDIS_URL}")
    else:
        REDIS_URL = get_parameter('/app/redis-worker-url')  # IP del worker
        print(f"DEBUG: Web usando Redis remoto: {REDIS_URL}")
    
    S3_BUCKET_NAME = get_parameter('/app/s3-bucket')
    
except Exception:
    # Fallback a variables de entorno para desarrollo local
    DATABASE_URL = os.getenv("DATABASE_URL")
    SECRET_KEY = os.getenv("SECRET_KEY")
    REDIS_URL = os.getenv("REDIS_URL")
    S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")