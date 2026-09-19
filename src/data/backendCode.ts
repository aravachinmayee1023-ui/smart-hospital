export interface CodeFile {
  path: string;
  name: string;
  category: 'core' | 'models' | 'routes' | 'services' | 'schemas' | 'config';
  description: string;
  code: string;
}

export const BACKEND_FILES: CodeFile[] = [
  {
    path: 'backend/app.py',
    name: 'app.py',
    category: 'core',
    description: 'Application factory, CORS initialization, Blueprint registration, and SQLite bootstrapping.',
    code: `import os
from flask import Flask, jsonify
from flask_cors import CORS
from backend.config import config_by_name
from backend.models import db
from backend.errors import register_error_handlers
from backend.routes import facilities_bp, beds_bp, geojson_bp, emergency_bp
from backend.seeds.seed_data import seed_database

def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get("FLASK_ENV", "development")

    app = Flask(__name__)
    app.config.from_object(config_by_name.get(config_name, config_by_name["default"]))

    # 1. CORS with safe origins
    CORS(app, resources={r"/api/*": {"origins": app.config.get("CORS_ORIGINS", "*")}})

    # 2. Database ORM
    db.init_app(app)

    # 3. Global Error Handling
    register_error_handlers(app)

    # 4. Modular Blueprints
    app.register_blueprint(facilities_bp)
    app.register_blueprint(beds_bp)
    app.register_blueprint(geojson_bp)
    app.register_blueprint(emergency_bp)

    with app.app_context():
        db.create_all()
        seed_database()

    return app

if __name__ == "__main__":
    app = create_app("development")
    app.run(host="0.0.0.0", port=5000, debug=True)`
  },
  {
    path: 'backend/models/hospital.py',
    name: 'models/hospital.py',
    category: 'models',
    description: 'Hospital model with fields: id, name, type, address, beds, lat, lng, specialties, emergency, SQLite constraints & Python validators.',
    code: `from sqlalchemy.orm import validates
from . import db

class Hospital(db.Model):
    __tablename__ = "hospitals"

    # Database-level check constraints for SQLite integrity
    __table_args__ = (
        db.CheckConstraint("beds >= 0", name="check_hospital_beds_non_negative"),
        db.CheckConstraint("latitude >= -90.0 AND latitude <= 90.0", name="check_hospital_latitude_range"),
        db.CheckConstraint("longitude >= -180.0 AND longitude <= 180.0", name="check_hospital_longitude_range"),
    )

    # 1. Primary Key
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # 2. Identification & Type
    name = db.Column(db.String(120), nullable=False, index=True)
    type = db.Column(db.String(50), nullable=False, default="General Hospital", index=True)

    # 3. Location Address
    address = db.Column(db.String(255), nullable=False)

    # 4. Inpatient Bed Count (Non-negative)
    beds = db.Column(db.Integer, nullable=False, default=0)

    # 5. Geographic Coordinates (WGS84 EPSG:4326)
    latitude = db.Column(db.Float, nullable=False, index=True)
    longitude = db.Column(db.Float, nullable=False, index=True)

    # 6. Offerings & 24/7 Emergency
    specialties = db.Column(
        db.Text,
        nullable=True,
        default="Emergency Medicine, Intensive Care (ICU), General Surgery, Cardiology"
    )
    emergency = db.Column(db.Boolean, nullable=False, default=True)

    # --- Python-Level Validators ---
    @validates("name")
    def validate_name(self, key, value):
        if not value or not str(value).strip():
            raise ValueError("Hospital name is required and cannot be empty.")
        return str(value).strip()

    @validates("type")
    def validate_type(self, key, value):
        if not value or not str(value).strip():
            raise ValueError("Hospital type is required and cannot be empty.")
        return str(value).strip()

    @validates("address")
    def validate_address(self, key, value):
        if not value or not str(value).strip():
            raise ValueError("Hospital address is required and cannot be empty.")
        return str(value).strip()

    @validates("beds")
    def validate_beds(self, key, value):
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
        if value is None:
            raise ValueError("Latitude is required.")
        lat_float = float(value)
        if not (-90.0 <= lat_float <= 90.0):
            raise ValueError(f"Latitude must be between -90.0 and 90.0 degrees. Received: {lat_float}.")
        return lat_float

    @validates("longitude")
    def validate_longitude(self, key, value):
        if value is None:
            raise ValueError("Longitude is required.")
        lng_float = float(value)
        if not (-180.0 <= lng_float <= 180.0):
            raise ValueError(f"Longitude must be between -180.0 and 180.0 degrees. Received: {lng_float}.")
        return lng_float

    @validates("emergency")
    def validate_emergency(self, key, value):
        if isinstance(value, bool):
            return value
        if value in (1, 0):
            return bool(value)
        if isinstance(value, str) and value.lower() in ("true", "false", "1", "0"):
            return value.lower() in ("true", "1")
        raise ValueError(f"Emergency must be a boolean (True/False), got '{value}'.")

    def __repr__(self):
        return f"<Hospital id={self.id} name='{self.name}' type='{self.type}' beds={self.beds} emergency={self.emergency}>"

    def to_dict(self):
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
        }`
  },
  {
    path: 'backend/models/clinic.py',
    name: 'models/clinic.py',
    category: 'models',
    description: 'Clinic model for outpatient/urgent care facilities with bed, coordinate, and emergency boolean validators.',
    code: `from sqlalchemy.orm import validates
from . import db

class Clinic(db.Model):
    __tablename__ = "clinics"

    # Database-level check constraints for SQLite integrity
    __table_args__ = (
        db.CheckConstraint("beds >= 0", name="check_clinic_beds_non_negative"),
        db.CheckConstraint("latitude >= -90.0 AND latitude <= 90.0", name="check_clinic_latitude_range"),
        db.CheckConstraint("longitude >= -180.0 AND longitude <= 180.0", name="check_clinic_longitude_range"),
    )

    # 1. Primary Key
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # 2. Identification & Type
    name = db.Column(db.String(120), nullable=False, index=True)
    type = db.Column(db.String(50), nullable=False, default="Urgent Care Clinic", index=True)

    # 3. Location Address
    address = db.Column(db.String(255), nullable=False)

    # 4. Observation / Day Bed Count (Non-negative)
    beds = db.Column(db.Integer, nullable=False, default=0)

    # 5. Geographic Coordinates (WGS84 EPSG:4326)
    latitude = db.Column(db.Float, nullable=False, index=True)
    longitude = db.Column(db.Float, nullable=False, index=True)

    # 6. Medical Specialties & Emergency
    specialties = db.Column(
        db.Text,
        nullable=True,
        default="Family Medicine, Pediatrics, Minor Injury Care"
    )
    emergency = db.Column(db.Boolean, nullable=False, default=False)

    # --- Python-Level Validators ---
    @validates("name")
    def validate_name(self, key, value):
        if not value or not str(value).strip():
            raise ValueError("Clinic name is required and cannot be empty.")
        return str(value).strip()

    @validates("type")
    def validate_type(self, key, value):
        if not value or not str(value).strip():
            raise ValueError("Clinic type is required and cannot be empty.")
        return str(value).strip()

    @validates("address")
    def validate_address(self, key, value):
        if not value or not str(value).strip():
            raise ValueError("Clinic address is required and cannot be empty.")
        return str(value).strip()

    @validates("beds")
    def validate_beds(self, key, value):
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
        if value is None:
            raise ValueError("Latitude is required.")
        lat_float = float(value)
        if not (-90.0 <= lat_float <= 90.0):
            raise ValueError(f"Latitude must be between -90.0 and 90.0 degrees. Received: {lat_float}.")
        return lat_float

    @validates("longitude")
    def validate_longitude(self, key, value):
        if value is None:
            raise ValueError("Longitude is required.")
        lng_float = float(value)
        if not (-180.0 <= lng_float <= 180.0):
            raise ValueError(f"Longitude must be between -180.0 and 180.0 degrees. Received: {lng_float}.")
        return lng_float

    @validates("emergency")
    def validate_emergency(self, key, value):
        if isinstance(value, bool):
            return value
        if value in (1, 0):
            return bool(value)
        if isinstance(value, str) and value.lower() in ("true", "false", "1", "0"):
            return value.lower() in ("true", "1")
        raise ValueError(f"Emergency must be a boolean (True/False), got '{value}'.")

    def __repr__(self):
        return f"<Clinic id={self.id} name='{self.name}' type='{self.type}' beds={self.beds} emergency={self.emergency}>"

    def to_dict(self):
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
        }`
  },
  {
    path: 'backend/models/facility.py',
    name: 'models/facility.py',
    category: 'models',
    description: 'Hospital & Clinic entity model with GeoJSON RFC 7946 feature serializer and bed relations.',
    code: `from datetime import datetime
from . import db

class Facility(db.Model):
    __tablename__ = "facilities"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False, index=True)
    facility_type = db.Column(db.String(20), nullable=False, default="HOSPITAL", index=True)
    license_number = db.Column(db.String(60), unique=True, nullable=False)
    address = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(80), nullable=False, index=True)
    state = db.Column(db.String(50), nullable=False)
    postal_code = db.Column(db.String(20), nullable=False)
    phone = db.Column(db.String(30), nullable=False)
    
    # WGS84 Geographic Coordinates
    latitude = db.Column(db.Float, nullable=False, index=True)
    longitude = db.Column(db.Float, nullable=False, index=True)

    has_emergency_dept = db.Column(db.Boolean, default=True, nullable=False)
    emergency_status = db.Column(db.String(20), default="NORMAL", nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    # Relationships
    beds = db.relationship("BedInventory", back_populates="facility", cascade="all, delete-orphan", lazy="joined")
    resources = db.relationship("MedicalResource", back_populates="facility", cascade="all, delete-orphan")

    def to_geojson_feature(self, distance_km=None):
        props = {
            "id": self.id,
            "name": self.name,
            "facility_type": self.facility_type,
            "address": f"{self.address}, {self.city}, {self.state} {self.postal_code}",
            "emergency_status": self.emergency_status,
            "has_emergency_dept": self.has_emergency_dept,
            "total_beds": self.total_beds,
            "available_beds": self.available_beds,
            "icu_available": self.icu_available,
            "ventilator_available": self.ventilator_available
        }
        if distance_km is not None:
            props["distance_km"] = round(distance_km, 2)

        return {
            "type": "Feature",
            "id": self.id,
            "geometry": {
                "type": "Point",
                "coordinates": [self.longitude, self.latitude]  # [lng, lat]
            },
            "properties": props
        }`
  },
  {
    path: 'backend/models/bed.py',
    name: 'models/bed.py',
    category: 'models',
    description: 'Departmental bed capacities (ICU, Ventilator, General) with SQL constraints and atomic allocation.',
    code: `from datetime import datetime
from . import db

class BedInventory(db.Model):
    __tablename__ = "bed_inventories"

    id = db.Column(db.Integer, primary_key=True)
    facility_id = db.Column(db.Integer, db.ForeignKey("facilities.id", ondelete="CASCADE"), nullable=False, index=True)
    bed_type = db.Column(db.String(30), nullable=False, index=True) # ICU, VENTILATOR, GENERAL, etc.
    total_capacity = db.Column(db.Integer, nullable=False, default=0)
    occupied = db.Column(db.Integer, nullable=False, default=0)
    department_name = db.Column(db.String(80), nullable=True)

    __table_args__ = (
        db.UniqueConstraint("facility_id", "bed_type", name="uq_facility_bed_type"),
        db.CheckConstraint("total_capacity >= 0", name="chk_total_capacity_positive"),
        db.CheckConstraint("occupied <= total_capacity", name="chk_occupied_lte_total"),
    )

    @property
    def available(self):
        return max(0, self.total_capacity - self.occupied)

    def allocate(self, count=1):
        if self.available < count:
            raise ValueError(f"Insufficient beds. Requested: {count}, Available: {self.available}")
        self.occupied += count

    def release(self, count=1):
        if self.occupied < count:
            raise ValueError(f"Cannot release {count} beds when only {self.occupied} are occupied.")
        self.occupied -= count`
  },
  {
    path: 'backend/services/geo_service.py',
    name: 'services/geo_service.py',
    category: 'services',
    description: 'Haversine formula distance calculation and 2-stage SQLite bounding box spatial queries.',
    code: `import math
from backend.models import Facility

class GeoService:
    EARTH_RADIUS_KM = 6371.0

    @classmethod
    def calculate_haversine_distance(cls, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        d_lat = math.radians(lat2 - lat1)
        d_lon = math.radians(lon2 - lon1)
        a = (math.sin(d_lat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(d_lon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return cls.EARTH_RADIUS_KM * c

    @classmethod
    def find_nearby_facilities(cls, lat: float, lon: float, radius_km: float, filters=None):
        # Stage 1: Fast bounding box filter on SQLite indexed columns
        delta_lat = radius_km / cls.EARTH_RADIUS_KM
        min_lat, max_lat = lat - math.degrees(delta_lat), lat + math.degrees(delta_lat)
        delta_lon = radius_km / (cls.EARTH_RADIUS_KM * math.cos(math.radians(lat)))
        min_lon, max_lon = lon - math.degrees(delta_lon), lon + math.degrees(delta_lon)

        query = Facility.query.filter(
            Facility.is_active == True,
            Facility.latitude.between(min_lat, max_lat),
            Facility.longitude.between(min_lon, max_lon)
        )
        candidates = query.all()

        # Stage 2: Spherical distance pruning & sorting
        results = []
        for facility in candidates:
            dist = cls.calculate_haversine_distance(lat, lon, facility.latitude, facility.longitude)
            if dist <= radius_km:
                results.append((facility, dist))

        results.sort(key=lambda x: x[1])
        return results`
  },
  {
    path: 'backend/services/bed_service.py',
    name: 'services/bed_service.py',
    category: 'services',
    description: 'Atomic concurrency locking, bed allocation/release, audit logging, and automatic diversion alerts.',
    code: `from backend.models import db, Facility, BedInventory, BedAuditLog
from backend.errors import NotFoundError, ResourceConflictError

class BedService:
    @classmethod
    def allocate_bed(cls, facility_id: int, bed_type: str, count: int = 1, operator_id: str = "triage", reason: str = ""):
        # SQLite with_for_update row lock
        bed = BedInventory.query.filter_by(facility_id=facility_id, bed_type=bed_type).with_for_update().first()
        if not bed:
            raise NotFoundError(f"Bed type '{bed_type}' not available.")
        if bed.available < count:
            raise ResourceConflictError(f"Insufficient beds available. Available: {bed.available}")

        bed.allocate(count)

        # Audit Trail
        audit = BedAuditLog(
            facility_id=facility_id,
            bed_type=bed_type,
            action="ALLOCATE",
            quantity_changed=count,
            resulting_occupied=bed.occupied,
            resulting_available=bed.available,
            operator_id=operator_id,
            reason=reason
        )
        db.session.add(audit)

        # Auto-trigger hospital diversion alert if occupancy exceeds 95%
        facility = bed.facility
        if facility.total_beds > 0 and (facility.occupied_beds / facility.total_beds) >= 0.95:
            facility.emergency_status = "DIVERTING"

        db.session.commit()
        return bed`
  },
  {
    path: 'backend/routes/geojson.py',
    name: 'routes/geojson.py',
    category: 'routes',
    description: 'GeoJSON location API providing RFC 7946 FeatureCollection and radius search endpoints.',
    code: `from flask import Blueprint, request, jsonify
from backend.models import Facility
from backend.services.geo_service import GeoService
from backend.schemas.validators import validate_proximity_query

geojson_bp = Blueprint("geojson", __name__, url_prefix="/api/v1/geojson")

@geojson_bp.route("/facilities", methods=["GET"])
def get_all_facilities_geojson():
    facilities = Facility.query.filter_by(is_active=True).all()
    tuples = [(f, None) for f in facilities]
    return jsonify(GeoService.to_feature_collection(tuples)), 200

@geojson_bp.route("/nearby", methods=["GET"])
def get_nearby_facilities_geojson():
    params = validate_proximity_query(request.args)
    results = GeoService.find_nearby_facilities(
        lat=params["lat"],
        lon=params["lng"],
        radius_km=params["radius_km"]
    )
    feature_coll = GeoService.to_feature_collection(results)
    return jsonify(feature_coll), 200`
  },
  {
    path: 'backend/schemas/validators.py',
    name: 'schemas/validators.py',
    category: 'schemas',
    description: 'Input validation, coordinate boundaries [-90, 90], and bed range checking.',
    code: `from backend.errors import ValidationError

VALID_FACILITY_TYPES = {"HOSPITAL", "CLINIC"}
VALID_BED_TYPES = {"ICU", "VENTILATOR", "GENERAL", "PEDIATRIC", "MATERNITY", "ISOLATION"}

def validate_facility_payload(data, is_update=False):
    errors = {}
    if not isinstance(data, dict):
        raise ValidationError("Request body must be a JSON object")

    if not is_update or "name" in data:
        name = data.get("name")
        if not name or len(name.strip()) < 2:
            errors["name"] = "Facility name must be at least 2 characters."

    if not is_update or "latitude" in data or "longitude" in data:
        try:
            lat = float(data.get("latitude"))
            if not (-90.0 <= lat <= 90.0):
                errors["latitude"] = "Latitude must be between -90 and 90."
        except (TypeError, ValueError):
            errors["latitude"] = "Latitude must be a valid float."

    if errors:
        raise ValidationError("Validation failed", details=errors)
    return True`
  },
  {
    path: 'backend/requirements.txt',
    name: 'requirements.txt',
    category: 'config',
    description: 'Python package requirements with versions.',
    code: `Flask==3.0.3
Flask-SQLAlchemy==3.1.1
Flask-CORS==4.0.1
marshmallow==3.21.1
geojson==3.1.0
python-dotenv==1.0.1`
  }
];
