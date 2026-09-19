import React, { useState } from 'react';
import { Facility, BedItem, BedType } from '../types';
import { X, UserPlus, UserMinus, Sliders, AlertCircle, CheckCircle2, History } from 'lucide-react';

interface BedManagementModalProps {
  facility: Facility;
  onClose: () => void;
  onAllocateBed: (facilityId: number, bedType: BedType, count: number, reason: string) => void;
  onReleaseBed: (facilityId: number, bedType: BedType, count: number, reason: string) => void;
  onAdjustCapacity: (facilityId: number, bedType: BedType, totalCapacity: number, occupied: number) => void;
}

export const BedManagementModal: React.FC<BedManagementModalProps> = ({
  facility,
  onClose,
  onAllocateBed,
  onReleaseBed,
  onAdjustCapacity,
}) => {
  const [selectedBedType, setSelectedBedType] = useState<BedType>('ICU');
  const [actionType, setActionType] = useState<'allocate' | 'release' | 'adjust'>('allocate');
  const [count, setCount] = useState<number>(1);
  const [reason, setReason] = useState<string>('Emergency triage patient intake');
  const [operatorId, setOperatorId] = useState<string>('Dr. Sarah Adams (Charge Physician)');
  
  // Custom adjust fields
  const activeBed = facility.beds.find(b => b.bed_type === selectedBedType) || facility.beds[0];
  const [adjustTotal, setAdjustTotal] = useState<number>(activeBed?.total_capacity || 30);
  const [adjustOccupied, setAdjustOccupied] = useState<number>(activeBed?.occupied || 20);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (actionType === 'allocate') {
      if (activeBed && activeBed.available < count) {
        setFeedback(`Cannot allocate: only ${activeBed.available} bed(s) available.`);
        return;
      }
      onAllocateBed(facility.id, selectedBedType, count, reason);
      setFeedback(`Allocated ${count} ${selectedBedType} bed(s) successfully.`);
    } else if (actionType === 'release') {
      if (activeBed && activeBed.occupied < count) {
        setFeedback(`Cannot release: only ${activeBed.occupied} bed(s) currently occupied.`);
        return;
      }
      onReleaseBed(facility.id, selectedBedType, count, reason);
      setFeedback(`Released ${count} ${selectedBedType} bed(s) upon discharge.`);
    } else {
      if (adjustOccupied > adjustTotal) {
        setFeedback('Occupied beds cannot exceed total capacity.');
        return;
      }
      onAdjustCapacity(facility.id, selectedBedType, adjustTotal, adjustOccupied);
      setFeedback(`Ward capacity for ${selectedBedType} updated successfully.`);
    }

    setTimeout(() => {
      setFeedback(null);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#3D302C]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFF9F5] border border-[#FCE4DC] rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#3D302C]/60 hover:text-[#3D302C] hover:bg-[#FCE4DC] cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#3D302C]/70">
            Bed Inventory Controller
          </span>
          <h3 className="text-lg font-bold text-[#3D302C]">{facility.name}</h3>
          <p className="text-xs text-[#3D302C]/70">
            Atomic Bed Allocation & Discharge API Transaction Simulator
          </p>
        </div>

        {feedback && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Current Status Overview */}
        <div className="grid grid-cols-3 gap-2 mb-5 p-3 rounded-xl bg-[#FCE4DC]/40 border border-[#FCE4DC] text-center text-xs">
          <div>
            <span className="text-[11px] text-[#3D302C]/70 block">Total Capacity</span>
            <span className="font-bold text-sm text-[#3D302C]">{facility.summary.total_beds}</span>
          </div>
          <div>
            <span className="text-[11px] text-[#3D302C]/70 block">Occupied</span>
            <span className="font-bold text-sm text-amber-900">{facility.summary.occupied_beds}</span>
          </div>
          <div>
            <span className="text-[11px] text-[#3D302C]/70 block">Available Now</span>
            <span className="font-bold text-sm text-emerald-700">{facility.summary.available_beds}</span>
          </div>
        </div>

        {/* Action Type Selector */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-[#FCE4DC]/50 mb-5 text-xs">
          <button
            type="button"
            onClick={() => setActionType('allocate')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
              actionType === 'allocate'
                ? 'bg-[#F4B6A6] text-[#3D302C] shadow-xs'
                : 'text-[#3D302C]/70 hover:text-[#3D302C]'
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Admit / Allocate</span>
          </button>
          <button
            type="button"
            onClick={() => setActionType('release')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
              actionType === 'release'
                ? 'bg-[#F4B6A6] text-[#3D302C] shadow-xs'
                : 'text-[#3D302C]/70 hover:text-[#3D302C]'
            }`}
          >
            <UserMinus className="h-3.5 w-3.5" />
            <span>Discharge / Release</span>
          </button>
          <button
            type="button"
            onClick={() => setActionType('adjust')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
              actionType === 'adjust'
                ? 'bg-[#F4B6A6] text-[#3D302C] shadow-xs'
                : 'text-[#3D302C]/70 hover:text-[#3D302C]'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Adjust Ward</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Bed Type Selection */}
          <div>
            <label className="block font-semibold text-[#3D302C] mb-1">Select Department / Bed Type</label>
            <div className="grid grid-cols-3 gap-2">
              {facility.beds.map((b) => (
                <button
                  key={b.bed_type}
                  type="button"
                  onClick={() => {
                    setSelectedBedType(b.bed_type);
                    setAdjustTotal(b.total_capacity);
                    setAdjustOccupied(b.occupied);
                  }}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedBedType === b.bed_type
                      ? 'border-[#3D302C] bg-[#FCE4DC] font-bold'
                      : 'border-[#FCE4DC] bg-[#FFF9F5] hover:bg-[#FCE4DC]/40'
                  }`}
                >
                  <div className="font-bold text-[#3D302C]">{b.bed_type}</div>
                  <div className="text-[10px] text-[#3D302C]/70">
                    {b.available} of {b.total_capacity} open
                  </div>
                </button>
              ))}
            </div>
          </div>

          {actionType !== 'adjust' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#3D302C] mb-1">Quantity (Beds)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={count}
                    onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-lg border border-[#FCE4DC] bg-[#FFF9F5] text-[#3D302C] focus:outline-none focus:border-[#F4B6A6]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#3D302C] mb-1">Operator / Nurse ID</label>
                  <input
                    type="text"
                    value={operatorId}
                    onChange={(e) => setOperatorId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#FCE4DC] bg-[#FFF9F5] text-[#3D302C] focus:outline-none focus:border-[#F4B6A6]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#3D302C] mb-1">Clinical Reason / Diagnosis</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Acute Respiratory Distress, Post-op transfer"
                  className="w-full px-3 py-2 rounded-lg border border-[#FCE4DC] bg-[#FFF9F5] text-[#3D302C] focus:outline-none focus:border-[#F4B6A6]"
                />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#FCE4DC]/30 border border-[#FCE4DC]">
              <div>
                <label className="block font-semibold text-[#3D302C] mb-1">Total Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={adjustTotal}
                  onChange={(e) => setAdjustTotal(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-lg border border-[#FCE4DC] bg-[#FFF9F5] text-[#3D302C]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#3D302C] mb-1">Occupied Beds</label>
                <input
                  type="number"
                  min="0"
                  max={adjustTotal}
                  value={adjustOccupied}
                  onChange={(e) => setAdjustOccupied(Math.min(adjustTotal, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 rounded-lg border border-[#FCE4DC] bg-[#FFF9F5] text-[#3D302C]"
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#FCE4DC]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#FCE4DC] text-[#3D302C] hover:bg-[#FCE4DC]/50 cursor-pointer font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#F4B6A6] text-[#3D302C] hover:bg-[#F4B6A6]/90 cursor-pointer font-bold shadow-xs"
            >
              {actionType === 'allocate' ? 'Admit Patient (POST /allocate)' : actionType === 'release' ? 'Discharge Patient (POST /release)' : 'Update Ward (PATCH /beds)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
