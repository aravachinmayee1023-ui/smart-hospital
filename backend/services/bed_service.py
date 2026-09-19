"""
Bed inventory management service.
Handles atomic bed allocation, discharges, capacity adjustments, and triggers diversion alerts.
"""
from backend.models import db, Facility, BedInventory, BedAuditLog
from backend.errors import NotFoundError, ResourceConflictError


class BedService:

    @classmethod
    def get_facility_inventory(cls, facility_id: int):
        facility = Facility.query.get(facility_id)
        if not facility or not facility.is_active:
            raise NotFoundError(f"Facility with id {facility_id} not found")
        return facility.beds

    @classmethod
    def allocate_bed(cls, facility_id: int, bed_type: str, count: int = 1, operator_id: str = "dispatch_unit", reason: str = ""):
        """
        Atomically allocates bed(s) in a given department.
        Raises ResourceConflictError if insufficient beds.
        """
        bed = BedInventory.query.filter_by(facility_id=facility_id, bed_type=bed_type).with_for_update().first()
        if not bed:
            raise NotFoundError(f"Bed type '{bed_type}' not available in facility {facility_id}")

        if bed.available < count:
            raise ResourceConflictError(
                f"Insufficient '{bed_type}' beds. Requested: {count}, Available: {bed.available}"
            )

        bed.allocate(count)

        # Create audit log
        audit = BedAuditLog(
            facility_id=facility_id,
            bed_type=bed_type,
            action="ALLOCATE",
            quantity_changed=count,
            resulting_occupied=bed.occupied,
            resulting_available=bed.available,
            operator_id=operator_id,
            reason=reason or f"Admitted {count} patient(s)"
        )
        db.session.add(audit)

        # Check total facility occupancy and auto-adjust emergency triage status if critical
        facility = bed.facility
        total = facility.total_beds
        occupied = facility.occupied_beds
        if total > 0:
            rate = occupied / total
            if rate >= 0.95 and facility.emergency_status not in ["DIVERTING", "CLOSED"]:
                facility.emergency_status = "DIVERTING"
            elif rate >= 0.85 and facility.emergency_status == "NORMAL":
                facility.emergency_status = "ELEVATED"

        db.session.commit()
        return bed

    @classmethod
    def release_bed(cls, facility_id: int, bed_type: str, count: int = 1, operator_id: str = "ward_nurse", reason: str = ""):
        """
        Atomically releases bed(s) upon patient discharge.
        """
        bed = BedInventory.query.filter_by(facility_id=facility_id, bed_type=bed_type).with_for_update().first()
        if not bed:
            raise NotFoundError(f"Bed type '{bed_type}' not registered for facility {facility_id}")

        if bed.occupied < count:
            raise ResourceConflictError(
                f"Cannot release {count} beds when only {bed.occupied} are currently occupied."
            )

        bed.release(count)

        audit = BedAuditLog(
            facility_id=facility_id,
            bed_type=bed_type,
            action="RELEASE",
            quantity_changed=-count,
            resulting_occupied=bed.occupied,
            resulting_available=bed.available,
            operator_id=operator_id,
            reason=reason or f"Discharged {count} patient(s)"
        )
        db.session.add(audit)

        # Re-evaluate emergency status
        facility = bed.facility
        total = facility.total_beds
        occupied = facility.occupied_beds
        if total > 0:
            rate = occupied / total
            if rate < 0.85 and facility.emergency_status in ["DIVERTING", "ELEVATED"]:
                facility.emergency_status = "NORMAL"

        db.session.commit()
        return bed

    @classmethod
    def update_bed_capacity(cls, facility_id: int, bed_type: str, total_capacity: int, occupied: int = None):
        """Updates total bed capacity or reconfigures departmental ward."""
        bed = BedInventory.query.filter_by(facility_id=facility_id, bed_type=bed_type).first()
        if not bed:
            bed = BedInventory(facility_id=facility_id, bed_type=bed_type, total_capacity=total_capacity, occupied=0)
            db.session.add(bed)
        else:
            bed.total_capacity = total_capacity
            if occupied is not None:
                if occupied > total_capacity:
                    raise ResourceConflictError("Occupied beds cannot exceed total capacity")
                bed.occupied = occupied

        db.session.commit()
        return bed
