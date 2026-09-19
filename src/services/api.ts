/**
 * API Service for Smart Hospital Bed and Medical Resource Platform
 * Connects frontend directly to the REST endpoints:
 * - GET /api/hospitals
 * - GET /api/hospitals/<id>
 * - GET /api/hospitals/search?q=
 * - GET /api/hospitals/geojson
 * - GET /api/hospitals?type=&beds_min=&emergency=
 * - GET /api/clinics
 * - GET /api/clinics/<id>
 * - GET /api/clinics/geojson
 * - POST /api/hospitals
 * - PUT /api/hospitals/<id>
 */

export interface HospitalItem {
  id: number;
  name: string;
  type: string;
  address: string;
  beds: number;
  available_beds: number;
  latitude: number;
  longitude: number;
  specialties: string[];
  emergency: boolean;
  doctors?: {
    emergency_physicians: number;
    trauma_surgeons: number;
    icu_nurses: number;
    on_duty_total: number;
  };
  resources?: {
    icu_beds_available: number;
    ventilators_ready: number;
    oxygen_reserves_percent: number;
    blood_units_available: number;
  };
  phone?: string;
  distance_km?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ClinicItem {
  id: number;
  name: string;
  type: string;
  address: string;
  beds: number;
  available_beds: number;
  latitude: number;
  longitude: number;
  specialties: string[];
  emergency: boolean;
  doctors?: {
    family_physicians: number;
    triage_nurses: number;
    on_duty_total: number;
  };
  resources?: {
    observation_beds: number;
    rapid_test_kits: number;
    oxygen_concentrators: number;
  };
  phone?: string;
  distance_km?: number;
  created_at?: string;
  updated_at?: string;
}

export interface HospitalFilterParams {
  type?: string;
  beds_min?: number;
  emergency?: boolean | string;
  q?: string;
  lat?: number;
  lng?: number;
  radius_km?: number;
  sort_by?: 'name' | 'beds' | 'distance';
  order?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  count?: number;
  data: T;
  filters_applied?: Record<string, any>;
  query?: string;
  message?: string;
  error?: string;
}

export interface GeoJsonPointFeature {
  type: 'Feature';
  id: string;
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    id: number;
    name: string;
    facility_type: string;
    subtype?: string;
    address: string;
    beds: number;
    available_beds?: number;
    emergency: boolean;
    specialties: string[];
    doctors?: Record<string, any>;
    resources?: Record<string, any>;
  };
}

export interface GeoJsonCollection {
  type: 'FeatureCollection';
  metadata: {
    generated_at: string;
    total_count: number;
    crs: string;
  };
  features: GeoJsonPointFeature[];
}

const API_BASE = '';

/**
 * 1. GET /api/hospitals with optional query params (?type=&beds_min=&emergency=&q=)
 */
export async function getHospitals(params?: HospitalFilterParams): Promise<ApiResponse<HospitalItem[]>> {
  const query = new URLSearchParams();

  if (params?.type && params.type !== 'ALL') {
    query.set('type', params.type);
  }
  if (params?.beds_min !== undefined && params.beds_min > 0) {
    query.set('beds_min', params.beds_min.toString());
  }
  if (params?.emergency !== undefined && params.emergency !== 'ALL') {
    query.set('emergency', params.emergency.toString());
  }
  if (params?.q && params.q.trim()) {
    query.set('q', params.q.trim());
  }
  if (params?.sort_by) {
    query.set('sort_by', params.sort_by);
  }
  if (params?.order) {
    query.set('order', params.order);
  }

  const queryString = query.toString();
  const url = `${API_BASE}/api/hospitals${queryString ? `?${queryString}` : ''}`;

  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || `API Error: ${res.status}`);
  }
  return res.json();
}

/**
 * 2. GET /api/hospitals/:id
 */
export async function getHospitalById(id: number): Promise<ApiResponse<HospitalItem>> {
  const res = await fetch(`${API_BASE}/api/hospitals/${id}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || `Hospital #${id} not found`);
  }
  return res.json();
}

/**
 * 3. GET /api/hospitals/search?q=
 */
export async function searchHospitals(q: string): Promise<ApiResponse<HospitalItem[]>> {
  const res = await fetch(`${API_BASE}/api/hospitals/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || `Search failed: ${res.status}`);
  }
  return res.json();
}

/**
 * 4. GET /api/hospitals/geojson
 */
export async function getHospitalGeoJson(): Promise<GeoJsonCollection> {
  const res = await fetch(`${API_BASE}/api/hospitals/geojson`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || `GeoJSON load failed: ${res.status}`);
  }
  return res.json();
}

/**
 * 5. GET /api/clinics
 */
export async function getClinics(params?: { q?: string; emergency?: boolean }): Promise<ApiResponse<ClinicItem[]>> {
  const query = new URLSearchParams();
  if (params?.q && params.q.trim()) {
    query.set('q', params.q.trim());
  }
  if (params?.emergency !== undefined) {
    query.set('emergency', params.emergency.toString());
  }
  const queryString = query.toString();
  const url = `${API_BASE}/api/clinics${queryString ? `?${queryString}` : ''}`;

  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || `Clinics fetch failed: ${res.status}`);
  }
  return res.json();
}

/**
 * 6. GET /api/clinics/geojson
 */
export async function getClinicGeoJson(): Promise<GeoJsonCollection> {
  const res = await fetch(`${API_BASE}/api/clinics/geojson`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || `Clinic GeoJSON fetch failed: ${res.status}`);
  }
  return res.json();
}

/**
 * 7. PUT /api/hospitals/:id (Update bed capacity or status)
 */
export async function updateHospital(id: number, updates: Partial<HospitalItem>): Promise<ApiResponse<HospitalItem>> {
  const res = await fetch(`${API_BASE}/api/hospitals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || `Update failed: ${res.status}`);
  }
  return res.json();
}
