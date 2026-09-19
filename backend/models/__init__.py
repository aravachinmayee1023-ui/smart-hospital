"""
Database and models package.
Initializes the SQLAlchemy instance and exports all database entities.
"""
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .facility import Facility
from .hospital import Hospital
from .clinic import Clinic
from .bed import BedInventory
from .resource import MedicalResource
from .audit import BedAuditLog

__all__ = ["db", "Facility", "Hospital", "Clinic", "BedInventory", "MedicalResource", "BedAuditLog"]
