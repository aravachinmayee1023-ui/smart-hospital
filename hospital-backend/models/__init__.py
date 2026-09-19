"""
Models Package
Exports Hospital and Clinic SQLAlchemy models.
"""
try:
    from database import db
except (ImportError, ModuleNotFoundError):
    from ..database import db

from .hospital import Hospital
from .clinic import Clinic

__all__ = ["db", "Hospital", "Clinic"]
