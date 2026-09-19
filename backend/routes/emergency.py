"""
Emergency Blueprint: Handles emergency room availability, regional surge metrics, and ambulance diversion.
"""
from flask import Blueprint, request, jsonify
from backend.models import db, Facility, BedInventory, MedicalResource
from backend.errors import NotFoundError, ValidationError

emergency_bp = Blueprint("emergency", __name__, url_prefix="/api/v1/emergency")


@emergency_bp.route("/summary", methods=["GET"])
def get_emergency_summary():
    """
    Returns high-level regional emergency triage metrics for 911 dispatchers and health authorities.
    Includes count of diverting hospitals, critical ICU capacity, and oxygen availability.
    """
    facilities = Facility.query.filter_by(is_active=True).all()

    total_facilities = len(facilities)
    hospitals = [f for f in facilities if f.facility_type == "HOSPITAL"]
    clinics = [f for f in facilities if f.facility_type == "CLINIC"]

    diverting_count = sum(1 for f in facilities if f.emergency_status == "DIVERTING")
    critical_count = sum(1 for f in facilities if f.emergency_status == "CRITICAL")
    normal_count = sum(1 for f in facilities if f.emergency_status == "NORMAL")

    total_beds = sum(f.total_beds for f in facilities)
    available_beds = sum(f.available_beds for f in facilities)
    total_icu_available = sum(f.icu_available for f in facilities)
    total_vent_available = sum(f.ventilator_available for f in facilities)

    # Ambulances in operation
    active_ambulances = sum(
        res.current_stock
        for f in facilities
        for res in f.resources
        if res.resource_type == "AMBULANCES_ACTIVE"
    )

    return jsonify({
        "success": True,
        "metrics": {
            "total_facilities": total_facilities,
            "hospitals_count": len(hospitals),
            "clinics_count": len(clinics),
            "emergency_statuses": {
                "normal": normal_count,
                "diverting": diverting_count,
                "critical": critical_count,
                "elevated": total_facilities - (normal_count + diverting_count + critical_count)
            },
            "capacity": {
                "total_beds": total_beds,
                "available_beds": available_beds,
                "occupancy_rate_percent": round(((total_beds - available_beds) / total_beds * 100), 1) if total_beds > 0 else 0,
                "icu_available": total_icu_available,
                "ventilators_available": total_vent_available,
                "active_ambulances": active_ambulances
            }
        },
        "urgent_alerts": [
            {
                "facility_id": f.id,
                "facility_name": f.name,
                "emergency_status": f.emergency_status,
                "phone": f.phone,
                "icu_available": f.icu_available,
                "action_recommended": "Divert ambulances to neighboring trauma centers" if f.emergency_status == "DIVERTING" else "Monitor surge"
            }
            for f in facilities if f.emergency_status in ["DIVERTING", "CRITICAL"]
        ]
    }), 200


@emergency_bp.route("/facilities/<int:facility_id>/status", methods=["PATCH"])
def update_emergency_status(facility_id):
    """
    Update the triage or diversion status of a hospital.
    Payload:
      { "emergency_status": "NORMAL" | "ELEVATED" | "CRITICAL" | "DIVERTING" | "CLOSED", "reason": "Power outage" }
    """
    facility = Facility.query.filter_by(id=facility_id, is_active=True).first()
    if not facility:
        raise NotFoundError(f"Facility {facility_id} not found")

    data = request.get_json() or {}
    new_status = str(data.get("emergency_status", "")).upper()

    valid_statuses = {"NORMAL", "ELEVATED", "CRITICAL", "DIVERTING", "CLOSED"}
    if new_status not in valid_statuses:
        raise ValidationError(f"Invalid emergency status. Must be one of: {list(valid_statuses)}")

    previous_status = facility.emergency_status
    facility.emergency_status = new_status
    db.session.commit()

    return jsonify({
        "success": True,
        "message": f"Facility status updated from '{previous_status}' to '{new_status}'.",
        "data": {
            "facility_id": facility.id,
            "facility_name": facility.name,
            "emergency_status": facility.emergency_status,
            "updated_at": facility.updated_at.isoformat()
        }
    }), 200
