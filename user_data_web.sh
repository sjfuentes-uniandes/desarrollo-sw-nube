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


# Crear entorno virtual e instalar dependencias
sudo python3 -m venv venv
sudo ./venv/bin/pip install --upgrade pip
sudo ./venv/bin/pip install -r requirements.txt

# Crear tablas de base de datos
sudo bash -c 'cd /opt/app && export PYTHONPATH=/opt/app && ./venv/bin/python -c "try: from src.core.aws_config import DATABASE_URL; print(f\"Using DB: {DATABASE_URL}\"); from src.models import db_models; from sqlalchemy import create_engine; engine = create_engine(DATABASE_URL); db_models.Base.metadata.create_all(bind=engine); print(\"Database tables created\"); except Exception as e: print(f\"DB init error: {e}\"); import traceback; traceback.print_exc()"'

# Crear servicio systemd
sudo tee /etc/systemd/system/fastapi.service > /dev/null << 'EOF'
[Unit]
Description=FastAPI application
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/app
Environment=PYTHONPATH=/opt/app
Environment=AWS_DEFAULT_REGION=us-east-1
ExecStart=/opt/app/venv/bin/python -m uvicorn src.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5
StandardOutput=append:/opt/app/fastapi.log
StandardError=append:/opt/app/fastapi.log

[Install]
WantedBy=multi-user.target
EOF

# Habilitar e iniciar servicio
sudo systemctl daemon-reload
sudo systemctl enable fastapi
sudo systemctl start fastapi

# Verificar estado
echo "FastAPI service status:"
sudo systemctl status fastapi --no-pager

# Ver logs: tail -f /opt/app/fastapi.log