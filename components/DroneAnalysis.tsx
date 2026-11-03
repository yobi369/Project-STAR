import React, { useState, useEffect, useRef } from 'react';
import { Threat, SectorConfig } from '../types.ts';
import { generateAdvancedIMINT, generateDroneReconVideo } from '../services/geminiService.ts';
import { DRONE_SURVEILLANCE_IMAGES, SECTOR_SCENARIOS } from '../constants.ts';
import { PlayIcon, PauseIcon } from './icons.tsx';
import { playTacticalSound } from '../utils/audioUtils.ts';

interface DroneAnalysisProps {
  addThreat: (threat: Omit<Threat, 'id'>) => void;
  currentSector: SectorConfig;
  soundMuted?: boolean;
}

type SensorFilter = 'FLIR_WHITE_HOT' | 'NVG_GREEN' | 'THERMAL_IRONBOW' | 'DAY_OPTICAL';

const DroneAnalysis: React.FC<DroneAnalysisProps> = ({ addThreat, currentSector, soundMuted = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isTasking, setIsTasking] = useState(false);
  const [isReconActive, setIsReconActive] = useState(false);
  const [viewMode, setViewMode] = useState<'IMINT' | 'VIDEO'>('IMINT');
  const [sensorFilter, setSensorFilter] = useState<SensorFilter>('FLIR_WHITE_HOT');
  const [currentImageBase64, setCurrentImageBase64] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState({ alt: 12500, heading: 142.5, speed: 210, pitch: -14.2 });
  const [targetLocked, setTargetLocked] = useState(false);
  const [snapshotLogged, setSnapshotLogged] = useState(false);

  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (DRONE_SURVEILLANCE_IMAGES[0]) {
      setCurrentImageBase64(DRONE_SURVEILLANCE_IMAGES[0].imageDataUrl.split(',')[1]);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        ...prev,
        alt: Math.max(9000, Math.min(18000, prev.alt + (Math.random() - 0.5) * 15)),
        heading: (prev.heading + 0.15) % 360,
        speed: Math.max(180, Math.min(260, prev.speed + (Math.random() - 0.5) * 4)),
        pitch: -15 + Math.sin(Date.now() / 3000) * 2
      }));
    }, 120);
    return () => clearInterval(interval);
  }, []);

  const taskSatellite = async () => {
    setIsTasking(true);
    setViewMode('IMINT');
    playTacticalSound('radar-ping', soundMuted);
    try {
      const scenarios = SECTOR_SCENARIOS[currentSector.id] || SECTOR_SCENARIOS['KENYA_ALL'];
      const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      const base64 = await generateAdvancedIMINT(scenario);
      if (base64) setCurrentImageBase64(base64);
    } finally {
      setIsTasking(false);
    }
  };

  const launchDroneRecon = async () => {
    setIsReconActive(true);
    setViewMode('VIDEO');
    playTacticalSound('radio-chirp', soundMuted);
    try {
      const url = await generateDroneReconVideo(currentSector.name, currentSector.environment);
      if (url) {
        setVideoUrl(url);
        setIsPlaying(true);
      }
    } finally {
      setIsReconActive(false);
    }
  };

  const handleSnapshotAndTriangulate = () => {
    playTacticalSound('alert-warning', soundMuted);
    setSnapshotLogged(true);
    setTimeout(() => setSnapshotLogged(false), 3000);

    const latOffset = (Math.random() - 0.5) * 0.4;
    const lonOffset = (Math.random() - 0.5) * 0.4;

    addThreat({
      type: 'Confirmed',
      location: [currentSector.coordinates.lon + lonOffset, currentSector.coordinates.lat + latOffset],
      title: `IMINT Optical Target: ${currentSector.name}`,
      description: `Thermal heat bloom identified by airborne drone optical sensor in ${currentSector.name}. Target locked on tactical coordinates.`,
      detectedAt: 'JUST NOW',
      priority: 'HIGH',
      source: `DRONE-FLIR / ${sensorFilter}`,
      estimatedHostiles: 'Vehicle Column / 8-12 Hostiles',
      sectorId: currentSector.id
    });
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    if (viewMode !== 'IMINT') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let frame = 0;

    const render = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // Base Synthetic Terrain / Image
      const gradient = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, width);
      if (sensorFilter === 'FLIR_WHITE_HOT') {
        gradient.addColorStop(0, '#0a101f');
        gradient.addColorStop(1, '#020617');
      } else if (sensorFilter === 'NVG_GREEN') {
        gradient.addColorStop(0, '#052e16');
        gradient.addColorStop(1, '#021a0c');
      } else if (sensorFilter === 'THERMAL_IRONBOW') {
        gradient.addColorStop(0, '#4a044e');
        gradient.addColorStop(1, '#1e1b4b');
      } else {
        gradient.addColorStop(0, '#0f172a');
        gradient.addColorStop(1, '#020617');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Simulated Thermal Heat Blobs (Vehicles / Outpost)
      const tTime = Date.now() / 1500;
      const targets = [
        { x: width * 0.45 + Math.sin(tTime) * 15, y: height * 0.42 + Math.cos(tTime) * 10, size: 28, heat: 0.8 },
        { x: width * 0.58 + Math.cos(tTime * 0.8) * 10, y: height * 0.52, size: 20, heat: 0.65 },
        { x: width * 0.38, y: height * 0.62, size: 16, heat: 0.5 }
      ];

      targets.forEach((t) => {
        const heatGrad = ctx.createRadialGradient(t.x, t.y, 2, t.x, t.y, t.size);
        if (sensorFilter === 'FLIR_WHITE_HOT') {
          heatGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          heatGrad.addColorStop(0.5, 'rgba(0, 242, 255, 0.6)');
          heatGrad.addColorStop(1, 'rgba(0, 242, 255, 0)');
        } else if (sensorFilter === 'NVG_GREEN') {
          heatGrad.addColorStop(0, 'rgba(240, 253, 244, 0.95)');
          heatGrad.addColorStop(0.5, 'rgba(34, 197, 94, 0.7)');
          heatGrad.addColorStop(1, 'rgba(34, 197, 94, 0)');
        } else if (sensorFilter === 'THERMAL_IRONBOW') {
          heatGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
          heatGrad.addColorStop(0.4, 'rgba(239, 68, 68, 0.8)');
          heatGrad.addColorStop(0.8, 'rgba(147, 51, 234, 0.4)');
          heatGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
          heatGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
          heatGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }
        ctx.fillStyle = heatGrad;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
        ctx.fill();

        // Bounding Box on Main Target
        if (t === targets[0]) {
          const strokeCol = sensorFilter === 'NVG_GREEN' ? '#22c55e' : sensorFilter === 'THERMAL_IRONBOW' ? '#f59e0b' : '#00f2ff';
          ctx.strokeStyle = strokeCol;
          ctx.lineWidth = targetLocked ? 2 : 1;
          const boxSize = 38;
          ctx.strokeRect(t.x - boxSize / 2, t.y - boxSize / 2, boxSize, boxSize);

          // Target Tag
          ctx.fillStyle = strokeCol;
          ctx.font = '9px monospace';
          ctx.fillText(targetLocked ? 'TARGET LOCK // CONFIRMED' : 'THERMAL SIGNATURE [T-01]', t.x - boxSize / 2, t.y - boxSize / 2 - 6);
        }
      });

      // HUD Reticle
      const primaryColor = sensorFilter === 'NVG_GREEN' ? '#22c55e' : '#00f2ff';
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 1;

      // Center Crosshairs
      ctx.beginPath();
      ctx.moveTo(width / 2 - 25, height / 2);
      ctx.lineTo(width / 2 - 6, height / 2);
      ctx.moveTo(width / 2 + 6, height / 2);
      ctx.lineTo(width / 2 + 25, height / 2);
      ctx.moveTo(width / 2, height / 2 - 25);
      ctx.lineTo(width / 2, height / 2 - 6);
      ctx.moveTo(width / 2, height / 2 + 6);
      ctx.lineTo(width / 2, height / 2 + 25);
      ctx.stroke();

      // Outer Tracking Circle
      ctx.setLineDash([6, 12]);
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 70, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Corner Brackets
      const pad = 16;
      const len = 22;
      ctx.beginPath();
      ctx.moveTo(pad, pad + len); ctx.lineTo(pad, pad); ctx.lineTo(pad + len, pad);
      ctx.moveTo(width - pad, pad + len); ctx.lineTo(width - pad, pad); ctx.lineTo(width - pad - len, pad);
      ctx.moveTo(pad, height - pad - len); ctx.lineTo(pad, height - pad); ctx.lineTo(pad + len, height - pad);
      ctx.moveTo(width - pad, height - pad - len); ctx.lineTo(width - pad, height - pad); ctx.lineTo(width - pad - len, height - pad);
      ctx.stroke();

      frame++;
      animFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrame);
  }, [viewMode, sensorFilter, targetLocked]);

  return (
    <div className="h-full flex flex-col glass-panel hud-border p-3 group relative select-none">
      {/* Header & Controls */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${viewMode === 'VIDEO' ? 'bg-red-500' : 'bg-cyan-400'} animate-pulse`}></span>
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">
            {viewMode === 'VIDEO' ? 'LIVE DRONE FEED // VEO-SIM' : `TACTICAL FLIR // ${sensorFilter.replace('_', ' ')}`}
          </span>
        </div>

        {/* Filter / Mode Controls */}
        <div className="flex items-center space-x-1.5">
          {(['FLIR_WHITE_HOT', 'NVG_GREEN', 'THERMAL_IRONBOW'] as SensorFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => {
                setSensorFilter(f);
                setViewMode('IMINT');
                playTacticalSound('button-click', soundMuted);
              }}
              className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded transition-colors uppercase ${
                sensorFilter === f && viewMode === 'IMINT'
                  ? 'bg-cyan-500 text-black'
                  : 'bg-black/40 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {f.split('_')[1] || f}
            </button>
          ))}

          <button
            onClick={taskSatellite}
            disabled={isTasking}
            className="text-[8px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/20 uppercase transition-colors"
          >
            {isTasking ? "SYNCING..." : "SAT TASK"}
          </button>

          <button
            onClick={launchDroneRecon}
            disabled={isReconActive}
            className="text-[8px] font-mono font-bold px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-500/40 hover:bg-red-500/20 uppercase transition-colors"
          >
            {isReconActive ? "LAUNCHING..." : "DRONE RECON"}
          </button>
        </div>
      </div>

      {/* Main Visual Display */}
      <div className="flex-grow relative bg-black rounded-lg overflow-hidden border border-slate-800">
        {viewMode === 'IMINT' ? (
          <div className="w-full h-full relative">
            {currentImageBase64 && (
              <img
                src={`data:image/png;base64,${currentImageBase64}`}
                alt="Optical Drone Downlink"
                className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen pointer-events-none"
              />
            )}
            <canvas ref={canvasRef} width={600} height={360} className="w-full h-full block relative z-10" />
          </div>
        ) : videoUrl ? (
          <div className="w-full h-full relative group/video">
            <video
              ref={videoRef}
              src={videoUrl}
              autoPlay
              loop
              className="w-full h-full object-cover"
              onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
              onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
              onEnded={() => setIsPlaying(false)}
            />
            {/* Video Controls Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent flex items-center space-x-3">
              <button onClick={handlePlayPause} className="text-cyan-400 hover:text-white">
                {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
              </button>
              <div className="flex-grow flex items-center space-x-2">
                <span className="text-[8px] font-mono text-cyan-400">{Math.floor(currentTime)}s</span>
                <input
                  type="range"
                  min="0"
                  max={duration || 10}
                  value={currentTime}
                  onChange={(e) => {
                    const t = Number(e.target.value);
                    if (videoRef.current) {
                      videoRef.current.currentTime = t;
                      setCurrentTime(t);
                    }
                  }}
                  className="flex-grow h-1 bg-cyan-950 appearance-none rounded-full cursor-pointer accent-cyan-400"
                />
                <span className="text-[8px] font-mono text-cyan-400">{Math.floor(duration)}s</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] text-red-400 font-mono font-bold uppercase tracking-widest">
              Awaiting Tactical Uplink...
            </span>
          </div>
        )}

        {/* Telemetry Overlays */}
        <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between font-mono text-[9px] text-cyan-400/90 z-10">
          <div className="flex justify-between uppercase">
            <div className="space-y-0.5">
              <div>ALT: {telemetry.alt.toFixed(0)} FT MSL</div>
              <div>SPD: {telemetry.speed.toFixed(0)} KTS</div>
              <div>PITCH: {telemetry.pitch.toFixed(1)}°</div>
            </div>
            <div className="text-right space-y-0.5">
              <div>HDG: {telemetry.heading.toFixed(1)}°</div>
              <div className="text-red-400 font-bold">
                {viewMode === 'VIDEO' ? 'SIGNAL: SECURE FLIR' : 'SENSOR: FLIR-OPTICAL'}
              </div>
              <div className="text-[8px] text-white/50">ZOOM: 12.4X EO/IR</div>
            </div>
          </div>

          <div className="flex justify-between items-end uppercase">
            <div>
              <div>LAT: {currentSector.coordinates.lat.toFixed(4)}°N</div>
              <div>LON: {currentSector.coordinates.lon.toFixed(4)}°E</div>
              <div className="text-[8px] text-white/40">AO: {currentSector.name}</div>
            </div>

            <div className="pointer-events-auto flex items-center space-x-2">
              <button
                onClick={() => {
                  setTargetLocked(!targetLocked);
                  playTacticalSound('radar-ping', soundMuted);
                }}
                className={`text-[8px] font-mono font-bold px-2 py-1 rounded border transition-colors uppercase ${
                  targetLocked ? 'bg-red-500 text-white border-red-500' : 'bg-black/60 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/20'
                }`}
              >
                {targetLocked ? 'TARGET LOCKED' : 'LOCK TARGET'}
              </button>

              <button
                onClick={handleSnapshotAndTriangulate}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-[8px] px-3 py-1 rounded uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(0,242,255,0.4)]"
              >
                {snapshotLogged ? 'LOGGED TO MAP ✓' : 'LOG THREAT'}
              </button>
            </div>
          </div>
        </div>

        {/* Loading Spinner during tasking */}
        {(isTasking || isReconActive) && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center space-y-3 z-30">
            <div className="w-9 h-9 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] text-cyan-300 font-mono font-bold uppercase tracking-widest">
              {isTasking ? "Re-Tasking Recon Satellite Sat-04..." : "Rendering Veo Tactical Recon Flight..."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DroneAnalysis;
