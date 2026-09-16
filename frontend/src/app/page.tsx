'use client';

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { NetworkGraph, AppNode, AppEdge, CriticalityNode, ResilienceResult, MengerResult } from '@/lib/types';
import { STARTER_TEMPLATES, StarterTemplate } from '@/lib/templates';
import {
  checkBackendStatus, fetchResilienceScore, fetchCriticalityRanking,
  simulateAttack, fetchMengerPaths
} from '@/lib/api';

import { Header } from '@/components/navbar/Header';
import { TemplateModal } from '@/components/navbar/TemplateModal';
import { IntroductionModal } from '@/components/navbar/IntroductionModal';
import { SaveNetworkModal } from '@/components/navbar/SaveNetworkModal';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { ProjectsDashboard } from '@/components/projects/ProjectsDashboard';
import { BuilderCanvas } from '@/components/build/BuilderCanvas';
import { AnalyzeCanvas } from '@/components/analyze/AnalyzeCanvas';
import { AttackPanel } from '@/components/analyze/AttackPanel';
import { StatsPanel } from '@/components/analyze/StatsPanel';
import { LeaderboardPanel } from '@/components/analyze/LeaderboardPanel';
import { MengerPathPanel } from '@/components/analyze/MengerPathPanel';
import { 
  getSavedProjects, 
  createNewProject, 
  updateProject, 
  deleteProject, 
  saveProjectList 
} from '@/lib/storage';
import { SavedProject } from '@/lib/types';

const EMPTY_GRAPH: NetworkGraph = {
  nodes: [],
  edges: [],
};

export default function Home() {
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'workspace'>('workspace');
  const [graph, setGraph] = useState<NetworkGraph>(EMPTY_GRAPH);
  const [projectName, setProjectName] = useState<string>('Untitled Topology');
  const [projectDescription, setProjectDescription] = useState<string>('');
  const [projectCategory, setProjectCategory] = useState<string>('Custom Design');
  const [mode, setMode] = useState<'build' | 'analyze'>('build');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [isIntroOpen, setIsIntroOpen] = useState<boolean>(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const [alertModalState, setAlertModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant?: 'warning' | 'danger' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'warning',
  });
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const introFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Initialize and Hydrate saved projects & theme on startup
  useEffect(() => {
    // Theme hydration
    const savedTheme = (localStorage.getItem('axial_theme') as 'light' | 'dark') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Load existing projects from localStorage (preserves user deletions and empty state)
    const existing = getSavedProjects();
    setSavedProjects(existing);

    // If no networks created yet, load the intro modal. If 1 or more networks exist, do not show intro on refresh.
    setCurrentView('dashboard');
    if (existing.length === 0) {
      setIsIntroOpen(true);
    } else {
      setIsIntroOpen(false);
    }
  }, []);

  const handleToggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('axial_theme', next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  // Attack & Simulation State
  const [attackedNodes, setAttackedNodes] = useState<string[]>([]);
  const [attackedEdges, setAttackedEdges] = useState<string[]>([]);
  const [isolatedNodes, setIsolatedNodes] = useState<string[]>([]);
  const [capacityLostG, setCapacityLostG] = useState<number>(0);

  // Analysis Data
  const [resilience, setResilience] = useState<ResilienceResult | null>(null);
  const [criticalityRankings, setCriticalityRankings] = useState<CriticalityNode[]>([]);
  const [mengerResult, setMengerResult] = useState<MengerResult | null>(null);

  // Simulation Narrator
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [stepCaption, setStepCaption] = useState<string>('');
  const [stepNumber, setStepNumber] = useState<number>(1);

  // Check Backend Engine Status
  useEffect(() => {
    const checkStatus = async () => {
      const ok = await checkBackendStatus();
      setIsBackendOnline(ok);
    };
    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  // Recalculate Resilience & Criticality whenever Graph Changes
  const refreshAnalysisData = useCallback(
    async (currentGraph: NetworkGraph) => {
      const [resRes, critRes] = await Promise.all([
        fetchResilienceScore(currentGraph),
        fetchCriticalityRanking(currentGraph),
      ]);
      setResilience(resRes);
      setCriticalityRankings(critRes.rankings);
    },
    []
  );

  useEffect(() => {
    refreshAnalysisData(graph);
  }, [graph, refreshAnalysisData]);

  // Handle Graph Edits from Builder Mode Canvas
  const handleGraphChange = (newGraph: NetworkGraph) => {
    setGraph(newGraph);
  };

  // Toggle Attack Target Node
  const handleToggleTargetNode = (nodeId: string) => {
    setAttackedNodes(prev =>
      prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]
    );
  };

  // Toggle Attack Target Edge
  const handleToggleTargetEdge = (edgeId: string) => {
    setAttackedEdges(prev =>
      prev.includes(edgeId) ? prev.filter(id => id !== edgeId) : [...prev, edgeId]
    );
  };

  // Execute Custom Attack
  const handleExecuteAttack = async () => {
    setIsSimulating(true);
    setStepNumber(1);
    setStepCaption('Initiating attack simulation & calculating graph disruptions...');

    await new Promise(r => setTimeout(r, 600));

    const result = await simulateAttack(graph, attackedNodes, attackedEdges);

    setStepNumber(3);
    setStepCaption(
      `Disruption recorded: ${result.isolated_nodes.length} nodes isolated from gateway. Total capacity lost: ${result.total_capacity_lost} Gbps.`
    );
    setIsolatedNodes(result.isolated_nodes);
    setCapacityLostG(result.total_capacity_lost);
    setResilience(result.resilience);

    await new Promise(r => setTimeout(r, 800));

    setStepNumber(4);
    setStepCaption(`Rerouting surviving traffic. Final Resilience Rating: ${result.resilience.resilience_score}/100 (${result.resilience.grade})`);
    setIsSimulating(false);
  };

  // Reset / Clear Attack State
  const handleResetAttack = () => {
    setAttackedNodes([]);
    setAttackedEdges([]);
    setIsolatedNodes([]);
    setCapacityLostG(0);
    setStepCaption('');
    refreshAnalysisData(graph);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#2563eb', '#10b981', '#6366f1', '#f59e0b']
      });
    } catch {
      // Confetti fallback
    }
  };

  // Run Preset Attack Scenarios
  const handleRunPreset = async (scenarioId: 'single_point' | 'regional' | 'coordinated') => {
    setIsSimulating(true);
    setStepNumber(1);
    setStepCaption('Scanning network graph topology for vulnerable targets...');

    await new Promise(r => setTimeout(r, 700));

    let targetNodes: string[] = [];
    let targetEdges: string[] = [];

    if (scenarioId === 'single_point') {
      const topNode = criticalityRankings[0]?.id || graph.nodes[0]?.id;
      targetNodes = topNode ? [topNode] : [];
      setStepCaption(`Target Locked: Single point of failure [${targetNodes[0]}]`);
    } else if (scenarioId === 'regional') {
      targetNodes = criticalityRankings.slice(0, 2).map(n => n.id);
      setStepCaption('Target Locked: Regional power outage across multiple distribution hubs');
    } else {
      targetNodes = criticalityRankings.slice(0, 3).map(n => n.id);
      targetEdges = graph.edges[0] ? [graph.edges[0].id] : [];
      setStepCaption('Target Locked: Coordinated multi-vector cyber-physical attack');
    }

    setAttackedNodes(targetNodes);
    setAttackedEdges(targetEdges);
    setStepNumber(2);

    await new Promise(r => setTimeout(r, 900));

    const result = await simulateAttack(graph, targetNodes, targetEdges);

    setStepNumber(3);
    setStepCaption(`Attack Impact: ${result.isolated_nodes.length} nodes disconnected. Capacity lost: ${result.total_capacity_lost} Gbps.`);
    setIsolatedNodes(result.isolated_nodes);
    setCapacityLostG(result.total_capacity_lost);
    setResilience(result.resilience);

    await new Promise(r => setTimeout(r, 1000));

    setStepNumber(4);
    setStepCaption(`Traffic rerouted along surviving independent paths. Resilience: ${result.resilience.resilience_score}/100 (${result.resilience.grade})`);
    setIsSimulating(false);
  };

  // Compute Menger Paths
  const handleComputeMenger = async (sourceId: string, sinkId: string) => {
    const res = await fetchMengerPaths(graph, sourceId, sinkId);
    setMengerResult(res);
  };

  // Open existing project from dashboard
  const handleOpenProject = (project: SavedProject, initialMode: 'build' | 'analyze' = 'build') => {
    setGraph(project.graph);
    setProjectName(project.name);
    setProjectDescription(project.description || '');
    setProjectCategory(project.category || 'Custom Design');
    setCurrentProjectId(project.id);
    setMode(initialMode);
    setCurrentView('workspace');
    handleResetAttack();
  };

  // Delete project from library
  const handleDeleteProject = (projectId: string) => {
    const updated = deleteProject(projectId);
    setSavedProjects(updated);
    if (currentProjectId === projectId) {
      setCurrentProjectId(null);
    }
  };

  // Open Save Modal when clicking Save in Header
  const handleSaveToLibrary = () => {
    if (graph.nodes.length === 0) {
      setAlertModalState({
        isOpen: true,
        title: 'Cannot Save Empty Topology',
        message: 'Please drag and place at least one network node on the canvas before saving to your library.',
        variant: 'warning',
      });
      return;
    }
    setIsSaveModalOpen(true);
  };

  // Confirm Save with Custom Name, Category and Description
  const handleConfirmSave = (name: string, description: string, category: string) => {
    setProjectName(name);
    setProjectDescription(description);
    setProjectCategory(category);

    if (currentProjectId) {
      const updated = updateProject(currentProjectId, {
        name,
        description,
        category,
        graph,
        resilience,
      });
      setSavedProjects(updated);
    } else {
      const newProj = createNewProject(name, graph, description, resilience, category);
      setCurrentProjectId(newProj.id);
      setSavedProjects(getSavedProjects());
    }

    setIsSaveModalOpen(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    try {
      confetti({
        particleCount: 35,
        spread: 45,
        origin: { y: 0.2 },
        colors: ['#2563eb', '#10b981', '#6366f1']
      });
    } catch {
      // Confetti fallback
    }
  };

  // Load Starter Template
  const handleSelectTemplate = (template: StarterTemplate) => {
    setGraph(template.graph);
    setProjectName(template.name);
    
    // Automatically save into project library
    const newProj = createNewProject(template.name, template.graph, template.description, undefined, template.category);
    setCurrentProjectId(newProj.id);
    setSavedProjects(getSavedProjects());
    setCurrentView('workspace');

    handleResetAttack();
    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.3 },
        colors: ['#2563eb', '#7c3aed', '#059669']
      });
    } catch {
      // Confetti fallback
    }
  };

  // Save Graph JSON Download
  const handleSaveJson = () => {
    const jsonStr = JSON.stringify(graph, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_topology.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Load Custom JSON
  const handleLoadJson = (newGraph: NetworkGraph) => {
    setGraph(newGraph);
    const newProj = createNewProject(projectName || 'Imported Topology', newGraph);
    setCurrentProjectId(newProj.id);
    setSavedProjects(getSavedProjects());
    setCurrentView('workspace');
    handleResetAttack();
  };

  // Intro & Dashboard Action Handlers
  const handleCreateBlank = () => {
    setGraph(EMPTY_GRAPH);
    setProjectName('New Topology');
    setProjectDescription('');
    setProjectCategory('Custom Design');
    setCurrentProjectId(null);
    setMode('build');
    setCurrentView('workspace');
    handleResetAttack();
    setIsIntroOpen(false);
  };

  const handleOpenTemplatesFromIntro = () => {
    setIsIntroOpen(false);
    setIsTemplateModalOpen(true);
  };

  const handleImportJsonFromIntro = () => {
    introFileInputRef.current?.click();
  };

  const handleIntroFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.nodes && parsed.edges) {
          setGraph(parsed as NetworkGraph);
          const name = file.name.replace(/\.json$/i, '').replace(/_/g, ' ');
          setProjectName(name);
          const newProj = createNewProject(name, parsed as NetworkGraph);
          setCurrentProjectId(newProj.id);
          setSavedProjects(getSavedProjects());
          setCurrentView('workspace');
          handleResetAttack();
          setIsIntroOpen(false);
        } else {
          setAlertModalState({
            isOpen: true,
            title: 'Invalid Topology Schema',
            message: 'The uploaded JSON file must contain "nodes" and "edges" arrays matching Axial schema.',
            variant: 'danger',
          });
        }
      } catch {
        setAlertModalState({
          isOpen: true,
          title: 'Invalid JSON File',
          message: 'Failed to parse JSON file. Please verify file formatting and try again.',
          variant: 'danger',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleRunDemo = () => {
    const demoTemplate = STARTER_TEMPLATES[0];
    if (demoTemplate) {
      setGraph(demoTemplate.graph);
      setProjectName(demoTemplate.name);
      const newProj = createNewProject(demoTemplate.name, demoTemplate.graph, demoTemplate.description, undefined, demoTemplate.category);
      setCurrentProjectId(newProj.id);
      setSavedProjects(getSavedProjects());
      setMode('analyze');
      setCurrentView('workspace');
      handleResetAttack();
    }
    setIsIntroOpen(false);
  };

  // Reset Topology Canvas
  const handleReset = () => {
    setIsResetConfirmOpen(true);
  };

  const handleConfirmReset = () => {
    setGraph(EMPTY_GRAPH);
    setProjectName('Untitled Topology');
    setProjectDescription('');
    setProjectCategory('Custom Design');
    setCurrentProjectId(null);
    handleResetAttack();
    setIsResetConfirmOpen(false);
  };

  const handleToggleDashboard = () => {
    setCurrentView(prev => prev === 'dashboard' ? 'workspace' : 'dashboard');
  };

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden font-sans transition-colors duration-200 ${
      theme === 'dark' ? 'bg-[#090c15] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Hidden file input for Introduction Modal */}
      <input
        ref={introFileInputRef}
        type="file"
        accept=".json"
        onChange={handleIntroFileChange}
        className="hidden"
      />

      {/* Header Bar */}
      <Header
        mode={mode}
        onModeChange={setMode}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        onOpenDashboard={handleToggleDashboard}
        currentView={currentView}
        savedProjectsCount={savedProjects.length}
        onSaveToLibrary={handleSaveToLibrary}
        isSaved={isSaved}
        onSaveJson={handleSaveJson}
        onLoadJson={handleLoadJson}
        onReset={handleReset}
        onError={(title, message) => setAlertModalState({ isOpen: true, title, message, variant: 'danger' })}
        isBackendOnline={isBackendOnline}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area: Switch between Existing Networks Dashboard and Canvas Workspace */}
      {currentView === 'dashboard' ? (
        <ProjectsDashboard
          projects={savedProjects}
          onOpenProject={handleOpenProject}
          onCreateNew={handleCreateBlank}
          onOpenTemplates={() => setIsTemplateModalOpen(true)}
          onImportJson={handleImportJsonFromIntro}
          onDeleteProject={handleDeleteProject}
          theme={theme}
        />
      ) : (
        <main className="flex-1 flex overflow-hidden relative">
          {mode === 'build' ? (
            <BuilderCanvas 
              graph={graph} 
              onGraphChange={handleGraphChange} 
              theme={theme} 
              onOpenTemplates={() => setIsTemplateModalOpen(true)} 
            />
          ) : (
            <div className="flex-1 flex w-full h-[calc(100vh-64px)] overflow-hidden">
              {/* Main Topological Canvas & Attack Controls */}
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <AttackPanel
                  attackedNodes={attackedNodes}
                  attackedEdges={attackedEdges}
                  onExecuteAttack={handleExecuteAttack}
                  onResetAttack={handleResetAttack}
                  onRunPreset={handleRunPreset}
                  isSimulating={isSimulating}
                  stepCaption={stepCaption}
                  stepNumber={stepNumber}
                />

                <div className="flex-1 relative overflow-hidden">
                  <AnalyzeCanvas
                    graph={graph}
                    attackedNodes={attackedNodes}
                    attackedEdges={attackedEdges}
                    isolatedNodes={isolatedNodes}
                    mengerPaths={mengerResult?.vertex_disjoint_paths}
                    onToggleTargetNode={handleToggleTargetNode}
                    onToggleTargetEdge={handleToggleTargetEdge}
                    theme={theme}
                  />
                </div>
              </div>

              {/* Analysis Dashboard Sidebar */}
              <aside className={`w-96 backdrop-blur-2xl border-l p-5 overflow-y-auto space-y-4 h-full transition-colors duration-200 ${
                theme === 'dark' 
                  ? 'bg-[#0c101c]/95 border-white/[0.08] shadow-2xl text-slate-100' 
                  : 'bg-white/95 border-slate-200/80 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] text-slate-900'
              }`}>
                <StatsPanel
                  resilience={resilience}
                  totalNodesCount={graph.nodes.length}
                  isolatedCount={isolatedNodes.length}
                  capacityLostG={capacityLostG}
                />

                <LeaderboardPanel
                  rankings={criticalityRankings}
                  onSelectNode={handleToggleTargetNode}
                  attackedNodes={attackedNodes}
                />

                <MengerPathPanel
                  nodes={graph.nodes}
                  mengerResult={mengerResult}
                  onComputeMenger={handleComputeMenger}
                />
              </aside>
            </div>
          )}
        </main>
      )}

      {/* Starter Templates Picker Modal */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Welcome Introduction & Onboarding Modal */}
      <IntroductionModal
        isOpen={isIntroOpen}
        onClose={() => {
          setIsIntroOpen(false);
          setCurrentView('dashboard');
        }}
        onCreateNew={handleCreateBlank}
        onOpenTemplates={handleOpenTemplatesFromIntro}
        onImportJson={handleImportJsonFromIntro}
        onRunDemo={handleRunDemo}
      />

      {/* Save Network Custom Name & Description Modal */}
      <SaveNetworkModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleConfirmSave}
        currentName={projectName}
        currentDescription={projectDescription}
        currentCategory={projectCategory}
        graph={graph}
        resilience={resilience}
      />

      {/* In-App Reset Canvas Confirmation Modal */}
      <ConfirmationModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset Canvas Workspace"
        message="Are you sure you want to reset the canvas to a blank workspace? Any unsaved changes in your active topology will be cleared."
        confirmText="Reset Canvas"
        cancelText="Cancel"
        variant="danger"
        icon="reset"
      />

      {/* Generic In-App Notification / Warning Dialog */}
      <ConfirmationModal
        isOpen={alertModalState.isOpen}
        onClose={() => setAlertModalState(prev => ({ ...prev, isOpen: false }))}
        title={alertModalState.title}
        message={alertModalState.message}
        variant={alertModalState.variant || 'warning'}
        icon="alert"
        isAlertOnly
      />
    </div>
  );
}
