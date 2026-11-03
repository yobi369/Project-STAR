import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Threat, Asset } from '../types.ts';
import { playTacticalSound, speakTacticalReadout } from '../utils/audioUtils.ts';

interface RealtimeTargetVisualizerProps {
  threats: Threat[];
  assets: Asset[];
  onAddThreat: (threat: Omit<Threat, 'id'>) => void;
  soundMuted?: boolean;
}

interface StrategicHotspot {
  id: string;
  name: string;
  category: 'KENYA_DEFENSE' | 'RED_SEA_CHOKEPOINT' | 'PERSIAN_GULF' | 'GLOBAL_STRATEGIC';
  lat: number;
  lng: number;
  zoom: number;
  description: string;
  tacticalRole: string;
}

const STRATEGIC_HOTSPOTS: StrategicHotspot[] = [
  {
    id: 'manda-bay',
    name: 'Manda Bay Naval Base (Camp Simba)',
    category: 'KENYA_DEFENSE',
    lat: -2.253,
    lng: 40.916,
    zoom: 15,
    description: 'Joint KDF-US Naval Base & Special Operations Airstrip at Manda Bay, Lamu archipelago.',
    tacticalRole: 'Coastal defense, anti-piracy maritime interdiction, and counter-terror airborne strike hub.'
  },
  {
    id: 'mombasa-port',
    name: 'Port of Mombasa (Kilindini Harbour)',
    category: 'KENYA_DEFENSE',
    lat: -4.055,
    lng: 39.658,
    zoom: 14,
    description: 'East Africa’s primary deepwater maritime gateway and Kenya Navy HQ at Mtongwe.',
    tacticalRole: 'Strategic economic lifeline, maritime logistics hub, and offshore patrol vessel station.'
  },
  {
    id: 'mandera-border',
    name: 'Mandera Tri-Border Fort (Kenya-Somalia-Ethiopia)',
    category: 'KENYA_DEFENSE',
    lat: 3.937,
    lng: 41.867,
    zoom: 14,
    description: 'Forward defense border zone abutting Gedo region and Dawa River border crossings.',
    tacticalRole: 'Asymmetric intrusion deterrence, border security radar post, and drone patrol staging.'
  },
  {
    id: 'nanyuki-airbase',
    name: 'Laikipia Air Base (Nanyuki)',
    category: 'KENYA_DEFENSE',
    lat: 0.054,
    lng: 37.031,
    zoom: 14,
    description: 'Kenya Air Force primary tactical fighter wing (F-5E/EM) and air defense interceptor base.',
    tacticalRole: 'National airspace sovereignty, rapid air scramble, and sovereign defense command.'
  },
  {
    id: 'lamu-port',
    name: 'Lamu Port (LAPSSET Corridor)',
    category: 'KENYA_DEFENSE',
    lat: -2.261,
    lng: 40.903,
    zoom: 14,
    description: 'Deepwater container terminal and northern strategic energy export corridor.',
    tacticalRole: 'Critical infrastructure protection and Indian Ocean blue-economy surveillance.'
  },
  {
    id: 'babelmandeb',
    name: 'Bab-el-Mandeb Strait (Red Sea Chokepoint)',
    category: 'RED_SEA_CHOKEPOINT',
    lat: 12.580,
    lng: 43.330,
    zoom: 11,
    description: 'Narrow maritime choke-point between Yemen and Djibouti connecting the Indian Ocean to the Suez Canal.',
    tacticalRole: 'Global commercial shipping bottleneck, anti-ship ballistic missile and drone strike theater.'
  },
  {
    id: 'aden-port',
    name: 'Port of Aden & Gulf of Aden Corridor',
    category: 'RED_SEA_CHOKEPOINT',
    lat: 12.785,
    lng: 45.030,
    zoom: 12,
    description: 'Historic southern Arabian port controlling merchant vessel convoys transiting to Mombasa and East Africa.',
    tacticalRole: 'International maritime coalition staging and counter-piracy transit corridor.'
  },
  {
    id: 'hormuz-strait',
    name: 'Strait of Hormuz (Persian Gulf Chokepoint)',
    category: 'PERSIAN_GULF',
    lat: 26.560,
    lng: 56.400,
    zoom: 10,
    description: 'World’s most critical oil transit chokepoint between Oman and Iran.',
    tacticalRole: 'Geopolitical flashpoint, fast attack craft operations, and ballistic missile early-warning zone.'
  },
  {
    id: 'bandar-abbas',
    name: 'Bandar Abbas Naval Base & Strait Command',
    category: 'PERSIAN_GULF',
    lat: 27.180,
    lng: 56.270,
    zoom: 13,
    description: 'Main coastal naval station overseeing surface combatants, submarines, and anti-ship missile batteries.',
    tacticalRole: 'Littoral missile projection, swarm vessel coordination, and radar electronic warfare hub.'
  }
];

export const RealtimeTargetVisualizer: React.FC<RealtimeTargetVisualizerProps> = ({
  threats,
  assets,
  onAddThreat,
  soundMuted = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{ [key: string]: L.TileLayer | L.LayerGroup }>({});
  const markerGroupRef = useRef<L.LayerGroup | null>(null);
  const rangeRingsGroupRef = useRef<L.LayerGroup | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<StrategicHotspot>(STRATEGIC_HOTSPOTS[0]);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: STRATEGIC_HOTSPOTS[0].lat,
    lng: STRATEGIC_HOTSPOTS[0].lng
  });
  const [zoomLevel, setZoomLevel] = useState<number>(STRATEGIC_HOTSPOTS[0].zoom);
  const [imageryMode, setImageryMode] = useState<'SATELLITE' | 'DARK_TACTICAL' | 'HYBRID_TOPO' | 'STREET'>('SATELLITE');
  const [flirNightVision, setFlirNightVision] = useState<boolean>(false);
  const [showRangeRings, setShowRangeRings] = useState<boolean>(true);
  const [showReticle, setShowReticle] = useState<boolean>(true);
  const [isScanningTarget, setIsScanningTarget] = useState<boolean>(false);
  const [targetAnalysis, setTargetAnalysis] = useState<{
    targetName: string;
    coordinates: string;
    mgrsGrid: string;
    terrainType: string;
    strategicValue: string;
    threatAssessment: string;
    sensorsInCoverage: string[];
    recommendedAction: string;
  } | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Map
    const map = L.map(mapContainerRef.current, {
      center: [selectedHotspot.lat, selectedHotspot.lng],
      zoom: selectedHotspot.zoom,
      zoomControl: false,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // Base Tile Layers
    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19 }
    );

    const darkTacticalLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { maxZoom: 19, subdomains: 'abcd' }
    );

    const streetLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { maxZoom: 19 }
    );

    const hybridLabelsLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19 }
    );

    const topoLayer = L.tileLayer(
      'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      { maxZoom: 17 }
    );

    layersRef.current = {
      satellite: satelliteLayer,
      dark: darkTacticalLayer,
      street: streetLayer,
      labels: hybridLabelsLayer,
      topo: topoLayer
    };

    // Default layer: Satellite + Hybrid Labels
    satelliteLayer.addTo(map);
    hybridLabelsLayer.addTo(map);

    // Groups for markers & range rings
    const markerGroup = L.layerGroup().addTo(map);
    const rangeRingsGroup = L.layerGroup().addTo(map);
    markerGroupRef.current = markerGroup;
    rangeRingsGroupRef.current = rangeRingsGroup;

    // Move & Zoom Listeners
    map.on('move', () => {
      const center = map.getCenter();
      setCurrentCoords({ lat: center.lat, lng: center.lng });
    });

    map.on('zoomend', () => {
      setZoomLevel(map.getZoom());
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      const clickedLat = e.latlng.lat;
      const clickedLng = e.latlng.lng;
      setCurrentCoords({ lat: clickedLat, lng: clickedLng });
      playTacticalSound('radar-ping', soundMuted);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when imageryMode changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layersRef.current.satellite) return;

    // Remove current base layers
    map.removeLayer(layersRef.current.satellite);
    map.removeLayer(layersRef.current.dark);
    map.removeLayer(layersRef.current.street);
    map.removeLayer(layersRef.current.topo);
    map.removeLayer(layersRef.current.labels);

    if (imageryMode === 'SATELLITE') {
      layersRef.current.satellite.addTo(map);
      layersRef.current.labels.addTo(map);
    } else if (imageryMode === 'DARK_TACTICAL') {
      layersRef.current.dark.addTo(map);
    } else if (imageryMode === 'HYBRID_TOPO') {
      layersRef.current.topo.addTo(map);
    } else if (imageryMode === 'STREET') {
      layersRef.current.street.addTo(map);
    }
  }, [imageryMode]);

  // Redraw Range Rings & Markers when position or state changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !rangeRingsGroupRef.current || !markerGroupRef.current) return;

    rangeRingsGroupRef.current.clearLayers();
    markerGroupRef.current.clearLayers();

    // 1. Draw Range Rings if enabled
    if (showRangeRings) {
      const rings = [
        { radius: 5000, color: '#00f2ff', label: '5 KM - IMMEDIATE C-UAS PERIMETER' },
        { radius: 15000, color: '#38bdf8', label: '15 KM - ARTILLERY & RADAR HORIZON' },
        { radius: 35000, color: '#818cf8', label: '35 KM - BVLOS DRONE SWARM PATROL' },
        { radius: 70000, color: '#c084fc', label: '70 KM - LONG-RANGE AIR DEFENSE UMBRELLA' }
      ];

      rings.forEach(ring => {
        const circle = L.circle([currentCoords.lat, currentCoords.lng], {
          radius: ring.radius,
          color: ring.color,
          weight: 1.2,
          opacity: 0.7,
          fillColor: ring.color,
          fillOpacity: 0.03,
          dashArray: '4, 6'
        });
        rangeRingsGroupRef.current?.addLayer(circle);
      });
    }

    // 2. Plot KDF Assets
    assets.forEach(asset => {
      const iconHtml = `
        <div style="
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(0, 242, 255, 0.2);
          border: 2px solid #00f2ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: monospace;
          font-size: 10px;
          font-weight: 900;
          color: #ffffff;
          box-shadow: 0 0 10px rgba(0, 242, 255, 0.6);
        ">
          KDF
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'kdf-asset-icon',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([asset.location[1], asset.location[0]], { icon: customIcon });
      marker.bindPopup(`
        <div style="font-family: monospace; font-size: 11px; background: #020617; color: #fff; padding: 6px; border: 1px solid #00f2ff; border-radius: 4px;">
          <strong style="color: #00f2ff;">${asset.callsign}</strong><br/>
          Type: ${asset.type}<br/>
          Status: ${asset.status}<br/>
          Readiness: ${asset.readinessScore}%
        </div>
      `);
      markerGroupRef.current?.addLayer(marker);
    });

    // 3. Plot Active Threats
    threats.filter(t => t.type !== 'Neutralized').forEach(threat => {
      const isConfirmed = threat.type === 'Confirmed';
      const color = isConfirmed ? '#ef4444' : '#f59e0b';
      const iconHtml = `
        <div style="
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${color}33;
          border: 2px solid ${color};
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: monospace;
          font-size: 10px;
          font-weight: 900;
          color: #ffffff;
          box-shadow: 0 0 12px ${color};
          animation: pulse 1.5s infinite;
        ">
          !
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'threat-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([threat.location[1], threat.location[0]], { icon: customIcon });
      marker.bindPopup(`
        <div style="font-family: monospace; font-size: 11px; background: #020617; color: #fff; padding: 6px; border: 1px solid ${color}; border-radius: 4px;">
          <strong style="color: ${color};">${threat.type} INTRUSION</strong><br/>
          ${threat.title || threat.description}
        </div>
      `);
      markerGroupRef.current?.addLayer(marker);
    });

  }, [currentCoords, showRangeRings, assets, threats]);

  // Fly to selected hotspot
  const handleSelectHotspot = (hotspot: StrategicHotspot) => {
    setSelectedHotspot(hotspot);
    setCurrentCoords({ lat: hotspot.lat, lng: hotspot.lng });
    setZoomLevel(hotspot.zoom);
    playTacticalSound('button-click', soundMuted);
    speakTacticalReadout(`Navigating to ${hotspot.name}.`, !soundMuted);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([hotspot.lat, hotspot.lng], hotspot.zoom, {
        duration: 1.5
      });
    }
  };

  // Place Search & Geocoding
  const handleSearchPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    playTacticalSound('radar-ping', soundMuted);

    try {
      // Check if coordinates format: e.g. "-4.05, 39.65" or "12.58 43.33"
      const coordMatch = searchQuery.match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/);
      if (coordMatch) {
        const parsedLat = parseFloat(coordMatch[1]);
        const parsedLng = parseFloat(coordMatch[3]);
        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
          setCurrentCoords({ lat: parsedLat, lng: parsedLng });
          mapInstanceRef.current?.flyTo([parsedLat, parsedLng], 15, { duration: 1.5 });
          speakTacticalReadout(`Locked on coordinates ${parsedLat.toFixed(3)} by ${parsedLng.toFixed(3)}.`, !soundMuted);
          setIsSearching(false);
          return;
        }
      }

      // Check matched strategic hotspot name
      const foundPreset = STRATEGIC_HOTSPOTS.find(h =>
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (foundPreset) {
        handleSelectHotspot(foundPreset);
        setIsSearching(false);
        return;
      }

      // Live OpenStreetMap Nominatim Geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setCurrentCoords({ lat, lng });
        mapInstanceRef.current?.flyTo([lat, lng], 14, { duration: 1.5 });
        speakTacticalReadout(`Target place located: ${data[0].display_name.split(',')[0]}.`, !soundMuted);
        playTacticalSound('alert-critical', soundMuted);
      } else {
        alert("Target location not found. Try entering place name (e.g. 'Mombasa', 'Bab-el-Mandeb', 'Tehran') or decimal coordinates.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  // AI Target Area Recon Scan
  const handleExecuteTargetScan = () => {
    setIsScanningTarget(true);
    playTacticalSound('radar-ping', soundMuted);

    setTimeout(() => {
      const lat = currentCoords.lat;
      const lng = currentCoords.lng;

      // Approximate MGRS calculation
      const zoneNum = Math.floor((lng + 180) / 6) + 1;
      const mgrs = `${zoneNum}N ${(Math.abs(lng * 1000) % 100000).toFixed(0)} ${(Math.abs(lat * 1000) % 100000).toFixed(0)}`;

      const isMaritime = (lat < 15 && lat > -6 && lng > 39 && lng < 60);
      const isNorthernBorder = (lat > 2.0 && lng > 38 && lng < 42);

      setTargetAnalysis({
        targetName: selectedHotspot.lat.toFixed(2) === lat.toFixed(2) ? selectedHotspot.name : `TARGET AO [${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E]`,
        coordinates: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
        mgrsGrid: mgrs,
        terrainType: isMaritime ? "Littoral Waterway / Coastal Shelf" : isNorthernBorder ? "Arid Scrubland / Low Elevation Desert Plateau" : "Savannah / Urban Transition Basin",
        strategicValue: isMaritime 
          ? "High Chokepoint Density // International Sea Lane Vulnerability" 
          : "Forward Border Buffer // High Mobility Ground Corridor",
        threatAssessment: "RADAR ELEVATION: Moderate Asymmetric Risk. Potential Low-Radar Cross Section UCAV or fast maritime skiff transit.",
        sensorsInCoverage: ["KENSAT-1 SAR (Orbital Pass)", "Manda Bay Coastal Hydrophone", "Bayraktar TB2 MAVLink Relay", "STANAG 4586 C-UAS Dome"],
        recommendedAction: "Maintain multi-static radar sweep and deploy 2x UAV reconnaissance orbit at FL120."
      });

      setIsScanningTarget(false);
      playTacticalSound('neutralize-success', soundMuted);
    }, 1200);
  };

  // Convert current viewed area to active threat contact
  const handleLogTargetToBattlespace = () => {
    playTacticalSound('alert-critical', soundMuted);
    onAddThreat({
      type: 'Potential',
      location: [currentCoords.lng, currentCoords.lat],
      title: `Visual Recon Contact: ${targetAnalysis?.targetName || 'Designated Target AO'}`,
      description: targetAnalysis?.threatAssessment || `Target area locked via high-resolution satellite reconnaissance at [${currentCoords.lat.toFixed(3)}, ${currentCoords.lng.toFixed(3)}].`,
      detectedAt: 'JUST NOW',
      priority: 'HIGH',
      source: 'REAL-TIME SATELLITE RECON',
      estimatedHostiles: 'Unidentified signatures',
      threatCategory: 'ASYMMETRIC_GROUND'
    });
    speakTacticalReadout("Target logged to tactical battlespace map.", !soundMuted);
  };

  return (
    <div className="h-full flex flex-col glass-panel hud-border p-2 sm:p-3 select-none overflow-y-auto lg:overflow-hidden animate-fade-in relative">
      
      {/* Top Header & Search Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 mb-2.5 border-b border-cyan-500/30 pb-2">
        <div className="flex items-center space-x-2.5">
          <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></span>
          <div>
            <h2 className="text-xs sm:text-sm md:text-base font-black text-cyan-400 uppercase tracking-wider sm:tracking-widest flex items-center space-x-2">
              <span>REAL-TIME TARGET & SATELLITE RECONNAISSANCE</span>
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                LIVE GEO-SPATIAL
              </span>
            </h2>
            <p className="text-[8px] sm:text-[9px] font-mono text-slate-400 uppercase">
              HIGH-RESOLUTION ESRI SATELLITE TIERS // KENYA, RED SEA, PERSIAN GULF & GLOBAL TARGETING
            </p>
          </div>
        </div>

        {/* Real-time Search Input */}
        <form onSubmit={handleSearchPlace} className="flex items-center space-x-1.5 w-full lg:w-auto">
          <div className="relative flex-grow lg:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search place, city, base, or coords (e.g. Mombasa, Hormuz)..."
              className="w-full bg-slate-900/90 border border-cyan-500/40 text-cyan-200 text-[11px] font-mono px-3 py-1.5 rounded outline-none focus:border-cyan-400 placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1.5 text-slate-500 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-[10px] font-mono px-3 py-1.5 rounded uppercase tracking-wider transition-colors min-h-[34px] flex items-center space-x-1 whitespace-nowrap"
          >
            <span>{isSearching ? 'SEARCHING...' : 'FLY TO TARGET →'}</span>
          </button>
        </form>
      </div>

      {/* Strategic Hotspots Quick Selector Bar */}
      <div className="flex space-x-1.5 mb-2 overflow-x-auto pb-1 max-w-full custom-scrollbar">
        <span className="text-[8px] font-mono text-slate-500 uppercase self-center whitespace-nowrap mr-1">
          STRATEGIC THEATERS:
        </span>
        {STRATEGIC_HOTSPOTS.map((h) => {
          const isSelected = selectedHotspot.id === h.id;
          return (
            <button
              key={h.id}
              onClick={() => handleSelectHotspot(h)}
              className={`px-2 py-1 rounded text-[8px] font-mono font-bold uppercase whitespace-nowrap transition-colors flex items-center space-x-1 border ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_8px_rgba(0,242,255,0.3)]'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${
                h.category === 'KENYA_DEFENSE' ? 'bg-cyan-400' :
                h.category === 'RED_SEA_CHOKEPOINT' ? 'bg-red-400' : 'bg-purple-400'
              }`}></span>
              <span>{h.name.split(' (')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Main Visualizer Workspace Layout */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-2.5 min-h-0 relative">
        
        {/* Central Satellite Map Canvas (8 Cols) */}
        <div className="lg:col-span-8 h-[380px] sm:h-[460px] lg:h-full relative rounded-xl border border-cyan-500/30 overflow-hidden bg-black flex flex-col group">
          
          {/* Leaflet Map DOM Container */}
          <div
            ref={mapContainerRef}
            className={`w-full h-full ${flirNightVision ? 'brightness-125 contrast-150 saturate-200 hue-rotate-[180deg] filter' : ''}`}
          />

          {/* Tactical Targeting Reticle & Crosshairs */}
          {showReticle && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[400]">
              {/* Outer Reticle Ring */}
              <div className="w-32 h-32 border border-cyan-400/50 rounded-full animate-spin-slow relative flex items-center justify-center">
                <div className="w-16 h-16 border border-dashed border-cyan-300/60 rounded-full"></div>
                <div className="absolute top-0 w-2 h-0.5 bg-cyan-400"></div>
                <div className="absolute bottom-0 w-2 h-0.5 bg-cyan-400"></div>
                <div className="absolute left-0 w-0.5 h-2 bg-cyan-400"></div>
                <div className="absolute right-0 w-0.5 h-2 bg-cyan-400"></div>
              </div>
              {/* Center Crosshair Dot */}
              <div className="absolute w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f2ff]"></div>
            </div>
          )}

          {/* Top Left HUD Telemetry Overlay */}
          <div className="absolute top-2 left-2 z-[400] bg-slate-950/85 p-2 rounded border border-cyan-500/30 backdrop-blur-md text-[8px] sm:text-[9px] font-mono text-cyan-300 space-y-0.5 pointer-events-none">
            <div>TARGET LAT: {currentCoords.lat.toFixed(4)}°N // LNG: {currentCoords.lng.toFixed(4)}°E</div>
            <div>ZOOM: {zoomLevel}X // GSD: {(156543 / Math.pow(2, zoomLevel)).toFixed(2)}M/PX</div>
            <div className="text-slate-400">IMAGERY TIER: ESRI HIGH-RES ORTHORECTIFIED SATELLITE</div>
          </div>

          {/* Top Right Imagery Controls */}
          <div className="absolute top-2 right-2 z-[400] flex flex-col space-y-1 bg-slate-950/85 p-1.5 rounded border border-cyan-500/30 backdrop-blur-md">
            <span className="text-[7px] font-mono text-slate-400 uppercase tracking-widest block mb-0.5">
              SENSOR / MAP MODE:
            </span>
            <div className="grid grid-cols-2 gap-1">
              {(['SATELLITE', 'DARK_TACTICAL', 'HYBRID_TOPO', 'STREET'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setImageryMode(m);
                    playTacticalSound('button-click', soundMuted);
                  }}
                  className={`text-[7px] sm:text-[8px] font-mono font-bold px-2 py-1 rounded uppercase transition-colors ${
                    imageryMode === m ? 'bg-cyan-500 text-black' : 'bg-black/50 text-slate-400 hover:text-white'
                  }`}
                >
                  {m.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* FLIR, Range Ring & Reticle Toggles */}
            <div className="pt-1.5 border-t border-slate-800 grid grid-cols-3 gap-1">
              <button
                onClick={() => setFlirNightVision(!flirNightVision)}
                className={`text-[7px] font-mono font-bold py-1 px-1 rounded border uppercase transition-colors ${
                  flirNightVision ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-black/40 text-slate-400 border-slate-700'
                }`}
              >
                {flirNightVision ? 'FLIR: ON' : 'FLIR: OFF'}
              </button>
              <button
                onClick={() => setShowRangeRings(!showRangeRings)}
                className={`text-[7px] font-mono font-bold py-1 px-1 rounded border uppercase transition-colors ${
                  showRangeRings ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-black/40 text-slate-400 border-slate-700'
                }`}
              >
                {showRangeRings ? 'RINGS: ON' : 'RINGS: OFF'}
              </button>
              <button
                onClick={() => setShowReticle(!showReticle)}
                className={`text-[7px] font-mono font-bold py-1 px-1 rounded border uppercase transition-colors ${
                  showReticle ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-black/40 text-slate-400 border-slate-700'
                }`}
              >
                {showReticle ? 'HUD: ON' : 'HUD: OFF'}
              </button>
            </div>
          </div>

          {/* Bottom Coordinates & Action Trigger */}
          <div className="absolute bottom-2 inset-x-2 z-[400] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pointer-events-none">
            <div className="bg-slate-950/85 px-2.5 py-1.5 rounded border border-cyan-500/30 text-[8px] sm:text-[9px] font-mono text-white backdrop-blur-md">
              <span className="text-cyan-400 font-bold">LOCKED TARGET: </span>
              <span>{selectedHotspot.name}</span>
            </div>

            <div className="pointer-events-auto flex items-center space-x-1.5">
              <button
                onClick={handleExecuteTargetScan}
                disabled={isScanningTarget}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-black text-[9px] sm:text-[10px] font-mono px-3 py-1.5 rounded uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,242,255,0.4)] disabled:opacity-40 min-h-[34px]"
              >
                {isScanningTarget ? 'ACQUIRING MULTI-SPECTRAL RECON...' : 'SCAN TARGET AREA →'}
              </button>
            </div>
          </div>

        </div>

        {/* Right Target Intel & Strategic Recon Analysis Drawer (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-2.5 overflow-y-auto pr-0 sm:pr-1 custom-scrollbar">
          
          {/* Target Profile Card */}
          <div className="bg-slate-900/80 p-3 rounded-lg border border-cyan-500/20 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[8px] sm:text-[9px] font-mono text-cyan-400 uppercase tracking-widest font-bold block">
                  GEOSPATIAL TARGET PROFILE:
                </span>
                <h3 className="text-xs sm:text-sm font-black text-white mt-0.5">
                  {selectedHotspot.name}
                </h3>
              </div>
              <span className={`text-[7px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                selectedHotspot.category === 'KENYA_DEFENSE' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' :
                selectedHotspot.category === 'RED_SEA_CHOKEPOINT' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                'bg-purple-500/20 text-purple-300 border-purple-500/40'
              }`}>
                {selectedHotspot.category.replace('_', ' ')}
              </span>
            </div>

            <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-mono">
              {selectedHotspot.description}
            </p>

            <div className="bg-black/50 p-2 rounded border border-slate-800 text-[9px] sm:text-[10px] font-mono space-y-1 text-slate-300">
              <div>
                <strong className="text-cyan-400">TACTICAL ROLE: </strong>
                {selectedHotspot.tacticalRole}
              </div>
            </div>
          </div>

          {/* AI Optical & Multi-Spectral Recon Scan Output */}
          {targetAnalysis ? (
            <div className="bg-slate-900/90 p-3 rounded-lg border border-cyan-500/30 space-y-2 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase">
                  AI TARGET RECONNAISSANCE SCAN
                </span>
                <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/50 px-1.5 py-0.2 rounded border border-emerald-500/30">
                  CONFIDENCE: 98%
                </span>
              </div>

              <div className="space-y-1.5 text-[10px] sm:text-[11px] font-mono">
                <div className="flex justify-between border-b border-slate-800/60 pb-1">
                  <span className="text-slate-400">COORDINATES:</span>
                  <span className="text-cyan-300 font-bold">{targetAnalysis.coordinates}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1">
                  <span className="text-slate-400">MGRS GRID:</span>
                  <span className="text-white">{targetAnalysis.mgrsGrid}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1">
                  <span className="text-slate-400">TERRAIN:</span>
                  <span className="text-slate-200">{targetAnalysis.terrainType}</span>
                </div>
                <div className="pt-1 text-slate-300">
                  <span className="text-amber-400 font-bold block mb-0.5">THREAT RECONNAISSANCE:</span>
                  <p className="text-[10px] leading-relaxed text-slate-300">{targetAnalysis.threatAssessment}</p>
                </div>
              </div>

              {/* Sensor Grid */}
              <div className="bg-black/40 p-2 rounded border border-slate-800 space-y-1">
                <span className="text-[8px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">
                  ACTIVE SENSOR COVERAGE:
                </span>
                {targetAnalysis.sensorsInCoverage.map((s, idx) => (
                  <div key={idx} className="text-[9px] font-mono text-slate-300 flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>

              {/* Action: Log Target into C4ISR Battlespace */}
              <button
                onClick={handleLogTargetToBattlespace}
                className="w-full mt-2 bg-red-600 hover:bg-red-500 text-white font-black text-[10px] font-mono py-2 rounded uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] min-h-[38px]"
              >
                LOG TARGET CONTACT TO BATTLESPACE MAP ➔
              </button>
            </div>
          ) : (
            <div className="p-4 bg-slate-900/40 rounded-lg border border-dashed border-slate-800 text-center text-slate-500 font-mono text-xs space-y-1.5">
              <span className="text-slate-400 font-bold block uppercase text-[10px]">
                AWAITING TARGET RECON SCAN
              </span>
              <p className="text-[9px] text-slate-500">
                Click &quot;SCAN TARGET AREA&quot; or click anywhere on the real-world satellite map to compute multi-spectral terrain, MGRS grid coordinates, and sensor coverage.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default RealtimeTargetVisualizer;
