import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { Threat, Asset, CourseOfAction, SectorConfig } from '../types.ts';
import { KENYA_TOPOJSON, SECTORS } from '../constants.ts';
import { playTacticalSound } from '../utils/audioUtils.ts';

interface ThreatMapProps {
  threats: Threat[];
  assets: Asset[];
  onSelectThreat: (threat: Threat) => void;
  selectedThreat: Threat | null;
  highlightedCOA: CourseOfAction | null;
  currentSector: SectorConfig;
  onSectorChange: (sector: SectorConfig) => void;
  onNeutralizeThreat?: (threatId: string) => void;
  onDropWaypoint?: (location: [number, number]) => void;
  soundMuted?: boolean;
}

const ThreatMap: React.FC<ThreatMapProps> = ({
  threats,
  assets,
  onSelectThreat,
  selectedThreat,
  highlightedCOA,
  currentSector,
  onSectorChange,
  onNeutralizeThreat,
  onDropWaypoint,
  soundMuted = false
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [hoveredLocation, setHoveredLocation] = useState<{ lon: number; lat: number } | null>(null);
  const [mapLayer, setMapLayer] = useState<'TACTICAL' | 'RADAR' | 'TERRAIN'>('TACTICAL');
  const projectionRef = useRef<d3.GeoProjection | null>(null);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    const observer = new ResizeObserver(update);
    if (containerRef.current) observer.observe(containerRef.current);
    update();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const projection = d3.geoMercator()
      .center(currentSector.mapCenter)
      .scale(currentSector.mapScale * (dimensions.width / 820))
      .translate([dimensions.width / 2, dimensions.height / 2]);
    projectionRef.current = projection;

    const path = d3.geoPath().projection(projection);
    const geojsonData: any = feature(KENYA_TOPOJSON, KENYA_TOPOJSON.objects.kenya);

    const g = svg.append("g");

    // Background Grid
    const gridSize = 32;
    const grid = g.append("g").attr("class", "map-grid").attr("opacity", 0.08);
    for (let x = 0; x < dimensions.width; x += gridSize) {
      grid.append("line").attr("x1", x).attr("y1", 0).attr("x2", x).attr("y2", dimensions.height).attr("stroke", "#00f2ff").attr("stroke-width", 0.5);
    }
    for (let y = 0; y < dimensions.height; y += gridSize) {
      grid.append("line").attr("x1", 0).attr("y1", y).attr("x2", dimensions.width).attr("y2", y).attr("stroke", "#00f2ff").attr("stroke-width", 0.5);
    }

    // Range Rings from Sector Center
    const [cx, cy] = projection(currentSector.mapCenter) || [dimensions.width / 2, dimensions.height / 2];
    const rangeRings = g.append("g").attr("class", "range-rings").attr("opacity", 0.15);
    [80, 160, 240].forEach((r) => {
      rangeRings.append("circle")
        .attr("cx", cx).attr("cy", cy).attr("r", r)
        .attr("fill", "none")
        .attr("stroke", "#00f2ff")
        .attr("stroke-width", 0.8)
        .attr("stroke-dasharray", "4,6");
    });

    // Radar Sweep Animation
    if (mapLayer === 'RADAR' || mapLayer === 'TACTICAL') {
      const radarSweep = g.append("g").attr("transform", `translate(${cx}, ${cy})`);
      radarSweep.append("line")
        .attr("x1", 0).attr("y1", 0).attr("x2", 240).attr("y2", 0)
        .attr("stroke", "#00f2ff")
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.4)
        .append("animateTransform")
        .attr("attributeName", "transform")
        .attr("type", "rotate")
        .attr("from", "0")
        .attr("to", "360")
        .attr("dur", "8s")
        .attr("repeatCount", "indefinite");
    }

    // Base TopoJSON Map of Kenya
    g.selectAll(".border")
      .data(geojsonData.features)
      .enter().append("path")
      .attr("d", path as any)
      .attr("fill", "rgba(15, 23, 42, 0.75)")
      .attr("stroke", "rgba(0, 242, 255, 0.4)")
      .attr("stroke-width", 1.8);

    // Threat Influence Heat Zones
    const threatZones = g.append("g").attr("class", "threat-zones");
    threats.forEach(t => {
      if (t.type === 'Neutralized') return;
      const [x, y] = projection(t.location) || [0, 0];
      const isConfirmed = t.type === 'Confirmed';

      threatZones.append("circle")
        .attr("cx", x).attr("cy", y)
        .attr("r", isConfirmed ? 55 : 35)
        .attr("fill", isConfirmed ? "rgba(239, 68, 68, 0.12)" : "rgba(245, 158, 11, 0.1)")
        .attr("stroke", isConfirmed ? "rgba(239, 68, 68, 0.3)" : "rgba(245, 158, 11, 0.2)")
        .attr("stroke-width", 0.8)
        .attr("stroke-dasharray", "3,3");
    });

    // COA Action Lines (Lines connecting involved KDF assets to selected threat)
    if (highlightedCOA && selectedThreat) {
      const [tx, ty] = projection(selectedThreat.location) || [0, 0];
      const coaLayer = g.append("g").attr("class", "coa-layer");

      highlightedCOA.involvedAssetIds.forEach(aid => {
        const asset = assets.find(a => a.id === aid);
        if (asset) {
          const [ax, ay] = projection(asset.location) || [0, 0];
          coaLayer.append("line")
            .attr("x1", ax).attr("y1", ay).attr("x2", tx).attr("y2", ty)
            .attr("stroke", "#00f2ff")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "6,4")
            .attr("opacity", 0.85);

          // Animated vector pulse
          coaLayer.append("circle")
            .attr("cx", ax).attr("cy", ay).attr("r", 3)
            .attr("fill", "#00f2ff")
            .append("animate")
            .attr("attributeName", "cx").attr("values", `${ax};${tx}`).attr("dur", "2.5s").attr("repeatCount", "indefinite");

          coaLayer.append("circle")
            .attr("cx", ax).attr("cy", ay).attr("r", 3)
            .attr("fill", "#00f2ff")
            .append("animate")
            .attr("attributeName", "cy").attr("values", `${ay};${ty}`).attr("dur", "2.5s").attr("repeatCount", "indefinite");
        }
      });
    }

    // KDF Assets Layer
    const assetLayer = g.append("g").attr("class", "asset-layer");
    assets.forEach(a => {
      const [x, y] = projection(a.location) || [0, 0];
      const isSelected = selectedAsset?.id === a.id;
      
      const group = assetLayer.append("g")
        .attr("transform", `translate(${x},${y})`)
        .style("cursor", "pointer")
        .on("click", (e) => {
          e.stopPropagation();
          setSelectedAsset(a);
          playTacticalSound('button-click', soundMuted);
        });

      // Asset Icon Base
      let iconColor = "#00f2ff";
      if (a.type === 'Air Base') iconColor = "#38bdf8";
      if (a.type === 'Naval Patrol') iconColor = "#22d3ee";
      if (a.type === 'Special Forces') iconColor = "#a855f7";
      if (a.type === 'UAV Drone Swarm') iconColor = "#f43f5e";

      // Outer Pulse Ring
      group.append("circle")
        .attr("r", 6)
        .attr("fill", "none")
        .attr("stroke", iconColor)
        .attr("stroke-width", 0.8)
        .attr("opacity", 0.6)
        .append("animate")
        .attr("attributeName", "r").attr("from", 6).attr("to", 18).attr("dur", "2.2s").attr("repeatCount", "indefinite");

      // Solid Center Marker
      group.append("circle")
        .attr("r", isSelected ? 6 : 4)
        .attr("fill", iconColor)
        .attr("filter", "drop-shadow(0 0 6px rgba(0, 242, 255, 0.8))");

      // Callsign Tag
      group.append("text")
        .attr("x", 8)
        .attr("y", -6)
        .attr("fill", iconColor)
        .attr("font-size", "9px")
        .attr("font-family", "monospace")
        .attr("font-weight", "bold")
        .attr("opacity", 0.9)
        .text(a.callsign);

      if (isSelected) {
        group.append("circle")
          .attr("r", 14)
          .attr("fill", "none")
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 1.2)
          .attr("stroke-dasharray", "3,2");
      }
    });

    // Threats Layer
    const threatLayer = g.append("g").attr("class", "threat-layer");
    threats.forEach(t => {
      const [x, y] = projection(t.location) || [0, 0];
      const isSelected = selectedThreat?.id === t.id;
      const isNeutralized = t.type === 'Neutralized';
      const color = isNeutralized ? '#22c55e' : t.type === 'Confirmed' ? '#ef4444' : '#f59e0b';

      const group = threatLayer.append("g")
        .attr("transform", `translate(${x},${y})`)
        .style("cursor", "pointer")
        .on("click", (e) => {
          e.stopPropagation();
          onSelectThreat(t);
          playTacticalSound('alert-warning', soundMuted);
        });

      if (!isNeutralized) {
        // Ping Animation for active threats
        group.append("circle")
          .attr("r", 8)
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-width", 1)
          .append("animate")
          .attr("attributeName", "r").attr("from", 8).attr("to", 24).attr("dur", "1.6s").attr("repeatCount", "indefinite");
      }

      // Tactical Target Cross Marker
      group.append("path")
        .attr("d", "M-7,-7 L7,7 M-7,7 L7,-7")
        .attr("stroke", color)
        .attr("stroke-width", 2.2);

      // Threat Label
      group.append("text")
        .attr("x", 10)
        .attr("y", 12)
        .attr("fill", color)
        .attr("font-size", "9px")
        .attr("font-family", "monospace")
        .attr("font-weight", "bold")
        .text(t.title || `${t.type.toUpperCase()} THREAT`);

      if (isSelected) {
        group.append("circle")
          .attr("r", 18)
          .attr("fill", "none")
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 1.5)
          .attr("stroke-dasharray", "4,2");
      }
    });

    // Map Click & Hover Interaction
    svg.on("mousemove", (event) => {
      const [mx, my] = d3.pointer(event);
      const coords = projection.invert ? projection.invert([mx, my]) : null;
      if (coords) {
        setHoveredLocation({ lon: coords[0], lat: coords[1] });
      }
    });

    svg.on("click", (event) => {
      const [mx, my] = d3.pointer(event);
      const coords = projection.invert ? projection.invert([mx, my]) : null;
      if (coords && onDropWaypoint) {
        onDropWaypoint([coords[0], coords[1]]);
        playTacticalSound('radio-chirp', soundMuted);
      }
      setSelectedAsset(null);
    });

  }, [dimensions, currentSector, threats, assets, selectedThreat, highlightedCOA, selectedAsset, mapLayer]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-[#020617] hud-border select-none overflow-hidden group">
      <svg ref={svgRef} className="w-full h-full block" />

      {/* Top Map Header & Controls */}
      <div className="absolute top-2 sm:top-3 inset-x-2 sm:inset-x-3 pointer-events-none flex flex-col sm:flex-row justify-between items-start gap-1.5">
        <div>
          <span className="text-[9px] sm:text-[10px] font-black text-cyan-400 uppercase tracking-[0.25em] sm:tracking-[0.35em] block">
            C4ISR SPATIAL GRID // {currentSector.name}
          </span>
          <div className="text-[8px] sm:text-[9px] font-mono text-white/50 flex flex-wrap gap-x-2 sm:gap-x-3 mt-0.5">
            <span>SECTOR: {currentSector.code}</span>
            <span>MGRS / WGS-84</span>
            {hoveredLocation && (
              <span className="text-cyan-300">
                CURSOR: {hoveredLocation.lat.toFixed(3)}°N, {hoveredLocation.lon.toFixed(3)}°E
              </span>
            )}
          </div>
        </div>

        {/* Map Layer Selector & Sector Switcher */}
        <div className="pointer-events-auto flex items-center space-x-1 sm:space-x-2 bg-slate-950/80 p-1 sm:p-1.5 rounded border border-cyan-500/30 backdrop-blur-md">
          {(['TACTICAL', 'RADAR', 'TERRAIN'] as const).map((layer) => (
            <button
              key={layer}
              onClick={() => {
                setMapLayer(layer);
                playTacticalSound('button-click', soundMuted);
              }}
              className={`text-[8px] sm:text-[9px] font-mono font-bold px-2 py-1 rounded uppercase transition-colors ${
                mapLayer === layer ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {layer}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Map Toolbar */}
      <div className="absolute bottom-2 sm:bottom-3 inset-x-2 sm:inset-x-3 pointer-events-none flex flex-col sm:flex-row justify-between items-start sm:items-end gap-1.5">
        {/* Sector Quick Jump */}
        <div className="pointer-events-auto flex flex-wrap gap-1 bg-slate-950/80 p-1 sm:p-1.5 rounded border border-cyan-500/20 backdrop-blur-md max-w-full overflow-x-auto">
          {SECTORS.map((sector) => (
            <button
              key={sector.id}
              onClick={() => {
                onSectorChange(sector);
                playTacticalSound('button-click', soundMuted);
              }}
              className={`text-[7px] sm:text-[8px] font-mono font-bold px-1.5 sm:px-2 py-1 rounded transition-colors uppercase ${
                currentSector.id === sector.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-cyan-400 bg-black/40'
              }`}
            >
              {sector.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Map Legend */}
        <div className="hidden sm:flex bg-slate-950/80 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded border border-cyan-500/20 backdrop-blur-md items-center space-x-2 sm:space-x-3 text-[8px] sm:text-[9px] font-mono">
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="text-slate-300">KDF UNIT</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-red-300">CONFIRMED</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="text-amber-300">POTENTIAL</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            <span className="text-green-300">SECURE</span>
          </div>
        </div>
      </div>

      {/* Selected Asset Drawer / Modal */}
      {selectedAsset && (
        <div className="absolute top-12 sm:top-14 right-2 sm:right-4 left-2 sm:left-auto sm:w-72 max-w-[calc(100%-1rem)] z-40 bg-slate-950/95 border border-cyan-500/40 rounded-lg p-3 sm:p-4 shadow-2xl backdrop-blur-xl animate-fade-in pointer-events-auto">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-[8px] sm:text-[9px] font-mono text-cyan-400 uppercase tracking-widest block">KDF TACTICAL ASSET</span>
              <h4 className="text-xs sm:text-sm font-black text-white">{selectedAsset.callsign}</h4>
            </div>
            <button
              onClick={() => setSelectedAsset(null)}
              className="text-slate-500 hover:text-white text-xs font-mono p-1"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs font-mono text-slate-300 my-2 sm:my-3">
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="text-slate-500">TYPE:</span>
              <span className="text-cyan-300">{selectedAsset.type}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="text-slate-500">COMMANDER:</span>
              <span className="text-white">{selectedAsset.commander || 'Staff HQ'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="text-slate-500">STATUS:</span>
              <span className="text-green-400 font-bold">{selectedAsset.status}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="text-slate-500">READINESS:</span>
              <span className="text-cyan-400 font-bold">{selectedAsset.readinessScore}%</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="text-slate-500">FUEL / AMMO:</span>
              <span>{selectedAsset.fuelPercent}% / {selectedAsset.munitionsPercent}%</span>
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-400 pt-1">
              {selectedAsset.strength}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <button
              onClick={() => {
                playTacticalSound('radio-chirp', soundMuted);
                setSelectedAsset(null);
              }}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-black text-[9px] py-2 rounded uppercase tracking-wider transition-colors min-h-[38px]"
            >
              ORDER PATROL
            </button>
            <button
              onClick={() => {
                playTacticalSound('button-click', soundMuted);
                setSelectedAsset(null);
              }}
              className="bg-white/10 hover:bg-white/20 text-white font-mono text-[9px] py-2 rounded uppercase transition-colors min-h-[38px]"
            >
              STANDBY / RTB
            </button>
          </div>
        </div>
      )}

      {/* Selected Threat Triage Card */}
      {selectedThreat && (
        <div className="absolute top-12 sm:top-14 left-2 sm:left-4 right-2 sm:right-auto sm:w-80 max-w-[calc(100%-1rem)] z-40 bg-slate-950/95 border border-red-500/50 rounded-lg p-3 sm:p-4 shadow-2xl backdrop-blur-xl animate-fade-in pointer-events-auto">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className={`text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                selectedThreat.type === 'Confirmed' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}>
                {selectedThreat.type} INTRUSION
              </span>
              <h4 className="text-xs sm:text-sm font-black text-white mt-1">{selectedThreat.title || selectedThreat.description}</h4>
            </div>
            <button
              onClick={() => onSelectThreat(null as any)}
              className="text-slate-500 hover:text-white text-xs font-mono p-1"
            >
              ✕
            </button>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed my-2">
            {selectedThreat.description}
          </p>

          <div className="space-y-1 text-[9px] sm:text-[10px] font-mono text-slate-400 my-2 bg-black/40 p-2 rounded border border-slate-800">
            <div className="flex justify-between">
              <span>COORDINATES:</span>
              <span className="text-cyan-400">[{selectedThreat.location[0].toFixed(3)}, {selectedThreat.location[1].toFixed(3)}]</span>
            </div>
            {selectedThreat.estimatedHostiles && (
              <div className="flex justify-between">
                <span>EST. STRENGTH:</span>
                <span className="text-amber-300">{selectedThreat.estimatedHostiles}</span>
              </div>
            )}
            {selectedThreat.source && (
              <div className="flex justify-between">
                <span>INTEL SOURCE:</span>
                <span className="text-white">{selectedThreat.source}</span>
              </div>
            )}
          </div>

          <div className="mt-3 flex space-x-2">
            {selectedThreat.type !== 'Neutralized' && onNeutralizeThreat && (
              <button
                onClick={() => {
                  onNeutralizeThreat(selectedThreat.id);
                  playTacticalSound('neutralize-success', soundMuted);
                }}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black text-[9px] sm:text-[10px] py-2 rounded tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] min-h-[40px]"
              >
                AUTHORIZE NEUTRALIZATION
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreatMap;
