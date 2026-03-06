"""
Django settings for core project.
"""

from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-cliquevoto-super-secret-key-12345'

# Lê a variável de ambiente, se não existir, assume True (Local)
DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Ferramentas
    'corsheaders',
    # Nosso App Principal
    'votacao',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', 
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# AJUSTE CIRÚRGICO: IP da sua rede adicionado na lista VIP!
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://192.168.18.129:5173",
    "https://cliquevoto-saas.vercel.app",
    "https://cliquevoto.com.br",
    "https://www.cliquevoto.com.br",
]

CSRF_TRUSTED_ORIGINS = [
    "http://192.168.18.129:5173",
    "http://192.168.18.129:8000",
    "https://cliquevoto-saas.vercel.app",
    "https://api.cliquevoto.com.br",
    "https://cliquevoto.com.br",
    "https://www.cliquevoto.com.br",
]
ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# TRUQUE DE ARQUITETURA ATUALIZADO: Separação por Ambiente (DEBUG)
if DEBUG: 
    # Ambiente Local (Seu notebook Samsung): usa o banco local SQLite
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    # Produção (Servidor AWS / Docker): usa o banco oficial PostgreSQL
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'cliquevoto_db',
            'USER': 'admin',
            'PASSWORD': 'password123',
            'HOST': 'db', 
            'PORT': '5432',
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',},
]

LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_TZ = True
STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'