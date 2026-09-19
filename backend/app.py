"""
Application Factory module for Smart Hospital Bed & Medical Resource Platform.
Initializes extensions, registers Blueprints, configures CORS, and handles lifecycle.
"""
import os
from flask import Flask, jsonify
from flask_cors import CORS
from backend.config import config_by_name
from backend.models import db
from backend.errors import register_error_handlers
from backend.routes import facilities_bp, beds_bp, geojson_bp, emergency_bp
from backend.seeds.seed_data import seed_database


def create_app(config_name=None):
    """Factory pattern to create and configure the Flask application."""
    if config_name is None:
        config_name = os.environ.get("FLASK_ENV", "development")

    app = Flask(__name__)
    app.config.from_object(config_by_name.get(config_name, config_by_name["default"]))

    # 1. Initialize Cross-Origin Resource Sharing (CORS)
    CORS(
        app,
        resources={r"/api/*": {"origins": app.config.get("CORS_ORIGINS", "*")}},
        supports_credentials=True,
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"]
    )

    # 2. Initialize SQLAlchemy ORM with SQLite
    db.init_app(app)

    # 3. Register Centralized Error Handlers
    register_error_handlers(app)

    # 4. Register Modular Blueprints
    app.register_blueprint(facilities_bp)
    app.register_blueprint(beds_bp)
    app.register_blueprint(geojson_bp)
    app.register_blueprint(emergency_bp)

    # 5. Base Health Check and Discovery Route
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "HEALTHY",
            "service": "Smart Hospital Bed & Medical Resource Platform API",
            "version": "1.0.0",
            "engine": "Python Flask + SQLite + GeoJSON",
            "endpoints": {
                "facilities": "/api/v1/facilities",
                "beds": "/api/v1/facilities/<id>/beds",
                "geojson_facilities": "/api/v1/geojson/facilities",
                "geojson_nearby": "/api/v1/geojson/nearby",
                "emergency_summary": "/api/v1/emergency/summary"
            }
        }), 200

    # 6. Database schema bootstrap and initial seeder
    with app.app_context():
        db.create_all()
        seed_database()

    return app


if __name__ == "__main__":
    app = create_app("development")
    port = int(os.environ.get("BACKEND_PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
