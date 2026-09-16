import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  useReactFlow,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { AppNode, AppEdge, NetworkGraph, NodeType } from '@/lib/types';
import { CustomNode, CustomNodeData } from './CustomNode';
import { ComponentPalette } from './ComponentPalette';
import { InspectorDrawer } from './InspectorDrawer';

interface BuilderCanvasProps {
  graph: NetworkGraph;
  onGraphChange: (newGraph: NetworkGraph) => void;
}

const nodeTypes = {
  custom: CustomNode,
};

const BuilderCanvasContent: React.FC<BuilderCanvasProps> = ({ graph, onGraphChange }) => {
  const reactFlowInstance = useReactFlow();

  // Convert AppNode[] -> ReactFlow Node[]
  const initialNodes: Node[] = useMemo(() => {
    return graph.nodes.map(n => ({
      id: n.id,
      type: 'custom',
      position: { x: n.x, y: n.y },
      data: {
        name: n.name,
        type: n.type,
        tier: n.tier,
        capacity: n.capacity,
        status: n.status,
      } as CustomNodeData,
    }));
  }, [graph.nodes]);

  // Convert AppEdge[] -> ReactFlow Edge[]
  const initialEdges: Edge[] = useMemo(() => {
    return graph.edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: `${e.capacity}G • ${e.latency}ms`,
      labelStyle: { fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace', fontWeight: 500 },
      labelBgStyle: { fill: '#0f1422', fillOpacity: 0.9, rx: 6, ry: 6 },
      labelBgPadding: [6, 4] as [number, number],
      style: { 
        stroke: e.status === 'damaged' ? '#f43f5e' : '#3b82f6', 
        strokeWidth: 2,
        opacity: e.status === 'offline' ? 0.3 : 0.8
      },
      animated: e.status === 'active',
      data: { capacity: e.capacity, latency: e.latency, status: e.status },
    }));
  }, [graph.edges]);

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // Sync state if external template or JSON graph changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges]);

  // Synchronize ReactFlow state changes back to AppGraph format in parent
  const syncToAppGraph = useCallback(
    (currentNodes: Node[], currentEdges: Edge[]) => {
      const updatedAppNodes: AppNode[] = currentNodes.map(n => {
        const data = n.data as unknown as CustomNodeData;
        return {
          id: n.id,
          name: data.name || n.id,
          type: data.type || 'switch',
          tier: data.tier || 2,
          capacity: data.capacity || 10,
          status: data.status || 'active',
          x: n.position.x,
          y: n.position.y,
        };
      });

      const updatedAppEdges: AppEdge[] = currentEdges.map(e => {
        const data = (e.data || {}) as { capacity?: number; latency?: number; status?: string };
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          capacity: data.capacity || 20,
          latency: data.latency || 5,
          status: (data.status || 'active') as 'active' | 'damaged' | 'offline',
        };
      });

      onGraphChange({
        root_id: graph.root_id,
        nodes: updatedAppNodes,
        edges: updatedAppEdges,
      });
    },
    [graph.root_id, onGraphChange]
  );

  const onNodesChange: OnNodesChange = useCallback(
    changes => {
      const nextNodes = applyNodeChanges(changes, nodes);
      setNodes(nextNodes);
      const hasPositionChange = changes.some(c => c.type === 'position' && !c.dragging);
      if (hasPositionChange) {
        syncToAppGraph(nextNodes, edges);
      }
    },
    [nodes, edges, syncToAppGraph]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    changes => {
      const nextEdges = applyEdgeChanges(changes, edges);
      setEdges(nextEdges);
      const hasRemove = changes.some(c => c.type === 'remove');
      if (hasRemove) {
        syncToAppGraph(nodes, nextEdges);
      }
    },
    [nodes, edges, syncToAppGraph]
  );

  const onNodeDragStop = useCallback(
    () => {
      syncToAppGraph(nodes, edges);
    },
    [nodes, edges, syncToAppGraph]
  );

  // Handle new edge connections drawn on canvas
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdgeId = `e-${params.source}-${params.target}`;
      const newEdge: Edge = {
        ...params,
        id: newEdgeId,
        label: '20G • 5ms',
        labelStyle: { fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace', fontWeight: 500 },
        labelBgStyle: { fill: '#0f1422', fillOpacity: 0.9, rx: 6, ry: 6 },
        labelBgPadding: [6, 4] as [number, number],
        style: { stroke: '#3b82f6', strokeWidth: 2, opacity: 0.8 },
        animated: true,
        data: { capacity: 20, latency: 5, status: 'active' },
      };
      const nextEdges = addEdge(newEdge, edges);
      setEdges(nextEdges);
      syncToAppGraph(nodes, nextEdges);
    },
    [edges, nodes, syncToAppGraph]
  );

  // Drag over drop target logic
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Drop component from Palette onto Canvas
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const rawData = event.dataTransfer.getData('application/reactflow');
      if (!rawData) return;

      const item = JSON.parse(rawData);
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNodeId = `node-${Date.now()}`;
      const newNode: Node = {
        id: newNodeId,
        type: 'custom',
        position,
        data: {
          name: `${item.name}`,
          type: item.type as NodeType,
          tier: item.tier as 1 | 2 | 3,
          capacity: item.capacity,
          status: 'active',
        } as CustomNodeData,
      };

      const nextNodes = nodes.concat(newNode);
      setNodes(nextNodes);
      syncToAppGraph(nextNodes, edges);
    },
    [edges, nodes, reactFlowInstance, syncToAppGraph]
  );

  // Selection handlers
  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
  };

  const onEdgeClick = (_: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
  };

  const onPaneClick = () => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  };

  // Node & Edge property updates from Inspector
  const selectedAppNode = useMemo(
    () => graph.nodes.find(n => n.id === selectedNodeId) || null,
    [graph.nodes, selectedNodeId]
  );

  const selectedAppEdge = useMemo(
    () => graph.edges.find(e => e.id === selectedEdgeId) || null,
    [graph.edges, selectedEdgeId]
  );

  const handleUpdateNode = (updated: AppNode) => {
    const nextAppNodes = graph.nodes.map(n => (n.id === updated.id ? updated : n));
    onGraphChange({ ...graph, nodes: nextAppNodes });

    setNodes(nds =>
      nds.map(n =>
        n.id === updated.id
          ? {
              ...n,
              data: {
                ...n.data,
                name: updated.name,
                type: updated.type,
                tier: updated.tier,
                capacity: updated.capacity,
                status: updated.status,
              },
            }
          : n
      )
    );
  };

  const handleUpdateEdge = (updated: AppEdge) => {
    const nextAppEdges = graph.edges.map(e => (e.id === updated.id ? updated : e));
    onGraphChange({ ...graph, edges: nextAppEdges });

    setEdges(eds =>
      eds.map(e =>
        e.id === updated.id
          ? {
              ...e,
              label: `${updated.capacity}G • ${updated.latency}ms`,
              style: { stroke: updated.status === 'damaged' ? '#f43f5e' : '#3b82f6', strokeWidth: 2 },
              animated: updated.status === 'active',
              data: { capacity: updated.capacity, latency: updated.latency, status: updated.status },
            }
          : e
      )
    );
  };

  const handleDeleteNode = (id: string) => {
    const nextNodes = nodes.filter(n => n.id !== id);
    const nextEdges = edges.filter(e => e.source !== id && e.target !== id);
    setNodes(nextNodes);
    setEdges(nextEdges);
    setSelectedNodeId(null);
    syncToAppGraph(nextNodes, nextEdges);
  };

  const handleDeleteEdge = (id: string) => {
    const nextEdges = edges.filter(e => e.id !== id);
    setEdges(nextEdges);
    setSelectedEdgeId(null);
    syncToAppGraph(nodes, nextEdges);
  };

  const handleSetRoot = (id: string) => {
    onGraphChange({ ...graph, root_id: id });
  };

  return (
    <div className="flex w-full h-[calc(100vh-64px)] relative bg-[#090c15] bg-blueprint-grid">
      {/* Component Palette Sidebar */}
      <ComponentPalette />

      {/* Main Drag-and-Drop Canvas */}
      <div className="flex-1 h-full relative" onDragOver={onDragOver} onDrop={onDrop}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={onNodeDragStop}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          fitView
          className="bg-transparent"
        >
          <Background color="rgba(255, 255, 255, 0.05)" gap={28} size={1} />
          <Controls position="top-left" />
          <MiniMap
            nodeColor={node => {
              const data = node.data as unknown as CustomNodeData;
              if (data.status === 'damaged') return '#f43f5e';
              if (data.tier === 1) return '#3b82f6';
              if (data.tier === 2) return '#6366f1';
              return '#64748b';
            }}
            maskColor="rgba(9, 12, 21, 0.85)"
          />
        </ReactFlow>
      </div>

      {/* Inspector Drawer */}
      <InspectorDrawer
        selectedNode={selectedAppNode}
        selectedEdge={selectedAppEdge}
        rootId={graph.root_id}
        onUpdateNode={handleUpdateNode}
        onUpdateEdge={handleUpdateEdge}
        onDeleteNode={handleDeleteNode}
        onDeleteEdge={handleDeleteEdge}
        onSetRoot={handleSetRoot}
        onClose={() => {
          setSelectedNodeId(null);
          setSelectedEdgeId(null);
        }}
      />
    </div>
  );
};

export const BuilderCanvas: React.FC<BuilderCanvasProps> = props => {
  return (
    <ReactFlowProvider>
      <BuilderCanvasContent {...props} />
    </ReactFlowProvider>
  );
};
