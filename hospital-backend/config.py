"""
Configuration Module for Smart Hospital Bed and Medical Resource Platform.
Provides environment-specific settings for Flask, SQLAlchemy, SQLite, and CORS.
"""
import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


class Config:
    """Base configuration with sensible defaults."""
    SECRET_KEY = os.environ.get("SECRET_KEY", "smart-hospital-platform-secret-key-2026")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False
    CORS_HEADERS = "Content-Type"


class DevelopmentConfig(Config):
    """Development environment configuration with local SQLite database."""
    DEBUG = True
    TESTING = False
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DEV_DATABASE_URL",
        f"sqlite:///{os.path.join(BASE_DIR, 'hospital_network.db')}"
    )


class TestingConfig(Config):
    """Testing environment configuration with in-memory SQLite database."""
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "TEST_DATABASE_URL",
        "sqlite:///:memory:"
    )
    WTF_CSRF_ENABLED = False


class ProductionConfig(Config):
    """Production environment configuration."""
    DEBUG = False
    TESTING = False
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(BASE_DIR, 'hospital_production.db')}"
    )


# Configuration registry mapping
config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}
