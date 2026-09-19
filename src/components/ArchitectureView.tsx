import React, { useState } from 'react';
import {
  Layers,
  Database,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  FolderTree,
  Cpu,
  Server,
  Globe,
  Lock,
  GitMerge
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'overview' | 'dataflow' | 'schema' | 'folders' | 'dependencies'>('overview');
  const [activeFlow, setActiveFlow] = useState<'search' | 'allocation' | 'emergency'>('search');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Section Sub-Nav */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#FCE4DC] pb-3">
        {[
          { id: 'overview', label: '1. Backend Architecture' },
          { id: 'dataflow', label: '2. System Data Flow' },
          { id: 'schema', label: '3. Database Schema & ERD' },
          { id: 'folders', label: '4. Folder Structure & Roles' },
          { id: 'dependencies', label: '5. Recommended Dependencies' },
        ].map((sec) => (
          <button
            key={sec.id}
            id={`btn-arch-sec-${sec.id}`}
            onClick={() => setActiveSection(sec.id as any)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSection === sec.id
                ? 'bg-[#3D302C] text-[#FFF9F5]'
                : 'bg-[#FCE4DC]/70 text-[#3D302C] hover:bg-[#FCE4DC]'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* 1. OVERVIEW & ARCHITECTURE BLUEPRINT */}
      {activeSection === 'overview' && (
        <div className="space-y-8">
          {/* Executive Architectural Brief */}
          <div className="bg-[#FFF9F5] border border-[#FCE4DC] rounded-2xl p-6 shadow-xs">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#3D302C]/70 font-semibold">
                  Senior Backend Architect Blueprint
                </span>
                <h2 className="text-xl font-bold text-[#3D302C] mt-1">
                  Smart Hospital Bed & Medical Resource Architecture
                </h2>
                <p className="text-sm text-[#3D302C]/80 mt-2 max-w-3xl leading-relaxed">
                  Engineered using a <strong>Modular Layered Micro-Monolith</strong> pattern with Python Flask and SQLite.
                  The platform cleanly decouples input validation, transactional bed inventory services, and RFC 7946 GeoJSON spatial calculation, making it beginner-friendly to maintain while providing a direct migration pathway to PostgreSQL + PostGIS.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-[#FCE4DC] px-3.5 py-2 rounded-xl text-xs font-semibold text-[#3D302C]">
                <ShieldCheck className="h-4 w-4 text-[#3D302C]" />
                <span>Production-Ready Design</span>
              </div>
            </div>

            {/* Core Architectural Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#FCE4DC]">
              <div className="p-4 rounded-xl bg-[#FCE4DC]/40 border border-[#FCE4DC]">
                <div className="h-8 w-8 rounded-lg bg-[#F4B6A6] flex items-center justify-center text-[#3D302C] mb-3">
                  <Server className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-[#3D302C]">Application Factory</h3>
                <p className="text-xs text-[#3D302C]/80 mt-1 leading-relaxed">
                  <code className="font-mono text-[11px]">create_app()</code> pattern manages configurations, CORS origins, and registers isolated domain Blueprints.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FCE4DC]/40 border border-[#FCE4DC]">
                <div className="h-8 w-8 rounded-lg bg-[#F4B6A6] flex items-center justify-center text-[#3D302C] mb-3">
                  <Globe className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-[#3D302C]">RFC 7946 GeoJSON</h3>
                <p className="text-xs text-[#3D302C]/80 mt-1 leading-relaxed">
                  High-speed spherical Haversine distance engine and SQLite bounding-box queries for instant nearest-bed dispatch.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FCE4DC]/40 border border-[#FCE4DC]">
                <div className="h-8 w-8 rounded-lg bg-[#F4B6A6] flex items-center justify-center text-[#3D302C] mb-3">
                  <Lock className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-[#3D302C]">Atomic Concurrency</h3>
                <p className="text-xs text-[#3D302C]/80 mt-1 leading-relaxed">
                  Row-level locking semantics and SQLite table constraints (<code className="font-mono text-[11px]">occupied &lt;= capacity</code>) guarantee no overbooking.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FCE4DC]/40 border border-[#FCE4DC]">
                <div className="h-8 w-8 rounded-lg bg-[#F4B6A6] flex items-center justify-center text-[#3D302C] mb-3">
                  <Zap className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-[#3D302C]">Automated Triage</h3>
                <p className="text-xs text-[#3D302C]/80 mt-1 leading-relaxed">
                  Dynamic state transitions: when occupancy reaches &gt;95%, facility status triggers ambulance diversion alert.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Tier Diagram */}
          <div className="bg-[#FFF9F5] border border-[#FCE4DC] rounded-2xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-[#3D302C] flex items-center gap-2 mb-6">
              <Layers className="h-5 w-5 text-[#3D302C]" />
              Modular System Architecture Diagram
            </h3>

            <div className="space-y-4">
              {/* Client Tier */}
              <div className="bg-[#FCE4DC]/30 border border-[#FCE4DC] rounded-xl p-4">
                <div className="flex items-center justify-between text-xs font-semibold text-[#3D302C] mb-2">
                  <span className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[#3D302C]" />
                    Tier 1: Client Application & GIS Consumers
                  </span>
                  <span className="font-mono text-[11px] text-[#3D302C]/70">React Web • Mobile Dispatch • GIS Leaflet/Mapbox</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-[#FFF9F5] py-2 rounded-lg border border-[#FCE4DC] font-medium text-[#3D302C]">
                    Frontend UI (Port 3000)
                  </div>
                  <div className="bg-[#FFF9F5] py-2 rounded-lg border border-[#FCE4DC] font-medium text-[#3D302C]">
                    Emergency 911 Dispatch Dashboard
                  </div>
                  <div className="bg-[#FFF9F5] py-2 rounded-lg border border-[#FCE4DC] font-medium text-[#3D302C]">
                    Hospital Charge Nurse Console
                  </div>
                </div>
              </div>

              {/* Protocol / CORS Gateway */}
              <div className="flex justify-center">
                <div className="flex items-center gap-2 text-xs font-mono bg-[#FCE4DC] px-4 py-1.5 rounded-full text-[#3D302C] border border-[#F4B6A6]">
                  <span>HTTP REST (JSON) • GeoJSON (RFC 7946) • CORS Middleware (Flask-CORS)</span>
                </div>
              </div>

              {/* Flask API Gateway & Routing Tier */}
              <div className="bg-[#FFF9F5] border-2 border-[#F4B6A6] rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between text-xs font-semibold text-[#3D302C] mb-3">
                  <span className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-[#3D302C]" />
                    Tier 2: Flask API Layer (create_app Factory & Modular Blueprints)
                  </span>
                  <span className="font-mono text-[11px] bg-[#F4B6A6] px-2 py-0.5 rounded text-[#3D302C]">
                    Python 3.10+ / Flask 3.0+
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#FCE4DC]/50 border border-[#FCE4DC]">
                    <div className="font-bold text-[#3D302C]">Facilities Blueprint</div>
                    <code className="text-[11px] text-[#3D302C]/80">/api/v1/facilities</code>
                    <p className="text-[10px] text-[#3D302C]/70 mt-1">Search, filters, CRUD</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#FCE4DC]/50 border border-[#FCE4DC]">
                    <div className="font-bold text-[#3D302C]">Beds Blueprint</div>
                    <code className="text-[11px] text-[#3D302C]/80">/api/v1/facilities/&lt;id&gt;/beds</code>
                    <p className="text-[10px] text-[#3D302C]/70 mt-1">Allocate, release, capacity</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#FCE4DC]/50 border border-[#FCE4DC]">
                    <div className="font-bold text-[#3D302C]">GeoJSON Blueprint</div>
                    <code className="text-[11px] text-[#3D302C]/80">/api/v1/geojson/nearby</code>
                    <p className="text-[10px] text-[#3D302C]/70 mt-1">Radius proximity & GIS</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#FCE4DC]/50 border border-[#FCE4DC]">
                    <div className="font-bold text-[#3D302C]">Emergency Blueprint</div>
                    <code className="text-[11px] text-[#3D302C]/80">/api/v1/emergency/summary</code>
                    <p className="text-[10px] text-[#3D302C]/70 mt-1">Diversion alerts & triage</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#FCE4DC] flex items-center justify-between text-xs text-[#3D302C]/80">
                  <span className="font-mono text-[11px]">Middleware: Centralized Error Handling (400, 404, 409, 422, 500)</span>
                  <span className="font-mono text-[11px]">Validation: schemas/validators.py (marshmallow/dataclass)</span>
                </div>
              </div>

              {/* Service & Logic Tier */}
              <div className="flex justify-center">
                <ArrowRight className="h-4 w-4 text-[#3D302C] rotate-90" />
              </div>

              <div className="bg-[#FCE4DC]/30 border border-[#FCE4DC] rounded-xl p-4">
                <div className="flex items-center justify-between text-xs font-semibold text-[#3D302C] mb-3">
                  <span className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-[#3D302C]" />
                    Tier 3: Domain Service Layer (Business Logic & Mathematics)
                  </span>
                  <span className="font-mono text-[11px] text-[#3D302C]/70">Pure Domain Logic (Framework Agnostic)</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#FFF9F5] rounded-lg border border-[#FCE4DC]">
                    <div className="font-bold text-[#3D302C]">BedService (Concurrency & Inventory)</div>
                    <ul className="text-[11px] text-[#3D302C]/80 mt-1 space-y-1">
                      <li>• Atomic allocation & release transactions</li>
                      <li>• Auto-triggers diversion state (&gt;95% threshold)</li>
                      <li>• Records immutable audit log entries</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-[#FFF9F5] rounded-lg border border-[#FCE4DC]">
                    <div className="font-bold text-[#3D302C]">GeoService (Spherical GIS & Haversine)</div>
                    <ul className="text-[11px] text-[#3D302C]/80 mt-1 space-y-1">
                      <li>• Haversine great-circle distance (Earth R=6371km)</li>
                      <li>• 2-Stage Bounding-Box SQLite acceleration</li>
                      <li>• GeoJSON RFC 7946 FeatureCollection builder</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Data Persistence Tier */}
              <div className="flex justify-center">
                <ArrowRight className="h-4 w-4 text-[#3D302C] rotate-90" />
              </div>

              <div className="bg-[#3D302C] text-[#FFF9F5] rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-xs font-semibold mb-3">
                  <span className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-[#F4B6A6]" />
                    Tier 4: Persistence Layer (Flask-SQLAlchemy ORM + SQLite / PostgreSQL)
                  </span>
                  <span className="font-mono text-[11px] text-[#F4B6A6]">
                    hospital_platform.db (WAL Mode)
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                  <div className="bg-[#FFF9F5]/10 p-2 rounded border border-[#FFF9F5]/20">
                    facilities
                  </div>
                  <div className="bg-[#FFF9F5]/10 p-2 rounded border border-[#FFF9F5]/20">
                    bed_inventories
                  </div>
                  <div className="bg-[#FFF9F5]/10 p-2 rounded border border-[#FFF9F5]/20">
                    medical_resources
                  </div>
                  <div className="bg-[#FFF9F5]/10 p-2 rounded border border-[#FFF9F5]/20">
                    bed_audit_logs
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SYSTEM DATA FLOW */}
      {activeSection === 'dataflow' && (
        <div className="space-y-6">
          <div className="bg-[#FFF9F5] border border-[#FCE4DC] rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#3D302C]">System Data Flow Sequences</h3>
                <p className="text-xs text-[#3D302C]/70 mt-1">
                  Step-by-step lifecycle from client HTTP request to database commit and GeoJSON emission.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {[
                  { id: 'search', label: '1. Search & Proximity Flow' },
                  { id: 'allocation', label: '2. Bed Allocation & Audit Flow' },
                  { id: 'emergency', label: '3. Diversion Alert Flow' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFlow(f.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      activeFlow === f.id
                        ? 'bg-[#F4B6A6] text-[#3D302C]'
                        : 'bg-[#FCE4DC]/60 text-[#3D302C] hover:bg-[#FCE4DC]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* FLOW 1: SEARCH & PROXIMITY */}
            {activeFlow === 'search' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#FCE4DC]/30 border border-[#FCE4DC]">
                  <h4 className="text-xs font-bold text-[#3D302C] uppercase tracking-wider mb-3">
                    Scenario: Client Requests Nearby Hospitals with Available ICU Beds
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-3">
                      <span className="h-6 w-6 rounded-full bg-[#F4B6A6] text-[#3D302C] font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                      <div>
                        <span className="font-bold text-[#3D302C]">HTTP GET Request:</span>
                        <code className="ml-2 font-mono text-[11px] bg-[#FFF9F5] px-2 py-0.5 rounded border border-[#FCE4DC]">
                          GET /api/v1/geojson/nearby?lat=37.77&lng=-122.41&radius_km=25&type=HOSPITAL
                        </code>
                        <p className="text-[#3D302C]/70 mt-0.5">Dispatched by Ambulance Mobile Terminal or Web GIS Client.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="h-6 w-6 rounded-full bg-[#F4B6A6] text-[#3D302C] font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                      <div>
                        <span className="font-bold text-[#3D302C]">Input Validation (schemas/validators.py):</span>
                        <p className="text-[#3D302C]/70 mt-0.5">
                          Ensures <code className="font-mono text-[11px]">-90 &lt;= lat &lt;= 90</code>, <code className="font-mono text-[11px]">-180 &lt;= lng &lt;= 180</code>, and <code className="font-mono text-[11px]">0.1 &lt;= radius_km &lt;= 300</code>. If invalid, throws HTTP 422 Unprocessable Entity.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="h-6 w-6 rounded-full bg-[#F4B6A6] text-[#3D302C] font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                      <div>
                        <span className="font-bold text-[#3D302C]">Stage 1 Bounding Box Pruning (SQLite Index):</span>
                        <p className="text-[#3D302C]/70 mt-0.5">
                          Calculates delta latitude/longitude bounding box. Executes fast indexed B-Tree range query in SQLite:
                          <code className="block mt-1 font-mono text-[11px] bg-[#FFF9F5] p-2 rounded border border-[#FCE4DC]">
                            SELECT * FROM facilities WHERE is_active=1 AND latitude BETWEEN 37.54 AND 37.99 AND longitude BETWEEN -122.69 AND -122.13
                          </code>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="h-6 w-6 rounded-full bg-[#F4B6A6] text-[#3D302C] font-bold flex items-center justify-center shrink-0 text-xs">4</span>
                      <div>
                        <span className="font-bold text-[#3D302C]">Stage 2 Haversine Trigonometric Distance & Pruning:</span>
                        <p className="text-[#3D302C]/70 mt-0.5">
                          Computes spherical distance for candidate hospitals, rejects those beyond 25km radius, sorts results ascending by <code className="font-mono text-[11px]">distance_km</code>.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="h-6 w-6 rounded-full bg-[#3D302C] text-[#FFF9F5] font-bold flex items-center justify-center shrink-0 text-xs">5</span>
                      <div>
                        <span className="font-bold text-[#3D302C]">GeoJSON RFC 7946 Serialization:</span>
                        <p className="text-[#3D302C]/70 mt-0.5">
                          Serializes results into <code className="font-mono text-[11px]">FeatureCollection</code> with coordinates <code className="font-mono text-[11px]">[longitude, latitude]</code>, bed availability, and emergency status. Returns HTTP 200 OK.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FLOW 2: BED ALLOCATION */}
            {activeFlow === 'allocation' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#FCE4DC]/30 border border-[#FCE4DC]">
                  <h4 className="text-xs font-bold text-[#3D302C] uppercase tracking-wider mb-3">
                    Scenario: Triage Team Admits Critical Trauma Patient into ICU Bed
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-3">
                      <span className="h-6 w-6 rounded-full bg-[#F4B6A6] text-[#3D302C] font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                      <div>
                        <span className="font-bold text-[#3D302C]">HTTP POST:</span>
                        <code className="ml-2 font-mono text-[11px] bg-[#FFF9F5] px-2 py-0.5 rounded border border-[#FCE4DC]">
                          POST /api/v1/facilities/1/beds/allocate
                        </code>
                        <div className="font-mono text-[11px] bg-[#FFF9F5] p-2 mt-1 rounded border border-[#FCE4DC]">
                          {`{ "bed_type": "ICU", "count": 1, "operator_id": "Dr. Sarah Adams", "reason": "Severe trauma" }`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="h-6 w-6 rounded-full bg-[#F4B6A6] text-[#3D302C] font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                      <div>
                        <span className="font-bold text-[#3D302C]">Concurrency & Row Locking (BedService):</span>
                        <p className="text-[#3D302C]/70 mt-0.5">
                          Begins database transaction. Acquires lock via <code className="font-mono text-[11px]">BedInventory.query.with_for_update()</code> to eliminate race conditions between multiple admitting desks.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="h-6 w-6 rounded-full bg-[#F4B6A6] text-[#3D302C] font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                      <div>
                        <span className="font-bold text-[#3D302C]">Capacity Verification:</span>
                        <p className="text-[#3D302C]/70 mt-0.5">
                          Checks <code className="font-mono text-[11px]">bed.available &gt;= count</code>. If occupied == total_capacity, raises <code className="font-mono text-[11px]">ResourceConflictError (HTTP 409)</code>.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="h-6 w-6 rounded-full bg-[#F4B6A6] text-[#3D302C] font-bold flex items-center justify-center shrink-0 text-xs">4</span>
                      <div>
                        <span className="font-bold text-[#3D302C]">Audit Log Generation (BedAuditLog):</span>
                        <p className="text-[#3D302C]/70 mt-0.5">
                          Inserts an immutable audit entry recording facility ID, operator name, quantity (+1), new available count, and admission reason.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="h-6 w-6 rounded-full bg-[#3D302C] text-[#FFF9F5] font-bold flex items-center justify-center shrink-0 text-xs">5</span>
                      <div>
                        <span className="font-bold text-[#3D302C]">Commit & Response:</span>
                        <p className="text-[#3D302C]/70 mt-0.5">
                          Commits transaction to SQLite. Returns HTTP 200 OK with updated ward capacity JSON payload.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FLOW 3: EMERGENCY DIVERSION */}
            {activeFlow === 'emergency' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#FCE4DC]/30 border border-[#FCE4DC]">
                  <h4 className="text-xs font-bold text-[#3D302C] uppercase tracking-wider mb-3">
                    Scenario: Regional Surge Triggers Automatic Hospital Diversion Alert
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-3">
                      <span className="h-6 w-6 rounded-full bg-[#F4B6A6] text-[#3D302C] font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                      <div>
                        <span className="font-bold text-[#3D302C]">Occupancy Threshold Evaluated in BedService:</span>
                        <p className="text-[#3D302C]/70 mt-0.5">
                          Upon bed allocation, the service calculates total facility occupancy:
                          <code className="ml-2 font-mono text-[11px] bg-[#FFF9F5] px-2 py-0.5 rounded border border-[#FCE4DC]">
                            rate = occupied_beds / total_beds
                          </code>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="h-6 w-6 rounded-full bg-[#F4B6A6] text-[#3D302C] font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                      <div>
                        <span className="font-bold text-[#3D302C]">Automatic State Transition:</span>
                        <p className="text-[#3D302C]/70 mt-0.5">
                          If <code className="font-mono text-[11px]">rate &gt;= 0.95</code>, updates <code className="font-mono text-[11px]">facility.emergency_status = 'DIVERTING'</code>. If <code className="font-mono text-[11px]">rate &gt;= 0.85</code>, sets status to <code className="font-mono text-[11px]">'ELEVATED'</code>.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="h-6 w-6 rounded-full bg-[#3D302C] text-[#FFF9F5] font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                      <div>
                        <span className="font-bold text-[#3D302C]">Regional Emergency Broadcast:</span>
                        <p className="text-[#3D302C]/70 mt-0.5">
                          The <code className="font-mono text-[11px]">/api/v1/emergency/summary</code> and GeoJSON feed instantly reflect the diversion status, instructing ambulances to route incoming critical patients to alternate trauma centers.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. DATABASE SCHEMA & ERD */}
      {activeSection === 'schema' && (
        <div className="space-y-6">
          <div className="bg-[#FFF9F5] border border-[#FCE4DC] rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#3D302C]">Database Schema & Entity Relationship Model</h3>
                <p className="text-xs text-[#3D302C]/70 mt-1">
                  Relational SQLite schema defined with Flask-SQLAlchemy, foreign key cascades, unique constraints, and check constraints.
                </p>
              </div>
              <div className="font-mono text-xs text-[#3D302C]/80 bg-[#FCE4DC] px-3 py-1.5 rounded-lg">
                Engine: SQLite 3 • Storage: File/WAL • ORM: SQLAlchemy 2.0+
              </div>
            </div>

            {/* Schema Tables Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* TABLE 1: facilities */}
              <div className="bg-[#FFF9F5] border-2 border-[#FCE4DC] rounded-xl overflow-hidden">
                <div className="bg-[#FCE4DC] px-4 py-2.5 flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#3D302C]">TABLE: facilities</span>
                  <span className="text-[11px] font-semibold text-[#3D302C]/70">Core Entity</span>
                </div>
                <div className="p-4 space-y-2 text-xs font-mono">
                  <div className="grid grid-cols-3 font-bold border-b border-[#FCE4DC] pb-1 text-[#3D302C]/70 text-[11px]">
                    <span>Column</span>
                    <span>Type</span>
                    <span>Modifiers</span>
                  </div>
                  <div className="grid grid-cols-3 text-[#3D302C]">
                    <span className="font-bold text-amber-900">id</span>
                    <span>INTEGER</span>
                    <span className="text-[11px] text-[#3D302C]/70">PRIMARY KEY</span>
                  </div>
                  <div className="grid grid-cols-3 text-[#3D302C]">
                    <span>name</span>
                    <span>VARCHAR(120)</span>
                    <span className="text-[11px] text-[#3D302C]/70">NOT NULL, INDEX</span>
                  </div>
                  <div className="grid grid-cols-3 text-[#3D302C]">
                    <span>facility_type</span>
                    <span>VARCHAR(20)</span>
                    <span className="text-[11px] text-[#3D302C]/70">'HOSPITAL' | 'CLINIC'</span>
                  </div>
                  <div className="grid grid-cols-3 text-[#3D302C]">
                    <span>license_number</span>
                    <span>VARCHAR(60)</span>
                    <span className="text-[11px] text-[#3D302C]/70">UNIQUE, NOT NULL</span>
                  </div>
                  <div className="grid grid-cols-3 text-[#3D302C]">
                    <span>latitude</span>
                    <span>FLOAT</span>
                    <span className="text-[11px] text-[#3D302C]/70">NOT NULL, INDEX</span>
                  </div>
                  <div className="grid grid-cols-3 text-[#3D302C]">
                    <span>longitude</span>
                    <span>FLOAT</span>
                    <span className="text-[11px] text-[#3D302C]/70">NOT NULL, INDEX</span>
                  </div>
                  <div className="grid grid-cols-3 text-[#3D302C]">
                    <span>emergency_status</span>
                    <span>VARCHAR(20)</span>
                    <span className="text-[11px] text-[#3D302C]/70">DEFAULT 'NORMAL'</span>
                  </div>
                  <div className="grid grid-cols-3 text-[#3D302C]">
                    <span>has_emergency_dept</span>
                    <span>BOOLEAN</span>
                    <span className="text-[11px] text-[#3D302C]/70">DEFAULT TRUE</span>
                  </div>
                  <div className="grid grid-cols-3 text-[#3D302C]">
                    <span>is_active</span>
                    <span>BOOLEAN</span>
                    <span className="text-[11px] text-[#3D302C]/70">DEFAULT TRUE</span>
                  </div>
                </div>
              </div>

              {/* TABLE 2: bed_inventories */}
              <div className="bg-[#FFF9F5] border-2 border-[#FCE4DC] rounded-xl overflow-hidden">
                <div className="bg-[#FCE4DC] px-4 py-2.5 flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#3D302C]">TABLE: bed_inventories</span>
                  <span className="text-[11px] font-semibold text-[#3D302C]/70">1:M Foreign Key</span>
                </div>
                <div className="p-4 space-y-2 text-xs font-mono">
                  <div className="grid grid-cols-3 font-bold border-b border-[#FCE4DC] pb-1 text-[#3D302C]/70 text-[11px]">
                    <span>Column</span>
                    <span>Type</span>
                    <span>Modifiers</span>
                  </div>
                  <div className="grid grid-cols-3 text-[#3D302C]">
                    <span className="font-bold text-amber-900">id</span>
                    <span>INTEGER</span>
                    <span className="text-[11px] text-[#3D302C]/70">PRIMARY KEY</span>
                  </div>
                  <div className="grid grid-cols-3 text-[#3D302C]">
                    <span className="text-blue-900 font-semibold">facility_id</span>
                    <span>INTEGER</span>
                    <span className="text-[11px] text-[#3D302C]/70">FK facilities.id CASCADE</span>
                  </div>
                  <div className="grid grid-cols-3 text-[#3D302C]">
                    <span>bed_type</span>
                    <span>VARCHAR(30)</span>
                    <span className="text-[11px] text-[#3D302C]/70">ICU, VENT, GEN, PED</span>
                  </div>
                  <div className="grid grid-cols-3 text-[#3D302C]">
                    <span>total_capacity</span>
                    <span>INTEGER</span>
                    <span className="text-[11px] text-[#3D302C]/70">CHECK(&gt;= 0)</span>
                  </div>
                  <div className="grid grid-cols-3 text-[#3D302C]">
                    <span>occupied</span>
                    <span>INTEGER</span>
                    <span className="text-[11px] text-[#3D302C]/70">CHECK(&lt;= total)</span>
                  </div>
                  <div className="grid grid-cols-3 text-[#3D302C]">
                    <span>department_name</span>
                    <span>VARCHAR(80)</span>
                    <span className="text-[11px] text-[#3D302C]/70">NULLABLE</span>
                  </div>
                  <div className="grid grid-cols-3 text-[#3D302C]">
                    <span>updated_at</span>
                    <span>DATETIME</span>
                    <span className="text-[11px] text-[#3D302C]/70">UTC TIMESTAMP</span>
                  </div>
                  <div className="p-2 bg-[#FCE4DC]/40 rounded text-[11px] text-[#3D302C]/90 font-sans mt-2">
                    <strong>Constraints:</strong> UNIQUE(facility_id, bed_type), CHECK(occupied &lt;= total_capacity)
                  </div>
                </div>
              </div>

              {/* TABLE 3: medical_resources */}
              <div className="bg-[#FFF9F5] border-2 border-[#FCE4DC] rounded-xl overflow-hidden">
                <div className="bg-[#FCE4DC] px-4 py-2.5 flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#3D302C]">TABLE: medical_resources</span>
                  <span className="text-[11px] font-semibold text-[#3D302C]/70">Asset Inventory</span>
                </div>
                <div className="p-4 space-y-2 text-xs font-mono">
                  <div className="grid grid-cols-3 font-bold border-b border-[#FCE4DC] pb-1 text-[#3D302C]/70 text-[11px]">
                    <span>Column</span>
                    <span>Type</span>
                    <span>Modifiers</span>
                  </div>
                  <div className="grid grid-cols-3 text-[#3D302C]">
                    <span className="font-bold text-amber-900">id</span>
                    <span>INTEGER</span>
                    <span className="text-[11px] text-[#3D302C]/70">PRIMARY KEY</span>
                  </div>
                  <div className="grid grid-cols-3 text-[#3D302C]">
                    <span className="text-blue-900 font-semibold">facility_id</span>
                    <span>INTEGER</span>
                    <span className="text-[11px] text-[#3D302C]/70">FK facilities.id CASCADE</span>
                  </div>
                  <div className="grid grid-cols-3 text-[#3D302C]">
                    <span>resource_type</span>
                    <span>VARCHAR(50)</span>
                    <span className="text-[11px] text-[#3D302C]/70">OXYGEN, AMBULANCE</span>
                  </div>
                  <div className="grid grid-cols-3 text-[#3D302C]">
                    <span>current_stock</span>
                    <span>INTEGER</span>
                    <span className="text-[11px] text-[#3D302C]/70">CHECK(&gt;= 0)</span>
                  </div>
                  <div className="grid grid-cols-3 text-[#3D302C]">
                    <span>minimum_threshold</span>
                    <span>INTEGER</span>
                    <span className="text-[11px] text-[#3D302C]/70">DEFAULT 5</span>
                  </div>
                  <div className="grid grid-cols-3 text-[#3D302C]">
                    <span>unit</span>
                    <span>VARCHAR(30)</span>
                    <span className="text-[11px] text-[#3D302C]/70">e.g. 'cylinders'</span>
                  </div>
                </div>
              </div>

              {/* TABLE 4: bed_audit_logs */}
              <div className="bg-[#FFF9F5] border-2 border-[#FCE4DC] rounded-xl overflow-hidden">
                <div className="bg-[#FCE4DC] px-4 py-2.5 flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#3D302C]">TABLE: bed_audit_logs</span>
                  <span className="text-[11px] font-semibold text-[#3D302C]/70">Compliance & History</span>
                </div>
                <div className="p-4 space-y-2 text-xs font-mono">
                  <div className="grid grid-cols-3 font-bold border-b border-[#FCE4DC] pb-1 text-[#3D302C]/70 text-[11px]">
                    <span>Column</span>
                    <span>Type</span>
                    <span>Modifiers</span>
                  </div>
                  <div className="grid grid-cols-3 text-[#3D302C]">
                    <span className="font-bold text-amber-900">id</span>
                    <span>INTEGER</span>
                    <span className="text-[11px] text-[#3D302C]/70">PRIMARY KEY</span>
                  </div>
                  <div className="grid grid-cols-3 text-[#3D302C]">
                    <span className="text-blue-900 font-semibold">facility_id</span>
                    <span>INTEGER</span>
                    <span className="text-[11px] text-[#3D302C]/70">FK facilities.id CASCADE</span>
                  </div>
                  <div className="grid grid-cols-3 text-[#3D302C]">
                    <span>action</span>
                    <span>VARCHAR(30)</span>
                    <span className="text-[11px] text-[#3D302C]/70">ALLOCATE | RELEASE</span>
                  </div>
                  <div className="grid grid-cols-3 text-[#3D302C]">
                    <span>quantity_changed</span>
                    <span>INTEGER</span>
                    <span className="text-[11px] text-[#3D302C]/70">+1 or -1</span>
                  </div>
                  <div className="grid grid-cols-3 text-[#3D302C]">
                    <span>operator_id</span>
                    <span>VARCHAR(80)</span>
                    <span className="text-[11px] text-[#3D302C]/70">Nurse / Doctor ID</span>
                  </div>
                  <div className="grid grid-cols-3 text-[#3D302C]">
                    <span>timestamp</span>
                    <span>DATETIME</span>
                    <span className="text-[11px] text-[#3D302C]/70">INDEX, UTC</span>
                  </div>
                </div>
              </div>
            </div>

            {/* DEDICATED MODELS: Hospital & Clinic */}
            <div className="mt-8 pt-6 border-t border-[#FCE4DC]">
              <div className="mb-4">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#3D302C]/70 font-semibold">
                  Flask-SQLAlchemy Domain Entities
                </span>
                <h4 className="text-base font-bold text-[#3D302C] mt-0.5">
                  Specialized Entity Models: Hospital & Clinic
                </h4>
                <p className="text-xs text-[#3D302C]/80 mt-1">
                  Both models feature strict SQLite constraints and ORM-level <code className="font-mono text-[11px]">@validates</code> hooks preventing negative beds, verifying coordinates within valid WGS84 ranges, validating booleans, and producing developer-friendly <code className="font-mono text-[11px]">__repr__</code> output.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hospital Model Card */}
                <div className="bg-[#FFF9F5] border-2 border-[#F4B6A6] rounded-xl overflow-hidden shadow-xs">
                  <div className="bg-[#FCE4DC] px-4 py-2.5 flex items-center justify-between border-b border-[#F4B6A6]">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#F4B6A6]"></span>
                      <span className="font-mono font-bold text-xs text-[#3D302C]">Hospital (backend/models/hospital.py)</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-[#FFF9F5] text-[#3D302C] px-2 py-0.5 rounded border border-[#F4B6A6]">
                      Table: hospitals
                    </span>
                  </div>
                  <div className="p-4 space-y-2 text-xs font-mono">
                    <div className="grid grid-cols-3 font-bold border-b border-[#FCE4DC] pb-1 text-[#3D302C]/70 text-[11px]">
                      <span>Field</span>
                      <span>SQLAlchemy Type</span>
                      <span>Rules & Validations</span>
                    </div>
                    <div className="grid grid-cols-3 text-[#3D302C]">
                      <span className="font-bold text-amber-900">id</span>
                      <span>db.Integer</span>
                      <span className="text-[11px] text-[#3D302C]/70">primary_key=True</span>
                    </div>
                    <div className="grid grid-cols-3 text-[#3D302C]">
                      <span>name</span>
                      <span>db.String(120)</span>
                      <span className="text-[11px] text-[#3D302C]/70">nullable=False, non-empty</span>
                    </div>
                    <div className="grid grid-cols-3 text-[#3D302C]">
                      <span>type</span>
                      <span>db.String(50)</span>
                      <span className="text-[11px] text-[#3D302C]/70">default="General Hospital"</span>
                    </div>
                    <div className="grid grid-cols-3 text-[#3D302C]">
                      <span>address</span>
                      <span>db.String(255)</span>
                      <span className="text-[11px] text-[#3D302C]/70">nullable=False, non-empty</span>
                    </div>
                    <div className="grid grid-cols-3 text-[#3D302C]">
                      <span className="font-semibold text-rose-900">beds</span>
                      <span>db.Integer</span>
                      <span className="text-[11px] text-[#3D302C]/70">default=0, CHECK(beds &gt;= 0)</span>
                    </div>
                    <div className="grid grid-cols-3 text-[#3D302C]">
                      <span className="font-semibold text-emerald-900">latitude</span>
                      <span>db.Float</span>
                      <span className="text-[11px] text-[#3D302C]/70">CHECK(-90.0 &lt;= lat &lt;= 90.0)</span>
                    </div>
                    <div className="grid grid-cols-3 text-[#3D302C]">
                      <span className="font-semibold text-emerald-900">longitude</span>
                      <span>db.Float</span>
                      <span className="text-[11px] text-[#3D302C]/70">CHECK(-180.0 &lt;= lng &lt;= 180.0)</span>
                    </div>
                    <div className="grid grid-cols-3 text-[#3D302C]">
                      <span>specialties</span>
                      <span>db.Text</span>
                      <span className="text-[11px] text-[#3D302C]/70">nullable=True (ICU, Surgery)</span>
                    </div>
                    <div className="grid grid-cols-3 text-[#3D302C]">
                      <span className="font-semibold text-indigo-900">emergency</span>
                      <span>db.Boolean</span>
                      <span className="text-[11px] text-[#3D302C]/70">default=True, bool validator</span>
                    </div>
                    <div className="p-2.5 bg-[#FCE4DC]/50 rounded text-[11px] text-[#3D302C] font-mono mt-3 border border-[#FCE4DC]">
                      <strong>__repr__:</strong> &lt;Hospital id=1 name='St. Jude Metro' type='General Hospital' beds=356 emergency=True&gt;
                    </div>
                  </div>
                </div>

                {/* Clinic Model Card */}
                <div className="bg-[#FFF9F5] border-2 border-[#F4B6A6] rounded-xl overflow-hidden shadow-xs">
                  <div className="bg-[#FCE4DC] px-4 py-2.5 flex items-center justify-between border-b border-[#F4B6A6]">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#3D302C]"></span>
                      <span className="font-mono font-bold text-xs text-[#3D302C]">Clinic (backend/models/clinic.py)</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-[#FFF9F5] text-[#3D302C] px-2 py-0.5 rounded border border-[#F4B6A6]">
                      Table: clinics
                    </span>
                  </div>
                  <div className="p-4 space-y-2 text-xs font-mono">
                    <div className="grid grid-cols-3 font-bold border-b border-[#FCE4DC] pb-1 text-[#3D302C]/70 text-[11px]">
                      <span>Field</span>
                      <span>SQLAlchemy Type</span>
                      <span>Rules & Validations</span>
                    </div>
                    <div className="grid grid-cols-3 text-[#3D302C]">
                      <span className="font-bold text-amber-900">id</span>
                      <span>db.Integer</span>
                      <span className="text-[11px] text-[#3D302C]/70">primary_key=True</span>
                    </div>
                    <div className="grid grid-cols-3 text-[#3D302C]">
                      <span>name</span>
                      <span>db.String(120)</span>
                      <span className="text-[11px] text-[#3D302C]/70">nullable=False, non-empty</span>
                    </div>
                    <div className="grid grid-cols-3 text-[#3D302C]">
                      <span>type</span>
                      <span>db.String(50)</span>
                      <span className="text-[11px] text-[#3D302C]/70">default="Urgent Care Clinic"</span>
                    </div>
                    <div className="grid grid-cols-3 text-[#3D302C]">
                      <span>address</span>
                      <span>db.String(255)</span>
                      <span className="text-[11px] text-[#3D302C]/70">nullable=False, non-empty</span>
                    </div>
                    <div className="grid grid-cols-3 text-[#3D302C]">
                      <span className="font-semibold text-rose-900">beds</span>
                      <span>db.Integer</span>
                      <span className="text-[11px] text-[#3D302C]/70">default=0, CHECK(beds &gt;= 0)</span>
                    </div>
                    <div className="grid grid-cols-3 text-[#3D302C]">
                      <span className="font-semibold text-emerald-900">latitude</span>
                      <span>db.Float</span>
                      <span className="text-[11px] text-[#3D302C]/70">CHECK(-90.0 &lt;= lat &lt;= 90.0)</span>
                    </div>
                    <div className="grid grid-cols-3 text-[#3D302C]">
                      <span className="font-semibold text-emerald-900">longitude</span>
                      <span>db.Float</span>
                      <span className="text-[11px] text-[#3D302C]/70">CHECK(-180.0 &lt;= lng &lt;= 180.0)</span>
                    </div>
                    <div className="grid grid-cols-3 text-[#3D302C]">
                      <span>specialties</span>
                      <span>db.Text</span>
                      <span className="text-[11px] text-[#3D302C]/70">nullable=True (Family Med, Triage)</span>
                    </div>
                    <div className="grid grid-cols-3 text-[#3D302C]">
                      <span className="font-semibold text-indigo-900">emergency</span>
                      <span>db.Boolean</span>
                      <span className="text-[11px] text-[#3D302C]/70">default=False, bool validator</span>
                    </div>
                    <div className="p-2.5 bg-[#FCE4DC]/50 rounded text-[11px] text-[#3D302C] font-mono mt-3 border border-[#FCE4DC]">
                      <strong>__repr__:</strong> &lt;Clinic id=1 name='Downtown Urgent Care' type='Urgent Care Clinic' beds=12 emergency=False&gt;
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. FOLDER STRUCTURE & RESPONSIBILITIES */}
      {activeSection === 'folders' && (
        <div className="space-y-6">
          <div className="bg-[#FFF9F5] border border-[#FCE4DC] rounded-2xl p-6 shadow-xs">
            <h3 className="text-lg font-bold text-[#3D302C] mb-2 flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-[#3D302C]" />
              Modular Folder Structure & Architectural Responsibilities
            </h3>
            <p className="text-xs text-[#3D302C]/70 mb-6">
              Separation of concerns ensures clean maintenance, testability, and isolated component testing.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  folder: 'backend/app.py',
                  tag: 'Application Factory',
                  role: 'Boots Flask application, registers CORS origins, registers domain Blueprints, binds global JSON error handlers, and seeds initial SQLite tables.'
                },
                {
                  folder: 'backend/config.py',
                  tag: 'Environment Config',
                  role: 'Centralizes configurations across Development (SQLite local), Testing (SQLite :memory:), and Production environments.'
                },
                {
                  folder: 'backend/models/',
                  tag: 'Data Models & ORM',
                  role: 'Contains facility.py, bed.py, resource.py, and audit.py. Defines SQLAlchemy schemas, table constraints, relationships, and RFC 7946 GeoJSON serializers.'
                },
                {
                  folder: 'backend/routes/',
                  tag: 'REST Blueprints',
                  role: 'facilities.py (CRUD & search), beds.py (admission & capacity), geojson.py (spatial radius), and emergency.py (regional alerts).'
                },
                {
                  folder: 'backend/services/',
                  tag: 'Domain Business Logic',
                  role: 'Pure python services: BedService handles atomic inventory allocations and auto-diversion; GeoService implements Haversine calculations and bounding-box queries.'
                },
                {
                  folder: 'backend/schemas/',
                  tag: 'Input Validation',
                  role: 'validators.py enforces data sanitization, coordinate boundaries (-90..90, -180..180), and bed count integrity before reaching the database.'
                },
                {
                  folder: 'backend/errors/',
                  tag: 'Standardized Error Handlers',
                  role: 'Catches APIError and HTTP 400, 404, 409, 422, 500 exceptions, formatting them into consistent JSON payloads.'
                },
                {
                  folder: 'backend/seeds/',
                  tag: 'Database Seeder',
                  role: 'seed_data.py bootstraps realistic hospitals and urgent care clinics with realistic GPS coordinates, bed quotas, and emergency statuses.'
                }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#FCE4DC]/40 border border-[#FCE4DC]">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <code className="font-mono text-xs font-bold text-[#3D302C]">{item.folder}</code>
                    <span className="text-[10px] font-semibold bg-[#F4B6A6] text-[#3D302C] px-2 py-0.5 rounded">
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-xs text-[#3D302C]/80 leading-relaxed">{item.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. RECOMMENDED DEPENDENCIES */}
      {activeSection === 'dependencies' && (
        <div className="space-y-6">
          <div className="bg-[#FFF9F5] border border-[#FCE4DC] rounded-2xl p-6 shadow-xs">
            <h3 className="text-lg font-bold text-[#3D302C] mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#3D302C]" />
              Recommended Production Python Dependencies
            </h3>
            <p className="text-xs text-[#3D302C]/70 mb-6">
              Selected for performance, minimal overhead, ease of onboarding, and strict adherence to open geospatial standards.
            </p>

            <div className="space-y-3">
              {[
                {
                  pkg: 'Flask==3.0.3',
                  purpose: 'Core Web Microframework',
                  why: 'Lightweight WSGI framework offering clean Blueprint routing, application factory flexibility, and low latency.'
                },
                {
                  pkg: 'Flask-SQLAlchemy==3.1.1',
                  purpose: 'Database ORM Layer',
                  why: 'Simplifies SQLite transaction management, row locking with with_for_update(), relational constraints, and easy migration to PostgreSQL.'
                },
                {
                  pkg: 'Flask-CORS==4.0.1',
                  purpose: 'Cross-Origin Resource Sharing',
                  why: 'Enables frontend web apps on any origin or port to securely query the REST and GeoJSON endpoints with configurable headers.'
                },
                {
                  pkg: 'marshmallow==3.21.1',
                  purpose: 'Input Validation & Serialization',
                  why: 'Provides schema enforcement, prevents SQL injection/corrupted payloads, and validates geographic coordinate bounds.'
                },
                {
                  pkg: 'geojson==3.1.0',
                  purpose: 'GeoJSON RFC 7946 Standardizer',
                  why: 'Ensures feature objects, bounding boxes, and coordinate geometry order [lng, lat] strictly conform to international GIS standards.'
                },
                {
                  pkg: 'python-dotenv==1.0.1',
                  purpose: 'Environment Configuration',
                  why: 'Loads database credentials, secret keys, and port bindings safely from .env files.'
                }
              ].map((dep, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#FCE4DC]/30 border border-[#FCE4DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs font-bold text-[#3D302C] bg-[#FFF9F5] px-2 py-0.5 rounded border border-[#FCE4DC]">
                        {dep.pkg}
                      </code>
                      <span className="text-xs font-semibold text-[#3D302C]">{dep.purpose}</span>
                    </div>
                    <p className="text-xs text-[#3D302C]/80 mt-1">{dep.why}</p>
                  </div>
                  <span className="text-[11px] font-mono font-medium text-emerald-800 bg-emerald-100 px-2 py-1 rounded shrink-0 self-start sm:self-auto">
                    Verified
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
