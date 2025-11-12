#!/bin/bash

# Script para purgar cola SQS

# Obtener URL de la cola desde Parameter Store
QUEUE_URL=$(aws ssm get-parameter --name "/app/sqs-queue-url" --query 'Parameter.Value' --output text)

if [ -z "$QUEUE_URL" ]; then
    echo "Error: No se pudo obtener la URL de la cola SQS"
    exit 1
fi

echo "Purgando cola SQS: $QUEUE_URL"

# Purgar la cola
aws sqs purge-queue --queue-url "$QUEUE_URL"

if [ $? -eq 0 ]; then
    echo "Cola SQS purgada exitosamente"
else
    echo "Error al purgar la cola SQS"
    exit 1
fi

# Verificar que la cola está vacía
echo "Verificando estado de la cola..."
ATTRIBUTES=$(aws sqs get-queue-attributes --queue-url "$QUEUE_URL" --attribute-names ApproximateNumberOfMessages)
echo "$ATTRIBUTES"