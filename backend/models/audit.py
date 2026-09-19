"""
Audit Log model tracking every bed allocation, release, and emergency status modification.
Provides full compliance, provenance, and data integrity for hospital operations.
"""
from datetime import datetime
from . import db


class BedAuditLog(db.Model):
    __tablename__ = "bed_audit_logs"

    id = db.Column(db.Integer, primary_key=True)
    facility_id = db.Column(db.Integer, db.ForeignKey("facilities.id", ondelete="CASCADE"), nullable=False, index=True)
    bed_type = db.Column(db.String(30), nullable=False)
    
    # Action types: ALLOCATE, RELEASE, ADJUST, RECONFIG
    action = db.Column(db.String(30), nullable=False)
    quantity_changed = db.Column(db.Integer, nullable=False)
    resulting_occupied = db.Column(db.Integer, nullable=False)
    resulting_available = db.Column(db.Integer, nullable=False)
    
    # Audit trail metadata
    operator_id = db.Column(db.String(80), default="system_operator")
    reason = db.Column(db.String(255), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)

    facility = db.relationship("Facility", back_populates="audit_logs")

    def to_dict(self):
        return {
            "id": self.id,
            "facility_id": self.facility_id,
            "bed_type": self.bed_type,
            "action": self.action,
            "quantity_changed": self.quantity_changed,
            "resulting_occupied": self.resulting_occupied,
            "resulting_available": self.resulting_available,
            "operator_id": self.operator_id,
            "reason": self.reason,
            "timestamp": self.timestamp.isoformat()
        }
