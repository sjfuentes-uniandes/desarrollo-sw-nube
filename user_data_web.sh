#!/bin/bash

# User Data para capa web en Auto Scaling Group

yum update -y
yum install -y python3.11 python3.11-pip git

# Crear usuario
useradd -m appuser

# Crear directorio app
mkdir -p /opt/app
cd /opt/app

# Clonar código
git clone https://github.com/sjfuentes-uniandes/desarrollo-sw-nube.git .

# Instalar dependencias
python3.11 -m pip install -r requirements.txt

# Cambiar propietario
chown -R appuser:appuser /opt/app

# Servicio systemd (sin archivo .env, usa AWS Secrets/Parameters)
cat > /etc/systemd/system/fastapi-web.service << EOF
[Unit]
Description=FastAPI Web API
After=network.target

[Service]
Type=simple
User=appuser
WorkingDirectory=/opt/app
ExecStart=/usr/local/bin/python3.11 -m uvicorn src.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Iniciar servicio
systemctl daemon-reload
systemctl enable fastapi-web
systemctl start fastapi-web