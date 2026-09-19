import React, { useState, useMemo } from 'react';
import { Facility, BedType, AuditLogItem } from '../types';
import {
  Search,
  Filter,
  Building2,
  Phone,
  MapPin,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  PlusCircle,
  History,
  Bed,
  RefreshCw
} from 'lucide-react';

interface LivePlatformViewProps {
  facilities: Facility[];
  auditLogs: AuditLogItem[];
  onOpenBedModal: (facility: Facility) => void;
  onQuickAllocate: (facilityId: number, bedType: BedType) => void;
  onQuickRelease: (facilityId: number, bedType: BedType) => void;
  onResetData: () => void;
}

export const LivePlatformView: React.FC<LivePlatformViewProps> = ({
  facilities,
  auditLogs,
  onOpenBedModal,
  onQuickAllocate,
  onQuickRelease,
  onResetData
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'ALL' | 'HOSPITAL' | 'CLINIC'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [minIcu, setMinIcu] = useState<number>(0);
  const [hasEmergencyOnly, setHasEmergencyOnly] = useState<boolean>(false);
  const [showAuditLogs, setShowAuditLogs] = useState<boolean>(false);

  // User simulated GPS origin (San Francisco City Center)
  const userLat = 37.7749;
  const userLng = -122.4194;

  const filteredFacilities = useMemo(() => {
    return facilities.filter((f) => {
      // Keyword search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = f.name.toLowerCase().includes(q);
        const matchCity = f.city.toLowerCase().includes(q);
        const matchAddress = f.address.toLowerCase().includes(q);
        if (!matchName && !matchCity && !matchAddress) return false;
      }

      // Facility type
      if (selectedType !== 'ALL' && f.facility_type !== selectedType) {
        return false;
      }

      // Emergency status
      if (selectedStatus !== 'ALL' && f.emergency_status !== selectedStatus) {
        return false;
      }

      // Emergency department
      if (hasEmergencyOnly && !f.has_emergency_dept) {
        return false;
      }

      // Minimum ICU beds
      if (minIcu > 0 && f.summary.icu_available < minIcu) {
        return false;
      }

      return true;
    });
  }, [facilities, searchQuery, selectedType, selectedStatus, hasEmergencyOnly, minIcu]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Search & Filter Control Bar */}
      <div className="bg-[#FFF9F5] border border-[#FCE4DC] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3D302C]/50" />
            <input
              type="text"
              id="input-facility-search"
              placeholder="Search hospitals, clinics, or address (e.g. St. Jude, Mission Bay)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#FCE4DC] bg-[#FFF9F5] text-xs text-[#3D302C] focus:outline-none focus:border-[#F4B6A6] transition-all"
            />
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {(['ALL', 'HOSPITAL', 'CLINIC'] as const).map((type) => (
              <button
                key={type}
                id={`filter-type-${type.toLowerCase()}`}
                onClick={() => setSelectedType(type)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  selectedType === type
                    ? 'bg-[#3D302C] text-[#FFF9F5]'
                    : 'bg-[#FCE4DC]/60 text-[#3D302C] hover:bg-[#FCE4DC]'
                }`}
              >
                {type === 'ALL' ? 'All Facilities' : type === 'HOSPITAL' ? 'Hospitals Only' : 'Clinics Only'}
              </button>
            ))}

            <button
              onClick={onResetData}
              title="Reset to Initial Seed Data"
              className="p-2 rounded-xl border border-[#FCE4DC] text-[#3D302C]/80 hover:bg-[#FCE4DC] cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Secondary Filter Row */}
        <div className="pt-3 border-t border-[#FCE4DC] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[#3D302C]/70 font-semibold">Triage Status:</span>
              <select
                id="select-emergency-status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-[#FCE4DC] bg-[#FFF9F5] text-xs text-[#3D302C] focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="NORMAL">Normal</option>
                <option value="ELEVATED">Elevated Surge</option>
                <option value="DIVERTING">Diverting Ambulance</option>
                <option value="CRITICAL">Critical Capacity</option>
              </select>
            </div>

            {/* Minimum ICU Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[#3D302C]/70 font-semibold">Min ICU Beds:</span>
              <select
                id="select-min-icu"
                value={minIcu}
                onChange={(e) => setMinIcu(parseInt(e.target.value))}
                className="px-2.5 py-1.5 rounded-lg border border-[#FCE4DC] bg-[#FFF9F5] text-xs text-[#3D302C] focus:outline-none"
              >
                <option value={0}>Any</option>
                <option value={1}>1+ Beds</option>
                <option value={5}>5+ Beds</option>
                <option value={8}>8+ Beds</option>
              </select>
            </div>

            {/* Emergency Dept Only */}
            <label className="flex items-center gap-2 font-semibold text-[#3D302C] cursor-pointer">
              <input
                type="checkbox"
                checked={hasEmergencyOnly}
                onChange={(e) => setHasEmergencyOnly(e.target.checked)}
                className="rounded text-[#3D302C] focus:ring-0"
              />
              <span>24/7 ER Dept Only</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAuditLogs(!showAuditLogs)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FCE4DC]/70 hover:bg-[#FCE4DC] text-[#3D302C] font-semibold transition-all cursor-pointer"
            >
              <History className="h-3.5 w-3.5" />
              <span>{showAuditLogs ? 'Hide Audit Trail' : 'View Audit Trail'}</span>
            </button>
            <span className="font-mono text-[11px] text-[#3D302C]/70">
              Showing {filteredFacilities.length} of {facilities.length}
            </span>
          </div>
        </div>
      </div>

      {/* Audit Trail Drawer/Accordion */}
      {showAuditLogs && (
        <div className="bg-[#FFF9F5] border border-[#FCE4DC] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#3D302C] flex items-center gap-2">
              <History className="h-4 w-4 text-[#3D302C]" />
              Immutable Bed Allocation Audit Trail (Real-time DB Logs)
            </h3>
            <span className="font-mono text-[11px] text-[#3D302C]/70">
              Logged via BedService & BedAuditLog ORM
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#FCE4DC] text-[#3D302C]/70 font-semibold">
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3">Facility</th>
                  <th className="py-2 px-3">Ward</th>
                  <th className="py-2 px-3">Action</th>
                  <th className="py-2 px-3">Operator</th>
                  <th className="py-2 px-3">Reason</th>
                  <th className="py-2 px-3 text-right">Available After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FCE4DC]/50 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FCE4DC]/30">
                    <td className="py-2 px-3 text-[#3D302C]/70">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2 px-3 font-sans font-medium text-[#3D302C]">
                      {log.facility_name || `Facility #${log.facility_id}`}
                    </td>
                    <td className="py-2 px-3 font-bold text-[#3D302C]">{log.bed_type}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action === 'ALLOCATE' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {log.action} ({log.quantity_changed > 0 ? `+${log.quantity_changed}` : log.quantity_changed})
                      </span>
                    </td>
                    <td className="py-2 px-3 font-sans text-[#3D302C]/80">{log.operator_id}</td>
                    <td className="py-2 px-3 font-sans text-[#3D302C]/80">{log.reason}</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-800">
                      {log.resulting_available}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFacilities.map((fac) => {
          const occupancy = fac.summary.occupancy_rate_percent;
          const isDiverting = fac.emergency_status === 'DIVERTING';
          const isCritical = fac.emergency_status === 'CRITICAL';
          const isElevated = fac.emergency_status === 'ELEVATED';

          return (
            <div
              key={fac.id}
              id={`facility-card-${fac.id}`}
              className={`bg-[#FFF9F5] border rounded-2xl p-5 shadow-xs transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                isDiverting
                  ? 'border-amber-400 ring-1 ring-amber-400/40'
                  : isCritical
                  ? 'border-red-400 ring-1 ring-red-400/40'
                  : 'border-[#FCE4DC]'
              }`}
            >
              <div>
                {/* Header Tag Row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FCE4DC] text-[#3D302C]">
                      {fac.facility_type}
                    </span>
                    {fac.has_emergency_dept ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900">
                        24/7 ER
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#FCE4DC]/60 text-[#3D302C]/70">
                        Outpatient
                      </span>
                    )}
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      isDiverting
                        ? 'bg-amber-100 text-amber-900 animate-pulse'
                        : isCritical
                        ? 'bg-red-100 text-red-900'
                        : isElevated
                        ? 'bg-orange-100 text-orange-900'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    {isDiverting && <AlertTriangle className="h-3 w-3" />}
                    <span>{fac.emergency_status}</span>
                  </span>
                </div>

                {/* Facility Name & Contact */}
                <h3 className="text-base font-bold text-[#3D302C] leading-snug">{fac.name}</h3>
                <div className="mt-2 space-y-1 text-xs text-[#3D302C]/70">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[#3D302C]/60" />
                    <span>{fac.address}, {fac.city}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-[#3D302C]/60" />
                    <span>{fac.phone}</span>
                  </p>
                </div>

                {/* Occupancy Progress Gauge */}
                <div className="mt-4 p-3 rounded-xl bg-[#FCE4DC]/40 border border-[#FCE4DC]">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-[#3D302C]">Bed Occupancy</span>
                    <span className="font-mono font-bold text-[#3D302C]">
                      {fac.summary.occupied_beds} / {fac.summary.total_beds} ({occupancy}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#FCE4DC] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        occupancy >= 95
                          ? 'bg-amber-600'
                          : occupancy >= 85
                          ? 'bg-orange-500'
                          : 'bg-[#F4B6A6]'
                      }`}
                      style={{ width: `${Math.min(100, occupancy)}%` }}
                    />
                  </div>

                  {/* Bed Breakdown Chips */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#FCE4DC]/60 text-center">
                    <div>
                      <span className="text-[10px] text-[#3D302C]/70 block font-medium">ICU Open</span>
                      <span className="font-mono font-bold text-xs text-emerald-800">
                        {fac.summary.icu_available}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#3D302C]/70 block font-medium">Ventilator</span>
                      <span className="font-mono font-bold text-xs text-[#3D302C]">
                        {fac.summary.ventilator_available}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#3D302C]/70 block font-medium">Total Open</span>
                      <span className="font-mono font-bold text-xs text-emerald-800">
                        {fac.summary.available_beds}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-[#FCE4DC] flex items-center gap-2">
                <button
                  id={`btn-manage-beds-${fac.id}`}
                  onClick={() => onOpenBedModal(fac)}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#F4B6A6] text-[#3D302C] font-bold text-xs hover:bg-[#F4B6A6]/90 transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Bed className="h-3.5 w-3.5" />
                  <span>Manage Beds</span>
                </button>
                <button
                  onClick={() => onQuickAllocate(fac.id, 'ICU')}
                  disabled={fac.summary.icu_available <= 0}
                  title="Quick Admit ICU Patient (+1)"
                  className="p-2 rounded-xl border border-[#FCE4DC] text-[#3D302C] hover:bg-[#FCE4DC] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFacilities.length === 0 && (
        <div className="text-center py-12 bg-[#FFF9F5] border border-[#FCE4DC] rounded-2xl">
          <Building2 className="h-8 w-8 text-[#3D302C]/40 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#3D302C]">No Facilities Found</h3>
          <p className="text-xs text-[#3D302C]/70 mt-1">
            Try loosening your filters or search keywords.
          </p>
        </div>
      )}
    </div>
  );
};
