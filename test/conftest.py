import pytest
import os
import sys
from unittest.mock import patch, MagicMock

# Simple mock for aws_config to prevent import errors
mock_aws_config = MagicMock()
mock_aws_config.DATABASE_URL = 'sqlite:///./test.db'
mock_aws_config.SECRET_KEY = 'test-secret-key'
mock_aws_config.REDIS_URL = 'redis://localhost:6379/0'
mock_aws_config.S3_BUCKET_NAME = 'test-bucket'
mock_aws_config.AWS_ACCOUNT_ID = '123456789012'
mock_aws_config.SQS_QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/123456789012/test-queue'
mock_aws_config.AWS_REGION = 'us-east-1'
mock_aws_config.ECS_CLUSTER_NAME = 'test-cluster'
mock_aws_config.ECS_WEB_SERVICE_NAME = 'test-web'
mock_aws_config.ECS_WORKER_SERVICE_NAME = 'test-worker'

sys.modules['src.core.aws_config'] = mock_aws_config

# Set test environment variables
os.environ.update({
    'DATABASE_URL': 'sqlite:///./test.db',
    'SECRET_KEY': 'test-secret-key',
    'REDIS_URL': 'redis://localhost:6379/0',
    'S3_BUCKET_NAME': 'test-bucket',
    'AWS_ACCOUNT_ID': '123456789012',
    'SQS_QUEUE_URL': 'https://sqs.us-east-1.amazonaws.com/123456789012/test-queue',
    'AWS_REGION': 'us-east-1'
})

# Mock boto3 globally to prevent real AWS calls
mock_s3_client = MagicMock()
mock_s3_client.upload_fileobj = MagicMock()
mock_s3_client.delete_object = MagicMock()
patch('boto3.client', return_value=mock_s3_client).start()

# Mock Celery task for video processing - flexible for different tests
mock_task = MagicMock()
mock_task_result = MagicMock()
mock_task_result.id = 'test-task-id-123'  # Default ID
mock_task.delay.return_value = mock_task_result
mock_task.apply_async.return_value = mock_task_result
patch('src.tasks.video_tasks.process_video_task', mock_task).start()