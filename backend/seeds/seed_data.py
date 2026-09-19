"""
Database Seeder: Populates realistic Hospital and Clinic network with coordinates, beds, and resources.
"""
from backend.models import db, Facility, Hospital, Clinic, BedInventory, MedicalResource

SAMPLE_FACILITIES = [
    {
        "name": "St. Jude Metropolitan Medical Center",
        "facility_type": "HOSPITAL",
        "license_number": "MED-CA-90811",
        "address": "1200 Health Sciences Blvd",
        "city": "San Francisco",
        "state": "CA",
        "postal_code": "94143",
        "phone": "+1 (415) 555-0192",
        "email": "triage@stjudemetro.org",
        "latitude": 37.7631,
        "longitude": -122.4580,
        "has_emergency_dept": True,
        "emergency_status": "NORMAL",
        "operating_hours": "24/7",
        "beds": [
            {"bed_type": "ICU", "total_capacity": 36, "occupied": 28, "dept": "Intensive Care Unit"},
            {"bed_type": "VENTILATOR", "total_capacity": 24, "occupied": 18, "dept": "Pulmonology"},
            {"bed_type": "GENERAL", "total_capacity": 220, "occupied": 165, "dept": "Medical Surgical"},
            {"bed_type": "PEDIATRIC", "total_capacity": 40, "occupied": 22, "dept": "Pediatrics"},
            {"bed_type": "MATERNITY", "total_capacity": 30, "occupied": 19, "dept": "Labor & Delivery"}
        ],
        "resources": [
            {"resource_type": "OXYGEN_CYLINDERS", "current_stock": 180, "minimum_threshold": 30, "unit": "cylinders"},
            {"resource_type": "AMBULANCES_ACTIVE", "current_stock": 8, "minimum_threshold": 2, "unit": "vehicles"},
            {"resource_type": "BLOOD_UNITS_O_NEG", "current_stock": 45, "minimum_threshold": 15, "unit": "units"}
        ]
    },
    {
        "name": "Mission Bay Children & Trauma Hospital",
        "facility_type": "HOSPITAL",
        "license_number": "MED-CA-88120",
        "address": "1825 4th Street",
        "city": "San Francisco",
        "state": "CA",
        "postal_code": "94158",
        "phone": "+1 (415) 555-0244",
        "email": "er@missionbaytrauma.org",
        "latitude": 37.7680,
        "longitude": -122.3920,
        "has_emergency_dept": True,
        "emergency_status": "NORMAL",
        "operating_hours": "24/7",
        "beds": [
            {"bed_type": "ICU", "total_capacity": 45, "occupied": 39, "dept": "Pediatric ICU"},
            {"bed_type": "VENTILATOR", "total_capacity": 30, "occupied": 24, "dept": "Trauma Resuscitation"},
            {"bed_type": "GENERAL", "total_capacity": 180, "occupied": 140, "dept": "Inpatient Wards"},
            {"bed_type": "PEDIATRIC", "total_capacity": 85, "occupied": 60, "dept": "Children Wing"}
        ],
        "resources": [
            {"resource_type": "OXYGEN_CYLINDERS", "current_stock": 220, "minimum_threshold": 40, "unit": "cylinders"},
            {"resource_type": "AMBULANCES_ACTIVE", "current_stock": 12, "minimum_threshold": 3, "unit": "vehicles"}
        ]
    },
    {
        "name": "Bay Area Community Urgent Clinic",
        "facility_type": "CLINIC",
        "license_number": "MED-CA-44219",
        "address": "520 Castro Street",
        "city": "San Francisco",
        "state": "CA",
        "postal_code": "94114",
        "phone": "+1 (415) 555-0781",
        "email": "info@castroclinic.org",
        "latitude": 37.7608,
        "longitude": -122.4350,
        "has_emergency_dept": False,
        "emergency_status": "NORMAL",
        "operating_hours": "07:00 - 22:00",
        "beds": [
            {"bed_type": "GENERAL", "total_capacity": 15, "occupied": 8, "dept": "Observation Bay"},
            {"bed_type": "PEDIATRIC", "total_capacity": 6, "occupied": 2, "dept": "Urgent Care"}
        ],
        "resources": [
            {"resource_type": "OXYGEN_CYLINDERS", "current_stock": 25, "minimum_threshold": 5, "unit": "cylinders"},
            {"resource_type": "AMBULANCES_ACTIVE", "current_stock": 2, "minimum_threshold": 1, "unit": "vehicles"}
        ]
    },
    {
        "name": "Pacific Heights General Hospital",
        "facility_type": "HOSPITAL",
        "license_number": "MED-CA-99341",
        "address": "2333 Buchanan Street",
        "city": "San Francisco",
        "state": "CA",
        "postal_code": "94115",
        "phone": "+1 (415) 555-0912",
        "email": "intake@pacificgeneral.org",
        "latitude": 37.7905,
        "longitude": -122.4312,
        "has_emergency_dept": True,
        "emergency_status": "DIVERTING",
        "operating_hours": "24/7",
        "beds": [
            {"bed_type": "ICU", "total_capacity": 28, "occupied": 28, "dept": "Surgical ICU"},
            {"bed_type": "VENTILATOR", "total_capacity": 16, "occupied": 16, "dept": "Critical Care"},
            {"bed_type": "GENERAL", "total_capacity": 150, "occupied": 147, "dept": "Acute Care"}
        ],
        "resources": [
            {"resource_type": "OXYGEN_CYLINDERS", "current_stock": 60, "minimum_threshold": 20, "unit": "cylinders"},
            {"resource_type": "AMBULANCES_ACTIVE", "current_stock": 3, "minimum_threshold": 2, "unit": "vehicles"}
        ]
    },
    {
        "name": "Sunset District Family Care Clinic",
        "facility_type": "CLINIC",
        "license_number": "MED-CA-22904",
        "address": "1940 Noriega St",
        "city": "San Francisco",
        "state": "CA",
        "postal_code": "94122",
        "phone": "+1 (415) 555-0331",
        "email": "sunsetcare@sfclinics.org",
        "latitude": 37.7538,
        "longitude": -122.4851,
        "has_emergency_dept": False,
        "emergency_status": "NORMAL",
        "operating_hours": "08:00 - 18:00",
        "beds": [
            {"bed_type": "GENERAL", "total_capacity": 10, "occupied": 3, "dept": "Day Observation"}
        ],
        "resources": [
            {"resource_type": "OXYGEN_CYLINDERS", "current_stock": 12, "minimum_threshold": 3, "unit": "cylinders"}
        ]
    },
    {
        "name": "Oakland Highland Regional Medical",
        "facility_type": "HOSPITAL",
        "license_number": "MED-CA-77112",
        "address": "1411 E 31st St",
        "city": "Oakland",
        "state": "CA",
        "postal_code": "94602",
        "phone": "+1 (510) 555-0810",
        "email": "intake@highlandhealth.org",
        "latitude": 37.7995,
        "longitude": -122.2312,
        "has_emergency_dept": True,
        "emergency_status": "ELEVATED",
        "operating_hours": "24/7",
        "beds": [
            {"bed_type": "ICU", "total_capacity": 32, "occupied": 29, "dept": "Neuro & Trauma ICU"},
            {"bed_type": "VENTILATOR", "total_capacity": 20, "occupied": 17, "dept": "Respiratory Unit"},
            {"bed_type": "GENERAL", "total_capacity": 210, "occupied": 188, "dept": "General Wards"},
            {"bed_type": "PEDIATRIC", "total_capacity": 25, "occupied": 18, "dept": "Pediatric Ward"}
        ],
        "resources": [
            {"resource_type": "OXYGEN_CYLINDERS", "current_stock": 140, "minimum_threshold": 30, "unit": "cylinders"},
            {"resource_type": "AMBULANCES_ACTIVE", "current_stock": 6, "minimum_threshold": 2, "unit": "vehicles"}
        ]
    }
]


def seed_database():
    """Seeds the SQLite database if no records exist."""
    if Facility.query.first() is not None:
        return  # Already seeded

    for item in SAMPLE_FACILITIES:
        fac = Facility(
            name=item["name"],
            facility_type=item["facility_type"],
            license_number=item["license_number"],
            address=item["address"],
            city=item["city"],
            state=item["state"],
            postal_code=item["postal_code"],
            phone=item["phone"],
            email=item["email"],
            latitude=item["latitude"],
            longitude=item["longitude"],
            has_emergency_dept=item["has_emergency_dept"],
            emergency_status=item["emergency_status"],
            operating_hours=item["operating_hours"],
            is_active=True
        )
        db.session.add(fac)
        db.session.flush()

        for bed in item["beds"]:
            b = BedInventory(
                facility_id=fac.id,
                bed_type=bed["bed_type"],
                total_capacity=bed["total_capacity"],
                occupied=bed["occupied"],
                department_name=bed.get("dept", "Inpatient")
            )
            db.session.add(b)

        for res in item["resources"]:
            r = MedicalResource(
                facility_id=fac.id,
                resource_type=res["resource_type"],
                current_stock=res["current_stock"],
                minimum_threshold=res["minimum_threshold"],
                unit=res.get("unit", "units")
            )
            db.session.add(r)

    # Seed Hospital specific records
    if Hospital.query.first() is None:
        h1 = Hospital(
            name="St. Jude Metropolitan Medical Center",
            type="Teaching & Trauma Hospital",
            address="1200 Health Sciences Blvd, San Francisco, CA 94143",
            beds=356,
            latitude=37.7631,
            longitude=-122.4580,
            specialties="Emergency Medicine, Intensive Care (ICU), Cardiology, Neurosurgery",
            emergency=True
        )
        h2 = Hospital(
            name="Mission Bay Children & Trauma Hospital",
            type="Pediatric Trauma Center",
            address="1825 4th Street, San Francisco, CA 94158",
            beds=340,
            latitude=37.7680,
            longitude=-122.3920,
            specialties="Pediatric Emergency, Neonatal ICU, Trauma Surgery",
            emergency=True
        )
        h3 = Hospital(
            name="Pacific Heights Regional Hospital",
            type="Community General Hospital",
            address="2333 Buchanan Street, San Francisco, CA 94115",
            beds=280,
            latitude=37.7915,
            longitude=-122.4312,
            specialties="Internal Medicine, General Surgery, Orthopedics",
            emergency=True
        )
        db.session.add_all([h1, h2, h3])

    # Seed Clinic specific records
    if Clinic.query.first() is None:
        c1 = Clinic(
            name="Downtown Urgent Care & Rapid Triage",
            type="Urgent Care Clinic",
            address="450 Sutter St, Suite 800, San Francisco, CA 94108",
            beds=12,
            latitude=37.7898,
            longitude=-122.4075,
            specialties="Family Medicine, Rapid Triage, Minor Trauma",
            emergency=False
        )
        c2 = Clinic(
            name="Sunset Community Health & Ambulatory Pavilion",
            type="Ambulatory Care Clinic",
            address="1990 Judah Street, San Francisco, CA 94122",
            beds=8,
            latitude=37.7618,
            longitude=-122.4830,
            specialties="Primary Care, Geriatrics, Preventive Diagnostics",
            emergency=False
        )
        db.session.add_all([c1, c2])

    db.session.commit()
    print("Database successfully seeded with facilities, hospitals, clinics, beds, and resources.")
