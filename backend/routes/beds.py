"""
Beds Blueprint: Handles bed inventory operations, atomic allocations, discharges, and audit logs.
"""
from flask import Blueprint, request, jsonify
from backend.models import Facility, BedInventory, BedAuditLog
from backend.services.bed_service import BedService
from backend.schemas.validators import validate_bed_allocation
from backend.errors import NotFoundError, ValidationError

beds_bp = Blueprint("beds", __name__, url_prefix="/api/v1/facilities/<int:facility_id>/beds")


@beds_bp.route("", methods=["GET"])
def list_beds(facility_id):
    """Retrieve complete bed inventory by ward/type for a facility."""
    facility = Facility.query.filter_by(id=facility_id, is_active=True).first()
    if not facility:
        raise NotFoundError(f"Facility {facility_id} not found")

    return jsonify({
        "success": True,
        "facility_id": facility_id,
        "facility_name": facility.name,
        "summary": {
            "total_beds": facility.total_beds,
            "available_beds": facility.available_beds,
            "occupied_beds": facility.occupied_beds
        },
        "beds": [bed.to_dict() for bed in facility.beds]
    }), 200


@beds_bp.route("/allocate", methods=["POST"])
def allocate_bed(facility_id):
    """
    Admit a patient and allocate bed in a department.
    Payload:
      {
        "bed_type": "ICU" | "VENTILATOR" | "GENERAL" | "PEDIATRIC" | "MATERNITY",
        "count": 1,
        "operator_id": "Dr. Sarah Adams",
        "reason": "Emergency Trauma admission"
      }
    """
    data = request.get_json() or {}
    validated = validate_bed_allocation(data)

    bed = BedService.allocate_bed(
        facility_id=facility_id,
        bed_type=validated["bed_type"],
        count=validated["count"],
        operator_id=data.get("operator_id", "triage_officer"),
        reason=validated.get("reason", "")
    )

    return jsonify({
        "success": True,
        "message": f"Successfully allocated {validated['count']} '{validated['bed_type']}' bed(s).",
        "data": bed.to_dict()
    }), 200


@beds_bp.route("/release", methods=["POST"])
def release_bed(facility_id):
    """
    Discharge a patient and release bed.
    Payload:
      {
        "bed_type": "ICU" | "VENTILATOR" | "GENERAL",
        "count": 1,
        "operator_id": "Nurse Carter",
        "reason": "Routine discharge"
      }
    """
    data = request.get_json() or {}
    validated = validate_bed_allocation(data)

    bed = BedService.release_bed(
        facility_id=facility_id,
        bed_type=validated["bed_type"],
        count=validated["count"],
        operator_id=data.get("operator_id", "nurse_station"),
        reason=validated.get("reason", "")
    )

    return jsonify({
        "success": True,
        "message": f"Successfully released {validated['count']} '{validated['bed_type']}' bed(s).",
        "data": bed.to_dict()
    }), 200


@beds_bp.route("/<bed_type>", methods=["PATCH"])
def adjust_bed_capacity(facility_id, bed_type):
    """
    Directly adjust total capacity or occupied count for a bed type.
    Payload:
      { "total_capacity": 60, "occupied": 25 }
    """
    bed_type = bed_type.upper()
    data = request.get_json() or {}

    total = data.get("total_capacity")
    occupied = data.get("occupied")

    if total is None and occupied is None:
        raise ValidationError("Provide either total_capacity or occupied to update.")

    bed = BedInventory.query.filter_by(facility_id=facility_id, bed_type=bed_type).first()
    if not bed:
        raise NotFoundError(f"Bed type '{bed_type}' not found for facility {facility_id}")

    if total is not None:
        if total < 0:
            raise ValidationError("total_capacity cannot be negative")
        bed.total_capacity = int(total)

    if occupied is not None:
        if occupied < 0:
            raise ValidationError("occupied cannot be negative")
        if occupied > bed.total_capacity:
            raise ValidationError(f"occupied ({occupied}) cannot exceed total capacity ({bed.total_capacity})")
        bed.occupied = int(occupied)

    bed.facility.updated_at = bed.updated_at
    from backend.models import db
    db.session.commit()

    return jsonify({
        "success": True,
        "message": f"Bed '{bed_type}' updated.",
        "data": bed.to_dict()
    }), 200


@beds_bp.route("/audit-logs", methods=["GET"])
def get_audit_logs(facility_id):
    """Get history of bed allocations and releases for auditing."""
    logs = BedAuditLog.query.filter_by(facility_id=facility_id).order_by(BedAuditLog.timestamp.desc()).limit(50).all()
    return jsonify({
        "success": True,
        "facility_id": facility_id,
        "count": len(logs),
        "data": [l.to_dict() for l in logs]
    }), 200
