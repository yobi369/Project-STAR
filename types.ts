export type ThreatStatus = 'Potential' | 'Confirmed' | 'Neutralized';
export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'ROUTINE';
export type AssetCategory = 'Air Base' | 'Infantry Unit' | 'Naval Patrol' | 'Special Forces' | 'UAV Drone Swarm' | 'Satellite Constellation' | 'Counter-UAS Battery';

export interface IntelReport {
  id: string;
  timestamp: string;
  source: 'HUMINT' | 'SIGINT' | 'IMINT' | 'OSINT' | 'CYBER' | 'LOCAL-LE' | 'GEOINT';
  content: string;
  analysis?: string;
  classification?: 'TOP SECRET // NOFORN' | 'SECRET' | 'RESTRICTED' | 'UNCLASSIFIED';
  priority?: PriorityLevel;
  status: 'unprocessed' | 'analyzing' | 'processed' | 'error';
  extractedLocation?: [number, number];
}

export interface Threat {
  id: string;
  type: ThreatStatus;
  location: [number, number]; // [lon, lat]
  title?: string;
  description: string;
  detectedAt?: string;
  priority?: PriorityLevel;
  source?: string;
  estimatedHostiles?: string;
  recommendedAction?: string;
  sectorId?: string;
  trajectory?: [number, number][];
  velocityKts?: number;
  altitudeFt?: number;
  threatCategory?: 'BALLISTIC' | 'DRONE_SWARM' | 'MARITIME_PIRACY' | 'ASYMMETRIC_GROUND' | 'ELECTRONIC_JAMMING';
}

export interface Asset {
  id: string;
  callsign: string;
  type: AssetCategory;
  location: [number, number]; // [lon, lat]
  status: 'Operational' | 'Standby' | 'Engaged' | 'Patrolling' | 'Refueling';
  commander?: string;
  strength?: string;
  fuelPercent: number;
  munitionsPercent: number;
  readinessScore: number;
  patrolPath?: [number, number][];
  protocol?: 'MAVLink 2.0' | 'STANAG 4586' | 'Mil-Std-1553' | 'Tactical Mesh';
  droneCount?: number;
  payload?: string;
}

export interface SatellitePass {
  id: string;
  name: string;
  constellation: 'KENSAT Sovereign' | 'Sentinel-SAR' | 'Pleiades Neo' | 'COSMO-SkyMed' | 'Maxar-3';
  orbitType: 'LEO Polar' | 'Sun-Synchronous' | 'Geostationary';
  resolutionMeters: number;
  nextPassETA: string;
  cloudPenetrationSAR: boolean;
  status: 'Acquiring' | 'In Orbit' | 'Downlinking' | 'Tasked';
  currentCoordinates: [number, number];
  sensorTypes: ('Optical Multispectral' | 'SAR Radar' | 'Thermal IR' | 'Electronic SIGINT')[];
}

export interface SatelliteChangeDetectionResult {
  targetName: string;
  coordinates: [number, number];
  previousPassDate: string;
  currentPassDate: string;
  changeConfidence: number; // 0 - 100
  analysisSummary: string;
  detectedModifications: string[];
  threatElevation: 'CRITICAL' | 'MODERATE' | 'LOW' | 'NORMAL';
  sarPenetrationUsed: boolean;
}

export interface DroneSwarmUnit {
  id: string;
  tailNumber: string;
  model: 'Bayraktar TB2' | 'ScanEagle ISR' | 'Shadow Hawk FPV' | 'Vampire C-UAS Interceptor' | 'Switchblade-600';
  protocol: 'MAVLink 2.0' | 'STANAG 4586' | 'ROS2-Defense';
  batteryOrFuelPercent: number;
  altitudeMeters: number;
  speedKts: number;
  linkHealth: number; // 0 - 100%
  status: 'Loitering' | 'Tracking' | 'Engaging' | 'Return to Base' | 'Mesh Relay';
  targetLock?: string;
  location: [number, number];
}

export interface CounterUasDefenseZone {
  id: string;
  zoneName: string;
  centerCoordinates: [number, number];
  radiusKm: number;
  rfShieldActive: boolean;
  gpsSpoofingDetector: boolean;
  kineticInterceptorReady: boolean;
  detectedRogueFrequencies: string[];
  interceptionsLogged: number;
}

export interface CrisisDeterrenceScenario {
  id: string;
  title: string;
  region: string;
  tensionsLevel: 'CRITICAL ESCALATION' | 'HEIGHTENED DANGER' | 'DETERRENCE ACTIVE';
  involvedFactions: string[];
  threatDescription: string;
  strategicSignificance: string;
  recommendedDoctrine: string;
  earlyWarningTimeline: { time: string; event: string; status: 'Active' | 'Mitigated' | 'Monitoring' }[];
  kenyaPosture: string;
}

export interface CourseOfAction {
  id: string;
  title: string;
  objective: string;
  assets: string[];
  involvedAssetIds: string[];
  risks: string;
  successProbability: number;
  phases?: string[];
  estimatedDuration?: string;
  collateralRisk?: string;
}

export interface DroneImage {
  id: string;
  name: string;
  location: [number, number];
  prompt: string;
  imageDataUrl: string;
  capturedAt?: string;
  thermalSignature?: string;
}

export interface SectorConfig {
  id: string;
  name: string;
  code: string;
  mapCenter: [number, number]; // [lon, lat]
  mapScale: number;
  environment: string;
  coordinates: { lat: number; lon: number };
  description: string;
}

export interface SupplyConvoy {
  id: string;
  route: string;
  origin: string;
  destination: string;
  progress: number; // 0 - 100
  eta: string;
  cargo: string;
  status: 'In Transit' | 'Scheduled' | 'Arrived';
}

export interface DemoScenario {
  id: string;
  title: string;
  sectorId: string;
  sectorName: string;
  description: string;
  threatData: Omit<Threat, 'id'>;
  intelReport: string;
  recommendedCOAType: string;
  badgeColor: string;
}

// 1. ELECTRONIC WARFARE & SIGINT TYPES
export interface RFEmitter {
  id: string;
  frequencyMHz: number;
  bandwidthKHz: number;
  modulation: 'FSK' | 'QPSK' | 'OFDM' | 'CW-PULSE' | 'ANALOG-FM' | 'FHSS-HOPPER';
  signalStrengthDbm: number;
  emitterType: 'Hostile Tactical Handheld' | 'Radar Emitter (S-Band)' | 'GPS Jammer (L1/L2)' | 'UAV Video Downlink (5.8GHz)' | 'Satellite Uplink (Ku-Band)';
  location: [number, number]; // [lon, lat]
  confidence: number;
  interceptedData?: string;
  threatLevel: 'CRITICAL' | 'ELEVATED' | 'MONITORING';
  triangulationBearings: { stationName: string; azimuthDeg: number }[];
  activeJammingCountermeasure?: boolean;
}

export interface SpectrumBand {
  name: string;
  rangeMHz: string;
  activityLevel: 'QUIET' | 'NORMAL' | 'CONGESTED' | 'JAMMED';
  jammingDetected: boolean;
  snrDb: number;
}

// 2. AUTONOMOUS UAV FLIGHT PLANNER TYPES
export interface FlightWaypoint {
  id: string;
  order: number;
  name: string;
  location: [number, number]; // [lon, lat]
  altitudeFt: number;
  speedKts: number;
  action: 'FLY_THROUGH' | 'LOITER_RECON' | 'SENSOR_SCAN' | 'STRIKE_RELEASE' | 'DESCENT_LAND';
  loiterMinutes?: number;
  estimatedTimeEnRouteMinutes: number;
  fuelBurnPercent: number;
}

export interface FlightPlan {
  id: string;
  callsign: string;
  droneModel: string;
  waypoints: FlightWaypoint[];
  totalDistanceKm: number;
  totalDurationMinutes: number;
  fuelMarginPercent: number;
  threatPenetrationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'Draft' | 'Approved' | 'Uploading to MAVLink' | 'Active Execution' | 'Completed';
  targetObjective: string;
}

// 3. AIR DEFENSE & MISSILE INTERCEPTOR TYPES
export interface IncomingMissileVector {
  id: string;
  threatType: 'Ballistic Missile (Qiam/Fateh)' | 'Cruise Missile (Soumar/Paveh)' | 'Loitering Suicide Drone (Shahed-136)' | 'Anti-Ship Cruise Missile (Noor/C-802)';
  originLocation: [number, number];
  currentLocation: [number, number];
  targetDestination: [number, number];
  targetName: string;
  altitudeFt: number;
  velocityMach: number;
  timeToImpactSeconds: number;
  radarCrossSectionM2: number;
  status: 'Tracking' | 'Target Locked' | 'Interception In Flight' | 'Destroyed' | 'Impacted';
  interceptionProbabilityPercent: number;
  assignedBatteryId?: string;
}

export interface AirDefenseBattery {
  id: string;
  name: string;
  type: 'Spyder-MR SAM' | 'Mistral-3 VSHORAD' | 'Naval CIWS 76mm Oto' | 'HELMA-P High-Energy Laser';
  location: [number, number];
  coverageRadiusKm: number;
  missilesReady: number;
  status: 'Active Radar' | 'Interception Fired' | 'Reloading' | 'Standby';
  radarTrackingRangeKm: number;
}

// 4. ENCRYPTED TACTICAL COMMS & DATA LINK TYPES
export interface RadioTransmission {
  id: string;
  channelId: string;
  timestamp: string;
  callsign: string;
  senderRole: 'HQ-SOVEREIGN' | 'AIR-LEAD' | 'GROUND-COMMAND' | 'NAVAL-PATROL' | 'SPECIAL-OPS';
  transcript: string;
  audioFrequencyKhz: number;
  encryptionKeyStatus: 'AES-256 GCM SECURED' | 'LINK-16 Datalink' | 'STANAG 5516';
  classification: 'TOP SECRET' | 'SECRET' | 'TACTICAL';
  isFlashPriority: boolean;
}

export interface TacticalRadioChannel {
  id: string;
  name: string;
  frequency: string;
  activeUsers: number;
  band: 'VHF Ground Tactical' | 'UHF Air Strike Net' | 'HF Blue-Water Naval' | 'Mil-SATCOM Secure';
  secureKey: string;
}

// 5. AFTER-ACTION REVIEW & MISSION BLACKBOX TYPES
export interface BlackboxLogEvent {
  id: string;
  timestampMs: number;
  timeString: string;
  category: 'DETECTION' | 'ENGAGEMENT' | 'RADAR_SCAN' | 'ORDER_ISSUED' | 'NEUTRALIZATION';
  title: string;
  description: string;
  actor: string;
  coordinates: [number, number];
  outcome: 'SUCCESS' | 'WARNING' | 'CRITICAL_ACTION';
}

export interface CombatEfficiencyMetric {
  detectionToResponseLatencySec: number;
  threatNeutralizationRatePercent: number;
  munitionEfficiencyRatio: number;
  collateralMitigationScore: number;
  oodaLoopScore: number; // 0 - 100
}

// 6. COMBAT LOGISTICS & MEDEVAC TYPES
export interface FobSupplyStatus {
  id: string;
  name: string;
  location: [number, number];
  sector: string;
  garrisonStrength: number;
  ammoSmallArmsPercent: number;
  ammoArtilleryOrMissilesPercent: number;
  aviationFuelJp8Percent: number;
  dieselGeneratorsPercent: number;
  medicalKitsPercent: number;
  waterSupplyDays: number;
  alertStatus: 'OPTIMAL' | 'RESUPPLY_NEEDED' | 'CRITICAL_SHORTAGE';
  activeThreatLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface MedevacCorridor {
  id: string;
  fobOrigin: string;
  hospitalDestination: string;
  distanceKm: number;
  flightTimeMinutes: number;
  threatExposureScore: number; // 0 (safest) - 100 (hostile)
  assignedHelicopter: string;
  status: 'Ready' | 'In Flight' | 'Patient Onboard' | 'Completed';
  routeCoordinates: [number, number][];
}

