import React, { useState } from 'react';
import { AppNode, MengerResult } from '@/lib/types';
import { GitCommit, ShieldCheck, ArrowRight, Route } from 'lucide-react';

interface MengerPathPanelProps {
  nodes: AppNode[];
  mengerResult: MengerResult | null;
  onComputeMenger: (sourceId: string, sinkId: string) => void;
}

const PATH_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];

export const MengerPathPanel: React.FC<MengerPathPanelProps> = ({
  nodes,
  mengerResult,
  onComputeMenger,
}) => {
  const [sourceId, setSourceId] = useState<string>(nodes[0]?.id || '');
  const [sinkId, setSinkId] = useState<string>(nodes[nodes.length - 1]?.id || '');

  const handleCompute = () => {
    if (sourceId && sinkId && sourceId !== sinkId) {
      onComputeMenger(sourceId, sinkId);
    }
  };

  return (
    <div className="bg-[#0f1422]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-xl shadow-black/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Route className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
            Menger's Path Engine
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.06]">
          Disjoint Routes
        </span>
      </div>

      <p className="text-[11px] text-slate-400 leading-snug">
        Calculates maximum independent node-disjoint paths between any two endpoints.
      </p>

      {/* Selectors */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="text-[10px] font-mono uppercase font-semibold text-slate-400 block mb-1">
            Source Ingress
          </label>
          <select
            value={sourceId}
            onChange={e => setSourceId(e.target.value)}
            className="w-full bg-[#131929] border border-white/[0.08] focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors"
          >
            {nodes.map(n => (
              <option key={n.id} value={n.id}>{n.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-mono uppercase font-semibold text-slate-400 block mb-1">
            Target Egress
          </label>
          <select
            value={sinkId}
            onChange={e => setSinkId(e.target.value)}
            className="w-full bg-[#131929] border border-white/[0.08] focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors"
          >
            {nodes.map(n => (
              <option key={n.id} value={n.id}>{n.name}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleCompute}
        disabled={sourceId === sinkId}
        className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <ShieldCheck className="w-4 h-4" />
        <span>Compute Independent Paths</span>
      </button>

      {mengerResult && (
        <div className="space-y-2.5 border-t border-white/[0.08] pt-3.5">
          <div className="text-xs font-mono flex items-center justify-between text-slate-300">
            <span className="font-medium text-slate-400">Independent Routes:</span>
            <span className="font-bold text-blue-400 text-sm">{mengerResult.count} Disjoint Paths</span>
          </div>

          <div className="space-y-2">
            {mengerResult.vertex_disjoint_paths.map((path, idx) => {
              const color = PATH_COLORS[idx % PATH_COLORS.length];
              return (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] font-mono flex items-center gap-2"
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: color }} />
                  <span className="text-slate-300 font-semibold shrink-0">Path #{idx + 1}:</span>
                  <span className="text-slate-400 truncate">{path.join(' → ')}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
