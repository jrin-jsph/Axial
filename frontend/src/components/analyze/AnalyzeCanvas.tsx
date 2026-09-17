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
  Info,
  Radio,
  Flame,
  Volume2,
  VolumeX
} from 'lucide-react';
import { soundFx } from '@/lib/soundEffects';

interface AnalyzeCanvasProps {
  graph: NetworkGraph;
  attackedNodes: string[];
  attackedEdges: string[];
  isolatedNodes: string[];
  mengerPaths?: string[][];
  onToggleTargetNode: (nodeId: string) => void;
  onToggleTargetEdge: (edgeId: string) => void;
  theme?: 'light' | 'dark';
  isSimulating?: boolean;
  stepNumber?: number;
  attackTriggerId?: number;
}

const MENGER_COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#db2777'];

interface LaserBeam {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  progress: number;
  speed: number;
  hasImpacted: boolean;
  targetId: string;
}

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

interface ShockwaveFX {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export const AnalyzeCanvas: React.FC<AnalyzeCanvasProps> = ({
  graph,
  attackedNodes,
  attackedEdges,
  isolatedNodes,
  mengerPaths = [],
  onToggleTargetNode,
  onToggleTargetEdge,
  theme = 'light',
  isSimulating = false,
  stepNumber = 1,
  attackTriggerId = 0,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isDark = theme === 'dark';

  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 1200, height: 700 });
  const [hoveredNode, setHoveredNode] = useState<AppNode | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<AppEdge | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isScreenShaking, setIsScreenShaking] = useState<boolean>(false);

  // Pan & Zoom Transform State
  const [transform, setTransform] = useState<{ x: number; y: number; scale: number }>({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const attackedNodeSet = new Set(attackedNodes);
  const attackedEdgeSet = new Set(attackedEdges);
  const isolatedNodeSet = new Set(isolatedNodes);

  // Dynamic FX references across frames
  const beamsRef = useRef<LaserBeam[]>([]);
  const particlesRef = useRef<SparkParticle[]>([]);
  const shockwavesRef = useRef<ShockwaveFX[]>([]);

  // Trigger screen shake
  const triggerScreenShake = useCallback(() => {
    setIsScreenShaking(true);
    setTimeout(() => {
      setIsScreenShaking(false);
    }, 450);
  }, []);

  // Spawn Laser Beams & Blast Particles when Attack is triggered
  useEffect(() => {
    if (attackTriggerId === 0 || (attackedNodes.length === 0 && attackedEdges.length === 0)) return;

    const nodeMap = new Map<string, AppNode>();
    graph.nodes.forEach(n => nodeMap.set(n.id, n));

    const newBeams: LaserBeam[] = [];

    attackedNodes.forEach((nodeId, idx) => {
      const node = nodeMap.get(nodeId);
      if (!node) return;

      // Spawn beam from above/angles outside canvas
      const angle = (idx % 2 === 0 ? -1 : 1) * (0.3 + Math.random() * 0.4);
      const startX = node.x + Math.sin(angle) * 700;
      const startY = node.y - 650;

      newBeams.push({
        id: `beam-${nodeId}-${Date.now()}-${idx}`,
        startX,
        startY,
        targetX: node.x,
        targetY: node.y,
        progress: 0,
        speed: 0.045 + Math.random() * 0.02,
        hasImpacted: false,
        targetId: nodeId,
      });
    });

    beamsRef.current = newBeams;
  }, [attackTriggerId, attackedNodes, graph.nodes]);

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
    let globalAngle = 0;

    const render = () => {
      particleOffset = (particleOffset + 0.8) % 100;
      shockwaveRadius = (shockwaveRadius + 0.5) % 40;
      globalAngle = (globalAngle + 0.03) % (Math.PI * 2);

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

        // Electric lightning sparks along attacked / damaged links
        if (isEdgeAttacked && isSimulating) {
          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;
          
          if (Math.random() < 0.3) {
            particlesRef.current.push({
              x: midX + (Math.random() - 0.5) * 30,
              y: midY + (Math.random() - 0.5) * 30,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              size: Math.random() * 2.5 + 1.5,
              color: '#f43f5e',
              alpha: 1,
              decay: 0.04,
            });
          }

          // Draw jittery electrical lightning arc
          ctx.beginPath();
          ctx.moveTo(source.x, source.y);
          const segments = 4;
          for (let s = 1; s < segments; s++) {
            const frac = s / segments;
            const sx = source.x + (target.x - source.x) * frac + (Math.random() - 0.5) * 8;
            const sy = source.y + (target.y - source.y) * frac + (Math.random() - 0.5) * 8;
            ctx.lineTo(sx, sy);
          }
          ctx.lineTo(target.x, target.y);
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 6;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

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

      // 2. Draw Active Laser Orbital Beams
      beamsRef.current.forEach(beam => {
        beam.progress += beam.speed;

        const currentX = beam.startX + (beam.targetX - beam.startX) * Math.min(1, beam.progress);
        const currentY = beam.startY + (beam.targetY - beam.startY) * Math.min(1, beam.progress);

        const tailProgress = Math.max(0, beam.progress - 0.25);
        const tailX = beam.startX + (beam.targetX - beam.startX) * tailProgress;
        const tailY = beam.startY + (beam.targetY - beam.startY) * tailProgress;

        // Draw glowing laser trajectory
        const grad = ctx.createLinearGradient(tailX, tailY, currentX, currentY);
        grad.addColorStop(0, 'rgba(225, 29, 72, 0)');
        grad.addColorStop(0.5, 'rgba(244, 63, 94, 0.8)');
        grad.addColorStop(1, '#ffffff');

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 4.5;
        ctx.shadowColor = '#e11d48';
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Laser head core flare
        ctx.beginPath();
        ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#fb7185';
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Check if arrived at target node
        if (beam.progress >= 1 && !beam.hasImpacted) {
          beam.hasImpacted = true;
          triggerScreenShake();
          soundFx.playExplosion();

          // Spawn explosion shockwaves
          shockwavesRef.current.push({
            x: beam.targetX,
            y: beam.targetY,
            radius: 8,
            maxRadius: 70,
            alpha: 1,
            color: '#f43f5e',
          });
          shockwavesRef.current.push({
            x: beam.targetX,
            y: beam.targetY,
            radius: 4,
            maxRadius: 45,
            alpha: 1,
            color: '#fbbf24',
          });

          // Spawn burst particles
          for (let i = 0; i < 35; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            particlesRef.current.push({
              x: beam.targetX,
              y: beam.targetY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              size: Math.random() * 3.5 + 1.5,
              color: i % 3 === 0 ? '#ffffff' : i % 2 === 0 ? '#fb7185' : '#f59e0b',
              alpha: 1,
              decay: Math.random() * 0.03 + 0.02,
            });
          }
        }
      });

      // Filter finished beams
      beamsRef.current = beamsRef.current.filter(b => b.progress < 1.3);

      // 3. Draw & Update Shockwaves
      shockwavesRef.current.forEach(sw => {
        sw.radius += 2.5;
        sw.alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);

        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = Math.max(1, 4 * sw.alpha);
        ctx.globalAlpha = sw.alpha;
        ctx.shadowColor = sw.color;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      });
      shockwavesRef.current = shockwavesRef.current.filter(sw => sw.radius < sw.maxRadius);

      // 4. Draw & Update Blast Particles
      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.alpha -= p.decay;

        if (p.alpha > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
        }
      });
      particlesRef.current = particlesRef.current.filter(p => p.alpha > 0);

      // 5. Draw Nodes
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
          ctx.lineWidth = 2;
          ctx.stroke();

          // Continuous subtle sparks while attacked
          if (Math.random() < 0.25) {
            particlesRef.current.push({
              x: node.x + (Math.random() - 0.5) * 30,
              y: node.y + (Math.random() - 0.5) * 30,
              vx: (Math.random() - 0.5) * 3,
              vy: (Math.random() - 0.5) * 3,
              size: Math.random() * 2.5 + 1,
              color: '#f43f5e',
              alpha: 0.9,
              decay: 0.03,
            });
          }
        }

        // Active node pulse halo
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(0, 0, baseRadius + 6, 0, Math.PI * 2);
          ctx.fillStyle = isAttacked ? 'rgba(225, 29, 72, 0.15)' : 'rgba(37, 99, 235, 0.12)';
          ctx.fill();
        }

        // Node Outer Circle
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

        // 6. Holographic Target Reticle for Attacked Nodes
        if (isAttacked) {
          const reticleRadius = baseRadius + 10;
          ctx.save();
          ctx.rotate(globalAngle);

          // 4 Rotating Target Brackets
          const bracketLen = 0.35;
          for (let b = 0; b < 4; b++) {
            const startA = (b * Math.PI) / 2 - bracketLen / 2;
            const endA = (b * Math.PI) / 2 + bracketLen / 2;
            ctx.beginPath();
            ctx.arc(0, 0, reticleRadius, startA, endA);
            ctx.strokeStyle = '#f43f5e';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#f43f5e';
            ctx.shadowBlur = 8;
            ctx.stroke();
          }

          // Target crosshair ticks
          ctx.beginPath();
          ctx.moveTo(-reticleRadius - 4, 0);
          ctx.lineTo(-reticleRadius + 4, 0);
          ctx.moveTo(reticleRadius - 4, 0);
          ctx.lineTo(reticleRadius + 4, 0);
          ctx.moveTo(0, -reticleRadius - 4);
          ctx.lineTo(0, -reticleRadius + 4);
          ctx.moveTo(0, reticleRadius - 4);
          ctx.lineTo(0, reticleRadius + 4);
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.restore();

          // Target tag pill
          ctx.font = '700 8px monospace';
          ctx.fillStyle = '#f43f5e';
          ctx.fillText('TARGET LOCK', 0, -reticleRadius - 6);
        }

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
  }, [graph, attackedNodes, attackedEdges, isolatedNodes, mengerPaths, hoveredNode, hoveredEdge, transform, isDark, canvasSize, isSimulating, triggerScreenShake]);

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
      soundFx.playTargetLock();
      onToggleTargetNode(closestNode.id);
      return;
    }

    // 2. Check if clicked edge
    if (hoveredEdge) {
      soundFx.playTargetLock();
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
      } ${isScreenShaking ? 'animate-screen-shake' : ''}`}
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

      {/* Live Threat Radar Scan Line Effect */}
      {isSimulating && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-rose-500/80 to-transparent shadow-[0_0_15px_#f43f5e] animate-radar-sweep opacity-70" />
        </div>
      )}

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
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold animate-pulse'
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
          <span className="flex items-center gap-1.5">
            {isSimulating ? <Flame className="w-3.5 h-3.5 text-rose-500 animate-bounce" /> : <Activity className="w-3.5 h-3.5 text-blue-500" />}
            <span>{isSimulating ? 'Active Cyber Strike Simulation' : 'Live Topological Canvas'}</span>
          </span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${isDark ? 'bg-white/[0.06] text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
            Zoom {Math.round(transform.scale * 100)}%
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
          <span className={`text-[11px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Active Ingress Root / Backbone</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse" />
          <span className={`text-[11px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Targeted Strike Vector</span>
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

      {/* Empty State Overlay */}
      {graph.nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6 z-10 animate-in fade-in duration-300">
          <div className={`p-8 rounded-3xl border backdrop-blur-2xl max-w-md text-center shadow-2xl space-y-4 pointer-events-auto ${
            isDark 
              ? 'bg-[#0f1422]/90 border-white/[0.08] shadow-black/60 text-white' 
              : 'bg-white/95 border-slate-200 shadow-xl text-slate-900'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mx-auto shadow-sm">
              <Activity className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold tracking-tight">No Active Topology</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Switch to <strong className="text-blue-500">Build Canvas</strong> mode to drag and drop network components, or load a pre-built blueprint template.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
