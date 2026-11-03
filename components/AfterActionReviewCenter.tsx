import React, { useState, useEffect } from 'react';
import { BlackboxLogEvent, CombatEfficiencyMetric } from '../types.ts';
import { playTacticalSound, speakTacticalReadout } from '../utils/audioUtils.ts';

interface AfterActionReviewCenterProps {
  soundMuted?: boolean;
}

const INITIAL_BLACKBOX_LOGS: BlackboxLogEvent[] = [
  {
    id: 'bb-01',
    timestampMs: 0,
    timeString: '02:00:15 Z',
    category: 'DETECTION',
    title: 'Anomalous Radar Contact Detected',
    description: 'Mandera forward surveillance radar 3D pulse acquired low-altitude fast cross-border radar track at 85 kts heading 195°.',
    actor: 'MANDERA BORDER RADAR POST ALPHA',
    coordinates: [41.867, 3.937],
    outcome: 'WARNING'
  },
  {
    id: 'bb-02',
    timestampMs: 1800,
    timeString: '02:00:17 Z',
    category: 'RADAR_SCAN',
    title: 'AI Multi-Spectral Demodulation & Identification',
    description: 'Project STAR neural engine classified contact as Asymmetric Loitering Munition with 98.4% confidence based on engine thermal pulse.',
    actor: 'SOVEREIGN C4ISR AI CORE',
    coordinates: [41.865, 3.930],
    outcome: 'SUCCESS'
  },
  {
    id: 'bb-03',
    timestampMs: 3200,
    timeString: '02:00:19 Z',
    category: 'ORDER_ISSUED',
    title: 'Automated COA Strategy Generated & Vetted',
    description: 'Generated 3 kinetic & electronic deterrence courses of action. Dispatched Bayraktar TB2 with laser-guided MAM-L micro-munition.',
    actor: 'JOINT OPERATIONS COMMANDER',
    coordinates: [40.916, -2.253],
    outcome: 'SUCCESS'
  },
  {
    id: 'bb-04',
    timestampMs: 5400,
    timeString: '02:00:22 Z',
    category: 'ENGAGEMENT',
    title: 'Counter-UAS Directed Energy Intercept',
    description: 'Mistral-3 VSHORAD and C-UAS directional jammer neutralized command link. Target lost propulsion and crashed inside buffer zone.',
    actor: 'MISTRAL-3 VSHORAD BATTERY',
    coordinates: [41.850, 3.910],
    outcome: 'CRITICAL_ACTION'
  },
  {
    id: 'bb-05',
    timestampMs: 7200,
    timeString: '02:00:25 Z',
    category: 'NEUTRALIZATION',
    title: 'Threat Splash Confirmed & Sector Secured',
    description: 'Special forces ground recon verified threat destruction. Zero collateral damage to civilian infrastructure or allied outposts.',
    actor: 'SPECIAL RECONNAISSANCE PATROL 4',
    coordinates: [41.848, 3.905],
    outcome: 'SUCCESS'
  }
];

const METRICS: CombatEfficiencyMetric = {
  detectionToResponseLatencySec: 1.8,
  threatNeutralizationRatePercent: 100,
  munitionEfficiencyRatio: 0.94,
  collateralMitigationScore: 99.8,
  oodaLoopScore: 96
};

export const AfterActionReviewCenter: React.FC<AfterActionReviewCenterProps> = ({ soundMuted = false }) => {
  const [logs] = useState<BlackboxLogEvent[]>(INITIAL_BLACKBOX_LOGS);
  const [playbackTimeMs, setPlaybackTimeMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4>(1);
  const [selectedLog, setSelectedLog] = useState<BlackboxLogEvent>(INITIAL_BLACKBOX_LOGS[0]);

  // DVR Timeline Playback Engine
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setPlaybackTimeMs(prev => {
          const next = prev + 100 * playbackSpeed;
          if (next >= 8000) {
            setIsPlaying(false);
            return 8000;
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  const activeLogs = logs.filter(l => l.timestampMs <= playbackTimeMs);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
    playTacticalSound('button-click', soundMuted);
    if (!isPlaying) {
      speakTacticalReadout("Initiating after-action mission blackbox replay.", !soundMuted);
    }
  };

  const handleReset = () => {
    setPlaybackTimeMs(0);
    setIsPlaying(false);
    playTacticalSound('button-click', soundMuted);
  };

  return (
    <div className="h-full flex flex-col glass-panel hud-border p-2 sm:p-3 select-none overflow-y-auto lg:overflow-hidden animate-fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 mb-2.5 border-b border-cyan-500/30 pb-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></div>
          <div>
            <h2 className="text-xs sm:text-sm md:text-base font-black text-cyan-400 uppercase tracking-wider sm:tracking-widest flex items-center space-x-2">
              <span>AFTER-ACTION REVIEW (AAR) & MISSION BLACKBOX PLAYBACK</span>
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                AUDIT & COMBAT DEBRIEF
              </span>
            </h2>
            <p className="text-[8px] sm:text-[9px] font-mono text-slate-400 uppercase">
              DVR TIMELINE REPLAY // OODA LOOP LATENCY BENCHMARK // MUNITION EFFICIENCY AUDIT
            </p>
          </div>
        </div>

        {/* Playback Controls Bar */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[9px] font-mono font-bold px-2.5 py-1.5 rounded uppercase"
          >
            ⏮ RESET
          </button>
          <button
            onClick={handleTogglePlay}
            className={`font-black text-[9px] sm:text-[10px] font-mono px-4 py-1.5 rounded uppercase tracking-wider transition-all min-h-[34px] ${
              isPlaying
                ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_12px_rgba(0,242,255,0.4)]'
            }`}
          >
            {isPlaying ? '⏸ PAUSE REPLAY' : '▶ PLAY BLACKBOX REPLAY'}
          </button>
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(parseInt(e.target.value) as any)}
            className="bg-slate-900 text-cyan-300 border border-slate-800 text-[9px] font-mono p-1.5 rounded"
          >
            <option value="1">1X SPEED</option>
            <option value="2">2X SPEED</option>
            <option value="4">4X SPEED</option>
          </select>
        </div>
      </div>

      {/* DVR Timeline Scrubber Bar */}
      <div className="bg-slate-950/90 p-2.5 rounded-lg border border-cyan-500/30 mb-2.5 space-y-1.5">
        <div className="flex justify-between items-center text-[9px] font-mono">
          <span className="text-slate-400">MISSION TIMELINE SCRUBBER</span>
          <span className="text-cyan-300 font-bold">
            T+{(playbackTimeMs / 1000).toFixed(1)}S / 8.0S ({activeLogs.length} OF {logs.length} EVENTS PLAYED)
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="8000"
          value={playbackTimeMs}
          onChange={(e) => setPlaybackTimeMs(parseInt(e.target.value))}
          className="w-full accent-cyan-400 cursor-pointer"
        />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-2.5">
        <div className="bg-slate-950/80 p-2 rounded border border-cyan-500/20 text-[9px] font-mono">
          <span className="text-slate-500 block uppercase">DECISION LATENCY (OODA)</span>
          <span className="text-cyan-300 font-bold text-[11px]">{METRICS.detectionToResponseLatencySec} SECONDS</span>
        </div>
        <div className="bg-slate-950/80 p-2 rounded border border-cyan-500/20 text-[9px] font-mono">
          <span className="text-slate-500 block uppercase">NEUTRALIZATION RATE</span>
          <span className="text-emerald-400 font-bold text-[11px]">{METRICS.threatNeutralizationRatePercent}% SUCCESS</span>
        </div>
        <div className="bg-slate-950/80 p-2 rounded border border-cyan-500/20 text-[9px] font-mono">
          <span className="text-slate-500 block uppercase">MUNITION EFFICIENCY</span>
          <span className="text-cyan-300 font-bold text-[11px]">{(METRICS.munitionEfficiencyRatio * 100).toFixed(0)}% OPTIMAL</span>
        </div>
        <div className="bg-slate-950/80 p-2 rounded border border-cyan-500/20 text-[9px] font-mono">
          <span className="text-slate-500 block uppercase">COLLATERAL MITIGATION</span>
          <span className="text-emerald-400 font-bold text-[11px]">{METRICS.collateralMitigationScore}% CLEAN</span>
        </div>
        <div className="bg-slate-950/80 p-2 rounded border border-cyan-500/20 text-[9px] font-mono col-span-2 sm:col-span-1">
          <span className="text-slate-500 block uppercase">SOVEREIGN AI SCORE</span>
          <span className="text-purple-400 font-bold text-[11px]">{METRICS.oodaLoopScore} / 100</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-2.5 min-h-0">
        
        {/* Left Column: Chronological Event Logs (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-2 min-h-0 overflow-y-auto custom-scrollbar">
          <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-widest">
            SYNCHRONIZED BLACKBOX TELEMETRY LOGS
          </span>

          <div className="space-y-2">
            {logs.map((log) => {
              const hasOccurred = log.timestampMs <= playbackTimeMs;
              const isSelected = selectedLog.id === log.id;
              return (
                <div
                  key={log.id}
                  onClick={() => {
                    setSelectedLog(log);
                    playTacticalSound('button-click', soundMuted);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    !hasOccurred
                      ? 'bg-black/30 border-slate-900 opacity-40'
                      : isSelected
                      ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_12px_rgba(0,242,255,0.25)]'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <span className="text-[8px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                        {log.timeString}
                      </span>
                      <strong className="text-white text-[10px] sm:text-[11px] font-mono">
                        {log.title}
                      </strong>
                    </div>
                    <span className={`text-[7px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                      log.outcome === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                      log.outcome === 'CRITICAL_ACTION' ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                      'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {log.category}
                    </span>
                  </div>

                  <p className="mt-1.5 text-[9px] sm:text-[10px] font-mono text-slate-300 leading-relaxed">
                    {log.description}
                  </p>

                  <div className="mt-1 flex justify-between text-[7px] sm:text-[8px] font-mono text-slate-500">
                    <span>ACTOR: {log.actor}</span>
                    <span>LOC: [{log.coordinates[0].toFixed(3)}°E, {log.coordinates[1].toFixed(3)}°N]</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Event Deep Telemetry (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-2 min-h-0 overflow-y-auto custom-scrollbar">
          {selectedLog && (
            <div className="bg-slate-950/90 p-3 rounded-lg border border-cyan-500/30 space-y-2.5 flex-grow">
              <div className="border-b border-slate-800 pb-2">
                <span className="text-[8px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                  BLACKBOX EVENT TELEMETRY // {selectedLog.id.toUpperCase()}
                </span>
                <h3 className="text-xs sm:text-sm font-black text-white mt-0.5">
                  {selectedLog.title}
                </h3>
              </div>

              <div className="space-y-2 text-[9px] sm:text-[10px] font-mono">
                <div className="bg-black/50 p-2 rounded border border-slate-800 space-y-1">
                  <div className="text-slate-400">TIMESTAMP: <strong className="text-white">{selectedLog.timeString}</strong></div>
                  <div className="text-slate-400">REPORTING ENTITY: <strong className="text-cyan-300">{selectedLog.actor}</strong></div>
                  <div className="text-slate-400">TACTICAL CLASSIFICATION: <strong className="text-amber-400">{selectedLog.category}</strong></div>
                </div>

                <div className="text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-400 font-bold block mb-1">OPERATIONAL SUMMARY:</span>
                  {selectedLog.description}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default AfterActionReviewCenter;
