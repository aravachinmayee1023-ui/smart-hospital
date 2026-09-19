"""
Flask Application Factory and Entrypoint
Smart Hospital Bed and Medical Resource Platform

Features:
- Configures Flask, SQLite & SQLAlchemy
- Enables CORS for frontend web integration
- Registers Hospital and Clinic RESTful blueprints
- Creates SQLite database tables automatically with demo seeds
- Exposes GET /api/health endpoint
- Centralized error handlers for standard HTTP errors
"""
import os
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS

from database import db
from config import config_by_name
from models.hospital import Hospital
from models.clinic import Clinic
from routes.hospital_routes import hospital_bp
from routes.clinic_routes import clinic_bp


def seed_initial_data():
    """Seed sample hospitals and clinics if the database tables are empty."""
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


def register_error_handlers(app: Flask):
    """Register uniform JSON error handlers for common HTTP status codes."""

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            "error": "Bad Request",
            "message": getattr(error, "description", "The request could not be understood or was missing data."),
            "status_code": 400
        }), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "error": "Not Found",
            "message": getattr(error, "description", "The requested resource was not found on this server."),
            "status_code": 404
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            "error": "Method Not Allowed",
            "message": "The HTTP method is not allowed for the requested URL.",
            "status_code": 405
        }), 405

    @app.errorhandler(422)
    def unprocessable_entity(error):
        return jsonify({
            "error": "Unprocessable Entity",
            "message": getattr(error, "description", "Request contained validation or semantic errors."),
            "status_code": 422
        }), 422

    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({
            "error": "Internal Server Error",
            "message": "An unexpected server error occurred. Please contact the administrator.",
            "status_code": 500
        }), 500


def create_app(config_name: str = None) -> Flask:
    """
    Application Factory:
    Initializes Flask, binds configuration, connects SQLite via SQLAlchemy,
    enables CORS, registers blueprints, seeds tables, and sets up error handlers.
    """
    app = Flask(__name__)

    # 1. Load Environment Configuration
    if not config_name:
        config_name = os.environ.get("FLASK_CONFIG", "development")

    config_class = config_by_name.get(config_name, config_by_name["default"])
    app.config.from_object(config_class)

    # 2. Initialize Extensions
    db.init_app(app)

    # 3. Enable CORS for all API routes
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"]
    )

    # 4. Register Health-Check Endpoint
    @app.route("/api/health", methods=["GET"])
    def health_check():
        """
        Health check endpoint verifying system availability,
        database connectivity, and server uptime.
        """
        db_status = "connected"
        hospital_count = 0
        clinic_count = 0
        try:
            hospital_count = Hospital.query.count()
            clinic_count = Clinic.query.count()
        except Exception as e:
            db_status = f"degraded: {str(e)}"

        return jsonify({
            "status": "healthy" if db_status == "connected" else "degraded",
            "service": "Smart Hospital Bed and Medical Resource Platform",
            "database": db_status,
            "engine": "SQLite",
            "environment": config_name,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "statistics": {
                "hospitals": hospital_count,
                "clinics": clinic_count
            }
        }), 200

    # 5. Register RESTful Blueprints
    app.register_blueprint(hospital_bp)
    app.register_blueprint(clinic_bp)

    # 6. Register Global Error Handlers
    register_error_handlers(app)

    # 7. Create Database Tables Automatically
    with app.app_context():
        db.create_all()
        try:
            seed_initial_data()
        except Exception:
            db.session.rollback()

    return app


if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
