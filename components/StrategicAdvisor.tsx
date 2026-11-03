import React, { useState, useEffect } from 'react';
import { Threat, Asset, CourseOfAction } from '../types.ts';
import { generateStrategicCOAs, getGeopoliticalGroundedIntel, generateMissionForecast } from '../services/geminiService.ts';
import { playTacticalSound } from '../utils/audioUtils.ts';

interface StrategicAdvisorProps {
  selectedThreat: Threat | null;
  assets: Asset[];
  generatedCOAs: CourseOfAction[];
  setGeneratedCOAs: (coas: CourseOfAction[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setHighlightedCOA: (coa: CourseOfAction | null) => void;
  currentSectorName: string;
  onExecuteCOA?: (coa: CourseOfAction) => void;
  soundMuted?: boolean;
}

const StrategicAdvisor: React.FC<StrategicAdvisorProps> = ({
  selectedThreat,
  assets,
  generatedCOAs,
  setGeneratedCOAs,
  isLoading,
  setIsLoading,
  setHighlightedCOA,
  currentSectorName,
  onExecuteCOA,
  soundMuted = false
}) => {
  const [geoIntel, setGeoIntel] = useState<{ text: string; sources: any[] } | null>(null);
  const [forecastVideo, setForecastVideo] = useState<string | null>(null);
  const [isForecasting, setIsForecasting] = useState<string | null>(null);
  const [simulatingCOA, setSimulatingCOA] = useState<CourseOfAction | null>(null);
  const [executedCOAId, setExecutedCOAId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchIntel = async () => {
      const data = await getGeopoliticalGroundedIntel(currentSectorName);
      if (isMounted) {
        setGeoIntel({
          text: data.text || "OSINT Grounding active.",
          sources: data.sources || []
        });
      }
    };
    fetchIntel();
    return () => { isMounted = false; };
  }, [currentSectorName]);

  const handleGenerateCOAs = async () => {
    if (!selectedThreat) return;
    setIsLoading(true);
    setGeneratedCOAs([]);
    playTacticalSound('radio-chirp', soundMuted);
    try {
      const result = await generateStrategicCOAs(selectedThreat, assets, currentSectorName);
      setGeneratedCOAs(result);
      if (result.length > 0) {
        playTacticalSound('alert-warning', soundMuted);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunForecast = async (coa: CourseOfAction) => {
    setIsForecasting(coa.id);
    setSimulatingCOA(coa);
    setForecastVideo(null);
    playTacticalSound('radar-ping', soundMuted);
    try {
      const videoUrl = await generateMissionForecast(coa.objective);
      if (videoUrl) {
        setForecastVideo(videoUrl);
      }
    } finally {
      setIsForecasting(null);
    }
  };

  const handleExecute = (coa: CourseOfAction) => {
    setExecutedCOAId(coa.id);
    playTacticalSound('alert-critical', soundMuted);
    if (onExecuteCOA) {
      onExecuteCOA(coa);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-3 relative select-none">
      
      {/* Veo Mission Forecast or Tactical Sandtable Modal */}
      {(forecastVideo || simulatingCOA) && (
        <div className="fixed inset-0 z-[1000] bg-black/90 flex flex-col items-center justify-center p-4 md:p-8 backdrop-blur-2xl animate-fade-in">
          <div className="w-full max-w-4xl bg-slate-950 border-2 border-cyan-500/50 rounded-xl p-5 shadow-[0_0_50px_rgba(0,242,255,0.25)]">
            <div className="flex justify-between items-center mb-3 border-b border-cyan-500/30 pb-2">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                <span className="text-cyan-400 font-black text-xs md:text-sm tracking-[0.25em] uppercase">
                  VEO 3.1 MISSION SIMULATION PROJECTION
                </span>
              </div>
              <button
                onClick={() => {
                  setForecastVideo(null);
                  setSimulatingCOA(null);
                }}
                className="text-white/60 hover:text-white uppercase text-[10px] font-mono font-bold bg-white/5 px-3 py-1 rounded"
              >
                CLOSE [ESC]
              </button>
            </div>

            {forecastVideo ? (
              <video src={forecastVideo} autoPlay controls className="w-full max-h-[60vh] rounded-lg shadow-2xl border border-cyan-500/20" />
            ) : (
              <div className="aspect-video w-full bg-black rounded-lg border border-cyan-500/30 flex flex-col items-center justify-center p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,242,255,0.15),_transparent_70%)]"></div>
                <div className="z-10 text-center space-y-4 max-w-lg">
                  <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">
                      {simulatingCOA?.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {simulatingCOA?.objective}
                    </p>
                  </div>
                  <div className="p-3 bg-cyan-950/40 rounded border border-cyan-500/30 font-mono text-[10px] text-cyan-300">
                    EST. SUCCESS RATE: {simulatingCOA?.successProbability}% | DURATION: {simulatingCOA?.estimatedDuration || '45 MIN'}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-3 flex justify-between items-center text-[10px] font-mono text-cyan-400/80 uppercase">
              <span>AO: {currentSectorName}</span>
              <span>SYNCHRONIZED WITH KDF BATTLESPACE DATA</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Header & Trigger */}
      <div className="flex justify-between items-end border-b border-white/10 pb-2">
        <div>
          <h2 className="text-base md:text-lg font-black text-cyan-400 tracking-wider">
            AI STRATEGIC ADVISOR (COA ENGINE)
          </h2>
          <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em]">
            Multi-Domain War Gaming & Risk Matrix
          </p>
        </div>

        <button
          onClick={handleGenerateCOAs}
          disabled={!selectedThreat || isLoading}
          className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-[10px] px-5 py-2 rounded tracking-widest uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,242,255,0.3)]"
        >
          {isLoading ? "ANALYZING TACTICAL LOGIC..." : "GENERATE COAs"}
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-grow overflow-y-auto space-y-4 pr-1">
        
        {/* Geopolitical OSINT Grounded News Strip */}
        <div className="p-3 bg-slate-900/90 border border-cyan-500/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                LIVE OSINT GROUNDED TELEMETRY // {currentSectorName}
              </span>
            </div>
            <span className="text-[8px] font-mono text-slate-400">GOOGLE SEARCH SENSORS</span>
          </div>

          {geoIntel ? (
            <div className="space-y-2">
              <p className="text-xs leading-relaxed text-slate-300">{geoIntel.text}</p>
              {geoIntel.sources && geoIntel.sources.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {geoIntel.sources.slice(0, 3).map((source, i) => (
                    source.web && (
                      <a
                        key={i}
                        href={source.web.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[8px] font-mono bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 transition-colors flex items-center space-x-1"
                      >
                        <span>🔗</span>
                        <span>{source.web.title?.substring(0, 28) || 'OSINT Source'}...</span>
                      </a>
                    )
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-[10px] font-mono text-slate-500 animate-pulse">
              Syncing regional OSINT intelligence feeds...
            </div>
          )}
        </div>

        {/* Tactical Plans / COA Cards */}
        {!selectedThreat ? (
          <div className="h-36 flex flex-col items-center justify-center border border-dashed border-slate-700 bg-slate-900/30 rounded-lg text-slate-500 space-y-2">
            <span className="text-xs font-black tracking-widest uppercase">TARGET NOT DESIGNATED</span>
            <p className="text-[10px] text-slate-400">
              Select any hostile contact or threat marker on the tactical map to generate strategic COAs.
            </p>
          </div>
        ) : generatedCOAs.length === 0 && !isLoading ? (
          <div className="h-36 flex flex-col items-center justify-center border border-slate-700 bg-slate-900/30 rounded-lg text-slate-400 p-4 text-center space-y-2">
            <span className="text-xs font-bold text-cyan-400 uppercase">
              Target Locked: {selectedThreat.title || selectedThreat.description}
            </span>
            <p className="text-[10px] text-slate-400 max-w-md">
              Click &quot;GENERATE COAs&quot; to have the Gemini AI Strategic Officer calculate 3 diverse courses of action with casualty and risk models.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {generatedCOAs.map((coa) => {
              const isExecuted = executedCOAId === coa.id;
              return (
                <div
                  key={coa.id}
                  className={`glass-panel p-3.5 rounded-lg border-l-4 transition-all cursor-pointer ${
                    isExecuted
                      ? 'border-green-500 bg-green-950/20'
                      : 'border-cyan-500/40 hover:border-cyan-400 bg-slate-900/60'
                  }`}
                  onMouseEnter={() => setHighlightedCOA(coa)}
                  onMouseLeave={() => setHighlightedCOA(null)}
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <h4 className="font-black text-xs md:text-sm text-white uppercase tracking-tight">
                        {coa.title}
                      </h4>
                      <div className="flex items-center space-x-3 text-[9px] font-mono text-slate-400 mt-0.5">
                        <span>DURATION: <strong className="text-cyan-300">{coa.estimatedDuration || '1 Hour'}</strong></span>
                        <span>COLLATERAL: <strong className="text-amber-300">{coa.collateralRisk || 'Low'}</strong></span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                        {coa.successProbability}% SUCCESS
                      </span>
                    </div>
                  </div>

                  {/* Objective */}
                  <p className="text-xs text-slate-300 leading-relaxed my-2">
                    {coa.objective}
                  </p>

                  {/* Tactical Phases */}
                  {coa.phases && coa.phases.length > 0 && (
                    <div className="bg-black/40 p-2 rounded border border-slate-800 my-2 space-y-1">
                      <span className="text-[8px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
                        PHASED EXECUTION TIMELINE:
                      </span>
                      {coa.phases.map((phase, pIdx) => (
                        <div key={pIdx} className="text-[9px] font-mono text-slate-300 flex items-start space-x-1.5">
                          <span className="text-cyan-400">›</span>
                          <span>{phase}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Risks */}
                  <div className="text-[10px] font-mono text-slate-400 mb-3">
                    <span className="text-red-400 font-bold">RISK FACTORS: </span>
                    <span>{coa.risks}</span>
                  </div>

                  {/* Footer Action Buttons */}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                    <div className="flex flex-wrap gap-1">
                      {coa.assets.map((a, i) => (
                        <span key={i} className="text-[8px] font-mono bg-white/5 border border-white/10 px-1.5 py-0.5 text-slate-300 rounded uppercase">
                          {a}
                        </span>
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRunForecast(coa);
                        }}
                        disabled={!!isForecasting}
                        className="text-[9px] font-mono font-bold text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded hover:bg-cyan-500/20 transition-colors uppercase"
                      >
                        {isForecasting === coa.id ? "PROBING VEO..." : "VEO SIMULATION"}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExecute(coa);
                        }}
                        className={`text-[9px] font-black px-3 py-1 rounded uppercase tracking-wider transition-all ${
                          isExecuted
                            ? 'bg-green-500 text-black'
                            : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_10px_rgba(0,242,255,0.3)]'
                        }`}
                      >
                        {isExecuted ? "EXECUTING..." : "EXECUTE COA"}
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default StrategicAdvisor;
