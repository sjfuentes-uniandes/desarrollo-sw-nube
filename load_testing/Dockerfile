FROM locustio/locust:latest

WORKDIR /locust

COPY locustfile.py .

# Instalar dependencias adicionales si es necesario
RUN pip install --no-cache-dir requests

# El contenedor ejecutará locust con los parámetros proporcionados
