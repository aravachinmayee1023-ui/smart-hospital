export type FacilityType = 'HOSPITAL' | 'CLINIC';

export type EmergencyStatus = 'NORMAL' | 'ELEVATED' | 'CRITICAL' | 'DIVERTING' | 'CLOSED';

export type BedType = 'ICU' | 'VENTILATOR' | 'GENERAL' | 'PEDIATRIC' | 'MATERNITY' | 'ISOLATION';

export interface BedItem {
  id: number;
  bed_type: BedType;
  total_capacity: number;
  occupied: number;
  available: number;
  department_name: string;
}

export interface ResourceItem {
  id: number;
  resource_type: string;
  current_stock: number;
  minimum_threshold: number;
  unit: string;
  is_critical: boolean;
}

export interface Facility {
  id: number;
  name: string;
  facility_type: FacilityType;
  license_number: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
  email?: string;
  latitude: number;
  longitude: number;
  has_emergency_dept: boolean;
  emergency_status: EmergencyStatus;
  operating_hours: string;
  is_active: boolean;
  beds: BedItem[];
  resources: ResourceItem[];
  distance_km?: number;
  summary: {
    total_beds: number;
    available_beds: number;
    occupied_beds: number;
    icu_available: number;
    ventilator_available: number;
    occupancy_rate_percent: number;
  };
}

export interface AuditLogItem {
  id: number;
  facility_id: number;
  facility_name?: string;
  bed_type: BedType;
  action: 'ALLOCATE' | 'RELEASE' | 'ADJUST';
  quantity_changed: number;
  resulting_occupied: number;
  resulting_available: number;
  operator_id: string;
  reason: string;
  timestamp: string;
}

export interface GeoJsonFeature {
  type: 'Feature';
  id: number;
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    id: number;
    name: string;
    facility_type: FacilityType;
    address: string;
    phone: string;
    emergency_status: EmergencyStatus;
    has_emergency_dept: boolean;
    total_beds: number;
    available_beds: number;
    icu_available: number;
    ventilator_available: number;
    occupancy_rate_percent: number;
    distance_km?: number;
  };
}

export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
  metadata: {
    total_count: number;
    crs: {
      type: 'name';
      properties: {
        name: string;
      };
    };
    origin?: {
      latitude: number;
      longitude: number;
      radius_km: number;
    };
  };
}

export interface ApiEndpointDoc {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  summary: string;
  category: 'Facilities' | 'Beds' | 'GeoJSON' | 'Emergency';
  description: string;
  queryParams?: { name: string; type: string; required: boolean; description: string }[];
  requestBody?: Record<string, any>;
  responseExample: Record<string, any>;
}
