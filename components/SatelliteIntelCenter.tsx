import React, { useState } from 'react';
import { SATELLITE_CONSTELLATIONS } from '../constants.ts';
import { SatellitePass, SatelliteChangeDetectionResult, Threat } from '../types.ts';
import { analyzeSatelliteGeoint } from '../services/geminiService.ts';
import { playTacticalSound } from '../utils/audioUtils.ts';

interface SatelliteIntelCenterProps {
  onAddThreat: (threat: Omit<Threat, 'id'>) => void;
  soundMuted?: boolean;
}

const SatelliteIntelCenter: React.FC<SatelliteIntelCenterProps> = ({ onAddThreat, soundMuted = false }) => {
  const [satellites] = useState<SatellitePass[]>(SATELLITE_CONSTELLATIONS);
  const [selectedSat, setSelectedSat] = useState<SatellitePass>(SATELLITE_CONSTELLATIONS[0]);
  const [activeSensor, setActiveSensor] = useState<'SAR Radar' | 'Optical Multispectral' | 'Thermal IR'>('SAR Radar');
  const [cloudPenetrationSAR, setCloudPenetrationSAR] = useState(true);
  const [targetZone, setTargetZone] = useState<string>("Mandera-Wajir Forward Border Zone");
  const [targetCoords, setTargetCoords] = useState<[number, number]>([41.52, 3.82]);
  const [isScanning, setIsScanning] = useState(false);
  const [geointResult, setGeointResult] = useState<SatelliteChangeDetectionResult | null>(null);
  const [loggedToMap, setLoggedToMap] = useState(false);

  const handleRunGeointAnalysis = async () => {
    setIsScanning(true);
    setGeointResult(null);
    setLoggedToMap(false);
    playTacticalSound('radar-ping', soundMuted);

    try {
      const result = await analyzeSatelliteGeoint(targetZone, targetCoords, activeSensor, cloudPenetrationSAR);
      setGeointResult(result);
      playTacticalSound('alert-critical', soundMuted);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleLogThreatFromSatellite = () => {
    if (!geointResult) return;
    playTacticalSound('alert-critical', soundMuted);
    setLoggedToMap(true);

    onAddThreat({
      type: 'Confirmed',
      location: geointResult.coordinates,
      title: `GEOINT Satellite Contact: ${geointResult.targetName}`,
      description: geointResult.analysisSummary,
      detectedAt: 'JUST NOW',
      priority: geointResult.threatElevation === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      source: `${selectedSat.name} // ${activeSensor}`,
      estimatedHostiles: 'Fortified Revetment / Mobile Technicals',
      threatCategory: 'ASYMMETRIC_GROUND'
    });
  };

  return (
    <div className="h-full flex flex-col glass-panel hud-border p-3 sm:p-4 select-none overflow-y-auto lg:overflow-hidden animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3 border-b border-cyan-500/30 pb-2">
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-cyan-400 animate-ping"></span>
          <div>
            <h2 className="text-xs sm:text-sm md:text-base font-black text-cyan-400 uppercase tracking-wider sm:tracking-widest">
              ORBITAL VISUAL INTELLIGENCE & SAR GEOINT CENTER
            </h2>
            <p className="text-[8px] sm:text-[9px] font-mono text-slate-400 uppercase">
              KENYA SPACE AGENCY // MULTI-CONSTELLATION SATELLITE RADAR & OPTICAL RECON
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCloudPenetrationSAR(!cloudPenetrationSAR)}
            className={`text-[8px] sm:text-[9px] font-mono font-bold px-2 sm:px-2.5 py-1.5 rounded border uppercase transition-colors min-h-[36px] ${
              cloudPenetrationSAR
                ? 'bg-cyan-500 text-black border-cyan-500 shadow-[0_0_10px_rgba(0,242,255,0.4)]'
                : 'bg-black/40 text-slate-400 border-slate-700'
            }`}
          >
            {cloudPenetrationSAR ? "SAR CLOUD PENETRATION: ON" : "SAR PENETRATION: OFF"}
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        
        {/* Left Column: Satellite Constellation Picker & Target Zones (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-3 overflow-y-auto pr-0 sm:pr-1 custom-scrollbar">
          
          {/* Active Constellations */}
          <div className="bg-slate-900/80 p-3 rounded-lg border border-cyan-500/20">
            <span className="text-[9px] sm:text-[10px] font-black text-cyan-400 uppercase tracking-widest block mb-2">
              ACTIVE DEFENSE CONSTELLATIONS:
            </span>
            <div className="space-y-2">
              {satellites.map((sat) => {
                const isSel = selectedSat.id === sat.id;
                return (
                  <div
                    key={sat.id}
                    onClick={() => {
                      setSelectedSat(sat);
                      playTacticalSound('button-click', soundMuted);
                    }}
                    className={`p-2 rounded border cursor-pointer transition-all ${
                      isSel
                        ? 'bg-cyan-950/50 border-cyan-400 text-cyan-200'
                        : 'bg-black/40 border-slate-800 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold mb-0.5">
                      <span className="text-white">{sat.name}</span>
                      <span className="text-[8px] px-1.5 py-0.2 rounded bg-white/10 text-cyan-300">
                        {sat.resolutionMeters}m RES
                      </span>
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-slate-400">
                      <span>{sat.orbitType}</span>
                      <span className="text-cyan-400 font-bold">{sat.nextPassETA}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Target Zone Quick Select */}
          <div className="bg-slate-900/80 p-3 rounded-lg border border-cyan-500/20">
            <span className="text-[9px] sm:text-[10px] font-black text-cyan-400 uppercase tracking-widest block mb-2">
              TASK ORBITAL TARGET RECON:
            </span>
            <div className="space-y-1.5">
              {[
                { name: "Mandera-Wajir Forward Border Zone", coords: [41.52, 3.82] as [number, number] },
                { name: "Lamu Maritime & Manda Bay Creek", coords: [40.65, -2.15] as [number, number] },
                { name: "Bab-el-Mandeb & Western Indian Ocean Channel", coords: [43.20, 12.50] as [number, number] },
                { name: "Nanyuki Air Defense & Grid Umbrella", coords: [37.02, 0.05] as [number, number] }
              ].map((zone) => (
                <button
                  key={zone.name}
                  onClick={() => {
                    setTargetZone(zone.name);
                    setTargetCoords(zone.coords);
                    playTacticalSound('button-click', soundMuted);
                  }}
                  className={`w-full text-left p-2 rounded text-[10px] font-mono transition-colors min-h-[40px] flex flex-col justify-center ${
                    targetZone === zone.name
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                      : 'bg-black/30 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <div className="truncate">{zone.name}</div>
                  <div className="text-[8px] text-slate-500 font-normal">
                    [{zone.coords[0].toFixed(2)}°E, {zone.coords[1].toFixed(2)}°N]
                  </div>
                </button>
              ))}
            </div>

            {/* Sensor Modality Toggle */}
            <div className="mt-3 pt-2 border-t border-slate-800">
              <span className="text-[9px] font-mono text-slate-400 block mb-1.5 uppercase">
                SENSOR MODALITY:
              </span>
              <div className="flex space-x-1">
                {(['SAR Radar', 'Optical Multispectral', 'Thermal IR'] as const).map((sensor) => (
                  <button
                    key={sensor}
                    onClick={() => {
                      setActiveSensor(sensor);
                      playTacticalSound('button-click', soundMuted);
                    }}
                    className={`flex-1 py-1.5 rounded text-[8px] font-mono font-bold uppercase transition-colors min-h-[36px] ${
                      activeSensor === sensor
                        ? 'bg-cyan-500 text-black'
                        : 'bg-black/40 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {sensor.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleRunGeointAnalysis}
              disabled={isScanning}
              className="w-full mt-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-black text-xs py-2.5 rounded uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,242,255,0.4)] disabled:opacity-40 min-h-[44px]"
            >
              {isScanning ? "ACQUIRING ORBITAL TELEMETRY..." : "EXECUTE SATELLITE TASKING →"}
            </button>
          </div>

        </div>

        {/* Right Column: Visual Satellite View & AI Change Detection Results (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-3 overflow-y-auto pr-0 sm:pr-1 custom-scrollbar">
          
          {/* Simulated Satellite Downlink Imagery & HUD Canvas */}
          <div className="relative min-h-[220px] aspect-[16/9] sm:aspect-[21/9] bg-black rounded-lg border border-cyan-500/30 overflow-hidden group">
            {/* Synthetic Top-Down SAR / Optical Visualizer */}
            <div className={`w-full h-full ${
              activeSensor === 'SAR Radar'
                ? 'bg-[radial-gradient(ellipse_at_center,_#083344_0%,_#020617_80%)]'
                : activeSensor === 'Thermal IR'
                ? 'bg-[radial-gradient(ellipse_at_center,_#4a044e_0%,_#020617_80%)]'
                : 'bg-[radial-gradient(ellipse_at_center,_#0f172a_0%,_#020617_80%)]'
            } flex items-center justify-center relative`}>
              
              {/* Coordinate Grid Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f2ff0a_1px,transparent_1px),linear-gradient(to_bottom,#00f2ff0a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              
              {/* Satellite Orbital Pass Path */}
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-cyan-400/40 border-b border-dashed border-cyan-300"></div>

              {/* Target Bounding Box */}
              <div className="relative z-10 p-3 sm:p-4 border-2 border-dashed border-cyan-400 bg-cyan-950/30 rounded-lg backdrop-blur-sm text-center max-w-md animate-pulse mx-2">
                <span className="text-[8px] sm:text-[9px] font-mono text-cyan-300 font-bold block uppercase tracking-widest">
                  ORBITAL DOWNLINK: {selectedSat.name}
                </span>
                <span className="text-xs sm:text-sm font-black text-white block mt-1">
                  TARGET: {targetZone}
                </span>
                <span className="text-[8px] sm:text-[9px] font-mono text-cyan-400/80">
                  COORDS: [{targetCoords[0].toFixed(3)}°E, {targetCoords[1].toFixed(3)}°N] | SENSOR: {activeSensor}
                </span>
              </div>

              {/* Orbital Telemetry HUD */}
              <div className="absolute top-2 inset-x-2 flex justify-between text-[7px] sm:text-[8px] font-mono text-cyan-400/90 pointer-events-none">
                <div>ALT: 540 KM // SUN-SYNC</div>
                <div>GSD: {selectedSat.resolutionMeters}M // SWATH: 45 KM</div>
              </div>

              <div className="absolute bottom-2 inset-x-2 flex justify-between text-[7px] sm:text-[8px] font-mono text-cyan-400/90 pointer-events-none">
                <div>TOP SECRET // NOFORN</div>
                <div>POLARIZATION: HH + HV (SAR)</div>
              </div>

              {isScanning && (
                <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center space-y-3 z-30">
                  <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest text-center px-4">
                    COMPUTING MULTI-TEMPORAL CHANGE DETECTION...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* AI GEOINT Automated Change Detection Result */}
          {geointResult ? (
            <div className="bg-slate-900/90 p-3 sm:p-4 rounded-xl border border-cyan-500/30 space-y-3 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-800 pb-2 gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`text-[8px] sm:text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                      geointResult.threatElevation === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-400 border-red-500/40'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    }`}>
                      {geointResult.threatElevation} ELEVATION
                    </span>
                    <span className="text-[10px] sm:text-xs font-mono text-slate-400">
                      {geointResult.previousPassDate} ➔ {geointResult.currentPassDate}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-black text-white mt-1">
                    AI GEOINT ASSESSMENT: {geointResult.targetName}
                  </h3>
                </div>

                <div>
                  <span className="text-[11px] sm:text-xs font-mono font-black text-cyan-400 bg-cyan-950/60 px-2 py-1 rounded border border-cyan-500/30">
                    {geointResult.changeConfidence}% CHANGE CONFIDENCE
                  </span>
                </div>
              </div>

              <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-mono">
                {geointResult.analysisSummary}
              </p>

              {/* Detected Physical Modifications */}
              <div className="bg-black/50 p-2.5 sm:p-3 rounded-lg border border-slate-800 space-y-1.5">
                <span className="text-[8px] sm:text-[9px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">
                  VERIFIED INFRASTRUCTURE & PHYSICAL MODIFICATIONS:
                </span>
                {geointResult.detectedModifications.map((mod, i) => (
                  <div key={i} className="text-[11px] sm:text-xs font-mono text-slate-200 flex items-start space-x-2">
                    <span className="text-cyan-400 font-bold">▸</span>
                    <span>{mod}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 gap-2">
                <span className="text-[8px] sm:text-[9px] font-mono text-slate-400">
                  COORDINATES: [{geointResult.coordinates[0].toFixed(3)}, {geointResult.coordinates[1].toFixed(3)}]
                </span>

                <button
                  onClick={handleLogThreatFromSatellite}
                  disabled={loggedToMap}
                  className={`w-full sm:w-auto text-[11px] sm:text-xs font-black px-4 sm:px-5 py-2.5 rounded uppercase tracking-wider font-mono transition-all min-h-[44px] ${
                    loggedToMap
                      ? 'bg-green-500 text-black'
                      : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                  }`}
                >
                  {loggedToMap ? "LOGGED TO TACTICAL MAP ✓" : "LOG CONTACT AS ACTIVE THREAT"}
                </button>
              </div>

            </div>
          ) : (
            <div className="p-4 sm:p-6 bg-slate-900/40 rounded-xl border border-dashed border-slate-800 text-center text-slate-500 font-mono text-xs space-y-2">
              <span className="text-slate-400 font-bold block uppercase">
                AWAITING SATELLITE TASKING PASS
              </span>
              <p className="text-[10px] text-slate-500 max-w-md mx-auto">
                Select a sovereign defense satellite (KENSAT-1, Sentinel-2, or COSMO-SkyMed SAR) and click &quot;EXECUTE SATELLITE TASKING&quot; to run automated optical and SAR change detection.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default SatelliteIntelCenter;
