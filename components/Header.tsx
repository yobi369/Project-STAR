import React, { useState, useEffect } from 'react';
import { SectorConfig } from '../types.ts';
import { SECTORS } from '../constants.ts';
import { ShieldIcon } from './icons.tsx';
import { playTacticalSound } from '../utils/audioUtils.ts';

export type CommandSuiteView = 
  | 'BATTLESPACE' 
  | 'TARGET_VISUALIZER' 
  | 'ELECTRONIC_WARFARE' 
  | 'FLIGHT_PLANNER' 
  | 'AIR_DEFENSE' 
  | 'TACTICAL_COMMS' 
  | 'AFTER_ACTION_REVIEW' 
  | 'COMBAT_LOGISTICS' 
  | 'SATELLITE_GEOINT' 
  | 'DRONE_SWARM' 
  | 'CRISIS_DETERRENCE';

interface HeaderProps {
  currentSector: SectorConfig;
  onSectorChange: (sector: SectorConfig) => void;
  activeThreatsCount: number;
  assetsCount: number;
  onOpenBriefing: () => void;
  soundMuted: boolean;
  setSoundMuted: (muted: boolean) => void;
  activeSuiteView: CommandSuiteView;
  onSelectSuiteView: (view: CommandSuiteView) => void;
}

const Header: React.FC<HeaderProps> = ({
  currentSector,
  onSectorChange,
  activeThreatsCount,
  assetsCount,
  onOpenBriefing,
  soundMuted,
  setSoundMuted,
  activeSuiteView,
  onSelectSuiteView
}) => {
  const [zuluTime, setZuluTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toISOString().substring(11, 19) + ' Z';
      setZuluTime(timeStr);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-slate-950 border-b border-cyan-500/30 px-3 py-2 flex flex-col md:flex-row items-center justify-between gap-2.5 select-none z-30">
      
      {/* Left: Brand & Platform Identity */}
      <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <ShieldIcon className="w-7 h-7 text-cyan-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping"></span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black text-white tracking-[0.2em] uppercase">
                PROJECT S.T.A.R.
              </span>
              <span className="text-[8px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.2 rounded">
                v4.5 SOVEREIGN
              </span>
            </div>
            <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest block">
              KENYA DEFENCE FORCES // C4ISR & MULTI-DOMAIN AI
            </span>
          </div>
        </div>

        {/* Tactical Counters */}
        <div className="hidden lg:flex items-center space-x-2 text-[10px] font-mono">
          <div className="flex items-center space-x-1 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span className="text-slate-400">UNITS:</span>
            <span className="text-white font-bold">{assetsCount}</span>
          </div>
          <div className="flex items-center space-x-1 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
            <span className={`w-1.5 h-1.5 rounded-full ${activeThreatsCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-green-400'}`}></span>
            <span className="text-slate-400">CONTACTS:</span>
            <span className={`font-bold ${activeThreatsCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {activeThreatsCount}
            </span>
          </div>
        </div>

        {/* Mobile View Sector Picker */}
        <div className="md:hidden">
          <select
            value={currentSector.id}
            onChange={(e) => {
              const sec = SECTORS.find(s => s.id === e.target.value);
              if (sec) onSectorChange(sec);
            }}
            className="bg-slate-900 text-cyan-300 font-mono text-[10px] p-1 rounded border border-slate-800"
          >
            {SECTORS.map((s) => (
              <option key={s.id} value={s.id}>{s.code}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Center: Command Suite View Switchers */}
      <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-lg border border-cyan-500/30 overflow-x-auto max-w-full custom-scrollbar">
        {[
          { id: 'BATTLESPACE' as const, label: 'BATTLESPACE GRID', icon: '🗺️' },
          { id: 'TARGET_VISUALIZER' as const, label: 'TARGET RECON', icon: '🎯' },
          { id: 'ELECTRONIC_WARFARE' as const, label: 'EW & SIGINT', icon: '📡' },
          { id: 'FLIGHT_PLANNER' as const, label: 'UAV FLIGHT PLAN', icon: '🛩️' },
          { id: 'AIR_DEFENSE' as const, label: 'AIR DEFENSE DOME', icon: '🛡️' },
          { id: 'TACTICAL_COMMS' as const, label: 'LINK-16 COMMS', icon: '📻' },
          { id: 'AFTER_ACTION_REVIEW' as const, label: 'AAR BLACKBOX', icon: '⏪' },
          { id: 'COMBAT_LOGISTICS' as const, label: 'COMBAT LOGISTICS', icon: '📦' },
          { id: 'SATELLITE_GEOINT' as const, label: 'SATELLITE GEOINT', icon: '🛰️' },
          { id: 'DRONE_SWARM' as const, label: 'DRONE & C-UAS', icon: '🛸' },
          { id: 'CRISIS_DETERRENCE' as const, label: 'CRISIS & WAR-GAME', icon: '⚡' }
        ].map((suite) => {
          const isActive = activeSuiteView === suite.id;
          return (
            <button
              key={suite.id}
              onClick={() => {
                onSelectSuiteView(suite.id);
                playTacticalSound('button-click', soundMuted);
              }}
              className={`px-2.5 py-1.5 rounded text-[9px] md:text-[10px] font-mono font-black uppercase whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-[0_0_12px_rgba(0,242,255,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{suite.icon}</span>
              <span>{suite.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Sector, Zulu Clock & Investor Briefing Trigger */}
      <div className="flex items-center space-x-2.5 w-full md:w-auto justify-end">
        
        {/* Sector Picker (Desktop) */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-slate-900/90 border border-cyan-500/30 rounded px-2 py-1">
          <span className="text-[8px] font-mono text-slate-400 uppercase">AO:</span>
          <select
            value={currentSector.id}
            onChange={(e) => {
              const sec = SECTORS.find(s => s.id === e.target.value);
              if (sec) {
                onSectorChange(sec);
                playTacticalSound('button-click', soundMuted);
              }
            }}
            className="bg-transparent text-cyan-300 font-mono text-[10px] font-bold outline-none cursor-pointer"
          >
            {SECTORS.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-950 text-cyan-300">
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        {/* Zulu Time */}
        <div className="text-right font-mono hidden sm:block">
          <span className="text-[7px] text-slate-500 block uppercase">ZULU CLOCK</span>
          <span className="text-[11px] text-cyan-400 font-bold">{zuluTime || '00:00:00 Z'}</span>
        </div>

        {/* Audio Mute Switch */}
        <button
          onClick={() => {
            setSoundMuted(!soundMuted);
            playTacticalSound('button-click', !soundMuted);
          }}
          className={`px-2 py-1 rounded border text-[9px] font-mono uppercase transition-colors ${
            soundMuted ? 'bg-slate-900 text-slate-500 border-slate-800' : 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40'
          }`}
          title="Toggle Tactical Audio Sound Effects"
        >
          {soundMuted ? '🔇 MUTE' : '🔊 SFX'}
        </button>

        {/* Executive Investor Briefing Modal Trigger */}
        <button
          onClick={() => {
            onOpenBriefing();
            playTacticalSound('button-click', soundMuted);
          }}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-black text-[10px] md:text-xs px-3 py-1.5 rounded uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center space-x-1"
        >
          <span>⭐</span>
          <span>BRIEFING</span>
        </button>

      </div>

    </header>
  );
};

export default Header;
