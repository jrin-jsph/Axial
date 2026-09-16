import React, { useRef } from 'react';
import { 
  Network, 
  Layers, 
  Activity, 
  Download, 
  Upload, 
  LayoutGrid, 
  RotateCcw, 
  Cpu,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { NetworkGraph } from '@/lib/types';

interface HeaderProps {
  mode: 'build' | 'analyze';
  onModeChange: (mode: 'build' | 'analyze') => void;
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onOpenTemplates: () => void;
  onSaveJson: () => void;
  onLoadJson: (graph: NetworkGraph) => void;
  onReset: () => void;
  isBackendOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  projectName,
  onProjectNameChange,
  onOpenTemplates,
  onSaveJson,
  onLoadJson,
  onReset,
  isBackendOnline,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.nodes && parsed.edges) {
          onLoadJson(parsed as NetworkGraph);
        }
      } catch {
        alert('Invalid topology JSON file structure.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <header className="h-16 bg-[#0c101c]/80 backdrop-blur-xl border-b border-white/[0.07] px-6 flex items-center justify-between z-30 select-none">
      {/* Left: Brand Identity & Project Breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#0c101c] rounded-[10px] flex items-center justify-center">
              <Network className="w-4.5 h-4.5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-white font-sans">
                AXIAL
              </span>
              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                ENTERPRISE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Network Resilience Platform</p>
          </div>
        </div>

        <div className="h-5 w-px bg-white/[0.08]" />

        {/* Project Name Editable Pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-colors">
          <span className="text-[11px] text-slate-400 font-medium">Topology:</span>
          <input
            type="text"
            value={projectName}
            onChange={e => onProjectNameChange(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none focus:text-white w-44 tracking-tight"
            placeholder="Project Name..."
          />
        </div>
      </div>

      {/* Center: Segmented Mode Switcher */}
      <div className="flex items-center p-1 rounded-xl bg-[#131828]/90 border border-white/[0.08] shadow-inner">
        <button
          onClick={() => onModeChange('build')}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
            mode === 'build'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Build & Topology</span>
        </button>

        <button
          onClick={() => onModeChange('analyze')}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
            mode === 'analyze'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Simulate & Analyze</span>
        </button>
      </div>

      {/* Right: Actions, Import/Export & Engine Health */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenTemplates}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-blue-400" />
          <span>Templates</span>
        </button>

        <button
          onClick={onSaveJson}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Export JSON</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Upload className="w-3.5 h-3.5 text-slate-400" />
          <span>Import</span>
        </button>

        <button
          onClick={onReset}
          className="p-2 rounded-lg text-xs bg-white/[0.04] hover:bg-rose-500/10 border border-white/[0.07] hover:border-rose-500/30 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
          title="Reset Topology Canvas"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <div className="h-5 w-px bg-white/[0.08]" />

        {/* Backend Status Live Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs font-medium">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isBackendOnline ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isBackendOnline ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>
          <span className="text-slate-400 text-[11px]">Engine:</span>
          <span
            className={`font-mono text-[11px] font-semibold ${
              isBackendOnline ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {isBackendOnline ? 'ONLINE' : 'STANDBY'}
          </span>
        </div>
      </div>
    </header>
  );
};
