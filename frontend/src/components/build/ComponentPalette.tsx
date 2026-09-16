import React from 'react';
import { 
  Globe, 
  Router, 
  Database, 
  Network, 
  Cpu, 
  Wifi, 
  Monitor, 
  Radio, 
  Layers,
  Info
} from 'lucide-react';
import { NodeType } from '@/lib/types';

interface PaletteItem {
  type: NodeType;
  name: string;
  tier: 1 | 2 | 3;
  capacity: number;
  description: string;
  icon: React.ElementType;
}

const PALETTE_ITEMS: PaletteItem[] = [
  // Tier 1 - Core Backbone
  { type: 'gateway', name: 'Internet Gateway', tier: 1, capacity: 100, description: 'Primary edge ingress from Tier-1 transit', icon: Globe },
  { type: 'core_router', name: 'Core Backbone Router', tier: 1, capacity: 80, description: 'High-throughput packet routing engine', icon: Router },
  { type: 'datacenter', name: 'Data Center Cluster', tier: 1, capacity: 60, description: 'High-availability compute & database cluster', icon: Database },
  // Tier 2 - Distribution
  { type: 'switch', name: 'Distribution Switch', tier: 2, capacity: 40, description: 'L3 aggregation packet switch', icon: Network },
  { type: 'regional_hub', name: 'Regional Hub', tier: 2, capacity: 30, description: 'Zone distribution fiber aggregator', icon: Cpu },
  // Tier 3 - Edge & Access
  { type: 'access_point', name: 'Wireless AP 6E', tier: 3, capacity: 15, description: 'High-density client wireless access', icon: Wifi },
  { type: 'workstation', name: 'Workstation Terminal', tier: 3, capacity: 10, description: 'End-user client endpoint workstation', icon: Monitor },
  { type: 'iot_device', name: 'Smart IoT Controller', tier: 3, capacity: 5, description: 'Facility telemetry and sensor node', icon: Radio },
];

export const ComponentPalette: React.FC = () => {
  const onDragStart = (event: React.DragEvent, item: PaletteItem) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(item));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-72 bg-white/95 dark:bg-[#0f1422]/95 backdrop-blur-xl border-r border-slate-200/80 dark:border-white/[0.08] flex flex-col h-full z-10 select-none shadow-[1px_0_3px_rgba(0,0,0,0.02)]">
      {/* Header */}
      <div className="p-4 border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
              Component Palette
            </h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]">
            8 Items
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          Drag elements onto canvas to architect topology.
        </p>
      </div>

      {/* Item Categories */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {/* Tier 1 Section */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] font-mono font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
              Tier 1 • Core Ingress
            </span>
          </div>
          <div className="space-y-2">
            {PALETTE_ITEMS.filter(i => i.tier === 1).map(item => (
              <PaletteCard key={item.type} item={item} onDragStart={onDragStart} />
            ))}
          </div>
        </div>

        {/* Tier 2 Section */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] font-mono font-semibold tracking-wider text-purple-600 dark:text-purple-400 uppercase">
              Tier 2 • Distribution
            </span>
          </div>
          <div className="space-y-2">
            {PALETTE_ITEMS.filter(i => i.tier === 2).map(item => (
              <PaletteCard key={item.type} item={item} onDragStart={onDragStart} />
            ))}
          </div>
        </div>

        {/* Tier 3 Section */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Tier 3 • Edge & Access
            </span>
          </div>
          <div className="space-y-2">
            {PALETTE_ITEMS.filter(i => i.tier === 3).map(item => (
              <PaletteCard key={item.type} item={item} onDragStart={onDragStart} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3.5 border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.02] text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0 mt-0.5" />
        <span className="leading-snug">
          Drag handles between nodes to connect links.
        </span>
      </div>
    </aside>
  );
};

interface PaletteCardProps {
  item: PaletteItem;
  onDragStart: (e: React.DragEvent, item: PaletteItem) => void;
}

const PaletteCard: React.FC<PaletteCardProps> = ({ item, onDragStart }) => {
  const Icon = item.icon;

  const iconBg =
    item.tier === 1
      ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20'
      : item.tier === 2
      ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-500/20'
      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, item)}
      className="p-2.5 rounded-2xl bg-white dark:bg-[#141a2c] hover:bg-slate-50/80 dark:hover:bg-[#1a233a] border border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.18] cursor-grab active:cursor-grabbing transition-all duration-150 group shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none hover:shadow-sm"
    >
      <div className="flex items-center gap-2.5">
        <div className={`p-2 rounded-xl border ${iconBg} group-hover:scale-105 transition-transform shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
              {item.name}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 font-medium border border-transparent dark:border-white/[0.04]">
              {item.capacity}G
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
};
