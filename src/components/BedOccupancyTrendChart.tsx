import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { HospitalItem } from '../services/api';
import {
  TrendingUp,
  Activity,
  AlertTriangle,
  Clock,
  Layers,
  CheckSquare,
  Square,
  Maximize2,
  Minimize2,
  Flame,
  Info
} from 'lucide-react';

interface BedOccupancyTrendChartProps {
  hospitals: HospitalItem[];
  initiallySelectedIds?: number[];
}

// Color palette specifically designed for hospital clinical metrics
// Harmonized with the peach/terracotta/sand theme
const FACILITY_COLORS = [
  '#E05D44', // Primary Terracotta / Deep Peach
  '#2B7A78', // Deep Clinical Teal
  '#D97706', // Warm Amber
  '#4F46E5', // Slate Indigo
  '#059669', // Emerald
  '#9333EA', // Purple
  '#2563EB', // Cobalt Blue
  '#EA580C', // Tangerine
];

interface TrendDataPoint {
  timeLabel: string;
  hour: number;
  fullTime: string;
  [key: string]: any; // dynamic hospital occupancy rates or counts
}

export const BedOccupancyTrendChart: React.FC<BedOccupancyTrendChartProps> = ({
  hospitals,
  initiallySelectedIds
}) => {
  // State for selected facility IDs to display on the graph
  const [selectedFacilityIds, setSelectedFacilityIds] = useState<number[]>(() => {
    if (initiallySelectedIds && initiallySelectedIds.length > 0) {
      return initiallySelectedIds;
    }
    // Default to the first 3 hospitals or all if fewer
    return hospitals.slice(0, 3).map((h) => h.id);
  });

  // Display mode: 'percentage' (0-100%) vs 'beds' (number of occupied beds)
  const [metricMode, setMetricMode] = useState<'percentage' | 'beds'>('percentage');

  // Critical threshold guide toggle (85% warning threshold)
  const [showThreshold, setShowThreshold] = useState<boolean>(true);

  // Time window: 24h, 12h, 6h
  const [timeSpanHours, setTimeSpanHours] = useState<24 | 12 | 6>(24);

  // Expanded card state
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Toggle selection for a facility
  const toggleFacility = (id: number) => {
    setSelectedFacilityIds((prev) => {
      if (prev.includes(id)) {
        // Keep at least 1 facility selected
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Select all hospitals
  const selectAll = () => {
    setSelectedFacilityIds(hospitals.map((h) => h.id));
  };

  // Select top 2 emergency ready hospitals
  const selectEmergencyOnly = () => {
    const emergencyIds = hospitals.filter((h) => h.emergency).map((h) => h.id);
    if (emergencyIds.length > 0) {
      setSelectedFacilityIds(emergencyIds);
    }
  };

  // Generate 24-hour historical trend points
  // Synthesizes realistic circadian hospital occupancy curves anchored to current live values
  const chartData = useMemo<TrendDataPoint[]>(() => {
    if (!hospitals || hospitals.length === 0) return [];

    const totalSteps = timeSpanHours;
    const now = new Date();
    const dataPoints: TrendDataPoint[] = [];

    for (let step = 0; step <= totalSteps; step++) {
      const hoursAgo = totalSteps - step;
      const pointTime = new Date(now.getTime() - hoursAgo * 3600 * 1000);

      const hours24 = pointTime.getHours();
      const minutes = pointTime.getMinutes();
      const formattedHour = `${hours24.toString().padStart(2, '0')}:00`;
      const timeLabel = hoursAgo === 0 ? 'Now' : `${formattedHour}`;
      const fullTime = hoursAgo === 0 
        ? `Now (Live)` 
        : `${pointTime.toLocaleDateString(undefined, { weekday: 'short' })} ${formattedHour}`;

      const point: TrendDataPoint = {
        timeLabel,
        hour: hours24,
        fullTime
      };

      // Calculate historical rate for each hospital
      hospitals.forEach((h, hIdx) => {
        const totalBeds = h.beds || 100;
        const currentAvail = h.available_beds || 0;
        const currentOccupied = Math.max(0, totalBeds - currentAvail);
        const currentRate = (currentOccupied / totalBeds) * 100;

        if (hoursAgo === 0) {
          // Anchored exactly to current live data
          point[`h_${h.id}`] = metricMode === 'percentage' 
            ? Math.round(currentRate * 10) / 10 
            : currentOccupied;
          point[`raw_${h.id}`] = currentRate;
          point[`occupied_${h.id}`] = currentOccupied;
          point[`total_${h.id}`] = totalBeds;
        } else {
          // Circadian hospital cycle simulation:
          // Morning dip (04:00-07:00 discharges): -3% to -7%
          // Afternoon/evening surge (14:00-20:00 ER intakes): +4% to +9%
          // Seeded uniquely per hospital index
          const seed = (h.id * 1.7) + (hIdx * 2.3);
          const circadianWave = Math.sin(((hours24 - 8) / 24) * 2 * Math.PI + seed);
          const noise = Math.cos((hours24 * 0.9) + seed) * 1.5;

          // Dampen difference as we get closer to "Now" so it smoothly joins
          const convergenceFactor = Math.min(1, hoursAgo / 8);
          const variance = (circadianWave * 5 + noise) * convergenceFactor;

          const historicalRate = Math.max(15, Math.min(98, currentRate - variance));
          const historicalOccupied = Math.round((historicalRate / 100) * totalBeds);

          point[`h_${h.id}`] = metricMode === 'percentage' 
            ? Math.round(historicalRate * 10) / 10 
            : historicalOccupied;
          point[`raw_${h.id}`] = historicalRate;
          point[`occupied_${h.id}`] = historicalOccupied;
          point[`total_${h.id}`] = totalBeds;
        }
      });

      dataPoints.push(point);
    }

    return dataPoints;
  }, [hospitals, timeSpanHours, metricMode]);

  // Compute key summary statistics for selected facilities
  const statistics = useMemo(() => {
    if (selectedFacilityIds.length === 0 || chartData.length === 0) {
      return { avgCurrent: 0, peakRate: 0, minRate: 0, peakFacility: '', hasCriticalSurge: false };
    }

    let sumCurrent = 0;
    let peak = 0;
    let min = 100;
    let peakFacName = '';
    let hasCritical = false;

    const selectedHospitals = hospitals.filter((h) => selectedFacilityIds.includes(h.id));

    selectedHospitals.forEach((h) => {
      const currentRate = ((h.beds - h.available_beds) / h.beds) * 100;
      sumCurrent += currentRate;

      // Scan historical points
      chartData.forEach((dp) => {
        const rate = dp[`raw_${h.id}`] || 0;
        if (rate > peak) {
          peak = rate;
          peakFacName = h.name;
        }
        if (rate < min) {
          min = rate;
        }
        if (rate >= 85) {
          hasCritical = true;
        }
      });
    });

    return {
      avgCurrent: Math.round(sumCurrent / selectedHospitals.length),
      peakRate: Math.round(peak * 10) / 10,
      minRate: Math.round(min * 10) / 10,
      peakFacility: peakFacName.replace('Hospital', '').replace('Center', '').trim(),
      hasCriticalSurge: hasCritical
    };
  }, [selectedFacilityIds, chartData, hospitals]);

  // Map each hospital to a consistent line color
  const hospitalColorMap = useMemo(() => {
    const map = new Map<number, string>();
    hospitals.forEach((h, index) => {
      map.set(h.id, FACILITY_COLORS[index % FACILITY_COLORS.length]);
    });
    return map;
  }, [hospitals]);

  return (
    <div
      id="bed-occupancy-trend-section"
      className="bg-[#FFFCFA] border border-[#EFD5CC] rounded-3xl p-5 sm:p-6 shadow-xs space-y-5 transition-all"
    >
      {/* Header: Title, Controls, and Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EFD5CC] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FCE4DC] text-[#3D302C]">
              <Clock className="h-3 w-3 text-[#E05D44]" />
              Historical Analytics
            </span>
            {statistics.hasCriticalSurge && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <AlertTriangle className="h-3 w-3 text-amber-600" />
                Capacity Alert &gt;85%
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#3D302C] tracking-tight flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#E05D44]" />
            24-Hour Bed Occupancy Historical Trend
          </h2>
          <p className="text-xs text-[#806F68] mt-0.5">
            Temporal census telemetry tracking inpatient ward saturation, surge pressures, and discharge cycles.
          </p>
        </div>

        {/* View Options & Time Range Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Unit Toggle */}
          <div className="flex items-center p-1 bg-[#FFF9F5] border border-[#EFD5CC] rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setMetricMode('percentage')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                metricMode === 'percentage'
                  ? 'bg-[#F4B6A6] text-[#3D302C] shadow-2xs'
                  : 'text-[#806F68] hover:text-[#3D302C]'
              }`}
            >
              Occupancy %
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('beds')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                metricMode === 'beds'
                  ? 'bg-[#F4B6A6] text-[#3D302C] shadow-2xs'
                  : 'text-[#806F68] hover:text-[#3D302C]'
              }`}
            >
              Occupied Beds
            </button>
          </div>

          {/* Time Window Buttons */}
          <div className="flex items-center p-1 bg-[#FFF9F5] border border-[#EFD5CC] rounded-xl text-xs font-bold">
            {([6, 12, 24] as const).map((hours) => (
              <button
                key={hours}
                type="button"
                onClick={() => setTimeSpanHours(hours)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  timeSpanHours === hours
                    ? 'bg-[#F4B6A6] text-[#3D302C] shadow-2xs'
                    : 'text-[#806F68] hover:text-[#3D302C]'
                }`}
              >
                {hours}h
              </button>
            ))}
          </div>

          {/* Expand/Collapse Height Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Standard view' : 'Enlarge chart'}
            className="p-2 rounded-xl border border-[#EFD5CC] bg-[#FFF9F5] text-[#806F68] hover:text-[#3D302C] hover:bg-[#FCE4DC] transition-colors cursor-pointer"
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Metric Highlights Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#FFF9F5] border border-[#EFD5CC] rounded-2xl p-3.5">
          <span className="text-[11px] font-medium text-[#806F68] block">Average Selected Occupancy</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl sm:text-2xl font-black text-[#3D302C]">{statistics.avgCurrent}%</span>
            <span className="text-[11px] text-[#806F68]">across {selectedFacilityIds.length} facilities</span>
          </div>
        </div>

        <div className="bg-[#FFF9F5] border border-[#EFD5CC] rounded-2xl p-3.5">
          <span className="text-[11px] font-medium text-[#806F68] block">24h Peak Inpatient Rate</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl sm:text-2xl font-black text-rose-700">{statistics.peakRate}%</span>
            <span className="text-[11px] text-[#806F68] truncate max-w-[110px]" title={statistics.peakFacility}>
              {statistics.peakFacility || 'Peak'}
            </span>
          </div>
        </div>

        <div className="bg-[#FFF9F5] border border-[#EFD5CC] rounded-2xl p-3.5">
          <span className="text-[11px] font-medium text-[#806F68] block">24h Valley Low Rate</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-700">{statistics.minRate}%</span>
            <span className="text-[11px] text-[#806F68]">early morning</span>
          </div>
        </div>

        <div className="bg-[#FFF9F5] border border-[#EFD5CC] rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#806F68]">85% Warning Threshold</span>
            <button
              type="button"
              onClick={() => setShowThreshold(!showThreshold)}
              className="text-[11px] font-bold text-[#E05D44] hover:underline cursor-pointer"
            >
              {showThreshold ? 'Hide' : 'Show'}
            </button>
          </div>
          <span className="text-xs font-semibold text-[#3D302C] mt-1">
            {statistics.hasCriticalSurge ? (
              <span className="text-amber-800">Critical load detected</span>
            ) : (
              <span className="text-emerald-700">Nominal surge buffer</span>
            )}
          </span>
        </div>
      </div>

      {/* Facility Selection Chips Bar */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs text-[#806F68] flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-[#E05D44]" />
            <span className="font-bold text-[#3D302C]">Filter Facilities to Plot:</span>
            <span className="text-[11px]">({selectedFacilityIds.length} of {hospitals.length} active)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-[11px] font-bold text-[#E05D44] hover:text-[#3D302C] transition-colors cursor-pointer underline"
            >
              Select All
            </button>
            <span className="text-[#EFD5CC]">•</span>
            <button
              type="button"
              onClick={selectEmergencyOnly}
              className="text-[11px] font-bold text-[#E05D44] hover:text-[#3D302C] transition-colors cursor-pointer flex items-center gap-1"
            >
              <Flame className="h-3 w-3 text-orange-600" />
              <span>Emergency 24/7 Only</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hospitals.map((hospital) => {
            const isSelected = selectedFacilityIds.includes(hospital.id);
            const color = hospitalColorMap.get(hospital.id) || '#E05D44';
            const occRate = Math.round(((hospital.beds - hospital.available_beds) / hospital.beds) * 100);

            return (
              <button
                key={hospital.id}
                type="button"
                onClick={() => toggleFacility(hospital.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FFF9F5] border-[#EFD5CC] text-[#3D302C] shadow-2xs'
                    : 'bg-[#FFFCFA] border-dashed border-[#EFD5CC] text-[#806F68]/70 hover:text-[#3D302C] opacity-75'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform"
                  style={{ backgroundColor: isSelected ? color : '#CBD5E1' }}
                />
                <span className="truncate max-w-[180px] sm:max-w-[220px]">{hospital.name}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                    occRate >= 85
                      ? 'bg-rose-100 text-rose-800'
                      : occRate >= 75
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {occRate}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Recharts Line Graph Canvas */}
      <div
        className={`w-full bg-[#FFF9F5] border border-[#EFD5CC] rounded-2xl p-4 transition-all ${
          isExpanded ? 'h-[480px]' : 'h-[340px]'
        }`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 12, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EFD5CC" vertical={false} />
            <XAxis
              dataKey="timeLabel"
              tick={{ fill: '#806F68', fontSize: 11 }}
              tickLine={{ stroke: '#EFD5CC' }}
              axisLine={{ stroke: '#EFD5CC' }}
            />
            <YAxis
              domain={metricMode === 'percentage' ? [0, 100] : ['auto', 'auto']}
              tick={{ fill: '#806F68', fontSize: 11 }}
              tickLine={{ stroke: '#EFD5CC' }}
              axisLine={{ stroke: '#EFD5CC' }}
              tickFormatter={(val) => (metricMode === 'percentage' ? `${val}%` : `${val}`)}
            />
            <Tooltip content={<CustomTooltip metricMode={metricMode} hospitals={hospitals} />} />
            <Legend
              wrapperStyle={{ paddingTop: 8, fontSize: 12 }}
              formatter={(value) => {
                const hId = parseInt(value.replace('h_', ''), 10);
                const hospital = hospitals.find((h) => h.id === hId);
                return (
                  <span className="text-[#3D302C] text-xs font-semibold">
                    {hospital ? hospital.name : value}
                  </span>
                );
              }}
            />

            {/* 85% Code Yellow / Warning Reference Line */}
            {showThreshold && metricMode === 'percentage' && (
              <ReferenceLine
                y={85}
                stroke="#E05D44"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: '85% Critical Capacity Threshold',
                  position: 'top',
                  fill: '#E05D44',
                  fontSize: 11,
                  fontWeight: 'bold'
                }}
              />
            )}

            {/* Render a Line for each selected hospital */}
            {hospitals
              .filter((h) => selectedFacilityIds.includes(h.id))
              .map((hospital) => {
                const color = hospitalColorMap.get(hospital.id) || '#E05D44';
                return (
                  <Line
                    key={hospital.id}
                    type="monotone"
                    dataKey={`h_${hospital.id}`}
                    name={`h_${hospital.id}`}
                    stroke={color}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{
                      r: 6,
                      stroke: '#FFFCFA',
                      strokeWidth: 2,
                      fill: color
                    }}
                    isAnimationActive={true}
                    animationDuration={600}
                  />
                );
              })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer with Contextual Guidance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#806F68] pt-1">
        <div className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-[#E05D44] shrink-0" />
          <span>
            Occupancy rate is computed as: <code className="font-mono bg-[#FFF9F5] px-1 py-0.5 rounded border border-[#EFD5CC] text-[#3D302C]">(Occupied Beds ÷ Total Beds) × 100</code>.
          </span>
        </div>
        <span className="font-medium text-[#3D302C]">
          Circadian trend models diurnal hospital admission/discharge rhythms.
        </span>
      </div>
    </div>
  );
};

// Custom Tooltip component for Recharts
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  metricMode: 'percentage' | 'beds';
  hospitals: HospitalItem[];
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, hospitals, metricMode }) => {
  if (!active || !payload || payload.length === 0) return null;

  const dataPoint = payload[0]?.payload as TrendDataPoint | undefined;
  if (!dataPoint) return null;

  return (
    <div className="bg-[#FFFCFA] border border-[#EFD5CC] rounded-xl p-3 shadow-lg text-xs space-y-2 max-w-xs sm:max-w-sm z-50">
      <div className="flex items-center justify-between border-b border-[#EFD5CC] pb-1.5">
        <span className="font-bold text-[#3D302C] flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-[#E05D44]" />
          <span>{dataPoint.fullTime}</span>
        </span>
        <span className="text-[10px] text-[#806F68] font-mono">
          {metricMode === 'percentage' ? 'Rate %' : 'Beds'}
        </span>
      </div>

      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
        {payload.map((entry) => {
          const key = entry.dataKey as string;
          const hId = parseInt(key.replace('h_', ''), 10);
          const hospital = hospitals.find((h) => h.id === hId);
          if (!hospital) return null;

          const val = entry.value;
          const occupied = dataPoint[`occupied_${hId}`];
          const total = dataPoint[`total_${hId}`];
          const rate = dataPoint[`raw_${hId}`];

          return (
            <div key={key} className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="font-medium text-[#3D302C] truncate max-w-[160px]">
                  {hospital.name}
                </span>
              </div>

              <div className="text-right shrink-0">
                <span className="font-bold font-mono text-[#3D302C]">
                  {metricMode === 'percentage' ? `${val}%` : `${val} beds`}
                </span>
                <span className="text-[10px] text-[#806F68] block">
                  ({occupied}/{total} beds)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
