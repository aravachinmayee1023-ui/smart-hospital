"""
Bed Inventory model representing departmental bed allocations within a hospital or clinic.
"""
from datetime import datetime
from . import db


class BedInventory(db.Model):
    __tablename__ = "bed_inventories"

    id = db.Column(db.Integer, primary_key=True)
    facility_id = db.Column(db.Integer, db.ForeignKey("facilities.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Bed type classification
    # Valid values: ICU, VENTILATOR, GENERAL, PEDIATRIC, MATERNITY, ISOLATION
    bed_type = db.Column(db.String(30), nullable=False, index=True)

    # Capacities
    total_capacity = db.Column(db.Integer, nullable=False, default=0)
    occupied = db.Column(db.Integer, nullable=False, default=0)

    # Department and floor metadata
    department_name = db.Column(db.String(80), nullable=True)
    floor_number = db.Column(db.String(20), nullable=True)
    
    # Timestamps
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship back to facility
    facility = db.relationship("Facility", back_populates="beds")

    # Table constraints
    __table_args__ = (
        db.UniqueConstraint("facility_id", "bed_type", name="uq_facility_bed_type"),
        db.CheckConstraint("total_capacity >= 0", name="chk_total_capacity_positive"),
        db.CheckConstraint("occupied >= 0", name="chk_occupied_positive"),
        db.CheckConstraint("occupied <= total_capacity", name="chk_occupied_lte_total"),
    )

    @property
    def available(self):
        return max(0, self.total_capacity - self.occupied)

    @property
    def occupancy_rate(self):
        if self.total_capacity == 0:
            return 0.0
        return round((self.occupied / self.total_capacity) * 100, 1)

    def allocate(self, count=1):
        """Atomically allocates available beds."""
        if count <= 0:
            raise ValueError("Allocation count must be a positive integer.")
        if self.available < count:
            raise ValueError(f"Insufficient beds available. Requested: {count}, Available: {self.available}")
        self.occupied += count
        self.updated_at = datetime.utcnow()

    def release(self, count=1):
        """Atomically releases occupied beds (e.g. upon patient discharge)."""
        if count <= 0:
            raise ValueError("Release count must be a positive integer.")
        if self.occupied < count:
            raise ValueError(f"Cannot release {count} beds when only {self.occupied} are occupied.")
        self.occupied -= count
        self.updated_at = datetime.utcnow()

    def to_dict(self):
        return {
            "id": self.id,
            "facility_id": self.facility_id,
            "bed_type": self.bed_type,
            "total_capacity": self.total_capacity,
            "occupied": self.occupied,
            "available": self.available,
            "occupancy_rate_percent": self.occupancy_rate,
            "department_name": self.department_name,
            "floor_number": self.floor_number,
            "updated_at": self.updated_at.isoformat()
        }
