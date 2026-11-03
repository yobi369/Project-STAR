import { Asset, SectorConfig, DemoScenario, SupplyConvoy, SatellitePass, DroneSwarmUnit, CounterUasDefenseZone, CrisisDeterrenceScenario } from './types';

// Realistic Kenya Defence Forces (KDF) operational units with Protocol & Swarm capabilities
export const INITIAL_ASSETS: Asset[] = [
  { 
    id: 'asset-1', 
    callsign: 'VIPER-1 (40 Rangers)', 
    type: 'Special Forces', 
    location: [37.62, 3.15], // Northern Frontier
    status: 'Operational',
    commander: 'Maj. J. Kiprono',
    strength: '36 Operators, Tactical JLTVs, Switchblade-600 Munitions',
    fuelPercent: 92,
    munitionsPercent: 95,
    readinessScore: 98,
    protocol: 'Tactical Mesh',
    droneCount: 8,
    payload: 'Loitering Precision Munitions'
  },
  { 
    id: 'asset-2', 
    callsign: 'EAGLE BASE (Laikipia AB)', 
    type: 'Air Base', 
    location: [37.02, 0.05], // Nanyuki / Laikipia
    status: 'Operational',
    commander: 'Col. D. Ndwiga',
    strength: 'F-5E Fighter Wing, C-27J Spartans, Bayraktar TB2 Fleet',
    fuelPercent: 88,
    munitionsPercent: 90,
    readinessScore: 95,
    protocol: 'STANAG 4586',
    droneCount: 12,
    payload: 'MAM-L Laser Guided Bombs'
  },
  { 
    id: 'asset-3', 
    callsign: 'KNS JASIRI (P609)', 
    type: 'Naval Patrol', 
    location: [40.95, -2.25], // Lamu / Manda Bay
    status: 'Patrolling',
    commander: 'Lt. Cdr. A. Hassan',
    strength: 'Offshore Patrol Vessel with 76mm Oto Melara & C-UAS RF Jammer',
    fuelPercent: 78,
    munitionsPercent: 85,
    readinessScore: 91,
    protocol: 'Mil-Std-1553',
    droneCount: 4,
    payload: 'ScanEagle Maritime UAVs'
  },
  { 
    id: 'asset-4', 
    callsign: 'RHINO-BATTALION (7 KR)', 
    type: 'Infantry Unit', 
    location: [36.85, -1.28], // Nairobi / Kahawa Barracks
    status: 'Operational',
    commander: 'Lt. Col. P. Omwamba',
    strength: 'Mechanized Infantry, WZ-551 APCs, Vampire C-UAS Systems',
    fuelPercent: 95,
    munitionsPercent: 92,
    readinessScore: 96,
    protocol: 'Tactical Mesh',
    droneCount: 6,
    payload: 'Counter-Drone Electronic Jammer'
  },
  { 
    id: 'asset-5', 
    callsign: 'SHADOW-UAV SWARM (Sat-04)', 
    type: 'UAV Drone Swarm', 
    location: [39.65, 0.5], // Garissa / Wajir corridor
    status: 'Patrolling',
    commander: 'Capt. S. Wambua (UAV Control Station)',
    strength: 'ScanEagle & Autonomous AI Swarm Mesh Units',
    fuelPercent: 84,
    munitionsPercent: 100,
    readinessScore: 99,
    protocol: 'MAVLink 2.0',
    droneCount: 16,
    payload: 'EO/IR Thermal + SAR Micro-Pods'
  },
  {
    id: 'asset-6',
    callsign: 'KENSAT-1 GEOINT ARRAY',
    type: 'Satellite Constellation',
    location: [38.5, 0.0],
    status: 'Operational',
    commander: 'Kenya Space Agency / Defense Orbital Command',
    strength: 'Multi-Spectral Optical & X-Band SAR Synthetic Aperture Radar',
    fuelPercent: 99,
    munitionsPercent: 100,
    readinessScore: 100,
    protocol: 'Tactical Mesh',
    payload: 'Cloud-Penetrating 0.3m Resolution Imaging'
  }
];

export const INITIAL_THREATS = [
  {
    id: 'threat-init-1',
    type: 'Confirmed' as const,
    location: [41.52, 3.82] as [number, number], // Mandera border
    title: 'Armed Border Incursion Unit',
    description: 'Intercepted armed convoy crossing border corridor near Mandera. 3 technical vehicles with mounted heavy weaponry detected by thermal sweep.',
    detectedAt: '10 MIN AGO',
    priority: 'CRITICAL' as const,
    source: 'SIGINT / SAT-04',
    estimatedHostiles: '15 - 20 Combatants',
    recommendedAction: 'Deploy Fast Air Interdiction from Laikipia AB',
    sectorId: 'SECTOR_NORTH',
    threatCategory: 'ASYMMETRIC_GROUND' as const,
    velocityKts: 35
  },
  {
    id: 'threat-init-2',
    type: 'Potential' as const,
    location: [40.65, -2.15] as [number, number], // Lamu Archipelago
    title: 'Unregistered High-Speed Dhow',
    description: 'Radar anomalous track moving without AIS transponder toward Manda Creek mangrove channel.',
    detectedAt: '24 MIN AGO',
    priority: 'HIGH' as const,
    source: 'RADAR-LAMU',
    estimatedHostiles: 'Unverified Cargo / 6 Personnel',
    recommendedAction: 'Vector KNS Jasiri for Maritime Interception',
    sectorId: 'SECTOR_COAST',
    threatCategory: 'MARITIME_PIRACY' as const,
    velocityKts: 22
  },
  {
    id: 'threat-init-3',
    type: 'Confirmed' as const,
    location: [42.10, 4.20] as [number, number], // Horn of Africa approach
    title: 'Rogue Drone Swarm Ingress (Shahed / OWA Type)',
    description: 'Low-altitude radar cross-section anomaly detected tracking southwest at 110 knots. Emitting pulsed RF guidance frequencies.',
    detectedAt: '3 MIN AGO',
    priority: 'CRITICAL' as const,
    source: 'COASTAL EARLY WARNING / KENSAT SAR',
    estimatedHostiles: '4-6 Loitering Munitions',
    recommendedAction: 'Activate Vampire C-UAS RF Jamming & Scramble F-5E Interceptors',
    sectorId: 'SECTOR_NORTH',
    threatCategory: 'DRONE_SWARM' as const,
    velocityKts: 115,
    altitudeFt: 1800
  }
];

// Sovereign & Partner Satellite Constellations
export const SATELLITE_CONSTELLATIONS: SatellitePass[] = [
  {
    id: 'sat-kensat-1',
    name: 'KENSAT-1 (Sovereign Defense)',
    constellation: 'KENSAT Sovereign',
    orbitType: 'Sun-Synchronous',
    resolutionMeters: 0.35,
    nextPassETA: 'LIVE ORBIT (COVERING AO)',
    cloudPenetrationSAR: true,
    status: 'In Orbit',
    currentCoordinates: [38.12, 1.45],
    sensorTypes: ['Optical Multispectral', 'SAR Radar', 'Thermal IR']
  },
  {
    id: 'sat-sentinel-2',
    name: 'Sentinel-2A Multispectral',
    constellation: 'Sentinel-SAR',
    orbitType: 'LEO Polar',
    resolutionMeters: 1.2,
    nextPassETA: '14 MIN (APPROACHING)',
    cloudPenetrationSAR: true,
    status: 'Acquiring',
    currentCoordinates: [40.85, 3.20],
    sensorTypes: ['Optical Multispectral', 'SAR Radar']
  },
  {
    id: 'sat-cosmo-2',
    name: 'COSMO-SkyMed Second Gen (X-Band SAR)',
    constellation: 'COSMO-SkyMed',
    orbitType: 'LEO Polar',
    resolutionMeters: 0.25,
    nextPassETA: '28 MIN',
    cloudPenetrationSAR: true,
    status: 'Tasked',
    currentCoordinates: [36.20, -1.80],
    sensorTypes: ['SAR Radar', 'Thermal IR']
  },
  {
    id: 'sat-maxar-3',
    name: 'WorldView-3 GEOINT Recon',
    constellation: 'Maxar-3',
    orbitType: 'Sun-Synchronous',
    resolutionMeters: 0.30,
    nextPassETA: '42 MIN',
    cloudPenetrationSAR: false,
    status: 'Downlinking',
    currentCoordinates: [42.10, -0.90],
    sensorTypes: ['Optical Multispectral', 'Thermal IR']
  }
];

// Universal Heterogeneous Drone Swarm Fleet
export const INITIAL_DRONE_SWARM: DroneSwarmUnit[] = [
  {
    id: 'uav-tb2-01',
    tailNumber: 'KDF-TB2-ALPHA',
    model: 'Bayraktar TB2',
    protocol: 'STANAG 4586',
    batteryOrFuelPercent: 88,
    altitudeMeters: 5500,
    speedKts: 120,
    linkHealth: 99,
    status: 'Loitering',
    location: [38.80, 2.10]
  },
  {
    id: 'uav-scan-02',
    tailNumber: 'KDF-SCAN-BRAVO',
    model: 'ScanEagle ISR',
    protocol: 'MAVLink 2.0',
    batteryOrFuelPercent: 94,
    altitudeMeters: 3200,
    speedKts: 75,
    linkHealth: 97,
    status: 'Tracking',
    targetLock: 'TARGET-01 [MANDERA]',
    location: [41.20, 3.40]
  },
  {
    id: 'uav-fpv-03',
    tailNumber: 'KDF-FPV-STRIKE-1',
    model: 'Shadow Hawk FPV',
    protocol: 'MAVLink 2.0',
    batteryOrFuelPercent: 76,
    altitudeMeters: 450,
    speedKts: 90,
    linkHealth: 92,
    status: 'Loitering',
    location: [39.10, 0.80]
  },
  {
    id: 'uav-vamp-04',
    tailNumber: 'KDF-VAMPIRE-CUAS',
    model: 'Vampire C-UAS Interceptor',
    protocol: 'ROS2-Defense',
    batteryOrFuelPercent: 98,
    altitudeMeters: 1800,
    speedKts: 140,
    linkHealth: 100,
    status: 'Mesh Relay',
    location: [40.50, -2.10]
  },
  {
    id: 'uav-switch-05',
    tailNumber: 'KDF-SWITCH-600',
    model: 'Switchblade-600',
    protocol: 'STANAG 4586',
    batteryOrFuelPercent: 100,
    altitudeMeters: 800,
    speedKts: 110,
    linkHealth: 95,
    status: 'Loitering',
    location: [37.40, 2.90]
  }
];

// Active Counter-UAS Electronic & Kinetic Defense Zones
export const COUNTER_UAS_ZONES: CounterUasDefenseZone[] = [
  {
    id: 'zone-mombasa',
    zoneName: 'Port of Mombasa & Naval Base Mtongwe',
    centerCoordinates: [39.66, -4.05],
    radiusKm: 25,
    rfShieldActive: true,
    gpsSpoofingDetector: true,
    kineticInterceptorReady: true,
    detectedRogueFrequencies: ['2.484 GHz (Analog FPV)', '5.812 GHz (Video Link)'],
    interceptionsLogged: 4
  },
  {
    id: 'zone-nanyuki',
    zoneName: 'Laikipia Air Base & Mt. Kenya Grid',
    centerCoordinates: [37.02, 0.05],
    radiusKm: 35,
    rfShieldActive: true,
    gpsSpoofingDetector: true,
    kineticInterceptorReady: true,
    detectedRogueFrequencies: [],
    interceptionsLogged: 1
  },
  {
    id: 'zone-mandera',
    zoneName: 'Northern Frontier Forward Intercept Shield',
    centerCoordinates: [41.86, 3.93],
    radiusKm: 40,
    rfShieldActive: true,
    gpsSpoofingDetector: true,
    kineticInterceptorReady: true,
    detectedRogueFrequencies: ['868 MHz (Long-Range Telemetry)', '915 MHz (Crossfire)'],
    interceptionsLogged: 9
  },
  {
    id: 'zone-lamu',
    zoneName: 'Lamu LAPSSET Port & Manda Bay Forward Base',
    centerCoordinates: [40.90, -2.27],
    radiusKm: 30,
    rfShieldActive: true,
    gpsSpoofingDetector: true,
    kineticInterceptorReady: true,
    detectedRogueFrequencies: [],
    interceptionsLogged: 2
  }
];

// Real-world Geopolitical Crisis & Strategic Deterrence Scenarios
export const CRISIS_SCENARIOS: CrisisDeterrenceScenario[] = [
  {
    id: 'crisis-red-sea',
    title: 'Red Sea / Gulf of Aden Maritime Chokepoint Escalation',
    region: 'Horn of Africa, Bab-el-Mandeb & Western Indian Ocean',
    tensionsLevel: 'CRITICAL ESCALATION',
    involvedFactions: ['United States Navy (5th Fleet)', 'Iranian-Backed Regional Proxies', 'Kenya Navy (Task Force 151)', 'International Commercial Shipping'],
    threatDescription: 'Surge in ballistic anti-ship missiles and one-way attack (OWA) drone barrages targeting global energy and container ships in the Bab-el-Mandeb strait, threatening East African fuel imports and Port of Mombasa logistics.',
    strategicSignificance: 'Kenya serves as the vital maritime anchor for East Africa. 85% of regional oil and dry goods transit this chokepoint. Deterrence and real-time early warning prevent catastrophic economic shock.',
    recommendedDoctrine: 'Active Layered C-UAS Defense + Joint Maritime Patrol with KNS Jasiri + Orbital SAR Radar Chokepoint Tracking',
    earlyWarningTimeline: [
      { time: 'T-45m', event: 'KENSAT-1 SAR detects anomalous launcher deployment on regional coastline.', status: 'Mitigated' },
      { time: 'T-20m', event: 'SIGINT triangulates encrypted missile radar fire-control lock.', status: 'Active' },
      { time: 'T-05m', event: 'Early warning alert dispatched to commercial shipping convoys.', status: 'Active' }
    ],
    kenyaPosture: 'DEFCON 2 // Heightened Maritime Air & Surface Defense'
  },
  {
    id: 'crisis-asymmetric-drone-swarm',
    title: 'Asymmetric Drone Swarm & Ballistic Infrastructure Threat',
    region: 'Northern Frontier & Regional Energy Corridors',
    tensionsLevel: 'HEIGHTENED DANGER',
    involvedFactions: ['Hostile Asymmetric Paramilitaries', 'Kenya Defence Forces Quick Reaction Wing', 'Air Defense Command'],
    threatDescription: 'Coordinated low-altitude kamikaze drone swarm designed to overwhelm conventional air defense and strike oil pipelines and high-voltage grid substations.',
    strategicSignificance: 'Modern conflicts (like Ukraine, Middle East, and Red Sea) prove that cheap commercial and military loitering munitions can paralyze state infrastructure if not countered with AI mesh direction.',
    recommendedDoctrine: 'Multi-Spectral RF Direction Finding + Microwave Jamming Dome + Vampire Interceptor Drone Scramble',
    earlyWarningTimeline: [
      { time: 'T-30m', event: 'Acoustic & RF sensors detect 6 low-RCS incoming tracks at 120 knots.', status: 'Active' },
      { time: 'T-15m', event: 'C-UAS electronic shield engages, cutting command links.', status: 'Monitoring' },
      { time: 'T-02m', event: 'Kinetic intercept of terminal stage loitering munitions.', status: 'Active' }
    ],
    kenyaPosture: 'INTERCEPT READY // RF Shield Engaged 100%'
  },
  {
    id: 'crisis-subsea-cables',
    title: 'Subsea Fiber Cable & Strategic Chokepoint Sabotage',
    region: 'Indian Ocean EEZ Shelf (Mombasa Landing Stations)',
    tensionsLevel: 'DETERRENCE ACTIVE',
    involvedFactions: ['Unflagged Sub-surface Vessels', 'Kenya Navy Special Boat Squadron (SBS)', 'Kenya Space Agency'],
    threatDescription: 'Unidentified underwater autonomous submersibles operating near high-capacity subsea telecommunication fiber cables connecting Africa to Europe and Asia.',
    strategicSignificance: 'Over $120B in regional financial transactions depend on these 5 undersea fiber cable landings in Mombasa. Protection is a critical national security imperative.',
    recommendedDoctrine: 'Bathymetric Acoustic Sonar Sweep + ScanEagle Maritime Thermal Tracking + Navy Interceptor Fast Craft',
    earlyWarningTimeline: [
      { time: 'T-60m', event: 'Subsea hydrophone array registers anomalous cavitation signature.', status: 'Mitigated' },
      { time: 'T-10m', event: 'KNS Jasiri establishes 10nm naval exclusionary safety perimeter.', status: 'Active' }
    ],
    kenyaPosture: 'ACTIVE PATROL // Undersea Sensor Grid Green'
  }
];

// Rich intelligence feed items
export const SIMULATED_INTEL_FEED = [
  { 
    source: "GEOINT" as const, 
    content: "KENSAT-1 orbital SAR pass detects newly constructed revetments and concealed vehicle tracks 18km inside border corridor.",
    classification: "TOP SECRET // NOFORN" as const,
    priority: "CRITICAL" as const
  },
  { 
    source: "SIGINT" as const, 
    content: "Anomalous high-frequency encrypted drone telemetry bursts triangulated on 868MHz along the Mandera-Wajir frontier.",
    classification: "TOP SECRET // NOFORN" as const,
    priority: "CRITICAL" as const
  },
  { 
    source: "HUMINT" as const, 
    content: "Local field intelligence reports illicit arms and drone assembly components moved into temporary depot near Garissa.",
    classification: "SECRET" as const,
    priority: "HIGH" as const
  },
  { 
    source: "IMINT" as const, 
    content: "Maxar WorldView-3 high-resolution 0.3m optical imagery verifies 4 motorized technicals with mounted anti-aircraft guns.",
    classification: "SECRET" as const,
    priority: "HIGH" as const
  },
  { 
    source: "CYBER" as const, 
    content: "Counter-UAS Sensor Network logged 14 GPS spoofing attempts in the Northern Sector; automated anti-spoofing filter activated.",
    classification: "SECRET" as const,
    priority: "HIGH" as const
  },
  { 
    source: "OSINT" as const, 
    content: "Regional maritime tracking monitors unflagged cargo vessel hovering outside Kenya EEZ waters near Kiunga.",
    classification: "UNCLASSIFIED" as const,
    priority: "ROUTINE" as const
  }
];

export const SECTORS: SectorConfig[] = [
  {
    id: 'KENYA_ALL',
    name: 'NATIONAL COMMAND (ALL)',
    code: 'HQ-KEN-01',
    mapCenter: [37.9062, 0.0236],
    mapScale: 2800,
    environment: "Diverse terrain spanning arid plains, central highlands, coastal maritime zones, and Rift Valley escarpments.",
    coordinates: { lat: 0.0236, lon: 37.9062 },
    description: "Integrated Multi-Domain Joint Command over all 47 counties, coastal EEZ, orbital satellite tracks, and sovereign airspace."
  },
  {
    id: 'SECTOR_NORTH',
    name: 'NORTHERN FRONTIER COMMAND',
    code: 'NFC-AO-02',
    mapCenter: [38.2, 3.1], 
    mapScale: 4600,
    environment: "Arid desert terrain, flat acacia savannah, extreme temperature gradients, dust storms, long frontier borders.",
    coordinates: { lat: 3.1000, lon: 38.2000 },
    description: "Forward operating sector covering Mandera, Wajir, Garissa, Marsabit, and Turkana border corridors."
  },
  {
    id: 'SECTOR_COAST',
    name: 'COASTAL MARITIME SECTOR',
    code: 'CMS-AO-03',
    mapCenter: [40.2, -2.8],
    mapScale: 4800,
    environment: "Indian Ocean coastal shelf, mangrove tidal channels, Lamu archipelago, deepwater shipping lanes, Port of Mombasa.",
    coordinates: { lat: -2.8000, lon: 40.2000 },
    description: "Kenya Navy & Joint Maritime Task Force safeguarding 200nm Exclusive Economic Zone (EEZ) and LAPSSET corridor."
  },
  {
    id: 'SECTOR_CENTRAL',
    name: 'CENTRAL HIGHLANDS SECTOR',
    code: 'CHS-AO-04',
    mapCenter: [37.1, -0.6],
    mapScale: 5600,
    environment: "Dense montane forests, Mt. Kenya peaks, agricultural plateaus, critical telecommunication relays, urban centers.",
    coordinates: { lat: -0.6000, lon: 37.1000 },
    description: "Air defense command umbrella, strategic government installations, and logistics transportation hubs."
  }
];

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'scenario-1',
    title: 'Northern Frontier Hostile Incursion',
    sectorId: 'SECTOR_NORTH',
    sectorName: 'Northern Frontier Command',
    description: 'Radar and drone thermal telemetry detect a 4-vehicle technical column infiltrating across northern border towards El Wak.',
    threatData: {
      type: 'Confirmed',
      location: [41.25, 2.95],
      title: 'Armed Technical Column Infiltration',
      description: 'Hostile motorized unit with heavy machine guns detected moving south along dry riverbed wadi.',
      detectedAt: 'JUST NOW',
      priority: 'CRITICAL',
      source: 'DRONE FLIR / SAT-04',
      estimatedHostiles: '20 - 25 Hostiles with anti-materiel rifles',
      recommendedAction: 'Scramble Air Support & 40 Rangers Rapid Reaction Team',
      sectorId: 'SECTOR_NORTH',
      threatCategory: 'ASYMMETRIC_GROUND'
    },
    intelReport: 'CRITICAL SIGINT: Intercepted VHF radio orders instruct hostile convoy to avoid tarmac roads and push toward supply depot near El Wak.',
    recommendedCOAType: 'Kinetic Air & SF Strike',
    badgeColor: 'border-red-500 bg-red-500/10 text-red-400'
  },
  {
    id: 'scenario-2',
    title: 'Lamu Maritime Piracy & Contraband Intercept',
    sectorId: 'SECTOR_COAST',
    sectorName: 'Coastal Maritime Sector',
    description: 'Suspicious unmarked fast-craft observed rendezvous with offshore mothership 12nm off Manda Bay.',
    threatData: {
      type: 'Confirmed',
      location: [40.98, -2.45],
      title: 'Offshore Smuggling & Piracy Flotilla',
      description: 'High-speed twin-engine skiff attempting covert offload into Kiunga mangrove inlet.',
      detectedAt: 'JUST NOW',
      priority: 'HIGH',
      source: 'COASTAL RADAR / KNS JASIRI',
      estimatedHostiles: '8 - 12 Armed Crew with illicit cargo',
      recommendedAction: 'Dispatch Fast Attack Craft & Naval Special Ops (SBS)',
      sectorId: 'SECTOR_COAST',
      threatCategory: 'MARITIME_PIRACY'
    },
    intelReport: 'IMINT FLASH: Satellite infrared captures night-time cargo transfer between unflagged dhow and speedboats off Lamu coast.',
    recommendedCOAType: 'Naval Cordon & Boarding Action',
    badgeColor: 'border-amber-500 bg-amber-500/10 text-amber-400'
  },
  {
    id: 'scenario-3',
    title: 'Global Geopolitical Chokepoint & Anti-Drone Shield',
    sectorId: 'SECTOR_COAST',
    sectorName: 'Coastal Maritime & Horn of Africa',
    description: 'Real-world simulation: Red Sea / Gulf of Aden crisis ripple effect. Multiple hostile one-way attack drones detected targeting Indian Ocean shipping corridor.',
    threatData: {
      type: 'Confirmed',
      location: [41.80, -1.95],
      title: 'Hostile Loitering Drone Swarm Ingress',
      description: 'Inbound autonomous drone swarm detected via KENSAT SAR and coastal radar. Active RF link spoofing detected.',
      detectedAt: 'JUST NOW',
      priority: 'CRITICAL',
      source: 'KENSAT-1 SAR / C-UAS RADAR',
      estimatedHostiles: '4-6 Autonomous Drone Ingress',
      recommendedAction: 'Activate Mombasa C-UAS Electronic Dome & Launch Vampire Interceptors',
      sectorId: 'SECTOR_COAST',
      threatCategory: 'DRONE_SWARM'
    },
    intelReport: 'GEOINT SATELLITE ALERT: KENSAT-1 SAR confirms 4 low-altitude drone signatures maneuvering 35nm off coast.',
    recommendedCOAType: 'C-UAS Electronic Shield & Kinetic Intercept',
    badgeColor: 'border-purple-500 bg-purple-500/10 text-purple-400'
  }
];

export const SUPPLY_CONVOYS: SupplyConvoy[] = [
  {
    id: 'convoy-1',
    route: 'Nairobi HQ -> FOB Wajir',
    origin: 'Kahawa Garrison',
    destination: 'FOB Wajir Northern Base',
    progress: 68,
    eta: '02h 40m',
    cargo: '15,000L JP-8 Aviation Fuel, 5.56mm Munitions & C-UAS Batteries',
    status: 'In Transit'
  },
  {
    id: 'convoy-2',
    route: 'Mombasa Port -> Manda Base Lamu',
    origin: 'Kenya Navy HQ Mtongwe',
    destination: 'Manda Bay Maritime Outpost',
    progress: 42,
    eta: '04h 15m',
    cargo: 'Naval Radar Spares, Anti-Drone RF Antennas, Medical Packs',
    status: 'In Transit'
  },
  {
    id: 'convoy-3',
    route: 'Laikipia AB -> Mandera Airfield',
    origin: 'Eagle Base Nanyuki',
    destination: 'Mandera Forward Airfield',
    progress: 89,
    eta: '00h 35m',
    cargo: 'MAM-L Precision Guided Munitions & Drone Swarm Batteries',
    status: 'In Transit'
  }
];

export const SECTOR_SCENARIOS: Record<string, string[]> = {
  'KENYA_ALL': [
    "High-altitude drone surveillance of multi-agency roadblock on the A104 corridor.",
    "KDF motorized logistics convoy crossing Tana River bridge under aerial watch.",
    "Tactical reconnaissance of remote Rift Valley outpost with communication mast."
  ],
  'SECTOR_NORTH': [
    "Thermal FLIR scan of technical vehicles kicking up dust trail on northern border track.",
    "Low-altitude night-vision scan over concealed dry wadi encampment near Mandera.",
    "ScanEagle drone tracking thermal foot movement along the Chalbi desert boundary."
  ],
  'SECTOR_COAST': [
    "Kenya Navy RHIB boarding team approaching suspicious cargo dhow in Lamu channel.",
    "Thermal FLIR camera tracking fast speedboat navigating through mangrove tidal creek.",
    "Aerial FLIR view over Port of Lamu LAPSSET terminal with perimeter patrol."
  ],
  'SECTOR_CENTRAL': [
    "Night-vision drone hover over telecommunications tower facility near Nanyuki.",
    "Thermal scan of patrol vehicles along forested mountain road near Mt. Kenya.",
    "Rooftop sniper and surveillance team overlooking designated secure sector in Nairobi."
  ]
};

export const DRONE_SURVEILLANCE_IMAGES = [
  {
    id: 'imint-01',
    name: 'FLIR-SCAN-NORTH-01',
    location: [37.62, 3.15] as [number, number],
    prompt: 'Northern Frontier Tactical Drone Reconnaissance',
    imageDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    capturedAt: '02 MIN AGO',
    thermalSignature: 'HOT'
  }
];

// Simplified TopoJSON for Kenya's borders
export const KENYA_TOPOJSON: any = {
  "type": "Topology",
  "transform": {
    "scale": [0.008408408408408409, 0.0088988988988989],
    "translate": [33.9, -4.7]
  },
  "objects": {
    "kenya": {
      "type": "GeometryCollection",
      "geometries": [{
        "type": "Polygon",
        "arcs": [[0]],
        "properties": { "name": "Kenya" }
      }]
    }
  },
  "arcs": [
    [[497, 1000], [214, -4], [40, -56], [-8, -135], [-76, -114], [-24, -137], [-105, -130], [-106, -91], [-130, -111], [-178, -107], [-100, -115], [2, 114], [103, 103], [-3, 137], [-85, 126], [-138, 16], [-131, 100], [-39, 138], [33, 133], [116, 122], [146, 52], [139, 4], [25, -94], [115, -101], [152, -34], [130, -50], [92, 0]]
  ]
};
