import React, { useRef } from 'react';
import { 
  Network, 
  Layers, 
  Activity, 
  Download, 
  Upload, 
  LayoutGrid, 
  RotateCcw, 
  Search,
  Sun,
  Moon,
  HelpCircle,
  FolderOpen,
  Save,
  Check,
  Sparkles
} from 'lucide-react';
import { NetworkGraph } from '@/lib/types';

interface HeaderProps {
  mode: 'build' | 'analyze';
  onModeChange: (mode: 'build' | 'analyze') => void;
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onOpenTemplates: () => void;
  onOpenIntro?: () => void;
  onOpenDashboard?: () => void;
  currentView?: 'dashboard' | 'workspace';
  savedProjectsCount?: number;
  onSaveToLibrary?: () => void;
  isSaved?: boolean;
  onSaveJson: () => void;
  onLoadJson: (graph: NetworkGraph) => void;
  onReset: () => void;
  isBackendOnline: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  projectName,
  onProjectNameChange,
  onOpenTemplates,
  onOpenIntro,
  onOpenDashboard,
  currentView = 'workspace',
  savedProjectsCount = 0,
  onSaveToLibrary,
  isSaved = false,
  onSaveJson,
  onLoadJson,
  onReset,
  isBackendOnline,
  theme,
  onToggleTheme,
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

  const isDark = theme === 'dark';

  return (
    <header className={`h-16 px-6 flex items-center justify-between z-30 select-none transition-colors duration-200 ${
      isDark 
        ? 'bg-[#0f1422]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-md shadow-black/30 text-white' 
        : 'bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] text-slate-900'
    }`}>
      {/* Left: Brand, Dashboard Switcher & Search-Style Project Name Pill */}
      <div className="flex items-center gap-3">
        <div 
          onClick={onOpenDashboard}
          className="cursor-pointer group flex items-center gap-2"
          title="Return to Networks Dashboard"
        >
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold tracking-tight font-sans group-hover:text-blue-500 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
              AXIAL
            </span>
            <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${
              isDark 
                ? 'bg-white/[0.06] text-blue-400 border-white/[0.08]' 
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              STUDIO
            </span>
          </div>
        </div>

        <div className={`h-5 w-px ${isDark ? 'bg-white/[0.08]' : 'bg-slate-200'}`} />

        {/* My Networks Dashboard Button */}
        {onOpenDashboard && (
          <button
            onClick={onOpenDashboard}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              currentView === 'dashboard'
                ? isDark 
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/40' 
                  : 'bg-blue-50 text-blue-700 border-blue-200'
                : isDark
                ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300 hover:text-white'
                : 'bg-slate-100/80 hover:bg-slate-200/80 border-slate-200/80 text-slate-700'
            }`}
            title="View All Saved Topologies & Projects"
          >
            <FolderOpen className="w-3.5 h-3.5 text-blue-500" />
            <span>My Networks</span>
            {savedProjectsCount > 0 && (
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
              }`}>
                {savedProjectsCount}
              </span>
            )}
          </button>
        )}

        {/* Minimal Search/Rename Pill */}
        {currentView === 'workspace' && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all shadow-sm ${
            isDark 
              ? 'bg-white/[0.03] border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.06]' 
              : 'bg-slate-100/90 border-slate-200/80 hover:border-slate-300 hover:bg-white'
          }`}>
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={projectName}
              onChange={e => onProjectNameChange(e.target.value)}
              className={`bg-transparent text-xs font-semibold placeholder-slate-400 focus:outline-none w-36 sm:w-44 tracking-tight ${
                isDark ? 'text-slate-200 focus:text-white' : 'text-slate-800'
              }`}
              placeholder="Rename topology..."
            />
          </div>
        )}
      </div>

      {/* Center: Clean Rounded-Full Mode Switcher (only in workspace view) */}
      {currentView === 'workspace' ? (
        <div className={`flex items-center p-1 rounded-full border shadow-inner ${
          isDark ? 'bg-[#141b2d] border-white/[0.08]' : 'bg-slate-100/90 border-slate-200/90'
        }`}>
          <button
            onClick={() => onModeChange('build')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
              mode === 'build'
                ? isDark 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold' 
                  : 'bg-white text-slate-900 shadow-sm font-semibold border border-slate-200/60'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Build Canvas</span>
          </button>

          <button
            onClick={() => onModeChange('analyze')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
              mode === 'analyze'
                ? isDark 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold' 
                  : 'bg-slate-900 text-white shadow-sm font-semibold'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Attack & Analyze</span>
          </button>
        </div>
      ) : (
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Select any existing network or launch a new template to begin</span>
        </div>
      )}

      {/* Right: Actions, Theme Toggle, Import/Export & Engine Status */}
      <div className="flex items-center gap-2">
        {onSaveToLibrary && currentView === 'workspace' && (
          <button
            onClick={onSaveToLibrary}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              isSaved
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : isDark
                ? 'bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/30 text-blue-400'
                : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700'
            }`}
            title="Save to My Networks Library"
          >
            {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        )}
        {onOpenIntro && (
          <button
            onClick={onOpenIntro}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow ${
              isDark
                ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300 hover:text-white'
                : 'bg-slate-100/80 hover:bg-slate-200/80 border-slate-200/80 text-slate-700'
            }`}
            title="Open Welcome Introduction & Workflow Hub"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
            <span>Intro</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-full text-xs border transition-all cursor-pointer shadow-sm ${
            isDark 
              ? 'bg-white/[0.06] hover:bg-white/[0.12] border-white/[0.08] text-amber-300' 
              : 'bg-slate-100/80 hover:bg-slate-200/80 border-slate-200/80 text-slate-700'
          }`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Canvas & Topology Actions (Only visible in workspace mode) */}
        {currentView === 'workspace' && (
          <>
            <button
              onClick={onOpenTemplates}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow ${
                isDark
                  ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300 hover:text-white'
                  : 'bg-slate-100/80 hover:bg-slate-200/80 border-slate-200/80 text-slate-700'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-blue-500" />
              <span>Templates</span>
            </button>

            <button
              onClick={onSaveJson}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow ${
                isDark
                  ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300 hover:text-white'
                  : 'bg-slate-100/80 hover:bg-slate-200/80 border-slate-200/80 text-slate-700'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export</span>
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow ${
                isDark
                  ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300 hover:text-white'
                  : 'bg-slate-100/80 hover:bg-slate-200/80 border-slate-200/80 text-slate-700'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Import</span>
            </button>

            <button
              onClick={onReset}
              className={`p-2 rounded-full text-xs border transition-all cursor-pointer shadow-sm ${
                isDark
                  ? 'bg-white/[0.04] hover:bg-rose-500/20 border-white/[0.08] text-slate-400 hover:text-rose-400'
                  : 'bg-slate-100/80 hover:bg-rose-50 border-slate-200/80 hover:border-rose-200 text-slate-500 hover:text-rose-600'
              }`}
              title="Reset Topology Canvas"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        <div className={`h-5 w-px ${isDark ? 'bg-white/[0.08]' : 'bg-slate-200'}`} />

        {/* Backend Status Live Badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium shadow-sm ${
          isDark ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-slate-200/90'
        }`}>
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
          <span className="text-slate-400 text-[11px] font-medium">Engine:</span>
          <span
            className={`font-mono text-[11px] font-semibold ${
              isBackendOnline 
                ? isDark ? 'text-emerald-400' : 'text-emerald-700' 
                : isDark ? 'text-amber-400' : 'text-amber-700'
            }`}
          >
            {isBackendOnline ? 'ONLINE' : 'STANDBY'}
          </span>
        </div>
      </div>
    </header>
  );
};
