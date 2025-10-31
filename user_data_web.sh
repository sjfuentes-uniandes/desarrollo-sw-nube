#!/bin/bash

# User Data para capa web en Auto Scaling Group

sudo apt update -y
sudo apt install -y python3 python3-pip python3-venv git curl unzip

# Instalar AWS CLI
sudo curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
sudo unzip awscliv2.zip
sudo ./aws/install
sudo rm -rf aws awscliv2.zip

# Crear directorio app
sudo rm -rf /opt/app
sudo mkdir -p /opt/app
cd /opt/app

# Clonar código
sudo git clone https://github.com/sjfuentes-uniandes/desarrollo-sw-nube.git .
sudo git checkout alb


# Crear entorno virtual e instalar dependencias
sudo python3 -m venv venv
sudo ./venv/bin/pip install --upgrade pip
sudo ./venv/bin/pip install -r requirements.txt

# Crear tablas de base de datos
sudo bash -c 'cd /opt/app && export PYTHONPATH=/opt/app && ./venv/bin/python -c "try: from src.core.aws_config import DATABASE_URL; print(f\"Using DB: {DATABASE_URL}\"); from src.models import db_models; from sqlalchemy import create_engine; engine = create_engine(DATABASE_URL); db_models.Base.metadata.create_all(bind=engine); print(\"Database tables created\"); except Exception as e: print(f\"DB init error: {e}\"); import traceback; traceback.print_exc()"'

# Iniciar aplicación directamente en background
cd /opt/app
export PYTHONPATH=/opt/app
sudo bash -c 'nohup ./venv/bin/python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 > /opt/app/fastapi.log 2>&1 &'

# Ver logs: tail -f /opt/app/fastapi.log