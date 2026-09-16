import React from 'react';
import { ResilienceResult } from '@/lib/types';
import { Activity, ShieldCheck, ShieldAlert, Cpu, Network, CheckCircle2 } from 'lucide-react';

interface StatsPanelProps {
  resilience: ResilienceResult | null;
  totalNodesCount: number;
  isolatedCount: number;
  capacityLostG: number;
}

const GRADE_STYLES: Record<string, { badge: string; text: string }> = {
  'A+': { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', text: 'text-emerald-400' },
  'A': { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', text: 'text-emerald-400' },
  'B': { badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30', text: 'text-blue-400' },
  'C': { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30', text: 'text-amber-400' },
  'D': { badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30', text: 'text-orange-400' },
  'F': { badge: 'bg-rose-500/15 text-rose-400 border-rose-500/40 animate-pulse', text: 'text-rose-500' },
};

export const StatsPanel: React.FC<StatsPanelProps> = ({
  resilience,
  totalNodesCount,
  isolatedCount,
  capacityLostG,
}) => {
  const score = resilience?.resilience_score ?? 100;
  const grade = resilience?.grade ?? 'A+';
  const gradeStyle = GRADE_STYLES[grade] || GRADE_STYLES['B'];

  return (
    <div className="bg-[#0f1422]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-xl shadow-black/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
            Resilience Telemetry
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.06]">
          Realtime
        </span>
      </div>

      {/* Main Composite Score Hero Card */}
      <div className="p-4.5 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between shadow-inner">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-medium">
            Composite Resilience Rating
          </div>
          <div className="text-3xl font-extrabold font-mono tracking-tight text-white mt-0.5">
            {score} <span className="text-xs font-normal text-slate-500">/ 100</span>
          </div>
          <p className="text-[11px] mt-1 text-slate-300 line-clamp-1 leading-snug">
            {resilience?.summary || 'Network operational with full redundancy.'}
          </p>
        </div>

        <div className={`text-3xl font-black font-mono px-3.5 py-1.5 rounded-xl border ${gradeStyle.badge}`}>
          {grade}
        </div>
      </div>

      {/* Bento Metrics 2x2 Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3.5 bg-white/[0.02] rounded-xl border border-white/[0.06]">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-medium">
            Connected Nodes
          </div>
          <div className="text-lg font-bold font-mono text-blue-400 mt-1">
            {resilience?.connected_percentage ?? 100}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {isolatedCount} of {totalNodesCount} isolated
          </div>
        </div>

        <div className="p-3.5 bg-white/[0.02] rounded-xl border border-white/[0.06]">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-medium">
            Capacity Retention
          </div>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
            {resilience?.capacity_retention_percentage ?? 100}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            -{capacityLostG} Gbps lost
          </div>
        </div>

        <div className="p-3.5 bg-white/[0.02] rounded-xl border border-white/[0.06]">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-medium">
            Redundancy Factor
          </div>
          <div className="text-lg font-bold font-mono text-slate-200 mt-1">
            {resilience?.redundancy_score ?? 1.0}x
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Link/MST Density Ratio
          </div>
        </div>

        <div className="p-3.5 bg-white/[0.02] rounded-xl border border-white/[0.06]">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-medium">
            Single Points of Failure
          </div>
          <div className="text-lg font-bold font-mono text-rose-400 mt-1">
            {resilience?.single_points_of_failure_count ?? 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Articulation Points
          </div>
        </div>
      </div>
    </div>
  );
};
