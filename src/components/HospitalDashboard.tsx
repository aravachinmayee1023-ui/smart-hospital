import React, { useState, useEffect, useCallback } from 'react';
import {
  HospitalItem,
  ClinicItem,
  getHospitals,
  getHospitalById,
  searchHospitals,
  getClinics,
  HospitalFilterParams
} from '../services/api';
import { HospitalCard } from './HospitalCard';
import { ClinicCard } from './ClinicCard';
import { HospitalDetailModal } from './HospitalDetailModal';
import { GeoJsonInteractiveMap } from './GeoJsonInteractiveMap';
import { BedOccupancyTrendChart } from './BedOccupancyTrendChart';
import {
  Search,
  Filter,
  Building2,
  Building,
  Bed,
  Activity,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
  RefreshCw,
  X,
  Stethoscope,
  Wind,
  MapPin,
  Flame,
  ChevronDown,
  TrendingUp
} from 'lucide-react';

export const HospitalDashboard: React.FC = () => {
  // Data states
  const [hospitals, setHospitals] = useState<HospitalItem[]>([]);
  const [clinics, setClinics] = useState<ClinicItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Tab: 'all' | 'hospitals' | 'clinics' | 'trends' | 'map'
  const [activeTab, setActiveTab] = useState<'all' | 'hospitals' | 'clinics' | 'trends' | 'map'>('all');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [bedsMin, setBedsMin] = useState<number>(0);
  const [emergencyFilter, setEmergencyFilter] = useState<'ALL' | 'true' | 'false'>('ALL');

  // Selected Hospital for Detail Modal and Trend Focus
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(null);
  const [locateFacilityId, setLocateFacilityId] = useState<number | null>(null);
  const [trendFocusHospitalId, setTrendFocusHospitalId] = useState<number | null>(null);

  // Focus trend on a specific hospital
  const handleViewHospitalTrend = (hospital: HospitalItem) => {
    setTrendFocusHospitalId(hospital.id);
    if (activeTab === 'clinics' || activeTab === 'map') {
      setActiveTab('trends');
    }
    setTimeout(() => {
      const el = document.getElementById('bed-occupancy-trend-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  // Filter options for Hospital Type
  const hospitalTypes = [
    { value: 'ALL', label: 'All Facility Types' },
    { value: 'Teaching & Trauma', label: 'Teaching & Trauma Hospital' },
    { value: 'Pediatric Trauma', label: 'Pediatric Trauma Center' },
    { value: 'Community General', label: 'Community General Hospital' },
    { value: 'Super Specialty', label: 'Super Specialty Hospital' },
  ];

  // Fetch Hospitals based on active filters
  const loadHospitals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // If user provided a raw search query with no extra filters, we can test GET /api/hospitals/search?q=
      if (searchQuery.trim() && selectedType === 'ALL' && bedsMin === 0 && emergencyFilter === 'ALL') {
        const searchRes = await searchHospitals(searchQuery.trim());
        setHospitals(searchRes.data);
      } else {
        // Query GET /api/hospitals with query parameters: ?type=&beds_min=&emergency=&q=
        const params: HospitalFilterParams = {};
        if (selectedType !== 'ALL') params.type = selectedType;
        if (bedsMin > 0) params.beds_min = bedsMin;
        if (emergencyFilter !== 'ALL') params.emergency = emergencyFilter === 'true';
        if (searchQuery.trim()) params.q = searchQuery.trim();

        const res = await getHospitals(params);
        setHospitals(res.data);
      }

      // Also fetch clinics
      const clnRes = await getClinics({
        q: searchQuery.trim() || undefined,
        emergency: emergencyFilter === 'ALL' ? undefined : emergencyFilter === 'true',
      });
      setClinics(clnRes.data);
    } catch (err: any) {
      setError(err.message || 'Error communicating with backend REST endpoints');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedType, bedsMin, emergencyFilter]);

  // Debounced load on search or filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      loadHospitals();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadHospitals]);

  // Clear all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('ALL');
    setBedsMin(0);
    setEmergencyFilter('ALL');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || selectedType !== 'ALL' || bedsMin > 0 || emergencyFilter !== 'ALL';

  // Compute aggregate statistics
  const totalHospitals = hospitals.length;
  const totalClinics = clinics.length;
  const totalAvailableBeds =
    hospitals.reduce((acc, h) => acc + (h.available_beds || 0), 0) +
    clinics.reduce((acc, c) => acc + (c.available_beds || 0), 0);
  const totalBeds =
    hospitals.reduce((acc, h) => acc + (h.beds || 0), 0) +
    clinics.reduce((acc, c) => acc + (c.beds || 0), 0);
  const emergencyReadyCount = hospitals.filter((h) => h.emergency).length;
  const totalOnDutyDoctors = hospitals.reduce((acc, h) => acc + (h.doctors?.on_duty_total || 0), 0);
  const totalIcuBeds = hospitals.reduce((acc, h) => acc + (h.resources?.icu_beds_available || 0), 0);
  const totalVentilators = hospitals.reduce((acc, h) => acc + (h.resources?.ventilators_ready || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      {/* Platform Title & Backend Status Bar */}
      <div className="bg-[#FFFCFA] border border-[#EFD5CC] rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F4B6A6] text-[#3D302C]">
                <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                Live Flask REST API Connected
              </span>
              <span className="text-xs text-[#806F68] font-mono">
                Endpoints: /api/hospitals • /api/hospitals/search • /api/hospitals/geojson
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3D302C] tracking-tight">
              Hospital Bed & Medical Resource Command Center
            </h1>
            <p className="text-xs sm:text-sm text-[#806F68] mt-1 max-w-3xl">
              Real-time synchronization of hospital beds, urgent care clinics, on-duty emergency doctors,
              and critical medical supplies across municipal health networks.
            </p>
          </div>

          <button
            type="button"
            id="refresh-platform-btn"
            onClick={loadHospitals}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-[#FCE4DC] hover:bg-[#F4B6A6] text-[#3D302C] text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-2xs border border-[#EFD5CC]"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Backend Data</span>
          </button>
        </div>

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#EFD5CC]">
          {/* Total Facilities */}
          <div className="bg-[#FFF9F5] border border-[#EFD5CC] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1 text-xs text-[#806F68]">
              <span className="font-medium">Total Facilities</span>
              <Building2 className="h-4 w-4 text-[#F4B6A6]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#3D302C]">
                {totalHospitals + totalClinics}
              </span>
              <span className="text-xs text-[#806F68]">
                ({totalHospitals} hospitals, {totalClinics} clinics)
              </span>
            </div>
          </div>

          {/* Inpatient Bed Availability */}
          <div className="bg-[#FFF9F5] border border-[#EFD5CC] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1 text-xs text-[#806F68]">
              <span className="font-medium">Available Beds</span>
              <Bed className="h-4 w-4 text-[#F4B6A6]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-700">
                {totalAvailableBeds}
              </span>
              <span className="text-xs text-[#806F68]">
                / {totalBeds} total beds
              </span>
            </div>
          </div>

          {/* Emergency Readiness */}
          <div className="bg-[#FFF9F5] border border-[#EFD5CC] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1 text-xs text-[#806F68]">
              <span className="font-medium">24/7 ER Ready</span>
              <Flame className="h-4 w-4 text-[#F4B6A6]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#3D302C]">
                {emergencyReadyCount}
              </span>
              <span className="text-xs text-[#806F68]">Active Level-1 Centers</span>
            </div>
          </div>

          {/* Medical Resource Surge Capacity */}
          <div className="bg-[#FFF9F5] border border-[#EFD5CC] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1 text-xs text-[#806F68]">
              <span className="font-medium">Critical Resources</span>
              <Activity className="h-4 w-4 text-[#F4B6A6]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#3D302C]">
                {totalIcuBeds} ICU
              </span>
              <span className="text-xs text-[#806F68]">
                • {totalVentilators} vents • {totalOnDutyDoctors} MDs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls Card */}
      <div className="bg-[#FFFCFA] border border-[#EFD5CC] rounded-3xl p-5 shadow-xs space-y-4">
        {/* Row 1: Search Bar & Primary Actions */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Hospital Search Input */}
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#806F68]" />
            <input
              type="text"
              id="input-hospital-search"
              placeholder="Search hospital by name, address, or medical specialty (e.g. Apollo, Trauma, St. Jude)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#EFD5CC] bg-[#FFF9F5] text-xs sm:text-sm text-[#3D302C] focus:outline-hidden focus:border-[#F4B6A6] transition-all placeholder:text-[#806F68]/70"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#806F68] hover:text-[#3D302C] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Clear Button if active */}
          {hasActiveFilters && (
            <button
              type="button"
              id="btn-reset-filters"
              onClick={handleResetFilters}
              className="px-3 py-2.5 rounded-xl border border-[#EFD5CC] bg-[#FFF9F5] text-xs font-semibold text-[#806F68] hover:text-[#3D302C] hover:bg-[#FCE4DC] transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Row 2: Query Filter Controls (Type, Beds Min, Emergency) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#EFD5CC]/80">
          {/* 1. Hospital Type Filter (?type=) */}
          <div>
            <label className="block text-[11px] font-bold text-[#806F68] uppercase tracking-wider mb-1">
              Hospital Type (?type=)
            </label>
            <div className="relative">
              <select
                id="select-hospital-type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full py-2 pl-3 pr-8 rounded-xl border border-[#EFD5CC] bg-[#FFF9F5] text-xs text-[#3D302C] font-medium focus:outline-hidden focus:border-[#F4B6A6] appearance-none cursor-pointer"
              >
                {hospitalTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-3.5 w-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[#806F68] pointer-events-none" />
            </div>
          </div>

          {/* 2. Minimum Beds Filter (?beds_min=) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-[#806F68] uppercase tracking-wider">
                Min Inpatient Beds (?beds_min=)
              </label>
              <span className="text-xs font-mono font-bold text-[#3D302C]">
                {bedsMin > 0 ? `${bedsMin}+ beds` : 'Any beds'}
              </span>
            </div>
            <input
              type="range"
              id="slider-beds-min"
              min="0"
              max="400"
              step="50"
              value={bedsMin}
              onChange={(e) => setBedsMin(Number(e.target.value))}
              className="w-full accent-[#F4B6A6] cursor-pointer"
            />
          </div>

          {/* 3. Emergency Department Filter (?emergency=) */}
          <div>
            <label className="block text-[11px] font-bold text-[#806F68] uppercase tracking-wider mb-1">
              Emergency Availability (?emergency=)
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#FFF9F5] border border-[#EFD5CC] rounded-xl text-xs font-semibold">
              <button
                type="button"
                id="filter-emergency-all"
                onClick={() => setEmergencyFilter('ALL')}
                className={`py-1 rounded-lg transition-colors cursor-pointer text-center ${
                  emergencyFilter === 'ALL'
                    ? 'bg-[#F4B6A6] text-[#3D302C]'
                    : 'text-[#806F68] hover:text-[#3D302C]'
                }`}
              >
                All
              </button>
              <button
                type="button"
                id="filter-emergency-true"
                onClick={() => setEmergencyFilter('true')}
                className={`py-1 rounded-lg transition-colors cursor-pointer text-center ${
                  emergencyFilter === 'true'
                    ? 'bg-[#F4B6A6] text-[#3D302C]'
                    : 'text-[#806F68] hover:text-[#3D302C]'
                }`}
              >
                24/7 ER
              </button>
              <button
                type="button"
                id="filter-emergency-false"
                onClick={() => setEmergencyFilter('false')}
                className={`py-1 rounded-lg transition-colors cursor-pointer text-center ${
                  emergencyFilter === 'false'
                    ? 'bg-[#F4B6A6] text-[#3D302C]'
                    : 'text-[#806F68] hover:text-[#3D302C]'
                }`}
              >
                Non-ER
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            <span className="text-[#806F68] font-medium">Active query params:</span>
            {searchQuery && (
              <span className="px-2.5 py-1 rounded-full bg-[#FCE4DC] text-[#3D302C] font-mono flex items-center gap-1">
                q="{searchQuery}"
                <button type="button" onClick={() => setSearchQuery('')} className="cursor-pointer">✕</button>
              </span>
            )}
            {selectedType !== 'ALL' && (
              <span className="px-2.5 py-1 rounded-full bg-[#FCE4DC] text-[#3D302C] font-mono flex items-center gap-1">
                type="{selectedType}"
                <button type="button" onClick={() => setSelectedType('ALL')} className="cursor-pointer">✕</button>
              </span>
            )}
            {bedsMin > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-[#FCE4DC] text-[#3D302C] font-mono flex items-center gap-1">
                beds_min={bedsMin}
                <button type="button" onClick={() => setBedsMin(0)} className="cursor-pointer">✕</button>
              </span>
            )}
            {emergencyFilter !== 'ALL' && (
              <span className="px-2.5 py-1 rounded-full bg-[#FCE4DC] text-[#3D302C] font-mono flex items-center gap-1">
                emergency={emergencyFilter}
                <button type="button" onClick={() => setEmergencyFilter('ALL')} className="cursor-pointer">✕</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Navigation View Sub-Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-[#EFD5CC] pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            id="tab-all-facilities"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'all'
                ? 'bg-[#F4B6A6] text-[#3D302C] shadow-2xs'
                : 'text-[#806F68] hover:text-[#3D302C] hover:bg-[#FCE4DC]/50'
            }`}
          >
            <span>All Facilities</span>
            <span className="px-1.5 py-0.5 rounded-full bg-[#FFF9F5] text-[10px] font-mono">
              {hospitals.length + clinics.length}
            </span>
          </button>

          <button
            type="button"
            id="tab-hospitals-only"
            onClick={() => setActiveTab('hospitals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'hospitals'
                ? 'bg-[#F4B6A6] text-[#3D302C] shadow-2xs'
                : 'text-[#806F68] hover:text-[#3D302C] hover:bg-[#FCE4DC]/50'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Hospitals ({hospitals.length})</span>
          </button>

          <button
            type="button"
            id="tab-clinics-only"
            onClick={() => setActiveTab('clinics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'clinics'
                ? 'bg-[#F4B6A6] text-[#3D302C] shadow-2xs'
                : 'text-[#806F68] hover:text-[#3D302C] hover:bg-[#FCE4DC]/50'
            }`}
          >
            <Building className="h-3.5 w-3.5" />
            <span>Clinics ({clinics.length})</span>
          </button>

          <button
            type="button"
            id="tab-occupancy-trends"
            onClick={() => setActiveTab('trends')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'trends'
                ? 'bg-[#F4B6A6] text-[#3D302C] shadow-2xs'
                : 'text-[#806F68] hover:text-[#3D302C] hover:bg-[#FCE4DC]/50'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5 text-[#E05D44]" />
            <span>24h Occupancy Trends</span>
          </button>

          <button
            type="button"
            id="tab-geojson-map"
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'map'
                ? 'bg-[#F4B6A6] text-[#3D302C] shadow-2xs'
                : 'text-[#806F68] hover:text-[#3D302C] hover:bg-[#FCE4DC]/50'
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>GeoJSON Map</span>
          </button>
        </div>

        <span className="text-xs text-[#806F68] hidden sm:inline">
          Showing {hospitals.length} hospitals, {clinics.length} clinics
        </span>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          id="platform-error-banner"
          className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between text-xs text-rose-900 animate-in fade-in"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold">Error loading hospital data</p>
              <p className="text-rose-700">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadHospitals}
            className="px-3 py-1.5 rounded-lg bg-rose-200 hover:bg-rose-300 font-semibold transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[#FFFCFA] rounded-2xl border border-[#EFD5CC] p-5 animate-pulse space-y-4"
            >
              <div className="h-4 bg-[#FCE4DC] rounded w-1/3" />
              <div className="h-6 bg-[#FCE4DC] rounded w-3/4" />
              <div className="h-4 bg-[#FCE4DC] rounded w-1/2" />
              <div className="h-20 bg-[#FFF9F5] border border-[#EFD5CC] rounded-xl" />
              <div className="h-8 bg-[#FCE4DC] rounded-xl w-full" />
            </div>
          ))}
        </div>
      )}

      {/* 24-Hour Bed Occupancy Historical Trend Section (Recharts) */}
      {(activeTab === 'all' || activeTab === 'trends') && !loading && (
        <BedOccupancyTrendChart
          hospitals={hospitals}
          initiallySelectedIds={trendFocusHospitalId ? [trendFocusHospitalId] : undefined}
        />
      )}

      {/* GeoJSON Map Section */}
      {(activeTab === 'map' || activeTab === 'all') && !loading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#3D302C] flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#F4B6A6]" />
              <span>Spatial GeoJSON Distribution</span>
            </h2>
            <span className="text-xs text-[#806F68] font-mono">
              RFC 7946 coordinates [lon, lat]
            </span>
          </div>
          <GeoJsonInteractiveMap
            selectedFacilityId={locateFacilityId}
            onSelectHospitalId={(id) => setSelectedHospitalId(id)}
          />
        </div>
      )}

      {/* Hospital List Section */}
      {(activeTab === 'all' || activeTab === 'hospitals') && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#3D302C] flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#F4B6A6]" />
              <span>Hospitals ({hospitals.length})</span>
            </h2>
            <span className="text-xs text-[#806F68]">
              Inpatient emergency, ICU beds & surgical facilities
            </span>
          </div>

          {hospitals.length === 0 ? (
            <div className="bg-[#FFFCFA] border border-[#EFD5CC] rounded-3xl p-12 text-center space-y-3">
              <Building2 className="h-10 w-10 text-[#806F68]/40 mx-auto" />
              <h3 className="text-base font-bold text-[#3D302C]">No matching hospitals found</h3>
              <p className="text-xs text-[#806F68] max-w-md mx-auto">
                No hospital matched your query parameters. Try adjusting your search term, lowering the minimum bed count, or clearing filters.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F4B6A6] text-[#3D302C] hover:bg-[#F4B6A6]/90 transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {hospitals.map((hospital) => (
                <HospitalCard
                  key={hospital.id}
                  hospital={hospital}
                  onSelect={(h) => setSelectedHospitalId(h.id)}
                  onLocateOnMap={(h) => {
                    setLocateFacilityId(h.id);
                    setActiveTab('map');
                  }}
                  onViewTrend={handleViewHospitalTrend}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Clinic List Section */}
      {(activeTab === 'all' || activeTab === 'clinics') && !loading && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#3D302C] flex items-center gap-2">
              <Building className="h-4 w-4 text-[#F4B6A6]" />
              <span>Outpatient Clinics & Urgent Care Centers ({clinics.length})</span>
            </h2>
            <span className="text-xs text-[#806F68]">
              Day observation beds, family practice & rapid triage
            </span>
          </div>

          {clinics.length === 0 ? (
            <div className="bg-[#FFFCFA] border border-[#EFD5CC] rounded-2xl p-8 text-center text-xs text-[#806F68]">
              No clinics matching current filter criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {clinics.map((clinic) => (
                <ClinicCard
                  key={clinic.id}
                  clinic={clinic}
                  onLocateOnMap={(c) => {
                    setLocateFacilityId(c.id);
                    setActiveTab('map');
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hospital Detail Modal triggered on user click */}
      {selectedHospitalId !== null && (
        <HospitalDetailModal
          hospitalId={selectedHospitalId}
          onClose={() => setSelectedHospitalId(null)}
          onUpdated={loadHospitals}
        />
      )}
    </div>
  );
};
