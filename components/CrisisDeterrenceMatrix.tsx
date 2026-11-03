import React, { useState } from 'react';
import { CRISIS_SCENARIOS } from '../constants.ts';
import { CrisisDeterrenceScenario } from '../types.ts';
import { simulateCrisisWargame } from '../services/geminiService.ts';
import { playTacticalSound } from '../utils/audioUtils.ts';

interface CrisisDeterrenceMatrixProps {
  soundMuted?: boolean;
}

const CrisisDeterrenceMatrix: React.FC<CrisisDeterrenceMatrixProps> = ({ soundMuted = false }) => {
  const [scenarios] = useState<CrisisDeterrenceScenario[]>(CRISIS_SCENARIOS);
  const [selectedScenario, setSelectedScenario] = useState<CrisisDeterrenceScenario>(CRISIS_SCENARIOS[0]);
  const [selectedAction, setSelectedAction] = useState<string>('Deploy Layered C-UAS Electronic Shield & Joint Maritime Escort');
  const [isSimulating, setIsSimulating] = useState(false);
  const [wargameResult, setWargameResult] = useState<{
    escalationRiskScore: number;
    kenyaDeterrencePosture: string;
    projectedOutcomes: string[];
    strategicDeEscalationAdvice: string;
    economicImpactMitigation: string;
  } | null>(null);

  const handleRunWargame = async () => {
    setIsSimulating(true);
    setWargameResult(null);
    playTacticalSound('radar-ping', soundMuted);

    try {
      const result = await simulateCrisisWargame(selectedScenario.id, selectedAction);
      setWargameResult(result);
      playTacticalSound('alert-critical', soundMuted);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="h-full flex flex-col glass-panel hud-border p-3 sm:p-4 select-none overflow-y-auto lg:overflow-hidden animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3 border-b border-cyan-500/30 pb-2">
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-purple-400 animate-pulse"></span>
          <div>
            <h2 className="text-xs sm:text-sm md:text-base font-black text-purple-400 uppercase tracking-wider sm:tracking-widest">
              GEOPOLITICAL CRISIS & SOVEREIGN DETERRENCE MATRIX
            </h2>
            <p className="text-[8px] sm:text-[9px] font-mono text-slate-400 uppercase">
              RED SEA / HORN OF AFRICA / INDIAN OCEAN CHOKEPOINTS // ASYMMETRIC BALLISTIC & DRONE DEFENSE
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[8px] sm:text-[9px] font-mono font-bold px-2 sm:px-2.5 py-1 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300">
            DEFCON 2 (DETERRENCE)
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        
        {/* Left Column: Real-World Scenarios & Action Selector (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-3 overflow-y-auto pr-0 sm:pr-1 custom-scrollbar">
          
          {/* Scenario List */}
          <div className="bg-slate-900/80 p-3 rounded-lg border border-purple-500/20">
            <span className="text-[9px] sm:text-[10px] font-black text-purple-400 uppercase tracking-widest block mb-2">
              ACTIVE GEOPOLITICAL THEATERS:
            </span>

            <div className="space-y-2">
              {scenarios.map((sc) => {
                const isSel = selectedScenario.id === sc.id;
                return (
                  <div
                    key={sc.id}
                    onClick={() => {
                      setSelectedScenario(sc);
                      setWargameResult(null);
                      playTacticalSound('button-click', soundMuted);
                    }}
                    className={`p-2.5 rounded border cursor-pointer transition-all ${
                      isSel
                        ? 'bg-purple-950/60 border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                        : 'bg-black/40 border-slate-800 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold mb-1">
                      <span className="text-white">{sc.title}</span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded border uppercase ${
                        sc.tensionsLevel === 'CRITICAL ESCALATION'
                          ? 'bg-red-500/20 text-red-400 border-red-500/40'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      }`}>
                        {sc.tensionsLevel}
                      </span>
                    </div>

                    <div className="text-[9px] font-mono text-slate-400">
                      THEATER: <span className="text-slate-200">{sc.region}</span>
                    </div>

                    <div className="text-[8px] font-mono text-purple-300/80 mt-1">
                      FACTIONS: {sc.involvedFactions.join(' • ')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Commander Intervening Action */}
          <div className="bg-slate-900/80 p-3 rounded-lg border border-purple-500/20">
            <span className="text-[9px] sm:text-[10px] font-black text-purple-400 uppercase tracking-widest block mb-2">
              SELECT STRATEGIC DETERRENCE RESPONSE:
            </span>

            <div className="space-y-1.5">
              {[
                "Deploy Layered C-UAS Electronic Shield & Joint Maritime Escort",
                "Activate Orbital SAR Real-Time Chokepoint & Missile Early Warning Grid",
                "Scramble Bayraktar TB2 Drone Patrol & Long-Range Strike Alert",
                "Establish Exclusive Naval Cordon & Subsea Hydrophone Sonar Grid"
              ].map((act) => (
                <button
                  key={act}
                  onClick={() => {
                    setSelectedAction(act);
                    playTacticalSound('button-click', soundMuted);
                  }}
                  className={`w-full text-left p-2 rounded text-[9px] font-mono transition-colors min-h-[38px] flex items-start ${
                    selectedAction === act
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 font-bold'
                      : 'bg-black/30 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span className="text-purple-400 mr-1.5 font-bold">▸</span>
                  <span>{act}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleRunWargame}
              disabled={isSimulating}
              className="w-full mt-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-black text-xs py-2.5 rounded uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] disabled:opacity-40 min-h-[44px]"
            >
              {isSimulating ? "RUNNING MULTI-FACTION WAR-GAME..." : "SIMULATE STRATEGIC CRISIS OUTCOME →"}
            </button>
          </div>

        </div>

        {/* Right Column: Scenario Threat Analysis & AI Wargame Results (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-3 overflow-y-auto pr-0 sm:pr-1 custom-scrollbar">
          
          {/* Active Theater Strategic Assessment */}
          <div className="bg-slate-900/80 p-3 sm:p-4 rounded-xl border border-purple-500/20 space-y-2.5">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-1">
              <div>
                <span className="text-[8px] sm:text-[9px] font-mono text-purple-400 font-bold uppercase tracking-widest">
                  THEATER STRATEGIC PROFILE:
                </span>
                <h3 className="text-xs sm:text-sm font-black text-white mt-0.5">
                  {selectedScenario.title}
                </h3>
              </div>
              <span className="text-[8px] sm:text-[9px] font-mono text-slate-400">
                {selectedScenario.kenyaPosture}
              </span>
            </div>

            <p className="text-[11px] sm:text-xs text-slate-300 font-mono leading-relaxed">
              {selectedScenario.threatDescription}
            </p>

            <div className="bg-black/40 p-2.5 rounded border border-slate-800 space-y-1">
              <span className="text-[8px] sm:text-[9px] font-mono text-purple-300 font-bold uppercase block">
                NATIONAL SECURITY & ECONOMIC SIGNIFICANCE FOR KENYA:
              </span>
              <p className="text-[9px] sm:text-[10px] font-mono text-slate-300">
                {selectedScenario.strategicSignificance}
              </p>
            </div>

            {/* Early Warning Event Timeline */}
            <div className="pt-1">
              <span className="text-[8px] sm:text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold mb-1.5">
                EARLY WARNING TELEMETRY TIMELINE:
              </span>
              <div className="space-y-1">
                {selectedScenario.earlyWarningTimeline.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[8px] sm:text-[9px] font-mono bg-black/30 p-1.5 rounded border border-slate-800">
                    <span className="text-purple-400 font-bold">{item.time}</span>
                    <span className="text-slate-300 mx-2 flex-grow truncate">{item.event}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[7px] sm:text-[8px] font-bold uppercase ${
                      item.status === 'Active' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Geopolitical Wargame Simulator Outcome */}
          {wargameResult ? (
            <div className="bg-slate-900/90 p-3 sm:p-4 rounded-xl border border-purple-500/30 space-y-3 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-800 pb-2 gap-2">
                <div>
                  <span className="text-[8px] sm:text-[9px] font-mono text-purple-300 font-bold uppercase bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
                    WAR-GAME SIMULATION RESULT
                  </span>
                  <h4 className="text-xs sm:text-sm font-black text-white mt-1">
                    {wargameResult.kenyaDeterrencePosture}
                  </h4>
                </div>

                <div>
                  <span className="text-[11px] sm:text-xs font-mono font-black text-purple-400 bg-purple-950/80 px-2 py-1 rounded border border-purple-500/40">
                    {wargameResult.escalationRiskScore}% ESCALATION RISK
                  </span>
                </div>
              </div>

              {/* Strategic Projected Outcomes */}
              <div className="space-y-1.5">
                <span className="text-[8px] sm:text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                  PROJECTED STRATEGIC OUTCOMES:
                </span>
                {wargameResult.projectedOutcomes.map((out, i) => (
                  <div key={i} className="text-[11px] sm:text-xs font-mono text-slate-200 flex items-start space-x-2 bg-black/40 p-2 rounded border border-slate-800">
                    <span className="text-purple-400 font-bold">▸</span>
                    <span>{out}</span>
                  </div>
                ))}
              </div>

              {/* NSC Advisory & Supply Chain Safeguard */}
              <div className="bg-black/50 p-2.5 rounded border border-purple-500/20 space-y-1.5 text-[9px] sm:text-[10px] font-mono">
                <div className="text-purple-300">
                  <span className="font-bold uppercase text-purple-400">NSC STRATEGIC ADVISORY: </span>
                  {wargameResult.strategicDeEscalationAdvice}
                </div>
                <div className="text-emerald-400 pt-1 border-t border-slate-800">
                  <span className="font-bold uppercase">SUPPLY CHAIN & PORT SAFEGUARDS: </span>
                  {wargameResult.economicImpactMitigation}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-6 bg-slate-900/40 rounded-xl border border-dashed border-slate-800 text-center text-slate-500 font-mono text-xs space-y-2">
              <span className="text-slate-400 font-bold block uppercase">
                AWAITING WAR-GAME CRISIS SIMULATION
              </span>
              <p className="text-[10px] text-slate-500 max-w-md mx-auto">
                Choose a theater like the Red Sea / Bab-el-Mandeb chokepoint or Asymmetric Drone Swarm attack, select a strategic deterrence response, and click &quot;SIMULATE STRATEGIC CRISIS OUTCOME&quot; to test AI sovereign defense resilience.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default CrisisDeterrenceMatrix;
