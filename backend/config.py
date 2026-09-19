"""
Configuration module for the Smart Hospital Bed & Medical Resource Platform.
Supports Development, Testing, and Production environments with SQLite database settings.
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

class Config:
    """Base configuration settings shared across all environments."""
    SECRET_KEY = os.environ.get("SECRET_KEY", "smart-hospital-dev-key-778844")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False
    
    # GeoJSON and spatial settings
    DEFAULT_RADIUS_KM = 25.0
    MAX_RADIUS_KM = 150.0
    EARTH_RADIUS_KM = 6371.0

    # CORS configuration
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*")


class DevelopmentConfig(Config):
    """Development environment using SQLite local database."""
    DEBUG = True
    TESTING = False
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", 
        f"sqlite:///{BASE_DIR / 'hospital_platform.db'}"
    )
    SQLALCHEMY_ECHO = False  # Set to True for verbose SQL logging


class TestingConfig(Config):
    """Testing configuration utilizing in-memory SQLite for rapid, isolated tests."""
    DEBUG = False
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"


class ProductionConfig(Config):
    """Production configuration with stricter defaults."""
    DEBUG = False
    TESTING = False
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", 
        f"sqlite:///{BASE_DIR / 'hospital_platform_prod.db'}"
    )


config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig
}
