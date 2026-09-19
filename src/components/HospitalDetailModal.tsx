import React, { useState, useEffect } from 'react';
import { HospitalItem, getHospitalById, updateHospital } from '../services/api';
import {
  X,
  Building2,
  MapPin,
  Phone,
  Bed,
  Activity,
  Stethoscope,
  Wind,
  Droplet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Plus,
  Minus
} from 'lucide-react';

interface HospitalDetailModalProps {
  hospitalId: number;
  onClose: () => void;
  onUpdated?: () => void;
}

export const HospitalDetailModal: React.FC<HospitalDetailModalProps> = ({
  hospitalId,
  onClose,
  onUpdated,
}) => {
  const [hospital, setHospital] = useState<HospitalItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getHospitalById(hospitalId);
      setHospital(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load hospital details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [hospitalId]);

  const handleAdjustBed = async (delta: number) => {
    if (!hospital || isUpdating) return;
    const newAvailable = Math.max(0, Math.min(hospital.beds, hospital.available_beds + delta));
    try {
      setIsUpdating(true);
      const res = await updateHospital(hospital.id, { available_beds: newAvailable });
      setHospital(res.data);
      onUpdated?.();
    } catch (err: any) {
      alert(`Could not adjust beds: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      id="hospital-detail-modal-overlay"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        id="hospital-detail-modal"
        className="bg-[#FFF9F5] border border-[#EFD5CC] w-full max-w-2xl rounded-3xl shadow-xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="bg-[#FCE4DC] border-b border-[#EFD5CC] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#F4B6A6] flex items-center justify-center text-[#3D302C] shadow-xs">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#806F68] uppercase tracking-wider">
                Hospital Profile & Resources
              </span>
              <h2 className="text-lg font-bold text-[#3D302C] leading-tight">
                {hospital ? hospital.name : `Hospital #${hospitalId}`}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-[#FFF9F5] hover:bg-white text-[#806F68] hover:text-[#3D302C] flex items-center justify-center transition-colors cursor-pointer border border-[#EFD5CC]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-[#806F68]">
              <RefreshCw className="h-6 w-6 animate-spin text-[#F4B6A6]" />
              <p className="text-xs">Fetching live hospital record from GET /api/hospitals/{hospitalId}...</p>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-900 flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={fetchDetail}
                className="px-3 py-1 bg-rose-100 rounded-lg font-medium hover:bg-rose-200 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {hospital && !loading && (
            <>
              {/* Status & Coordinate Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FCE4DC] text-[#3D302C] border border-[#EFD5CC]">
                  {hospital.type}
                </span>

                {hospital.emergency ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F4B6A6] text-[#3D302C]">
                    <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                    24/7 Level-1 Emergency Department
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EFD5CC]/80 text-[#806F68]">
                    Non-Emergency Facility
                  </span>
                )}

                <span className="font-mono text-xs text-[#806F68] bg-[#FFFCFA] border border-[#EFD5CC] px-2.5 py-1 rounded-full">
                  RFC 7946 [{hospital.longitude.toFixed(4)}, {hospital.latitude.toFixed(4)}]
                </span>
              </div>

              {/* Address info */}
              <div className="bg-[#FFFCFA] border border-[#EFD5CC] rounded-2xl p-4 flex items-center justify-between text-xs text-[#3D302C]">
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-[#F4B6A6] shrink-0" />
                  <span>{hospital.address}</span>
                </div>
                {hospital.phone && (
                  <div className="flex items-center gap-1.5 text-[#806F68] font-mono">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{hospital.phone}</span>
                  </div>
                )}
              </div>

              {/* Bed Capacity and Real-Time Adjustment */}
              <div className="bg-[#FFFCFA] border border-[#EFD5CC] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-[#FCE4DC] flex items-center justify-center text-[#3D302C]">
                      <Bed className="h-5 w-5 text-[#F4B6A6]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#3D302C]">Inpatient Bed Capacity</h4>
                      <p className="text-xs text-[#806F68]">Live bed availability & triage intake</p>
                    </div>
                  </div>

                  {/* Bed delta triggers */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isUpdating || hospital.available_beds <= 0}
                      onClick={() => handleAdjustBed(-1)}
                      className="h-8 w-8 rounded-lg bg-[#FFF9F5] border border-[#EFD5CC] flex items-center justify-center text-[#3D302C] hover:bg-[#FCE4DC] disabled:opacity-40 cursor-pointer"
                      title="Admit Patient (Occupy Bed)"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="font-mono text-sm font-bold text-[#3D302C] min-w-8 text-center">
                      {hospital.available_beds}
                    </span>
                    <button
                      type="button"
                      disabled={isUpdating || hospital.available_beds >= hospital.beds}
                      onClick={() => handleAdjustBed(1)}
                      className="h-8 w-8 rounded-lg bg-[#FFF9F5] border border-[#EFD5CC] flex items-center justify-center text-[#3D302C] hover:bg-[#FCE4DC] disabled:opacity-40 cursor-pointer"
                      title="Discharge Patient (Free Bed)"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="bg-[#FFF9F5] border border-[#EFD5CC] rounded-xl p-3 text-center">
                    <p className="text-[11px] text-[#806F68]">Total Beds</p>
                    <p className="text-base font-bold text-[#3D302C]">{hospital.beds}</p>
                  </div>
                  <div className="bg-[#FFF9F5] border border-[#EFD5CC] rounded-xl p-3 text-center">
                    <p className="text-[11px] text-[#806F68]">Available</p>
                    <p className="text-base font-bold text-emerald-700">{hospital.available_beds}</p>
                  </div>
                  <div className="bg-[#FFF9F5] border border-[#EFD5CC] rounded-xl p-3 text-center">
                    <p className="text-[11px] text-[#806F68]">Occupancy</p>
                    <p className="text-base font-bold text-[#3D302C]">
                      {hospital.beds > 0
                        ? Math.round(((hospital.beds - hospital.available_beds) / hospital.beds) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Doctor / Medical Resource Availability */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Doctors On Duty */}
                <div className="bg-[#FFFCFA] border border-[#EFD5CC] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#3D302C]">
                    <Stethoscope className="h-4 w-4 text-[#F4B6A6]" />
                    <span>Doctor & Staff Availability</span>
                  </div>

                  {hospital.doctors ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-[#EFD5CC]/60">
                        <span className="text-[#806F68]">Emergency Physicians</span>
                        <span className="font-bold text-[#3D302C]">{hospital.doctors.emergency_physicians} on duty</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#EFD5CC]/60">
                        <span className="text-[#806F68]">Trauma Surgeons</span>
                        <span className="font-bold text-[#3D302C]">{hospital.doctors.trauma_surgeons} on duty</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#EFD5CC]/60">
                        <span className="text-[#806F68]">ICU Specialized Nurses</span>
                        <span className="font-bold text-[#3D302C]">{hospital.doctors.icu_nurses} active</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="font-semibold text-[#3D302C]">Total Staff Present</span>
                        <span className="font-bold text-emerald-700">{hospital.doctors.on_duty_total} personnel</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#806F68]">Staffing roster updated upon shift change.</p>
                  )}
                </div>

                {/* Medical Critical Resources */}
                <div className="bg-[#FFFCFA] border border-[#EFD5CC] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#3D302C]">
                    <Activity className="h-4 w-4 text-[#F4B6A6]" />
                    <span>Critical Resource Stock</span>
                  </div>

                  {hospital.resources ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-[#EFD5CC]/60">
                        <span className="text-[#806F68]">ICU Beds Available</span>
                        <span className="font-bold text-[#3D302C]">{hospital.resources.icu_beds_available} beds</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#EFD5CC]/60">
                        <span className="text-[#806F68]">Ventilators Ready</span>
                        <span className="font-bold text-[#3D302C]">{hospital.resources.ventilators_ready} units</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#EFD5CC]/60">
                        <span className="text-[#806F68]">Oxygen Reserves</span>
                        <span className="font-bold text-emerald-700">{hospital.resources.oxygen_reserves_percent}% normal</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-[#806F68]">Blood Bank Units</span>
                        <span className="font-bold text-[#3D302C]">{hospital.resources.blood_units_available} units</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#806F68]">Critical resources monitored by pharmacy gateway.</p>
                  )}
                </div>
              </div>

              {/* Specialties List */}
              {hospital.specialties && (
                <div className="bg-[#FFFCFA] border border-[#EFD5CC] rounded-2xl p-4">
                  <h4 className="text-xs font-bold text-[#3D302C] mb-2.5">Medical Specialties & Departments</h4>
                  <div className="flex flex-wrap gap-2">
                    {hospital.specialties.map((s, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-lg text-xs bg-[#FFF9F5] border border-[#EFD5CC] text-[#3D302C] font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#FFF9F5] border-t border-[#EFD5CC] px-6 py-3.5 flex items-center justify-between text-xs text-[#806F68]">
          <span className="font-mono text-[11px]">Synced with Flask REST backend</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg font-bold bg-[#F4B6A6] text-[#3D302C] hover:bg-[#F4B6A6]/90 transition-colors cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
