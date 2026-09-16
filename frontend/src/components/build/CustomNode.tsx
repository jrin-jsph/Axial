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
    1: { border: 'border-blue-200 dark:border-blue-500/30', text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    2: { border: 'border-purple-200 dark:border-purple-500/30', text: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' },
    3: { border: 'border-slate-200 dark:border-slate-700', text: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800' },
  }[nodeData.tier] || { border: 'border-slate-200 dark:border-slate-700', text: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800' };

  return (
    <div
      className={`relative px-3.5 py-3 rounded-2xl border transition-all duration-200 w-[180px] max-w-[180px] select-none ${
        isDamaged
          ? 'bg-rose-50/95 dark:bg-rose-950/80 border-rose-400 dark:border-rose-500 shadow-lg shadow-rose-200/50 dark:shadow-rose-950/50 animate-pulse-ring'
          : isOffline
          ? 'bg-slate-50 dark:bg-slate-900 border-slate-200/60 dark:border-white/[0.04] opacity-40 grayscale'
          : 'bg-white dark:bg-[#0f1422] border-slate-200/90 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.2] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]'
      } ${selected ? '!border-blue-500 dark:!border-blue-400 ring-2 ring-blue-500/20 shadow-xl scale-[1.03]' : ''}`}
    >
      {/* React Flow Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-slate-400 dark:!bg-slate-600 !w-2.5 !h-2.5 !border-2 !border-white dark:!border-slate-900 hover:!scale-150 transition-transform"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="target-left"
        className="!bg-slate-400 dark:!bg-slate-600 !w-2.5 !h-2.5 !border-2 !border-white dark:!border-slate-900 hover:!scale-150 transition-transform"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-slate-400 dark:!bg-slate-600 !w-2.5 !h-2.5 !border-2 !border-white dark:!border-slate-900 hover:!scale-150 transition-transform"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="source-right"
        className="!bg-slate-400 dark:!bg-slate-600 !w-2.5 !h-2.5 !border-2 !border-white dark:!border-slate-900 hover:!scale-150 transition-transform"
      />

      <div className="flex items-center gap-2.5 min-w-0">
        {/* Node Icon Container */}
        <div
          className={`p-2 rounded-xl border shrink-0 ${
            isDamaged
              ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-500/40'
              : `${tierColors.bg} ${tierColors.text} ${tierColors.border}`
          }`}
        >
          {isDamaged ? <AlertTriangle className="w-4 h-4" /> : <IconComponent className="w-4 h-4" />}
        </div>

        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="text-[9px] font-mono tracking-wider uppercase font-semibold text-slate-400 dark:text-slate-500">
              T{nodeData.tier}
            </span>
            <span
              className={`text-[8.5px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                isDamaged
                  ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300'
                  : 'bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08]'
              }`}
            >
              {nodeData.capacity}G
            </span>
          </div>

          <div 
            className="text-[11px] font-semibold truncate text-slate-900 dark:text-white tracking-tight leading-snug"
            title={nodeData.name}
          >
            {nodeData.name}
          </div>
        </div>
      </div>
    </div>
  );
});

CustomNode.displayName = 'CustomNode';
