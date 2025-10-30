#!/bin/bash

# User Data para capa web en Auto Scaling Group

sudo apt update -y
sudo apt install -y python3 python3-pip python3-venv git curl unzip

# Instalar AWS CLI
sudo curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
sudo unzip awscliv2.zip
sudo ./aws/install
sudo rm -rf aws awscliv2.zip

# Crear usuario
sudo useradd -m -s /bin/bash appuser

# Crear directorio app
sudo mkdir -p /opt/app
cd /opt/app

# Clonar código
sudo git clone https://github.com/sjfuentes-uniandes/desarrollo-sw-nube.git .

# Instalar dependencias
python3 -m pip install -r requirements.txt --break-system-packages

# Cambiar propietario
sudo chown -R appuser:appuser /opt/app

# Instalar dependencias como appuser
sudo -u appuser python3 -m pip install -r requirements.txt --break-system-packages

# Servicio systemd (sin archivo .env, usa AWS Secrets/Parameters)
sudo tee /etc/systemd/system/fastapi-web.service << EOF
[Unit]
Description=FastAPI Web API
After=network.target

[Service]
Type=simple
User=appuser
WorkingDirectory=/opt/app
ExecStart=/usr/bin/python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Iniciar servicio
sudo systemctl daemon-reload
sudo systemctl enable fastapi-web
sudo systemctl start fastapi-web