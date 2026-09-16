import React from 'react';
import { CriticalityNode } from '@/lib/types';
import { Trophy, Target, ShieldAlert, AlertTriangle } from 'lucide-react';

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
    <div className="bg-[#0f1422]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 space-y-3.5 shadow-xl shadow-black/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
            Vulnerability Leaderboard
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.06]">
          Top 5 Ranked
        </span>
      </div>

      {rankings.length === 0 ? (
        <div className="text-xs text-slate-400 py-6 text-center">No active node rankings computed.</div>
      ) : (
        <div className="space-y-2.5">
          {rankings.map((node, index) => {
            const isAttacked = attackedSet.has(node.id);

            const rankBadge =
              index === 0
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : index === 1
                ? 'bg-slate-300/20 text-slate-200 border border-slate-300/30'
                : index === 2
                ? 'bg-amber-700/20 text-amber-500 border border-amber-700/30'
                : 'bg-white/[0.04] text-slate-400 border border-white/[0.06]';

            return (
              <div
                key={node.id}
                onClick={() => onSelectNode(node.id)}
                className={`p-3.5 rounded-xl border transition-all duration-150 cursor-pointer group ${
                  isAttacked
                    ? 'bg-rose-950/60 border-rose-500/60 shadow-lg shadow-rose-500/10'
                    : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.06] hover:border-blue-500/30'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center shrink-0 ${rankBadge}`}
                    >
                      #{index + 1}
                    </span>

                    <span className="text-xs font-semibold text-slate-100 group-hover:text-blue-300 transition-colors truncate">
                      {node.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white/[0.05] text-amber-300 border border-white/[0.06]">
                      Score {node.score}
                    </span>
                    <Target className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 mt-2 leading-relaxed font-sans">
                  {node.explanation}
                </p>

                <div className="flex items-center gap-3 mt-2.5 text-[10px] font-mono text-slate-400 border-t border-white/[0.06] pt-2">
                  <span>Isolates: <strong className="text-rose-400 font-semibold">{node.disconnected_count} nodes</strong></span>
                  <span>Impact: <strong className="text-amber-400 font-semibold">-{node.capacity_lost}% flow</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
