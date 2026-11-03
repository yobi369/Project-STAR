import React, { useState } from 'react';
import { INITIAL_DRONE_SWARM, COUNTER_UAS_ZONES } from '../constants.ts';
import { DroneSwarmUnit, CounterUasDefenseZone } from '../types.ts';
import { computeSwarmTelemetry } from '../services/geminiService.ts';
import { playTacticalSound } from '../utils/audioUtils.ts';

interface DroneSwarmCommandProps {
  soundMuted?: boolean;
}

const DroneSwarmCommand: React.FC<DroneSwarmCommandProps> = ({ soundMuted = false }) => {
  const [swarmUnits] = useState<DroneSwarmUnit[]>(INITIAL_DRONE_SWARM);
  const [selectedUnit, setSelectedUnit] = useState<DroneSwarmUnit>(INITIAL_DRONE_SWARM[0]);
  const [cuasZones, setCuasZones] = useState<CounterUasDefenseZone[]>(COUNTER_UAS_ZONES);
  const [selectedFormation, setSelectedFormation] = useState<string>('HUNTER_KILLER');
  const [isComputing, setIsComputing] = useState(false);
  const [swarmPlan, setSwarmPlan] = useState<{
    formation: string;
    optimalAltitudeMeters: number;
    meshProtocolBridging: string;
    threatInterceptionProbability: number;
    waypointPath: [number, number][];
    cuasShieldStatus: string;
    tacticalDirectives: string[];
  } | null>(null);

  const [rfJammingActive, setRfJammingActive] = useState(true);

  const handleComputeSwarmMesh = async () => {
    setIsComputing(true);
    playTacticalSound('radar-ping', soundMuted);

    try {
      const plan = await computeSwarmTelemetry(swarmUnits, [39.0, 1.5], selectedFormation);
      setSwarmPlan(plan);
      playTacticalSound('alert-critical', soundMuted);
    } catch (e) {
      console.error(e);
    } finally {
      setIsComputing(false);
    }
  };

  const toggleZoneRfShield = (zoneId: string) => {
    playTacticalSound('button-click', soundMuted);
    setCuasZones(prev => prev.map(z => z.id === zoneId ? { ...z, rfShieldActive: !z.rfShieldActive } : z));
  };

  return (
    <div className="h-full flex flex-col glass-panel hud-border p-3 sm:p-4 select-none overflow-y-auto lg:overflow-hidden animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3 border-b border-cyan-500/30 pb-2">
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400 animate-pulse"></span>
          <div>
            <h2 className="text-xs sm:text-sm md:text-base font-black text-cyan-400 uppercase tracking-wider sm:tracking-widest">
              UNIVERSAL DRONE SWARM & COUNTER-UAS (C-UAS) COMMAND
            </h2>
            <p className="text-[8px] sm:text-[9px] font-mono text-slate-400 uppercase">
              MAVLINK 2.0 / NATO STANAG 4586 PROTOCOL BRIDGING // MULTI-TIER UCAV & ANTI-DRONE SHIELD
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setRfJammingActive(!rfJammingActive);
              playTacticalSound('button-click', soundMuted);
            }}
            className={`text-[8px] sm:text-[9px] font-mono font-bold px-2.5 sm:px-3 py-1.5 rounded border uppercase transition-colors min-h-[36px] ${
              rfJammingActive
                ? 'bg-red-500 text-black border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                : 'bg-black/40 text-slate-400 border-slate-700'
            }`}
          >
            {rfJammingActive ? "C-UAS RF JAMMING DOME: ENGAGED" : "C-UAS RF JAMMING: STANDBY"}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        
        {/* Left Column: Heterogeneous Drone Fleet & Formations (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-3 overflow-y-auto pr-0 sm:pr-1 custom-scrollbar">
          
          {/* Swarm Fleet Roster */}
          <div className="bg-slate-900/80 p-3 rounded-lg border border-cyan-500/20">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] sm:text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                ACTIVE SWARM UNITS ({swarmUnits.length}):
              </span>
              <span className="text-[8px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                MESH LINK: 100%
              </span>
            </div>

            <div className="space-y-2">
              {swarmUnits.map((uav) => {
                const isSel = selectedUnit.id === uav.id;
                return (
                  <div
                    key={uav.id}
                    onClick={() => {
                      setSelectedUnit(uav);
                      playTacticalSound('button-click', soundMuted);
                    }}
                    className={`p-2.5 rounded border cursor-pointer transition-all ${
                      isSel
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(0,242,255,0.15)]'
                        : 'bg-black/40 border-slate-800 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold mb-1">
                      <span className="text-white flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                        <span>{uav.tailNumber}</span>
                      </span>
                      <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {uav.protocol}
                      </span>
                    </div>

                    <div className="flex justify-between text-[9px] font-mono text-slate-400">
                      <span>MODEL: {uav.model}</span>
                      <span className="text-cyan-400 font-bold">ALT: {uav.altitudeMeters}m | {uav.speedKts}kts</span>
                    </div>

                    {/* Progress indicators */}
                    <div className="mt-1.5 grid grid-cols-2 gap-2 text-[8px] font-mono">
                      <div>
                        <div className="flex justify-between text-slate-400 mb-0.5">
                          <span>BATTERY / FUEL</span>
                          <span className="text-emerald-400 font-bold">{uav.batteryOrFuelPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1 rounded overflow-hidden">
                          <div className="bg-emerald-500 h-full" style={{ width: `${uav.batteryOrFuelPercent}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-400 mb-0.5">
                          <span>LINK HEALTH</span>
                          <span className="text-cyan-400 font-bold">{uav.linkHealth}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1 rounded overflow-hidden">
                          <div className="bg-cyan-400 h-full" style={{ width: `${uav.linkHealth}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Swarm Formation Selection */}
          <div className="bg-slate-900/80 p-3 rounded-lg border border-cyan-500/20">
            <span className="text-[9px] sm:text-[10px] font-black text-cyan-400 uppercase tracking-widest block mb-2">
              AUTONOMOUS SWARM FORMATION DOCTRINE:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {[
                { id: 'HUNTER_KILLER', label: 'Hunter-Killer Strike' },
                { id: 'PINCER_CORDON', label: 'Pincer Perimeter Cordon' },
                { id: 'MARITIME_ESCORT', label: 'Maritime Escort' },
                { id: 'DISTRIBUTED_MESH', label: 'BVLOS Relay Mesh' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setSelectedFormation(f.id);
                    playTacticalSound('button-click', soundMuted);
                  }}
                  className={`p-2 rounded text-[9px] font-mono text-left transition-colors uppercase min-h-[38px] ${
                    selectedFormation === f.id
                      ? 'bg-cyan-500 text-black font-black'
                      : 'bg-black/40 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleComputeSwarmMesh}
              disabled={isComputing}
              className="w-full mt-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-xs py-2.5 rounded uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:opacity-40 min-h-[44px]"
            >
              {isComputing ? "CALCULATING MESH VECTORS..." : "DEPLOY AUTONOMOUS SWARM FORMATION →"}
            </button>
          </div>

        </div>

        {/* Right Column: Counter-UAS Electronic Warfare & Swarm Battle Plan (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-3 overflow-y-auto pr-0 sm:pr-1 custom-scrollbar">
          
          {/* Counter-UAS Defensive Shields Grid */}
          <div className="bg-slate-900/80 p-3 rounded-lg border border-cyan-500/20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-1">
              <span className="text-[9px] sm:text-[10px] font-black text-red-400 uppercase tracking-widest">
                COUNTER-UAS (C-UAS) ELECTRONIC WARFARE BATTERIES:
              </span>
              <span className="text-[7px] sm:text-[8px] font-mono text-cyan-400">
                SNIFFER: 868MHz - 5.8GHz ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cuasZones.map((zone) => (
                <div key={zone.id} className="p-2.5 rounded bg-black/50 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[10px] font-black text-white">{zone.zoneName}</h4>
                      <span className="text-[8px] font-mono text-slate-400">
                        RADIUS: {zone.radiusKm} KM // LOGS: {zone.interceptionsLogged}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleZoneRfShield(zone.id)}
                      className={`text-[8px] font-mono font-bold px-2 py-1 rounded border uppercase transition-colors min-h-[32px] ${
                        zone.rfShieldActive
                          ? 'bg-red-500/20 text-red-400 border-red-500/40'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}
                    >
                      {zone.rfShieldActive ? "SHIELD: ON" : "SHIELD: OFF"}
                    </button>
                  </div>

                  {zone.detectedRogueFrequencies.length > 0 ? (
                    <div className="text-[8px] font-mono text-amber-400 bg-amber-950/30 p-1.5 rounded border border-amber-500/30">
                      ROGUE JAMMED: {zone.detectedRogueFrequencies.join(' • ')}
                    </div>
                  ) : (
                    <div className="text-[8px] font-mono text-emerald-400/80 bg-emerald-950/20 p-1 rounded">
                      SPECTRUM CLEAR // ZERO INTRUSIONS
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Autonomous Swarm Mission Plan */}
          {swarmPlan ? (
            <div className="bg-slate-900/90 p-3 sm:p-4 rounded-xl border border-cyan-500/30 space-y-3 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-800 pb-2 gap-2">
                <div>
                  <span className="text-[8px] sm:text-[9px] font-mono text-emerald-400 font-bold uppercase bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                    SWARM ACTIVE: {swarmPlan.formation}
                  </span>
                  <h3 className="text-xs sm:text-sm font-black text-white mt-1">
                    AUTONOMOUS PROTOCOL TRANSLATION & ROUTE VECTORS
                  </h3>
                </div>

                <div>
                  <span className="text-[11px] sm:text-xs font-mono font-black text-cyan-400 bg-cyan-950/60 px-2 py-1 rounded border border-cyan-500/30">
                    {swarmPlan.threatInterceptionProbability}% INTERCEPT PROBABILITY
                  </span>
                </div>
              </div>

              {/* Protocol Bridging Banner */}
              <div className="bg-black/50 p-2 rounded text-[9px] sm:text-[10px] font-mono text-cyan-300 border border-cyan-500/20 flex flex-col sm:flex-row justify-between gap-1">
                <span>PROTOCOL BRIDGE: {swarmPlan.meshProtocolBridging}</span>
                <span className="text-slate-400">ALTITUDE: {swarmPlan.optimalAltitudeMeters}M</span>
              </div>

              {/* Directives */}
              <div className="space-y-1.5">
                <span className="text-[8px] sm:text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                  AUTONOMOUS DIRECTIVES & INTERCEPT PHASES:
                </span>
                {swarmPlan.tacticalDirectives.map((d, i) => (
                  <div key={i} className="text-[11px] sm:text-xs font-mono text-slate-200 flex items-start space-x-2 bg-black/30 p-2 rounded border border-slate-800/80">
                    <span className="text-emerald-400 font-bold">0{i+1}.</span>
                    <span>{d}</span>
                  </div>
                ))}
              </div>

              <div className="text-[8px] sm:text-[9px] font-mono text-slate-400 pt-1 break-words">
                WAYPOINTS: {swarmPlan.waypointPath.map(w => `[${w[0].toFixed(2)}, ${w[1].toFixed(2)}]`).join(' ➔ ')}
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-6 bg-slate-900/40 rounded-xl border border-dashed border-slate-800 text-center text-slate-500 font-mono text-xs space-y-2">
              <span className="text-slate-400 font-bold block uppercase">
                SWARM READY FOR MESH FORMATION DISPATCH
              </span>
              <p className="text-[10px] text-slate-500 max-w-md mx-auto">
                Select a tactical swarm formation doctrine (Hunter-Killer, Pincer Cordon, Anti-Piracy Escort) and click &quot;DEPLOY AUTONOMOUS SWARM FORMATION&quot; to compute MAVLink / STANAG 4586 multi-tier flight paths and anti-drone intercept vectors.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default DroneSwarmCommand;
