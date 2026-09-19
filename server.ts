import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface HospitalRecord {
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
  doctors: {
    emergency_physicians: number;
    trauma_surgeons: number;
    icu_nurses: number;
    on_duty_total: number;
  };
  resources: {
    icu_beds_available: number;
    ventilators_ready: number;
    oxygen_reserves_percent: number;
    blood_units_available: number;
  };
  phone: string;
  created_at: string;
  updated_at: string;
}

interface ClinicRecord {
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
  doctors: {
    family_physicians: number;
    triage_nurses: number;
    on_duty_total: number;
  };
  resources: {
    observation_beds: number;
    rapid_test_kits: number;
    oxygen_concentrators: number;
  };
  phone: string;
  created_at: string;
  updated_at: string;
}

// Initial In-Memory Seed Data matching Flask SQLite database
let hospitals: HospitalRecord[] = [
  {
    id: 1,
    name: "St. Jude Metropolitan Medical Center",
    type: "Teaching & Trauma Hospital",
    address: "1200 Health Sciences Blvd, San Francisco, CA 94143",
    beds: 356,
    available_beds: 74,
    latitude: 37.7631,
    longitude: -122.458,
    specialties: ["Emergency Medicine", "Intensive Care (ICU)", "Cardiology", "Neurosurgery"],
    emergency: true,
    doctors: {
      emergency_physicians: 14,
      trauma_surgeons: 6,
      icu_nurses: 42,
      on_duty_total: 62,
    },
    resources: {
      icu_beds_available: 18,
      ventilators_ready: 14,
      oxygen_reserves_percent: 96,
      blood_units_available: 120,
    },
    phone: "(415) 555-0101",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Mission Bay Children & Trauma Hospital",
    type: "Pediatric Trauma Center",
    address: "1825 4th Street, San Francisco, CA 94158",
    beds: 340,
    available_beds: 52,
    latitude: 37.768,
    longitude: -122.392,
    specialties: ["Pediatric Emergency", "Neonatal ICU", "Trauma Surgery", "Cardiology"],
    emergency: true,
    doctors: {
      emergency_physicians: 11,
      trauma_surgeons: 5,
      icu_nurses: 38,
      on_duty_total: 54,
    },
    resources: {
      icu_beds_available: 12,
      ventilators_ready: 19,
      oxygen_reserves_percent: 98,
      blood_units_available: 95,
    },
    phone: "(415) 555-0102",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Pacific Heights Regional Hospital",
    type: "Community General Hospital",
    address: "2333 Buchanan Street, San Francisco, CA 94115",
    beds: 280,
    available_beds: 61,
    latitude: 37.7915,
    longitude: -122.4312,
    specialties: ["Internal Medicine", "General Surgery", "Orthopedics", "Cardiology"],
    emergency: true,
    doctors: {
      emergency_physicians: 8,
      trauma_surgeons: 3,
      icu_nurses: 24,
      on_duty_total: 35,
    },
    resources: {
      icu_beds_available: 9,
      ventilators_ready: 8,
      oxygen_reserves_percent: 92,
      blood_units_available: 70,
    },
    phone: "(415) 555-0103",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: "Apollo Super Specialty Center",
    type: "Super Specialty Hospital",
    address: "Road No 72, Jubilee Hills, Hyderabad",
    beds: 420,
    available_beds: 95,
    latitude: 17.4265,
    longitude: 78.4116,
    specialties: ["Cardiology", "Oncology", "Organ Transplant", "Emergency Medicine"],
    emergency: true,
    doctors: {
      emergency_physicians: 16,
      trauma_surgeons: 8,
      icu_nurses: 50,
      on_duty_total: 74,
    },
    resources: {
      icu_beds_available: 24,
      ventilators_ready: 22,
      oxygen_reserves_percent: 99,
      blood_units_available: 160,
    },
    phone: "+91 40 2360 7777",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    name: "Care Community Memorial Hospital",
    type: "Community General Hospital",
    address: "Banjara Hills Road 1, Hyderabad",
    beds: 150,
    available_beds: 38,
    latitude: 17.4156,
    longitude: 78.435,
    specialties: ["Internal Medicine", "General Surgery", "Obstetrics"],
    emergency: false,
    doctors: {
      emergency_physicians: 4,
      trauma_surgeons: 2,
      icu_nurses: 14,
      on_duty_total: 20,
    },
    resources: {
      icu_beds_available: 5,
      ventilators_ready: 4,
      oxygen_reserves_percent: 88,
      blood_units_available: 40,
    },
    phone: "+91 40 3041 8888",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

let clinics: ClinicRecord[] = [
  {
    id: 1,
    name: "Downtown Urgent Care & Rapid Triage",
    type: "Urgent Care Clinic",
    address: "450 Sutter St, Suite 800, San Francisco, CA 94108",
    beds: 14,
    available_beds: 6,
    latitude: 37.7898,
    longitude: -122.4075,
    specialties: ["Family Medicine", "Rapid Triage", "Minor Trauma"],
    emergency: false,
    doctors: {
      family_physicians: 5,
      triage_nurses: 8,
      on_duty_total: 13,
    },
    resources: {
      observation_beds: 14,
      rapid_test_kits: 250,
      oxygen_concentrators: 6,
    },
    phone: "(415) 555-0201",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Sunset Community Health & Ambulatory Pavilion",
    type: "Ambulatory Care Clinic",
    address: "1990 Judah Street, San Francisco, CA 94122",
    beds: 18,
    available_beds: 9,
    latitude: 37.7618,
    longitude: -122.484,
    specialties: ["Pediatrics", "Preventive Diagnostics", "Immunizations"],
    emergency: false,
    doctors: {
      family_physicians: 4,
      triage_nurses: 6,
      on_duty_total: 10,
    },
    resources: {
      observation_beds: 18,
      rapid_test_kits: 180,
      oxygen_concentrators: 4,
    },
    phone: "(415) 555-0202",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Mission District Rapid Care Center",
    type: "Urgent Care Clinic",
    address: "2450 Mission St, San Francisco, CA 94110",
    beds: 22,
    available_beds: 11,
    latitude: 37.7588,
    longitude: -122.4191,
    specialties: ["Urgent Care", "Occupational Health", "Minor Trauma"],
    emergency: false,
    doctors: {
      family_physicians: 6,
      triage_nurses: 10,
      on_duty_total: 16,
    },
    resources: {
      observation_beds: 22,
      rapid_test_kits: 310,
      oxygen_concentrators: 8,
    },
    phone: "(415) 555-0203",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371.0;
  const dLat = ((lat2 - lat1) * Math.PI) / 180.0;
  const dLon = ((lon2 - lon1) * Math.PI) / 180.0;
  const a =
    Math.sin(dLat / 2.0) ** 2 +
    Math.cos((lat1 * Math.PI) / 180.0) *
      Math.cos((lat2 * Math.PI) / 180.0) *
      Math.sin(dLon / 2.0) ** 2;
  const c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
  return Math.round(R * c * 100) / 100;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS headers
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // ==============================================================================
  // 1. Health Check
  // ==============================================================================
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({
      status: "healthy",
      service: "Smart Hospital Bed and Medical Resource Platform",
      database: "connected",
      engine: "Express-Flask Compatible REST Gateway",
      timestamp: new Date().toISOString(),
      statistics: {
        hospitals: hospitals.length,
        clinics: clinics.length,
        total_beds: hospitals.reduce((acc, h) => acc + h.beds, 0) + clinics.reduce((acc, c) => acc + c.beds, 0),
        emergency_ready_hospitals: hospitals.filter((h) => h.emergency).length,
      },
    });
  });

  // ==============================================================================
  // 2. GET /api/hospitals/geojson (GeoJSON FeatureCollection)
  // Must be registered before /api/hospitals/:id
  // ==============================================================================
  app.get("/api/hospitals/geojson", (req: Request, res: Response) => {
    const features = hospitals.map((h) => ({
      type: "Feature",
      id: `hospital-${h.id}`,
      geometry: {
        type: "Point",
        // RFC 7946 standard: [longitude, latitude]
        coordinates: [h.longitude, h.latitude],
      },
      properties: {
        id: h.id,
        name: h.name,
        facility_type: "Hospital",
        subtype: h.type,
        address: h.address,
        beds: h.beds,
        available_beds: h.available_beds,
        emergency: h.emergency,
        specialties: h.specialties,
        doctors: h.doctors,
        resources: h.resources,
      },
    }));

    res.json({
      type: "FeatureCollection",
      metadata: {
        generated_at: new Date().toISOString(),
        total_count: features.length,
        crs: "EPSG:4326 (WGS84)",
      },
      features,
    });
  });

  // ==============================================================================
  // 3. GET /api/hospitals/search?q=
  // ==============================================================================
  app.get("/api/hospitals/search", (req: Request, res: Response) => {
    const q = req.query.q as string | undefined;

    if (!q || !q.trim()) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Search query parameter 'q' is required and cannot be empty.",
        status_code: 400,
      });
    }

    const term = q.trim().toLowerCase();
    const matches = hospitals.filter(
      (h) =>
        h.name.toLowerCase().includes(term) ||
        h.address.toLowerCase().includes(term) ||
        h.type.toLowerCase().includes(term) ||
        h.specialties.some((s) => s.toLowerCase().includes(term))
    );

    res.json({
      status: "success",
      query: q,
      count: matches.length,
      data: matches,
    });
  });

  // ==============================================================================
  // 4. GET /api/hospitals (List, filter by type, beds_min, emergency, q, etc.)
  // ==============================================================================
  app.get("/api/hospitals", (req: Request, res: Response) => {
    const { type, beds_min, min_beds, emergency, q, lat, lng, radius_km, sort_by, order, format } = req.query;

    // Direct GeoJSON export if ?format=geojson
    if (format && (format as string).toLowerCase() === "geojson") {
      const features = hospitals.map((h) => ({
        type: "Feature",
        id: `hospital-${h.id}`,
        geometry: {
          type: "Point",
          coordinates: [h.longitude, h.latitude],
        },
        properties: {
          id: h.id,
          name: h.name,
          facility_type: "Hospital",
          subtype: h.type,
          address: h.address,
          beds: h.beds,
          emergency: h.emergency,
          specialties: h.specialties,
        },
      }));
      return res.json({
        type: "FeatureCollection",
        metadata: {
          generated_at: new Date().toISOString(),
          total_count: features.length,
          crs: "EPSG:4326 (WGS84)",
        },
        features,
      });
    }

    // 1. Validate 'beds_min' (accepts 'min_beds' as alias)
    const rawBedsMin = (beds_min !== undefined ? beds_min : min_beds) as string | undefined;
    let parsedBedsMin: number | undefined = undefined;
    if (rawBedsMin !== undefined && String(rawBedsMin).trim() !== "") {
      const num = Number(rawBedsMin);
      if (isNaN(num) || !Number.isInteger(num)) {
        return res.status(400).json({
          error: "Bad Request",
          message: `Invalid value for 'beds_min': '${rawBedsMin}'. Must be a valid integer.`,
          status_code: 400,
        });
      }
      if (num < 0) {
        return res.status(400).json({
          error: "Bad Request",
          message: `Invalid value for 'beds_min': ${rawBedsMin}. Must be a non-negative integer.`,
          status_code: 400,
        });
      }
      parsedBedsMin = num;
    }

    // 2. Validate 'emergency'
    let parsedEmergency: boolean | undefined = undefined;
    if (emergency !== undefined && String(emergency).trim() !== "") {
      const clean = String(emergency).trim().toLowerCase();
      if (["true", "1", "yes"].includes(clean)) {
        parsedEmergency = true;
      } else if (["false", "0", "no"].includes(clean)) {
        parsedEmergency = false;
      } else {
        return res.status(400).json({
          error: "Bad Request",
          message: `Invalid value for 'emergency': '${emergency}'. Must be 'true' or 'false'.`,
          status_code: 400,
        });
      }
    }

    // 3. Filter hospitals
    let result = [...hospitals];

    if (type && String(type).trim()) {
      const typeTerm = String(type).trim().toLowerCase();
      result = result.filter((h) => h.type.toLowerCase().includes(typeTerm));
    }

    if (parsedBedsMin !== undefined) {
      result = result.filter((h) => h.beds >= parsedBedsMin!);
    }

    if (parsedEmergency !== undefined) {
      result = result.filter((h) => h.emergency === parsedEmergency);
    }

    if (q && String(q).trim()) {
      const term = String(q).trim().toLowerCase();
      result = result.filter(
        (h) =>
          h.name.toLowerCase().includes(term) ||
          h.address.toLowerCase().includes(term) ||
          h.specialties.some((s) => s.toLowerCase().includes(term))
      );
    }

    // Geolocation distance calculation
    if (lat && lng) {
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);
      if (!isNaN(userLat) && !isNaN(userLng)) {
        result = result.map((h) => ({
          ...h,
          distance_km: haversineDistanceKm(userLat, userLng, h.latitude, h.longitude),
        }));

        if (radius_km) {
          const maxRadius = parseFloat(radius_km as string);
          if (!isNaN(maxRadius)) {
            result = result.filter((h: any) => h.distance_km <= maxRadius);
          }
        }
      }
    }

    // Sorting
    const sortField = (sort_by as string) || "name";
    const isDesc = (order as string)?.toLowerCase() === "desc";
    result.sort((a: any, b: any) => {
      if (sortField === "beds") {
        return isDesc ? b.beds - a.beds : a.beds - b.beds;
      }
      if (sortField === "distance" && a.distance_km !== undefined) {
        return isDesc ? b.distance_km - a.distance_km : a.distance_km - b.distance_km;
      }
      const valA = String(a[sortField] || "").toLowerCase();
      const valB = String(b[sortField] || "").toLowerCase();
      return isDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
    });

    const filtersApplied: Record<string, any> = {};
    if (type) filtersApplied.type = type;
    if (parsedBedsMin !== undefined) filtersApplied.beds_min = parsedBedsMin;
    if (parsedEmergency !== undefined) filtersApplied.emergency = parsedEmergency;

    res.json({
      status: "success",
      count: result.length,
      filters_applied: filtersApplied,
      data: result,
    });
  });

  // ==============================================================================
  // 5. GET /api/hospitals/:id
  // ==============================================================================
  app.get("/api/hospitals/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Hospital ID must be an integer.",
        status_code: 400,
      });
    }

    const hospital = hospitals.find((h) => h.id === id);
    if (!hospital) {
      return res.status(404).json({
        error: "Not Found",
        message: `Hospital with ID ${id} was not found.`,
        status_code: 404,
      });
    }

    res.json({
      status: "success",
      data: hospital,
    });
  });

  // ==============================================================================
  // 6. POST /api/hospitals (Create hospital)
  // ==============================================================================
  app.post("/api/hospitals", (req: Request, res: Response) => {
    const body = req.body;
    if (!body || typeof body !== "object") {
      return res.status(400).json({
        error: "Bad Request",
        message: "Request payload must be a valid JSON object.",
        status_code: 400,
      });
    }

    const errors: string[] = [];
    if (!body.name || !String(body.name).trim()) errors.push("Hospital 'name' is required.");
    if (body.beds === undefined || body.beds < 0) errors.push("Hospital 'beds' must be a non-negative integer.");
    if (body.latitude === undefined || body.latitude < -90 || body.latitude > 90)
      errors.push("Latitude must be between -90.0 and 90.0.");
    if (body.longitude === undefined || body.longitude < -180 || body.longitude > 180)
      errors.push("Longitude must be between -180.0 and 180.0.");

    if (errors.length > 0) {
      return res.status(422).json({
        error: "Unprocessable Entity",
        message: "Validation failed for hospital creation.",
        validation_errors: errors,
        status_code: 422,
      });
    }

    const newId = hospitals.length > 0 ? Math.max(...hospitals.map((h) => h.id)) + 1 : 1;
    const newHospital: HospitalRecord = {
      id: newId,
      name: body.name.trim(),
      type: body.type ? body.type.trim() : "General Hospital",
      address: body.address ? body.address.trim() : "Unknown Address",
      beds: Number(body.beds),
      available_beds: Math.floor(Number(body.beds) * 0.3),
      latitude: Number(body.latitude),
      longitude: Number(body.longitude),
      specialties: Array.isArray(body.specialties)
        ? body.specialties
        : (body.specialties ? body.specialties.split(",") : ["General Medicine"]).map((s: string) => s.trim()),
      emergency: Boolean(body.emergency ?? true),
      doctors: body.doctors || {
        emergency_physicians: 6,
        trauma_surgeons: 3,
        icu_nurses: 18,
        on_duty_total: 27,
      },
      resources: body.resources || {
        icu_beds_available: Math.floor(Number(body.beds) * 0.1),
        ventilators_ready: 8,
        oxygen_reserves_percent: 94,
        blood_units_available: 80,
      },
      phone: body.phone || "(415) 555-0199",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    hospitals.push(newHospital);

    res.status(201).json({
      status: "success",
      message: "Hospital created successfully.",
      data: newHospital,
    });
  });

  // ==============================================================================
  // 7. PUT /api/hospitals/:id
  // ==============================================================================
  app.put("/api/hospitals/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const hospital = hospitals.find((h) => h.id === id);

    if (!hospital) {
      return res.status(404).json({
        error: "Not Found",
        message: `Hospital with ID ${id} was not found.`,
        status_code: 404,
      });
    }

    const body = req.body;
    if (body.name) hospital.name = String(body.name).trim();
    if (body.type) hospital.type = String(body.type).trim();
    if (body.address) hospital.address = String(body.address).trim();
    if (body.beds !== undefined) {
      hospital.beds = Math.max(0, Number(body.beds));
      hospital.available_beds = Math.min(hospital.available_beds, hospital.beds);
    }
    if (body.available_beds !== undefined) {
      hospital.available_beds = Math.max(0, Math.min(hospital.beds, Number(body.available_beds)));
    }
    if (body.emergency !== undefined) hospital.emergency = Boolean(body.emergency);
    if (body.specialties) {
      hospital.specialties = Array.isArray(body.specialties)
        ? body.specialties
        : body.specialties.split(",").map((s: string) => s.trim());
    }
    if (body.resources) {
      hospital.resources = { ...hospital.resources, ...body.resources };
    }
    if (body.doctors) {
      hospital.doctors = { ...hospital.doctors, ...body.doctors };
    }
    hospital.updated_at = new Date().toISOString();

    res.json({
      status: "success",
      message: "Hospital updated successfully.",
      data: hospital,
    });
  });

  // ==============================================================================
  // 8. DELETE /api/hospitals/:id
  // ==============================================================================
  app.delete("/api/hospitals/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const index = hospitals.findIndex((h) => h.id === id);

    if (index === -1) {
      return res.status(404).json({
        error: "Not Found",
        message: `Hospital with ID ${id} was not found.`,
        status_code: 404,
      });
    }

    hospitals.splice(index, 1);
    res.json({
      status: "success",
      message: `Hospital with ID ${id} was deleted successfully.`,
      deleted_id: id,
    });
  });

  // ==============================================================================
  // 9. CLINICS APIs
  // ==============================================================================
  app.get("/api/clinics/geojson", (req: Request, res: Response) => {
    const features = clinics.map((c) => ({
      type: "Feature",
      id: `clinic-${c.id}`,
      geometry: {
        type: "Point",
        coordinates: [c.longitude, c.latitude],
      },
      properties: {
        id: c.id,
        name: c.name,
        facility_type: "Clinic",
        subtype: c.type,
        address: c.address,
        beds: c.beds,
        available_beds: c.available_beds,
        emergency: c.emergency,
        specialties: c.specialties,
        doctors: c.doctors,
        resources: c.resources,
      },
    }));

    res.json({
      type: "FeatureCollection",
      metadata: {
        generated_at: new Date().toISOString(),
        total_count: features.length,
        crs: "EPSG:4326 (WGS84)",
      },
      features,
    });
  });

  app.get("/api/clinics/search", (req: Request, res: Response) => {
    const q = req.query.q as string | undefined;
    if (!q || !q.trim()) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Search query parameter 'q' is required.",
        status_code: 400,
      });
    }

    const term = q.trim().toLowerCase();
    const matches = clinics.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.address.toLowerCase().includes(term) ||
        c.type.toLowerCase().includes(term)
    );

    res.json({
      status: "success",
      query: q,
      count: matches.length,
      data: matches,
    });
  });

  app.get("/api/clinics", (req: Request, res: Response) => {
    const { q, emergency } = req.query;
    let result = [...clinics];

    if (q && String(q).trim()) {
      const term = String(q).trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.address.toLowerCase().includes(term) ||
          c.type.toLowerCase().includes(term)
      );
    }

    if (emergency !== undefined) {
      const clean = String(emergency).toLowerCase();
      const isEmerg = ["true", "1", "yes"].includes(clean);
      result = result.filter((c) => c.emergency === isEmerg);
    }

    res.json({
      status: "success",
      count: result.length,
      data: result,
    });
  });

  app.get("/api/clinics/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const clinic = clinics.find((c) => c.id === id);
    if (!clinic) {
      return res.status(404).json({
        error: "Not Found",
        message: `Clinic with ID ${id} was not found.`,
        status_code: 404,
      });
    }
    res.json({
      status: "success",
      data: clinic,
    });
  });

  // ==============================================================================
  // Vite Frontend Middleware Integration
  // ==============================================================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0", port: PORT },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Hospital Bed REST Gateway listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
