'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NetworkGraph, AppNode, AppEdge, CriticalityNode, ResilienceResult, MengerResult } from '@/lib/types';
import { STARTER_TEMPLATES, StarterTemplate } from '@/lib/templates';
import {
  checkBackendStatus, fetchResilienceScore, fetchCriticalityRanking,
  simulateAttack, fetchMengerPaths
} from '@/lib/api';

import { Header } from '@/components/navbar/Header';
import { TemplateModal } from '@/components/navbar/TemplateModal';
import { BuilderCanvas } from '@/components/build/BuilderCanvas';
import { AnalyzeCanvas } from '@/components/analyze/AnalyzeCanvas';
import { AttackPanel } from '@/components/analyze/AttackPanel';
import { StatsPanel } from '@/components/analyze/StatsPanel';
import { LeaderboardPanel } from '@/components/analyze/LeaderboardPanel';
import { MengerPathPanel } from '@/components/analyze/MengerPathPanel';

export default function Home() {
  const [graph, setGraph] = useState<NetworkGraph>(STARTER_TEMPLATES[0].graph);
  const [projectName, setProjectName] = useState<string>('University Campus Network');
  const [mode, setMode] = useState<'build' | 'analyze'>('build');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);

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

  // Load Starter Template
  const handleSelectTemplate = (template: StarterTemplate) => {
    setGraph(template.graph);
    setProjectName(template.name);
    handleResetAttack();
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
    handleResetAttack();
  };

  // Reset Topology
  const handleReset = () => {
    if (confirm('Reset canvas topology to blank workspace?')) {
      setGraph({
        root_id: 'gw-1',
        nodes: [
          { id: 'gw-1', name: 'Gateway Alpha', type: 'gateway', tier: 1, capacity: 100, status: 'active', x: 450, y: 150 }
        ],
        edges: []
      });
      setProjectName('Untitled Topology');
      handleResetAttack();
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090c15] text-slate-100 font-sans">
      {/* Header Bar */}
      <Header
        mode={mode}
        onModeChange={setMode}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        onSaveJson={handleSaveJson}
        onLoadJson={handleLoadJson}
        onReset={handleReset}
        isBackendOnline={isBackendOnline}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 flex overflow-hidden relative">
        {mode === 'build' ? (
          <BuilderCanvas graph={graph} onGraphChange={handleGraphChange} />
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
                />
              </div>
            </div>

            {/* Analysis Dashboard Sidebar */}
            <aside className="w-96 bg-[#0c101c]/95 backdrop-blur-2xl border-l border-white/[0.08] p-5 overflow-y-auto space-y-4 h-full shadow-2xl">
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

      {/* Starter Templates Picker Modal */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
}
