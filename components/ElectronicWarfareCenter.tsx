import React, { useState, useEffect } from 'react';
import { RFEmitter, SpectrumBand } from '../types.ts';
import { playTacticalSound, speakTacticalReadout } from '../utils/audioUtils.ts';

interface ElectronicWarfareCenterProps {
  soundMuted?: boolean;
}

const INITIAL_EMITTERS: RFEmitter[] = [
  {
    id: 'rf-emit-01',
    frequencyMHz: 433.92,
    bandwidthKHz: 25,
    modulation: 'FSK',
    signalStrengthDbm: -68,
    emitterType: 'Hostile Tactical Handheld',
    location: [41.865, 3.935],
    confidence: 94,
    interceptedData: 'VOICE BURST // ENCRYPTED SPEECH FRAME 0x4A8F // BURST CELL: MANDERA NORTH',
    threatLevel: 'CRITICAL',
    triangulationBearings: [
      { stationName: 'DF Post Alpha (Mandera Fort)', azimuthDeg: 42.5 },
      { stationName: 'DF Post Bravo (Elwak Relay)', azimuthDeg: 12.3 },
      { stationName: 'DF Post Charlie (Rhamu Mast)', azimuthDeg: 95.8 }
    ],
    activeJammingCountermeasure: false
  },
  {
    id: 'rf-emit-02',
    frequencyMHz: 1575.42,
    bandwidthKHz: 2046,
    modulation: 'CW-PULSE',
    signalStrengthDbm: -45,
    emitterType: 'GPS Jammer (L1/L2)',
    location: [43.325, 12.578],
    confidence: 99,
    interceptedData: 'HIGH-POWER BARRAGE NOISE // DISRUPTING CIVILIAN AIS & MILITARY GPS IN BAB-EL-MANDEB',
    threatLevel: 'CRITICAL',
    triangulationBearings: [
      { stationName: 'Red Sea Coastal Sensor 1', azimuthDeg: 184.2 },
      { stationName: 'Djibouti Naval Radar DF', azimuthDeg: 268.0 }
    ],
    activeJammingCountermeasure: true
  },
  {
    id: 'rf-emit-03',
    frequencyMHz: 5785.0,
    bandwidthKHz: 20000,
    modulation: 'OFDM',
    signalStrengthDbm: -72,
    emitterType: 'UAV Video Downlink (5.8GHz)',
    location: [40.912, -2.250],
    confidence: 88,
    interceptedData: 'ANALOG/COFDM DRONE TELEMETRY // ALTITUDE 450M // HEADING 185° // UNIDENTIFIED COMMERCIAL QUADCOPTER',
    threatLevel: 'ELEVATED',
    triangulationBearings: [
      { stationName: 'Camp Simba C-UAS Sensor', azimuthDeg: 215.4 },
      { stationName: 'Manda Airstrip DF Tower', azimuthDeg: 198.7 }
    ],
    activeJammingCountermeasure: false
  },
  {
    id: 'rf-emit-04',
    frequencyMHz: 2850.0,
    bandwidthKHz: 5000,
    modulation: 'CW-PULSE',
    signalStrengthDbm: -58,
    emitterType: 'Radar Emitter (S-Band)',
    location: [56.280, 27.175],
    confidence: 96,
    interceptedData: 'COASTAL SEARCH RADAR // ROTATION PERIOD 4.2 SEC // PULSE REPETITION FREQ 1200 HZ',
    threatLevel: 'MONITORING',
    triangulationBearings: [
      { stationName: 'Hormuz Surveillance Station 4', azimuthDeg: 340.1 }
    ],
    activeJammingCountermeasure: false
  }
];

const SPECTRUM_BANDS: SpectrumBand[] = [
  { name: 'VHF MIL-TACTICAL', rangeMHz: '30 - 88 MHz', activityLevel: 'NORMAL', jammingDetected: false, snrDb: 24.5 },
  { name: 'UHF AIR COMBAT', rangeMHz: '225 - 400 MHz', activityLevel: 'NORMAL', jammingDetected: false, snrDb: 28.1 },
  { name: 'GPS L1 / GLONASS', rangeMHz: '1575.42 MHz', activityLevel: 'JAMMED', jammingDetected: true, snrDb: 4.2 },
  { name: 'C-BAND SATCOM', rangeMHz: '3.4 - 4.2 GHz', activityLevel: 'QUIET', jammingDetected: false, snrDb: 32.0 },
  { name: 'ISM UAV C2 & FPV', rangeMHz: '2.4 / 5.8 GHz', activityLevel: 'CONGESTED', jammingDetected: false, snrDb: 16.8 },
  { name: 'KU RADAR ALTIMETRY', rangeMHz: '12 - 18 GHz', activityLevel: 'NORMAL', jammingDetected: false, snrDb: 22.4 }
];

export const ElectronicWarfareCenter: React.FC<ElectronicWarfareCenterProps> = ({ soundMuted = false }) => {
  const [emitters, setEmitters] = useState<RFEmitter[]>(INITIAL_EMITTERS);
  const [selectedEmitter, setSelectedEmitter] = useState<RFEmitter>(INITIAL_EMITTERS[0]);
  const [spectrumSweepActive, setSpectrumSweepActive] = useState(true);
  const [activeFrequencies, setActiveFrequencies] = useState<number[]>([]);
  const [jammerActive, setJammerActive] = useState<{ [id: string]: boolean }>({
    'rf-emit-02': true
  });

  // Simulated live FFT RF Spectrum bars
  useEffect(() => {
    const interval = setInterval(() => {
      const freqs = Array.from({ length: 48 }, () => Math.floor(Math.random() * 80) + 15);
      setActiveFrequencies(freqs);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const handleToggleCounterJamming = (emitterId: string) => {
    const currentState = !!jammerActive[emitterId];
    setJammerActive(prev => ({ ...prev, [emitterId]: !currentState }));
    
    setEmitters(prev => prev.map(e => {
      if (e.id === emitterId) {
        return { ...e, activeJammingCountermeasure: !currentState };
      }
      return e;
    }));

    if (!currentState) {
      playTacticalSound('alert-critical', soundMuted);
      speakTacticalReadout("Directional RF Countermeasure Engaged. Neutralizing hostile frequency.", !soundMuted);
    } else {
      playTacticalSound('button-click', soundMuted);
      speakTacticalReadout("Electronic Countermeasure Ceased.", !soundMuted);
    }
  };

  const handleScanSpectrum = () => {
    setSpectrumSweepActive(true);
    playTacticalSound('radar-ping', soundMuted);
    speakTacticalReadout("Initiating high-gain RF spectrum sweep across 30 MHz to 18 GHz.", !soundMuted);
  };

  return (
    <div className="h-full flex flex-col glass-panel hud-border p-2 sm:p-3 select-none overflow-y-auto lg:overflow-hidden animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 mb-2.5 border-b border-cyan-500/30 pb-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></div>
          <div>
            <h2 className="text-xs sm:text-sm md:text-base font-black text-cyan-400 uppercase tracking-wider sm:tracking-widest flex items-center space-x-2">
              <span>ELECTRONIC WARFARE & SIGINT SPECTRUM DOMINANCE</span>
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                EW / ES / EA SUITE
              </span>
            </h2>
            <p className="text-[8px] sm:text-[9px] font-mono text-slate-400 uppercase">
              RF DIRECTION FINDING // GPS JAMMING TRIANGULATION // SPECTRUM SURVEILLANCE & EA COUNTERMEASURES
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleScanSpectrum}
            className={`font-black text-[9px] sm:text-[10px] font-mono px-3 py-1.5 rounded uppercase tracking-wider transition-colors flex items-center space-x-1.5 min-h-[34px] ${
              spectrumSweepActive
                ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_12px_rgba(0,242,255,0.4)]'
                : 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
            }`}
          >
            <span>{spectrumSweepActive ? '⚡ SPECTRUM SWEEP ACTIVE' : '⚡ INITIATE SPECTRUM SWEEP'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-2.5 min-h-0">
        
        {/* Left Column: RF Waterfall & Spectrum Bands (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-2.5 min-h-0 overflow-y-auto custom-scrollbar">
          
          {/* Live Waterfall Spectrum Analyzer Display */}
          <div className="bg-slate-950/80 p-3 rounded-lg border border-cyan-500/30 flex flex-col space-y-2 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-widest">
                LIVE RF WATERFALL SPECTROGRAM (FFT)
              </span>
              <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                SAMPLE RATE: 120 MS/S
              </span>
            </div>

            {/* FFT Frequency Bars */}
            <div className="h-28 bg-black/80 rounded border border-slate-800 p-2 flex items-end justify-between space-x-0.5 relative overflow-hidden">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="border-b border-cyan-500"></div>
                <div className="border-b border-cyan-500"></div>
                <div className="border-b border-cyan-500"></div>
              </div>

              {activeFrequencies.map((val, idx) => {
                const isHostileSpike = idx === 12 || idx === 28;
                return (
                  <div
                    key={idx}
                    style={{ height: `${isHostileSpike ? Math.min(98, val + 35) : val}%` }}
                    className={`flex-1 rounded-t-sm transition-all duration-300 ${
                      isHostileSpike
                        ? 'bg-gradient-to-t from-red-600 via-amber-400 to-yellow-200 animate-pulse'
                        : 'bg-gradient-to-t from-cyan-900 via-cyan-500 to-cyan-200'
                    }`}
                  />
                );
              })}
            </div>

            <div className="flex justify-between text-[8px] font-mono text-slate-500 px-1">
              <span>30 MHz</span>
              <span>433 MHz</span>
              <span>1.5 GHz (GPS)</span>
              <span>2.4 GHz</span>
              <span>5.8 GHz</span>
              <span>18 GHz</span>
            </div>
          </div>

          {/* Monitored Spectrum Frequency Bands */}
          <div className="bg-slate-900/80 p-3 rounded-lg border border-cyan-500/20 flex-grow flex flex-col space-y-1.5">
            <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest">
              MONITORED ELECTROMAGNETIC BANDS
            </span>
            <div className="space-y-1.5">
              {SPECTRUM_BANDS.map((band, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded border flex justify-between items-center text-[9px] sm:text-[10px] font-mono transition-colors ${
                    band.jammingDetected
                      ? 'bg-red-950/40 border-red-500/60 text-red-300 animate-pulse'
                      : 'bg-black/40 border-slate-800 text-slate-300'
                  }`}
                >
                  <div>
                    <strong className="text-white block">{band.name}</strong>
                    <span className="text-[8px] text-slate-400">{band.rangeMHz}</span>
                  </div>
                  <div className="text-right">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                      band.jammingDetected
                        ? 'bg-red-600 text-white'
                        : band.activityLevel === 'CONGESTED'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {band.activityLevel}
                    </span>
                    <span className="block text-[8px] text-slate-400 mt-0.5">SNR: {band.snrDb} dB</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Triangulated Hostile Emitters & Electronic Attack Control (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-2.5 min-h-0 overflow-y-auto custom-scrollbar">
          
          {/* Active Intercepted Emitters List */}
          <div className="bg-slate-950/80 p-3 rounded-lg border border-cyan-500/30 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] sm:text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">
                TRIANGULATED RF EMITTERS & DIRECTION FINDING (DF)
              </span>
              <span className="text-[8px] font-mono text-slate-400">
                {emitters.length} DETECTED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {emitters.map((emitter) => {
                const isSelected = selectedEmitter.id === emitter.id;
                const isJamming = !!jammerActive[emitter.id];
                return (
                  <div
                    key={emitter.id}
                    onClick={() => {
                      setSelectedEmitter(emitter);
                      playTacticalSound('button-click', soundMuted);
                    }}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_12px_rgba(0,242,255,0.2)]'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] sm:text-[11px] font-bold text-white font-mono">
                        {emitter.emitterType}
                      </span>
                      <span className={`text-[7px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                        emitter.threatLevel === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-400 border-red-500/40'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      }`}>
                        {emitter.threatLevel}
                      </span>
                    </div>

                    <div className="mt-1 space-y-0.5 text-[8px] sm:text-[9px] font-mono text-slate-400">
                      <div>FREQ: <span className="text-cyan-300 font-bold">{emitter.frequencyMHz} MHz</span> // {emitter.modulation}</div>
                      <div>PWR: <span className="text-slate-200">{emitter.signalStrengthDbm} dBm</span> // CONF: {emitter.confidence}%</div>
                    </div>

                    {isJamming && (
                      <div className="mt-1.5 bg-red-950/50 border border-red-500/40 px-1.5 py-0.5 rounded text-[7px] font-mono text-red-300 font-bold flex items-center justify-between">
                        <span>⚡ ACTIVE JAMMING ENGAGED</span>
                        <span className="animate-ping w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Emitter Deep Analysis & Direction Finding Detail */}
          {selectedEmitter && (
            <div className="bg-slate-900/90 p-3 rounded-lg border border-cyan-500/30 space-y-2.5 flex-grow">
              <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                <div>
                  <span className="text-[8px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                    SIGINT DIRECTION FINDING REPORT // {selectedEmitter.id.toUpperCase()}
                  </span>
                  <h3 className="text-xs sm:text-sm font-black text-white mt-0.5">
                    {selectedEmitter.emitterType} ({selectedEmitter.frequencyMHz} MHz)
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono text-cyan-300 block font-bold">
                    [{selectedEmitter.location[0].toFixed(3)}°E, {selectedEmitter.location[1].toFixed(3)}°N]
                  </span>
                  <span className="text-[8px] font-mono text-emerald-400">TRIANGULATION: 3 SENSORS</span>
                </div>
              </div>

              {/* Intercepted Signal Payload */}
              <div className="bg-black/60 p-2.5 rounded border border-slate-800 space-y-1">
                <span className="text-[8px] font-mono text-amber-400 uppercase font-bold tracking-wider">
                  DECODED SIGNAL DEMODULATION & INTEL:
                </span>
                <p className="text-[10px] sm:text-[11px] font-mono text-slate-200 leading-relaxed">
                  {selectedEmitter.interceptedData}
                </p>
              </div>

              {/* Triangulation Bearings */}
              <div className="space-y-1">
                <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                  SURVEILLANCE RADAR & DF STATION BEARING ARCS:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  {selectedEmitter.triangulationBearings.map((b, idx) => (
                    <div key={idx} className="bg-slate-950 p-2 rounded border border-slate-800 text-[8px] sm:text-[9px] font-mono">
                      <span className="text-slate-400 block truncate">{b.stationName}</span>
                      <span className="text-cyan-400 font-bold text-[10px]">AZ: {b.azimuthDeg}°</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Directional Counter-Jamming / SEAD Strike */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleToggleCounterJamming(selectedEmitter.id)}
                  className={`flex-1 font-black text-[9px] sm:text-[10px] font-mono py-2 px-3 rounded uppercase tracking-wider transition-all min-h-[38px] ${
                    jammerActive[selectedEmitter.id]
                      ? 'bg-amber-600 hover:bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                      : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                  }`}
                >
                  {jammerActive[selectedEmitter.id]
                    ? 'CEASE ELECTRONIC COUNTERMEASURE'
                    : '⚡ ENGAGE DIRECTIONAL RF JAMMING'}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default ElectronicWarfareCenter;
