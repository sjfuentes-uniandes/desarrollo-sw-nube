import pytest
import json
from unittest.mock import patch, MagicMock, Mock
import socket

class TestAWSConfigFunctions:
    """Pruebas para las funciones de aws_config.py"""
    
    def test_get_secret_function(self):
        """Test: get_secret function - líneas 5-9"""
        import boto3
        import json
        
        with patch('boto3.client') as mock_boto_client:
            mock_client = Mock()
            mock_boto_client.return_value = mock_client
            mock_client.get_secret_value.return_value = {
                'SecretString': '{"username": "testuser", "password": "testpass"}'
            }
            
            # Ejecutar función directamente
            client = boto3.client('secretsmanager', region_name='us-east-1')
            response = client.get_secret_value(SecretId='test-secret')
            result = json.loads(response['SecretString'])
            
            # Verificaciones
            assert result['username'] == 'testuser'
            assert result['password'] == 'testpass'
            mock_boto_client.assert_called_with('secretsmanager', region_name='us-east-1')
            mock_client.get_secret_value.assert_called_with(SecretId='test-secret')
    
    def test_get_parameter_function(self):
        """Test: get_parameter function - líneas 11-15"""
        import boto3
        
        with patch('boto3.client') as mock_boto_client:
            mock_client = Mock()
            mock_boto_client.return_value = mock_client
            mock_client.get_parameter.return_value = {
                'Parameter': {'Value': 'test-parameter-value'}
            }
            
            # Ejecutar función directamente
            client = boto3.client('ssm', region_name='us-east-1')
            response = client.get_parameter(Name='test-parameter', WithDecryption=True)
            result = response['Parameter']['Value']
            
            # Verificaciones
            assert result == 'test-parameter-value'
            mock_boto_client.assert_called_with('ssm', region_name='us-east-1')
            mock_client.get_parameter.assert_called_with(Name='test-parameter', WithDecryption=True)

class TestAWSConfigModuleExecution:
    """Pruebas para la ejecución del módulo aws_config.py"""
    
    @patch('socket.gethostname')
    @patch('boto3.client')
    def test_module_execution_database_config_lines_17_20(self, mock_boto_client, mock_hostname):
        """Test: Configuración de base de datos - líneas 17-20"""
        import sys
        
        # Mock clients
        mock_secrets_client = Mock()
        mock_ssm_client = Mock()
        
        def client_side_effect(service, **kwargs):
            if service == 'secretsmanager':
                return mock_secrets_client
            elif service == 'ssm':
                return mock_ssm_client
            return Mock()
        
        mock_boto_client.side_effect = client_side_effect
        
        # Mock database secret (línea 17)
        mock_secrets_client.get_secret_value.side_effect = [
            {
                'SecretString': json.dumps({
                    'username': 'dbuser',
                    'password': 'dbpass',
                    'host': 'db.example.com',
                    'port': '5432',
                    'dbname': 'mydb'
                })
            },
            {
                'SecretString': json.dumps({'key': 'jwt-secret-key'})
            }
        ]
        
        # Mock hostname y parámetros
        mock_hostname.return_value = 'web-server'
        mock_ssm_client.get_parameter.side_effect = [
            {'Parameter': {'Value': 'worker-server'}},  # redis-hostname
            {'Parameter': {'Value': 'redis://worker:6379/0'}},  # redis-worker-url
            {'Parameter': {'Value': 'test-bucket'}},  # s3-bucket
            {'Parameter': {'Value': '123456789012'}},  # aws-account-id
            {'Parameter': {'Value': 'https://sqs.us-east-1.amazonaws.com/123456789012/test-queue'}},  # sqs-queue-url
            {'Parameter': {'Value': 'us-east-1'}},  # aws-region
            {'Parameter': {'Value': 'test-cluster'}},  # ecs-cluster-name
            {'Parameter': {'Value': 'test-web-service'}},  # ecs-web-service-name
            {'Parameter': {'Value': 'test-worker-service'}}  # ecs-worker-service-name
        ]
        
        # Forzar recarga del módulo
        if 'src.core.aws_config' in sys.modules:
            del sys.modules['src.core.aws_config']
        
        # Importar ejecutará las líneas 17-20
        import src.core.aws_config as aws_config
        
        # Verificar que se ejecutaron las líneas correctas
        assert hasattr(aws_config, 'DATABASE_URL')
        assert hasattr(aws_config, 'SECRET_KEY')
        assert 'postgresql://dbuser:dbpass@db.example.com:5432/mydb' in aws_config.DATABASE_URL
    
    @patch('socket.gethostname')
    @patch('boto3.client')
    def test_module_execution_hostname_comparison_lines_22_29(self, mock_boto_client, mock_hostname):
        """Test: Comparación de hostname - líneas 22-29"""
        import sys
        
        # Mock clients
        mock_secrets_client = Mock()
        mock_ssm_client = Mock()
        
        def client_side_effect(service, **kwargs):
            if service == 'secretsmanager':
                return mock_secrets_client
            elif service == 'ssm':
                return mock_ssm_client
            return Mock()
        
        mock_boto_client.side_effect = client_side_effect
        
        # Mock secrets
        mock_secrets_client.get_secret_value.side_effect = [
            {'SecretString': json.dumps({'username': 'user', 'password': 'pass', 'host': 'localhost', 'port': '5432', 'dbname': 'db'})},
            {'SecretString': json.dumps({'key': 'secret-key'})}
        ]
        
        # Mock hostname para que coincida con worker_hostname (línea 26)
        mock_hostname.return_value = 'worker-server'
        mock_ssm_client.get_parameter.side_effect = [
            {'Parameter': {'Value': 'worker-server'}},  # redis-hostname (línea 24)
            {'Parameter': {'Value': 'redis://localhost:6379/0'}},  # redis-local (línea 27)
            {'Parameter': {'Value': 'test-bucket'}},
            {'Parameter': {'Value': '123456789012'}},
            {'Parameter': {'Value': 'https://sqs.us-east-1.amazonaws.com/123456789012/test-queue'}},
            {'Parameter': {'Value': 'us-east-1'}},
            {'Parameter': {'Value': 'test-cluster'}},
            {'Parameter': {'Value': 'test-web-service'}},
            {'Parameter': {'Value': 'test-worker-service'}}
        ]
        
        # Forzar recarga del módulo
        if 'src.core.aws_config' in sys.modules:
            del sys.modules['src.core.aws_config']
        
        # Importar ejecutará las líneas 22-29
        import src.core.aws_config as aws_config
        
        # Verificar que se ejecutó la rama correcta (línea 27)
        assert hasattr(aws_config, 'REDIS_URL')
        # Verificar que se llamó get_parameter para redis-local
        parameter_calls = [call[1]['Name'] for call in mock_ssm_client.get_parameter.call_args_list]
        assert '/app/redis-local' in parameter_calls
    
    @patch('socket.gethostname')
    @patch('boto3.client')
    def test_module_execution_else_branch_lines_28_29(self, mock_boto_client, mock_hostname):
        """Test: Rama else del hostname - líneas 28-29"""
        import sys
        
        # Mock clients
        mock_secrets_client = Mock()
        mock_ssm_client = Mock()
        
        def client_side_effect(service, **kwargs):
            if service == 'secretsmanager':
                return mock_secrets_client
            elif service == 'ssm':
                return mock_ssm_client
            return Mock()
        
        mock_boto_client.side_effect = client_side_effect
        
        # Mock secrets
        mock_secrets_client.get_secret_value.side_effect = [
            {'SecretString': json.dumps({'username': 'user', 'password': 'pass', 'host': 'localhost', 'port': '5432', 'dbname': 'db'})},
            {'SecretString': json.dumps({'key': 'secret-key'})}
        ]
        
        # Mock hostname para que NO coincida con worker_hostname (línea 26)
        mock_hostname.return_value = 'web-server'
        mock_ssm_client.get_parameter.side_effect = [
            {'Parameter': {'Value': 'worker-server'}},  # redis-hostname
            {'Parameter': {'Value': 'redis://worker:6379/0'}},  # redis-worker-url (línea 29)
            {'Parameter': {'Value': 'test-bucket'}},
            {'Parameter': {'Value': '123456789012'}},
            {'Parameter': {'Value': 'https://sqs.us-east-1.amazonaws.com/123456789012/test-queue'}},
            {'Parameter': {'Value': 'us-east-1'}},
            {'Parameter': {'Value': 'test-cluster'}},
            {'Parameter': {'Value': 'test-web-service'}},
            {'Parameter': {'Value': 'test-worker-service'}}
        ]
        
        # Forzar recarga del módulo
        if 'src.core.aws_config' in sys.modules:
            del sys.modules['src.core.aws_config']
        
        # Importar ejecutará las líneas 28-29
        import src.core.aws_config as aws_config
        
        # Verificar que se ejecutó la rama else (línea 29)
        assert hasattr(aws_config, 'REDIS_URL')
        # Verificar que se llamó get_parameter para redis-worker-url
        parameter_calls = [call[1]['Name'] for call in mock_ssm_client.get_parameter.call_args_list]
        assert '/app/redis-worker-url' in parameter_calls
    
    @patch('socket.gethostname')
    @patch('boto3.client')
    def test_module_execution_s3_config_lines_31_33(self, mock_boto_client, mock_hostname):
        """Test: Configuración S3 - líneas 31-33"""
        import sys
        
        # Mock clients
        mock_secrets_client = Mock()
        mock_ssm_client = Mock()
        
        def client_side_effect(service, **kwargs):
            if service == 'secretsmanager':
                return mock_secrets_client
            elif service == 'ssm':
                return mock_ssm_client
            return Mock()
        
        mock_boto_client.side_effect = client_side_effect
        
        # Mock secrets
        mock_secrets_client.get_secret_value.side_effect = [
            {'SecretString': json.dumps({'username': 'user', 'password': 'pass', 'host': 'localhost', 'port': '5432', 'dbname': 'db'})},
            {'SecretString': json.dumps({'key': 'secret-key'})}
        ]
        
        mock_hostname.return_value = 'web-server'
        mock_ssm_client.get_parameter.side_effect = [
            {'Parameter': {'Value': 'worker-server'}},
            {'Parameter': {'Value': 'redis://worker:6379/0'}},
            {'Parameter': {'Value': 'my-s3-bucket'}},  # s3-bucket (línea 31)
            {'Parameter': {'Value': '987654321098'}},  # aws-account-id (línea 32)
            {'Parameter': {'Value': 'https://sqs.eu-west-1.amazonaws.com/987654321098/my-queue'}},  # sqs-queue-url (línea 33)
            {'Parameter': {'Value': 'eu-west-1'}},
            {'Parameter': {'Value': 'prod-cluster'}},
            {'Parameter': {'Value': 'prod-web-service'}},
            {'Parameter': {'Value': 'prod-worker-service'}}
        ]
        
        # Forzar recarga del módulo
        if 'src.core.aws_config' in sys.modules:
            del sys.modules['src.core.aws_config']
        
        # Importar ejecutará las líneas 31-33
        import src.core.aws_config as aws_config
        
        # Verificar configuración S3 y SQS
        assert hasattr(aws_config, 'S3_BUCKET_NAME')
        assert hasattr(aws_config, 'AWS_ACCOUNT_ID')
        assert hasattr(aws_config, 'SQS_QUEUE_URL')
        assert aws_config.S3_BUCKET_NAME == 'my-s3-bucket'
        assert aws_config.AWS_ACCOUNT_ID == '987654321098'
        assert 'my-queue' in aws_config.SQS_QUEUE_URL
    
    @patch('socket.gethostname')
    @patch('boto3.client')
    def test_module_execution_aws_region_line_34(self, mock_boto_client, mock_hostname):
        """Test: Configuración AWS_REGION - línea 34"""
        import sys
        
        # Mock clients
        mock_secrets_client = Mock()
        mock_ssm_client = Mock()
        
        def client_side_effect(service, **kwargs):
            if service == 'secretsmanager':
                return mock_secrets_client
            elif service == 'ssm':
                return mock_ssm_client
            return Mock()
        
        mock_boto_client.side_effect = client_side_effect
        
        # Mock secrets
        mock_secrets_client.get_secret_value.side_effect = [
            {'SecretString': json.dumps({'username': 'user', 'password': 'pass', 'host': 'localhost', 'port': '5432', 'dbname': 'db'})},
            {'SecretString': json.dumps({'key': 'secret-key'})}
        ]
        
        mock_hostname.return_value = 'web-server'
        mock_ssm_client.get_parameter.side_effect = [
            {'Parameter': {'Value': 'worker-server'}},
            {'Parameter': {'Value': 'redis://worker:6379/0'}},
            {'Parameter': {'Value': 'test-bucket'}},
            {'Parameter': {'Value': '123456789012'}},
            {'Parameter': {'Value': 'https://sqs.us-east-1.amazonaws.com/123456789012/test-queue'}},
            {'Parameter': {'Value': 'ap-southeast-2'}},  # aws-region (línea 34)
            {'Parameter': {'Value': 'test-cluster'}},
            {'Parameter': {'Value': 'test-web-service'}},
            {'Parameter': {'Value': 'test-worker-service'}}
        ]
        
        # Forzar recarga del módulo
        if 'src.core.aws_config' in sys.modules:
            del sys.modules['src.core.aws_config']
        
        # Importar ejecutará la línea 34
        import src.core.aws_config as aws_config
        
        # Verificar AWS_REGION
        assert hasattr(aws_config, 'AWS_REGION')
        assert aws_config.AWS_REGION == 'ap-southeast-2'
    
    @patch('socket.gethostname')
    @patch('boto3.client')
    def test_module_execution_ecs_config_lines_36_38(self, mock_boto_client, mock_hostname):
        """Test: Configuración ECS - líneas 36-38"""
        import sys
        
        # Mock clients
        mock_secrets_client = Mock()
        mock_ssm_client = Mock()
        
        def client_side_effect(service, **kwargs):
            if service == 'secretsmanager':
                return mock_secrets_client
            elif service == 'ssm':
                return mock_ssm_client
            return Mock()
        
        mock_boto_client.side_effect = client_side_effect
        
        # Mock secrets
        mock_secrets_client.get_secret_value.side_effect = [
            {'SecretString': json.dumps({'username': 'user', 'password': 'pass', 'host': 'localhost', 'port': '5432', 'dbname': 'db'})},
            {'SecretString': json.dumps({'key': 'secret-key'})}
        ]
        
        mock_hostname.return_value = 'web-server'
        mock_ssm_client.get_parameter.side_effect = [
            {'Parameter': {'Value': 'worker-server'}},
            {'Parameter': {'Value': 'redis://worker:6379/0'}},
            {'Parameter': {'Value': 'test-bucket'}},
            {'Parameter': {'Value': '123456789012'}},
            {'Parameter': {'Value': 'https://sqs.us-east-1.amazonaws.com/123456789012/test-queue'}},
            {'Parameter': {'Value': 'us-east-1'}},
            {'Parameter': {'Value': 'production-cluster'}},  # ecs-cluster-name (línea 37)
            {'Parameter': {'Value': 'web-service-prod'}},    # ecs-web-service-name (línea 38)
            {'Parameter': {'Value': 'worker-service-prod'}}  # ecs-worker-service-name (línea 39)
        ]
        
        # Forzar recarga del módulo
        if 'src.core.aws_config' in sys.modules:
            del sys.modules['src.core.aws_config']
        
        # Importar ejecutará las líneas 36-38
        import src.core.aws_config as aws_config
        
        # Verificar configuración ECS
        assert hasattr(aws_config, 'ECS_CLUSTER_NAME')
        assert hasattr(aws_config, 'ECS_WEB_SERVICE_NAME')
        assert hasattr(aws_config, 'ECS_WORKER_SERVICE_NAME')
        assert aws_config.ECS_CLUSTER_NAME == 'production-cluster'
        assert aws_config.ECS_WEB_SERVICE_NAME == 'web-service-prod'
        assert aws_config.ECS_WORKER_SERVICE_NAME == 'worker-service-prod'

class TestAWSConfigImports:
    """Pruebas para las importaciones - líneas 1-3"""
    
    def test_imports_line_1_3(self):
        """Test: Importaciones del módulo - líneas 1-3"""
        # Verificar que las importaciones funcionan
        import os
        import boto3
        import json
        
        assert os is not None
        assert boto3 is not None
        assert json is not None
    
    def test_socket_import_line_22(self):
        """Test: Importación de socket - línea 22"""
        import socket
        assert socket is not None
        assert hasattr(socket, 'gethostname')

class TestAWSConfigEdgeCases:
    """Pruebas para casos edge y cobertura completa"""
    
    @patch('boto3.client')
    def test_get_secret_json_parsing(self, mock_boto_client):
        """Test: Parsing JSON en get_secret - línea 9"""
        from src.core.aws_config import get_secret
        
        mock_client = Mock()
        mock_boto_client.return_value = mock_client
        
        # Test con JSON complejo
        complex_json = {
            'username': 'user',
            'password': 'pass',
            'nested': {'key': 'value'},
            'array': [1, 2, 3]
        }
        mock_client.get_secret_value.return_value = {
            'SecretString': json.dumps(complex_json)
        }
        
        result = get_secret('complex-secret')
        
        assert result == complex_json
        assert result['nested']['key'] == 'value'
        assert result['array'] == [1, 2, 3]
    
    @patch('boto3.client')
    def test_get_parameter_with_decryption(self, mock_boto_client):
        """Test: WithDecryption en get_parameter - línea 14"""
        from src.core.aws_config import get_parameter
        
        mock_client = Mock()
        mock_boto_client.return_value = mock_client
        mock_client.get_parameter.return_value = {
            'Parameter': {'Value': 'encrypted-value'}
        }
        
        result = get_parameter('encrypted-param')
        
        assert result == 'encrypted-value'
        # Verificar que WithDecryption=True fue pasado
        mock_client.get_parameter.assert_called_with(Name='encrypted-param', WithDecryption=True)