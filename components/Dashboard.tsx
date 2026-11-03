import React, { useState, useEffect } from 'react';
import Header, { CommandSuiteView } from './Header.tsx';
import ThreatMap from './ThreatMap.tsx';
import IntelFeed from './IntelFeed.tsx';
import DroneAnalysis from './DroneAnalysis.tsx';
import StrategicAdvisor from './StrategicAdvisor.tsx';
import CommandTerminal from './CommandTerminal.tsx';
import ThreatLevelGauge from './ThreatLevelGauge.tsx';
import LogisticsPanel from './LogisticsPanel.tsx';
import InvestorBriefingModal from './InvestorBriefingModal.tsx';
import SatelliteIntelCenter from './SatelliteIntelCenter.tsx';
import DroneSwarmCommand from './DroneSwarmCommand.tsx';
import CrisisDeterrenceMatrix from './CrisisDeterrenceMatrix.tsx';
import RealtimeTargetVisualizer from './RealtimeTargetVisualizer.tsx';
import ElectronicWarfareCenter from './ElectronicWarfareCenter.tsx';
import AutonomousFlightPlanner from './AutonomousFlightPlanner.tsx';
import AirDefenseInterceptorDome from './AirDefenseInterceptorDome.tsx';
import TacticalCommsNetwork from './TacticalCommsNetwork.tsx';
import AfterActionReviewCenter from './AfterActionReviewCenter.tsx';
import CombatLogisticsCenter from './CombatLogisticsCenter.tsx';
import { Threat, Asset, CourseOfAction, IntelReport, SectorConfig, DemoScenario } from '../types.ts';
import { INITIAL_ASSETS, INITIAL_THREATS, SIMULATED_INTEL_FEED, SECTORS } from '../constants.ts';
import { playTacticalSound, speakTacticalReadout } from '../utils/audioUtils.ts';

interface TacticalNotification {
  id: string;
  message: string;
  type: 'CRITICAL' | 'WARNING' | 'SUCCESS';
  sectorName: string;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const [threats, setThreats] = useState<Threat[]>(INITIAL_THREATS);
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [intelReports, setIntelReports] = useState<IntelReport[]>(() => 
    SIMULATED_INTEL_FEED.map((item, idx) => ({
      ...item,
      id: `intel-init-${idx}`,
      timestamp: new Date(Date.now() - idx * 300000).toTimeString().substring(0, 8) + ' Z',
      status: idx === 0 ? 'processed' : 'unprocessed'
    }))
  );
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(INITIAL_THREATS[0] || null);
  const [generatedCOAs, setGeneratedCOAs] = useState<CourseOfAction[]>([]);
  const [isGeneratingCOAs, setIsGeneratingCOAs] = useState(false);
  const [highlightedCOA, setHighlightedCOA] = useState<CourseOfAction | null>(null);
  const [activeTab, setActiveTab] = useState<'STRATEGY' | 'FEED' | 'TERMINAL'>('STRATEGY');
  const [activeSuiteView, setActiveSuiteView] = useState<CommandSuiteView>('BATTLESPACE');
  const [currentSector, setCurrentSector] = useState<SectorConfig>(SECTORS[0]);
  const [notifications, setNotifications] = useState<TacticalNotification[]>([]);
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

  const [isBooting, setIsBooting] = useState(true);
  const [bootText, setBootText] = useState("INITIALIZING C4ISR COMMAND MESH...");

  // Boot sequence
  useEffect(() => {
    const sequence = [
      { text: "ESTABLISHING SECURE KDF COMMAND LINK...", delay: 400 },
      { text: "CALIBRATING TOPOGRAPHIC SENSORS (KENYA AO)...", delay: 800 },
      { text: "SYNCING KENSAT-1 SAR & ORBITAL SATELLITE TELEMETRY...", delay: 1200 },
      { text: "CONNECTING MAVLINK 2.0 & STANAG 4586 SWARM PROTOCOLS...", delay: 1600 },
      { text: "CALIBRATING RED SEA & INDIAN OCEAN DETERRENCE MATRIX...", delay: 2000 }
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < sequence.length) {
        setBootText(sequence[index].text);
        index++;
      } else {
        clearInterval(interval);
        setBootText("PROJECT S.T.A.R. OPERATIONAL.");
        setTimeout(() => {
          setIsBooting(false);
          playTacticalSound('radar-ping', soundMuted);
          speakTacticalReadout("Project S.T.A.R. sovereign command online.", !soundMuted);
        }, 300);
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  // Periodic intel feed simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setIntelReports(prev => {
        const nextIndex = Math.floor(Math.random() * SIMULATED_INTEL_FEED.length);
        const data = SIMULATED_INTEL_FEED[nextIndex];
        const newReport: IntelReport = {
          ...data,
          id: `intel-${Date.now()}`,
          timestamp: new Date().toTimeString().substring(0, 8) + ' Z',
          status: 'unprocessed'
        };
        return [newReport, ...prev.slice(0, 24)];
      });
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  // Asset patrol subtle drift simulation
  useEffect(() => {
    const movementInterval = setInterval(() => {
      setAssets(prevAssets => prevAssets.map(asset => {
        if (asset.type === 'Air Base' || asset.type === 'Satellite Constellation') return asset;
        const drift = asset.type === 'Naval Patrol' ? 0.003 : 0.0015;
        const latDelta = (Math.random() - 0.5) * drift;
        const lonDelta = (Math.random() - 0.5) * drift;
        return {
          ...asset,
          location: [asset.location[0] + lonDelta, asset.location[1] + latDelta] as [number, number]
        };
      }));
    }, 1500);
    return () => clearInterval(movementInterval);
  }, []);

  const addThreat = (newThreat: Omit<Threat, 'id'>) => {
    const threatWithId: Threat = { ...newThreat, id: `threat-${Date.now()}` };
    setThreats(prev => [threatWithId, ...prev]);
    setSelectedThreat(threatWithId);

    const newNotif: TacticalNotification = {
      id: `notif-${Date.now()}`,
      message: `${threatWithId.type.toUpperCase()}: ${threatWithId.title || threatWithId.description}`,
      type: threatWithId.type === 'Confirmed' ? 'CRITICAL' : 'WARNING',
      sectorName: currentSector.name,
      timestamp: new Date().toTimeString().substring(0, 5)
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 5));
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
    }, 7000);
  };

  const handleNeutralizeThreat = (threatId: string) => {
    setThreats(prev => prev.map(t => t.id === threatId ? { ...t, type: 'Neutralized' } : t));
    const t = threats.find(x => x.id === threatId);
    if (t) {
      setSelectedThreat({ ...t, type: 'Neutralized' });
    }
    const notif: TacticalNotification = {
      id: `notif-neut-${Date.now()}`,
      message: `THREAT NEUTRALIZED: Hostile target successfully contained.`,
      type: 'SUCCESS',
      sectorName: currentSector.name,
      timestamp: new Date().toTimeString().substring(0, 5)
    };
    setNotifications(prev => [notif, ...prev].slice(0, 5));
  };

  const handleDropWaypoint = (location: [number, number]) => {
    addThreat({
      type: 'Potential',
      location,
      title: 'Manual Recon Waypoint',
      description: `Targeting radar ping designated by Commander at coordinates [${location[0].toFixed(3)}, ${location[1].toFixed(3)}].`,
      detectedAt: 'JUST NOW',
      priority: 'HIGH',
      source: 'COMMAND C2 RADAR',
      sectorId: currentSector.id
    });
  };

  const handleRunScenario = (scenario: DemoScenario) => {
    const targetSector = SECTORS.find(s => s.id === scenario.sectorId) || SECTORS[0];
    setCurrentSector(targetSector);
    addThreat(scenario.threatData);
    setActiveSuiteView('BATTLESPACE');
    setActiveTab('STRATEGY');
    playTacticalSound('alert-critical', soundMuted);
    speakTacticalReadout(`Executing scenario: ${scenario.title}.`, !soundMuted);
  };

  const updateIntelReport = (id: string, analysis: string, status: IntelReport['status']) => {
    setIntelReports(prev =>
      prev.map(report =>
        report.id === id ? { ...report, analysis, status } : report
      )
    );
  };

  const activeThreats = threats.filter(t => t.type !== 'Neutralized');
  const overallThreatLevel = activeThreats.reduce((acc, t) => {
    if (t.type === 'Confirmed') return acc + 30;
    if (t.type === 'Potential') return acc + 15;
    return acc;
  }, 10);

  if (isBooting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#020617] text-cyan-400 font-mono flex-col relative overflow-hidden select-none p-4 text-center">
        <div className="crt-overlay"></div>
        <div className="vignette"></div>
        <div className="text-3xl sm:text-4xl md:text-6xl font-black mb-3 tracking-[0.2em] sm:tracking-[0.25em] animate-pulse text-white">
          PROJECT S.T.A.R.
        </div>
        <div className="text-[10px] sm:text-xs md:text-sm tracking-[0.2em] uppercase text-cyan-400/80 mb-6">
          AXIOM C4ISR COMMAND SUITE // KENYA DEFENCE FORCES
        </div>
        <div className="text-[11px] sm:text-xs border-t border-b border-cyan-500/30 py-2 px-4 sm:px-8 mb-6 font-mono text-cyan-300 max-w-md">
          {bootText}
        </div>
        <div className="w-64 sm:w-80 h-1 bg-slate-900 overflow-hidden rounded-full border border-cyan-500/30">
          <div className="h-full bg-cyan-400 animate-pulse" style={{ width: '100%' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen lg:h-screen bg-[#020617] overflow-y-auto lg:overflow-hidden relative select-none">
      <div className="crt-overlay pointer-events-none"></div>
      <div className="vignette pointer-events-none"></div>

      {/* Floating Tactical Alert Banner Notifications */}
      <div className="fixed sm:absolute top-16 right-2 sm:right-4 z-[210] flex flex-col space-y-2 pointer-events-none w-72 sm:w-80 max-w-[calc(100%-1rem)]">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={`p-2.5 sm:p-3 rounded-lg border-l-4 shadow-2xl backdrop-blur-xl animate-fade-in transition-all ${
              notif.type === 'CRITICAL'
                ? 'bg-red-950/90 border-red-500 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                : notif.type === 'SUCCESS'
                ? 'bg-green-950/90 border-green-500 text-green-200'
                : 'bg-amber-950/90 border-amber-500 text-amber-200'
            }`}
          >
            <div className="flex justify-between items-start mb-0.5">
              <span className="text-[8px] sm:text-[9px] font-black tracking-widest uppercase opacity-80">
                {notif.type}
              </span>
              <span className="text-[7px] sm:text-[8px] font-mono opacity-60">{notif.timestamp} Z</span>
            </div>
            <p className="text-[11px] sm:text-xs font-bold leading-tight">{notif.message}</p>
            <div className="mt-1 text-[7px] sm:text-[8px] font-mono opacity-70">SECTOR: {notif.sectorName}</div>
          </div>
        ))}
      </div>

      {/* Main Top Header */}
      <Header
        currentSector={currentSector}
        onSectorChange={setCurrentSector}
        activeThreatsCount={activeThreats.length}
        assetsCount={assets.length}
        onOpenBriefing={() => setIsBriefingOpen(true)}
        soundMuted={soundMuted}
        setSoundMuted={setSoundMuted}
        activeSuiteView={activeSuiteView}
        onSelectSuiteView={setActiveSuiteView}
      />

      {/* Active Command Suite View Container */}
      <div className="flex-grow p-2 sm:p-3 min-h-0 relative z-10 overflow-y-auto lg:overflow-hidden">
        
        {/* VIEW 1: MAIN BATTLESPACE GRID */}
        {activeSuiteView === 'BATTLESPACE' && (
          <main className="w-full h-auto lg:h-full flex flex-col lg:grid lg:grid-cols-12 lg:grid-rows-12 gap-2.5 sm:gap-3 min-h-0">
            
            {/* Main D3 Map (Top Left / Center) */}
            <div className="w-full h-[360px] sm:h-[440px] lg:h-auto lg:col-span-8 lg:row-span-7 rounded-xl bg-slate-950/60 border border-cyan-500/30 glow-border relative overflow-hidden group">
              <ThreatMap
                threats={threats}
                assets={assets}
                onSelectThreat={setSelectedThreat}
                selectedThreat={selectedThreat}
                highlightedCOA={highlightedCOA}
                currentSector={currentSector}
                onSectorChange={setCurrentSector}
                onNeutralizeThreat={handleNeutralizeThreat}
                onDropWaypoint={handleDropWaypoint}
                soundMuted={soundMuted}
              />
            </div>

            {/* Threat Level Gauge (Top Right Top) */}
            <div className="w-full h-[180px] sm:h-[200px] lg:h-auto lg:col-span-4 lg:row-span-3 rounded-xl bg-slate-950/70 border border-cyan-500/30 p-3 flex flex-col glow-border relative overflow-hidden">
              <h2 className="text-[9px] sm:text-[10px] font-black text-cyan-400 tracking-widest uppercase absolute top-3 left-3 z-10">
                STRATEGIC THREAT LEVEL
              </h2>
              <div className="flex-grow relative w-full h-full flex items-center justify-center">
                <ThreatLevelGauge value={Math.min(100, overallThreatLevel)} />
              </div>
            </div>

            {/* Logistics Panel (Top Right Bottom) */}
            <div className="w-full min-h-[240px] lg:min-h-0 lg:col-span-4 lg:row-span-4 rounded-xl bg-slate-950/70 border border-cyan-500/30 glow-border">
              <LogisticsPanel assets={assets} soundMuted={soundMuted} />
            </div>

            {/* Drone FLIR / Optical Recon Scanner (Bottom Left) */}
            <div className="w-full min-h-[340px] sm:min-h-[380px] lg:min-h-0 lg:col-span-4 lg:row-span-5 rounded-xl bg-slate-950/70 border border-cyan-500/30 glow-border relative overflow-hidden">
              <DroneAnalysis addThreat={addThreat} currentSector={currentSector} soundMuted={soundMuted} />
            </div>

            {/* Multi-Tab Command Center: Strategic Advisor, Intel Feed, & Terminal (Bottom Right) */}
            <div className="w-full min-h-[500px] lg:min-h-0 lg:col-span-8 lg:row-span-5 rounded-xl bg-slate-950/70 border border-cyan-500/30 flex flex-col glow-border overflow-hidden">
              {/* Tab Bar */}
              <div className="flex border-b border-cyan-500/20 bg-black/40 overflow-x-auto">
                <button
                  onClick={() => {
                    setActiveTab('STRATEGY');
                    playTacticalSound('button-click', soundMuted);
                  }}
                  className={`flex-1 min-h-[44px] py-2 px-2 text-[9px] sm:text-[10px] md:text-xs font-black tracking-wider sm:tracking-widest uppercase whitespace-nowrap transition-colors ${
                    activeTab === 'STRATEGY'
                      ? 'text-cyan-400 bg-cyan-950/30 border-b-2 border-cyan-400'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  COA ADVISOR
                </button>
                <button
                  onClick={() => {
                    setActiveTab('FEED');
                    playTacticalSound('button-click', soundMuted);
                  }}
                  className={`flex-1 min-h-[44px] py-2 px-2 text-[9px] sm:text-[10px] md:text-xs font-black tracking-wider sm:tracking-widest uppercase whitespace-nowrap transition-colors ${
                    activeTab === 'FEED'
                      ? 'text-cyan-400 bg-cyan-950/30 border-b-2 border-cyan-400'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  INTEL FEED ({intelReports.length})
                </button>
                <button
                  onClick={() => {
                    setActiveTab('TERMINAL');
                    playTacticalSound('button-click', soundMuted);
                  }}
                  className={`flex-1 min-h-[44px] py-2 px-2 text-[9px] sm:text-[10px] md:text-xs font-black tracking-wider sm:tracking-widest uppercase whitespace-nowrap transition-colors ${
                    activeTab === 'TERMINAL'
                      ? 'text-cyan-400 bg-cyan-950/30 border-b-2 border-cyan-400'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  C2 TERMINAL
                </button>
              </div>

              {/* Active Tab Panel */}
              <div className="flex-grow p-2.5 sm:p-3 min-h-0 overflow-y-auto">
                {activeTab === 'STRATEGY' ? (
                  <StrategicAdvisor
                    selectedThreat={selectedThreat}
                    assets={assets}
                    generatedCOAs={generatedCOAs}
                    setGeneratedCOAs={setGeneratedCOAs}
                    isLoading={isGeneratingCOAs}
                    setIsLoading={setIsGeneratingCOAs}
                    setHighlightedCOA={setHighlightedCOA}
                    currentSectorName={currentSector.name}
                    onExecuteCOA={(_coa) => {
                      if (selectedThreat) {
                        handleNeutralizeThreat(selectedThreat.id);
                      }
                    }}
                    soundMuted={soundMuted}
                  />
                ) : activeTab === 'FEED' ? (
                  <IntelFeed
                    reports={intelReports}
                    updateReport={updateIntelReport}
                    addThreat={addThreat}
                    soundMuted={soundMuted}
                  />
                ) : (
                  <CommandTerminal
                    assets={assets}
                    threats={threats}
                    currentSectorName={currentSector.name}
                    soundMuted={soundMuted}
                  />
                )}
              </div>
            </div>
          </main>
        )}

        {/* VIEW 2: REAL-TIME TARGET & SATELLITE VISUALIZER */}
        {activeSuiteView === 'TARGET_VISUALIZER' && (
          <div className="w-full h-auto lg:h-full">
            <RealtimeTargetVisualizer
              threats={threats}
              assets={assets}
              onAddThreat={addThreat}
              soundMuted={soundMuted}
            />
          </div>
        )}

        {/* VIEW 3: ORBITAL SATELLITE GEOINT & SAR IMINT CENTER */}
        {activeSuiteView === 'SATELLITE_GEOINT' && (
          <div className="w-full h-auto lg:h-full">
            <SatelliteIntelCenter onAddThreat={addThreat} soundMuted={soundMuted} />
          </div>
        )}

        {/* VIEW 3: UNIVERSAL DRONE SWARM & C-UAS COMMAND */}
        {activeSuiteView === 'DRONE_SWARM' && (
          <div className="w-full h-auto lg:h-full">
            <DroneSwarmCommand soundMuted={soundMuted} />
          </div>
        )}

        {/* VIEW 4: GEOPOLITICAL CRISIS & DETERRENCE WAR-GAME MATRIX */}
        {activeSuiteView === 'CRISIS_DETERRENCE' && (
          <div className="w-full h-auto lg:h-full">
            <CrisisDeterrenceMatrix soundMuted={soundMuted} />
          </div>
        )}

        {/* VIEW 5: ELECTRONIC WARFARE & SIGINT SPECTRUM MONITOR */}
        {activeSuiteView === 'ELECTRONIC_WARFARE' && (
          <div className="w-full h-auto lg:h-full">
            <ElectronicWarfareCenter soundMuted={soundMuted} />
          </div>
        )}

        {/* VIEW 6: AUTONOMOUS UAV FLIGHT MISSION PLANNER */}
        {activeSuiteView === 'FLIGHT_PLANNER' && (
          <div className="w-full h-auto lg:h-full">
            <AutonomousFlightPlanner soundMuted={soundMuted} />
          </div>
        )}

        {/* VIEW 7: AIR DEFENSE INTERCEPTOR DOME */}
        {activeSuiteView === 'AIR_DEFENSE' && (
          <div className="w-full h-auto lg:h-full">
            <AirDefenseInterceptorDome soundMuted={soundMuted} />
          </div>
        )}

        {/* VIEW 8: LINK-16 ENCRYPTED TACTICAL COMMS & DATA NET */}
        {activeSuiteView === 'TACTICAL_COMMS' && (
          <div className="w-full h-auto lg:h-full">
            <TacticalCommsNetwork soundMuted={soundMuted} />
          </div>
        )}

        {/* VIEW 9: AFTER-ACTION REVIEW & BLACKBOX REPLAY */}
        {activeSuiteView === 'AFTER_ACTION_REVIEW' && (
          <div className="w-full h-auto lg:h-full">
            <AfterActionReviewCenter soundMuted={soundMuted} />
          </div>
        )}

        {/* VIEW 10: COMBAT SUSTAINMENT & FOB LOGISTICS CENTER */}
        {activeSuiteView === 'COMBAT_LOGISTICS' && (
          <div className="w-full h-auto lg:h-full">
            <CombatLogisticsCenter soundMuted={soundMuted} />
          </div>
        )}

      </div>

      {/* Investor Briefing & Scenario Modal */}
      <InvestorBriefingModal
        isOpen={isBriefingOpen}
        onClose={() => setIsBriefingOpen(false)}
        onRunScenario={handleRunScenario}
      />
    </div>
  );
};

export default Dashboard;
