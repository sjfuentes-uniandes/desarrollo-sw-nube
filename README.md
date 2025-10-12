# Desarrollo de Software en la Nube

API de autenticación de usuarios desarrollada con FastAPI, PostgreSQL y Docker.

## Equipo de Trabajo
| Apellidos        | Nombres         | email uniandes                                  |
|------------------|-----------------|--------------------------------------------------|
| Portillo Bucheli | Carlos Andres   | [c.portillo@uniandes.edu.co](mailto:c.portillo@uniandes.edu.co) |
| Fuentes Ríos     | Santiago Javier | [sj.fuentes@uniandes.edu.co](mailto:sj.fuentes@uniandes.edu.co) |
| Lasso Patiño     | Santiago Felipe | [s.lasso@uniandes.edu.co](mailto:s.lasso@uniandes.edu.co)       |
| Paez Tarazona    | Nicolas Samuel  | [n.paez@uniandes.edu.co](mailto:n.paez@uniandes.edu.co)         |


## Documentación Completa

Para instrucciones detalladas de instalación, configuración y uso del proyecto, consulte:

📖 **[Documentación Completa - Entrega 1](docs/Entrega_1/README.md)**

## Inicio Rápido

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd desarrollo-sw-nube

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con sus valores

# 3. Levantar servicios
docker-compose up -d

# 4. Probar API
curl http://localhost/
```

## Estructura del Proyecto

```
├── src/                    # Código fuente de la aplicación
├── test/                   # Pruebas unitarias
├── collections/            # Colección Postman para pruebas
├── docs/Entrega_1/         # Documentación detallada
├── docker-compose.yml      # Configuración de servicios
└── requirements.txt        # Dependencias Python
```

