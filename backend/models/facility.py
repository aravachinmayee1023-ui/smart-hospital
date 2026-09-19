"""
Facility model representing both Hospitals and Clinics in the medical network.
"""
from datetime import datetime
from . import db


class Facility(db.Model):
    __tablename__ = "facilities"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False, index=True)
    facility_type = db.Column(db.String(20), nullable=False, default="HOSPITAL", index=True)  # HOSPITAL or CLINIC
    license_number = db.Column(db.String(60), unique=True, nullable=False)
    
    # Contact & Address
    address = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(80), nullable=False, index=True)
    state = db.Column(db.String(50), nullable=False)
    postal_code = db.Column(db.String(20), nullable=False)
    phone = db.Column(db.String(30), nullable=False)
    email = db.Column(db.String(120), nullable=True)

    # Geospatial Coordinates (WGS84 EPSG:4326)
    latitude = db.Column(db.Float, nullable=False, index=True)
    longitude = db.Column(db.Float, nullable=False, index=True)

    # Operational status
    has_emergency_dept = db.Column(db.Boolean, default=True, nullable=False)
    emergency_status = db.Column(db.String(20), default="NORMAL", nullable=False)  # NORMAL, ELEVATED, CRITICAL, DIVERTING, CLOSED
    operating_hours = db.Column(db.String(100), default="24/7", nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships (Cascades ensure clean deletion)
    beds = db.relationship("BedInventory", back_populates="facility", cascade="all, delete-orphan", lazy="joined")
    resources = db.relationship("MedicalResource", back_populates="facility", cascade="all, delete-orphan", lazy="select")
    audit_logs = db.relationship("BedAuditLog", back_populates="facility", cascade="all, delete-orphan", lazy="dynamic")

    def __repr__(self):
        return f"<Facility id={self.id} name='{self.name}' type='{self.facility_type}'>"

    @property
    def total_beds(self):
        return sum(bed.total_capacity for bed in self.beds)

    @property
    def available_beds(self):
        return sum(bed.available for bed in self.beds)

    @property
    def occupied_beds(self):
        return sum(bed.occupied for bed in self.beds)

    @property
    def icu_available(self):
        icu = next((b for b in self.beds if b.bed_type == "ICU"), None)
        return icu.available if icu else 0

    @property
    def ventilator_available(self):
        vent = next((b for b in self.beds if b.bed_type == "VENTILATOR"), None)
        return vent.available if vent else 0

    def to_dict(self, include_details=True):
        """Serialize model to standard REST JSON dictionary."""
        data = {
            "id": self.id,
            "name": self.name,
            "facility_type": self.facility_type,
            "license_number": self.license_number,
            "address": self.address,
            "city": self.city,
            "state": self.state,
            "postal_code": self.postal_code,
            "phone": self.phone,
            "email": self.email,
            "coordinates": {
                "latitude": self.latitude,
                "longitude": self.longitude
            },
            "has_emergency_dept": self.has_emergency_dept,
            "emergency_status": self.emergency_status,
            "operating_hours": self.operating_hours,
            "is_active": self.is_active,
            "summary": {
                "total_beds": self.total_beds,
                "available_beds": self.available_beds,
                "occupied_beds": self.occupied_beds,
                "icu_available": self.icu_available,
                "ventilator_available": self.ventilator_available,
                "occupancy_rate_percent": round((self.occupied_beds / self.total_beds * 100), 1) if self.total_beds > 0 else 0
            },
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

        if include_details:
            data["beds"] = [bed.to_dict() for bed in self.beds]
            data["resources"] = [res.to_dict() for res in self.resources]

        return data

    def to_geojson_feature(self, distance_km=None):
        """
        Conforms strictly to RFC 7946 GeoJSON Feature specification.
        Geometry coordinate order: [longitude, latitude]
        """
        props = {
            "id": self.id,
            "name": self.name,
            "facility_type": self.facility_type,
            "address": f"{self.address}, {self.city}, {self.state} {self.postal_code}",
            "phone": self.phone,
            "emergency_status": self.emergency_status,
            "has_emergency_dept": self.has_emergency_dept,
            "total_beds": self.total_beds,
            "available_beds": self.available_beds,
            "icu_available": self.icu_available,
            "ventilator_available": self.ventilator_available,
            "occupancy_rate_percent": round((self.occupied_beds / self.total_beds * 100), 1) if self.total_beds > 0 else 0
        }
        if distance_km is not None:
            props["distance_km"] = round(distance_km, 2)

        return {
            "type": "Feature",
            "id": self.id,
            "geometry": {
                "type": "Point",
                "coordinates": [self.longitude, self.latitude]  # [lng, lat] per RFC 7946
            },
            "properties": props
        }
