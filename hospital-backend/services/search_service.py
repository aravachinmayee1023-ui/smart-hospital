"""
Search & Spatial Query Service
Smart Hospital Bed and Medical Resource Platform

Provides:
- Dedicated case-insensitive search on Hospital name AND address using SQLAlchemy ilike
- Multi-criteria filtering (beds bounds, emergency flag, sorting)
- Great-circle Haversine geospatial radius distance queries
"""
import math
from typing import Type, List, Dict, Any, Optional
from sqlalchemy import or_


class SearchService:
    """Service providing text search, filtering, and geographic radius calculations."""

    @staticmethod
    def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate the great-circle distance between two points on Earth (in kilometers)
        using the spherical Haversine formula.
        """
        R = 6371.0  # Earth's mean radius in kilometers
        d_lat = math.radians(lat2 - lat1)
        d_lon = math.radians(lon2 - lon1)
        a = (
            math.sin(d_lat / 2.0) ** 2
            + math.cos(math.radians(lat1))
            * math.cos(math.radians(lat2))
            * math.sin(d_lon / 2.0) ** 2
        )
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return round(R * c, 2)

    @classmethod
    def search_hospitals(
        cls,
        model_class: Type,
        query_text: str,
        limit: Optional[int] = None,
        offset: Optional[int] = None
    ) -> List[Any]:
        """
        Perform case-insensitive SQL query searching both hospital 'name' AND 'address'.
        
        Uses SQLAlchemy `or_` with `ilike` expressions:
            WHERE LOWER(hospitals.name) LIKE '%query%' OR LOWER(hospitals.address) LIKE '%query%'

        Special characters are treated safely within the SQLAlchemy parameter binding.
        """
        # Escape SQL LIKE wildcard characters to prevent pattern injection
        clean_text = query_text.strip()
        escaped_text = clean_text.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
        search_pattern = f"%{escaped_text}%"

        query = model_class.query.filter(
            or_(
                model_class.name.ilike(search_pattern, escape="\\"),
                model_class.address.ilike(search_pattern, escape="\\")
            )
        ).order_by(model_class.name.asc())

        if offset is not None and offset > 0:
            query = query.offset(offset)
        if limit is not None and limit > 0:
            query = query.limit(limit)

        return query.all()

    @classmethod
    def filter_facilities(
        cls,
        model_class: Type,
        query_text: Optional[str] = None,
        facility_type: Optional[str] = None,
        min_beds: Optional[int] = None,
        max_beds: Optional[int] = None,
        emergency_only: Optional[bool] = None,
        emergency: Optional[bool] = None,
        near_lat: Optional[float] = None,
        near_lng: Optional[float] = None,
        radius_km: Optional[float] = None,
        sort_by: str = "name",
        order: str = "asc"
    ) -> List[Dict[str, Any]]:
        """
        Apply SQL-level filters and post-query geospatial filtering.
        Supports:
        - facility_type: filter by type (case-insensitive substring or exact match)
        - min_beds: minimum number of beds
        - max_beds: maximum number of beds
        - emergency: boolean filter (True or False)
        - query_text: text search across fields
        - geospatial Haversine radius
        Returns serialized dictionary representations with optional 'distance_km'.
        """
        query = model_class.query

        # 1. Text Search across name, address, specialties, and type
        if query_text and query_text.strip():
            term = f"%{query_text.strip()}%"
            query = query.filter(
                or_(
                    model_class.name.ilike(term),
                    model_class.address.ilike(term),
                    model_class.type.ilike(term),
                    model_class.specialties.ilike(term)
                )
            )

        # 2. Facility Type Filter
        if facility_type and facility_type.strip():
            type_term = f"%{facility_type.strip()}%"
            query = query.filter(model_class.type.ilike(type_term))

        # 3. Bed Capacity Constraints
        if min_beds is not None:
            query = query.filter(model_class.beds >= min_beds)
        if max_beds is not None:
            query = query.filter(model_class.beds <= max_beds)

        # 4. Emergency Filter (supports both True and False)
        if emergency is not None:
            query = query.filter(model_class.emergency.is_(emergency))
        elif emergency_only is True:
            query = query.filter(model_class.emergency.is_(True))

        records = query.all()
        results: List[Dict[str, Any]] = []

        # 5. Geospatial Distance Enrichment & Radius Filter
        has_geo_origin = (near_lat is not None and near_lng is not None)

        for rec in records:
            data = rec.to_dict()
            if has_geo_origin:
                dist = cls.haversine_distance_km(near_lat, near_lng, rec.latitude, rec.longitude)
                data["distance_km"] = dist
                if radius_km is not None and dist > radius_km:
                    continue
            results.append(data)

        # 5. Sorting
        reverse = (order.lower() == "desc")
        if sort_by == "distance" and has_geo_origin:
            results.sort(key=lambda x: x.get("distance_km", 999999), reverse=reverse)
        elif sort_by == "beds":
            results.sort(key=lambda x: x.get("beds", 0), reverse=reverse)
        else:
            results.sort(key=lambda x: str(x.get("name", "")).lower(), reverse=reverse)

        return results
