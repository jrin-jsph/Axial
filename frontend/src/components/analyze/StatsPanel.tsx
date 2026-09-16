import React from 'react';
import { ResilienceResult } from '@/lib/types';
import { Activity } from 'lucide-react';

interface StatsPanelProps {
  resilience: ResilienceResult | null;
  totalNodesCount: number;
  isolatedCount: number;
  capacityLostG: number;
}

const GRADE_STYLES: Record<string, { badge: string; text: string }> = {
  'A+': { badge: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/40', text: 'text-emerald-700 dark:text-emerald-400' },
  'A': { badge: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/40', text: 'text-emerald-700 dark:text-emerald-400' },
  'B': { badge: 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/40', text: 'text-blue-700 dark:text-blue-400' },
  'C': { badge: 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/40', text: 'text-amber-700 dark:text-amber-400' },
  'D': { badge: 'bg-orange-50 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/40', text: 'text-orange-700 dark:text-orange-400' },
  'F': { badge: 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/40 animate-pulse', text: 'text-rose-700 dark:text-rose-400' },
  'N/A': { badge: 'bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/[0.08]', text: 'text-slate-500 dark:text-slate-400' },
};

export const StatsPanel: React.FC<StatsPanelProps> = ({
  resilience,
  totalNodesCount,
  isolatedCount,
  capacityLostG,
}) => {
  const score = totalNodesCount === 0 ? 0 : (resilience?.resilience_score ?? 100);
  const grade = totalNodesCount === 0 ? 'N/A' : (resilience?.grade ?? 'A+');
  const gradeStyle = GRADE_STYLES[grade] || GRADE_STYLES['N/A'];
  const summary = totalNodesCount === 0 ? 'No network nodes in workspace.' : (resilience?.summary || 'Network operational with full redundancy.');

  return (
    <div className="bg-white dark:bg-[#0f1422] border border-slate-200/90 dark:border-white/[0.08] rounded-3xl p-5 space-y-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] dark:shadow-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
            Resilience Telemetry
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]">
          Realtime
        </span>
      </div>

      {/* Main Composite Score Hero Card */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#141a2c] border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between shadow-inner dark:shadow-none">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
            Composite Resilience Rating
          </div>
          <div className="text-3xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white mt-0.5">
            {score} <span className="text-xs font-normal text-slate-400">/ 100</span>
          </div>
          <p className="text-[11px] mt-1 text-slate-600 dark:text-slate-300 line-clamp-1 leading-snug">
            {summary}
          </p>
        </div>

        <div className={`text-3xl font-black font-mono px-3.5 py-1.5 rounded-2xl border ${gradeStyle.badge}`}>
          {grade}
        </div>
      </div>

      {/* Bento Metrics 2x2 Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3.5 bg-slate-50/80 dark:bg-white/[0.03] rounded-2xl border border-slate-200/70 dark:border-white/[0.06]">
          <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">
            Connected Nodes
          </div>
          <div className="text-lg font-bold font-mono text-blue-700 dark:text-blue-400 mt-1">
            {resilience?.connected_percentage ?? 100}%
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            {isolatedCount} of {totalNodesCount} isolated
          </div>
        </div>

        <div className="p-3.5 bg-slate-50/80 dark:bg-white/[0.03] rounded-2xl border border-slate-200/70 dark:border-white/[0.06]">
          <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">
            Capacity Retention
          </div>
          <div className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1">
            {resilience?.capacity_retention_percentage ?? 100}%
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            -{capacityLostG} Gbps lost
          </div>
        </div>

        <div className="p-3.5 bg-slate-50/80 dark:bg-white/[0.03] rounded-2xl border border-slate-200/70 dark:border-white/[0.06]">
          <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">
            Redundancy Factor
          </div>
          <div className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 mt-1">
            {resilience?.redundancy_score ?? 1.0}x
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            Link/MST Density Ratio
          </div>
        </div>

        <div className="p-3.5 bg-slate-50/80 dark:bg-white/[0.03] rounded-2xl border border-slate-200/70 dark:border-white/[0.06]">
          <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">
            Single Points of Failure
          </div>
          <div className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {resilience?.single_points_of_failure_count ?? 0}
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            Articulation Points
          </div>
        </div>
      </div>
    </div>
  );
};
