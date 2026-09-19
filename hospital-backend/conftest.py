"""
pytest Configuration and Fixtures
Smart Hospital Bed and Medical Resource Platform

Provides reusable, isolated fixtures for:
- Flask application configured with in-memory SQLite (TestingConfig)
- Flask test client for HTTP requests
- Application context fixture
- Sample seed data fixtures for hospitals and clinics
Ensures no test ever touches or modifies production database data.
"""
import os
import sys
import pytest

# Ensure the hospital-backend root is in python module path
BACKEND_DIR = os.path.abspath(os.path.dirname(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app import create_app
from database import db
from models.hospital import Hospital


@pytest.fixture(scope="function")
def app():
    """
    Creates and configures a fresh Flask application instance for each test.
    Uses 'testing' configuration which routes to SQLite in-memory database (:memory:).
    """
    application = create_app(config_name="testing")
    application.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "SQLALCHEMY_TRACK_MODIFICATIONS": False,
    })

    with application.app_context():
        db.create_all()
        yield application
        db.session.remove()
        db.drop_all()


@pytest.fixture(scope="function")
def client(app):
    """
    Flask test client to simulate HTTP requests against the endpoints.
    """
    return app.test_client()


@pytest.fixture(scope="function")
def app_ctx(app):
    """
    Provides an active Flask application context for direct SQLAlchemy database operations.
    """
    with app.app_context():
        yield app


@pytest.fixture(scope="function")
def sample_hospital(app):
    """
    Seeds a single baseline hospital record for ID-based lookup and update tests.
    """
    with app.app_context():
        hospital = Hospital(
            name="City Care Hospital",
            type="General Hospital",
            address="100 Hospital Way, San Francisco, CA",
            beds=150,
            latitude=37.7749,
            longitude=-122.4194,
            specialties="Cardiology, Emergency Care",
            emergency=True
        )
        db.session.add(hospital)
        db.session.commit()
        # Refresh to ensure ID is populated
        db.session.refresh(hospital)
        return hospital.to_dict()


@pytest.fixture(scope="function")
def seeded_hospitals(app):
    """
    Seeds multiple diverse hospital records for search, filter, and GeoJSON tests.
    """
    with app.app_context():
        h1 = Hospital(
            name="Apollo Super Specialty Center",
            type="Super Specialty Hospital",
            address="Road No 72, Jubilee Hills, Hyderabad",
            beds=350,
            latitude=17.4265,
            longitude=78.4116,
            specialties="Cardiology, Oncology, Organ Transplant",
            emergency=True
        )
        h2 = Hospital(
            name="Care Community Clinic Hospital",
            type="Community General Hospital",
            address="Banjara Hills, Hyderabad",
            beds=80,
            latitude=17.4156,
            longitude=78.4350,
            specialties="Internal Medicine, Pediatrics",
            emergency=False
        )
        h3 = Hospital(
            name="Metropolitan Trauma & Surgery Institute",
            type="Trauma Center",
            address="Market Street, Financial District, San Francisco",
            beds=220,
            latitude=37.7899,
            longitude=-122.4010,
            specialties="Emergency Trauma, Orthopedics",
            emergency=True
        )
        db.session.add_all([h1, h2, h3])
        db.session.commit()
        return [h1.to_dict(), h2.to_dict(), h3.to_dict()]
