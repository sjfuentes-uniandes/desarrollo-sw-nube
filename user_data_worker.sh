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
CONF="/etc/redis/redis.conf"
# Forzar valores
sudo sed -E -i 's/^[[:space:]]*#?[[:space:]]*bind[[:space:]].*/bind 0.0.0.0/' "$CONF"
sudo sed -E -i 's/^[[:space:]]*#?[[:space:]]*protected-mode[[:space:]]+.*/protected-mode no/' "$CONF"

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

# Crear servicio systemd para Celery worker
sudo tee /etc/systemd/system/celery.service > /dev/null << 'EOF'
[Unit]
Description=Celery Worker
After=network-online.target redis.service
Wants=network-online.target
Requires=redis.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/app
Environment=PYTHONPATH=/opt/app
ExecStart=/opt/app/venv/bin/celery -A src.core.celery_app worker --loglevel=info
Restart=always
RestartSec=5
StandardOutput=append:/opt/app/celery.log
StandardError=append:/opt/app/celery.log

[Install]
WantedBy=multi-user.target
EOF

# Habilitar e iniciar servicio
sudo systemctl daemon-reload
sudo systemctl enable celery
sudo systemctl start celery

# Verificar estado
echo "Celery service status:"
sudo systemctl status celery --no-pager
echo "Redis service status:"
sudo systemctl status redis --no-pager