import { Facility, ApiEndpointDoc, AuditLogItem } from '../types';

export const INITIAL_FACILITIES: Facility[] = [
  {
    id: 1,
    name: 'St. Jude Metropolitan Medical Center',
    facility_type: 'HOSPITAL',
    license_number: 'MED-CA-90811',
    address: '1200 Health Sciences Blvd',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94143',
    phone: '+1 (415) 555-0192',
    email: 'triage@stjudemetro.org',
    latitude: 37.7631,
    longitude: -122.4580,
    has_emergency_dept: true,
    emergency_status: 'NORMAL',
    operating_hours: '24/7',
    is_active: true,
    beds: [
      { id: 101, bed_type: 'ICU', total_capacity: 36, occupied: 28, available: 8, department_name: 'Intensive Care Unit' },
      { id: 102, bed_type: 'VENTILATOR', total_capacity: 24, occupied: 18, available: 6, department_name: 'Pulmonology' },
      { id: 103, bed_type: 'GENERAL', total_capacity: 220, occupied: 165, available: 55, department_name: 'Medical Surgical' },
      { id: 104, bed_type: 'PEDIATRIC', total_capacity: 40, occupied: 22, available: 18, department_name: 'Pediatrics' },
      { id: 105, bed_type: 'MATERNITY', total_capacity: 30, occupied: 19, available: 11, department_name: 'Labor & Delivery' }
    ],
    resources: [
      { id: 201, resource_type: 'OXYGEN_CYLINDERS', current_stock: 180, minimum_threshold: 30, unit: 'cylinders', is_critical: false },
      { id: 202, resource_type: 'AMBULANCES_ACTIVE', current_stock: 8, minimum_threshold: 2, unit: 'vehicles', is_critical: false },
      { id: 203, resource_type: 'BLOOD_UNITS_O_NEG', current_stock: 45, minimum_threshold: 15, unit: 'units', is_critical: false }
    ],
    summary: {
      total_beds: 350,
      available_beds: 98,
      occupied_beds: 252,
      icu_available: 8,
      ventilator_available: 6,
      occupancy_rate_percent: 72.0
    }
  },
  {
    id: 2,
    name: 'Mission Bay Children & Trauma Hospital',
    facility_type: 'HOSPITAL',
    license_number: 'MED-CA-88120',
    address: '1825 4th Street',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94158',
    phone: '+1 (415) 555-0244',
    email: 'er@missionbaytrauma.org',
    latitude: 37.7680,
    longitude: -122.3920,
    has_emergency_dept: true,
    emergency_status: 'NORMAL',
    operating_hours: '24/7',
    is_active: true,
    beds: [
      { id: 106, bed_type: 'ICU', total_capacity: 45, occupied: 39, available: 6, department_name: 'Pediatric ICU' },
      { id: 107, bed_type: 'VENTILATOR', total_capacity: 30, occupied: 24, available: 6, department_name: 'Trauma Resuscitation' },
      { id: 108, bed_type: 'GENERAL', total_capacity: 180, occupied: 140, available: 40, department_name: 'Inpatient Wards' },
      { id: 109, bed_type: 'PEDIATRIC', total_capacity: 85, occupied: 60, available: 25, department_name: 'Children Wing' }
    ],
    resources: [
      { id: 204, resource_type: 'OXYGEN_CYLINDERS', current_stock: 220, minimum_threshold: 40, unit: 'cylinders', is_critical: false },
      { id: 205, resource_type: 'AMBULANCES_ACTIVE', current_stock: 12, minimum_threshold: 3, unit: 'vehicles', is_critical: false }
    ],
    summary: {
      total_beds: 340,
      available_beds: 77,
      occupied_beds: 263,
      icu_available: 6,
      ventilator_available: 6,
      occupancy_rate_percent: 77.4
    }
  },
  {
    id: 3,
    name: 'Bay Area Community Urgent Clinic',
    facility_type: 'CLINIC',
    license_number: 'MED-CA-44219',
    address: '520 Castro Street',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94114',
    phone: '+1 (415) 555-0781',
    email: 'info@castroclinic.org',
    latitude: 37.7608,
    longitude: -122.4350,
    has_emergency_dept: false,
    emergency_status: 'NORMAL',
    operating_hours: '07:00 - 22:00',
    is_active: true,
    beds: [
      { id: 110, bed_type: 'GENERAL', total_capacity: 15, occupied: 8, available: 7, department_name: 'Observation Bay' },
      { id: 111, bed_type: 'PEDIATRIC', total_capacity: 6, occupied: 2, available: 4, department_name: 'Urgent Care' }
    ],
    resources: [
      { id: 206, resource_type: 'OXYGEN_CYLINDERS', current_stock: 25, minimum_threshold: 5, unit: 'cylinders', is_critical: false },
      { id: 207, resource_type: 'AMBULANCES_ACTIVE', current_stock: 2, minimum_threshold: 1, unit: 'vehicles', is_critical: false }
    ],
    summary: {
      total_beds: 21,
      available_beds: 11,
      occupied_beds: 10,
      icu_available: 0,
      ventilator_available: 0,
      occupancy_rate_percent: 47.6
    }
  },
  {
    id: 4,
    name: 'Pacific Heights General Hospital',
    facility_type: 'HOSPITAL',
    license_number: 'MED-CA-99341',
    address: '2333 Buchanan Street',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94115',
    phone: '+1 (415) 555-0912',
    email: 'intake@pacificgeneral.org',
    latitude: 37.7905,
    longitude: -122.4312,
    has_emergency_dept: true,
    emergency_status: 'DIVERTING',
    operating_hours: '24/7',
    is_active: true,
    beds: [
      { id: 112, bed_type: 'ICU', total_capacity: 28, occupied: 28, available: 0, department_name: 'Surgical ICU' },
      { id: 113, bed_type: 'VENTILATOR', total_capacity: 16, occupied: 16, available: 0, department_name: 'Critical Care' },
      { id: 114, bed_type: 'GENERAL', total_capacity: 150, occupied: 147, available: 3, department_name: 'Acute Care' }
    ],
    resources: [
      { id: 208, resource_type: 'OXYGEN_CYLINDERS', current_stock: 60, minimum_threshold: 20, unit: 'cylinders', is_critical: false },
      { id: 209, resource_type: 'AMBULANCES_ACTIVE', current_stock: 3, minimum_threshold: 2, unit: 'vehicles', is_critical: false }
    ],
    summary: {
      total_beds: 194,
      available_beds: 3,
      occupied_beds: 191,
      icu_available: 0,
      ventilator_available: 0,
      occupancy_rate_percent: 98.5
    }
  },
  {
    id: 5,
    name: 'Sunset District Family Care Clinic',
    facility_type: 'CLINIC',
    license_number: 'MED-CA-22904',
    address: '1940 Noriega St',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94122',
    phone: '+1 (415) 555-0331',
    email: 'sunsetcare@sfclinics.org',
    latitude: 37.7538,
    longitude: -122.4851,
    has_emergency_dept: false,
    emergency_status: 'NORMAL',
    operating_hours: '08:00 - 18:00',
    is_active: true,
    beds: [
      { id: 115, bed_type: 'GENERAL', total_capacity: 10, occupied: 3, available: 7, department_name: 'Day Observation' }
    ],
    resources: [
      { id: 210, resource_type: 'OXYGEN_CYLINDERS', current_stock: 12, minimum_threshold: 3, unit: 'cylinders', is_critical: false }
    ],
    summary: {
      total_beds: 10,
      available_beds: 7,
      occupied_beds: 3,
      icu_available: 0,
      ventilator_available: 0,
      occupancy_rate_percent: 30.0
    }
  },
  {
    id: 6,
    name: 'Oakland Highland Regional Medical',
    facility_type: 'HOSPITAL',
    license_number: 'MED-CA-77112',
    address: '1411 E 31st St',
    city: 'Oakland',
    state: 'CA',
    postal_code: '94602',
    phone: '+1 (510) 555-0810',
    email: 'intake@highlandhealth.org',
    latitude: 37.7995,
    longitude: -122.2312,
    has_emergency_dept: true,
    emergency_status: 'ELEVATED',
    operating_hours: '24/7',
    is_active: true,
    beds: [
      { id: 116, bed_type: 'ICU', total_capacity: 32, occupied: 29, available: 3, department_name: 'Neuro & Trauma ICU' },
      { id: 117, bed_type: 'VENTILATOR', total_capacity: 20, occupied: 17, available: 3, department_name: 'Respiratory Unit' },
      { id: 118, bed_type: 'GENERAL', total_capacity: 210, occupied: 188, available: 22, department_name: 'General Wards' },
      { id: 119, bed_type: 'PEDIATRIC', total_capacity: 25, occupied: 18, available: 7, department_name: 'Pediatric Ward' }
    ],
    resources: [
      { id: 211, resource_type: 'OXYGEN_CYLINDERS', current_stock: 140, minimum_threshold: 30, unit: 'cylinders', is_critical: false },
      { id: 212, resource_type: 'AMBULANCES_ACTIVE', current_stock: 6, minimum_threshold: 2, unit: 'vehicles', is_critical: false }
    ],
    summary: {
      total_beds: 287,
      available_beds: 35,
      occupied_beds: 252,
      icu_available: 3,
      ventilator_available: 3,
      occupancy_rate_percent: 87.8
    }
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 1,
    facility_id: 4,
    facility_name: 'Pacific Heights General Hospital',
    bed_type: 'ICU',
    action: 'ALLOCATE',
    quantity_changed: 1,
    resulting_occupied: 28,
    resulting_available: 0,
    operator_id: 'Dr. Evelyn Vance',
    reason: 'Critical cardiac arrest admission (divert alert triggered)',
    timestamp: '2026-09-17T21:40:00Z'
  },
  {
    id: 2,
    facility_id: 1,
    facility_name: 'St. Jude Metropolitan Medical Center',
    bed_type: 'GENERAL',
    action: 'RELEASE',
    quantity_changed: -2,
    resulting_occupied: 165,
    resulting_available: 55,
    operator_id: 'Nurse Miller',
    reason: 'Post-op recovery discharge to outpatient home care',
    timestamp: '2026-09-17T21:15:00Z'
  },
  {
    id: 3,
    facility_id: 2,
    facility_name: 'Mission Bay Children & Trauma Hospital',
    bed_type: 'VENTILATOR',
    action: 'ALLOCATE',
    quantity_changed: 2,
    resulting_occupied: 24,
    resulting_available: 6,
    operator_id: 'Dr. Michael Chen',
    reason: 'Severe pediatric asthma exacerbation',
    timestamp: '2026-09-17T20:50:00Z'
  }
];

export const API_ENDPOINTS: ApiEndpointDoc[] = [
  {
    method: 'GET',
    path: '/api/v1/facilities',
    category: 'Facilities',
    summary: 'Search & filter hospitals and clinics',
    description: 'Returns paginated list of medical facilities with multi-criteria filtering by keyword, city, facility type, emergency status, and bed availability.',
    queryParams: [
      { name: 'q', type: 'string', required: false, description: 'Search term for name or address' },
      { name: 'type', type: 'HOSPITAL | CLINIC', required: false, description: 'Filter by facility classification' },
      { name: 'city', type: 'string', required: false, description: 'Filter by city name' },
      { name: 'emergency_status', type: 'string', required: false, description: 'NORMAL, ELEVATED, CRITICAL, DIVERTING' },
      { name: 'has_emergency', type: 'boolean', required: false, description: 'true for 24/7 ER departments' },
      { name: 'min_icu', type: 'integer', required: false, description: 'Minimum available ICU beds' },
      { name: 'page', type: 'integer', required: false, description: 'Page number (default 1)' },
      { name: 'per_page', type: 'integer', required: false, description: 'Items per page (default 20)' }
    ],
    responseExample: {
      success: true,
      data: [
        {
          id: 1,
          name: 'St. Jude Metropolitan Medical Center',
          facility_type: 'HOSPITAL',
          city: 'San Francisco',
          emergency_status: 'NORMAL',
          summary: { total_beds: 350, available_beds: 98, icu_available: 8 }
        }
      ],
      pagination: { page: 1, per_page: 20, total_items: 6, total_pages: 1 }
    }
  },
  {
    method: 'POST',
    path: '/api/v1/facilities',
    category: 'Facilities',
    summary: 'Register new hospital or clinic',
    description: 'Registers a new medical institution with complete geographic coordinates, license number, departmental beds, and medical resources.',
    requestBody: {
      name: 'Downtown Urgent Health Clinic',
      facility_type: 'CLINIC',
      license_number: 'MED-CA-55102',
      address: '742 Market Street',
      city: 'San Francisco',
      state: 'CA',
      postal_code: '94102',
      phone: '+1 (415) 555-0600',
      latitude: 37.7879,
      longitude: -122.4074,
      has_emergency_dept: false,
      operating_hours: '08:00 - 20:00',
      beds: [
        { bed_type: 'GENERAL', total_capacity: 12, occupied: 4 }
      ]
    },
    responseExample: {
      success: true,
      message: "Facility 'Downtown Urgent Health Clinic' created successfully.",
      data: { id: 7, name: 'Downtown Urgent Health Clinic', status: 'ACTIVE' }
    }
  },
  {
    method: 'GET',
    path: '/api/v1/facilities/<id>',
    category: 'Facilities',
    summary: 'Get facility details by ID',
    description: 'Fetches full facility profile, departmental bed breakdown, medical supplies, and real-time occupancy metrics.',
    responseExample: {
      success: true,
      data: {
        id: 1,
        name: 'St. Jude Metropolitan Medical Center',
        beds: [{ bed_type: 'ICU', total_capacity: 36, occupied: 28, available: 8 }]
      }
    }
  },
  {
    method: 'PUT',
    path: '/api/v1/facilities/<id>',
    category: 'Facilities',
    summary: 'Update facility metadata',
    description: 'Updates address, contact phone, operating hours, and operational status.',
    requestBody: {
      phone: '+1 (415) 555-0999',
      operating_hours: '24/7 Urgent Triage'
    },
    responseExample: {
      success: true,
      message: 'Facility updated successfully'
    }
  },
  {
    method: 'DELETE',
    path: '/api/v1/facilities/<id>',
    category: 'Facilities',
    summary: 'Soft-delete facility',
    description: 'Deactivates a facility from public routing without corrupting historical audit records.',
    responseExample: {
      success: true,
      message: "Facility 'St. Jude Metropolitan Medical Center' deactivated successfully."
    }
  },
  {
    method: 'GET',
    path: '/api/v1/facilities/<id>/beds',
    category: 'Beds',
    summary: 'List beds for a facility',
    description: 'Returns real-time capacity and occupancy metrics partitioned by ward/bed type.',
    responseExample: {
      success: true,
      facility_id: 1,
      summary: { total_beds: 350, available_beds: 98, occupied_beds: 252 },
      beds: [
        { bed_type: 'ICU', total_capacity: 36, occupied: 28, available: 8 }
      ]
    }
  },
  {
    method: 'POST',
    path: '/api/v1/facilities/<id>/beds/allocate',
    category: 'Beds',
    summary: 'Atomically admit patient & allocate bed',
    description: 'Safely increments occupied bed counter within an atomic transaction. If occupancy exceeds 95%, auto-triggers ambulance diversion.',
    requestBody: {
      bed_type: 'ICU',
      count: 1,
      operator_id: 'Dr. Sarah Adams',
      reason: 'Emergency severe trauma admission'
    },
    responseExample: {
      success: true,
      message: "Successfully allocated 1 'ICU' bed(s).",
      data: { bed_type: 'ICU', total_capacity: 36, occupied: 29, available: 7 }
    }
  },
  {
    method: 'POST',
    path: '/api/v1/facilities/<id>/beds/release',
    category: 'Beds',
    summary: 'Atomically discharge patient & release bed',
    description: 'Safely decrements occupied counter and frees bed for intake. Automatically creates an immutable audit trail entry.',
    requestBody: {
      bed_type: 'ICU',
      count: 1,
      operator_id: 'Nurse Station 3',
      reason: 'Patient transfer to general ward'
    },
    responseExample: {
      success: true,
      message: "Successfully released 1 'ICU' bed(s).",
      data: { bed_type: 'ICU', total_capacity: 36, occupied: 27, available: 9 }
    }
  },
  {
    method: 'PATCH',
    path: '/api/v1/facilities/<id>/beds/<type>',
    category: 'Beds',
    summary: 'Adjust ward capacity or occupied count',
    description: 'Enables charge nurses or administrators to update bed capacity limits or perform ward headcounts.',
    requestBody: {
      total_capacity: 40,
      occupied: 30
    },
    responseExample: {
      success: true,
      message: "Bed 'ICU' updated.",
      data: { bed_type: 'ICU', total_capacity: 40, occupied: 30, available: 10 }
    }
  },
  {
    method: 'GET',
    path: '/api/v1/geojson/facilities',
    category: 'GeoJSON',
    summary: 'All facilities as RFC 7946 FeatureCollection',
    description: 'Outputs a valid GeoJSON FeatureCollection containing all active hospitals and clinics with Point coordinates [longitude, latitude] and operational properties.',
    responseExample: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: 1,
          geometry: { type: 'Point', coordinates: [-122.4580, 37.7631] },
          properties: { name: 'St. Jude Metropolitan Medical Center', available_beds: 98, emergency_status: 'NORMAL' }
        }
      ]
    }
  },
  {
    method: 'GET',
    path: '/api/v1/geojson/nearby',
    category: 'GeoJSON',
    summary: 'Spatial proximity radius search',
    description: 'Calculates great-circle distance via Haversine formula and returns nearby facilities sorted closest-first inside a GeoJSON FeatureCollection.',
    queryParams: [
      { name: 'lat', type: 'float', required: true, description: 'Origin latitude (e.g. 37.7749)' },
      { name: 'lng', type: 'float', required: true, description: 'Origin longitude (e.g. -122.4194)' },
      { name: 'radius_km', type: 'float', required: false, description: 'Search radius in km (default 25.0)' },
      { name: 'type', type: 'string', required: false, description: 'HOSPITAL or CLINIC' },
      { name: 'emergency_status', type: 'string', required: false, description: 'Filter by triage status' }
    ],
    responseExample: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: 1,
          geometry: { type: 'Point', coordinates: [-122.4580, 37.7631] },
          properties: { name: 'St. Jude Medical', distance_km: 4.82, available_beds: 98 }
        }
      ],
      metadata: { total_count: 1, origin: { latitude: 37.7749, longitude: -122.4194, radius_km: 25.0 } }
    }
  },
  {
    method: 'GET',
    path: '/api/v1/emergency/summary',
    category: 'Emergency',
    summary: 'Regional emergency surge & diversion metrics',
    description: 'Provides 911 dispatchers and regional triage commanders an instant view of hospital diversion alerts, ICU bed availability, and ambulance readiness.',
    responseExample: {
      success: true,
      metrics: {
        total_facilities: 6,
        emergency_statuses: { normal: 4, diverting: 1, critical: 0, elevated: 1 },
        capacity: { total_beds: 1202, available_beds: 231, icu_available: 17, active_ambulances: 31 }
      },
      urgent_alerts: [
        { facility_id: 4, facility_name: 'Pacific Heights General Hospital', emergency_status: 'DIVERTING' }
      ]
    }
  }
];
