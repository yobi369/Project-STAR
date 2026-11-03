import React from 'react';
import { ShieldIcon } from './icons.tsx';
import { DEMO_SCENARIOS } from '../constants.ts';
import { DemoScenario } from '../types.ts';

interface InvestorBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunScenario: (scenario: DemoScenario) => void;
}

const InvestorBriefingModal: React.FC<InvestorBriefingModalProps> = ({ isOpen, onClose, onRunScenario }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center p-2 sm:p-4 md:p-8 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="w-full max-w-5xl max-h-[92vh] bg-slate-950 border-2 border-cyan-500/40 rounded-xl flex flex-col shadow-[0_0_60px_rgba(0,242,255,0.25)] overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border-b border-cyan-500/30 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <ShieldIcon className="w-7 h-7 sm:w-9 sm:h-9 text-cyan-400 animate-pulse flex-shrink-0" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[9px] sm:text-[10px] font-black tracking-[0.2em] sm:tracking-[0.3em] uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded">
                  EXECUTIVE BRIEFING
                </span>
                <span className="text-[8px] sm:text-[10px] font-mono text-white/50 truncate">CONFIDENTIAL // KDF AI PLATFORM</span>
              </div>
              <h2 className="text-base sm:text-xl md:text-2xl font-black text-white tracking-wide mt-1 truncate">
                PROJECT S.T.A.R. <span className="text-cyan-400 font-normal">| Axiom C4ISR Command Suite</span>
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-3 sm:px-4 py-2 rounded border border-white/20 text-[10px] sm:text-xs font-mono tracking-widest uppercase transition-colors flex-shrink-0 min-h-[36px]"
          >
            CLOSE [✕]
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 text-sm custom-scrollbar">
          
          {/* Executive Overview Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-cyan-950/30 border border-cyan-500/30 p-3 sm:p-4 rounded-lg">
              <span className="text-[9px] sm:text-[10px] font-bold text-cyan-400 uppercase tracking-widest block mb-1">OODA Loop Acceleration</span>
              <div className="text-2xl sm:text-3xl font-black text-white">85% <span className="text-xs text-cyan-400 font-mono font-normal">FASTER</span></div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1.5 leading-relaxed">
                Replaces manual intelligence collation with automated real-time triangulation and sub-second multi-threat correlation.
              </p>
            </div>

            <div className="bg-blue-950/30 border border-blue-500/30 p-3 sm:p-4 rounded-lg">
              <span className="text-[9px] sm:text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1">Cognitive Engine</span>
              <div className="text-2xl sm:text-3xl font-black text-white">Gemini 3.7 <span className="text-xs text-blue-400 font-mono font-normal">REASONING</span></div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1.5 leading-relaxed">
                Evaluates complex multi-domain COAs, collateral risks, terrain friction, and KDF asset readiness in parallel.
              </p>
            </div>

            <div className="bg-purple-950/30 border border-purple-500/30 p-3 sm:p-4 rounded-lg sm:col-span-2 md:col-span-1">
              <span className="text-[9px] sm:text-[10px] font-bold text-purple-400 uppercase tracking-widest block mb-1">Kinetic Simulation</span>
              <div className="text-2xl sm:text-3xl font-black text-white">Veo 3.1 <span className="text-xs text-purple-400 font-mono font-normal">FORECASTING</span></div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1.5 leading-relaxed">
                Generates high-fidelity visual tactical projections and thermal reconnaissance flyovers prior to mission greenlight.
              </p>
            </div>
          </div>

          {/* Interactive Demo Scenarios Section */}
          <div className="bg-slate-900/80 border border-cyan-500/30 rounded-xl p-3 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-black text-cyan-400 uppercase tracking-wider">
                  Interactive Live Investor & Command Scenarios
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                  Click any scenario below to trigger a complete end-to-end tactical workflow across the map, drone FLIR, and AI advisor.
                </p>
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20 whitespace-nowrap">
                  1-CLICK SIMULATION
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              {DEMO_SCENARIOS.map((scenario) => (
                <div 
                  key={scenario.id}
                  className="bg-black/60 border border-slate-700/80 hover:border-cyan-400 p-3 sm:p-4 rounded-lg flex flex-col justify-between transition-all group hover:shadow-[0_0_20px_rgba(0,242,255,0.15)] cursor-pointer"
                  onClick={() => {
                    onRunScenario(scenario);
                    onClose();
                  }}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[8px] sm:text-[9px] font-bold font-mono px-2 py-0.5 rounded border uppercase ${scenario.badgeColor}`}>
                        {scenario.sectorName}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-cyan-300 transition-colors">
                      {scenario.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-1.5 leading-relaxed">
                      {scenario.description}
                    </p>
                  </div>

                  <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-[8px] sm:text-[9px] font-mono text-slate-500 truncate">COA: {scenario.recommendedCOAType}</span>
                    <button className="bg-cyan-500 group-hover:bg-cyan-400 text-black text-[9px] sm:text-[10px] font-black px-2.5 sm:px-3 py-1.5 rounded tracking-wider uppercase transition-all whitespace-nowrap">
                      LAUNCH DEMO →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Architecture & Technology Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-slate-900/50 border border-slate-800 p-3 sm:p-4 rounded-lg">
              <h4 className="text-[11px] sm:text-xs font-black text-cyan-400 uppercase tracking-widest mb-2.5 sm:mb-3 flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>Core Architectural Innovations</span>
              </h4>
              <ul className="space-y-2 text-[11px] sm:text-xs text-slate-300">
                <li className="flex items-start space-x-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span><strong className="text-white">Multi-Source Sensor Fusion:</strong> Real-time integration of SIGINT radio intercepts, HUMINT scout reports, FLIR satellite imagery, and AIS maritime tracking.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span><strong className="text-white">Grounded OSINT Intel:</strong> Live Google Search grounding linking regional East African geopolitical news to active tactical coordinates.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span><strong className="text-white">Live Voice Intercom:</strong> Low-latency bidirectional audio link enabling field commanders to issue spoken tactical directives.</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-3 sm:p-4 rounded-lg">
              <h4 className="text-[11px] sm:text-xs font-black text-cyan-400 uppercase tracking-widest mb-2.5 sm:mb-3 flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>Deployment & Sovereign Readiness</span>
              </h4>
              <ul className="space-y-2 text-[11px] sm:text-xs text-slate-300">
                <li className="flex items-start space-x-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span><strong className="text-white">Full Air-Gap & Edge Support:</strong> Designed for containerized deployment at Forward Operating Bases (FOBs) or Naval command bridges.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span><strong className="text-white">Predictive Logistics:</strong> Automated tracking of KDF fuel reserves, munitions depots, and resupply convoy ETAs.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span><strong className="text-white">NATO/KDF Interoperability:</strong> Compliant with STANAG and MGRS coordinate grid standards.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] sm:text-xs font-mono text-slate-400">
          <div className="truncate text-center sm:text-left">PROJECT S.T.A.R. // KENYA DEFENCE FORCES AI COMMAND ENVIRONMENT</div>
          <button 
            onClick={onClose}
            className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-black font-black px-5 py-2.5 rounded uppercase tracking-widest text-[11px] sm:text-xs transition-colors min-h-[40px]"
          >
            ENTER COMMAND CONSOLE
          </button>
        </div>

      </div>
    </div>
  );
};

export default InvestorBriefingModal;
