import React, { useState, useMemo } from 'react';
import { Facility, GeoJsonFeatureCollection } from '../types';
import {
  MapPin,
  Compass,
  Copy,
  Check,
  Download,
  Crosshair,
  Sliders,
  Building2,
  AlertTriangle
} from 'lucide-react';

interface GeoJsonMapViewProps {
  facilities: Facility[];
}

export const GeoJsonMapView: React.FC<GeoJsonMapViewProps> = ({ facilities }) => {
  const [radiusKm, setRadiusKm] = useState<number>(20);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(facilities[0] || null);
  const [copied, setCopied] = useState(false);
  const [jsonTab, setJsonTab] = useState<'preview' | 'schema'>('preview');

  // Center coordinate around San Francisco Bay Area
  const centerLat = 37.7749;
  const centerLng = -122.4194;

  // Haversine calculation
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const facilitiesWithDistance = useMemo(() => {
    return facilities.map((f) => ({
      ...f,
      distance_km: calculateDistance(centerLat, centerLng, f.latitude, f.longitude)
    }));
  }, [facilities]);

  const nearbyFacilities = useMemo(() => {
    return facilitiesWithDistance
      .filter((f) => f.distance_km <= radiusKm)
      .sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
  }, [facilitiesWithDistance, radiusKm]);

  // Real RFC 7946 GeoJSON output
  const geoJsonPayload: GeoJsonFeatureCollection = useMemo(() => {
    return {
      type: 'FeatureCollection',
      metadata: {
        total_count: nearbyFacilities.length,
        crs: {
          type: 'name',
          properties: {
            name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
          }
        },
        origin: {
          latitude: centerLat,
          longitude: centerLng,
          radius_km: radiusKm
        }
      },
      features: nearbyFacilities.map((f) => ({
        type: 'Feature',
        id: f.id,
        geometry: {
          type: 'Point',
          coordinates: [f.longitude, f.latitude] // RFC 7946 standard: [lng, lat]
        },
        properties: {
          id: f.id,
          name: f.name,
          facility_type: f.facility_type,
          address: `${f.address}, ${f.city}, ${f.state} ${f.postal_code}`,
          phone: f.phone,
          emergency_status: f.emergency_status,
          has_emergency_dept: f.has_emergency_dept,
          total_beds: f.summary.total_beds,
          available_beds: f.summary.available_beds,
          icu_available: f.summary.icu_available,
          ventilator_available: f.summary.ventilator_available,
          occupancy_rate_percent: f.summary.occupancy_rate_percent,
          distance_km: Number(f.distance_km?.toFixed(2))
        }
      }))
    };
  }, [nearbyFacilities, radiusKm]);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(geoJsonPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(geoJsonPayload, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `facilities-radius-${radiusKm}km.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Convert GPS to SVG 2D Canvas coordinate projection
  // Lat range: 37.73 to 37.82, Lng range: -122.50 to -122.20
  const projectToSvg = (lat: number, lng: number) => {
    const minLat = 37.74;
    const maxLat = 37.82;
    const minLng = -122.50;
    const maxLng = -122.22;

    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    // Invert Y because SVG coordinates increase downwards
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;

    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  const centerSvg = projectToSvg(centerLat, centerLng);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Intro Header */}
      <div className="bg-[#FFF9F5] border border-[#FCE4DC] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#3D302C]/70 font-semibold">
                RFC 7946 Geospatial Location Engine
              </span>
              <span className="text-[10px] font-bold bg-[#F4B6A6] text-[#3D302C] px-2 py-0.5 rounded">
                WGS84 EPSG:4326
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#3D302C] mt-1">
              GeoJSON Radius API & Spatial Radar
            </h2>
            <p className="text-xs text-[#3D302C]/80 mt-1 max-w-2xl">
              Calculates great-circle distance via Haversine spherical trigonometry. Powers GIS clients, emergency ambulance dispatch systems, and hospital intake networks.
            </p>
          </div>

          {/* Radius Slider Controller */}
          <div className="bg-[#FCE4DC]/40 border border-[#FCE4DC] p-3.5 rounded-xl w-full md:w-72">
            <div className="flex items-center justify-between text-xs font-semibold text-[#3D302C] mb-2">
              <span className="flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5" />
                <span>Search Radius:</span>
              </span>
              <span className="font-mono font-bold bg-[#FFF9F5] px-2 py-0.5 rounded border border-[#FCE4DC]">
                {radiusKm} km
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="1"
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseInt(e.target.value))}
              className="w-full accent-[#3D302C] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#3D302C]/60 mt-1 font-mono">
              <span>5 km</span>
              <span>20 km</span>
              <span>40 km</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Spatial Canvas Map & GeoJSON Payload Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Spatial 2D Map Visualization */}
        <div className="lg:col-span-7 bg-[#FFF9F5] border border-[#FCE4DC] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#3D302C] flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#3D302C]" />
                Spatial Radar Coordinate Projection
              </h3>
              <div className="flex items-center gap-2 text-xs font-mono text-[#3D302C]/70">
                <Crosshair className="h-3.5 w-3.5 text-amber-700" />
                <span>Origin: SF Center (37.77°N, 122.41°W)</span>
              </div>
            </div>

            {/* SVG Interactive Canvas */}
            <div className="relative aspect-4/3 w-full bg-[#FFF9F5] border-2 border-[#FCE4DC] rounded-xl overflow-hidden p-4 shadow-inner">
              {/* Radar Grid Lines */}
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Concentric distance circles from center */}
                <circle cx={centerSvg.x} cy={centerSvg.y} r="15" fill="none" stroke="#FCE4DC" strokeWidth="0.8" strokeDasharray="2,2" />
                <circle cx={centerSvg.x} cy={centerSvg.y} r="28" fill="none" stroke="#FCE4DC" strokeWidth="0.8" strokeDasharray="2,2" />
                <circle cx={centerSvg.x} cy={centerSvg.y} r="42" fill="none" stroke="#FCE4DC" strokeWidth="0.8" strokeDasharray="2,2" />
                
                {/* Active Radius boundary circle */}
                <circle
                  cx={centerSvg.x}
                  cy={centerSvg.y}
                  r={Math.min(48, radiusKm * 1.3)}
                  fill="#F4B6A6"
                  fillOpacity="0.12"
                  stroke="#F4B6A6"
                  strokeWidth="1.2"
                />

                {/* Crosshairs */}
                <line x1={centerSvg.x} y1="0" x2={centerSvg.x} y2="100" stroke="#FCE4DC" strokeWidth="0.5" />
                <line x1="0" y1={centerSvg.y} x2="100" y2={centerSvg.y} stroke="#FCE4DC" strokeWidth="0.5" />

                {/* User origin pin */}
                <circle cx={centerSvg.x} cy={centerSvg.y} r="3" fill="#3D302C" />
                <circle cx={centerSvg.x} cy={centerSvg.y} r="5" fill="none" stroke="#3D302C" strokeWidth="0.8" className="animate-ping" />

                {/* Facility Markers */}
                {facilitiesWithDistance.map((fac) => {
                  const pt = projectToSvg(fac.latitude, fac.longitude);
                  const isInside = (fac.distance_km || 0) <= radiusKm;
                  const isSelected = selectedFacility?.id === fac.id;
                  const isDiverting = fac.emergency_status === 'DIVERTING';

                  return (
                    <g
                      key={fac.id}
                      onClick={() => setSelectedFacility(fac)}
                      className="cursor-pointer transition-transform hover:scale-125"
                    >
                      {/* Outer pulse if selected */}
                      {isSelected && (
                        <circle cx={pt.x} cy={pt.y} r="5.5" fill="none" stroke="#3D302C" strokeWidth="1" />
                      )}

                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="3.8"
                        fill={!isInside ? '#D1D5DB' : isDiverting ? '#D97706' : '#F4B6A6'}
                        stroke="#3D302C"
                        strokeWidth="1"
                      />

                      <text
                        x={pt.x + 5}
                        y={pt.y + 1}
                        fontSize="3.2"
                        fontWeight="600"
                        fill="#3D302C"
                        opacity={isInside ? 1 : 0.4}
                      >
                        {fac.name.split(' ')[0]} ({fac.summary.available_beds} beds)
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Legend overlay */}
              <div className="absolute bottom-3 left-3 bg-[#FFF9F5]/90 backdrop-blur-xs p-2 rounded-lg border border-[#FCE4DC] text-[10px] text-[#3D302C] space-y-1 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#3D302C]" />
                  <span>Your Origin (GPS Center)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#F4B6A6] border border-[#3D302C]" />
                  <span>Hospital / Clinic (In Radius)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-600 border border-[#3D302C]" />
                  <span>Diverting Ambulance Alert</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Facility Quick Card */}
          {selectedFacility && (
            <div className="mt-4 p-4 rounded-xl bg-[#FCE4DC]/40 border border-[#FCE4DC]">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono text-[#3D302C]/70 font-semibold uppercase">
                    Selected Spatial Node
                  </span>
                  <h4 className="text-sm font-bold text-[#3D302C]">{selectedFacility.name}</h4>
                  <p className="text-xs text-[#3D302C]/70">
                    {selectedFacility.address}, {selectedFacility.city}
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs font-bold text-[#3D302C] block">
                    {selectedFacility.distance_km?.toFixed(2)} km
                  </span>
                  <span className="text-[10px] text-emerald-800 font-semibold">
                    {selectedFacility.summary.available_beds} beds available
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Real-time GeoJSON RFC 7946 Output */}
        <div className="lg:col-span-5 bg-[#FFF9F5] border border-[#FCE4DC] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#3D302C]">Live GeoJSON API Response</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FCE4DC] text-[#3D302C]">
                  {nearbyFacilities.length} Features
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  id="btn-copy-geojson"
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#FCE4DC]/70 hover:bg-[#FCE4DC] text-[#3D302C] transition-all cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  id="btn-download-geojson"
                  onClick={handleDownload}
                  className="p-1.5 rounded-lg text-xs font-semibold bg-[#FCE4DC]/70 hover:bg-[#FCE4DC] text-[#3D302C] transition-all cursor-pointer"
                  title="Download .geojson file"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Code Block */}
            <div className="relative">
              <pre className="p-4 rounded-xl bg-[#3D302C] text-[#FFF9F5] font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[460px] scrollbar-thin">
                <code>{JSON.stringify(geoJsonPayload, null, 2)}</code>
              </pre>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#FCE4DC] text-[11px] text-[#3D302C]/70">
            <strong>Endpoint:</strong> <code className="font-mono text-[#3D302C]">GET /api/v1/geojson/nearby?lat={centerLat}&lng={centerLng}&radius_km={radiusKm}</code>
          </div>
        </div>
      </div>
    </div>
  );
};
