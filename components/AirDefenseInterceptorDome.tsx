import React, { useState, useEffect } from 'react';
import { IncomingMissileVector, AirDefenseBattery } from '../types.ts';
import { playTacticalSound, speakTacticalReadout } from '../utils/audioUtils.ts';

interface AirDefenseInterceptorDomeProps {
  soundMuted?: boolean;
}

const INITIAL_MISSILES: IncomingMissileVector[] = [
  {
    id: 'tgt-msl-01',
    threatType: 'Cruise Missile (Soumar/Paveh)',
    originLocation: [44.200, 14.500],
    currentLocation: [43.500, 13.100],
    targetDestination: [43.330, 12.580],
    targetName: 'Bab-el-Mandeb Commercial Shipping Convoy',
    altitudeFt: 250,
    velocityMach: 0.85,
    timeToImpactSeconds: 68,
    radarCrossSectionM2: 0.15,
    status: 'Tracking',
    interceptionProbabilityPercent: 91,
    assignedBatteryId: 'bat-01'
  },
  {
    id: 'tgt-msl-02',
    threatType: 'Loitering Suicide Drone (Shahed-136)',
    originLocation: [42.100, 1.800],
    currentLocation: [41.920, 2.100],
    targetDestination: [41.867, 3.937],
    targetName: 'Mandera Joint Border FOB Complex',
    altitudeFt: 1800,
    velocityMach: 0.22,
    timeToImpactSeconds: 142,
    radarCrossSectionM2: 0.05,
    status: 'Tracking',
    interceptionProbabilityPercent: 96,
    assignedBatteryId: 'bat-02'
  },
  {
    id: 'tgt-msl-03',
    threatType: 'Ballistic Missile (Qiam/Fateh)',
    originLocation: [56.800, 26.900],
    currentLocation: [56.500, 26.650],
    targetDestination: [56.400, 26.560],
    targetName: 'Strait of Hormuz Naval Patrol Squadron',
    altitudeFt: 65000,
    velocityMach: 4.8,
    timeToImpactSeconds: 32,
    radarCrossSectionM2: 0.85,
    status: 'Target Locked',
    interceptionProbabilityPercent: 84,
    assignedBatteryId: 'bat-03'
  }
];

const INITIAL_BATTERIES: AirDefenseBattery[] = [
  {
    id: 'bat-01',
    name: 'Spyder-MR Air Defense Battery Alpha',
    type: 'Spyder-MR SAM',
    location: [43.300, 12.600],
    coverageRadiusKm: 50,
    missilesReady: 8,
    status: 'Active Radar',
    radarTrackingRangeKm: 120
  },
  {
    id: 'bat-02',
    name: 'Mistral-3 VSHORAD C-UAS Battery',
    type: 'Mistral-3 VSHORAD',
    location: [41.860, 3.930],
    coverageRadiusKm: 15,
    missilesReady: 12,
    status: 'Active Radar',
    radarTrackingRangeKm: 45
  },
  {
    id: 'bat-03',
    name: 'KNS Shujaa Naval CIWS & Surface Interceptor',
    type: 'Naval CIWS 76mm Oto',
    location: [56.350, 26.500],
    coverageRadiusKm: 25,
    missilesReady: 16,
    status: 'Active Radar',
    radarTrackingRangeKm: 80
  },
  {
    id: 'bat-04',
    name: 'Manda Bay HELMA-P Laser Interceptor',
    type: 'HELMA-P High-Energy Laser',
    location: [40.916, -2.253],
    coverageRadiusKm: 6,
    missilesReady: 99,
    status: 'Standby',
    radarTrackingRangeKm: 20
  }
];

export const AirDefenseInterceptorDome: React.FC<AirDefenseInterceptorDomeProps> = ({ soundMuted = false }) => {
  const [missiles, setMissiles] = useState<IncomingMissileVector[]>(INITIAL_MISSILES);
  const [batteries, setBatteries] = useState<AirDefenseBattery[]>(INITIAL_BATTERIES);
  const [selectedMissile, setSelectedMissile] = useState<IncomingMissileVector>(INITIAL_MISSILES[0]);
  const [interceptingIds, setInterceptingIds] = useState<{ [id: string]: boolean }>({});

  // Countdown timer for incoming missiles
  useEffect(() => {
    const timer = setInterval(() => {
      setMissiles(prev =>
        prev.map(m => {
          if (m.status === 'Destroyed' || m.status === 'Impacted') return m;
          const nextTTI = Math.max(0, m.timeToImpactSeconds - 1);
          return {
            ...m,
            timeToImpactSeconds: nextTTI,
            status: nextTTI === 0 ? 'Impacted' : m.status
          };
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAuthorizeIntercept = (missileId: string) => {
    setInterceptingIds(prev => ({ ...prev, [missileId]: true }));
    playTacticalSound('alert-critical', soundMuted);
    speakTacticalReadout("Surface to air missile fired. Kinetic intercept course plotted.", !soundMuted);

    setMissiles(prev =>
      prev.map(m => m.id === missileId ? { ...m, status: 'Interception In Flight' } : m)
    );

    // After 2.5 seconds, intercept succeeds
    setTimeout(() => {
      setMissiles(prev =>
        prev.map(m => m.id === missileId ? { ...m, status: 'Destroyed' } : m)
      );
      setBatteries(prev =>
        prev.map(b => b.id === selectedMissile.assignedBatteryId ? { ...b, missilesReady: Math.max(0, b.missilesReady - 1) } : b)
      );
      playTacticalSound('neutralize-success', soundMuted);
      speakTacticalReadout("Target Splash Confirmed. Threat neutralized in flight.", !soundMuted);
    }, 2500);
  };

  return (
    <div className="h-full flex flex-col glass-panel hud-border p-2 sm:p-3 select-none overflow-y-auto lg:overflow-hidden animate-fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 mb-2.5 border-b border-cyan-500/30 pb-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-ping"></div>
          <div>
            <h2 className="text-xs sm:text-sm md:text-base font-black text-cyan-400 uppercase tracking-wider sm:tracking-widest flex items-center space-x-2">
              <span>INTEGRATED AIR DEFENSE & MISSILE INTERCEPTOR DOME</span>
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                C-RAM / SAM UMBRELLA
              </span>
            </h2>
            <p className="text-[8px] sm:text-[9px] font-mono text-slate-400 uppercase">
              BALLISTIC & CRUISE MISSILE TRAJECTORY TRACKING // TIME-TO-IMPACT // KINETIC INTERCEPTION
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[10px] font-mono">
          <span className="text-slate-400">DEFENSE POSTURE:</span>
          <span className="text-red-400 font-bold bg-red-950/60 px-2 py-0.5 rounded border border-red-500/40 animate-pulse">
            WEAPONS FREE // AIR DEFENSE ACTIVE
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-2.5 min-h-0">
        
        {/* Left Column: Incoming Missile Threats (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col space-y-2.5 min-h-0 overflow-y-auto custom-scrollbar">
          
          <div className="bg-slate-950/80 p-3 rounded-lg border border-red-500/30 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-mono text-red-400 font-bold uppercase tracking-widest">
                INCOMING HOSTILE AIR VECTORS ({missiles.filter(m => m.status !== 'Destroyed').length} ACTIVE)
              </span>
              <span className="text-[8px] font-mono text-slate-400">RADAR EARLY-WARNING: ONLINE</span>
            </div>

            <div className="space-y-2">
              {missiles.map((msl) => {
                const isSelected = selectedMissile.id === msl.id;
                const isDestroyed = msl.status === 'Destroyed';
                return (
                  <div
                    key={msl.id}
                    onClick={() => {
                      setSelectedMissile(msl);
                      playTacticalSound('button-click', soundMuted);
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isDestroyed
                        ? 'bg-slate-900/30 border-emerald-500/30 opacity-70'
                        : isSelected
                        ? 'bg-red-950/40 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[11px] font-bold text-white font-mono block">
                          {msl.threatType}
                        </span>
                        <span className="text-[8px] font-mono text-slate-400">
                          TARGETING: <strong className="text-amber-300">{msl.targetName}</strong>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                          isDestroyed
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : msl.timeToImpactSeconds < 45
                            ? 'bg-red-600 text-white animate-pulse'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {isDestroyed ? 'SPLASH CONFIRMED' : `TTI: ${msl.timeToImpactSeconds}S`}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800 text-[8px] font-mono text-slate-400">
                      <div>VELOCITY: <span className="text-cyan-300 font-bold">MACH {msl.velocityMach}</span></div>
                      <div>ALT: <span className="text-slate-200">{msl.altitudeFt.toLocaleString()} FT</span></div>
                      <div>PROB OF KILL: <span className="text-emerald-400 font-bold">{msl.interceptionProbabilityPercent}%</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Air Defense Batteries Status Grid */}
          <div className="bg-slate-900/80 p-3 rounded-lg border border-cyan-500/20 flex flex-col space-y-2">
            <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest">
              DEPLOYED SURFACE-TO-AIR & CIWS BATTERIES
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {batteries.map((bat) => (
                <div key={bat.id} className="bg-black/50 p-2.5 rounded border border-slate-800 text-[8px] sm:text-[9px] font-mono space-y-1">
                  <div className="flex justify-between">
                    <strong className="text-white truncate">{bat.name}</strong>
                    <span className="text-emerald-400 font-bold">{bat.missilesReady} READY</span>
                  </div>
                  <div className="text-slate-400">
                    TYPE: <span className="text-cyan-300">{bat.type}</span> // RADAR: {bat.radarTrackingRangeKm} KM
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Interceptor Trajectory Detail & Fire Authorization (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col space-y-2.5 min-h-0 overflow-y-auto custom-scrollbar">
          
          {selectedMissile && (
            <div className="bg-slate-950/90 p-3 rounded-lg border border-cyan-500/30 space-y-3 flex-grow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                  <div>
                    <span className="text-[8px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                      MISSILE TRAJECTORY INTERCEPT COMPUTER // {selectedMissile.id.toUpperCase()}
                    </span>
                    <h3 className="text-xs sm:text-sm font-black text-white mt-0.5">
                      {selectedMissile.threatType}
                    </h3>
                  </div>
                  <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                    selectedMissile.status === 'Destroyed'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-red-500/20 text-red-400 border-red-500/40'
                  }`}>
                    {selectedMissile.status}
                  </span>
                </div>

                {/* 3D Parabolic Trajectory Visualization Canvas */}
                <div className="h-32 bg-black/80 rounded-lg border border-slate-800 my-3 p-2 relative flex items-end overflow-hidden">
                  <div className="absolute top-2 left-2 text-[8px] font-mono text-slate-500">
                    PARABOLIC FLIGHT PROFILE // TIME TO IMPACT: {selectedMissile.timeToImpactSeconds} SEC
                  </div>

                  <svg className="w-full h-full overflow-visible">
                    {/* Parabolic Missile Path */}
                    <path
                      d="M 10 90 Q 140 10 320 85"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2.5"
                      strokeDasharray="4, 3"
                    />
                    {/* Surface SAM Interceptor Path */}
                    {interceptingIds[selectedMissile.id] && (
                      <path
                        d="M 280 90 Q 200 40 140 10"
                        fill="none"
                        stroke="#00f2ff"
                        strokeWidth="2"
                      />
                    )}
                    {/* Missile Vector Dot */}
                    <circle cx="140" cy="10" r="5" fill="#ef4444" className="animate-ping" />
                    <circle cx="140" cy="10" r="4" fill="#ef4444" />
                    {/* SAM Launch Battery Dot */}
                    <circle cx="280" cy="90" r="4" fill="#00f2ff" />
                  </svg>
                </div>

                <div className="space-y-1.5 text-[9px] sm:text-[10px] font-mono bg-black/40 p-2.5 rounded border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">ASSIGNED INTERCEPTOR:</span>
                    <span className="text-cyan-300 font-bold">Spyder-MR SAM (Python-5 / Derby Interceptor)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">PROJECTED IMPACT POINT:</span>
                    <span className="text-white">[{selectedMissile.targetDestination[0].toFixed(3)}°E, {selectedMissile.targetDestination[1].toFixed(3)}°N]</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">RADAR CROSS SECTION (RCS):</span>
                    <span className="text-slate-200">{selectedMissile.radarCrossSectionM2} m² (Low Observable)</span>
                  </div>
                </div>
              </div>

              {/* Fire Intercept Authorization Trigger */}
              <button
                onClick={() => handleAuthorizeIntercept(selectedMissile.id)}
                disabled={selectedMissile.status === 'Destroyed' || selectedMissile.status === 'Interception In Flight'}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-black text-[10px] sm:text-[11px] font-mono py-2.5 rounded uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(239,68,68,0.5)] disabled:opacity-40 min-h-[42px]"
              >
                {selectedMissile.status === 'Destroyed'
                  ? '✓ THREAT SPLASHED // AIRSPACE SECURE'
                  : selectedMissile.status === 'Interception In Flight'
                  ? '⚡ INTERCEPTOR IN FLIGHT...'
                  : '🚀 AUTHORIZE KINETIC INTERCEPT (FIRE SAM)'}
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default AirDefenseInterceptorDome;
