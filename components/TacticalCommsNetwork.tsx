import React, { useState } from 'react';
import { RadioTransmission, TacticalRadioChannel } from '../types.ts';
import { playTacticalSound, speakTacticalReadout } from '../utils/audioUtils.ts';

interface TacticalCommsNetworkProps {
  soundMuted?: boolean;
}

const CHANNELS: TacticalRadioChannel[] = [
  { id: 'ch-vhf-ground', name: 'KDF BORDER GROUND NET (TAC-1)', frequency: '48.500 MHz', band: 'VHF Ground Tactical', activeUsers: 24, secureKey: 'AES-256 GCM 0x88FE' },
  { id: 'ch-uhf-air', name: 'AIR DEFENSE & COMBAT AIR (STRIKE-NET)', frequency: '312.800 MHz', band: 'UHF Air Strike Net', activeUsers: 8, secureKey: 'LINK-16 CRYPTO 0x4A11' },
  { id: 'ch-naval-blue', name: 'INDIAN OCEAN TASK FORCE (NAV-TASK)', frequency: '8.450 MHz', band: 'HF Blue-Water Naval', activeUsers: 14, secureKey: 'STANAG 5516 0x9B20' },
  { id: 'ch-satcom-specops', name: 'SOVEREIGN MIL-SATCOM (SPECIAL-OPS)', frequency: '7.820 GHz', band: 'Mil-SATCOM Secure', activeUsers: 6, secureKey: 'QUANTUM RESISTANT 0xFF12' }
];

const INITIAL_TRANSMISSIONS: RadioTransmission[] = [
  {
    id: 'tx-01',
    channelId: 'ch-vhf-ground',
    timestamp: '02:14:22 Z',
    callsign: 'RHINO-ACTUAL (Mandera FOB)',
    senderRole: 'GROUND-COMMAND',
    transcript: 'Sovereign HQ, this is Rhino-Actual. Unmanned aerial recon confirms border fence integrity at Sector Bravo-3. Perimeter clear, no thermal intrusions detected.',
    audioFrequencyKhz: 48500,
    encryptionKeyStatus: 'AES-256 GCM SECURED',
    classification: 'SECRET',
    isFlashPriority: false
  },
  {
    id: 'tx-02',
    channelId: 'ch-uhf-air',
    timestamp: '02:15:05 Z',
    callsign: 'HARAMBEE-LEAD (TB2 Orbit)',
    senderRole: 'AIR-LEAD',
    transcript: 'Air Command, Harambee-01 checking in on station at FL180. Laser designation pod locked on maritime corridor. Data link 16 telemetry synchronized.',
    audioFrequencyKhz: 312800,
    encryptionKeyStatus: 'LINK-16 Datalink',
    classification: 'TOP SECRET',
    isFlashPriority: false
  },
  {
    id: 'tx-03',
    channelId: 'ch-naval-blue',
    timestamp: '02:15:48 Z',
    callsign: 'KNS SHUJAA (Offshore Lamu)',
    senderRole: 'NAVAL-PATROL',
    transcript: 'FLASH PRIORITY: Surface search radar detects unidentified fast craft vectoring toward shipping lane at 32 knots. Visual identification UAV dispatched.',
    audioFrequencyKhz: 8450,
    encryptionKeyStatus: 'STANAG 5516',
    classification: 'TOP SECRET',
    isFlashPriority: true
  }
];

export const TacticalCommsNetwork: React.FC<TacticalCommsNetworkProps> = ({ soundMuted = false }) => {
  const [channels] = useState<TacticalRadioChannel[]>(CHANNELS);
  const [selectedChannel, setSelectedChannel] = useState<TacticalRadioChannel>(CHANNELS[0]);
  const [transmissions, setTransmissions] = useState<RadioTransmission[]>(INITIAL_TRANSMISSIONS);
  const [customMessage, setCustomMessage] = useState('');
  const [isTransmitting, setIsTransmitting] = useState(false);

  const handleSelectChannel = (ch: TacticalRadioChannel) => {
    setSelectedChannel(ch);
    playTacticalSound('button-click', soundMuted);
    speakTacticalReadout(`Switched to ${ch.name}.`, !soundMuted);
  };

  const handleSendFlashMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMessage.trim()) return;

    setIsTransmitting(true);
    playTacticalSound('radar-ping', soundMuted);

    const newTx: RadioTransmission = {
      id: `tx-${Date.now()}`,
      channelId: selectedChannel.id,
      timestamp: new Date().toISOString().substring(11, 19) + ' Z',
      callsign: 'SOVEREIGN-HQ (COMMANDER)',
      senderRole: 'HQ-SOVEREIGN',
      transcript: customMessage.trim(),
      audioFrequencyKhz: parseInt(selectedChannel.frequency) * 1000 || 50000,
      encryptionKeyStatus: selectedChannel.band.includes('Link-16') ? 'LINK-16 Datalink' : 'AES-256 GCM SECURED',
      classification: 'TOP SECRET',
      isFlashPriority: true
    };

    setTimeout(() => {
      setTransmissions(prev => [newTx, ...prev]);
      setCustomMessage('');
      setIsTransmitting(false);
      playTacticalSound('neutralize-success', soundMuted);
      speakTacticalReadout("Flash priority transmission broadcast to tactical network.", !soundMuted);
    }, 600);
  };

  const filteredTransmissions = transmissions.filter(
    t => t.channelId === selectedChannel.id || t.isFlashPriority
  );

  return (
    <div className="h-full flex flex-col glass-panel hud-border p-2 sm:p-3 select-none overflow-y-auto lg:overflow-hidden animate-fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 mb-2.5 border-b border-cyan-500/30 pb-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></div>
          <div>
            <h2 className="text-xs sm:text-sm md:text-base font-black text-cyan-400 uppercase tracking-wider sm:tracking-widest flex items-center space-x-2">
              <span>ENCRYPTED TACTICAL COMMS & DATA LINK (LINK-16 / SATCOM)</span>
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                AES-256 GCM
              </span>
            </h2>
            <p className="text-[8px] sm:text-[9px] font-mono text-slate-400 uppercase">
              MULTI-ECHELON SECURE VOICE & TACTICAL TEXT RELAY // AUTOMATED MIL-RADIO TRANSCRIPTION
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[9px] font-mono">
          <span className="text-slate-400">CRYPTO STATUS:</span>
          <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
            SOVEREIGN KEYS SYNCED (ZERO LEAK)
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-2.5 min-h-0">
        
        {/* Left Column: Radio Channels Selector (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-2 min-h-0 overflow-y-auto custom-scrollbar">
          <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest">
            SECURE TACTICAL FREQUENCIES ({channels.length})
          </span>

          <div className="space-y-2">
            {channels.map((ch) => {
              const isSelected = selectedChannel.id === ch.id;
              return (
                <div
                  key={ch.id}
                  onClick={() => handleSelectChannel(ch)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_12px_rgba(0,242,255,0.25)]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <strong className="text-white text-[10px] sm:text-[11px] font-mono block">
                      {ch.name}
                    </strong>
                    <span className="text-[7px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30 font-bold">
                      {ch.activeUsers} UNITS
                    </span>
                  </div>

                  <div className="mt-1 space-y-0.5 text-[8px] sm:text-[9px] font-mono text-slate-400">
                    <div>FREQ: <span className="text-cyan-300 font-bold">{ch.frequency}</span> // {ch.band}</div>
                    <div className="text-[7px] text-slate-500 truncate">KEY: {ch.secureKey}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Transcripts Feed & Flash SITREP Broadcaster (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-2.5 min-h-0 overflow-y-auto custom-scrollbar">
          
          {/* Active Live Transcripts Stream */}
          <div className="bg-slate-950/80 p-3 rounded-lg border border-cyan-500/30 flex-grow flex flex-col space-y-2 min-h-0">
            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
              <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-widest">
                LIVE INTERCOM & SATELLITE RADIO TRANSCRIPTS // {selectedChannel.name}
              </span>
              <span className="text-[8px] font-mono text-emerald-400 animate-pulse">
                ● LISTENING SQUELCH OPEN
              </span>
            </div>

            <div className="flex-grow space-y-2 overflow-y-auto max-h-[300px] custom-scrollbar pr-1">
              {filteredTransmissions.map((tx) => (
                <div
                  key={tx.id}
                  className={`p-2.5 rounded border text-[9px] sm:text-[10px] font-mono space-y-1 ${
                    tx.isFlashPriority
                      ? 'bg-red-950/40 border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                      : 'bg-black/50 border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-center text-[8px]">
                    <div className="flex items-center space-x-1.5">
                      <span className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                        tx.senderRole === 'HQ-SOVEREIGN' ? 'bg-cyan-500 text-black' :
                        tx.senderRole === 'AIR-LEAD' ? 'bg-purple-500 text-white' :
                        tx.senderRole === 'NAVAL-PATROL' ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-black'
                      }`}>
                        {tx.callsign}
                      </span>
                      <span className="text-slate-400">{tx.timestamp}</span>
                    </div>
                    <span className="text-slate-500 text-[7px]">{tx.encryptionKeyStatus}</span>
                  </div>

                  <p className="text-slate-200 leading-relaxed pl-1 border-l-2 border-cyan-500/50">
                    {tx.transcript}
                  </p>
                </div>
              ))}
            </div>

            {/* Broadcast Form Input */}
            <form onSubmit={handleSendFlashMessage} className="mt-2 pt-2 border-t border-slate-800 flex items-center space-x-2">
              <input
                type="text"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder={`Broadcast flash directive to ${selectedChannel.name}...`}
                className="flex-grow bg-slate-900 border border-cyan-500/40 text-cyan-200 text-[10px] sm:text-[11px] font-mono px-3 py-2 rounded outline-none focus:border-cyan-400 placeholder:text-slate-600"
              />
              <button
                type="submit"
                disabled={isTransmitting || !customMessage.trim()}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-[9px] sm:text-[10px] font-mono px-4 py-2 rounded uppercase tracking-wider transition-colors disabled:opacity-40 min-h-[38px] whitespace-nowrap"
              >
                {isTransmitting ? 'TRANSMITTING...' : 'TRANSMIT FLASH DIRECTIVE →'}
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};

export default TacticalCommsNetwork;
