#!/bin/bash
# Kill existing worker
sudo pkill -f "celery.*worker"
sleep 2

# Start worker again
cd /opt/app
sudo bash -c 'cd /opt/app && export PYTHONPATH=/opt/app && nohup ./venv/bin/celery -A src.core.celery_app worker --loglevel=info > /opt/app/celery.log 2>&1 &'

echo "Worker restarted. Check logs: tail -f /opt/app/celery.log"