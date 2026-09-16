import React from 'react';
import { STARTER_TEMPLATES, StarterTemplate } from '@/lib/templates';
import { X, ArrowRight, Layers, Sparkles, Server, Building, Globe } from 'lucide-react';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: StarterTemplate) => void;
}

const ICONS = [Globe, Building, Server];

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f1422] border border-white/[0.1] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-black/80 space-y-0">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-white/[0.02] to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Topology Blueprints
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Load a pre-architected enterprise network layout to seed your workspace.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template List */}
        <div className="p-6 space-y-3.5 max-h-[60vh] overflow-y-auto">
          {STARTER_TEMPLATES.map((template, idx) => {
            const Icon = ICONS[idx % ICONS.length] || Layers;

            return (
              <div
                key={template.id}
                onClick={() => {
                  onSelectTemplate(template);
                  onClose();
                }}
                className="group relative p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-blue-500/40 transition-all duration-200 cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#141b2e] border border-white/[0.08] flex items-center justify-center text-slate-300 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors shrink-0 mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-medium text-blue-400 uppercase tracking-wider">
                        {template.category}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-400">
                        {template.graph.nodes.length} Nodes • {template.graph.edges.length} Links
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 p-2.5 rounded-lg bg-white/[0.03] text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:translate-x-0.5 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
