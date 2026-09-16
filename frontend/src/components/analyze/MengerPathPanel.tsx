import React, { useState } from 'react';
import { AppNode, MengerResult } from '@/lib/types';
import { ShieldCheck, Route } from 'lucide-react';

interface MengerPathPanelProps {
  nodes: AppNode[];
  mengerResult: MengerResult | null;
  onComputeMenger: (sourceId: string, sinkId: string) => void;
}

const PATH_COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#db2777'];

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
    <div className="bg-white dark:bg-[#0f1422] border border-slate-200/90 dark:border-white/[0.08] rounded-3xl p-5 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] dark:shadow-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Route className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
            Menger's Path Engine
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]">
          Disjoint Routes
        </span>
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
        Calculates maximum independent node-disjoint paths between any two endpoints.
      </p>

      {/* Selectors */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="text-[10px] font-mono uppercase font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Source Ingress
          </label>
          <select
            value={sourceId}
            onChange={e => setSourceId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#141a2c] border border-slate-200 dark:border-white/[0.08] focus:border-slate-900 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#182035] rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none transition-colors"
          >
            {nodes.map(n => (
              <option key={n.id} value={n.id}>{n.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-mono uppercase font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Target Egress
          </label>
          <select
            value={sinkId}
            onChange={e => setSinkId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#141a2c] border border-slate-200 dark:border-white/[0.08] focus:border-slate-900 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#182035] rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none transition-colors"
          >
            {nodes.map(n => (
              <option key={n.id} value={n.id}>{n.name}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleCompute}
        disabled={sourceId === sinkId || nodes.length < 2 || !sourceId || !sinkId}
        className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-40 text-white shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <ShieldCheck className="w-4 h-4" />
        <span>Compute Independent Paths</span>
      </button>

      {mengerResult && (
        <div className="space-y-2.5 border-t border-slate-200/80 dark:border-white/[0.08] pt-3.5">
          <div className="text-xs font-mono flex items-center justify-between text-slate-800 dark:text-slate-200">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Independent Routes:</span>
            <span className="font-bold text-blue-700 dark:text-blue-400 text-sm">{mengerResult.count} Disjoint Paths</span>
          </div>

          <div className="space-y-2">
            {mengerResult.vertex_disjoint_paths.map((path, idx) => {
              const color = PATH_COLORS[idx % PATH_COLORS.length];
              return (
                <div
                  key={idx}
                  className="p-2.5 rounded-2xl bg-slate-50 dark:bg-[#141a2c] border border-slate-200/70 dark:border-white/[0.06] text-[11px] font-mono flex items-center gap-2"
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: color }} />
                  <span className="text-slate-800 dark:text-slate-200 font-semibold shrink-0">Path #{idx + 1}:</span>
                  <span className="text-slate-500 dark:text-slate-400 truncate">{path.join(' → ')}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
