import React, { useState } from 'react';
import { Asset } from '../types.ts';
import { SUPPLY_CONVOYS } from '../constants.ts';
import { playTacticalSound } from '../utils/audioUtils.ts';

interface LogisticsPanelProps {
  assets: Asset[];
  soundMuted?: boolean;
}

const LogisticsPanel: React.FC<LogisticsPanelProps> = ({ assets, soundMuted = false }) => {
  const [convoys, setConvoys] = useState(SUPPLY_CONVOYS);
  const [dispatchedId, setDispatchedId] = useState<string | null>(null);

  const avgReadiness = Math.round(assets.reduce((acc, a) => acc + a.readinessScore, 0) / (assets.length || 1));
  const avgFuel = Math.round(assets.reduce((acc, a) => acc + a.fuelPercent, 0) / (assets.length || 1));
  const avgAmmo = Math.round(assets.reduce((acc, a) => acc + a.munitionsPercent, 0) / (assets.length || 1));

  const handleDispatchResupply = (convoyId: string) => {
    setDispatchedId(convoyId);
    playTacticalSound('radar-ping', soundMuted);
    setTimeout(() => {
      setConvoys(prev => prev.map(c => c.id === convoyId ? { ...c, progress: Math.min(100, c.progress + 25), status: 'In Transit' } : c));
      setDispatchedId(null);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col glass-panel hud-border p-3 select-none">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">
            BATTLESPACE LOGISTICS & SUSTAINMENT
          </h3>
        </div>
        <span className="text-[9px] font-mono text-cyan-300/80 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 font-bold">
          OVERALL READINESS: {avgReadiness}%
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-slate-900/80 p-2 rounded border border-slate-800 text-center">
          <span className="text-[8px] font-mono text-slate-400 uppercase block">FUEL CAPACITY</span>
          <span className="text-sm font-black text-cyan-400 font-mono">{avgFuel}%</span>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
            <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${avgFuel}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-900/80 p-2 rounded border border-slate-800 text-center">
          <span className="text-[8px] font-mono text-slate-400 uppercase block">MUNITIONS DEPOT</span>
          <span className="text-sm font-black text-amber-400 font-mono">{avgAmmo}%</span>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
            <div className="bg-amber-400 h-full rounded-full" style={{ width: `${avgAmmo}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-900/80 p-2 rounded border border-slate-800 text-center">
          <span className="text-[8px] font-mono text-slate-400 uppercase block">ACTIVE UNITS</span>
          <span className="text-sm font-black text-green-400 font-mono">{assets.length} / {assets.length}</span>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
            <div className="bg-green-400 h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>

      {/* Supply Convoys Tracker */}
      <div className="flex-grow overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        <div className="text-[8px] font-mono text-slate-400 uppercase tracking-widest mb-1">
          TACTICAL SUPPLY CORRIDORS IN TRANSIT:
        </div>

        {convoys.map((convoy) => (
          <div key={convoy.id} className="bg-black/50 p-2.5 rounded border border-slate-800/80 hover:border-cyan-500/30 transition-colors">
            <div className="flex justify-between items-center text-[9px] font-mono mb-1">
              <span className="font-bold text-white">{convoy.route}</span>
              <span className="text-cyan-400">ETA: {convoy.eta}</span>
            </div>

            <div className="text-[8px] font-mono text-slate-400 mb-1.5 truncate">
              CARGO: {convoy.cargo}
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex-grow bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-500"
                  style={{ width: `${convoy.progress}%` }}
                ></div>
              </div>
              <span className="text-[8px] font-mono text-slate-400 font-bold">{convoy.progress}%</span>
            </div>

            <div className="mt-2 flex justify-end">
              <button
                onClick={() => handleDispatchResupply(convoy.id)}
                disabled={dispatchedId === convoy.id}
                className="text-[8px] font-mono font-bold text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/30 px-2 py-0.5 rounded transition-colors uppercase"
              >
                {dispatchedId === convoy.id ? "EXPEDITING..." : "EXPEDITE CORRIDOR"}
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default LogisticsPanel;
