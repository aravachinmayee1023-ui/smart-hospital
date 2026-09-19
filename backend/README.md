# Smart Hospital Bed & Medical Resource Platform (Flask Backend)

Senior Backend Architecture design and implementation using Python Flask, SQLite, Flask-SQLAlchemy, Flask-CORS, and GeoJSON (RFC 7946).

---

## 1. Prerequisites & Quick Start

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the development server
python app.py
```

The server binds to `http://127.0.0.1:5000` and automatically:
- Creates the SQLite database (`hospital_platform.db`)
- Applies table constraints, foreign keys, and indexes
- Seeds initial hospital, clinic, bed, and emergency medical resource data

---

## 2. API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/facilities` | Search & filter facilities (by type, beds, emergency status) |
| `POST` | `/api/v1/facilities` | Register a new hospital or clinic with beds & resources |
| `GET` | `/api/v1/facilities/<id>` | Full facility details, inventory breakdown, contacts |
| `PUT` | `/api/v1/facilities/<id>` | Update facility profile and metadata |
| `DELETE` | `/api/v1/facilities/<id>` | Soft delete / deactivate facility |
| `GET` | `/api/v1/facilities/<id>/beds` | List departmental bed capacities and occupancy |
| `POST` | `/api/v1/facilities/<id>/beds/allocate` | Atomically admit patient & allocate bed (ICU/General/Ventilator) |
| `POST` | `/api/v1/facilities/<id>/beds/release` | Atomically discharge patient & release bed |
| `PATCH` | `/api/v1/facilities/<id>/beds/<type>` | Adjust ward capacity or occupied count |
| `GET` | `/api/v1/facilities/<id>/beds/audit-logs` | Audit trail of historical bed allocation operations |
| `GET` | `/api/v1/geojson/facilities` | RFC 7946 GeoJSON FeatureCollection of all facilities |
| `GET` | `/api/v1/geojson/nearby` | Spatial proximity search (`lat`, `lng`, `radius_km`) |
| `GET` | `/api/v1/emergency/summary` | Regional triage metrics, diversion alerts, ambulance counts |
| `PATCH` | `/api/v1/emergency/facilities/<id>/status` | Update hospital triage/diversion status |
