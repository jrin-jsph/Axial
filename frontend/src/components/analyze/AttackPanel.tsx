import React, { useState } from 'react';
import { ShieldAlert, RefreshCw, Play, Crosshair, Sparkles, Gauge, FastForward, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import { soundFx } from '@/lib/soundEffects';

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
  const [speedMultiplier, setSpeedMultiplier] = useState<'0.5x' | '1x' | '2x'>('1x');
  const [soundActive, setSoundActive] = useState<boolean>(soundFx.isEnabled());

  return (
    <div className="bg-white/95 dark:bg-[#0f1422]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] p-4 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 shadow-sm">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
              Stress & Attack Simulator
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Stage target strikes, sever links, or trigger cascade presets</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Simulation Speed Pill Toggle */}
          <div className="flex items-center p-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-400">
            {(['0.5x', '1x', '2x'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSpeedMultiplier(s)}
                className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                  speedMultiplier === s 
                    ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-sm font-bold' 
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Audio FX Toggle */}
          <button
            onClick={() => {
              const enabled = soundFx.toggleSound();
              setSoundActive(enabled);
            }}
            className={`p-2 rounded-2xl border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              soundActive
                ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400'
                : 'bg-slate-100 dark:bg-white/[0.06] border-slate-200 dark:border-white/[0.08] text-slate-400 dark:text-slate-500'
            }`}
            title={soundActive ? 'Cyber Sound FX Enabled' : 'Cyber Sound FX Muted'}
          >
            {soundActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onExecuteAttack}
            disabled={isSimulating || (attackedNodes.length === 0 && attackedEdges.length === 0)}
            className={`relative overflow-hidden px-4 py-2 rounded-2xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
              isSimulating
                ? 'bg-rose-600 text-white animate-attack-beacon ring-2 ring-rose-500/50'
                : attackedNodes.length > 0 || attackedEdges.length > 0
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30 shadow-md hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-rose-600/40 text-white/50 cursor-not-allowed'
            }`}
          >
            {isSimulating && (
              <span className="absolute inset-0 animate-hazard-stripes pointer-events-none opacity-30" />
            )}
            <Crosshair className={`w-4 h-4 ${isSimulating ? 'animate-spin text-amber-300' : ''}`} />
            <span>
              {isSimulating
                ? 'Simulating Attack Vector...'
                : `Execute Attack (${attackedNodes.length + attackedEdges.length} Targets)`}
            </span>
          </button>

          <button
            onClick={onResetAttack}
            disabled={isSimulating}
            className="px-3.5 py-2 rounded-2xl text-xs font-semibold bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200/80 dark:hover:bg-white/[0.12] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>Restore Health</span>
          </button>
        </div>
      </div>

      {/* Preset Scenarios Cards */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => onRunPreset('single_point')}
          className="p-3 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] hover:bg-slate-100/90 dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.06] hover:border-amber-400/60 dark:hover:border-amber-400/60 transition-all text-left group cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-amber-700 dark:text-amber-400 group-hover:text-amber-800 dark:group-hover:text-amber-300">
            <span>Single Point of Failure</span>
            <Play className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
            Target primary core router articulation point
          </p>
        </button>

        <button
          onClick={() => onRunPreset('regional')}
          className="p-3 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] hover:bg-slate-100/90 dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.06] hover:border-purple-400/60 dark:hover:border-purple-400/60 transition-all text-left group cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-purple-700 dark:text-purple-400 group-hover:text-purple-800 dark:group-hover:text-purple-300">
            <span>Regional Outage</span>
            <Play className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
            Simulate multi-hub power outage across distribution grid
          </p>
        </button>

        <button
          onClick={() => onRunPreset('coordinated')}
          className="p-3 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] hover:bg-slate-100/90 dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.06] hover:border-rose-400/60 dark:hover:border-rose-400/60 transition-all text-left group cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-rose-700 dark:text-rose-400 group-hover:text-rose-800 dark:group-hover:text-rose-300">
            <span>Coordinated Attack</span>
            <Play className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
            Multi-vector strike targeting backbone routers and fiber links
          </p>
        </button>
      </div>

      {/* Live Simulation Step Caption Banner */}
      {stepCaption && (
        <div className="p-3 rounded-2xl bg-slate-900 dark:bg-[#141a2c] text-white border border-slate-800 dark:border-white/[0.08] flex items-center gap-3 text-xs font-mono shadow-md animate-in fade-in duration-150">
          <div className="flex items-center gap-1 text-[10px] bg-white/10 dark:bg-blue-500/20 text-white dark:text-blue-300 px-2 py-0.5 rounded-full font-bold shrink-0 border border-white/15 dark:border-blue-500/30">
            STEP {stepNumber || 1} OF 4
          </div>
          <div className="flex-1 truncate font-medium text-slate-100 dark:text-slate-200">{stepCaption}</div>
          {isSimulating && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400 shrink-0" />}
        </div>
      )}
    </div>
  );
};
