import React from 'react';
import { ShieldAlert, RefreshCw, Play, Crosshair, Sparkles, Terminal } from 'lucide-react';

interface AttackPanelProps {
  attackedNodes: string[];
  attackedEdges: string[];
  onExecuteAttack: () => void;
  onResetAttack: () => void;
  onRunPreset: (scenarioId: 'single_point' | 'regional' | 'coordinated') => void;
  isSimulating: boolean;
  stepCaption?: string;
  stepNumber?: number;
}

export const AttackPanel: React.FC<AttackPanelProps> = ({
  attackedNodes,
  attackedEdges,
  onExecuteAttack,
  onResetAttack,
  onRunPreset,
  isSimulating,
  stepCaption,
  stepNumber,
}) => {
  return (
    <div className="bg-[#0c101c]/80 backdrop-blur-xl border-b border-white/[0.08] p-4.5 space-y-3.5 shadow-md">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <ShieldAlert className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-100 uppercase font-mono tracking-wider">
              Attack & Disruption Simulator
            </h2>
            <p className="text-[11px] text-slate-400">Target components or trigger automated stress test presets</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onExecuteAttack}
            disabled={attackedNodes.length === 0 && attackedEdges.length === 0}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:hover:bg-rose-600 text-white shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Crosshair className="w-4 h-4" />
            <span>Execute Target Attack ({attackedNodes.length})</span>
          </button>

          <button
            onClick={onResetAttack}
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            <span>Restore Health</span>
          </button>
        </div>
      </div>

      {/* Preset Scenarios Cards */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => onRunPreset('single_point')}
          className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-amber-500/40 transition-all text-left group cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-amber-400 group-hover:text-amber-300">
            <span>Single Point of Failure</span>
            <Play className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
            Target primary core router articulation point
          </p>
        </button>

        <button
          onClick={() => onRunPreset('regional')}
          className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-indigo-500/40 transition-all text-left group cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
            <span>Regional Outage</span>
            <Play className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
            Simulate multi-hub power outage across distribution grid
          </p>
        </button>

        <button
          onClick={() => onRunPreset('coordinated')}
          className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-rose-500/40 transition-all text-left group cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-rose-400 group-hover:text-rose-300">
            <span>Coordinated Attack</span>
            <Play className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
            Multi-vector strike targeting backbone routers and fiber links
          </p>
        </button>
      </div>

      {/* Live Simulation Step Caption Banner */}
      {stepCaption && (
        <div className="p-3 rounded-xl bg-[#0e1424] border border-blue-500/30 flex items-center gap-3 text-xs font-mono text-blue-300 shadow-lg shadow-blue-500/10 animate-in fade-in duration-150">
          <div className="flex items-center gap-1 text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md font-bold shrink-0 border border-blue-500/30">
            STEP {stepNumber || 1}/4
          </div>
          <div className="flex-1 truncate font-medium text-slate-200">{stepCaption}</div>
          {isSimulating && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400 shrink-0" />}
        </div>
      )}
    </div>
  );
};
