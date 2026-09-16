import React, { useRef, useEffect, useState, useCallback } from 'react';
import { NetworkGraph, AppNode, AppEdge } from '@/lib/types';
import { 
  Zap, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  Crosshair, 
  Route, 
  Wifi, 
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

interface AnalyzeCanvasProps {
  graph: NetworkGraph;
  attackedNodes: string[];
  attackedEdges: string[];
  isolatedNodes: string[];
  mengerPaths?: string[][];
  onToggleTargetNode: (nodeId: string) => void;
  onToggleTargetEdge: (edgeId: string) => void;
  theme?: 'light' | 'dark';
}

const MENGER_COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#db2777'];

export const AnalyzeCanvas: React.FC<AnalyzeCanvasProps> = ({
  graph,
  attackedNodes,
  attackedEdges,
  isolatedNodes,
  mengerPaths = [],
  onToggleTargetNode,
  onToggleTargetEdge,
  theme = 'light',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isDark = theme === 'dark';

  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 1200, height: 700 });
  const [hoveredNode, setHoveredNode] = useState<AppNode | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<AppEdge | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Pan & Zoom Transform State
  const [transform, setTransform] = useState<{ x: number; y: number; scale: number }>({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const attackedNodeSet = new Set(attackedNodes);
  const attackedEdgeSet = new Set(attackedEdges);
  const isolatedNodeSet = new Set(isolatedNodes);

  // Auto-resize canvas buffer to match container pixel size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setCanvasSize({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Menger Path Map: edgeKey -> color
  const mengerEdgeColors = useRef<Map<string, string>>(new Map());
  useEffect(() => {
    const map = new Map<string, string>();
    mengerPaths.forEach((path, pathIdx) => {
      const color = MENGER_COLORS[pathIdx % MENGER_COLORS.length];
      for (let i = 0; i < path.length - 1; i++) {
        const u = path[i];
        const v = path[i + 1];
        map.set(`${u}-${v}`, color);
        map.set(`${v}-${u}`, color);
      }
    });
    mengerEdgeColors.current = map;
  }, [mengerPaths]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let particleOffset = 0;
    let shockwaveRadius = 0;

    const render = () => {
      particleOffset = (particleOffset + 0.8) % 100;
      shockwaveRadius = (shockwaveRadius + 0.5) % 40;

      // Clean and fill canvas background for active theme
      ctx.fillStyle = isDark ? '#090c15' : '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Apply pan & zoom
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.scale, transform.scale);

      const nodeMap = new Map<string, AppNode>();
      graph.nodes.forEach(n => nodeMap.set(n.id, n));

      // 1. Draw Edges
      graph.edges.forEach(edge => {
        const source = nodeMap.get(edge.source);
        const target = nodeMap.get(edge.target);
        if (!source || !target) return;

        const isEdgeAttacked =
          attackedEdgeSet.has(edge.id) ||
          attackedNodeSet.has(edge.source) ||
          attackedNodeSet.has(edge.target);

        const isHovered = hoveredEdge?.id === edge.id;
        const isNeighborHovered = hoveredNode && (hoveredNode.id === edge.source || hoveredNode.id === edge.target);

        const edgeKey = `${edge.source}-${edge.target}`;
        const mengerColor = mengerEdgeColors.current.get(edgeKey);

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);

        if (isEdgeAttacked) {
          ctx.strokeStyle = '#e11d48';
          ctx.lineWidth = isHovered ? 4 : 2.5;
          ctx.setLineDash([6, 6]);
          ctx.shadowColor = 'rgba(225, 29, 72, 0.4)';
          ctx.shadowBlur = 8;
        } else if (mengerColor) {
          ctx.strokeStyle = mengerColor;
          ctx.lineWidth = isHovered || isNeighborHovered ? 4.5 : 3.5;
          ctx.setLineDash([]);
          ctx.shadowColor = mengerColor;
          ctx.shadowBlur = 10;
        } else if (isNeighborHovered || isHovered) {
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 3.5;
          ctx.setLineDash([]);
          ctx.shadowColor = '#2563eb';
          ctx.shadowBlur = 8;
        } else {
          ctx.strokeStyle = isDark ? 'rgba(59, 130, 246, 0.35)' : 'rgba(100, 116, 139, 0.35)';
          ctx.lineWidth = 2;
          ctx.setLineDash([]);
          ctx.shadowBlur = 0;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.setLineDash([]);

        // Draw animated flow particles along active un-attacked edges
        if (!isEdgeAttacked) {
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const particleCount = Math.max(1, Math.floor(dist / 60));

          for (let p = 0; p < particleCount; p++) {
            const progress = ((particleOffset / 100) + (p / particleCount)) % 1;
            const px = source.x + dx * progress;
            const py = source.y + dy * progress;

            ctx.beginPath();
            ctx.arc(px, py, isHovered || isNeighborHovered ? 3.5 : 2.5, 0, Math.PI * 2);
            ctx.fillStyle = mengerColor || (isDark ? '#60a5fa' : '#2563eb');
            ctx.shadowColor = mengerColor || '#3b82f6';
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }

        // Draw Edge Throughput / Health Badges
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;

        ctx.save();
        ctx.translate(midX, midY);

        ctx.font = '700 9px monospace';
        const labelText = `${edge.capacity}G`;
        const textWidth = ctx.measureText(labelText).width;

        // Badge pill background
        ctx.fillStyle = isEdgeAttacked
          ? 'rgba(225, 29, 72, 0.9)'
          : isHovered
          ? (isDark ? '#1e293b' : '#ffffff')
          : (isDark ? '#0f1422' : '#ffffff');
        ctx.strokeStyle = isEdgeAttacked
          ? '#f43f5e'
          : isHovered
          ? '#2563eb'
          : (isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)');
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.roundRect(-textWidth / 2 - 5, -8, textWidth + 10, 16, 6);
        ctx.fill();
        ctx.stroke();

        // Badge text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isEdgeAttacked
          ? '#ffffff'
          : isHovered
          ? (isDark ? '#ffffff' : '#0f172a')
          : (isDark ? '#94a3b8' : '#475569');
        ctx.fillText(labelText, 0, 1);

        ctx.restore();
      });

      // 2. Draw Nodes
      graph.nodes.forEach(node => {
        const isAttacked = attackedNodeSet.has(node.id);
        const isIsolated = isolatedNodeSet.has(node.id);
        const isHovered = hoveredNode?.id === node.id;
        const isRoot = node.id === graph.root_id || node.type === 'gateway';
        const isNeighbor = hoveredNode && graph.edges.some(
          e => (e.source === hoveredNode.id && e.target === node.id) || (e.target === hoveredNode.id && e.source === node.id)
        );

        ctx.save();
        ctx.translate(node.x, node.y);

        const baseRadius = isHovered ? 28 : 24;

        // Shockwave ripple animation for damaged/attacked nodes
        if (isAttacked) {
          ctx.beginPath();
          ctx.arc(0, 0, 24 + shockwaveRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(225, 29, 72, ${Math.max(0, 1 - shockwaveRadius / 40)})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Active node pulse halo
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(0, 0, baseRadius + 6, 0, Math.PI * 2);
          ctx.fillStyle = isAttacked ? 'rgba(225, 29, 72, 0.15)' : 'rgba(37, 99, 235, 0.12)';
          ctx.fill();
        }

        // Node Outer Halo
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);

        if (isAttacked) {
          ctx.fillStyle = isDark ? 'rgba(225, 29, 72, 0.2)' : '#fff1f2';
          ctx.strokeStyle = '#e11d48';
          ctx.lineWidth = isHovered ? 3.5 : 2.5;
          ctx.shadowColor = 'rgba(225, 29, 72, 0.4)';
          ctx.shadowBlur = 14;
        } else if (isIsolated) {
          ctx.fillStyle = isDark ? 'rgba(15, 20, 34, 0.7)' : '#f1f5f9';
          ctx.strokeStyle = isDark ? '#334155' : '#94a3b8';
          ctx.lineWidth = isHovered ? 2.5 : 1.5;
          ctx.shadowBlur = 0;
        } else if (isRoot) {
          ctx.fillStyle = isDark ? '#101626' : '#ffffff';
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = isHovered ? 3.5 : 2.5;
          ctx.shadowColor = 'rgba(37, 99, 235, 0.25)';
          ctx.shadowBlur = 12;
        } else if (isNeighbor) {
          ctx.fillStyle = isDark ? '#101626' : '#ffffff';
          ctx.strokeStyle = '#4f46e5';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = 'rgba(79, 70, 229, 0.3)';
          ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = isDark ? '#101626' : '#ffffff';
          ctx.strokeStyle = node.tier === 2 ? '#7c3aed' : isDark ? 'rgba(255, 255, 255, 0.15)' : '#94a3b8';
          ctx.lineWidth = isHovered ? 2.5 : 1.5;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
          ctx.shadowBlur = 6;
        }

        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Inner core point
        ctx.beginPath();
        ctx.arc(0, 0, isHovered ? 5 : 4, 0, Math.PI * 2);
        ctx.fillStyle = isAttacked ? '#e11d48' : isIsolated ? '#94a3b8' : isRoot ? '#2563eb' : '#7c3aed';
        ctx.fill();

        // Node Label
        ctx.font = isHovered ? '700 12px system-ui, -apple-system, sans-serif' : '600 11px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = isAttacked ? '#fb7185' : isIsolated ? '#94a3b8' : isHovered ? (isDark ? '#ffffff' : '#000000') : (isDark ? '#f8fafc' : '#0f172a');
        ctx.fillText(node.name, 0, 40);

        // Capacity badge
        ctx.font = '700 9px monospace';
        ctx.fillStyle = isIsolated ? '#94a3b8' : (isDark ? '#93c5fd' : '#2563eb');
        ctx.fillText(`${node.capacity}G`, 0, -32);

        ctx.restore();
      });

      ctx.restore();

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [graph, attackedNodes, attackedEdges, isolatedNodes, mengerPaths, hoveredNode, hoveredEdge, transform, isDark, canvasSize]);

  // Coordinate projection from Screen to Flow Canvas Coordinates
  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, rawX: 0, rawY: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Account for any CSS scaling between internal canvas dimensions and client bounding box
    const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
    const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;

    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;

    const x = (canvasX - transform.x) / transform.scale;
    const y = (canvasY - transform.y) / transform.scale;

    return { x, y, rawX: clientX - rect.left, rawY: clientY - rect.top };
  }, [transform]);

  // Mouse Move: Accurate Hover Detection
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y, rawX, rawY } = getCanvasCoords(e.clientX, e.clientY);
    setMousePos({ x: rawX, y: rawY });

    if (isPanning) {
      setTransform(prev => ({
        ...prev,
        x: prev.x + (e.clientX - panStart.x),
        y: prev.y + (e.clientY - panStart.y),
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    // 1. Check for closest node within hit radius (circle + label)
    let closestNode: AppNode | null = null;
    let minNodeDist = Infinity;

    for (const node of graph.nodes) {
      const dx = node.x - x;
      const dy = node.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Hit circle (radius 32) or label/badge bounds
      const isCircleHit = dist <= 32;
      const isLabelHit = Math.abs(dx) <= 60 && dy >= -50 && dy <= 15;

      if ((isCircleHit || isLabelHit) && dist < minNodeDist) {
        minNodeDist = dist;
        closestNode = node;
      }
    }

    if (closestNode) {
      setHoveredNode(closestNode);
      setHoveredEdge(null);
      return;
    }

    setHoveredNode(null);

    // 2. If no node hovered, check for closest edge within threshold (10px)
    let closestEdge: AppEdge | null = null;
    let minEdgeDist = Infinity;
    const edgeHitThreshold = 10;

    const nodeMap = new Map<string, AppNode>();
    graph.nodes.forEach(n => nodeMap.set(n.id, n));

    for (const edge of graph.edges) {
      const u = nodeMap.get(edge.source);
      const v = nodeMap.get(edge.target);
      if (!u || !v) continue;

      // Distance from point (x,y) to line segment (u,v)
      const l2 = (v.x - u.x) ** 2 + (v.y - u.y) ** 2;
      if (l2 === 0) continue;
      const t = Math.max(0, Math.min(1, ((x - u.x) * (v.x - u.x) + (y - u.y) * (v.y - u.y)) / l2));
      const projX = u.x + t * (v.x - u.x);
      const projY = u.y + t * (v.y - u.y);
      const dist = Math.sqrt((x - projX) ** 2 + (y - projY) ** 2);

      if (dist <= edgeHitThreshold && dist < minEdgeDist) {
        minEdgeDist = dist;
        closestEdge = edge;
      }
    }

    setHoveredEdge(closestEdge);
  };

  const handleMouseLeave = () => {
    setHoveredNode(null);
    setHoveredEdge(null);
    setIsPanning(false);
  };

  // Canvas Click Handler
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);

    // 1. Check if clicked closest node
    let closestNode: AppNode | null = null;
    let minNodeDist = Infinity;
    for (const node of graph.nodes) {
      const dx = node.x - x;
      const dy = node.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const isCircleHit = dist <= 34;
      const isLabelHit = Math.abs(dx) <= 60 && dy >= -50 && dy <= 15;

      if ((isCircleHit || isLabelHit) && dist < minNodeDist) {
        minNodeDist = dist;
        closestNode = node;
      }
    }

    if (closestNode) {
      onToggleTargetNode(closestNode.id);
      return;
    }

    // 2. Check if clicked edge
    if (hoveredEdge) {
      onToggleTargetEdge(hoveredEdge.id);
    }
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.4, Math.min(2.5, prev.scale * zoomFactor)),
    }));
  };

  // Pan Start / End
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || e.shiftKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const resetZoom = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full bg-blueprint-grid flex items-center justify-center overflow-hidden select-none ${
        isDark ? 'bg-[#090c15]' : 'bg-[#f8fafc]'
      }`}
    >
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className={`w-full h-full block cursor-${hoveredNode || hoveredEdge ? 'pointer' : isPanning ? 'grabbing' : 'crosshair'}`}
      />

      {/* Interactive Floating Hover Tooltip Card */}
      {hoveredNode && (
        <div
          style={{
            left: `${Math.min(canvasSize.width - 310, Math.max(16, mousePos.x + 20))}px`,
            top: `${Math.max(16, Math.min(canvasSize.height - 230, mousePos.y - 80))}px`,
          }}
          className={`absolute z-40 p-4 backdrop-blur-2xl rounded-3xl border shadow-2xl w-72 pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95 ${
            isDark 
              ? 'bg-[#0f1422]/95 border-white/[0.12] text-white shadow-black/80' 
              : 'bg-white/95 border-slate-200/90 text-slate-900 shadow-[0_12px_36px_rgba(0,0,0,0.12)]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border ${
              isDark ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 'text-blue-700 bg-blue-50 border-blue-200'
            }`}>
              Tier {hoveredNode.tier} • {hoveredNode.type.replace('_', ' ')}
            </span>
            <span
              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                attackedNodeSet.has(hoveredNode.id)
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : isolatedNodeSet.has(hoveredNode.id)
                  ? isDark ? 'bg-white/[0.06] text-slate-400 border border-white/[0.08]' : 'bg-slate-100 text-slate-600 border border-slate-200'
                  : isDark ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
              }`}
            >
              {attackedNodeSet.has(hoveredNode.id)
                ? 'TARGETED'
                : isolatedNodeSet.has(hoveredNode.id)
                ? 'ISOLATED'
                : 'HEALTHY'}
            </span>
          </div>

          <h4 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{hoveredNode.name}</h4>
          
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-mono">
            <div className={`p-2 rounded-xl border ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-slate-50 border-slate-200/60'}`}>
              <span className="text-[9px] uppercase text-slate-400 block">Bandwidth</span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{hoveredNode.capacity} Gbps</span>
            </div>
            <div className={`p-2 rounded-xl border ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-slate-50 border-slate-200/60'}`}>
              <span className="text-[9px] uppercase text-slate-400 block">Topology ID</span>
              <span className={`font-bold truncate block ${isDark ? 'text-white' : 'text-slate-900'}`}>{hoveredNode.id}</span>
            </div>
          </div>

          <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] font-medium ${isDark ? 'border-white/[0.06] text-slate-400' : 'border-slate-100 text-slate-500'}`}>
            <span>Click node to target/isolate</span>
            <Crosshair className="w-3.5 h-3.5 text-rose-500" />
          </div>
        </div>
      )}

      {/* Interactive Edge Hover Card */}
      {hoveredEdge && !hoveredNode && (
        <div
          style={{
            left: `${Math.min(canvasSize.width - 290, Math.max(16, mousePos.x + 20))}px`,
            top: `${Math.max(16, Math.min(canvasSize.height - 150, mousePos.y - 60))}px`,
          }}
          className={`absolute z-40 p-3 backdrop-blur-2xl rounded-2xl border shadow-xl pointer-events-none text-xs space-y-1 font-mono animate-in fade-in ${
            isDark 
              ? 'bg-[#0f1422]/95 border-white/[0.12] text-white shadow-black/80' 
              : 'bg-white/95 border-slate-200/90 text-slate-900 shadow-[0_8px_24px_rgba(0,0,0,0.1)]'
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            <Zap className="w-3.5 h-3.5 text-blue-500" />
            <span>Link: {hoveredEdge.source} ↔ {hoveredEdge.target}</span>
          </div>
          <div className={`flex items-center gap-3 text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            <span>Capacity: <strong>{hoveredEdge.capacity}G</strong></span>
            <span>Latency: <strong>{hoveredEdge.latency}ms</strong></span>
            <span className={attackedEdgeSet.has(hoveredEdge.id) ? 'text-rose-500 font-bold' : 'text-emerald-500'}>
              {attackedEdgeSet.has(hoveredEdge.id) ? 'SEVERED' : 'ONLINE'}
            </span>
          </div>
          <div className={`text-[10px] pt-1 border-t ${isDark ? 'border-white/[0.06] text-slate-400' : 'border-slate-100 text-slate-400'}`}>
            Click link to sever/restore connection
          </div>
        </div>
      )}

      {/* Floating Canvas Legend & Quick Controls */}
      <div className={`absolute top-4 left-4 p-3.5 backdrop-blur-xl rounded-3xl border text-xs space-y-2 pointer-events-none shadow-xl ${
        isDark ? 'bg-[#0f1422]/90 border-white/[0.08] text-white shadow-black/60' : 'bg-white/90 border-slate-200/90 text-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.06)]'
      }`}>
        <div className={`font-mono text-[10px] uppercase font-bold tracking-wider flex items-center justify-between gap-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <span>Live Simulation Canvas</span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${isDark ? 'bg-white/[0.06] text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
            Zoom {Math.round(transform.scale * 100)}%
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
          <span className={`text-[11px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Active Ingress Root / Backbone</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
          <span className={`text-[11px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Targeted / Disrupted Node</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
          <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Isolated Subgraph</span>
        </div>
      </div>

      {/* Floating Canvas Navigation Toolbar */}
      <div className={`absolute bottom-4 right-4 flex items-center gap-2 backdrop-blur-xl p-1.5 rounded-2xl border shadow-xl ${
        isDark ? 'bg-[#0f1422]/90 border-white/[0.08] shadow-black/60' : 'bg-white/90 border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
      }`}>
        <button
          onClick={() => setTransform(prev => ({ ...prev, scale: Math.min(2.5, prev.scale * 1.15) }))}
          className={`w-8 h-8 rounded-xl font-bold text-sm flex items-center justify-center transition-colors cursor-pointer ${
            isDark ? 'bg-white/[0.06] hover:bg-white/[0.12] text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
          }`}
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => setTransform(prev => ({ ...prev, scale: Math.max(0.4, prev.scale * 0.85) }))}
          className={`w-8 h-8 rounded-xl font-bold text-sm flex items-center justify-center transition-colors cursor-pointer ${
            isDark ? 'bg-white/[0.06] hover:bg-white/[0.12] text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
          }`}
          title="Zoom Out"
        >
          −
        </button>
        <button
          onClick={resetZoom}
          className={`px-2.5 h-8 rounded-xl font-mono text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
            isDark ? 'bg-white/[0.06] hover:bg-white/[0.12] text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
          }`}
          title="Reset Canvas View"
        >
          100%
        </button>
      </div>
    </div>
  );
};
