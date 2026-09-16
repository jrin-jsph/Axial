import React, { useRef, useEffect, useState } from 'react';
import { NetworkGraph, AppNode } from '@/lib/types';
import { ShieldAlert, Zap } from 'lucide-react';

interface AnalyzeCanvasProps {
  graph: NetworkGraph;
  attackedNodes: string[];
  attackedEdges: string[];
  isolatedNodes: string[];
  mengerPaths?: string[][];
  onToggleTargetNode: (nodeId: string) => void;
  onToggleTargetEdge: (edgeId: string) => void;
}

const MENGER_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];

export const AnalyzeCanvas: React.FC<AnalyzeCanvasProps> = ({
  graph,
  attackedNodes,
  attackedEdges,
  isolatedNodes,
  mengerPaths = [],
  onToggleTargetNode,
  onToggleTargetEdge,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const attackedNodeSet = new Set(attackedNodes);
  const attackedEdgeSet = new Set(attackedEdges);
  const isolatedNodeSet = new Set(isolatedNodes);

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

    const render = () => {
      particleOffset = (particleOffset + 0.6) % 100;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

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

        const edgeKey = `${edge.source}-${edge.target}`;
        const mengerColor = mengerEdgeColors.current.get(edgeKey);

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);

        if (isEdgeAttacked) {
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([5, 5]);
        } else if (mengerColor) {
          ctx.strokeStyle = mengerColor;
          ctx.lineWidth = 3.5;
          ctx.setLineDash([]);
          ctx.shadowColor = mengerColor;
          ctx.shadowBlur = 10;
        } else {
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.35)';
          ctx.lineWidth = 1.5;
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
          const numParticles = Math.max(1, Math.floor(dist / 65));

          for (let p = 0; p < numParticles; p++) {
            const progress = ((particleOffset / 100) + (p / numParticles)) % 1;
            const px = source.x + dx * progress;
            const py = source.y + dy * progress;

            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = mengerColor || '#60a5fa';
            ctx.shadowColor = mengerColor || '#60a5fa';
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      });

      // 2. Draw Nodes
      graph.nodes.forEach(node => {
        const isAttacked = attackedNodeSet.has(node.id);
        const isIsolated = isolatedNodeSet.has(node.id);
        const isRoot = graph.root_id === node.id || node.tier === 1;

        ctx.save();
        ctx.translate(node.x, node.y);

        // Node Glow Halo
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);

        if (isAttacked) {
          ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 16;
        } else if (isIsolated) {
          ctx.fillStyle = 'rgba(15, 20, 34, 0.7)';
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1.5;
        } else if (isRoot) {
          ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#3b82f6';
          ctx.shadowBlur = 14;
        } else {
          ctx.fillStyle = 'rgba(16, 22, 38, 0.9)';
          ctx.strokeStyle = node.tier === 2 ? '#6366f1' : 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 1.5;
        }

        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Center dot
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fillStyle = isAttacked ? '#f43f5e' : isIsolated ? '#475569' : isRoot ? '#60a5fa' : '#a5b4fc';
        ctx.fill();

        // Node Label
        ctx.font = '600 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = isAttacked ? '#fb7185' : isIsolated ? '#64748b' : '#f8fafc';
        ctx.fillText(node.name, 0, 38);

        // Capacity badge
        ctx.font = '500 9px monospace';
        ctx.fillStyle = isIsolated ? '#475569' : '#93c5fd';
        ctx.fillText(`${node.capacity}G`, 0, -30);

        ctx.restore();
      });

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [graph, attackedNodes, attackedEdges, isolatedNodes, mengerPaths]);

  // Handle canvas click to toggle target attack node
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const node of graph.nodes) {
      const dx = node.x - x;
      const dy = node.y - y;
      if (Math.sqrt(dx * dx + dy * dy) <= 30) {
        onToggleTargetNode(node.id);
        return;
      }
    }
  };

  return (
    <div className="relative w-full h-full bg-[#090c15] bg-blueprint-grid flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        width={1100}
        height={650}
        onClick={handleCanvasClick}
        className="cursor-pointer"
      />

      {/* Floating Canvas Legend */}
      <div className="absolute top-4 left-4 p-3.5 bg-[#0f1422]/85 backdrop-blur-xl rounded-2xl border border-white/[0.08] text-xs space-y-2 pointer-events-none shadow-xl shadow-black/50">
        <div className="font-mono text-[10px] uppercase font-semibold tracking-wider text-slate-400">
          Topology Canvas Legend
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
          <span className="text-slate-300 text-[11px] font-medium">Active Ingress Root / Node</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
          <span className="text-slate-300 text-[11px] font-medium">Targeted / Disrupted Node</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
          <span className="text-slate-400 text-[11px] font-medium">Isolated Subgraph</span>
        </div>
      </div>
    </div>
  );
};
