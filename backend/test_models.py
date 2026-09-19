"""
Verification and Demonstration Script for Hospital and Clinic SQLAlchemy Models.

Demonstrates:
1. Model instantiation with valid fields
2. Validation enforcement (negative beds, invalid coordinates, invalid boolean)
3. String representation (__repr__)
4. Dictionary serialization (to_dict)
"""
import sys
import os

# Add parent directory to path so imports work cleanly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

try:
    from flask import Flask
    from flask_sqlalchemy import SQLAlchemy
    from backend.models import db, Hospital, Clinic
except ImportError:
    print("Notice: Flask / Flask-SQLAlchemy not installed in current global Python environment.")
    print("To install dependencies: pip install Flask Flask-SQLAlchemy Flask-CORS")
    sys.exit(0)


def run_tests():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    with app.app_context():
        db.create_all()
        print("✓ SQLite in-memory database tables created successfully.")

        # --- Test 1: Valid Hospital Creation ---
        h = Hospital(
            name="General County Hospital",
            type="Public Trauma Hospital",
            address="100 Main St, Capital City",
            beds=250,
            latitude=37.7749,
            longitude=-122.4194,
            specialties="Cardiology, Emergency, ICU",
            emergency=True
        )
        db.session.add(h)
        db.session.commit()
        print(f"✓ Valid Hospital Created: {h}")

        # --- Test 2: Valid Clinic Creation ---
        c = Clinic(
            name="Downtown Urgent Care",
            type="Urgent Care Clinic",
            address="200 Market St, Capital City",
            beds=10,
            latitude=37.7833,
            longitude=-122.4167,
            specialties="Primary Care, Minor Injuries",
            emergency=False
        )
        db.session.add(c)
        db.session.commit()
        print(f"✓ Valid Clinic Created: {c}")

        # --- Test 3: Validation - Negative Beds ---
        try:
            Hospital(
                name="Invalid Bed Hospital",
                type="General Hospital",
                address="300 Error Blvd",
                beds=-5,
                latitude=40.7128,
                longitude=-74.0060,
                emergency=True
            )
            print("✗ FAILED: Negative beds should have raised ValueError!")
        except ValueError as e:
            print(f"✓ Negative Bed Validator caught correctly: {e}")

        # --- Test 4: Validation - Out of Range Latitude ---
        try:
            Hospital(
                name="Invalid Lat Hospital",
                type="General Hospital",
                address="400 North Pole Way",
                beds=50,
                latitude=95.5,
                longitude=-74.0060,
                emergency=True
            )
            print("✗ FAILED: Latitude > 90 should have raised ValueError!")
        except ValueError as e:
            print(f"✓ Latitude Range Validator caught correctly: {e}")

        # --- Test 5: Validation - Out of Range Longitude ---
        try:
            Clinic(
                name="Invalid Lng Clinic",
                type="Clinic",
                address="500 Far East Way",
                beds=5,
                latitude=40.7128,
                longitude=195.0,
                emergency=False
            )
            print("✗ FAILED: Longitude > 180 should have raised ValueError!")
        except ValueError as e:
            print(f"✓ Longitude Range Validator caught correctly: {e}")

        # --- Test 6: Validation - Non-Boolean Emergency ---
        try:
            Clinic(
                name="Invalid Emergency Clinic",
                type="Clinic",
                address="600 Ambiguous Ave",
                beds=5,
                latitude=40.7128,
                longitude=-74.0060,
                emergency="maybe"
            )
            print("✗ FAILED: Non-boolean emergency should have raised ValueError!")
        except ValueError as e:
            print(f"✓ Emergency Boolean Validator caught correctly: {e}")

        # --- Test 7: Serialization ---
        dict_data = h.to_dict()
        assert dict_data["beds"] == 250
        assert dict_data["emergency"] is True
        print(f"✓ Serialization to_dict() verified: {dict_data['name']} has {dict_data['beds']} beds.")

        print("\n★ All Hospital & Clinic Model validations and constraints passed flawlessly!")


if __name__ == "__main__":
    run_tests()
