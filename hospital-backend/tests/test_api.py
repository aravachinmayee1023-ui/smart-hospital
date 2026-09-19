"""
Comprehensive Test Suite for Smart Hospital Bed & Medical Resource Platform
Tests:
- Health check (/api/health)
- Hospital CRUD operations and validations
- Clinic CRUD operations and validations
- GeoJSON FeatureCollection outputs
- Search & Radius filters
- Error handling (400, 404, 422)
"""
import unittest
import json
import os
import sys

# Ensure hospital-backend directory is on python import path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app import create_app
from database import db
from models.hospital import Hospital
from models.clinic import Clinic


class HospitalPlatformTestCase(unittest.TestCase):
    """Test suite covering API routes, models, and error handlers."""

    def setUp(self):
        """Set up testing app and fresh in-memory database before every test."""
        self.app = create_app(config_name="testing")
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.create_all()

    def tearDown(self):
        """Tear down database and pop context after each test."""
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def test_health_check(self):
        """Test GET /api/health endpoint returns 200 and healthy status."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data.get("status"), "healthy")
        self.assertEqual(data.get("service"), "Smart Hospital Bed and Medical Resource Platform")
        self.assertEqual(data.get("database"), "connected")
        self.assertIn("timestamp", data)

    def test_create_and_get_hospital(self):
        """Test creating a hospital via POST /api/hospitals and retrieving it."""
        payload = {
            "name": "Mercy General Medical Center",
            "type": "General Hospital",
            "address": "500 Healthcare Way, San Francisco, CA",
            "beds": 220,
            "latitude": 37.7749,
            "longitude": -122.4194,
            "specialties": "Emergency, ICU, Cardiology",
            "emergency": True
        }
        create_res = self.client.post(
            "/api/hospitals",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(create_res.status_code, 201)
        created_data = create_res.get_json()
        self.assertIn("data", created_data)
        hospital_id = created_data["data"]["id"]

        # Fetch hospital by ID
        get_res = self.client.get(f"/api/hospitals/{hospital_id}")
        self.assertEqual(get_res.status_code, 200)
        hospital_data = get_res.get_json()["data"]
        self.assertEqual(hospital_data["name"], "Mercy General Medical Center")
        self.assertEqual(hospital_data["beds"], 220)

    def test_hospital_validation_negative_beds(self):
        """Test that submitting negative beds triggers 422 Unprocessable Entity."""
        payload = {
            "name": "Faulty Bed Hospital",
            "address": "123 Error Lane",
            "beds": -10,
            "latitude": 37.77,
            "longitude": -122.42
        }
        res = self.client.post(
            "/api/hospitals",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, 422)
        err = res.get_json()
        self.assertEqual(err.get("error"), "Validation Error")

    def test_hospital_validation_invalid_coordinates(self):
        """Test that invalid latitude (> 90) triggers 422 Unprocessable Entity."""
        payload = {
            "name": "North Pole Hospital",
            "address": "Extreme North Blvd",
            "beds": 50,
            "latitude": 98.4,
            "longitude": -122.42
        }
        res = self.client.post(
            "/api/hospitals",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, 422)

    def test_clinic_crud(self):
        """Test creating, reading, and updating a clinic."""
        payload = {
            "name": "Civic Center Urgent Clinic",
            "type": "Urgent Care Clinic",
            "address": "800 Polk St, San Francisco, CA",
            "beds": 6,
            "latitude": 37.7810,
            "longitude": -122.4180,
            "specialties": "Triage, Urgent Care",
            "emergency": False
        }
        res = self.client.post(
            "/api/clinics",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, 201)
        clinic_id = res.get_json()["data"]["id"]

        # Update clinic beds
        update_res = self.client.put(
            f"/api/clinics/{clinic_id}",
            data=json.dumps({"beds": 12}),
            content_type="application/json"
        )
        self.assertEqual(update_res.status_code, 200)
        self.assertEqual(update_res.get_json()["data"]["beds"], 12)

    def test_geojson_endpoints(self):
        """Test RFC 7946 GeoJSON FeatureCollection endpoints."""
        # Create a sample hospital to test GeoJSON coordinates ordering
        h_payload = {
            "name": "City Care Hospital",
            "type": "Hospital",
            "address": "Hyderabad",
            "beds": 150,
            "latitude": 17.3850,
            "longitude": 78.4867,
            "specialties": "Cardiology",
            "emergency": True
        }
        self.client.post("/api/hospitals", data=json.dumps(h_payload), content_type="application/json")

        res_hospitals = self.client.get("/api/hospitals/geojson")
        self.assertEqual(res_hospitals.status_code, 200)
        data_h = res_hospitals.get_json()
        self.assertEqual(data_h.get("type"), "FeatureCollection")
        self.assertIn("features", data_h)
        self.assertTrue(len(data_h["features"]) > 0)

        # Verify GeoJSON structure for the hospital
        feature = next((f for f in data_h["features"] if f["properties"]["name"] == "City Care Hospital"), None)
        self.assertIsNotNone(feature)
        self.assertEqual(feature["type"], "Feature")
        self.assertEqual(feature["geometry"]["type"], "Point")
        # Ensure longitude is FIRST, latitude is SECOND: [78.4867, 17.3850]
        self.assertEqual(feature["geometry"]["coordinates"], [78.4867, 17.3850])
        self.assertEqual(feature["properties"]["beds"], 150)
        self.assertEqual(feature["properties"]["emergency"], True)
        self.assertEqual(feature["properties"]["type"], "Hospital")

        res_clinics = self.client.get("/api/clinics/geojson")
        self.assertEqual(res_clinics.status_code, 200)
        data_c = res_clinics.get_json()
        self.assertEqual(data_c.get("type"), "FeatureCollection")

    def test_not_found_error_handler(self):
        """Test 404 Not Found error handler format."""
        res = self.client.get("/api/hospitals/999999")
        self.assertEqual(res.status_code, 404)
        data = res.get_json()
        self.assertEqual(data.get("error"), "Not Found")
        self.assertEqual(data.get("status_code"), 404)

    def test_hospital_search_by_name_and_address(self):
        """Test case-insensitive search by hospital name and address."""
        payload = {
            "name": "Apollo Hospitals Jubilee Hills",
            "type": "Super Specialty Hospital",
            "address": "Road No 72, Jubilee Hills, Hyderabad",
            "beds": 350,
            "latitude": 17.4265,
            "longitude": 78.4116,
            "specialties": "Cardiology, Oncology",
            "emergency": True
        }
        self.client.post("/api/hospitals", data=json.dumps(payload), content_type="application/json")

        # Search by name (case-insensitive)
        res_name = self.client.get("/api/hospitals/search?q=apollo")
        self.assertEqual(res_name.status_code, 200)
        data_name = res_name.get_json()
        self.assertEqual(data_name["status"], "success")
        self.assertTrue(data_name["count"] >= 1)
        self.assertTrue(any("Apollo" in h["name"] for h in data_name["data"]))

        # Search by address (case-insensitive)
        res_addr = self.client.get("/api/hospitals/search?q=hyderabad")
        self.assertEqual(res_addr.status_code, 200)
        data_addr = res_addr.get_json()
        self.assertTrue(data_addr["count"] >= 1)
        self.assertTrue(any("Hyderabad" in h["address"] for h in data_addr["data"]))

    def test_hospital_search_no_matches(self):
        """Test search with no matches returns 200 and empty list."""
        res = self.client.get("/api/hospitals/search?q=nonexistenthospitalname999")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["count"], 0)
        self.assertEqual(data["data"], [])

    def test_hospital_search_missing_and_empty_q(self):
        """Test validation error 400 when 'q' is missing or whitespace."""
        # Missing 'q'
        res_missing = self.client.get("/api/hospitals/search")
        self.assertEqual(res_missing.status_code, 400)
        self.assertEqual(res_missing.get_json()["error"], "Bad Request")

        # Empty 'q'
        res_empty = self.client.get("/api/hospitals/search?q=")
        self.assertEqual(res_empty.status_code, 400)

        # Whitespace-only 'q'
        res_whitespace = self.client.get("/api/hospitals/search?q=%20%20%20")
        self.assertEqual(res_whitespace.status_code, 400)

    def test_filter_hospitals_by_type(self):
        """Test filtering hospitals by type (?type=Hospital)."""
        res = self.client.get("/api/hospitals?type=Hospital")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertIn("data", data)
        for h in data["data"]:
            self.assertIn("Hospital", h["type"])

    def test_filter_hospitals_by_beds_min(self):
        """Test filtering hospitals by minimum beds (?beds_min=100)."""
        res = self.client.get("/api/hospitals?beds_min=100")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        for h in data["data"]:
            self.assertGreaterEqual(h["beds"], 100)

    def test_filter_hospitals_by_emergency(self):
        """Test filtering hospitals by emergency availability (?emergency=true and ?emergency=false)."""
        # True
        res_true = self.client.get("/api/hospitals?emergency=true")
        self.assertEqual(res_true.status_code, 200)
        data_true = res_true.get_json()
        for h in data_true["data"]:
            self.assertTrue(h["emergency"])

        # False
        res_false = self.client.get("/api/hospitals?emergency=false")
        self.assertEqual(res_false.status_code, 200)
        data_false = res_false.get_json()
        for h in data_false["data"]:
            self.assertFalse(h["emergency"])

    def test_filter_hospitals_multiple_filters(self):
        """Test multiple filters together (?type=Hospital&beds_min=100&emergency=true)."""
        res = self.client.get("/api/hospitals?type=Hospital&beds_min=100&emergency=true")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        for h in data["data"]:
            self.assertIn("Hospital", h["type"])
            self.assertGreaterEqual(h["beds"], 100)
            self.assertTrue(h["emergency"])

    def test_filter_hospitals_no_matches(self):
        """Test filtering with criteria that yield no results (?beds_min=99999)."""
        res = self.client.get("/api/hospitals?beds_min=99999")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["count"], 0)
        self.assertEqual(data["data"], [])

    def test_filter_hospitals_invalid_beds_min(self):
        """Test validation error for negative or non-integer beds_min."""
        # Negative value
        res_neg = self.client.get("/api/hospitals?beds_min=-50")
        self.assertEqual(res_neg.status_code, 400)
        self.assertEqual(res_neg.get_json()["error"], "Bad Request")

        # Non-integer value
        res_alpha = self.client.get("/api/hospitals?beds_min=not_a_number")
        self.assertEqual(res_alpha.status_code, 400)
        self.assertEqual(res_alpha.get_json()["error"], "Bad Request")

    def test_filter_hospitals_invalid_emergency(self):
        """Test validation error for non-boolean emergency value."""
        res = self.client.get("/api/hospitals?emergency=maybe")
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.get_json()["error"], "Bad Request")


if __name__ == "__main__":
    unittest.main()
