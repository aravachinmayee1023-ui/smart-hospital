"""
GeoJSON Service Module
Smart Hospital Bed and Medical Resource Platform

Provides RFC 7946 compliant GeoJSON serialization for Hospital facilities.
Ensures coordinates strictly adhere to:
    [longitude, latitude] (WGS84 EPSG:4326)

Includes:
- Robust coordinate validation (missing, null, NaN, out-of-range checks)
- Exact Feature structure matching platform requirements
- Graceful skipping / logging of malformed records
- Detailed error handling and reporting
"""
import math
import logging
from typing import List, Dict, Any, Optional, Tuple

logger = logging.getLogger(__name__)


class InvalidCoordinateError(ValueError):
    """Raised when facility geographic coordinates are missing or fall outside valid WGS84 bounds."""
    pass


class GeoJSONService:
    """Service to validate and convert SQLAlchemy Hospital models to GeoJSON."""

    @staticmethod
    def validate_coordinates(latitude: Any, longitude: Any) -> Tuple[bool, Optional[str], Optional[float], Optional[float]]:
        """
        Validate latitude and longitude values according to WGS84 standards.

        Rules:
        - Must not be None
        - Must be convertible to float
        - Must not be NaN or Infinite
        - Latitude must be between -90.0 and +90.0
        - Longitude must be between -180.0 and +180.0

        Returns:
            Tuple of (is_valid, error_message, parsed_lat, parsed_lon)
        """
        if latitude is None or longitude is None:
            return False, "Coordinates cannot be null or missing (both latitude and longitude required).", None, None

        try:
            lat = float(latitude)
            lon = float(longitude)
        except (ValueError, TypeError):
            return False, f"Coordinates must be valid numbers. Got latitude='{latitude}', longitude='{longitude}'.", None, None

        if math.isnan(lat) or math.isnan(lon) or math.isinf(lat) or math.isinf(lon):
            return False, f"Coordinates cannot be NaN or Infinite. Got lat={lat}, lon={lon}.", None, None

        if not (-90.0 <= lat <= 90.0):
            return False, f"Latitude {lat} is out of bounds. Must be between -90.0 and 90.0 degrees.", None, None

        if not (-180.0 <= lon <= 180.0):
            return False, f"Longitude {lon} is out of bounds. Must be between -180.0 and 180.0 degrees.", None, None

        return True, None, lat, lon

    @classmethod
    def hospital_to_feature(cls, hospital: Any, strict: bool = False) -> Optional[Dict[str, Any]]:
        """
        Convert a single Hospital SQLAlchemy record into a standard GeoJSON Feature.

        Structure:
        {
          "type": "Feature",
          "properties": {
            "id": 1,
            "name": "City Care Hospital",
            "type": "Hospital",
            "beds": 150,
            "specialties": "Cardiology",
            "emergency": true
          },
          "geometry": {
            "type": "Point",
            "coordinates": [longitude, latitude]  # NOTE: Longitude first!
          }
        }
        """
        lat_val = getattr(hospital, "latitude", None)
        lon_val = getattr(hospital, "longitude", None)

        is_valid, err_msg, parsed_lat, parsed_lon = cls.validate_coordinates(lat_val, lon_val)
        if not is_valid:
            facility_id = getattr(hospital, "id", "Unknown")
            facility_name = getattr(hospital, "name", "Unnamed")
            msg = f"Hospital ID {facility_id} ('{facility_name}') has invalid coordinates: {err_msg}"
            logger.warning(msg)
            if strict:
                raise InvalidCoordinateError(msg)
            return None

        # Build properties
        specialties_raw = getattr(hospital, "specialties", "")
        if isinstance(specialties_raw, list):
            specialties_str = ", ".join(str(s).strip() for s in specialties_raw if s)
        elif specialties_raw is not None:
            specialties_str = str(specialties_raw).strip()
        else:
            specialties_str = ""

        # Emergency boolean normalization
        raw_emg = getattr(hospital, "emergency", True)
        if isinstance(raw_emg, str):
            emergency_bool = raw_emg.strip().lower() in ("true", "1", "yes")
        else:
            emergency_bool = bool(raw_emg)

        return {
            "type": "Feature",
            "properties": {
                "id": int(hospital.id),
                "name": str(hospital.name),
                "type": str(getattr(hospital, "type", "Hospital")),
                "beds": int(getattr(hospital, "beds", 0)),
                "specialties": specialties_str,
                "emergency": emergency_bool
            },
            "geometry": {
                "type": "Point",
                # RFC 7946 Standard: [longitude, latitude]
                "coordinates": [parsed_lon, parsed_lat]
            }
        }

    @classmethod
    def hospitals_to_feature_collection(cls, hospitals: List[Any], strict: bool = False) -> Dict[str, Any]:
        """
        Convert a list or query result of Hospital records into a GeoJSON FeatureCollection.
        
        Args:
            hospitals: Iterable of SQLAlchemy Hospital models
            strict: If True, raises InvalidCoordinateError on any invalid record;
                    If False, skips invalid records safely.
        """
        features: List[Dict[str, Any]] = []
        for hospital in hospitals:
            feature = cls.hospital_to_feature(hospital, strict=strict)
            if feature is not None:
                features.append(feature)

        return {
            "type": "FeatureCollection",
            "features": features
        }

    # Backward-compatible alias
    @classmethod
    def to_feature_collection(cls, facilities: List[Any], facility_type: str = "Hospital") -> Dict[str, Any]:
        """Backward-compatible wrapper for FeatureCollection generation."""
        return cls.hospitals_to_feature_collection(facilities, strict=False)
