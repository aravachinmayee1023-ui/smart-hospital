import React, { useState, useEffect } from 'react';
import { GeoJsonCollection, GeoJsonPointFeature, getHospitalGeoJson, getClinicGeoJson } from '../services/api';
import {
  MapPin,
  RefreshCw,
  Copy,
  Check,
  Download,
  Eye,
  Building2,
  Bed,
  Layers,
  Code,
  AlertCircle
} from 'lucide-react';

interface GeoJsonInteractiveMapProps {
  onSelectHospitalId?: (id: number) => void;
  selectedFacilityId?: number | null;
}

export const GeoJsonInteractiveMap: React.FC<GeoJsonInteractiveMapProps> = ({
  onSelectHospitalId,
  selectedFacilityId,
}) => {
  const [geoData, setGeoData] = useState<GeoJsonCollection | null>(null);
  const [clinicGeoData, setClinicGeoData] = useState<GeoJsonCollection | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFeature, setActiveFeature] = useState<GeoJsonPointFeature | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'raw_json'>('map');
  const [copied, setCopied] = useState<boolean>(false);
  const [includeClinics, setIncludeClinics] = useState<boolean>(true);

  const fetchGeoJson = async () => {
    try {
      setLoading(true);
      setError(null);
      const [hospGeo, clnGeo] = await Promise.all([
        getHospitalGeoJson(),
        getClinicGeoJson().catch(() => null),
      ]);
      setGeoData(hospGeo);
      if (clnGeo) setClinicGeoData(clnGeo);
    } catch (err: any) {
      setError(err.message || 'Failed to load GeoJSON');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeoJson();
  }, []);

  const allFeatures = React.useMemo(() => {
    const list = geoData ? [...geoData.features] : [];
    if (includeClinics && clinicGeoData) {
      list.push(...clinicGeoData.features);
    }
    return list;
  }, [geoData, clinicGeoData, includeClinics]);

  // Compute bounding box for projection
  const bounds = React.useMemo(() => {
    if (!allFeatures.length) {
      return { minLng: -122.52, maxLng: -122.36, minLat: 37.72, maxLat: 37.82 };
    }
    let minLng = Infinity;
    let maxLng = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;

    allFeatures.forEach((f) => {
      const [lng, lat] = f.geometry.coordinates;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    });

    // Add safe padding
    const padLng = Math.max(0.04, (maxLng - minLng) * 0.15);
    const padLat = Math.max(0.04, (maxLat - minLat) * 0.15);

    return {
      minLng: minLng - padLng,
      maxLng: maxLng + padLng,
      minLat: minLat - padLat,
      maxLat: maxLat + padLat,
    };
  }, [allFeatures]);

  // Project [lng, lat] to SVG coordinates [x, y] in viewBox 0..800, 0..500
  const project = (lng: number, lat: number) => {
    const width = 800;
    const height = 500;
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width;
    const y = height - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height;
    return { x: Math.max(40, Math.min(width - 40, x)), y: Math.max(40, Math.min(height - 40, y)) };
  };

  const handleCopyJson = () => {
    if (!geoData) return;
    navigator.clipboard.writeText(JSON.stringify(geoData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    if (!geoData) return;
    const blob = new Blob([JSON.stringify(geoData, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hospitals-rfc7946.geojson';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#FFFCFA] rounded-2xl border border-[#EFD5CC] shadow-xs overflow-hidden">
      {/* Top Toolbar */}
      <div className="bg-[#FFF9F5] border-b border-[#EFD5CC] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[#FCE4DC] flex items-center justify-center text-[#3D302C]">
            <MapPin className="h-4 w-4 text-[#F4B6A6]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#3D302C]">GeoJSON Spatial Engine</h3>
            <p className="text-[11px] text-[#806F68]">
              RFC 7946 Compliant • Coordinate Standard: <span className="font-mono">[Longitude, Latitude]</span>
            </p>
          </div>
        </div>

        {/* View mode toggle & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-1.5 text-xs text-[#3D302C] cursor-pointer mr-2">
            <input
              type="checkbox"
              checked={includeClinics}
              onChange={(e) => setIncludeClinics(e.target.checked)}
              className="rounded accent-[#F4B6A6]"
            />
            <span>Include Clinics</span>
          </label>

          <div className="inline-flex rounded-lg border border-[#EFD5CC] bg-[#FFF9F5] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                viewMode === 'map'
                  ? 'bg-[#F4B6A6] text-[#3D302C]'
                  : 'text-[#806F68] hover:text-[#3D302C]'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Map View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('raw_json')}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                viewMode === 'raw_json'
                  ? 'bg-[#F4B6A6] text-[#3D302C]'
                  : 'text-[#806F68] hover:text-[#3D302C]'
              }`}
            >
              <Code className="h-3.5 w-3.5" />
              <span>Raw GeoJSON</span>
            </button>
          </div>

          <button
            type="button"
            onClick={fetchGeoJson}
            disabled={loading}
            className="p-1.5 rounded-lg border border-[#EFD5CC] bg-[#FFF9F5] text-[#806F68] hover:text-[#3D302C] hover:bg-[#FCE4DC] transition-colors cursor-pointer"
            title="Refresh GeoJSON"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-xs text-[#806F68]">
          <RefreshCw className="h-6 w-6 animate-spin text-[#F4B6A6]" />
          <span>Querying GET /api/hospitals/geojson...</span>
        </div>
      ) : error ? (
        <div className="p-8 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
          <p className="text-xs text-rose-800">{error}</p>
          <button
            type="button"
            onClick={fetchGeoJson}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#F4B6A6] text-[#3D302C]"
          >
            Retry Connection
          </button>
        </div>
      ) : viewMode === 'raw_json' ? (
        /* Raw GeoJSON Inspector */
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono text-[#806F68]">
              Endpoint: <span className="font-semibold text-[#3D302C]">GET /api/hospitals/geojson</span> ({allFeatures.length} features)
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyJson}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#FCE4DC] text-[#3D302C] hover:bg-[#F4B6A6] transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadJson}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#F4B6A6] text-[#3D302C] hover:bg-[#F4B6A6]/90 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export .geojson</span>
              </button>
            </div>
          </div>
          <pre className="bg-[#FFF9F5] border border-[#EFD5CC] rounded-xl p-4 text-xs font-mono text-[#3D302C] max-h-96 overflow-auto scrollbar-thin">
            {JSON.stringify(geoData, null, 2)}
          </pre>
        </div>
      ) : (
        /* Map View */
        <div className="relative">
          {/* SVG Map Canvas */}
          <div className="relative w-full h-[380px] bg-[#FFF9F5] overflow-hidden">
            <svg
              className="w-full h-full"
              viewBox="0 0 800 500"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Subtle Grid Lines */}
              <defs>
                <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#EFD5CC" strokeWidth="0.5" strokeOpacity="0.6" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />

              {/* Connecting Isochrone Radar rings around selected item */}
              {activeFeature && (
                (() => {
                  const pt = project(
                    activeFeature.geometry.coordinates[0],
                    activeFeature.geometry.coordinates[1]
                  );
                  return (
                    <g>
                      <circle cx={pt.x} cy={pt.y} r="35" fill="#F4B6A6" fillOpacity="0.15" />
                      <circle cx={pt.x} cy={pt.y} r="70" fill="#F4B6A6" fillOpacity="0.08" stroke="#F4B6A6" strokeDasharray="4,4" strokeWidth="1" />
                    </g>
                  );
                })()
              )}

              {/* Markers for GeoJSON Point features */}
              {allFeatures.map((feature) => {
                const [lng, lat] = feature.geometry.coordinates;
                const { x, y } = project(lng, lat);
                const isSelected = activeFeature?.id === feature.id || (selectedFacilityId && feature.properties.id === selectedFacilityId);
                const isHospital = feature.properties.facility_type === 'Hospital';
                const isEmergency = Boolean(feature.properties.emergency);

                return (
                  <g
                    key={feature.id}
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={() => {
                      setActiveFeature(feature);
                      if (isHospital && onSelectHospitalId) {
                        onSelectHospitalId(feature.properties.id);
                      }
                    }}
                  >
                    {/* Shadow */}
                    <circle cx={x} cy={y + 2} r={isSelected ? 16 : 12} fill="#3D302C" fillOpacity="0.1" />

                    {/* Outer ring */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 14 : 10}
                      fill={isEmergency ? '#F4B6A6' : '#FCE4DC'}
                      stroke={isSelected ? '#3D302C' : '#EFD5CC'}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />

                    {/* Inner Core */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 5 : 3.5}
                      fill={isEmergency ? '#3D302C' : '#806F68'}
                    />

                    {/* Label Tag */}
                    <text
                      x={x}
                      y={y - 16}
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-[#3D302C] pointer-events-none drop-shadow-xs"
                    >
                      {feature.properties.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Active Feature Tooltip / Floating Card */}
            {activeFeature && (
              <div
                id="geojson-active-feature-card"
                className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md bg-[#FFFCFA] border border-[#EFD5CC] rounded-2xl p-4 shadow-lg animate-in slide-in-from-bottom-2"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FCE4DC] text-[#3D302C]">
                        {activeFeature.properties.facility_type}
                      </span>
                      {activeFeature.properties.emergency ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F4B6A6] text-[#3D302C]">
                          24/7 ER
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#EFD5CC]/60 text-[#806F68]">
                          Non-ER
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-[#3D302C]">{activeFeature.properties.name}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveFeature(null)}
                    className="text-[#806F68] hover:text-[#3D302C] text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-[11px] text-[#806F68] truncate mb-2">{activeFeature.properties.address}</p>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#EFD5CC]">
                  <span className="font-mono text-[#806F68]">
                    Coords: [{activeFeature.geometry.coordinates[0].toFixed(4)}, {activeFeature.geometry.coordinates[1].toFixed(4)}]
                  </span>
                  <span className="font-semibold text-[#3D302C]">
                    {activeFeature.properties.beds} Inpatient Beds
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="bg-[#FFF9F5] border-t border-[#EFD5CC] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-[#806F68]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-[#F4B6A6] border border-[#3D302C]" />
                <span className="text-[#3D302C] font-medium">Emergency Active Hospital</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-[#FCE4DC] border border-[#EFD5CC]" />
                <span className="text-[#806F68]">Community Hospital / Clinic</span>
              </span>
            </div>
            <span className="font-mono text-[11px]">
              WGS84 EPSG:4326 Projection
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
