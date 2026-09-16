import React from 'react';
import { X, Trash2, Cpu, ArrowRightLeft, Sliders } from 'lucide-react';
import { AppNode, AppEdge, NodeType } from '@/lib/types';

interface InspectorDrawerProps {
  selectedNode: AppNode | null;
  selectedEdge: AppEdge | null;
  rootId?: string;
  onUpdateNode: (updated: AppNode) => void;
  onUpdateEdge: (updated: AppEdge) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onSetRoot: (id: string) => void;
  onClose: () => void;
}

export const InspectorDrawer: React.FC<InspectorDrawerProps> = ({
  selectedNode,
  selectedEdge,
  rootId,
  onUpdateNode,
  onUpdateEdge,
  onDeleteNode,
  onDeleteEdge,
  onSetRoot,
  onClose,
}) => {
  if (!selectedNode && !selectedEdge) return null;

  return (
    <div className="w-80 bg-white/95 dark:bg-[#0f1422]/95 backdrop-blur-2xl border-l border-slate-200/80 dark:border-white/[0.08] flex flex-col h-full z-20 shadow-[-4px_0_24px_rgba(0,0,0,0.04)] dark:shadow-[-4px_0_24px_rgba(0,0,0,0.4)]">
      {/* Header */}
      <div className="p-4 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
              {selectedNode ? 'Component Properties' : 'Link Properties'}
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Inspector & Configuration</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {selectedNode && (
          <>
            {/* Node Name */}
            <div>
              <label className="text-[10px] font-mono uppercase font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Component Name
              </label>
              <input
                type="text"
                value={selectedNode.name}
                onChange={e => onUpdateNode({ ...selectedNode, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-[#141a2c] border border-slate-200 dark:border-white/[0.08] focus:border-slate-900 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#182035] rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-colors"
              />
            </div>

            {/* Component Type */}
            <div>
              <label className="text-[10px] font-mono uppercase font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Architecture Class
              </label>
              <select
                value={selectedNode.type}
                onChange={e => onUpdateNode({ ...selectedNode, type: e.target.value as NodeType })}
                className="w-full bg-slate-50 dark:bg-[#141a2c] border border-slate-200 dark:border-white/[0.08] focus:border-slate-900 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#182035] rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none transition-colors"
              >
                <option value="gateway">Internet Gateway (Tier 1)</option>
                <option value="core_router">Core Backbone Router (Tier 1)</option>
                <option value="datacenter">Data Center Server Cluster (Tier 1)</option>
                <option value="switch">Distribution Switch (Tier 2)</option>
                <option value="regional_hub">Regional Hub / Aggregator (Tier 2)</option>
                <option value="access_point">Wireless Access Point (Tier 3)</option>
                <option value="workstation">Workstation Terminal (Tier 3)</option>
                <option value="iot_device">Smart IoT Controller (Tier 3)</option>
              </select>
            </div>

            {/* Tier & Capacity Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono uppercase font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Tier
                </label>
                <select
                  value={selectedNode.tier}
                  onChange={e => onUpdateNode({ ...selectedNode, tier: Number(e.target.value) as 1 | 2 | 3 })}
                  className="w-full bg-slate-50 dark:bg-[#141a2c] border border-slate-200 dark:border-white/[0.08] focus:border-slate-900 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#182035] rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none transition-colors"
                >
                  <option value={1}>Tier 1 (Core)</option>
                  <option value={2}>Tier 2 (Distro)</option>
                  <option value={3}>Tier 3 (Edge)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Throughput (Gbps)
                </label>
                <input
                  type="number"
                  value={selectedNode.capacity}
                  min={1}
                  max={1000}
                  onChange={e => onUpdateNode({ ...selectedNode, capacity: Math.max(1, Number(e.target.value)) })}
                  className="w-full bg-slate-50 dark:bg-[#141a2c] border border-slate-200 dark:border-white/[0.08] focus:border-slate-900 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#182035] rounded-xl px-3.5 py-2 text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Health Status */}
            <div>
              <label className="text-[10px] font-mono uppercase font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                Operational State
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['active', 'damaged', 'offline'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => onUpdateNode({ ...selectedNode, status })}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-mono uppercase font-semibold border transition-all cursor-pointer ${
                      selectedNode.status === status
                        ? status === 'active'
                          ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 shadow-sm'
                          : status === 'damaged'
                          ? 'bg-rose-50 dark:bg-rose-500/20 border-rose-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-400 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 shadow-sm'
                        : 'bg-white dark:bg-[#141a2c] border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/[0.2]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Root Gateway & Delete Actions */}
            <div className="pt-3 border-t border-slate-200/80 dark:border-white/[0.08] space-y-2">
              <button
                onClick={() => onSetRoot(selectedNode.id)}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  rootId === selectedNode.id
                    ? 'bg-blue-50 dark:bg-blue-500/20 border-blue-200 dark:border-blue-500/40 text-blue-700 dark:text-blue-400 shadow-sm'
                    : 'bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200/80 dark:hover:bg-white/[0.1] border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>{rootId === selectedNode.id ? 'Designated Ingress Root' : 'Set as Gateway Root'}</span>
              </button>

              <button
                onClick={() => onDeleteNode(selectedNode.id)}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Component</span>
              </button>
            </div>
          </>
        )}

        {selectedEdge && (
          <>
            <div className="p-3.5 bg-slate-50 dark:bg-[#141a2c] rounded-2xl border border-slate-200 dark:border-white/[0.08] text-xs space-y-1">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="font-mono text-[11px] font-semibold">{selectedEdge.source} ↔ {selectedEdge.target}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono uppercase font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Bandwidth (Gbps)
                </label>
                <input
                  type="number"
                  value={selectedEdge.capacity}
                  min={1}
                  max={500}
                  onChange={e => onUpdateEdge({ ...selectedEdge, capacity: Math.max(1, Number(e.target.value)) })}
                  className="w-full bg-slate-50 dark:bg-[#141a2c] border border-slate-200 dark:border-white/[0.08] focus:border-slate-900 dark:focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Latency (ms)
                </label>
                <input
                  type="number"
                  value={selectedEdge.latency}
                  min={1}
                  max={200}
                  onChange={e => onUpdateEdge({ ...selectedEdge, latency: Math.max(1, Number(e.target.value)) })}
                  className="w-full bg-slate-50 dark:bg-[#141a2c] border border-slate-200 dark:border-white/[0.08] focus:border-slate-900 dark:focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                Link Health State
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['active', 'damaged', 'offline'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => onUpdateEdge({ ...selectedEdge, status })}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-mono uppercase font-semibold border transition-all cursor-pointer ${
                      selectedEdge.status === status
                        ? status === 'active'
                          ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 shadow-sm'
                          : status === 'damaged'
                          ? 'bg-rose-50 dark:bg-rose-500/20 border-rose-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-400 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 shadow-sm'
                        : 'bg-white dark:bg-[#141a2c] border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/[0.2]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/80 dark:border-white/[0.08]">
              <button
                onClick={() => onDeleteEdge(selectedEdge.id)}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Disconnect Link</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
