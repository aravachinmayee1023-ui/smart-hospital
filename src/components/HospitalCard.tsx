import React from 'react';
import { HospitalItem } from '../services/api';
import {
  Building2,
  MapPin,
  Phone,
  Bed,
  Activity,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Wind,
  Droplet,
  ChevronRight,
  Sparkles,
  TrendingUp
} from 'lucide-react';

interface HospitalCardProps {
  hospital: HospitalItem;
  onSelect: (hospital: HospitalItem) => void;
  onLocateOnMap?: (hospital: HospitalItem) => void;
  onViewTrend?: (hospital: HospitalItem) => void;
}

export const HospitalCard: React.FC<HospitalCardProps> = ({
  hospital,
  onSelect,
  onLocateOnMap,
  onViewTrend,
}) => {
  const availablePercent =
    hospital.beds > 0
      ? Math.round((hospital.available_beds / hospital.beds) * 100)
      : 0;

  return (
    <div
      id={`hospital-card-${hospital.id}`}
      className="bg-[#FFFCFA] rounded-2xl border border-[#EFD5CC] p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
    >
      <div>
        {/* Header: Title, Type Badge & Emergency Pill */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FCE4DC] text-[#3D302C]">
                {hospital.type}
              </span>
              {hospital.distance_km !== undefined && (
                <span className="text-xs font-mono text-[#806F68]">
                  {hospital.distance_km} km away
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-[#3D302C] tracking-tight group-hover:text-[#3D302C] transition-colors line-clamp-1">
              {hospital.name}
            </h3>
          </div>

          {/* Emergency Availability Indicator */}
          {hospital.emergency ? (
            <div
              id={`emergency-badge-${hospital.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F4B6A6] text-[#3D302C] shrink-0 shadow-2xs"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>24/7 ER Active</span>
            </div>
          ) : (
            <div
              id={`no-emergency-badge-${hospital.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EFD5CC]/60 text-[#806F68] shrink-0"
            >
              <AlertCircle className="h-3 w-3 text-[#806F68]" />
              <span>No ER Dept</span>
            </div>
          )}
        </div>

        {/* Address & Contact */}
        <div className="flex items-center gap-2 text-xs text-[#806F68] mb-4">
          <MapPin className="h-3.5 w-3.5 text-[#F4B6A6] shrink-0" />
          <span className="truncate">{hospital.address}</span>
        </div>

        {/* Inpatient Bed Metrics Bar */}
        <div className="bg-[#FFF9F5] border border-[#EFD5CC] rounded-xl p-3.5 mb-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-medium text-[#3D302C]">
              <Bed className="h-4 w-4 text-[#F4B6A6]" />
              <span>Inpatient Beds</span>
            </div>
            <div className="font-mono text-xs">
              <span className="font-bold text-[#3D302C] text-sm">{hospital.available_beds}</span>
              <span className="text-[#806F68]"> / {hospital.beds} available</span>
            </div>
          </div>

          {/* Bed capacity progress bar */}
          <div className="w-full bg-[#EFD5CC]/50 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                availablePercent > 25
                  ? 'bg-[#F4B6A6]'
                  : availablePercent > 10
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, availablePercent))}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[#806F68]">
            <span>Capacity Occupancy</span>
            <span className="font-semibold text-[#3D302C]">
              {100 - availablePercent}% occupied
            </span>
          </div>
        </div>

        {/* Doctor & Medical Resource Availability */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {hospital.doctors && (
            <div className="bg-[#FFF9F5] rounded-xl p-2.5 border border-[#EFD5CC]/80 flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#FCE4DC] flex items-center justify-center text-[#3D302C] shrink-0">
                <Stethoscope className="h-4 w-4 text-[#3D302C]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-[#806F68] font-medium leading-none mb-1">On-Duty Medical</p>
                <p className="text-xs font-bold text-[#3D302C]">
                  {hospital.doctors.on_duty_total} Staff
                  <span className="text-[10px] font-normal text-[#806F68] ml-1">
                    ({hospital.doctors.emergency_physicians} ER MDs)
                  </span>
                </p>
              </div>
            </div>
          )}

          {hospital.resources && (
            <div className="bg-[#FFF9F5] rounded-xl p-2.5 border border-[#EFD5CC]/80 flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#FCE4DC] flex items-center justify-center text-[#3D302C] shrink-0">
                <Wind className="h-4 w-4 text-[#3D302C]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-[#806F68] font-medium leading-none mb-1">Ventilators / ICU</p>
                <p className="text-xs font-bold text-[#3D302C]">
                  {hospital.resources.ventilators_ready} Ready
                  <span className="text-[10px] font-normal text-[#806F68] ml-1">
                    ({hospital.resources.icu_beds_available} ICU)
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Specialties Tags */}
        {hospital.specialties && hospital.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {hospital.specialties.slice(0, 3).map((spec, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-0.5 rounded-md bg-[#FCE4DC]/60 text-[#3D302C] border border-[#EFD5CC]/60"
              >
                {spec}
              </span>
            ))}
            {hospital.specialties.length > 3 && (
              <span className="text-[11px] px-1.5 py-0.5 rounded-md text-[#806F68]">
                +{hospital.specialties.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-[#EFD5CC] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onLocateOnMap?.(hospital)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#806F68] hover:text-[#3D302C] hover:bg-[#FCE4DC]/50 transition-colors flex items-center gap-1 cursor-pointer"
            title="Locate facility on GeoJSON spatial map"
          >
            <MapPin className="h-3.5 w-3.5 text-[#F4B6A6]" />
            <span>Map</span>
          </button>

          {onViewTrend && (
            <button
              type="button"
              onClick={() => onViewTrend(hospital)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#806F68] hover:text-[#3D302C] hover:bg-[#FCE4DC]/50 transition-colors flex items-center gap-1 cursor-pointer"
              title="View 24-hour occupancy historical graph"
            >
              <TrendingUp className="h-3.5 w-3.5 text-[#E05D44]" />
              <span>24h Trend</span>
            </button>
          )}
        </div>

        <button
          type="button"
          id={`view-details-btn-${hospital.id}`}
          onClick={() => onSelect(hospital)}
          className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#F4B6A6] text-[#3D302C] hover:bg-[#F4B6A6]/90 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
        >
          <span>Details</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
