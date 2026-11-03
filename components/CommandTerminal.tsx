import React, { useState, useEffect, useRef } from 'react';
import { Asset, Threat } from '../types.ts';
import { getSystemReply } from '../services/geminiService.ts';
import { playTacticalSound, speakTacticalReadout } from '../utils/audioUtils.ts';

interface CommandTerminalProps {
  assets: Asset[];
  threats: Threat[];
  currentSectorName?: string;
  soundMuted?: boolean;
}

interface LogEntry {
  id: number;
  sender: 'SYS' | 'USER' | 'KDF-HQ';
  text: string;
  timestamp: string;
}

const PRESET_DIRECTIVES = [
  "SITUATION REPORT",
  "DEPLOY RAPID RESPONSE (QRF)",
  "FLEET READINESS STATUS",
  "THREAT TRIANGULATION MATRIX",
  "AUTHORIZE UAV DRONE PATROL"
];

const CommandTerminal: React.FC<CommandTerminalProps> = ({
  assets,
  threats,
  currentSectorName,
  soundMuted = false
}) => {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 1,
      sender: 'SYS',
      text: 'PROJECT S.T.A.R. AXIOM C4ISR PROTOCOL INITIALIZED. KDF COMMAND MESH SYNCHRONIZED.',
      timestamp: '00:00:01'
    },
    {
      id: 2,
      sender: 'SYS',
      text: `ACTIVE MONITORING: ${assets.length} KDF UNITS ONLINE. ${threats.length} CONTACTS DETECTED. READY FOR DIRECTIVE.`,
      timestamp: '00:00:02'
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceReadoutEnabled, setVoiceReadoutEnabled] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const sendDirective = async (textToSend: string) => {
    if (!textToSend.trim() || isProcessing) return;
    const msg = textToSend.trim();
    setInput('');
    setIsProcessing(true);
    playTacticalSound('button-click', soundMuted);

    const nowTime = new Date().toTimeString().substring(0, 8);
    const userEntry: LogEntry = {
      id: Date.now(),
      sender: 'USER',
      text: msg,
      timestamp: nowTime
    };

    setLogs((prev) => [...prev, userEntry]);

    try {
      const reply = await getSystemReply(msg, assets, threats, currentSectorName);
      const sysEntry: LogEntry = {
        id: Date.now() + 1,
        sender: 'SYS',
        text: reply,
        timestamp: new Date().toTimeString().substring(0, 8)
      };
      setLogs((prev) => [...prev, sysEntry]);
      playTacticalSound('radio-chirp', soundMuted);
      if (voiceReadoutEnabled && !soundMuted) {
        speakTacticalReadout(reply);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendDirective(input);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/90 border border-cyan-500/20 rounded-lg overflow-hidden select-none">
      
      {/* Terminal Bar */}
      <div className="p-2.5 bg-slate-900/90 border-b border-cyan-500/20 flex justify-between items-center text-[10px] font-mono">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-cyan-400 font-bold tracking-wider uppercase">
            KDF C2 DIRECTIVE TERMINAL
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setVoiceReadoutEnabled(!voiceReadoutEnabled);
              playTacticalSound('button-click', soundMuted);
            }}
            className={`px-2 py-0.5 rounded text-[9px] transition-colors ${
              voiceReadoutEnabled ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-500'
            }`}
          >
            VOICE READOUT: {voiceReadoutEnabled ? 'ON' : 'OFF'}
          </button>
          <span className="text-slate-500">AES-256</span>
        </div>
      </div>

      {/* Terminal Logs Output */}
      <div className="flex-grow p-3 overflow-y-auto space-y-2 font-mono text-xs custom-scrollbar bg-black/40">
        {logs.map((log) => (
          <div
            key={log.id}
            className={`p-2 rounded leading-relaxed border ${
              log.sender === 'SYS'
                ? 'bg-cyan-950/20 border-cyan-500/20 text-cyan-300'
                : 'bg-white/5 border-white/10 text-white'
            }`}
          >
            <div className="flex justify-between items-center text-[9px] opacity-60 mb-0.5">
              <span className="font-bold">[{log.sender}]</span>
              <span>{log.timestamp} Z</span>
            </div>
            <p className="text-xs">{log.text}</p>
          </div>
        ))}
        {isProcessing && (
          <div className="text-[10px] font-mono text-cyan-400 animate-pulse flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            <span>AI STAFF OFFICER PROCESSING DIRECTIVE...</span>
          </div>
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Quick Directives Bar */}
      <div className="px-2 py-1.5 bg-slate-900/60 border-t border-slate-800 flex flex-wrap gap-1.5">
        {PRESET_DIRECTIVES.map((directive) => (
          <button
            key={directive}
            onClick={() => sendDirective(directive)}
            disabled={isProcessing}
            className="text-[8px] font-mono font-bold px-2 py-1 rounded bg-black/60 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors uppercase"
          >
            {directive}
          </button>
        ))}
      </div>

      {/* Input Prompt */}
      <div className="p-2.5 bg-slate-900/90 border-t border-cyan-500/20">
        <form onSubmit={handleFormSubmit} className="flex space-x-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isProcessing}
            className="flex-grow bg-black/60 border border-cyan-500/30 rounded px-3 py-2 text-cyan-300 text-xs font-mono outline-none focus:border-cyan-400 placeholder:text-slate-600"
            placeholder="TYPE MILITARY DIRECTIVE OR INQUIRY..."
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-black text-[10px] px-4 py-2 rounded font-mono uppercase tracking-wider transition-all"
          >
            TRANSMIT
          </button>
        </form>
      </div>

    </div>
  );
};

export default CommandTerminal;
