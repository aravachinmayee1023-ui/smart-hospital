"""
Automated Pytest Suite for Smart Hospital Bed & Medical Resource Platform
Tests all 6 core categories with isolated in-memory SQLite:
1. API tests (GET, GET by ID, POST, PUT, DELETE)
2. GeoJSON tests (FeatureCollection, Feature, Point, [lon, lat] ordering)
3. Validation tests (Missing name, negative beds, lat/lng bounds, invalid types)
4. Direct Database tests (SQLAlchemy ORM create, read, update, delete)
5. Search tests (Name, address, case-insensitive, empty results)
6. Filter tests (Type, beds_min, emergency, combined)
"""
import json
import pytest
from database import db
from models.hospital import Hospital


# ==============================================================================
# 1. API CRUD TESTS
# ==============================================================================
class TestHospitalAPICRUD:
    """Test standard RESTful API endpoints for Hospital resource."""

    def test_get_hospitals_list(self, client, seeded_hospitals):
        """Test GET /api/hospitals returns 200 and list of hospitals."""
        response = client.get("/api/hospitals")
        assert response.status_code == 200

        data = response.get_json()
        assert data["status"] == "success"
        assert "data" in data
        assert isinstance(data["data"], list)
        assert data["count"] >= 3

    def test_get_hospital_by_id_success(self, client, sample_hospital):
        """Test GET /api/hospitals/<id> returns 200 with hospital details."""
        hospital_id = sample_hospital["id"]
        response = client.get(f"/api/hospitals/{hospital_id}")
        assert response.status_code == 200

        data = response.get_json()
        assert data["status"] == "success"
        assert data["data"]["id"] == hospital_id
        assert data["data"]["name"] == "City Care Hospital"

    def test_get_hospital_by_id_not_found(self, client):
        """Test GET /api/hospitals/<id> returns 404 when hospital does not exist."""
        response = client.get("/api/hospitals/999999")
        assert response.status_code == 404

        data = response.get_json()
        assert data["error"] == "Not Found"

    def test_post_hospital_success(self, client):
        """Test POST /api/hospitals creates a new hospital and returns 201."""
        new_payload = {
            "name": "St. Mary Medical Pavilion",
            "type": "General Hospital",
            "address": "777 Healthcare Blvd, San Francisco, CA",
            "beds": 120,
            "latitude": 37.7833,
            "longitude": -122.4167,
            "specialties": "Cardiology, Internal Medicine",
            "emergency": True
        }
        response = client.post(
            "/api/hospitals",
            data=json.dumps(new_payload),
            content_type="application/json"
        )
        assert response.status_code == 201

        data = response.get_json()
        assert data["status"] == "success"
        assert data["data"]["name"] == "St. Mary Medical Pavilion"
        assert data["data"]["beds"] == 120
        assert "id" in data["data"]

    def test_put_hospital_success(self, client, sample_hospital):
        """Test PUT /api/hospitals/<id> updates attributes and returns 200."""
        hospital_id = sample_hospital["id"]
        update_payload = {
            "beds": 225,
            "specialties": "Cardiology, Emergency Care, Critical Trauma"
        }
        response = client.put(
            f"/api/hospitals/{hospital_id}",
            data=json.dumps(update_payload),
            content_type="application/json"
        )
        assert response.status_code == 200

        data = response.get_json()
        assert data["status"] == "success"
        assert data["data"]["beds"] == 225
        assert "Critical Trauma" in data["data"]["specialties"]

    def test_put_hospital_not_found(self, client):
        """Test PUT /api/hospitals/<id> returns 404 when ID does not exist."""
        response = client.put(
            "/api/hospitals/999999",
            data=json.dumps({"beds": 50}),
            content_type="application/json"
        )
        assert response.status_code == 404

    def test_delete_hospital_success(self, client, sample_hospital):
        """Test DELETE /api/hospitals/<id> removes hospital and returns 200."""
        hospital_id = sample_hospital["id"]
        response = client.delete(f"/api/hospitals/{hospital_id}")
        assert response.status_code == 200

        data = response.get_json()
        assert data["status"] == "success"
        assert data["deleted_id"] == hospital_id

        # Verify hospital is deleted and cannot be fetched
        verify_resp = client.get(f"/api/hospitals/{hospital_id}")
        assert verify_resp.status_code == 404

    def test_delete_hospital_not_found(self, client):
        """Test DELETE /api/hospitals/<id> returns 404 when ID does not exist."""
        response = client.delete("/api/hospitals/999999")
        assert response.status_code == 404


# ==============================================================================
# 2. GEOJSON TESTS
# ==============================================================================
class TestHospitalGeoJSON:
    """Test RFC 7946 GeoJSON FeatureCollection generation and coordinate standards."""

    def test_geojson_feature_collection_structure(self, client, seeded_hospitals):
        """Test that the response is a valid GeoJSON FeatureCollection."""
        response = client.get("/api/hospitals/geojson")
        assert response.status_code == 200

        data = response.get_json()
        assert data["type"] == "FeatureCollection"
        assert "features" in data
        assert isinstance(data["features"], list)
        assert len(data["features"]) >= 3

    def test_geojson_feature_structure_and_properties(self, client, seeded_hospitals):
        """Test that individual features adhere to standard properties."""
        response = client.get("/api/hospitals/geojson")
        data = response.get_json()

        feature = data["features"][0]
        assert feature["type"] == "Feature"
        assert "properties" in feature
        assert "geometry" in feature

        props = feature["properties"]
        assert "id" in props
        assert "name" in props
        assert "beds" in props
        assert "specialties" in props
        assert "emergency" in props
        assert isinstance(props["emergency"], bool)

    def test_geojson_point_geometry(self, client, seeded_hospitals):
        """Test that geometry type is 'Point'."""
        response = client.get("/api/hospitals/geojson")
        data = response.get_json()

        for feature in data["features"]:
            assert feature["geometry"]["type"] == "Point"
            coords = feature["geometry"]["coordinates"]
            assert isinstance(coords, list)
            assert len(coords) == 2

    def test_geojson_longitude_latitude_coordinate_order(self, client, sample_hospital):
        """
        RFC 7946 Standard Verification:
        GeoJSON coordinates MUST be [longitude, latitude], NOT [latitude, longitude].
        """
        response = client.get("/api/hospitals/geojson")
        data = response.get_json()

        target = next((f for f in data["features"] if f["properties"]["name"] == "City Care Hospital"), None)
        assert target is not None

        coords = target["geometry"]["coordinates"]
        # Expected: longitude = -122.4194, latitude = 37.7749
        assert coords[0] == pytest.approx(-122.4194, rel=1e-3)  # Longitude first!
        assert coords[1] == pytest.approx(37.7749, rel=1e-3)    # Latitude second!


# ==============================================================================
# 3. VALIDATION TESTS
# ==============================================================================
class TestHospitalPayloadValidation:
    """Test payload validation rules and error responses (400, 422)."""

    def test_validation_missing_name(self, client):
        """Test validation failure when mandatory 'name' field is missing."""
        invalid_payload = {
            "address": "123 Main St",
            "beds": 50,
            "latitude": 37.7749,
            "longitude": -122.4194
        }
        response = client.post(
            "/api/hospitals",
            data=json.dumps(invalid_payload),
            content_type="application/json"
        )
        assert response.status_code == 422
        data = response.get_json()
        assert "validation_errors" in data
        assert any("name" in err.lower() for err in data["validation_errors"])

    def test_validation_negative_beds(self, client):
        """Test validation failure when 'beds' is a negative integer."""
        invalid_payload = {
            "name": "Invalid Beds Hospital",
            "address": "123 Main St",
            "beds": -25,
            "latitude": 37.7749,
            "longitude": -122.4194
        }
        response = client.post(
            "/api/hospitals",
            data=json.dumps(invalid_payload),
            content_type="application/json"
        )
        assert response.status_code == 422
        data = response.get_json()
        assert any("negative" in err.lower() for err in data["validation_errors"])

    def test_validation_invalid_latitude(self, client):
        """Test validation failure when latitude is out of [-90.0, 90.0] WGS84 range."""
        invalid_payload = {
            "name": "Invalid Lat Hospital",
            "address": "123 Main St",
            "beds": 50,
            "latitude": 125.0,  # Exceeds +90.0
            "longitude": -122.4194
        }
        response = client.post(
            "/api/hospitals",
            data=json.dumps(invalid_payload),
            content_type="application/json"
        )
        assert response.status_code == 422
        data = response.get_json()
        assert any("latitude" in err.lower() for err in data["validation_errors"])

    def test_validation_invalid_longitude(self, client):
        """Test validation failure when longitude is out of [-180.0, 180.0] range."""
        invalid_payload = {
            "name": "Invalid Lon Hospital",
            "address": "123 Main St",
            "beds": 50,
            "latitude": 37.7749,
            "longitude": 210.0  # Exceeds +180.0
        }
        response = client.post(
            "/api/hospitals",
            data=json.dumps(invalid_payload),
            content_type="application/json"
        )
        assert response.status_code == 422
        data = response.get_json()
        assert any("longitude" in err.lower() for err in data["validation_errors"])

    def test_validation_invalid_emergency_value(self, client):
        """Test validation failure when 'emergency' is not a recognizable boolean."""
        invalid_payload = {
            "name": "Invalid Emergency Hospital",
            "address": "123 Main St",
            "beds": 50,
            "latitude": 37.7749,
            "longitude": -122.4194,
            "emergency": "not_a_valid_bool"
        }
        response = client.post(
            "/api/hospitals",
            data=json.dumps(invalid_payload),
            content_type="application/json"
        )
        assert response.status_code == 422
        data = response.get_json()
        assert any("emergency" in err.lower() for err in data["validation_errors"])

    def test_validation_invalid_request_data_not_json(self, client):
        """Test 400 Bad Request when Content-Type is not application/json."""
        response = client.post(
            "/api/hospitals",
            data="not a json string",
            content_type="text/plain"
        )
        assert response.status_code == 400
        data = response.get_json()
        assert data["error"] == "Bad Request"

    def test_validation_empty_request_body(self, client):
        """Test 400 Bad Request when JSON payload is empty or malformed."""
        response = client.post(
            "/api/hospitals",
            data="",
            content_type="application/json"
        )
        assert response.status_code == 400


# ==============================================================================
# 4. DATABASE DIRECT TESTS
# ==============================================================================
class TestHospitalDatabaseDirect:
    """Test direct SQLAlchemy ORM operations in an isolated in-memory database."""

    def test_db_create_hospital(self, app_ctx):
        """Test direct database insertion with SQLAlchemy."""
        h = Hospital(
            name="Direct DB Hospital",
            type="General Hospital",
            address="456 University Ave, Palo Alto, CA",
            beds=90,
            latitude=37.4419,
            longitude=-122.1430,
            specialties="Internal Medicine",
            emergency=False
        )
        db.session.add(h)
        db.session.commit()

        assert h.id is not None
        assert h.id > 0

    def test_db_read_hospital(self, app_ctx, sample_hospital):
        """Test querying database record by ID and by attribute."""
        hospital = Hospital.query.get(sample_hospital["id"])
        assert hospital is not None
        assert hospital.name == "City Care Hospital"
        assert hospital.beds == 150
        assert hospital.emergency is True

    def test_db_update_hospital(self, app_ctx, sample_hospital):
        """Test modifying attributes and committing to database."""
        hospital = Hospital.query.get(sample_hospital["id"])
        hospital.beds = 300
        hospital.address = "Updated New Address, San Francisco"
        db.session.commit()

        # Re-query fresh from DB
        updated = Hospital.query.get(sample_hospital["id"])
        assert updated.beds == 300
        assert updated.address == "Updated New Address, San Francisco"

    def test_db_delete_hospital(self, app_ctx, sample_hospital):
        """Test deleting a record using SQLAlchemy session."""
        hospital_id = sample_hospital["id"]
        hospital = Hospital.query.get(hospital_id)
        assert hospital is not None

        db.session.delete(hospital)
        db.session.commit()

        # Verify deletion
        assert Hospital.query.get(hospital_id) is None


# ==============================================================================
# 5. SEARCH TESTS
# ==============================================================================
class TestHospitalSearch:
    """Test text search endpoint GET /api/hospitals/search?q="""

    def test_search_by_name(self, client, seeded_hospitals):
        """Test finding hospital by name keyword."""
        response = client.get("/api/hospitals/search?q=apollo")
        assert response.status_code == 200

        data = response.get_json()
        assert data["status"] == "success"
        assert data["count"] >= 1
        assert any("Apollo" in h["name"] for h in data["data"])

    def test_search_by_address(self, client, seeded_hospitals):
        """Test finding hospital by address location keyword."""
        response = client.get("/api/hospitals/search?q=jubilee")
        assert response.status_code == 200

        data = response.get_json()
        assert data["count"] >= 1
        assert any("Jubilee Hills" in h["address"] for h in data["data"])

    def test_search_case_insensitive(self, client, seeded_hospitals):
        """Test that search matches regardless of uppercase or lowercase query."""
        resp_lower = client.get("/api/hospitals/search?q=trauma")
        resp_upper = client.get("/api/hospitals/search?q=TRAUMA")
        resp_mixed = client.get("/api/hospitals/search?q=TrAuMa")

        assert resp_lower.status_code == 200
        assert resp_upper.status_code == 200
        assert resp_mixed.status_code == 200

        data_lower = resp_lower.get_json()
        data_upper = resp_upper.get_json()
        assert data_lower["count"] == data_upper["count"]
        assert data_lower["count"] >= 1

    def test_search_no_matching_results(self, client, seeded_hospitals):
        """Test search with no matches returns 200 OK with an empty array."""
        response = client.get("/api/hospitals/search?q=nonexistenthospitalkeyword999")
        assert response.status_code == 200

        data = response.get_json()
        assert data["status"] == "success"
        assert data["count"] == 0
        assert data["data"] == []

    def test_search_missing_q_parameter(self, client):
        """Test that omitting 'q' parameter returns 400 Bad Request."""
        response = client.get("/api/hospitals/search")
        assert response.status_code == 400
        data = response.get_json()
        assert data["error"] == "Bad Request"


# ==============================================================================
# 6. FILTER TESTS
# ==============================================================================
class TestHospitalFilters:
    """Test query filtering via GET /api/hospitals?type=&beds_min=&emergency="""

    def test_filter_by_type(self, client, seeded_hospitals):
        """Test filtering by hospital type (e.g. 'Trauma Center')."""
        response = client.get("/api/hospitals?type=Trauma")
        assert response.status_code == 200

        data = response.get_json()
        assert data["count"] >= 1
        for h in data["data"]:
            assert "Trauma" in h["type"]

    def test_filter_by_minimum_beds(self, client, seeded_hospitals):
        """Test filtering by beds_min threshold."""
        response = client.get("/api/hospitals?beds_min=200")
        assert response.status_code == 200

        data = response.get_json()
        assert data["count"] >= 2
        for h in data["data"]:
            assert h["beds"] >= 200

    def test_filter_by_emergency_availability(self, client, seeded_hospitals):
        """Test filtering by emergency=true and emergency=false."""
        # True: Emergency facilities only
        resp_true = client.get("/api/hospitals?emergency=true")
        assert resp_true.status_code == 200
        data_true = resp_true.get_json()
        assert data_true["count"] >= 2
        for h in data_true["data"]:
            assert h["emergency"] is True

        # False: Non-emergency facilities
        resp_false = client.get("/api/hospitals?emergency=false")
        assert resp_false.status_code == 200
        data_false = resp_false.get_json()
        assert data_false["count"] >= 1
        for h in data_false["data"]:
            assert h["emergency"] is False

    def test_filter_combined(self, client, seeded_hospitals):
        """Test combining type, beds_min, and emergency parameters together."""
        # Query: type=Super Specialty, beds_min=300, emergency=true
        response = client.get("/api/hospitals?type=Super&beds_min=300&emergency=true")
        assert response.status_code == 200

        data = response.get_json()
        assert data["count"] == 1
        record = data["data"][0]
        assert "Apollo" in record["name"]
        assert record["beds"] >= 300
        assert record["emergency"] is True

    def test_filter_invalid_beds_min_rejected(self, client):
        """Test that negative beds_min returns 400 Bad Request."""
        response = client.get("/api/hospitals?beds_min=-100")
        assert response.status_code == 400
        data = response.get_json()
        assert data["error"] == "Bad Request"

    def test_filter_invalid_emergency_rejected(self, client):
        """Test that invalid emergency string returns 400 Bad Request."""
        response = client.get("/api/hospitals?emergency=maybe")
        assert response.status_code == 400
        data = response.get_json()
        assert data["error"] == "Bad Request"
