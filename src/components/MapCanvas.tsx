import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { GeoNode, Theme } from '../types';
import { ALL_NODES, CORES } from '../constants';
import { fetchMapData, MapFeatures } from '../services/MapService';
import { cn } from '../lib/utils';

interface MapCanvasProps {
  theme: Theme;
  selectedNode: GeoNode | null;
  onSelectNode: (node: GeoNode) => void;
  onHoverNode: (node: GeoNode | null, x: number, y: number) => void;
}

export function MapCanvas({ theme, selectedNode, onSelectNode, onHoverNode }: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [mapData, setMapData] = useState<MapFeatures | null>(null);
  
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const projectionRef = useRef<d3.GeoProjection>(d3.geoMercator());
  const hoveredNodeRef = useRef<GeoNode | null>(null);
  const pulseRef = useRef(0);

  const [mouseCoords, setMouseCoords] = useState<[number, number] | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mapData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const transform = transformRef.current;
    const projection = projectionRef.current;
    
    // Theme-Aware Tactical Palette
    const isDark = theme === 'dark';
    
    const bgGrade = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width);
    if (isDark) {
      bgGrade.addColorStop(0, "#0a0f1e");
      bgGrade.addColorStop(1, "#020617");
    } else {
      bgGrade.addColorStop(0, "#f8fafc");
      bgGrade.addColorStop(1, "#f1f5f9");
    }
    
    const countryFill = isDark ? "rgba(15, 23, 42, 0.4)" : "rgba(59, 130, 246, 0.03)";
    const countryStroke = isDark ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.1)";
    const stateFill = isDark ? "rgba(30, 58, 138, 0.1)" : "rgba(255, 255, 255, 0.8)";
    const stateStroke = isDark ? "rgba(59, 130, 246, 0.25)" : "rgba(59, 130, 246, 0.15)";
    const gridColor = isDark ? "rgba(59, 130, 246, 0.05)" : "rgba(0, 0, 0, 0.03)";
    const highlightFill = isDark ? "rgba(59, 130, 246, 0.25)" : "rgba(59, 130, 246, 0.15)";
    const highlightStroke = isDark ? "rgba(59, 130, 246, 0.8)" : "rgba(37, 99, 235, 1)";
    
    ctx.save();
    ctx.fillStyle = bgGrade;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Tactical Grid
    ctx.beginPath();
    const step = 40 * transform.k;
    const offsetX = transform.x % step;
    const offsetY = transform.y % step;
    
    for (let x = offsetX; x < canvas.width; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
    }
    for (let y = offsetY; y < canvas.height; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);

    pulseRef.current = (pulseRef.current + 0.05) % (Math.PI * 2);
    const pulse = pulseRef.current;

    const path = d3.geoPath().projection(projection).context(ctx);

    // 1. Render All Countries (Faint Context)
    const southAsiaNames = ['India', 'Pakistan', 'Bangladesh', 'Nepal', 'Sri Lanka', 'Bhutan', 'Maldives'];
    
    ctx.beginPath();
    mapData.countries.features.forEach((feature: any) => {
      const name = feature.properties.name;
      if (southAsiaNames.includes(name)) {
        path(feature);
      }
    });
    ctx.fillStyle = countryFill;
    ctx.fill();
    ctx.strokeStyle = countryStroke;
    ctx.lineWidth = 1.0 / transform.k;
    ctx.stroke();

    // 2. Render Regional Borders
    if (mapData.indiaStates.features) {
      mapData.indiaStates.features.forEach((feature: any) => {
        const props = feature.properties;
        const stateName = props.ST_NM || props.name || props.NAME_1 || props.NAME || props.ST_NAME;
        const normalizeName = (name: string) => name?.replace(/[^a-zA-Z]/g, '').toLowerCase() || '';
        const normalizedState = normalizeName(stateName);
        
        const isSelected = selectedNode && normalizeName(selectedNode.name) === normalizedState;
        const isHovered = hoveredNodeRef.current && normalizeName(hoveredNodeRef.current.name) === normalizedState;

        ctx.beginPath();
        path(feature);
        
        if (isSelected || isHovered) {
          ctx.fillStyle = highlightFill;
          ctx.strokeStyle = highlightStroke;
          ctx.lineWidth = 2.0 / transform.k;
        } else {
          ctx.fillStyle = stateFill;
          ctx.strokeStyle = stateStroke;
          ctx.lineWidth = 0.5 / transform.k;
        }
        
        ctx.fill();
        ctx.stroke();
      });

      // Country boundary accent
      ctx.beginPath();
      path(mapData.indiaStates); 
      ctx.strokeStyle = isDark ? "rgba(59, 130, 246, 0.4)" : "rgba(37, 99, 235, 0.2)";
      ctx.lineWidth = 3.0 / transform.k;
      ctx.stroke();
    }

    // 3. Render Hub Connections
    ALL_NODES.forEach(node => {
      const core = CORES[node.core];
      const start = projection(node.coords);
      const end = projection(core.coords);
      if (!start || !end) return;

      const isSelected = selectedNode?.name === node.name;
      const isHovered = hoveredNodeRef.current?.name === node.name;

      if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.moveTo(end[0], end[1]);
        ctx.lineTo(start[0], start[1]);
        ctx.strokeStyle = `${core.color}88`;
        ctx.lineWidth = 1.5 / transform.k;
        ctx.setLineDash([5 / transform.k, 5 / transform.k]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // 4. Render Nodes
    ALL_NODES.forEach(node => {
      const coords = projection(node.coords);
      if (!coords) return;

      const isSelected = selectedNode?.name === node.name;
      const isHovered = hoveredNodeRef.current?.name === node.name;
      
      ctx.beginPath();
      const radius = (isSelected || isHovered ? 4 : 1.5) / Math.sqrt(transform.k);
      ctx.arc(coords[0], coords[1], radius, 0, Math.PI * 2);
      
      if (isSelected || isHovered) {
        ctx.fillStyle = isDark ? "#fff" : "#1e40af";
        ctx.shadowBlur = 10 / transform.k;
        ctx.shadowColor = "#3b82f6";
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = node.type === 'ut' ? "#06b6d4" : (isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(30, 58, 138, 0.4)");
        ctx.fill();
      }
    });

    // 5. Render Core Hubs
    Object.values(CORES).forEach(c => {
      const coords = projection(c.coords);
      if (!coords) return;

      const s = 1 + Math.sin(pulse) * 0.1;
      
      ctx.beginPath();
      ctx.arc(coords[0], coords[1], (14 * s) / transform.k, 0, Math.PI * 2);
      ctx.strokeStyle = `${c.color}33`;
      ctx.lineWidth = 2 / transform.k;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(coords[0], coords[1], 5 / transform.k, 0, Math.PI * 2);
      ctx.fillStyle = c.color;
      ctx.fill();
      ctx.strokeStyle = isDark ? "#fff" : "#fff";
      ctx.lineWidth = 1 / transform.k;
      ctx.stroke();
    });

    ctx.restore();
  }, [mapData, selectedNode, theme]);

  // Handle zooming to a specific position
  const zoomToCoords = useCallback((coords: [number, number]) => {
    const container = containerRef.current;
    if (!container) return;

    const projected = projectionRef.current(coords);
    if (!projected) return;
    const [x, y] = projected;
    
    const k = 4;
    const targetX = container.clientWidth / 2 - x * k;
    const targetY = container.clientHeight / 2 - y * k;

    d3.select(container)
      .transition()
      .duration(1000)
      .ease(d3.easeCubicInOut)
      .call(
        d3.zoom<HTMLDivElement, unknown>().transform as any,
        d3.zoomIdentity.translate(targetX, targetY).scale(k)
      );
  }, []);

  useEffect(() => {
    if (selectedNode) {
      zoomToCoords(selectedNode.coords);
    }
  }, [selectedNode, zoomToCoords]);

  // Initial Data Fetch
  useEffect(() => {
    fetchMapData().then(setMapData);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      projectionRef.current = d3.geoMercator()
        .center([80, 22])
        .scale(Math.min(canvas.width, canvas.height) * 1.5) // Slightly zoomed out for context
        .translate([canvas.width / 2, canvas.height / 2]);
    };

    const zoomBehavior = d3.zoom<HTMLDivElement, any>()
      .scaleExtent([0.5, 20])
      .on("zoom", (e) => {
        transformRef.current = e.transform;
        setZoomLevel(Math.round(e.transform.k * 100));
        draw();
      });

    d3.select(container).call(zoomBehavior);

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
      draw();
    });

    resizeObserver.observe(container);
    updateSize();

    const handleMouseMove = (e: MouseEvent) => {
      if (!mapData) return;
      const r = canvas.getBoundingClientRect();
      const mx = (e.clientX - r.left - transformRef.current.x) / transformRef.current.k;
      const my = (e.clientY - r.top - transformRef.current.y) / transformRef.current.k;
      
      const geoCoords = projectionRef.current.invert!([mx, my]);
      if (geoCoords) {
        setMouseCoords([geoCoords[0], geoCoords[1]]);
      }

      // Find node by state name from polygon first
      let foundNode: GeoNode | null = null;
      const normalizeName = (name: string) => name?.replace(/[^a-zA-Z]/g, '').toLowerCase() || '';
      
      // Hit test polygons
      if (mapData.indiaStates.features) {
        for (const feature of mapData.indiaStates.features) {
          if (d3.geoContains(feature, projectionRef.current.invert!([mx, my]))) {
            const props = feature.properties;
            const stateName = props.ST_NM || props.name || props.NAME_1 || props.NAME;
            const normalizedState = normalizeName(stateName);
            foundNode = ALL_NODES.find(n => normalizeName(n.name) === normalizedState) || null;
            break;
          }
        }
      }

      // Fallback hit test points
      if (!foundNode) {
        foundNode = ALL_NODES.find(n => {
          const coords = projectionRef.current(n.coords);
          if (!coords) return false;
          return Math.hypot(coords[0] - mx, coords[1] - my) < (10 / transformRef.current.k);
        }) || null;
      }

      if (foundNode !== hoveredNodeRef.current) {
        hoveredNodeRef.current = foundNode;
        onHoverNode(foundNode, e.clientX, e.clientY);
        draw();
      }
    };

    const handleClick = () => {
      if (hoveredNodeRef.current) {
        onSelectNode(hoveredNodeRef.current);
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);

    const timer = d3.timer(draw);

    return () => {
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      timer.stop();
    };
  }, [draw, onHoverNode, onSelectNode, mapData]);

  return (
    <div ref={containerRef} className="flex-1 relative cursor-crosshair overflow-hidden group">
      {/* Background Ambience */}
      <div className={cn(
        "absolute inset-0 pointer-events-none z-0",
        theme === 'dark' 
          ? "bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent)]" 
          : "bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.02),transparent)]"
      )} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0" />
      
      <canvas ref={canvasRef} className="block w-full h-full relative z-1" />
      
      {/* Coordinate Crosshair UI Overlay */}
      <div className={cn(
        "absolute inset-0 pointer-events-none border-[20px] z-10 transition-colors duration-300",
        theme === 'dark' ? "border-slate-950/20" : "border-slate-200/10"
      )} />
      
      {/* Top Left: Title & Mission */}
      <div className="absolute top-8 left-8 flex flex-col gap-1 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-[1px] bg-blue-500/50"></div>
          <span className="text-[10px] font-mono text-blue-500 tracking-[0.4em] uppercase">Tactical_Display</span>
        </div>
        <h2 className={cn(
          "text-2xl font-black italic tracking-tighter uppercase px-2 py-1 skew-x-[-12deg] border-l-4 border-blue-500 transition-colors duration-300",
          theme === 'dark' ? "text-white bg-blue-600/10" : "text-slate-900 bg-blue-500/5"
        )}>
          Command Theater v2.4
        </h2>
      </div>

      {/* Top Right: Status Console */}
      <div className="absolute top-8 right-8 flex flex-col items-end gap-3 z-20 font-mono">
        <div className="flex gap-4">
          <div className="flex flex-col items-end text-right">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest">Uplink</span>
            <span className="text-[10px] text-emerald-500 font-bold uppercase animate-pulse">Active_Signal</span>
          </div>
          <div className="flex flex-col items-end text-right">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest">Encrypt</span>
            <span className="text-[10px] text-blue-500 font-bold uppercase">AES_PRO</span>
          </div>
        </div>
        <div className={cn(
          "p-3 backdrop-blur border rounded text-[10px] w-48 shadow-2xl transition-colors duration-300",
          theme === 'dark' 
            ? "bg-slate-900/80 border-white/5 text-slate-400" 
            : "bg-white/90 border-slate-200 text-slate-600 shadow-slate-200/50"
        )}>
          <div className={cn(
            "flex justify-between mb-1 border-b pb-1",
            theme === 'dark' ? "border-white/5" : "border-slate-100"
          )}>
            <span>NETWORK</span>
            <span className="text-blue-500">STABLE</span>
          </div>
          <div className="flex justify-between">
            <span>SCANNER</span>
            <span className="text-emerald-500">READY</span>
          </div>
        </div>
      </div>
      
      {/* Bottom Left: Theater Identity */}
      <div className="absolute bottom-10 left-10 flex items-center gap-4 z-20">
        <div className={cn(
          "flex flex-col gap-1 p-4 backdrop-blur-md rounded border shadow-2xl transition-colors duration-300",
          theme === 'dark' 
            ? "bg-slate-900/80 border-blue-500/30 shadow-blue-500/10" 
            : "bg-white/95 border-blue-500/20 shadow-slate-200"
        )}>
          <div className="text-[10px] text-blue-500/60 font-mono uppercase tracking-[0.3em]">Theater_Link: Online</div>
          <div className={cn(
            "text-[12px] font-mono uppercase font-black flex items-center gap-2",
            theme === 'dark' ? "text-blue-300" : "text-blue-700"
          )}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            South Asia Command Grid
          </div>
          {mouseCoords && (
            <div className={cn(
              "mt-2 pt-2 border-t text-[9px] font-mono flex gap-3 italic",
              theme === 'dark' ? "border-white/5 text-slate-500" : "border-slate-100 text-slate-400"
            )}>
              <span>LAT: {mouseCoords[1].toFixed(4)}°</span>
              <span>LON: {mouseCoords[0].toFixed(4)}°</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Right: Zoom & Control */}
      <div className="absolute bottom-10 right-10 z-20 flex flex-col items-end gap-3">
        <div className={cn(
          "flex items-center gap-3 px-6 py-2.5 backdrop-blur-md rounded-full border shadow-2xl overflow-hidden relative transition-colors duration-300",
          theme === 'dark' ? "bg-slate-900/80 border-white/10" : "bg-white/95 border-slate-200 shadow-slate-200/50"
        )}>
          {theme === 'dark' && <div className="absolute inset-0 bg-blue-500/5 animate-[pulse_4s_infinite]"></div>}
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest relative z-10">Sensory_Magnification: </span>
          <span className="text-[10px] font-mono text-blue-500 font-bold relative z-10">{(zoomLevel / 100).toFixed(1)}x</span>
        </div>
      </div>
    </div>
  );
}
