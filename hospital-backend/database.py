"""
Database Module
Initializes and provides the shared SQLAlchemy instance for the Smart Hospital Platform.
"""
from flask_sqlalchemy import SQLAlchemy

# Instantiate SQLAlchemy instance
db = SQLAlchemy()
