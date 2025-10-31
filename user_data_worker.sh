#!/bin/bash

# User Data para capa worker (Redis + Celery)

sudo apt update -y
sudo apt install -y python3 python3-pip python3-venv git curl unzip redis-server ffmpeg

# Instalar AWS CLI
sudo curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
sudo unzip awscliv2.zip
sudo ./aws/install
sudo rm -rf aws awscliv2.zip

# Configurar Redis para aceptar conexiones externas
sudo sed -i 's/bind 127.0.0.1 ::1/bind 0.0.0.0/' /etc/redis/redis.conf
sudo sed -i 's/protected-mode yes/protected-mode no/' /etc/redis/redis.conf

# Reiniciar Redis
sudo systemctl restart redis
sudo systemctl enable redis

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

# Iniciar Celery worker en background
cd /opt/app
export PYTHONPATH=/opt/app
sudo bash -c 'nohup ./venv/bin/python -m celery -A src.core.celery_app worker --loglevel=info > /opt/app/celery.log 2>&1 &'

# Ver logs: tail -f /opt/app/celery.log