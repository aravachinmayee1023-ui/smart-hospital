"""
GeoJSON Blueprint: Provides spatial location endpoints for mapping and GIS consumers.
Outputs standard RFC 7946 FeatureCollection structures.
"""
from flask import Blueprint, request, jsonify
from backend.models import Facility
from backend.services.geo_service import GeoService
from backend.schemas.validators import validate_proximity_query

geojson_bp = Blueprint("geojson", __name__, url_prefix="/api/v1/geojson")


@geojson_bp.route("/facilities", methods=["GET"])
def get_all_facilities_geojson():
    """
    Returns all active facilities formatted as a standard GeoJSON FeatureCollection.
    Useful for populating GIS maps, Leaflet, Mapbox, or Google Maps layers.
    """
    facilities = Facility.query.filter_by(is_active=True).all()
    
    # Pack with dummy distance 0 or None
    tuples = [(f, None) for f in facilities]
    feature_collection = GeoService.to_feature_collection(tuples)

    return jsonify(feature_collection), 200


@geojson_bp.route("/nearby", methods=["GET"])
def get_nearby_facilities_geojson():
    """
    Radius / Proximity search returning a GeoJSON FeatureCollection ordered by distance.
    Query parameters:
      - lat: Origin latitude (-90 to 90)
      - lng: Origin longitude (-180 to 180)
      - radius_km: Search radius in kilometers (default 25.0)
      - type: HOSPITAL or CLINIC (optional)
      - emergency_status: NORMAL, ELEVATED, CRITICAL, DIVERTING (optional)
      - has_emergency: true or false (optional)
    """
    params = validate_proximity_query(request.args)
    
    filters = {}
    if "type" in request.args:
        filters["facility_type"] = request.args.get("type")
    if "emergency_status" in request.args:
        filters["emergency_status"] = request.args.get("emergency_status")
    if "has_emergency" in request.args:
        filters["has_emergency_dept"] = request.args.get("has_emergency").lower() in ["true", "1", "yes"]

    results = GeoService.find_nearby_facilities(
        lat=params["lat"],
        lon=params["lng"],
        radius_km=params["radius_km"],
        filters=filters
    )

    feature_collection = GeoService.to_feature_collection(results)
    feature_collection["metadata"]["origin"] = {
        "latitude": params["lat"],
        "longitude": params["lng"],
        "radius_km": params["radius_km"]
    }

    return jsonify(feature_collection), 200
