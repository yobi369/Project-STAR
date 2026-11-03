import React, { useState } from 'react';
import { FobSupplyStatus, MedevacCorridor } from '../types.ts';
import { playTacticalSound, speakTacticalReadout } from '../utils/audioUtils.ts';

interface CombatLogisticsCenterProps {
  soundMuted?: boolean;
}

const INITIAL_FOBS: FobSupplyStatus[] = [
  {
    id: 'fob-mandera',
    name: 'FOB Mandera (Tri-Border Sector)',
    location: [41.867, 3.937],
    sector: 'MANDERA_TRI_BORDER',
    garrisonStrength: 180,
    ammoSmallArmsPercent: 78,
    ammoArtilleryOrMissilesPercent: 42,
    aviationFuelJp8Percent: 35,
    dieselGeneratorsPercent: 64,
    medicalKitsPercent: 88,
    waterSupplyDays: 14,
    alertStatus: 'RESUPPLY_NEEDED',
    activeThreatLevel: 'HIGH'
  },
  {
    id: 'fob-manda-bay',
    name: 'Camp Simba / Manda Bay Naval Station',
    location: [40.916, -2.253],
    sector: 'INDIAN_OCEAN_LITTORAL',
    garrisonStrength: 450,
    ammoSmallArmsPercent: 94,
    ammoArtilleryOrMissilesPercent: 86,
    aviationFuelJp8Percent: 92,
    dieselGeneratorsPercent: 95,
    medicalKitsPercent: 98,
    waterSupplyDays: 45,
    alertStatus: 'OPTIMAL',
    activeThreatLevel: 'LOW'
  },
  {
    id: 'fob-wajir',
    name: 'Wajir Tactical Forward Air Station',
    location: [40.091, 1.740],
    sector: 'NORTHERN_FRONTIER',
    garrisonStrength: 220,
    ammoSmallArmsPercent: 82,
    ammoArtilleryOrMissilesPercent: 70,
    aviationFuelJp8Percent: 78,
    dieselGeneratorsPercent: 85,
    medicalKitsPercent: 90,
    waterSupplyDays: 28,
    alertStatus: 'OPTIMAL',
    activeThreatLevel: 'MEDIUM'
  },
  {
    id: 'fob-hulugho',
    name: 'FOB Hulugho Border Outpost',
    location: [41.050, -1.220],
    sector: 'BONI_FOREST_CORRIDOR',
    garrisonStrength: 95,
    ammoSmallArmsPercent: 48,
    ammoArtilleryOrMissilesPercent: 28,
    aviationFuelJp8Percent: 20,
    dieselGeneratorsPercent: 38,
    medicalKitsPercent: 55,
    waterSupplyDays: 6,
    alertStatus: 'CRITICAL_SHORTAGE',
    activeThreatLevel: 'HIGH'
  }
];

const MEDEVAC_CORRIDORS: MedevacCorridor[] = [
  {
    id: 'med-01',
    fobOrigin: 'FOB Hulugho Outpost',
    hospitalDestination: 'Mombasa Level-4 Military Hospital',
    distanceKm: 310,
    flightTimeMinutes: 52,
    threatExposureScore: 18,
    assignedHelicopter: 'AW139 MEDEVAC-1',
    status: 'Ready',
    routeCoordinates: [[41.050, -1.220], [40.000, -2.500], [39.660, -4.050]]
  },
  {
    id: 'med-02',
    fobOrigin: 'FOB Mandera',
    hospitalDestination: 'Defence Forces Memorial Hospital (Nairobi)',
    distanceKm: 820,
    flightTimeMinutes: 110,
    threatExposureScore: 8,
    assignedHelicopter: 'C-27J Spartan Aeromedical Evac',
    status: 'Ready',
    routeCoordinates: [[41.867, 3.937], [39.500, 2.000], [36.820, -1.290]]
  }
];

export const CombatLogisticsCenter: React.FC<CombatLogisticsCenterProps> = ({ soundMuted = false }) => {
  const [fobs, setFobs] = useState<FobSupplyStatus[]>(INITIAL_FOBS);
  const [selectedFob, setSelectedFob] = useState<FobSupplyStatus>(INITIAL_FOBS[0]);
  const [corridors] = useState<MedevacCorridor[]>(MEDEVAC_CORRIDORS);
  const [isResupplying, setIsResupplying] = useState(false);

  const handleDispatchResupply = (fobId: string) => {
    setIsResupplying(true);
    playTacticalSound('radar-ping', soundMuted);

    setTimeout(() => {
      setFobs(prev =>
        prev.map(f => {
          if (f.id === fobId) {
            return {
              ...f,
              ammoSmallArmsPercent: 95,
              ammoArtilleryOrMissilesPercent: 90,
              aviationFuelJp8Percent: 88,
              dieselGeneratorsPercent: 92,
              medicalKitsPercent: 100,
              waterSupplyDays: 30,
              alertStatus: 'OPTIMAL'
            };
          }
          return f;
        })
      );
      setIsResupplying(false);
      playTacticalSound('neutralize-success', soundMuted);
      speakTacticalReadout("Emergency aerial resupply convoy dispatched. Base sustainment replenished.", !soundMuted);
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
              <span>PREDICTIVE COMBAT LOGISTICS & MEDEVAC ROUTING</span>
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                FOB SUSTAINMENT
              </span>
            </h2>
            <p className="text-[8px] sm:text-[9px] font-mono text-slate-400 uppercase">
              DEPOT INVENTORY FORECASTING // AMMUNITION & FUEL BURN-RATES // LOW-RISK CASEVAC AIR CORRIDORS
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[9px] font-mono">
          <span className="text-slate-400">SUPPLY CHAIN SUSTAINMENT:</span>
          <span className="text-cyan-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-cyan-500/30">
            STRATEGIC PETROLEUM & AMMO BUFFER ACTIVE
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-2.5 min-h-0">
        
        {/* Left Column: Forward Operating Bases (FOB) Sustainment (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col space-y-2.5 min-h-0 overflow-y-auto custom-scrollbar">
          <div className="bg-slate-950/80 p-3 rounded-lg border border-cyan-500/30 space-y-2">
            <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-widest block">
              FORWARD OPERATING BASES SUSTAINMENT STATUS ({fobs.length} GARRISONS)
            </span>

            <div className="space-y-2">
              {fobs.map((fob) => {
                const isSelected = selectedFob.id === fob.id;
                const isCritical = fob.alertStatus === 'CRITICAL_SHORTAGE';
                return (
                  <div
                    key={fob.id}
                    onClick={() => {
                      setSelectedFob(fob);
                      playTacticalSound('button-click', soundMuted);
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isCritical
                        ? 'bg-red-950/40 border-red-500 animate-pulse'
                        : isSelected
                        ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_12px_rgba(0,242,255,0.25)]'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-white text-[10px] sm:text-[11px] font-mono block">
                          {fob.name}
                        </strong>
                        <span className="text-[8px] font-mono text-slate-400">
                          GARRISON: <span className="text-cyan-300 font-bold">{fob.garrisonStrength} TROOPS</span>
                        </span>
                      </div>
                      <span className={`text-[7px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                        isCritical
                          ? 'bg-red-600 text-white'
                          : fob.alertStatus === 'RESUPPLY_NEEDED'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {fob.alertStatus.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 mt-2 pt-2 border-t border-slate-800 text-[8px] font-mono text-slate-400">
                      <div>
                        <span>AMMO:</span>
                        <span className="text-white font-bold block">{fob.ammoSmallArmsPercent}%</span>
                      </div>
                      <div>
                        <span>JP-8 FUEL:</span>
                        <span className="text-cyan-300 font-bold block">{fob.aviationFuelJp8Percent}%</span>
                      </div>
                      <div>
                        <span>MEDKITS:</span>
                        <span className="text-emerald-400 font-bold block">{fob.medicalKitsPercent}%</span>
                      </div>
                      <div>
                        <span>WATER:</span>
                        <span className="text-white font-bold block">{fob.waterSupplyDays} DAYS</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Medevac Corridors */}
          <div className="bg-slate-900/80 p-3 rounded-lg border border-cyan-500/20 space-y-2">
            <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest block">
              DEDICATED CASEVAC / MEDEVAC AIR CORRIDORS
            </span>

            <div className="space-y-1.5">
              {corridors.map((c) => (
                <div key={c.id} className="bg-black/50 p-2.5 rounded border border-slate-800 text-[8px] sm:text-[9px] font-mono space-y-1">
                  <div className="flex justify-between">
                    <strong className="text-white">{c.fobOrigin} ➔ {c.hospitalDestination}</strong>
                    <span className="text-emerald-400 font-bold">{c.flightTimeMinutes} MIN ETE</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>AIRCRAFT: {c.assignedHelicopter}</span>
                    <span>THREAT EXPOSURE: <strong className="text-cyan-300">{c.threatExposureScore}/100 (LOW)</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Selected FOB Supply Replenishment (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col space-y-2.5 min-h-0 overflow-y-auto custom-scrollbar">
          {selectedFob && (
            <div className="bg-slate-950/90 p-3 rounded-lg border border-cyan-500/30 space-y-3 flex-grow flex flex-col justify-between">
              <div>
                <div className="border-b border-slate-800 pb-2">
                  <span className="text-[8px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                    BASE SUPPLY SUSTAINMENT DEEP AUDIT // {selectedFob.id.toUpperCase()}
                  </span>
                  <h3 className="text-xs sm:text-sm font-black text-white mt-0.5">
                    {selectedFob.name}
                  </h3>
                </div>

                <div className="space-y-2 my-2 text-[9px] sm:text-[10px] font-mono">
                  {/* Progress Bars for Supply */}
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>SMALL ARMS & 155MM ARTILLERY SHELLS</span>
                      <span className="text-white font-bold">{selectedFob.ammoSmallArmsPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded overflow-hidden">
                      <div style={{ width: `${selectedFob.ammoSmallArmsPercent}%` }} className="h-full bg-cyan-400"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>JP-8 AVIATION TURBINE FUEL (UAV / HELI)</span>
                      <span className="text-cyan-300 font-bold">{selectedFob.aviationFuelJp8Percent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded overflow-hidden">
                      <div style={{ width: `${selectedFob.aviationFuelJp8Percent}%` }} className="h-full bg-blue-400"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>FIELD SURGICAL & TRAUMA MEDKITS</span>
                      <span className="text-emerald-400 font-bold">{selectedFob.medicalKitsPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded overflow-hidden">
                      <div style={{ width: `${selectedFob.medicalKitsPercent}%` }} className="h-full bg-emerald-400"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleDispatchResupply(selectedFob.id)}
                disabled={isResupplying || selectedFob.alertStatus === 'OPTIMAL'}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-[10px] sm:text-[11px] font-mono py-2.5 rounded uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] disabled:opacity-40 min-h-[42px]"
              >
                {isResupplying
                  ? 'DISPATCHING AIRDROP / CONVOY RESUPPLY...'
                  : selectedFob.alertStatus === 'OPTIMAL'
                  ? '✓ BASE STOCKS OPTIMAL'
                  : '📦 DISPATCH EMERGENCY COMBAT RESUPPLY →'}
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default CombatLogisticsCenter;
