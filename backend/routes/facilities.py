"""
Facilities Blueprint: Handles CRUD operations, searching, and filtering for Hospitals and Clinics.
"""
from flask import Blueprint, request, jsonify
from backend.models import db, Facility, BedInventory, MedicalResource
from backend.schemas.validators import validate_facility_payload
from backend.errors import NotFoundError

facilities_bp = Blueprint("facilities", __name__, url_prefix="/api/v1/facilities")


@facilities_bp.route("", methods=["GET"])
def list_facilities():
    """
    Search and filter facilities.
    Query parameters:
      - q: Search string matching name, city, or address
      - type: HOSPITAL or CLINIC
      - city: City name filter
      - emergency_status: NORMAL, ELEVATED, CRITICAL, DIVERTING, CLOSED
      - has_emergency: true or false
      - min_icu: Minimum available ICU beds
      - min_available: Minimum total available beds
      - page: Page number (default 1)
      - per_page: Results per page (default 20, max 100)
    """
    query = Facility.query.filter(Facility.is_active == True)

    # Keyword search across name and address
    search_q = request.args.get("q", "").strip()
    if search_q:
        search_pattern = f"%{search_q}%"
        query = query.filter(
            db.or_(
                Facility.name.ilike(search_pattern),
                Facility.city.ilike(search_pattern),
                Facility.address.ilike(search_pattern)
            )
        )

    # Facility type filter
    ftype = request.args.get("type", "").strip().upper()
    if ftype in ["HOSPITAL", "CLINIC"]:
        query = query.filter(Facility.facility_type == ftype)

    # City filter
    city = request.args.get("city", "").strip()
    if city:
        query = query.filter(Facility.city.ilike(city))

    # Emergency status filter
    estatus = request.args.get("emergency_status", "").strip().upper()
    if estatus:
        query = query.filter(Facility.emergency_status == estatus)

    # Emergency department flag
    has_er = request.args.get("has_emergency")
    if has_er is not None:
        has_er_bool = has_er.lower() in ["true", "1", "yes"]
        query = query.filter(Facility.has_emergency_dept == has_er_bool)

    # Pagination
    try:
        page = max(1, int(request.args.get("page", 1)))
        per_page = min(100, max(1, int(request.args.get("per_page", 20))))
    except ValueError:
        page, per_page = 1, 20

    paginated = query.order_by(Facility.name.asc()).paginate(page=page, per_page=per_page, error_out=False)

    # Secondary bed capacity filters (evaluated on joined inventory)
    min_icu = request.args.get("min_icu", type=int)
    min_avail = request.args.get("min_available", type=int)

    items = paginated.items
    if min_icu is not None:
        items = [f for f in items if f.icu_available >= min_icu]
    if min_avail is not None:
        items = [f for f in items if f.available_beds >= min_avail]

    return jsonify({
        "success": True,
        "data": [f.to_dict(include_details=False) for f in items],
        "pagination": {
            "page": paginated.page,
            "per_page": paginated.per_page,
            "total_items": paginated.total,
            "total_pages": paginated.pages
        }
    }), 200


@facilities_bp.route("/<int:facility_id>", methods=["GET"])
def get_facility(facility_id):
    """Retrieve detailed information for a single hospital or clinic."""
    facility = Facility.query.filter_by(id=facility_id, is_active=True).first()
    if not facility:
        raise NotFoundError(f"Facility with ID {facility_id} not found")

    return jsonify({
        "success": True,
        "data": facility.to_dict(include_details=True)
    }), 200


@facilities_bp.route("", methods=["POST"])
def create_facility():
    """Register a new Hospital or Clinic with initial bed inventories."""
    data = request.get_json() or {}
    validate_facility_payload(data, is_update=False)

    facility = Facility(
        name=data["name"].strip(),
        facility_type=data.get("facility_type", "HOSPITAL").upper(),
        license_number=data["license_number"].strip(),
        address=data["address"].strip(),
        city=data["city"].strip(),
        state=data["state"].strip(),
        postal_code=data["postal_code"].strip(),
        phone=data["phone"].strip(),
        email=data.get("email", "").strip() or None,
        latitude=float(data["latitude"]),
        longitude=float(data["longitude"]),
        has_emergency_dept=data.get("has_emergency_dept", True),
        emergency_status=data.get("emergency_status", "NORMAL").upper(),
        operating_hours=data.get("operating_hours", "24/7"),
        is_active=True
    )
    db.session.add(facility)
    db.session.flush()

    # Initialize default bed inventory if provided or setup standards
    initial_beds = data.get("beds", [
        {"bed_type": "GENERAL", "total_capacity": 50, "occupied": 20},
        {"bed_type": "ICU", "total_capacity": 10, "occupied": 4},
        {"bed_type": "VENTILATOR", "total_capacity": 8, "occupied": 2},
        {"bed_type": "PEDIATRIC", "total_capacity": 15, "occupied": 5}
    ])

    for b in initial_beds:
        bed = BedInventory(
            facility_id=facility.id,
            bed_type=b["bed_type"].upper(),
            total_capacity=int(b.get("total_capacity", 0)),
            occupied=int(b.get("occupied", 0)),
            department_name=b.get("department_name", "General Ward")
        )
        db.session.add(bed)

    # Initial medical resources
    default_resources = [
        {"resource_type": "OXYGEN_CYLINDERS", "current_stock": 45, "minimum_threshold": 10, "unit": "cylinders"},
        {"resource_type": "AMBULANCES_ACTIVE", "current_stock": 4, "minimum_threshold": 1, "unit": "vehicles"}
    ]
    for r in data.get("resources", default_resources):
        res = MedicalResource(
            facility_id=facility.id,
            resource_type=r["resource_type"],
            current_stock=int(r.get("current_stock", 0)),
            minimum_threshold=int(r.get("minimum_threshold", 5)),
            unit=r.get("unit", "units")
        )
        db.session.add(res)

    db.session.commit()

    return jsonify({
        "success": True,
        "message": f"Facility '{facility.name}' created successfully.",
        "data": facility.to_dict(include_details=True)
    }), 201


@facilities_bp.route("/<int:facility_id>", methods=["PUT"])
def update_facility(facility_id):
    """Update profile and contact information for an existing facility."""
    facility = Facility.query.filter_by(id=facility_id, is_active=True).first()
    if not facility:
        raise NotFoundError(f"Facility with ID {facility_id} not found")

    data = request.get_json() or {}
    validate_facility_payload(data, is_update=True)

    updatable_fields = [
        "name", "address", "city", "state", "postal_code",
        "phone", "email", "latitude", "longitude",
        "has_emergency_dept", "emergency_status", "operating_hours"
    ]
    for field in updatable_fields:
        if field in data:
            setattr(facility, field, data[field])

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Facility updated successfully",
        "data": facility.to_dict(include_details=True)
    }), 200


@facilities_bp.route("/<int:facility_id>", methods=["DELETE"])
def delete_facility(facility_id):
    """Soft delete a facility by setting is_active to False."""
    facility = Facility.query.filter_by(id=facility_id, is_active=True).first()
    if not facility:
        raise NotFoundError(f"Facility with ID {facility_id} not found")

    facility.is_active = False
    db.session.commit()

    return jsonify({
        "success": True,
        "message": f"Facility '{facility.name}' deactivated successfully."
    }), 200
