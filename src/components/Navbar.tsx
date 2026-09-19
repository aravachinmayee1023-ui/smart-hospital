import React from 'react';
import {
  Building2,
  MapPin,
  GitBranch,
  FileCode2,
  Terminal,
  Activity,
  AlertTriangle
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  divertingCount: number;
  availableIcuCount: number;
  totalFacilities: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  divertingCount,
  availableIcuCount,
  totalFacilities
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Live REST Dashboard', icon: Building2 },
    { id: 'geojson', label: 'GeoJSON Spatial', icon: MapPin },
    { id: 'platform', label: 'Hospital & Beds', icon: Activity },
    { id: 'api', label: 'REST API Directory', icon: Terminal },
    { id: 'code', label: 'Python Flask Code', icon: FileCode2 }
  ];

  return (
    <header className="bg-[#FFF9F5] border-b border-[#EFD5CC] sticky top-0 z-40 shadow-xs">
      {/* Top Banner: Emergency Operational Metrics */}
      <div className="bg-[#FCE4DC]/60 border-b border-[#EFD5CC] px-4 py-1.5 text-xs text-[#3D302C]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F4B6A6] text-[#3D302C]">
              SENIOR BACKEND ARCHITECT SPECIFICATION
            </span>
            <span className="text-[#3D302C]/80 hidden sm:inline">
              Python Flask • SQLite • Flask-SQLAlchemy • GeoJSON RFC 7946
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{totalFacilities} Facilities Monitored</span>
            </span>

            <span className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-[#3D302C]" />
              <span>{availableIcuCount} ICU Beds Open</span>
            </span>

            {divertingCount > 0 ? (
              <span className="flex items-center gap-1.5 text-amber-900 font-semibold bg-amber-100 px-2 py-0.5 rounded-md">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-700" />
                <span>{divertingCount} Diverting Ambulance</span>
              </span>
            ) : (
              <span className="text-emerald-700 font-medium">All ERs Normal</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#F4B6A6] flex items-center justify-center text-[#3D302C] shadow-xs">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#3D302C] tracking-tight flex items-center gap-2">
                Smart Hospital Bed Platform
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#FCE4DC] text-[#3D302C] font-mono font-medium">
                  v1.0.0
                </span>
              </h1>
              <p className="text-xs text-[#3D302C]/70">
                Medical Resource Management & Spatial GeoJSON Triage Backend
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#F4B6A6] text-[#3D302C] shadow-xs'
                      : 'text-[#3D302C]/80 hover:bg-[#FCE4DC]/60 hover:text-[#3D302C]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
