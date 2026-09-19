"""
Hospital Model Module
Defines the SQLAlchemy model for Hospital facilities in the medical network.
"""
from sqlalchemy.orm import validates
from . import db


class Hospital(db.Model):
    """
    SQLAlchemy model representing a Hospital.
    
    Hospitals are inpatient medical institutions offering emergency services,
    intensive care, surgical departments, and higher bed capacities.
    """
    __tablename__ = "hospitals"

    # Database-level check constraints for SQLite integrity
    __table_args__ = (
        db.CheckConstraint("beds >= 0", name="check_hospital_beds_non_negative"),
        db.CheckConstraint("latitude >= -90.0 AND latitude <= 90.0", name="check_hospital_latitude_range"),
        db.CheckConstraint("longitude >= -180.0 AND longitude <= 180.0", name="check_hospital_longitude_range"),
    )

    # 1. Primary Key
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # 2. Identification and Classification
    name = db.Column(db.String(120), nullable=False, index=True)
    type = db.Column(db.String(50), nullable=False, default="General Hospital", index=True)

    # 3. Location and Contact
    address = db.Column(db.String(255), nullable=False)

    # 4. Inpatient Bed Capacity
    beds = db.Column(db.Integer, nullable=False, default=0)

    # 5. Geographic Coordinates (WGS84 EPSG:4326)
    latitude = db.Column(db.Float, nullable=False, index=True)
    longitude = db.Column(db.Float, nullable=False, index=True)

    # 6. Medical Offerings & Emergency Capability
    specialties = db.Column(
        db.Text,
        nullable=True,
        default="Emergency Medicine, Intensive Care (ICU), General Surgery, Cardiology"
    )
    emergency = db.Column(db.Boolean, nullable=False, default=True)

    # --- Python-Level Validators (Triggered on assignment / creation) ---

    @validates("name")
    def validate_name(self, key, value):
        """Validate that the hospital name is provided and non-empty."""
        if not value or not str(value).strip():
            raise ValueError("Hospital name is required and cannot be empty.")
        return str(value).strip()

    @validates("type")
    def validate_type(self, key, value):
        """Validate that the hospital type is provided and non-empty."""
        if not value or not str(value).strip():
            raise ValueError("Hospital type is required and cannot be empty.")
        return str(value).strip()

    @validates("address")
    def validate_address(self, key, value):
        """Validate that the address is provided and non-empty."""
        if not value or not str(value).strip():
            raise ValueError("Hospital address is required and cannot be empty.")
        return str(value).strip()

    @validates("beds")
    def validate_beds(self, key, value):
        """Ensure the number of beds is a non-negative integer."""
        if value is None:
            raise ValueError("Beds field cannot be null.")
        try:
            val_int = int(value)
        except (ValueError, TypeError):
            raise ValueError(f"Beds must be an integer, got '{value}'.")
        
        if val_int < 0:
            raise ValueError(f"Beds count cannot be negative. Received: {val_int}.")
        return val_int

    @validates("latitude")
    def validate_latitude(self, key, value):
        """Validate that latitude is a float between -90.0 and 90.0 degrees."""
        if value is None:
            raise ValueError("Latitude is required.")
        try:
            lat_float = float(value)
        except (ValueError, TypeError):
            raise ValueError(f"Latitude must be a valid decimal number, got '{value}'.")
        
        if not (-90.0 <= lat_float <= 90.0):
            raise ValueError(f"Latitude must be between -90.0 and 90.0 degrees. Received: {lat_float}.")
        return lat_float

    @validates("longitude")
    def validate_longitude(self, key, value):
        """Validate that longitude is a float between -180.0 and 180.0 degrees."""
        if value is None:
            raise ValueError("Longitude is required.")
        try:
            lng_float = float(value)
        except (ValueError, TypeError):
            raise ValueError(f"Longitude must be a valid decimal number, got '{value}'.")
        
        if not (-180.0 <= lng_float <= 180.0):
            raise ValueError(f"Longitude must be between -180.0 and 180.0 degrees. Received: {lng_float}.")
        return lng_float

    @validates("emergency")
    def validate_emergency(self, key, value):
        """Validate that emergency is strictly a boolean value."""
        if isinstance(value, bool):
            return value
        if value in (1, 0):
            return bool(value)
        if isinstance(value, str):
            lowered = value.strip().lower()
            if lowered in ("true", "1", "yes", "t"):
                return True
            if lowered in ("false", "0", "no", "f"):
                return False
        raise ValueError(f"Emergency must be a boolean (True/False), got '{value}' of type {type(value).__name__}.")

    def __repr__(self):
        """User-friendly debug representation."""
        return (
            f"<Hospital id={self.id} "
            f"name='{self.name}' "
            f"type='{self.type}' "
            f"beds={self.beds} "
            f"emergency={self.emergency}>"
        )

    def to_dict(self):
        """Serialize hospital record to a JSON-ready dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "address": self.address,
            "beds": self.beds,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "specialties": [s.strip() for s in self.specialties.split(",")] if self.specialties else [],
            "emergency": self.emergency
        }
