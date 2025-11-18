#!/bin/bash

# User Data para Amazon Linux 2 ECS-optimized
# La AMI ya tiene Docker y ECS Agent preconfigurados

# Configurar ECS Agent para el cluster
echo "ECS_CLUSTER=video-app-cluster" >> /etc/ecs/ecs.config
echo "ECS_ENABLE_LOGGING=true" >> /etc/ecs/ecs.config

# Instalar FFmpeg para procesamiento de videos
yum update -y
amazon-linux-extras install -y epel
yum install -y ffmpeg

# Log para verificar ejecución
echo "User data completed at $(date)" >> /var/log/user-data.log