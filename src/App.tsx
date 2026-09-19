import React, { useState } from 'react';
import { Facility, BedType, AuditLogItem } from './types';
import { INITIAL_FACILITIES, INITIAL_AUDIT_LOGS } from './data/initialData';
import { Navbar } from './components/Navbar';
import { HospitalDashboard } from './components/HospitalDashboard';
import { LivePlatformView } from './components/LivePlatformView';
import { GeoJsonMapView } from './components/GeoJsonMapView';
import { ApiDirectoryView } from './components/ApiDirectoryView';
import { CodeInspectorView } from './components/CodeInspectorView';
import { BedManagementModal } from './components/BedManagementModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [facilities, setFacilities] = useState<Facility[]>(INITIAL_FACILITIES);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [selectedBedFacility, setSelectedBedFacility] = useState<Facility | null>(null);

  // Recalculate summary metrics for a facility
  const recalculateSummary = (fac: Facility) => {
    const total_beds = fac.beds.reduce((acc, b) => acc + b.total_capacity, 0);
    const occupied_beds = fac.beds.reduce((acc, b) => acc + b.occupied, 0);
    const available_beds = Math.max(0, total_beds - occupied_beds);
    const icu = fac.beds.find((b) => b.bed_type === 'ICU');
    const vent = fac.beds.find((b) => b.bed_type === 'VENTILATOR');
    const occupancy_rate_percent = total_beds > 0 ? Number(((occupied_beds / total_beds) * 100).toFixed(1)) : 0;

    let emergency_status = fac.emergency_status;
    if (occupancy_rate_percent >= 95 && emergency_status !== 'DIVERTING' && emergency_status !== 'CLOSED') {
      emergency_status = 'DIVERTING';
    } else if (occupancy_rate_percent < 85 && emergency_status === 'DIVERTING') {
      emergency_status = 'NORMAL';
    }

    return {
      ...fac,
      emergency_status,
      summary: {
        total_beds,
        occupied_beds,
        available_beds,
        icu_available: icu ? icu.available : 0,
        ventilator_available: vent ? vent.available : 0,
        occupancy_rate_percent
      }
    };
  };

  // 1. Allocate bed (patient admission)
  const handleAllocateBed = (facilityId: number, bedType: BedType, count: number, reason: string) => {
    setFacilities((prev) =>
      prev.map((f) => {
        if (f.id !== facilityId) return f;
        const updatedBeds = f.beds.map((b) => {
          if (b.bed_type !== bedType) return b;
          const newOccupied = Math.min(b.total_capacity, b.occupied + count);
          const newAvailable = Math.max(0, b.total_capacity - newOccupied);
          return {
            ...b,
            occupied: newOccupied,
            available: newAvailable
          };
        });

        const updatedFac = recalculateSummary({ ...f, beds: updatedBeds });
        const targetBed = updatedFac.beds.find((b) => b.bed_type === bedType);

        // Add audit trail entry
        const newLog: AuditLogItem = {
          id: Date.now(),
          facility_id: f.id,
          facility_name: f.name,
          bed_type: bedType,
          action: 'ALLOCATE',
          quantity_changed: count,
          resulting_occupied: targetBed?.occupied || 0,
          resulting_available: targetBed?.available || 0,
          operator_id: 'Dr. Sarah Adams (Charge MD)',
          reason: reason || 'Emergency admission',
          timestamp: new Date().toISOString()
        };
        setAuditLogs((prevLogs) => [newLog, ...prevLogs]);

        return updatedFac;
      })
    );
  };

  // 2. Release bed (patient discharge)
  const handleReleaseBed = (facilityId: number, bedType: BedType, count: number, reason: string) => {
    setFacilities((prev) =>
      prev.map((f) => {
        if (f.id !== facilityId) return f;
        const updatedBeds = f.beds.map((b) => {
          if (b.bed_type !== bedType) return b;
          const newOccupied = Math.max(0, b.occupied - count);
          const newAvailable = Math.max(0, b.total_capacity - newOccupied);
          return {
            ...b,
            occupied: newOccupied,
            available: newAvailable
          };
        });

        const updatedFac = recalculateSummary({ ...f, beds: updatedBeds });
        const targetBed = updatedFac.beds.find((b) => b.bed_type === bedType);

        const newLog: AuditLogItem = {
          id: Date.now(),
          facility_id: f.id,
          facility_name: f.name,
          bed_type: bedType,
          action: 'RELEASE',
          quantity_changed: -count,
          resulting_occupied: targetBed?.occupied || 0,
          resulting_available: targetBed?.available || 0,
          operator_id: 'Nurse Station',
          reason: reason || 'Routine patient discharge',
          timestamp: new Date().toISOString()
        };
        setAuditLogs((prevLogs) => [newLog, ...prevLogs]);

        return updatedFac;
      })
    );
  };

  // 3. Ward capacity adjustment
  const handleAdjustCapacity = (facilityId: number, bedType: BedType, totalCapacity: number, occupied: number) => {
    setFacilities((prev) =>
      prev.map((f) => {
        if (f.id !== facilityId) return f;
        const updatedBeds = f.beds.map((b) => {
          if (b.bed_type !== bedType) return b;
          const newAvailable = Math.max(0, totalCapacity - occupied);
          return {
            ...b,
            total_capacity: totalCapacity,
            occupied,
            available: newAvailable
          };
        });
        return recalculateSummary({ ...f, beds: updatedBeds });
      })
    );
  };

  // Quick single admission
  const handleQuickAllocate = (facilityId: number, bedType: BedType) => {
    handleAllocateBed(facilityId, bedType, 1, 'Quick triage intake');
  };

  const handleQuickRelease = (facilityId: number, bedType: BedType) => {
    handleReleaseBed(facilityId, bedType, 1, 'Quick ward discharge');
  };

  const handleResetData = () => {
    setFacilities(INITIAL_FACILITIES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
  };

  // Operational metrics for top navigation
  const divertingCount = facilities.filter((f) => f.emergency_status === 'DIVERTING').length;
  const availableIcuCount = facilities.reduce((acc, f) => acc + f.summary.icu_available, 0);

  return (
    <div className="min-h-screen bg-[#FFF9F5] text-[#3D302C] flex flex-col selection:bg-[#F4B6A6] selection:text-[#3D302C]">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        divertingCount={divertingCount}
        availableIcuCount={availableIcuCount}
        totalFacilities={facilities.length}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'dashboard' && <HospitalDashboard />}

        {activeTab === 'geojson' && <GeoJsonMapView facilities={facilities} />}

        {activeTab === 'platform' && (
          <LivePlatformView
            facilities={facilities}
            auditLogs={auditLogs}
            onOpenBedModal={(fac) => setSelectedBedFacility(fac)}
            onQuickAllocate={handleQuickAllocate}
            onQuickRelease={handleQuickRelease}
            onResetData={handleResetData}
          />
        )}

        {activeTab === 'api' && <ApiDirectoryView />}

        {activeTab === 'code' && <CodeInspectorView />}
      </main>

      {/* Modal for Bed Management */}
      {selectedBedFacility && (
        <BedManagementModal
          facility={facilities.find((f) => f.id === selectedBedFacility.id) || selectedBedFacility}
          onClose={() => setSelectedBedFacility(null)}
          onAllocateBed={handleAllocateBed}
          onReleaseBed={handleReleaseBed}
          onAdjustCapacity={handleAdjustCapacity}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-[#EFD5CC] bg-[#FFF9F5] py-6 text-center text-xs text-[#3D302C]/70">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Smart Hospital Bed & Medical Resource Platform • Senior Backend Architecture
          </span>
          <span className="font-mono text-[11px]">
            Python Flask • SQLite • Flask-SQLAlchemy • Flask-CORS • GeoJSON RFC 7946
          </span>
        </div>
      </footer>
    </div>
  );
}
