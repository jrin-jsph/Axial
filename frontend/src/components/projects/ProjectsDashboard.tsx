import React, { useState } from 'react';
import { 
  Plus, 
  LayoutGrid, 
  Upload, 
  Search, 
  Activity, 
  Layers, 
  Trash2, 
  Download, 
  Sparkles, 
  Calendar, 
  HelpCircle,
  Network,
  ArrowRight,
  FolderOpen
} from 'lucide-react';
import { SavedProject, NetworkGraph } from '@/lib/types';

interface ProjectsDashboardProps {
  projects: SavedProject[];
  onOpenProject: (project: SavedProject, initialMode?: 'build' | 'analyze') => void;
  onCreateNew: () => void;
  onOpenTemplates: () => void;
  onImportJson: () => void;
  onOpenIntro: () => void;
  onDeleteProject: (projectId: string) => void;
  theme: 'light' | 'dark';
}

export const ProjectsDashboard: React.FC<ProjectsDashboardProps> = ({
  projects,
  onOpenProject,
  onCreateNew,
  onOpenTemplates,
  onImportJson,
  onOpenIntro,
  onDeleteProject,
  theme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const isDark = theme === 'dark';

  const categories = ['all', ...Array.from(new Set(projects.map(p => p.category || 'Custom Design')))];

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || (p.category || 'Custom Design') === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalNodes = projects.reduce((acc, p) => acc + (p.nodeCount || p.graph.nodes.length), 0);

  const handleExportSingle = (e: React.MouseEvent, project: SavedProject) => {
    e.stopPropagation();
    const jsonStr = JSON.stringify(project.graph, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, '_')}_topology.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteSingle = (e: React.MouseEvent, projectId: string, projectName: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${projectName}"?`)) {
      onDeleteProject(projectId);
    }
  };

  return (
    <div className={`flex-1 flex flex-col h-[calc(100vh-64px)] overflow-y-auto ${
      isDark ? 'bg-[#090c15] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      <div className="max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* Top Header & Intro Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/[0.08] pb-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Network Workspaces & Topologies
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select an existing network to edit or stress test, or create a new architecture.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={onOpenIntro}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm bg-white dark:bg-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.08] border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-200"
              title="Platform Guide & Introduction"
            >
              <HelpCircle className="w-4 h-4 text-blue-500" />
              <span>Guide / Intro</span>
            </button>

            <button
              onClick={onImportJson}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm bg-white dark:bg-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.08] border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-200"
            >
              <Upload className="w-4 h-4 text-slate-400" />
              <span>Import JSON</span>
            </button>

            <button
              onClick={onOpenTemplates}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm bg-white dark:bg-white/[0.04] hover:bg-purple-500/10 border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-purple-300"
            >
              <LayoutGrid className="w-4 h-4 text-purple-500" />
              <span>Templates</span>
            </button>

            <button
              onClick={onCreateNew}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Network</span>
            </button>
          </div>
        </div>

        {/* Global Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/[0.08] shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-slate-400 dark:text-slate-400 uppercase tracking-wider font-semibold">
                Saved Workspaces
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {projects.length}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Network className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-white/[0.08] shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-slate-400 dark:text-slate-400 uppercase tracking-wider font-semibold">
                Total Managed Hardware
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {totalNodes} <span className="text-xs font-sans text-slate-400 font-normal">nodes</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter existing networks..."
              className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-[#0f1422] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
            />
          </div>

          {categories.length > 2 && (
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.08]'
                  }`}
                >
                  {cat === 'all' ? 'All Networks' : cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Networks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 0: Prominent Create New Card */}
          <div
            onClick={onCreateNew}
            className="group p-6 rounded-3xl border-2 border-dashed border-slate-300 dark:border-white/[0.12] hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-blue-50/30 dark:hover:bg-blue-500/[0.04] transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center gap-3 min-h-[220px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                New Network Topology
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">
                Create a blank canvas to drag, drop and connect network hardware.
              </p>
            </div>
          </div>

          {/* Existing Project Cards */}
          {filteredProjects.map(project => {
            const grade = project.grade || (project.resilienceScore && project.resilienceScore >= 90 ? 'A+' : project.resilienceScore && project.resilienceScore >= 80 ? 'A' : 'B');
            const score = project.resilienceScore || 85;

            return (
              <div
                key={project.id}
                onClick={() => onOpenProject(project, 'build')}
                className="group relative p-6 rounded-3xl bg-white dark:bg-[#0f1422] border border-slate-200/90 dark:border-white/[0.08] hover:border-blue-400 dark:hover:border-blue-500/40 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-5 shadow-sm hover:shadow-xl hover:shadow-blue-500/[0.05]"
              >
                <div>
                  {/* Card Header Tag & Score Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08]">
                      {project.category || 'Custom Topology'}
                    </span>

                    {grade && (
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 font-mono text-[11px] font-bold">
                        <Sparkles className="w-3 h-3" />
                        <span>{score}/100 ({grade})</span>
                      </div>
                    )}
                  </div>

                  {/* Project Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {project.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {project.description || `${project.nodeCount || project.graph.nodes.length} nodes connected across redundant optical paths.`}
                  </p>
                </div>

                {/* Topology Specs Pill Bar */}
                <div className="grid grid-cols-2 gap-2 py-3 px-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.04]">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Hardware</span>
                    <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                      {project.nodeCount || project.graph.nodes.length} <span className="text-[10px] font-sans font-normal text-slate-400">nodes</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Links</span>
                    <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                      {project.edgeCount || project.graph.edges.length} <span className="text-[10px] font-sans font-normal text-slate-400">fibers</span>
                    </span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/[0.06]">
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onOpenProject(project, 'analyze');
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                      title="Quick Attack & Analyze"
                    >
                      <Activity className="w-4 h-4" />
                    </button>

                    <button
                      onClick={e => handleExportSingle(e, project)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                      title="Export Schema JSON"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={e => handleDeleteSingle(e, project.id, project.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                      title="Delete Topology"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1 pl-1 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
