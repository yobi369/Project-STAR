import React, { useState } from 'react';
import { FlightPlan, FlightWaypoint } from '../types.ts';
import { playTacticalSound, speakTacticalReadout } from '../utils/audioUtils.ts';

interface AutonomousFlightPlannerProps {
  soundMuted?: boolean;
}

const INITIAL_FLIGHT_PLAN: FlightPlan = {
  id: 'fp-kdf-082',
  callsign: 'HARAMBEE-01 (Bayraktar TB2)',
  droneModel: 'Bayraktar TB2 Armed MALE UAV',
  targetObjective: 'Boni Forest & Coastal Border Surveillance (Lamu - Mandera Corridor)',
  totalDistanceKm: 342,
  totalDurationMinutes: 145,
  fuelMarginPercent: 62,
  threatPenetrationRisk: 'LOW',
  status: 'Draft',
  waypoints: [
    {
      id: 'wp-1',
      order: 1,
      name: 'Manda Bay Air Base (Takeoff)',
      location: [40.916, -2.253],
      altitudeFt: 1500,
      speedKts: 85,
      action: 'FLY_THROUGH',
      estimatedTimeEnRouteMinutes: 0,
      fuelBurnPercent: 2
    },
    {
      id: 'wp-2',
      order: 2,
      name: 'Boni Forest Entry Corridor',
      location: [41.050, -1.820],
      altitudeFt: 14000,
      speedKts: 110,
      action: 'SENSOR_SCAN',
      estimatedTimeEnRouteMinutes: 35,
      fuelBurnPercent: 12
    },
    {
      id: 'wp-3',
      order: 3,
      name: 'Ras Kamboni Border Overwatch',
      location: [41.580, -1.640],
      altitudeFt: 18000,
      speedKts: 90,
      action: 'LOITER_RECON',
      loiterMinutes: 45,
      estimatedTimeEnRouteMinutes: 65,
      fuelBurnPercent: 24
    },
    {
      id: 'wp-4',
      order: 4,
      name: 'Kolbio Interdiction Point',
      location: [41.320, -1.250],
      altitudeFt: 16000,
      speedKts: 115,
      action: 'STRIKE_RELEASE',
      estimatedTimeEnRouteMinutes: 110,
      fuelBurnPercent: 18
    },
    {
      id: 'wp-5',
      order: 5,
      name: 'Manda Bay Recovery Point (RTB)',
      location: [40.916, -2.253],
      altitudeFt: 2000,
      speedKts: 80,
      action: 'DESCENT_LAND',
      estimatedTimeEnRouteMinutes: 145,
      fuelBurnPercent: 6
    }
  ]
};

export const AutonomousFlightPlanner: React.FC<AutonomousFlightPlannerProps> = ({ soundMuted = false }) => {
  const [flightPlan, setFlightPlan] = useState<FlightPlan>(INITIAL_FLIGHT_PLAN);
  const [selectedWaypoint, setSelectedWaypoint] = useState<FlightWaypoint>(INITIAL_FLIGHT_PLAN.waypoints[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [avoidanceMode, setAvoidanceMode] = useState<'AUTO_TERRAIN_FOLLOW' | 'RADAR_SILENT_CORRIDOR' | 'HIGH_ALTITUDE_ISR'>('RADAR_SILENT_CORRIDOR');

  const handleAddWaypoint = () => {
    const newOrder = flightPlan.waypoints.length + 1;
    const lastWp = flightPlan.waypoints[flightPlan.waypoints.length - 1];
    const newWp: FlightWaypoint = {
      id: `wp-${Date.now()}`,
      order: newOrder,
      name: `Tactical Waypoint ${newOrder}`,
      location: [lastWp.location[0] + 0.15, lastWp.location[1] + 0.15],
      altitudeFt: 15000,
      speedKts: 100,
      action: 'SENSOR_SCAN',
      estimatedTimeEnRouteMinutes: lastWp.estimatedTimeEnRouteMinutes + 25,
      fuelBurnPercent: 8
    };

    setFlightPlan(prev => ({
      ...prev,
      waypoints: [...prev.waypoints, newWp],
      totalDistanceKm: prev.totalDistanceKm + 45,
      totalDurationMinutes: prev.totalDurationMinutes + 25,
      fuelMarginPercent: Math.max(10, prev.fuelMarginPercent - 8)
    }));

    setSelectedWaypoint(newWp);
    playTacticalSound('button-click', soundMuted);
  };

  const handleUploadToMavlink = () => {
    setIsUploading(true);
    playTacticalSound('radar-ping', soundMuted);

    setTimeout(() => {
      setFlightPlan(prev => ({ ...prev, status: 'Active Execution' }));
      setIsUploading(false);
      playTacticalSound('neutralize-success', soundMuted);
      speakTacticalReadout("Flight plan uploaded to autonomous MAVLink 2.0 autopilot. UAV en route.", !soundMuted);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col glass-panel hud-border p-2 sm:p-3 select-none overflow-y-auto lg:overflow-hidden animate-fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 mb-2.5 border-b border-cyan-500/30 pb-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></div>
          <div>
            <h2 className="text-xs sm:text-sm md:text-base font-black text-cyan-400 uppercase tracking-wider sm:tracking-widest flex items-center space-x-2">
              <span>AUTONOMOUS UAV FLIGHT PLANNER & STRIKE ROUTING</span>
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                STANAG 4586 / MAVLINK 2.0
              </span>
            </h2>
            <p className="text-[8px] sm:text-[9px] font-mono text-slate-400 uppercase">
              MULTI-LEG WAYPOINT CORRIDORS // SAM THREAT AVOIDANCE // TERRAIN CLEARANCE & FUEL RECOVERY
            </p>
          </div>
        </div>

        {/* Flight Plan Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleAddWaypoint}
            className="bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 text-[9px] sm:text-[10px] font-mono font-bold px-3 py-1.5 rounded uppercase tracking-wider transition-colors min-h-[34px]"
          >
            + ADD WAYPOINT
          </button>
          <button
            onClick={handleUploadToMavlink}
            disabled={isUploading || flightPlan.status === 'Active Execution'}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-black text-[9px] sm:text-[10px] font-mono px-3 py-1.5 rounded uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,242,255,0.4)] disabled:opacity-40 min-h-[34px]"
          >
            {isUploading ? 'UPLOADING MAVLINK...' : flightPlan.status === 'Active Execution' ? 'MISSION IN PROGRESS' : 'UPLOAD TO UAV AUTOPILOT →'}
          </button>
        </div>
      </div>

      {/* Flight Plan Telemetry Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-2.5">
        <div className="bg-slate-950/80 p-2 rounded border border-cyan-500/20 text-[9px] font-mono">
          <span className="text-slate-500 block uppercase">CALLSIGN</span>
          <span className="text-white font-bold">{flightPlan.callsign}</span>
        </div>
        <div className="bg-slate-950/80 p-2 rounded border border-cyan-500/20 text-[9px] font-mono">
          <span className="text-slate-500 block uppercase">TOTAL DISTANCE</span>
          <span className="text-cyan-300 font-bold">{flightPlan.totalDistanceKm} KM ({Math.round(flightPlan.totalDistanceKm * 0.539957)} NM)</span>
        </div>
        <div className="bg-slate-950/80 p-2 rounded border border-cyan-500/20 text-[9px] font-mono">
          <span className="text-slate-500 block uppercase">ETE FLIGHT TIME</span>
          <span className="text-cyan-300 font-bold">{Math.floor(flightPlan.totalDurationMinutes / 60)}H {flightPlan.totalDurationMinutes % 60}M</span>
        </div>
        <div className="bg-slate-950/80 p-2 rounded border border-cyan-500/20 text-[9px] font-mono">
          <span className="text-slate-500 block uppercase">RESERVE FUEL MARGIN</span>
          <span className="text-emerald-400 font-bold">{flightPlan.fuelMarginPercent}% AT RECOVERY</span>
        </div>
        <div className="bg-slate-950/80 p-2 rounded border border-cyan-500/20 text-[9px] font-mono col-span-2 sm:col-span-1">
          <span className="text-slate-500 block uppercase">MISSION STATUS</span>
          <span className={`font-bold ${flightPlan.status === 'Active Execution' ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`}>
            {flightPlan.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-2.5 min-h-0">
        
        {/* Left Column: Waypoints Table & Altitude Profile (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-2.5 min-h-0 overflow-y-auto custom-scrollbar">
          
          {/* Waypoints Sequence List */}
          <div className="bg-slate-950/80 p-3 rounded-lg border border-cyan-500/30 space-y-2">
            <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-widest block">
              WAYPOINT SEQUENCE & MISSION EVENTS ({flightPlan.waypoints.length} LEGS)
            </span>

            <div className="space-y-1.5">
              {flightPlan.waypoints.map((wp) => {
                const isSelected = selectedWaypoint.id === wp.id;
                return (
                  <div
                    key={wp.id}
                    onClick={() => {
                      setSelectedWaypoint(wp);
                      playTacticalSound('button-click', soundMuted);
                    }}
                    className={`p-2 rounded border cursor-pointer flex justify-between items-center text-[9px] sm:text-[10px] font-mono transition-colors ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_10px_rgba(0,242,255,0.2)]'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-bold text-[9px]">
                        {wp.order}
                      </span>
                      <div>
                        <strong className="text-white block">{wp.name}</strong>
                        <span className="text-[8px] text-slate-400">
                          [{wp.location[0].toFixed(3)}°E, {wp.location[1].toFixed(3)}°N]
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex items-center space-x-3">
                      <div>
                        <span className="text-cyan-300 font-bold block">{wp.altitudeFt.toLocaleString()} FT</span>
                        <span className="text-[8px] text-slate-400">{wp.speedKts} KTS // {wp.action}</span>
                      </div>
                      <span className="text-[8px] font-mono text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-500/30">
                        +T{wp.estimatedTimeEnRouteMinutes}M
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2D Altitude & Elevation Flight Profile */}
          <div className="bg-slate-900/80 p-3 rounded-lg border border-cyan-500/20 flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest">
                2D FLIGHT ALTITUDE & TERRAIN ELEVATION PROFILE (MSL)
              </span>
              <span className="text-[8px] font-mono text-cyan-400">MAX CEILING: 20,000 FT</span>
            </div>

            {/* Altitude Profile SVG Graph */}
            <div className="h-24 bg-black/60 rounded border border-slate-800 relative p-2 flex items-end">
              <svg className="w-full h-full overflow-visible">
                {/* Terrain Line */}
                <path
                  d="M 0 80 Q 80 60 160 75 T 320 65 T 480 80 L 480 90 L 0 90 Z"
                  fill="rgba(100, 116, 139, 0.2)"
                  stroke="#475569"
                  strokeWidth="1.5"
                />
                {/* Flight Path Polyline */}
                <polyline
                  points="10,80 80,30 200,15 340,25 460,80"
                  fill="none"
                  stroke="#00f2ff"
                  strokeWidth="2.5"
                  strokeDasharray="4, 2"
                />
                {/* Waypoint Dots */}
                {flightPlan.waypoints.map((_wp, idx) => {
                  const x = 10 + idx * 110;
                  const y = idx === 0 || idx === 4 ? 80 : idx === 2 ? 15 : 28;
                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#00f2ff"
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                  );
                })}
              </svg>
            </div>
          </div>

        </div>

        {/* Right Column: Selected Waypoint Parameter Tuning (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-2.5 min-h-0 overflow-y-auto custom-scrollbar">
          
          {/* Waypoint Detail Editor */}
          <div className="bg-slate-950/80 p-3 rounded-lg border border-cyan-500/30 space-y-2.5 flex-grow">
            <div className="border-b border-slate-800 pb-2">
              <span className="text-[8px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                WAYPOINT PARAMETER TUNING // LEG {selectedWaypoint.order}
              </span>
              <h3 className="text-xs sm:text-sm font-black text-white mt-0.5">
                {selectedWaypoint.name}
              </h3>
            </div>

            <div className="space-y-2 text-[9px] sm:text-[10px] font-mono">
              <div>
                <label className="text-slate-400 block mb-1">TARGET ALTITUDE (FEET MSL):</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="1000"
                    max="22000"
                    step="500"
                    value={selectedWaypoint.altitudeFt}
                    onChange={(e) => {
                      const newAlt = parseInt(e.target.value);
                      setSelectedWaypoint(prev => ({ ...prev, altitudeFt: newAlt }));
                      setFlightPlan(prev => ({
                        ...prev,
                        waypoints: prev.waypoints.map(w => w.id === selectedWaypoint.id ? { ...w, altitudeFt: newAlt } : w)
                      }));
                    }}
                    className="w-full accent-cyan-400"
                  />
                  <span className="text-cyan-300 font-bold w-20 text-right">{selectedWaypoint.altitudeFt} FT</span>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">CALIBRATED AIRSPEED (KTS):</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="60"
                    max="140"
                    step="5"
                    value={selectedWaypoint.speedKts}
                    onChange={(e) => {
                      const newSpd = parseInt(e.target.value);
                      setSelectedWaypoint(prev => ({ ...prev, speedKts: newSpd }));
                      setFlightPlan(prev => ({
                        ...prev,
                        waypoints: prev.waypoints.map(w => w.id === selectedWaypoint.id ? { ...w, speedKts: newSpd } : w)
                      }));
                    }}
                    className="w-full accent-cyan-400"
                  />
                  <span className="text-cyan-300 font-bold w-20 text-right">{selectedWaypoint.speedKts} KTS</span>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">AUTOPILOT ACTION AT WAYPOINT:</label>
                <select
                  value={selectedWaypoint.action}
                  onChange={(e) => {
                    const newAct = e.target.value as any;
                    setSelectedWaypoint(prev => ({ ...prev, action: newAct }));
                    setFlightPlan(prev => ({
                      ...prev,
                      waypoints: prev.waypoints.map(w => w.id === selectedWaypoint.id ? { ...w, action: newAct } : w)
                    }));
                  }}
                  className="w-full bg-slate-900 border border-slate-800 text-cyan-300 p-2 rounded outline-none"
                >
                  <option value="FLY_THROUGH">FLY THROUGH (TRANSIT)</option>
                  <option value="LOITER_RECON">LOITER RECONNAISSANCE (ORBIT)</option>
                  <option value="SENSOR_SCAN">MULTI-SPECTRAL SENSOR SCAN</option>
                  <option value="STRIKE_RELEASE">LASER-GUIDED STRIKE ENVELOPE</option>
                  <option value="DESCENT_LAND">DESCENT & RECOVERY LANDING</option>
                </select>
              </div>

              {/* Threat Avoidance Profile Mode */}
              <div className="pt-2 border-t border-slate-800">
                <label className="text-slate-400 block mb-1">RADAR & SAM AVOIDANCE PROFILE:</label>
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { id: 'RADAR_SILENT_CORRIDOR' as const, label: 'RADAR SILENT LOW-ALTITUDE CORRIDOR' },
                    { id: 'AUTO_TERRAIN_FOLLOW' as const, label: 'TERRAIN CONTOUR MASKING (NOE)' },
                    { id: 'HIGH_ALTITUDE_ISR' as const, label: 'HIGH ALTITUDE STANDOFF ISR (FL180)' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setAvoidanceMode(mode.id)}
                      className={`text-left p-1.5 rounded border text-[8px] font-mono transition-colors ${
                        avoidanceMode === mode.id
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                          : 'bg-black/40 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AutonomousFlightPlanner;
