import React from 'react';
import { 
  X, 
  PlusCircle, 
  LayoutGrid, 
  Upload, 
  Play, 
  ShieldCheck, 
  Activity, 
  Route, 
  ArrowRight, 
  Sparkles,
  Layers,
  Network
} from 'lucide-react';

interface IntroductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNew: () => void;
  onOpenTemplates: () => void;
  onImportJson: () => void;
  onRunDemo: () => void;
}

export const IntroductionModal: React.FC<IntroductionModalProps> = ({
  isOpen,
  onClose,
  onCreateNew,
  onOpenTemplates,
  onImportJson,
  onRunDemo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0f1422] border border-slate-200 dark:border-white/[0.08] rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl shadow-slate-900/20 dark:shadow-black/70 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/60 dark:bg-white/[0.02]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Welcome to Axial Studio
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 font-semibold">
                v2.0
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enterprise Network Resilience & Graph-Theory Failure Simulator
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Close Introduction"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Action Grid */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-400 mb-3 px-1">
              Choose How to Get Started
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Option 1: Blank Canvas */}
              <div
                onClick={() => {
                  onCreateNew();
                  onClose();
                }}
                className="group relative p-4 rounded-2xl bg-slate-50/70 dark:bg-white/[0.03] hover:bg-blue-50/50 dark:hover:bg-blue-500/[0.08] border border-slate-200/80 dark:border-white/[0.06] hover:border-blue-300 dark:hover:border-blue-500/30 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm group-hover:scale-105 transition-transform">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]">
                    From Scratch
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Create Blank Topology
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Start with a fresh workspace and drag nodes & fiber links from the palette.
                  </p>
                </div>
                <div className="flex items-center text-[11px] font-semibold text-blue-600 dark:text-blue-400 gap-1.5 pt-1">
                  <span>Start Building</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Option 2: Blueprint Templates */}
              <div
                onClick={() => {
                  onOpenTemplates();
                  onClose();
                }}
                className="group relative p-4 rounded-2xl bg-slate-50/70 dark:bg-white/[0.03] hover:bg-purple-50/50 dark:hover:bg-purple-500/[0.08] border border-slate-200/80 dark:border-white/[0.06] hover:border-purple-300 dark:hover:border-purple-500/30 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm group-hover:scale-105 transition-transform">
                    <LayoutGrid className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                    5 Blueprints
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    Browse Blueprint Templates
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Load pre-architected Campus, Multi-Cloud DC, IoT Grid, or Star-Mesh layouts.
                  </p>
                </div>
                <div className="flex items-center text-[11px] font-semibold text-purple-600 dark:text-purple-400 gap-1.5 pt-1">
                  <span>Open Library</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Option 3: Import JSON */}
              <div
                onClick={() => {
                  onImportJson();
                  onClose();
                }}
                className="group relative p-4 rounded-2xl bg-slate-50/70 dark:bg-white/[0.03] hover:bg-emerald-50/50 dark:hover:bg-emerald-500/[0.08] border border-slate-200/80 dark:border-white/[0.06] hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm group-hover:scale-105 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]">
                    .JSON File
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Import Existing Network
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Upload your previously exported topology schema JSON file to resume analysis.
                  </p>
                </div>
                <div className="flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 gap-1.5 pt-1">
                  <span>Upload Schema</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Option 4: Quick Interactive Demo */}
              <div
                onClick={() => {
                  onRunDemo();
                  onClose();
                }}
                className="group relative p-4 rounded-2xl bg-slate-50/70 dark:bg-white/[0.03] hover:bg-amber-50/50 dark:hover:bg-amber-500/[0.08] border border-slate-200/80 dark:border-white/[0.06] hover:border-amber-300 dark:hover:border-amber-500/30 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm group-hover:scale-105 transition-transform">
                    <Play className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                    Instant Demo
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Load Demo & Simulate
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Seed the University Campus network and jump directly into the live Attack simulator.
                  </p>
                </div>
                <div className="flex items-center text-[11px] font-semibold text-amber-600 dark:text-amber-400 gap-1.5 pt-1">
                  <span>Launch Simulator</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* 3-Step Guided Workflow Banner */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#141a2c] border border-slate-200/80 dark:border-white/[0.08] space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
                Platform Workflow
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">01 • ARCHITECT</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">Build Canvas</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Drag 8 tiers of network hardware and connect redundant fiber lines.</p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400">02 • STRESS TEST</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">Attack Simulator</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Stage target strikes, sever fiber links, or trigger cascade failure presets.</p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">03 • ANALYZE</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">Resilience Telemetry</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Inspect composite resilience rating, single points of failure, & Menger paths.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.02] flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            You can re-open this guide anytime from the top navigation bar.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            View My Networks
          </button>
        </div>
      </div>
    </div>
  );
};
