export type NodeType = 
  | 'gateway'
  | 'core_router'
  | 'datacenter'
  | 'switch'
  | 'regional_hub'
  | 'access_point'
  | 'workstation'
  | 'iot_device';

export type NodeStatus = 'active' | 'damaged' | 'offline';
export type EdgeStatus = 'active' | 'damaged' | 'offline';

export interface AppNode {
  id: string;
  name: string;
  type: NodeType;
  tier: 1 | 2 | 3;
  capacity: number; // in Gbps or Mbps
  status: NodeStatus;
  x: number;
  y: number;
  details?: Record<string, unknown>;
}

export interface AppEdge {
  id: string;
  source: string;
  target: string;
  capacity: number; // Gbps
  latency: number;  // ms
  status: EdgeStatus;
}

export interface NetworkGraph {
  nodes: AppNode[];
  edges: AppEdge[];
  root_id?: string;
}

export interface ConnectivityResult {
  root_id: string;
  reachable_nodes: string[];
  isolated_nodes: string[];
  reachability_ratio: number;
  total_nodes: number;
}

export interface MinCutResult {
  source_id: string;
  sink_id: string;
  max_flow: number;
  bottleneck_edges: string[][];
  source_partition: string[];
  sink_partition: string[];
}

export interface MengerResult {
  source_id: string;
  sink_id: string;
  vertex_disjoint_paths: string[][];
  edge_disjoint_paths: string[][];
  count: number;
}

export interface CriticalityNode {
  id: string;
  name: string;
  type: NodeType;
  tier: number;
  score: number;
  disconnected_count: number;
  capacity_lost: number;
  explanation: string;
}

export interface CriticalityResult {
  rankings: CriticalityNode[];
  articulation_points: string[];
  bridges: string[][];
}

export interface ResilienceResult {
  resilience_score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  redundancy_score: number;
  connected_percentage: number;
  capacity_retention_percentage: number;
  single_points_of_failure_count: number;
  summary: string;
}

export interface AttackSimulationResult {
  graph: NetworkGraph;
  attacked_nodes: string[];
  attacked_edges: string[];
  isolated_nodes: string[];
  reachable_nodes: string[];
  total_capacity_lost: number;
  resilience: ResilienceResult;
  rerouted_paths: Record<string, string[]>;
}

export interface PresetScenario {
  id: 'single_point' | 'regional' | 'coordinated';
  title: string;
  description: string;
  iconName: string;
}

export interface SavedProject {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  graph: NetworkGraph;
  nodeCount: number;
  edgeCount: number;
  totalCapacityGbps: number;
  resilienceScore?: number;
  grade?: string;
  category?: string;
}
