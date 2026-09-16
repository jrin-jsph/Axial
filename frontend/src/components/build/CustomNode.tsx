import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  Globe, Router, Database, Network, Cpu, Wifi, Monitor, Radio, AlertTriangle
} from 'lucide-react';
import { NodeType } from '@/lib/types';

const ICON_MAP: Record<NodeType, React.ElementType> = {
  gateway: Globe,
  core_router: Router,
  datacenter: Database,
  switch: Network,
  regional_hub: Cpu,
  access_point: Wifi,
  workstation: Monitor,
  iot_device: Radio,
};

export interface CustomNodeData extends Record<string, unknown> {
  name: string;
  type: NodeType;
  tier: 1 | 2 | 3;
  capacity: number;
  status: 'active' | 'damaged' | 'offline';
  isSelected?: boolean;
}

export const CustomNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as CustomNodeData;
  const IconComponent = ICON_MAP[nodeData.type] || Network;

  const isDamaged = nodeData.status === 'damaged';
  const isOffline = nodeData.status === 'offline';

  const tierColors = {
    1: { border: 'border-blue-500/40', text: 'text-blue-400', bg: 'bg-blue-500/10' },
    2: { border: 'border-indigo-500/40', text: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    3: { border: 'border-slate-600/40', text: 'text-slate-300', bg: 'bg-white/[0.04]' },
  }[nodeData.tier] || { border: 'border-slate-600/40', text: 'text-slate-300', bg: 'bg-white/[0.04]' };

  return (
    <div
      className={`relative px-4 py-3.5 rounded-2xl border backdrop-blur-xl transition-all duration-200 min-w-[185px] select-none shadow-xl ${
        isDamaged
          ? 'bg-rose-950/80 border-rose-500/80 shadow-rose-500/20 animate-pulse-ring'
          : isOffline
          ? 'bg-[#0f1422]/60 border-white/[0.05] opacity-40 grayscale'
          : 'bg-[#101626]/90 border-white/[0.08] hover:border-white/[0.16] shadow-black/40'
      } ${selected ? '!border-blue-500 ring-2 ring-blue-500/40 scale-105 shadow-2xl' : ''}`}
    >
      {/* React Flow Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-400 !w-2.5 !h-2.5 !border-2 !border-[#101626] hover:!scale-150 transition-transform"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="target-left"
        className="!bg-blue-400 !w-2.5 !h-2.5 !border-2 !border-[#101626] hover:!scale-150 transition-transform"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-400 !w-2.5 !h-2.5 !border-2 !border-[#101626] hover:!scale-150 transition-transform"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="source-right"
        className="!bg-blue-400 !w-2.5 !h-2.5 !border-2 !border-[#101626] hover:!scale-150 transition-transform"
      />

      <div className="flex items-center gap-3">
        {/* Node Icon Container */}
        <div
          className={`p-2.5 rounded-xl border ${
            isDamaged
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              : `${tierColors.bg} ${tierColors.text} ${tierColors.border}`
          }`}
        >
          {isDamaged ? <AlertTriangle className="w-4.5 h-4.5" /> : <IconComponent className="w-4.5 h-4.5" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[9px] font-mono tracking-wider uppercase font-semibold text-slate-400">
              Tier {nodeData.tier}
            </span>
            <span
              className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md font-semibold ${
                isDamaged
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'bg-white/[0.06] text-blue-300 border border-white/[0.06]'
              }`}
            >
              {nodeData.capacity}G
            </span>
          </div>

          <div className="text-xs font-semibold truncate text-white tracking-tight">
            {nodeData.name}
          </div>
        </div>
      </div>
    </div>
  );
});

CustomNode.displayName = 'CustomNode';
