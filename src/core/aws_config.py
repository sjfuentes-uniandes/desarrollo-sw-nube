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

# Cargar configuración
try:
    db_secret = get_secret('app/database-credentials')
    DATABASE_URL = f"postgresql://{db_secret['username']}:{db_secret['password']}@{db_secret['host']}:{db_secret['port']}/{db_secret['dbname']}"
    SECRET_KEY = get_secret('app/jwt-secret')['key']
    
    # Usar diferentes parámetros según hostname
    import socket
    hostname = socket.gethostname()
    worker_hostname = get_parameter('/app/redis-hostname')
    
    if hostname == worker_hostname:
        REDIS_URL = get_parameter('/app/redis-local')  # localhost para worker
    else:
        REDIS_URL = get_parameter('/app/redis-worker-url')  # IP del worker para web
    
    S3_BUCKET_NAME = get_parameter('/app/s3-bucket')
    AWS_ACCOUNT_ID = get_parameter('/app/aws-account-id')
    SQS_QUEUE_URL = get_parameter('/app/sqs-queue-url')
    AWS_REGION = get_parameter('/app/aws-region')
    
except Exception:
    # Fallback a variables de entorno para desarrollo local
    DATABASE_URL = os.getenv("DATABASE_URL")
    SECRET_KEY = os.getenv("SECRET_KEY")
    REDIS_URL = os.getenv("REDIS_URL")
    S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
    AWS_ACCOUNT_ID = os.getenv("AWS_ACCOUNT_ID")
    SQS_QUEUE_URL = os.getenv("SQS_QUEUE_URL")
    AWS_REGION = os.getenv("AWS_REGION", "us-east-1")