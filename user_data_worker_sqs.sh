#!/bin/bash

# User Data para worker con SQS (sin Redis)

sudo apt update -y
sudo apt install -y python3 python3-pip python3-venv git curl unzip ffmpeg

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

# Crear entorno virtual e instalar dependencias
sudo python3 -m venv venv
sudo ./venv/bin/pip install --upgrade pip
sudo ./venv/bin/pip install -r requirements.txt

# Crear servicio systemd para Celery worker con SQS
sudo tee /etc/systemd/system/celery-sqs.service > /dev/null << 'EOF'
[Unit]
Description=Celery Worker with SQS
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/app
Environment=PYTHONPATH=/opt/app
Environment=AWS_DEFAULT_REGION=us-east-1
ExecStart=/opt/app/venv/bin/celery -A src.core.celery_app worker --loglevel=info --queues=video-app-queue --concurrency=2
Restart=always
RestartSec=10
StandardOutput=append:/opt/app/celery-sqs.log
StandardError=append:/opt/app/celery-sqs.log

[Install]
WantedBy=multi-user.target
EOF

# Habilitar e iniciar servicio
sudo systemctl daemon-reload
sudo systemctl enable celery-sqs
sudo systemctl start celery-sqs

# Verificar estado
echo "Celery SQS service status:"
sudo systemctl status celery-sqs --no-pager
