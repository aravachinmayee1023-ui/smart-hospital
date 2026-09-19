import React from 'react';
import { ClinicItem } from '../services/api';
import {
  Building,
  MapPin,
  Bed,
  CheckCircle2,
  Stethoscope,
  Activity,
  AlertCircle
} from 'lucide-react';

interface ClinicCardProps {
  clinic: ClinicItem;
  onLocateOnMap?: (clinic: ClinicItem) => void;
}

export const ClinicCard: React.FC<ClinicCardProps> = ({ clinic, onLocateOnMap }) => {
  return (
    <div
      id={`clinic-card-${clinic.id}`}
      className="bg-[#FFFCFA] rounded-2xl border border-[#EFD5CC] p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#FCE4DC] text-[#3D302C] mb-1">
              {clinic.type}
            </span>
            <h3 className="text-base font-bold text-[#3D302C] tracking-tight line-clamp-1">
              {clinic.name}
            </h3>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EFD5CC]/60 text-[#806F68] shrink-0">
            <AlertCircle className="h-3 w-3 text-[#806F68]" />
            <span>Outpatient Day Care</span>
          </span>
        </div>

        {/* Address */}
        <div className="flex items-center gap-1.5 text-xs text-[#806F68] mb-3">
          <MapPin className="h-3.5 w-3.5 text-[#F4B6A6] shrink-0" />
          <span className="truncate">{clinic.address}</span>
        </div>

        {/* Bed & Triage Stats */}
        <div className="bg-[#FFF9F5] border border-[#EFD5CC] rounded-xl p-3 mb-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Bed className="h-4 w-4 text-[#F4B6A6]" />
            <div>
              <p className="text-[11px] text-[#806F68]">Observation Beds</p>
              <p className="font-bold text-[#3D302C]">
                {clinic.available_beds} <span className="text-[#806F68] font-normal">/ {clinic.beds} open</span>
              </p>
            </div>
          </div>

          {clinic.doctors && (
            <div className="flex items-center gap-2 border-l border-[#EFD5CC] pl-3">
              <Stethoscope className="h-4 w-4 text-[#806F68]" />
              <div>
                <p className="text-[11px] text-[#806F68]">Triage Staff</p>
                <p className="font-bold text-[#3D302C]">{clinic.doctors.on_duty_total} On Duty</p>
              </div>
            </div>
          )}
        </div>

        {/* Specialties */}
        {clinic.specialties && clinic.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {clinic.specialties.map((spec, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-0.5 rounded-md bg-[#FCE4DC]/50 text-[#3D302C] border border-[#EFD5CC]/60"
              >
                {spec}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-[#EFD5CC] flex items-center justify-between">
        <span className="text-[11px] font-mono text-[#806F68]">
          [{clinic.longitude.toFixed(4)}, {clinic.latitude.toFixed(4)}]
        </span>
        <button
          type="button"
          onClick={() => onLocateOnMap?.(clinic)}
          className="px-3 py-1 rounded-lg text-xs font-bold bg-[#F4B6A6] text-[#3D302C] hover:bg-[#F4B6A6]/90 transition-colors cursor-pointer"
        >
          View on Map
        </button>
      </div>
    </div>
  );
};
