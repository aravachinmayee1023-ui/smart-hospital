"""
Hospital Routes Blueprint
Smart Hospital Bed and Medical Resource Platform

Implements complete RESTful CRUD APIs for the Hospital model:
- GET    /api/hospitals          -> List all hospitals (with search, filter & pagination)
- GET    /api/hospitals/<id>     -> Get hospital details by ID
- POST   /api/hospitals          -> Create a new hospital with full validation
- PUT    /api/hospitals/<id>     -> Update an existing hospital
- DELETE /api/hospitals/<id>     -> Delete a hospital by ID

Includes:
- JSON payload parsing & validation (handles invalid/empty JSON)
- Mandatory field verification
- Bed count validation (non-negative integer constraint)
- Coordinates validation (WGS84 EPSG:4326 ranges: lat [-90, 90], lng [-180, 180])
- Entity not found handling (404)
- SQLAlchemy database transaction rollback & error handling (500)
- RFC 7946 GeoJSON output support
"""
from typing import Dict, Any, List, Tuple
from flask import Blueprint, request, jsonify
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

try:
    from database import db
    from models.hospital import Hospital
    from services.geojson_service import GeoJSONService
    from services.search_service import SearchService
except (ImportError, ModuleNotFoundError):
    from ..database import db
    from ..models.hospital import Hospital
    from ..services.geojson_service import GeoJSONService
    from ..services.search_service import SearchService

hospital_bp = Blueprint("hospital_bp", __name__, url_prefix="/api/hospitals")


def validate_hospital_payload(data: Dict[str, Any], is_update: bool = False) -> Tuple[bool, List[str]]:
    """
    Validate incoming Hospital JSON payload.
    
    Checks:
    - Required fields on creation (name, address, latitude, longitude)
    - Name & address non-empty strings
    - Beds: integer >= 0
    - Latitude: float between -90.0 and 90.0
    - Longitude: float between -180.0 and 180.0
    - Emergency: boolean or valid boolean string representation
    
    Returns:
        Tuple of (is_valid, error_messages)
    """
    errors: List[str] = []

    # 1. Required fields check for creation
    if not is_update:
        required = ["name", "address", "latitude", "longitude"]
        for field in required:
            if field not in data or data[field] is None or (isinstance(data[field], str) and not data[field].strip()):
                errors.append(f"Field '{field}' is required and cannot be empty.")

    # 2. String field validations
    if "name" in data:
        if not isinstance(data["name"], str) or not data["name"].strip():
            errors.append("Field 'name' must be a non-empty string.")
        elif len(data["name"].strip()) > 120:
            errors.append("Field 'name' cannot exceed 120 characters.")

    if "address" in data:
        if not isinstance(data["address"], str) or not data["address"].strip():
            errors.append("Field 'address' must be a non-empty string.")
        elif len(data["address"].strip()) > 255:
            errors.append("Field 'address' cannot exceed 255 characters.")

    if "type" in data and data["type"] is not None:
        if not isinstance(data["type"], str) or not data["type"].strip():
            errors.append("Field 'type' must be a valid string.")

    # 3. Beds validation (Non-negative integer)
    if "beds" in data and data["beds"] is not None:
        try:
            val_beds = int(data["beds"])
            if val_beds < 0:
                errors.append(f"Field 'beds' cannot be negative. Received: {val_beds}.")
        except (ValueError, TypeError):
            errors.append(f"Field 'beds' must be a valid integer. Received: '{data['beds']}'.")

    # 4. Latitude validation (-90.0 <= lat <= 90.0)
    if "latitude" in data and data["latitude"] is not None:
        try:
            val_lat = float(data["latitude"])
            if not (-90.0 <= val_lat <= 90.0):
                errors.append(f"Field 'latitude' must be between -90.0 and 90.0 degrees. Received: {val_lat}.")
        except (ValueError, TypeError):
            errors.append(f"Field 'latitude' must be a valid numeric decimal. Received: '{data['latitude']}'.")

    # 5. Longitude validation (-180.0 <= lng <= 180.0)
    if "longitude" in data and data["longitude"] is not None:
        try:
            val_lng = float(data["longitude"])
            if not (-180.0 <= val_lng <= 180.0):
                errors.append(f"Field 'longitude' must be between -180.0 and 180.0 degrees. Received: {val_lng}.")
        except (ValueError, TypeError):
            errors.append(f"Field 'longitude' must be a valid numeric decimal. Received: '{data['longitude']}'.")

    # 6. Emergency boolean validation
    if "emergency" in data and data["emergency"] is not None:
        val_emg = data["emergency"]
        if not isinstance(val_emg, bool):
            if isinstance(val_emg, (int, str)):
                clean_str = str(val_emg).strip().lower()
                if clean_str not in ("true", "false", "1", "0", "yes", "no"):
                    errors.append(f"Field 'emergency' must be a boolean (true/false). Received: '{val_emg}'.")
            else:
                errors.append(f"Field 'emergency' must be a boolean (true/false). Received: '{val_emg}'.")

    return (len(errors) == 0, errors)


# ==============================================================================
# 1. GET /api/hospitals - List and filter hospitals
# ==============================================================================
@hospital_bp.route("", methods=["GET"])
def get_hospitals():
    """
    List and filter hospitals supporting query parameters:
    - type: string (e.g. ?type=Hospital)
    - beds_min: non-negative integer (e.g. ?beds_min=100, accepts ?min_beds as alias)
    - emergency: boolean string ('true' or 'false', e.g. ?emergency=true)
    - q: search query string across name/address
    - format: 'geojson' for RFC 7946 FeatureCollection export
    
    Validates:
    - beds_min must be an integer >= 0 (returns 400 on error)
    - emergency must be 'true' or 'false' (returns 400 on error)
    """
    # 1. Validate 'beds_min' (and legacy alias 'min_beds')
    raw_beds_min = request.args.get("beds_min")
    if raw_beds_min is None:
        raw_beds_min = request.args.get("min_beds")

    beds_min_val = None
    if raw_beds_min is not None and raw_beds_min.strip() != "":
        try:
            parsed_beds = int(raw_beds_min.strip())
            if parsed_beds < 0:
                return jsonify({
                    "error": "Bad Request",
                    "message": f"Invalid value for 'beds_min': {raw_beds_min}. Must be a non-negative integer.",
                    "status_code": 400
                }), 400
            beds_min_val = parsed_beds
        except (ValueError, TypeError):
            return jsonify({
                "error": "Bad Request",
                "message": f"Invalid value for 'beds_min': '{raw_beds_min}'. Must be a valid integer.",
                "status_code": 400
            }), 400

    # 2. Validate 'emergency'
    raw_emergency = request.args.get("emergency")
    emergency_val = None
    if raw_emergency is not None and raw_emergency.strip() != "":
        clean_emergency = raw_emergency.strip().lower()
        if clean_emergency in ("true", "1", "yes"):
            emergency_val = True
        elif clean_emergency in ("false", "0", "no"):
            emergency_val = False
        else:
            return jsonify({
                "error": "Bad Request",
                "message": f"Invalid value for 'emergency': '{raw_emergency}'. Must be 'true' or 'false'.",
                "status_code": 400
            }), 400

    # 3. Parse optional 'type' parameter
    type_param = request.args.get("type", type=str)
    if type_param:
        type_param = type_param.strip()
        if not type_param:
            type_param = None

    try:
        q = request.args.get("q", type=str)
        max_beds = request.args.get("max_beds", type=int)

        near_lat = request.args.get("lat", type=float)
        near_lng = request.args.get("lng", type=float)
        radius_km = request.args.get("radius_km", type=float)
        sort_by = request.args.get("sort_by", default="name", type=str)
        order = request.args.get("order", default="asc", type=str)
        fmt = request.args.get("format", default="json", type=str).lower()

        # Direct RFC 7946 GeoJSON export
        if fmt == "geojson":
            hospitals = Hospital.query.all()
            return jsonify(GeoJSONService.to_feature_collection(hospitals, facility_type="Hospital")), 200

        results = SearchService.filter_facilities(
            model_class=Hospital,
            query_text=q,
            facility_type=type_param,
            min_beds=beds_min_val,
            max_beds=max_beds,
            emergency=emergency_val,
            near_lat=near_lat,
            near_lng=near_lng,
            radius_km=radius_km,
            sort_by=sort_by,
            order=order
        )

        filters_applied = {}
        if type_param is not None:
            filters_applied["type"] = type_param
        if beds_min_val is not None:
            filters_applied["beds_min"] = beds_min_val
        if emergency_val is not None:
            filters_applied["emergency"] = emergency_val

        return jsonify({
            "status": "success",
            "count": len(results),
            "filters_applied": filters_applied,
            "data": results
        }), 200

    except SQLAlchemyError as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": "Database error occurred while filtering hospitals.",
            "details": str(e),
            "status_code": 500
        }), 500
    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Failed to retrieve hospitals: {str(e)}",
            "status_code": 500
        }), 500


# ==============================================================================
# 2. GET /api/hospitals/search?q= - Search hospitals by name and address
# ==============================================================================
@hospital_bp.route("/search", methods=["GET"])
def search_hospitals():
    """
    Search hospitals by matching query against 'name' AND 'address' (case-insensitive).
    
    Query Params:
      q: str (required, search query term)
      limit: int (optional, pagination limit)
      offset: int (optional, pagination offset)
      
    Returns:
      200 OK: Matching hospital records (or empty list if no matches found)
      400 Bad Request: Missing or empty query parameter 'q'
      500 Internal Server Error: Database error
    """
    # 1. Validate that 'q' parameter is present
    if "q" not in request.args:
        return jsonify({
            "error": "Bad Request",
            "message": "Query parameter 'q' is required.",
            "status_code": 400
        }), 400

    q = request.args.get("q", default="", type=str)
    search_term = q.strip()

    # 2. Validate that 'q' is not an empty or whitespace-only string
    if not search_term:
        return jsonify({
            "error": "Bad Request",
            "message": "Query parameter 'q' cannot be empty or whitespace.",
            "status_code": 400
        }), 400

    limit = request.args.get("limit", type=int)
    offset = request.args.get("offset", type=int)

    # 3. Execute query using SearchService
    try:
        matching_hospitals = SearchService.search_hospitals(
            model_class=Hospital,
            query_text=search_term,
            limit=limit,
            offset=offset
        )

        return jsonify({
            "status": "success",
            "query": search_term,
            "count": len(matching_hospitals),
            "data": [h.to_dict() for h in matching_hospitals]
        }), 200

    except SQLAlchemyError as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": "A database error occurred while executing hospital search.",
            "details": str(e),
            "status_code": 500
        }), 500

    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Unexpected error during search: {str(e)}",
            "status_code": 500
        }), 500


# ==============================================================================
# 3. GET /api/hospitals/<id> - Retrieve single hospital by ID
# ==============================================================================
@hospital_bp.route("/<int:hospital_id>", methods=["GET"])
def get_hospital_by_id(hospital_id: int):
    """
    Retrieve single hospital details by ID.
    Returns 404 if the hospital does not exist.
    """
    try:
        hospital = Hospital.query.get(hospital_id)
        if not hospital:
            return jsonify({
                "error": "Not Found",
                "message": f"Hospital with ID {hospital_id} does not exist in the system.",
                "status_code": 404
            }), 404

        return jsonify({
            "status": "success",
            "data": hospital.to_dict()
        }), 200

    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Database query failed: {str(e)}",
            "status_code": 500
        }), 500


# ==============================================================================
# 3. POST /api/hospitals - Create a new hospital
# ==============================================================================
@hospital_bp.route("", methods=["POST"])
def create_hospital():
    """
    Create a new Hospital facility.
    
    Validates:
    - Content-Type is application/json
    - JSON payload is valid
    - Required fields: name, address, latitude, longitude
    - Non-negative beds
    - Latitude [-90, 90], Longitude [-180, 180]
    
    Returns 201 on success, 400 on invalid JSON, 422 on validation failure, 500 on DB error.
    """
    if not request.is_json:
        return jsonify({
            "error": "Bad Request",
            "message": "Request Content-Type must be 'application/json'.",
            "status_code": 400
        }), 400

    try:
        data = request.get_json(silent=True)
        if data is None:
            return jsonify({
                "error": "Bad Request",
                "message": "Malformed or empty JSON payload received.",
                "status_code": 400
            }), 400
    except Exception:
        return jsonify({
            "error": "Bad Request",
            "message": "Failed to parse JSON payload.",
            "status_code": 400
        }), 400

    # Run payload validation
    is_valid, errors = validate_hospital_payload(data, is_update=False)
    if not is_valid:
        return jsonify({
            "error": "Unprocessable Entity",
            "message": "Validation failed for hospital creation.",
            "validation_errors": errors,
            "status_code": 422
        }), 422

    try:
        # Normalize specialties string/list
        specialties_val = data.get("specialties")
        if isinstance(specialties_val, list):
            specialties_str = ", ".join(s.strip() for s in specialties_val if s.strip())
        elif isinstance(specialties_val, str):
            specialties_str = specialties_val.strip()
        else:
            specialties_str = "General Medicine, Emergency Care"

        # Normalize emergency flag
        raw_emg = data.get("emergency", True)
        if isinstance(raw_emg, str):
            emergency_val = raw_emg.strip().lower() in ("true", "1", "yes")
        else:
            emergency_val = bool(raw_emg)

        hospital = Hospital(
            name=data["name"].strip(),
            type=data.get("type", "General Hospital").strip(),
            address=data["address"].strip(),
            beds=int(data.get("beds", 0)),
            latitude=float(data["latitude"]),
            longitude=float(data["longitude"]),
            specialties=specialties_str,
            emergency=emergency_val
        )

        db.session.add(hospital)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": f"Hospital '{hospital.name}' created successfully.",
            "data": hospital.to_dict()
        }), 201

    except (ValueError, TypeError) as e:
        db.session.rollback()
        return jsonify({
            "error": "Unprocessable Entity",
            "message": str(e),
            "status_code": 422
        }), 422

    except IntegrityError as e:
        db.session.rollback()
        return jsonify({
            "error": "Conflict / Integrity Error",
            "message": "Database constraint violation occurred.",
            "details": str(e.orig) if hasattr(e, "orig") else str(e),
            "status_code": 409
        }), 409

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            "error": "Internal Server Error",
            "message": "Database transaction failed while saving hospital.",
            "details": str(e),
            "status_code": 500
        }), 500


# ==============================================================================
# 4. PUT /api/hospitals/<id> - Update existing hospital
# ==============================================================================
@hospital_bp.route("/<int:hospital_id>", methods=["PUT"])
def update_hospital(hospital_id: int):
    """
    Update an existing Hospital facility by ID.
    
    Validates provided fields, updates changed attributes, and commits transaction.
    Returns 200 on success, 400 on bad JSON, 404 if not found, 422 on validation error.
    """
    hospital = Hospital.query.get(hospital_id)
    if not hospital:
        return jsonify({
            "error": "Not Found",
            "message": f"Cannot update. Hospital with ID {hospital_id} was not found.",
            "status_code": 404
        }), 404

    if not request.is_json:
        return jsonify({
            "error": "Bad Request",
            "message": "Request Content-Type must be 'application/json'.",
            "status_code": 400
        }), 400

    try:
        data = request.get_json(silent=True)
        if data is None:
            return jsonify({
                "error": "Bad Request",
                "message": "Malformed or empty JSON payload received.",
                "status_code": 400
            }), 400
    except Exception:
        return jsonify({
            "error": "Bad Request",
            "message": "Failed to parse JSON payload.",
            "status_code": 400
        }), 400

    # Validate update payload
    is_valid, errors = validate_hospital_payload(data, is_update=True)
    if not is_valid:
        return jsonify({
            "error": "Unprocessable Entity",
            "message": "Validation failed for hospital update.",
            "validation_errors": errors,
            "status_code": 422
        }), 422

    try:
        if "name" in data:
            hospital.name = data["name"].strip()
        if "type" in data:
            hospital.type = data["type"].strip()
        if "address" in data:
            hospital.address = data["address"].strip()
        if "beds" in data:
            hospital.beds = int(data["beds"])
        if "latitude" in data:
            hospital.latitude = float(data["latitude"])
        if "longitude" in data:
            hospital.longitude = float(data["longitude"])
        if "specialties" in data:
            val = data["specialties"]
            if isinstance(val, list):
                hospital.specialties = ", ".join(s.strip() for s in val if s.strip())
            else:
                hospital.specialties = str(val).strip()
        if "emergency" in data:
            raw_emg = data["emergency"]
            if isinstance(raw_emg, str):
                hospital.emergency = raw_emg.strip().lower() in ("true", "1", "yes")
            else:
                hospital.emergency = bool(raw_emg)

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": f"Hospital '{hospital.name}' updated successfully.",
            "data": hospital.to_dict()
        }), 200

    except (ValueError, TypeError) as e:
        db.session.rollback()
        return jsonify({
            "error": "Unprocessable Entity",
            "message": str(e),
            "status_code": 422
        }), 422

    except IntegrityError as e:
        db.session.rollback()
        return jsonify({
            "error": "Conflict / Integrity Error",
            "message": "Database constraint violation occurred during update.",
            "details": str(e.orig) if hasattr(e, "orig") else str(e),
            "status_code": 409
        }), 409

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            "error": "Internal Server Error",
            "message": "Database update transaction failed.",
            "details": str(e),
            "status_code": 500
        }), 500


# ==============================================================================
# 5. DELETE /api/hospitals/<id> - Delete a hospital
# ==============================================================================
@hospital_bp.route("/<int:hospital_id>", methods=["DELETE"])
def delete_hospital(hospital_id: int):
    """
    Delete a Hospital by ID.
    Returns 200 on success, 404 if not found, 500 on database deletion error.
    """
    try:
        hospital = Hospital.query.get(hospital_id)
        if not hospital:
            return jsonify({
                "error": "Not Found",
                "message": f"Cannot delete. Hospital with ID {hospital_id} does not exist.",
                "status_code": 404
            }), 404

        hospital_name = hospital.name
        db.session.delete(hospital)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": f"Hospital '{hospital_name}' (ID: {hospital_id}) has been deleted successfully.",
            "deleted_id": hospital_id
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Database error occurred while deleting hospital: {str(e)}",
            "status_code": 500
        }), 500


# ==============================================================================
# 6. GET /api/hospitals/geojson - Dedicated GeoJSON FeatureCollection
# ==============================================================================
@hospital_bp.route("/geojson", methods=["GET"])
def get_hospitals_geojson():
    """
    Retrieve hospital records formatted as an RFC 7946 GeoJSON FeatureCollection.
    
    Coordinates format:
        geometry.coordinates = [longitude, latitude]
        
    Optional query parameters:
        emergency: bool ('true'/'false')
        min_beds: int
        strict: bool ('true'/'false' - raise error if invalid coordinates)
    """
    try:
        query = Hospital.query

        emergency_str = request.args.get("emergency", type=str)
        if emergency_str:
            emergency_bool = emergency_str.lower() in ("true", "1", "yes")
            query = query.filter(Hospital.emergency.is_(emergency_bool))

        min_beds = request.args.get("min_beds", type=int)
        if min_beds is not None:
            query = query.filter(Hospital.beds >= min_beds)

        strict_param = request.args.get("strict", "false").lower() in ("true", "1", "yes")

        hospitals = query.all()
        geojson_data = GeoJSONService.hospitals_to_feature_collection(hospitals, strict=strict_param)

        response = jsonify(geojson_data)
        response.headers["Content-Type"] = "application/geo+json; charset=utf-8"
        return response, 200

    except SQLAlchemyError as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": "Database query failed while fetching hospital GeoJSON data.",
            "details": str(e),
            "status_code": 500
        }), 500
    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Failed to generate GeoJSON FeatureCollection: {str(e)}",
            "status_code": 500
        }), 500
