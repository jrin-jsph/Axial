from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class NodeModel(BaseModel):
    id: str
    name: str
    type: str = "switch"  # gateway, core_router, datacenter, switch, regional_hub, access_point, workstation, iot_device
    tier: int = 2        # 1, 2, or 3
    capacity: float = 10.0  # in Gbps or Mbps units
    status: str = "active"  # active, damaged, offline
    x: Optional[float] = 0.0
    y: Optional[float] = 0.0
    details: Optional[Dict[str, Any]] = None


class EdgeModel(BaseModel):
    id: str
    source: str
    target: str
    capacity: float = 10.0  # throughput capacity
    latency: float = 5.0    # ms delay
    status: str = "active"  # active, damaged, offline


class NetworkGraphModel(BaseModel):
    nodes: List[NodeModel]
    edges: List[EdgeModel]
    root_id: Optional[str] = None


class AttackRequest(BaseModel):
    graph: NetworkGraphModel
    attacked_nodes: List[str] = Field(default_factory=list)
    attacked_edges: List[str] = Field(default_factory=list)


class MinCutRequest(BaseModel):
    graph: NetworkGraphModel
    source_id: str
    sink_id: str


class MengerRequest(BaseModel):
    graph: NetworkGraphModel
    source_id: str
    sink_id: str


class ConnectivityResult(BaseModel):
    root_id: str
    reachable_nodes: List[str]
    isolated_nodes: List[str]
    reachability_ratio: float
    total_nodes: int


class MinCutResult(BaseModel):
    source_id: str
    sink_id: str
    max_flow: float
    bottleneck_edges: List[List[str]]  # List of [u, v]
    source_partition: List[str]
    sink_partition: List[str]


class MengerResult(BaseModel):
    source_id: str
    sink_id: str
    vertex_disjoint_paths: List[List[str]]
    edge_disjoint_paths: List[List[str]]
    count: int


class CriticalityNode(BaseModel):
    id: str
    name: str
    type: str
    tier: int
    score: float
    disconnected_count: int
    capacity_lost: float
    explanation: str


class CriticalityResult(BaseModel):
    rankings: List[CriticalityNode]
    articulation_points: List[str]
    bridges: List[List[str]]


class ResilienceResult(BaseModel):
    resilience_score: float
    grade: str
    redundancy_score: float
    connected_percentage: float
    capacity_retention_percentage: float
    single_points_of_failure_count: int
    summary: str


class AttackSimulationResult(BaseModel):
    graph: NetworkGraphModel
    attacked_nodes: List[str]
    attacked_edges: List[str]
    isolated_nodes: List[str]
    reachable_nodes: List[str]
    total_capacity_lost: float
    resilience: ResilienceResult
    rerouted_paths: Dict[str, List[str]]
