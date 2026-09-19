"""
Clinic Model Module
Defines the SQLAlchemy model for outpatient clinics and urgent care centers.
"""
from datetime import datetime
from sqlalchemy.orm import validates

try:
    from database import db
except (ImportError, ModuleNotFoundError):
    from ..database import db


class Clinic(db.Model):
    """
    SQLAlchemy model representing an Outpatient or Urgent Care Clinic.
    
    Clinics specialize in ambulatory care, family medicine, diagnostics,
    and urgent treatment with day/observation beds.
    """
    __tablename__ = "clinics"

    # SQLite Database-level check constraints
    __table_args__ = (
        db.CheckConstraint("beds >= 0", name="check_clinic_beds_non_negative"),
        db.CheckConstraint("latitude >= -90.0 AND latitude <= 90.0", name="check_clinic_lat_range"),
        db.CheckConstraint("longitude >= -180.0 AND longitude <= 180.0", name="check_clinic_lng_range"),
    )

    # 1. Primary Identifier
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # 2. Facility Metadata
    name = db.Column(db.String(120), nullable=False, index=True)
    type = db.Column(db.String(50), nullable=False, default="Urgent Care Clinic", index=True)
    address = db.Column(db.String(255), nullable=False)

    # 3. Observation / Day Beds Capacity
    beds = db.Column(db.Integer, nullable=False, default=0)

    # 4. Spatial Coordinates (WGS84 EPSG:4326)
    latitude = db.Column(db.Float, nullable=False, index=True)
    longitude = db.Column(db.Float, nullable=False, index=True)

    # 5. Medical Services & Emergency Status
    specialties = db.Column(
        db.Text,
        nullable=True,
        default="Family Medicine, Urgent Care, Pediatrics, Preventive Diagnostics"
    )
    emergency = db.Column(db.Boolean, nullable=False, default=False)

    # 6. Audit Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # --- Python Model-Level Validators ---

    @validates("name")
    def validate_name(self, key, value):
        if not value or not str(value).strip():
            raise ValueError("Clinic 'name' is required and cannot be empty.")
        return str(value).strip()

    @validates("type")
    def validate_type(self, key, value):
        if not value or not str(value).strip():
            raise ValueError("Clinic 'type' is required and cannot be empty.")
        return str(value).strip()

    @validates("address")
    def validate_address(self, key, value):
        if not value or not str(value).strip():
            raise ValueError("Clinic 'address' is required and cannot be empty.")
        return str(value).strip()

    @validates("beds")
    def validate_beds(self, key, value):
        if value is None:
            raise ValueError("Clinic 'beds' count cannot be null.")
        try:
            val_int = int(value)
        except (ValueError, TypeError):
            raise ValueError(f"Clinic 'beds' must be an integer, got: {value}")
        if val_int < 0:
            raise ValueError(f"Clinic 'beds' cannot be negative. Got: {val_int}")
        return val_int

    @validates("latitude")
    def validate_latitude(self, key, value):
        if value is None:
            raise ValueError("Clinic 'latitude' is required.")
        try:
            lat_float = float(value)
        except (ValueError, TypeError):
            raise ValueError(f"Latitude must be a valid numeric float, got: {value}")
        if not (-90.0 <= lat_float <= 90.0):
            raise ValueError(f"Latitude must be between -90.0 and 90.0. Got: {lat_float}")
        return lat_float

    @validates("longitude")
    def validate_longitude(self, key, value):
        if value is None:
            raise ValueError("Clinic 'longitude' is required.")
        try:
            lng_float = float(value)
        except (ValueError, TypeError):
            raise ValueError(f"Longitude must be a valid numeric float, got: {value}")
        if not (-180.0 <= lng_float <= 180.0):
            raise ValueError(f"Longitude must be between -180.0 and 180.0. Got: {lng_float}")
        return lng_float

    @validates("emergency")
    def validate_emergency(self, key, value):
        if isinstance(value, bool):
            return value
        if value in (1, 0):
            return bool(value)
        if isinstance(value, str):
            val_clean = value.strip().lower()
            if val_clean in ("true", "1", "yes", "t"):
                return True
            if val_clean in ("false", "0", "no", "f"):
                return False
        raise ValueError(f"Emergency must be a boolean (True/False), got: {value}")

    def to_dict(self):
        """Serialize model instance to standard JSON dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "address": self.address,
            "beds": self.beds,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "specialties": [s.strip() for s in self.specialties.split(",")] if self.specialties else [],
            "emergency": self.emergency,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def to_geojson_feature(self):
        """Serialize clinic to an RFC 7946 GeoJSON Feature."""
        return {
            "type": "Feature",
            "id": f"clinic-{self.id}",
            "geometry": {
                "type": "Point",
                "coordinates": [self.longitude, self.latitude]
            },
            "properties": {
                "id": self.id,
                "name": self.name,
                "facility_type": "Clinic",
                "subtype": self.type,
                "address": self.address,
                "beds": self.beds,
                "emergency": self.emergency,
                "specialties": [s.strip() for s in self.specialties.split(",")] if self.specialties else []
            }
        }

    def __repr__(self):
        return (
            f"<Clinic id={self.id} "
            f"name='{self.name}' "
            f"type='{self.type}' "
            f"beds={self.beds} "
            f"emergency={self.emergency}>"
        )
