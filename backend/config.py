import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'luna-super-secret-jwt-key-2026')
    JWT_SECRET = os.environ.get('JWT_SECRET', 'luna-jwt-access-token-secret-9988')
    JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

    # MySQL connection string format: mysql+pymysql://<user>:<password>@<host>:<port>/<database>
    MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', 'root')
    MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
    MYSQL_PORT = os.environ.get('MYSQL_PORT', '3306')
    MYSQL_DB = os.environ.get('MYSQL_DB', 'luna_ecommerce')

    # Allow custom URI, fallback to MySQL or local SQLite for zero-friction setup
    CUSTOM_DB_URI = os.environ.get('DATABASE_URL')
    if CUSTOM_DB_URI:
        SQLALCHEMY_DATABASE_URI = CUSTOM_DB_URI
    else:
        # Default connection attempt to MySQL with auto fallback to sqlite if configured
        USE_SQLITE = os.environ.get('USE_SQLITE', 'false').lower() == 'true'
        if USE_SQLITE:
            SQLALCHEMY_DATABASE_URI = 'sqlite:///luna.db'
        else:
            SQLALCHEMY_DATABASE_URI = (
                f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"
            )

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_recycle': 280,
        'pool_pre_ping': True,
    }
