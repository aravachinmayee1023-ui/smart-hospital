"""
Input validation module providing schema enforcement, field type validation, and range checking.
Can be used with Marshmallow or as standalone clean Python validators with descriptive error details.
"""
import re
from backend.errors import ValidationError

VALID_FACILITY_TYPES = {"HOSPITAL", "CLINIC"}
VALID_EMERGENCY_STATUSES = {"NORMAL", "ELEVATED", "CRITICAL", "DIVERTING", "CLOSED"}
VALID_BED_TYPES = {"ICU", "VENTILATOR", "GENERAL", "PEDIATRIC", "MATERNITY", "ISOLATION"}
VALID_RESOURCE_TYPES = {
    "OXYGEN_CYLINDERS",
    "BLOOD_UNITS_O_NEG",
    "AMBULANCES_ACTIVE",
    "VENTILATORS",
    "PPE_KITS",
    "DIALYSIS_MACHINES"
}


def validate_facility_payload(data, is_update=False):
    """Validates the payload when creating or updating a hospital or clinic."""
    errors = {}

    if not isinstance(data, dict):
        raise ValidationError("Request body must be a valid JSON object")

    # Name validation
    if not is_update or "name" in data:
        name = data.get("name")
        if not name or not isinstance(name, str) or len(name.strip()) < 2:
            errors["name"] = "Facility name must be at least 2 characters long."

    # Facility Type validation
    if not is_update or "facility_type" in data:
        ftype = data.get("facility_type", "HOSPITAL").upper()
        if ftype not in VALID_FACILITY_TYPES:
            errors["facility_type"] = f"Invalid facility type '{ftype}'. Must be one of: {list(VALID_FACILITY_TYPES)}"

    # License validation
    if not is_update:
        license_num = data.get("license_number")
        if not license_num or not isinstance(license_num, str):
            errors["license_number"] = "A valid license number is required."

    # Geographic coordinates validation
    if not is_update or "latitude" in data or "longitude" in data:
        lat = data.get("latitude")
        lng = data.get("longitude")

        try:
            lat = float(lat)
            if not (-90.0 <= lat <= 90.0):
                errors["latitude"] = "Latitude must be between -90.0 and 90.0 degrees."
        except (TypeError, ValueError):
            errors["latitude"] = "Latitude must be a valid floating-point number."

        try:
            lng = float(lng)
            if not (-180.0 <= lng <= 180.0):
                errors["longitude"] = "Longitude must be between -180.0 and 180.0 degrees."
        except (TypeError, ValueError):
            errors["longitude"] = "Longitude must be a valid floating-point number."

    # Emergency status validation
    if "emergency_status" in data:
        estatus = str(data.get("emergency_status")).upper()
        if estatus not in VALID_EMERGENCY_STATUSES:
            errors["emergency_status"] = f"Invalid emergency status. Must be one of: {list(VALID_EMERGENCY_STATUSES)}"

    # Phone validation
    if not is_update or "phone" in data:
        phone = data.get("phone", "")
        if not phone or len(str(phone).strip()) < 5:
            errors["phone"] = "A valid contact phone number is required."

    # Address validations
    for field in ["address", "city", "state", "postal_code"]:
        if not is_update or field in data:
            val = data.get(field)
            if not val or not isinstance(val, str) or not val.strip():
                errors[field] = f"The field '{field}' is required and cannot be empty."

    if errors:
        raise ValidationError(
            message="Facility validation failed. Please correct the specified fields.",
            details=errors
        )

    return True


def validate_bed_allocation(data):
    """Validates patient bed admission or discharge requests."""
    errors = {}
    if not isinstance(data, dict):
        raise ValidationError("Request body must be a valid JSON object")

    bed_type = str(data.get("bed_type", "")).upper()
    if bed_type not in VALID_BED_TYPES:
        errors["bed_type"] = f"Invalid bed type '{bed_type}'. Allowed: {list(VALID_BED_TYPES)}"

    count = data.get("count", 1)
    try:
        count = int(count)
        if count <= 0:
            errors["count"] = "Count must be a positive integer greater than 0."
        if count > 500:
            errors["count"] = "Single batch allocation cannot exceed 500 beds."
    except (TypeError, ValueError):
        errors["count"] = "Count must be a valid integer."

    if errors:
        raise ValidationError(message="Bed allocation validation error", details=errors)

    return {"bed_type": bed_type, "count": count, "reason": data.get("reason", "")}


def validate_proximity_query(args):
    """Validates query parameters for GeoJSON proximity radius searches."""
    errors = {}

    try:
        lat = float(args.get("lat"))
        if not (-90.0 <= lat <= 90.0):
            errors["lat"] = "Latitude must be between -90.0 and 90.0."
    except (TypeError, ValueError):
        errors["lat"] = "Parameter 'lat' is required and must be a valid float."

    try:
        lng = float(args.get("lng"))
        if not (-180.0 <= lng <= 180.0):
            errors["lng"] = "Longitude must be between -180.0 and 180.0."
    except (TypeError, ValueError):
        errors["lng"] = "Parameter 'lng' is required and must be a valid float."

    radius = args.get("radius_km", 25.0)
    try:
        radius = float(radius)
        if radius <= 0 or radius > 300.0:
            errors["radius_km"] = "radius_km must be between 0.1 and 300.0 kilometers."
    except (TypeError, ValueError):
        errors["radius_km"] = "radius_km must be a positive float."

    if errors:
        raise ValidationError(message="Invalid coordinates or search radius parameters", details=errors)

    return {"lat": lat, "lng": lng, "radius_km": radius}
