"""
Medical Resource model tracking emergency assets such as Oxygen, Ambulances, and Blood supplies.
"""
from datetime import datetime
from . import db


class MedicalResource(db.Model):
    __tablename__ = "medical_resources"

    id = db.Column(db.Integer, primary_key=True)
    facility_id = db.Column(db.Integer, db.ForeignKey("facilities.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Resource type e.g., OXYGEN_CYLINDERS, AMBULANCES_ACTIVE, BLOOD_UNITS_O_NEG, VENTILATORS
    resource_type = db.Column(db.String(50), nullable=False, index=True)
    current_stock = db.Column(db.Integer, nullable=False, default=0)
    minimum_threshold = db.Column(db.Integer, nullable=False, default=5)
    unit = db.Column(db.String(30), default="units", nullable=False)

    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship back to facility
    facility = db.relationship("Facility", back_populates="resources")

    __table_args__ = (
        db.UniqueConstraint("facility_id", "resource_type", name="uq_facility_resource_type"),
        db.CheckConstraint("current_stock >= 0", name="chk_stock_non_negative"),
    )

    @property
    def is_critical(self):
        return self.current_stock <= self.minimum_threshold

    def to_dict(self):
        return {
            "id": self.id,
            "facility_id": self.facility_id,
            "resource_type": self.resource_type,
            "current_stock": self.current_stock,
            "minimum_threshold": self.minimum_threshold,
            "unit": self.unit,
            "is_critical": self.is_critical,
            "updated_at": self.updated_at.isoformat()
        }
