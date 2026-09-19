"""
Geospatial calculation and GeoJSON serialization service.
Implements the Haversine formula and bounding-box spatial indexing for SQLite.
"""
import math
from backend.models import Facility


class GeoService:
    EARTH_RADIUS_KM = 6371.0

    @classmethod
    def calculate_haversine_distance(cls, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculates great-circle distance between two points on Earth using Haversine formula.
        Returns distance in kilometers.
        """
        d_lat = math.radians(lat2 - lat1)
        d_lon = math.radians(lon2 - lon1)
        
        a = (math.sin(d_lat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(d_lon / 2) ** 2)
        
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return cls.EARTH_RADIUS_KM * c

    @classmethod
    def get_bounding_box(cls, lat: float, lon: float, radius_km: float):
        """
        Calculates min/max latitude and longitude for bounding box query.
        Used to optimize SQLite queries before applying exact Haversine filtering.
        """
        delta_lat = radius_km / cls.EARTH_RADIUS_KM
        min_lat = lat - math.degrees(delta_lat)
        max_lat = lat + math.degrees(delta_lat)

        delta_lon = radius_km / (cls.EARTH_RADIUS_KM * math.cos(math.radians(lat)))
        min_lon = lon - math.degrees(delta_lon)
        max_lon = lon + math.degrees(delta_lon)

        return min_lat, max_lat, min_lon, max_lon

    @classmethod
    def find_nearby_facilities(cls, lat: float, lon: float, radius_km: float, filters=None):
        """
        Executes a 2-stage spatial search:
        Stage 1: Bounding-box SQL indexed query on SQLite.
        Stage 2: Exact spherical trigonometry (Haversine) filtering and distance sorting.
        """
        min_lat, max_lat, min_lon, max_lon = cls.get_bounding_box(lat, lon, radius_km)

        # Stage 1: Fast bounding box filter using SQLite indexed columns
        query = Facility.query.filter(
            Facility.is_active == True,
            Facility.latitude.between(min_lat, max_lat),
            Facility.longitude.between(min_lon, max_lon)
        )

        if filters:
            if filters.get("facility_type"):
                query = query.filter(Facility.facility_type == filters["facility_type"].upper())
            if filters.get("has_emergency_dept") is not None:
                query = query.filter(Facility.has_emergency_dept == filters["has_emergency_dept"])
            if filters.get("emergency_status"):
                query = query.filter(Facility.emergency_status == filters["emergency_status"].upper())

        candidates = query.all()

        # Stage 2: Exact distance calculation and radius pruning
        results = []
        for facility in candidates:
            dist = cls.calculate_haversine_distance(lat, lon, facility.latitude, facility.longitude)
            if dist <= radius_km:
                results.append((facility, dist))

        # Sort closest first
        results.sort(key=lambda x: x[1])
        return results

    @classmethod
    def to_feature_collection(cls, facility_distance_tuples):
        """
        Constructs a valid RFC 7946 GeoJSON FeatureCollection.
        """
        features = [
            facility.to_geojson_feature(distance_km=dist)
            for facility, dist in facility_distance_tuples
        ]
        return {
            "type": "FeatureCollection",
            "features": features,
            "metadata": {
                "total_count": len(features),
                "crs": {
                    "type": "name",
                    "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}
                }
            }
        }
