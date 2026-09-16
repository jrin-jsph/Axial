import React from 'react';
import { CriticalityNode } from '@/lib/types';
import { Trophy, Target } from 'lucide-react';

interface LeaderboardPanelProps {
  rankings: CriticalityNode[];
  onSelectNode: (nodeId: string) => void;
  attackedNodes: string[];
}

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({
  rankings,
  onSelectNode,
  attackedNodes,
}) => {
  const attackedSet = new Set(attackedNodes);

  return (
    <div className="bg-white dark:bg-[#0f1422] border border-slate-200/90 dark:border-white/[0.08] rounded-3xl p-5 space-y-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] dark:shadow-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
            Vulnerability Leaderboard
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]">
          Top 5 Ranked
        </span>
      </div>

      {rankings.length === 0 ? (
        <div className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">No active node rankings computed.</div>
      ) : (
        <div className="space-y-2.5">
          {rankings.map((node, index) => {
            const isAttacked = attackedSet.has(node.id);

            const rankBadge =
              index === 0
                ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40'
                : index === 1
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600'
                : index === 2
                ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700';

            return (
              <div
                key={node.id}
                onClick={() => onSelectNode(node.id)}
                className={`p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer group ${
                  isAttacked
                    ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/40 shadow-sm'
                    : 'bg-slate-50/70 dark:bg-white/[0.03] hover:bg-slate-100/90 dark:hover:bg-white/[0.06] border-slate-200/80 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.15]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center shrink-0 ${rankBadge}`}
                    >
                      #{index + 1}
                    </span>

                    <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {node.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                      Score {node.score}
                    </span>
                    <Target className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-sans">
                  {node.explanation}
                </p>

                <div className="flex items-center gap-3 mt-2.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 border-t border-slate-200/70 dark:border-white/[0.06] pt-2">
                  <span>Isolates: <strong className="text-rose-600 dark:text-rose-400 font-semibold">{node.disconnected_count} nodes</strong></span>
                  <span>Impact: <strong className="text-amber-700 dark:text-amber-400 font-semibold">-{node.capacity_lost}% flow</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
