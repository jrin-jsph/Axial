import React from 'react';
import { X, Trash2, ShieldAlert, Wifi, Cpu, Settings, ArrowRightLeft, Sliders, CheckCircle2 } from 'lucide-react';
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
    <div className="w-84 bg-[#0c101c]/95 backdrop-blur-2xl border-l border-white/[0.08] flex flex-col h-full z-20 shadow-2xl shadow-black/80">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              {selectedNode ? 'Component Properties' : 'Link Properties'}
            </h3>
            <p className="text-[10px] text-slate-400">Configuration Inspector</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {selectedNode && (
          <>
            {/* Node Name */}
            <div>
              <label className="text-[10px] font-mono uppercase font-semibold text-slate-400 block mb-1.5">
                Component Name
              </label>
              <input
                type="text"
                value={selectedNode.name}
                onChange={e => onUpdateNode({ ...selectedNode, name: e.target.value })}
                className="w-full bg-[#131929] border border-white/[0.08] focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors shadow-inner"
              />
            </div>

            {/* Component Type */}
            <div>
              <label className="text-[10px] font-mono uppercase font-semibold text-slate-400 block mb-1.5">
                Architecture Class
              </label>
              <select
                value={selectedNode.type}
                onChange={e => onUpdateNode({ ...selectedNode, type: e.target.value as NodeType })}
                className="w-full bg-[#131929] border border-white/[0.08] focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors"
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
                <label className="text-[10px] font-mono uppercase font-semibold text-slate-400 block mb-1.5">
                  Tier Hierarchy
                </label>
                <select
                  value={selectedNode.tier}
                  onChange={e => onUpdateNode({ ...selectedNode, tier: Number(e.target.value) as 1 | 2 | 3 })}
                  className="w-full bg-[#131929] border border-white/[0.08] focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                >
                  <option value={1}>Tier 1 (Core)</option>
                  <option value={2}>Tier 2 (Distro)</option>
                  <option value={3}>Tier 3 (Edge)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase font-semibold text-slate-400 block mb-1.5">
                  Throughput (Gbps)
                </label>
                <input
                  type="number"
                  value={selectedNode.capacity}
                  min={1}
                  max={1000}
                  onChange={e => onUpdateNode({ ...selectedNode, capacity: Math.max(1, Number(e.target.value)) })}
                  className="w-full bg-[#131929] border border-white/[0.08] focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none transition-colors font-mono shadow-inner"
                />
              </div>
            </div>

            {/* Health Status */}
            <div>
              <label className="text-[10px] font-mono uppercase font-semibold text-slate-400 block mb-1.5">
                Operational State
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['active', 'damaged', 'offline'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => onUpdateNode({ ...selectedNode, status })}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-mono uppercase font-semibold border transition-all cursor-pointer ${
                      selectedNode.status === status
                        ? status === 'active'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : status === 'damaged'
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          : 'bg-white/[0.06] border-white/[0.12] text-slate-300'
                        : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:border-white/[0.1]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Root Gateway & Delete Actions */}
            <div className="pt-3 border-t border-white/[0.08] space-y-2.5">
              <button
                onClick={() => onSetRoot(selectedNode.id)}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  rootId === selectedNode.id
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    : 'bg-white/[0.03] border-white/[0.08] text-slate-300 hover:border-white/[0.15] hover:bg-white/[0.06]'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>{rootId === selectedNode.id ? 'Designated Ingress Root' : 'Set as Primary Gateway Root'}</span>
              </button>

              <button
                onClick={() => onDeleteNode(selectedNode.id)}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-medium bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Component</span>
              </button>
            </div>
          </>
        )}

        {selectedEdge && (
          <>
            <div className="p-3.5 bg-[#131929] rounded-xl border border-white/[0.08] text-xs space-y-1">
              <div className="flex items-center gap-2 text-slate-300">
                <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-mono text-[11px] font-medium">{selectedEdge.source} ↔ {selectedEdge.target}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono uppercase font-semibold text-slate-400 block mb-1.5">
                  Bandwidth (Gbps)
                </label>
                <input
                  type="number"
                  value={selectedEdge.capacity}
                  min={1}
                  max={500}
                  onChange={e => onUpdateEdge({ ...selectedEdge, capacity: Math.max(1, Number(e.target.value)) })}
                  className="w-full bg-[#131929] border border-white/[0.08] focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none transition-colors font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase font-semibold text-slate-400 block mb-1.5">
                  Latency (ms)
                </label>
                <input
                  type="number"
                  value={selectedEdge.latency}
                  min={1}
                  max={200}
                  onChange={e => onUpdateEdge({ ...selectedEdge, latency: Math.max(1, Number(e.target.value)) })}
                  className="w-full bg-[#131929] border border-white/[0.08] focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase font-semibold text-slate-400 block mb-1.5">
                Link Health State
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['active', 'damaged', 'offline'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => onUpdateEdge({ ...selectedEdge, status })}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-mono uppercase font-semibold border transition-all cursor-pointer ${
                      selectedEdge.status === status
                        ? status === 'active'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : status === 'damaged'
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          : 'bg-white/[0.06] border-white/[0.12] text-slate-300'
                        : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:border-white/[0.1]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08]">
              <button
                onClick={() => onDeleteEdge(selectedEdge.id)}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-medium bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
