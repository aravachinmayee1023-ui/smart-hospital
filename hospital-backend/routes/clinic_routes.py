"""
Clinic Routes Blueprint
Provides RESTful CRUD operations, filtering, spatial search, and GeoJSON endpoints for Clinics.
"""
from flask import Blueprint, request, jsonify

try:
    from database import db
    from models.clinic import Clinic
    from services.geojson_service import GeoJSONService
    from services.search_service import SearchService
except (ImportError, ModuleNotFoundError):
    from ..database import db
    from ..models.clinic import Clinic
    from ..services.geojson_service import GeoJSONService
    from ..services.search_service import SearchService

clinic_bp = Blueprint("clinic_bp", __name__, url_prefix="/api/clinics")


@clinic_bp.route("", methods=["GET"])
def get_clinics():
    """
    List all clinics with query filtering, geospatial radius, and format options.
    Query Params:
      q: str (search query)
      min_beds: int
      max_beds: int
      emergency: bool ('true'/'false')
      lat, lng: float (origin for distance calculations)
      radius_km: float
      sort_by: 'name' | 'beds' | 'distance'
      order: 'asc' | 'desc'
      format: 'json' | 'geojson'
    """
    q = request.args.get("q", type=str)
    min_beds = request.args.get("min_beds", type=int)
    max_beds = request.args.get("max_beds", type=int)
    emergency_str = request.args.get("emergency", type=str)
    emergency_only = (emergency_str.lower() in ("true", "1", "yes")) if emergency_str else None

    near_lat = request.args.get("lat", type=float)
    near_lng = request.args.get("lng", type=float)
    radius_km = request.args.get("radius_km", type=float)
    sort_by = request.args.get("sort_by", default="name", type=str)
    order = request.args.get("order", default="asc", type=str)
    fmt = request.args.get("format", default="json", type=str).lower()

    if fmt == "geojson":
        clinics = Clinic.query.all()
        return jsonify(GeoJSONService.to_feature_collection(clinics, facility_type="Clinic")), 200

    results = SearchService.filter_facilities(
        model_class=Clinic,
        query_text=q,
        min_beds=min_beds,
        max_beds=max_beds,
        emergency_only=emergency_only,
        near_lat=near_lat,
        near_lng=near_lng,
        radius_km=radius_km,
        sort_by=sort_by,
        order=order
    )

    return jsonify({
        "status": "success",
        "count": len(results),
        "data": results
    }), 200


@clinic_bp.route("/geojson", methods=["GET"])
def get_clinics_geojson():
    """Retrieve all clinics serialized as an RFC 7946 GeoJSON FeatureCollection."""
    clinics = Clinic.query.all()
    return jsonify(GeoJSONService.to_feature_collection(clinics, facility_type="Clinic")), 200


@clinic_bp.route("/<int:clinic_id>", methods=["GET"])
def get_clinic_by_id(clinic_id: int):
    """Retrieve single clinic details by ID."""
    clinic = Clinic.query.get_or_404(
        clinic_id,
        description=f"Clinic with ID {clinic_id} not found."
    )
    return jsonify({
        "status": "success",
        "data": clinic.to_dict()
    }), 200


@clinic_bp.route("", methods=["POST"])
def create_clinic():
    """Create a new Clinic facility."""
    data = request.get_json()
    if not data:
        return jsonify({
            "error": "Bad Request",
            "message": "Request payload must be valid JSON."
        }), 400

    required_fields = ["name", "address", "latitude", "longitude"]
    missing = [f for f in required_fields if f not in data or data[f] is None]
    if missing:
        return jsonify({
            "error": "Validation Error",
            "message": f"Missing required fields: {', '.join(missing)}"
        }), 422

    try:
        clinic = Clinic(
            name=data["name"],
            type=data.get("type", "Urgent Care Clinic"),
            address=data["address"],
            beds=data.get("beds", 0),
            latitude=data["latitude"],
            longitude=data["longitude"],
            specialties=data.get("specialties", "Family Medicine, Urgent Care, Minor Trauma"),
            emergency=data.get("emergency", False)
        )
        db.session.add(clinic)
        db.session.commit()
    except ValueError as e:
        db.session.rollback()
        return jsonify({
            "error": "Validation Error",
            "message": str(e)
        }), 422
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Failed to persist clinic: {str(e)}"
        }), 500

    return jsonify({
        "status": "created",
        "message": f"Clinic '{clinic.name}' created successfully.",
        "data": clinic.to_dict()
    }), 201


@clinic_bp.route("/<int:clinic_id>", methods=["PUT"])
def update_clinic(clinic_id: int):
    """Update an existing Clinic facility."""
    clinic = Clinic.query.get_or_404(
        clinic_id,
        description=f"Clinic with ID {clinic_id} not found."
    )
    data = request.get_json()
    if not data:
        return jsonify({
            "error": "Bad Request",
            "message": "Request body must contain JSON."
        }), 400

    try:
        if "name" in data:
            clinic.name = data["name"]
        if "type" in data:
            clinic.type = data["type"]
        if "address" in data:
            clinic.address = data["address"]
        if "beds" in data:
            clinic.beds = data["beds"]
        if "latitude" in data:
            clinic.latitude = data["latitude"]
        if "longitude" in data:
            clinic.longitude = data["longitude"]
        if "specialties" in data:
            clinic.specialties = (
                ", ".join(data["specialties"])
                if isinstance(data["specialties"], list)
                else data["specialties"]
            )
        if "emergency" in data:
            clinic.emergency = data["emergency"]

        db.session.commit()
    except ValueError as e:
        db.session.rollback()
        return jsonify({
            "error": "Validation Error",
            "message": str(e)
        }), 422
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Update failed: {str(e)}"
        }), 500

    return jsonify({
        "status": "success",
        "message": f"Clinic '{clinic.name}' updated successfully.",
        "data": clinic.to_dict()
    }), 200


@clinic_bp.route("/<int:clinic_id>", methods=["DELETE"])
def delete_clinic(clinic_id: int):
    """Delete a Clinic by ID."""
    clinic = Clinic.query.get_or_404(
        clinic_id,
        description=f"Clinic with ID {clinic_id} not found."
    )
    name = clinic.name
    try:
        db.session.delete(clinic)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Failed to delete clinic: {str(e)}"
        }), 500

    return jsonify({
        "status": "success",
        "message": f"Clinic '{name}' (ID: {clinic_id}) deleted successfully."
    }), 200
