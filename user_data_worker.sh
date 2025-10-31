#!/bin/bash

# User Data para capa worker (Celery)

sudo apt update -y
sudo apt install -y python3 python3-pip python3-venv git curl unzip redis-server

# Instalar AWS CLI
sudo curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
sudo unzip awscliv2.zip
sudo ./aws/install
sudo rm -rf aws awscliv2.zip

# Configurar Redis para conexiones externas
sudo sed -i 's/bind 127.0.0.1 ::1/bind 0.0.0.0/' /etc/redis/redis.conf
sudo sed -i 's/protected-mode yes/protected-mode no/' /etc/redis/redis.conf

# Iniciar Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Clonar código
sudo rm -rf /opt/app
sudo mkdir -p /opt/app
cd /opt/app
sudo git clone https://github.com/sjfuentes-uniandes/desarrollo-sw-nube.git .
sudo git checkout alb

# Instalar dependencias
sudo python3 -m venv venv
sudo ./venv/bin/pip install -r requirements.txt

# Iniciar Celery worker
cd /opt/app
sudo bash -c 'cd /opt/app && export PYTHONPATH=/opt/app && nohup ./venv/bin/celery -A src.core.celery_app worker --loglevel=info > /opt/app/celery.log 2>&1 &'