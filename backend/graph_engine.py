from typing import List, Dict, Set, Tuple, Optional
import networkx as nx
from models import (
    NetworkGraphModel, NodeModel, EdgeModel,
    ConnectivityResult, MinCutResult, MengerResult,
    CriticalityNode, CriticalityResult, ResilienceResult,
    AttackSimulationResult
)


def get_root_id(graph: NetworkGraphModel) -> str:
    """Determine the root gateway node for the network graph."""
    if graph.root_id:
        # Check if root_id exists in nodes
        for node in graph.nodes:
            if node.id == graph.root_id:
                return node.id
    
    # Fallback 1: look for tier 1 gateway or core router
    for node in graph.nodes:
        if node.tier == 1 or node.type in ["gateway", "core_router", "datacenter"]:
            return node.id
            
    # Fallback 2: return first node
    if graph.nodes:
        return graph.nodes[0].id
        
    return ""


def build_nx_graph(
    graph: NetworkGraphModel,
    exclude_nodes: Optional[Set[str]] = None,
    exclude_edges: Optional[Set[str]] = None,
    directed: bool = False
) -> nx.Graph:
    """Build a NetworkX Graph from NetworkGraphModel with optional removals."""
    exclude_nodes = exclude_nodes or set()
    exclude_edges = exclude_edges or set()

    G = nx.DiGraph() if directed else nx.Graph()

    for node in graph.nodes:
        if node.id in exclude_nodes or node.status == "offline":
            continue
        G.add_node(
            node.id,
            name=node.name,
            type=node.type,
            tier=node.tier,
            capacity=float(node.capacity)
        )

    for edge in graph.edges:
        if edge.id in exclude_edges or edge.status == "offline":
            continue
        if edge.source in exclude_nodes or edge.target in exclude_nodes:
            continue
        if edge.source not in G or edge.target not in G:
            continue

        # Add edge with capacity and latency attributes
        G.add_edge(
            edge.source,
            edge.target,
            id=edge.id,
            capacity=float(edge.capacity),
            latency=float(edge.latency),
            weight=float(edge.latency)  # for shortest path
        )

    return G


def calculate_connectivity(
    graph: NetworkGraphModel,
    exclude_nodes: Optional[Set[str]] = None,
    exclude_edges: Optional[Set[str]] = None
) -> ConnectivityResult:
    """BFS/DFS connectivity search from root node."""
    root_id = get_root_id(graph)
    all_node_ids = [n.id for n in graph.nodes if n.id not in (exclude_nodes or set()) and n.status != "offline"]

    if not root_id or root_id not in all_node_ids:
        return ConnectivityResult(
            root_id=root_id,
            reachable_nodes=[],
            isolated_nodes=all_node_ids,
            reachability_ratio=0.0,
            total_nodes=len(all_node_ids)
        )

    G = build_nx_graph(graph, exclude_nodes, exclude_edges, directed=False)
    
    if root_id not in G:
        return ConnectivityResult(
            root_id=root_id,
            reachable_nodes=[],
            isolated_nodes=all_node_ids,
            reachability_ratio=0.0,
            total_nodes=len(all_node_ids)
        )

    reachable = set(nx.node_connected_component(G, root_id))
    isolated = set(all_node_ids) - reachable

    ratio = len(reachable) / max(1, len(all_node_ids))

    return ConnectivityResult(
        root_id=root_id,
        reachable_nodes=list(reachable),
        isolated_nodes=list(isolated),
        reachability_ratio=round(ratio, 4),
        total_nodes=len(all_node_ids)
    )


def find_articulation_points_and_bridges(graph: NetworkGraphModel) -> Tuple[List[str], List[List[str]]]:
    """Find single points of failure (Articulation Points and Bridges) using Tarjan's algorithm."""
    G = build_nx_graph(graph, directed=False)
    
    art_points = list(nx.articulation_points(G)) if len(G) > 0 else []
    bridges = [list(edge) for edge in nx.bridges(G)] if len(G) > 0 else []

    return art_points, bridges


def compute_min_cut_max_flow(graph: NetworkGraphModel, source_id: str, sink_id: str) -> MinCutResult:
    """Compute Edmonds-Karp Min-Cut Max-Flow between source and sink nodes."""
    G = build_nx_graph(graph, directed=False)

    if source_id not in G or sink_id not in G or source_id == sink_id:
        return MinCutResult(
            source_id=source_id,
            sink_id=sink_id,
            max_flow=0.0,
            bottleneck_edges=[],
            source_partition=[source_id] if source_id in G else [],
            sink_partition=[sink_id] if sink_id in G else []
        )

    try:
        cut_value, partition = nx.minimum_cut(G, source_id, sink_id, capacity='capacity')
        source_partition = list(partition[0])
        sink_partition = list(partition[1])

        # Identify bottleneck cut edges crossing between source_partition and sink_partition
        bottleneck_edges = []
        source_set = set(source_partition)
        for u, v in G.edges():
            if (u in source_set and v not in source_set) or (v in source_set and u not in source_set):
                bottleneck_edges.append([u, v])

        return MinCutResult(
            source_id=source_id,
            sink_id=sink_id,
            max_flow=float(cut_value),
            bottleneck_edges=bottleneck_edges,
            source_partition=source_partition,
            sink_partition=sink_partition
        )
    except Exception as e:
        return MinCutResult(
            source_id=source_id,
            sink_id=sink_id,
            max_flow=0.0,
            bottleneck_edges=[],
            source_partition=[source_id],
            sink_partition=[sink_id]
        )


def compute_menger_paths(graph: NetworkGraphModel, source_id: str, sink_id: str) -> MengerResult:
    """Menger's Theorem calculation for vertex-disjoint and edge-disjoint independent paths."""
    G = build_nx_graph(graph, directed=False)

    if source_id not in G or sink_id not in G or source_id == sink_id:
        return MengerResult(
            source_id=source_id,
            sink_id=sink_id,
            vertex_disjoint_paths=[],
            edge_disjoint_paths=[],
            count=0
        )

    v_paths = []
    e_paths = []

    try:
        v_generator = nx.node_disjoint_paths(G, source_id, sink_id)
        v_paths = [list(path) for path in v_generator]
    except Exception:
        pass

    try:
        e_generator = nx.edge_disjoint_paths(G, source_id, sink_id)
        e_paths = [list(path) for path in e_generator]
    except Exception:
        pass

    return MengerResult(
        source_id=source_id,
        sink_id=sink_id,
        vertex_disjoint_paths=v_paths,
        edge_disjoint_paths=e_paths,
        count=max(len(v_paths), len(e_paths))
    )


def calculate_resilience(
    graph: NetworkGraphModel,
    exclude_nodes: Optional[Set[str]] = None,
    exclude_edges: Optional[Set[str]] = None
) -> ResilienceResult:
    """Compute overall network resilience metrics and grade."""
    root_id = get_root_id(graph)
    G_active = build_nx_graph(graph, exclude_nodes, exclude_edges, directed=False)
    
    total_nodes_count = len([n for n in graph.nodes if n.status != "offline"])
    if total_nodes_count == 0:
        return ResilienceResult(
            resilience_score=0.0,
            grade="F",
            redundancy_score=0.0,
            connected_percentage=0.0,
            capacity_retention_percentage=0.0,
            single_points_of_failure_count=0,
            summary="Network has no active nodes."
        )

    # Reachability
    conn = calculate_connectivity(graph, exclude_nodes, exclude_edges)
    reachable_ratio = conn.reachability_ratio

    # Total capacity before vs active
    total_capacity_orig = sum(float(e.capacity) for e in graph.edges if e.status != "offline")
    total_capacity_active = sum(float(G_active.edges[u, v]['capacity']) for u, v in G_active.edges())
    capacity_ratio = (total_capacity_active / max(1.0, total_capacity_orig)) if total_capacity_orig > 0 else 1.0

    # Redundancy score (edges vs min spanning tree edges)
    n_nodes = len(G_active.nodes)
    n_edges = len(G_active.edges)
    mst_edges_required = max(1, n_nodes - 1)
    redundancy_score = round(min(2.5, n_edges / mst_edges_required), 2) if n_nodes > 1 else 1.0

    # Articulation points in active graph
    art_points = list(nx.articulation_points(G_active)) if len(G_active) > 0 else []
    spof_count = len(art_points)

    # Score calculation formula:
    # 40% reachable nodes + 30% capacity retention + 20% redundancy index + 10% (penalty for SPOFs)
    spof_penalty = min(30.0, spof_count * 10.0)
    raw_score = (reachable_ratio * 45.0) + (capacity_ratio * 35.0) + (min(1.0, redundancy_score / 1.5) * 20.0) - spof_penalty
    resilience_score = max(0.0, min(100.0, round(raw_score, 1)))

    if resilience_score >= 90:
        grade = "A+"
        summary = "Ultra Resilient: High redundancy, zero single points of failure."
    elif resilience_score >= 80:
        grade = "A"
        summary = "Highly Resilient: Well-connected infrastructure with strong rerouting paths."
    elif resilience_score >= 70:
        grade = "B"
        summary = "Moderate Resilience: Minor vulnerabilities present under specific node outages."
    elif resilience_score >= 55:
        grade = "C"
        summary = "Vulnerable Topology: Key articulation points leave network susceptible to isolation."
    elif resilience_score >= 40:
        grade = "D"
        summary = "High Risk: Multiple single points of failure and low redundancy."
    else:
        grade = "F"
        summary = "Critical Failure State: Significant portion of network isolated or offline."

    return ResilienceResult(
        resilience_score=resilience_score,
        grade=grade,
        redundancy_score=redundancy_score,
        connected_percentage=round(reachable_ratio * 100.0, 1),
        capacity_retention_percentage=round(capacity_ratio * 100.0, 1),
        single_points_of_failure_count=spof_count,
        summary=summary
    )


def rank_criticality(graph: NetworkGraphModel) -> CriticalityResult:
    """Leave-one-out simulation to rank nodes by vulnerability & criticality impact."""
    root_id = get_root_id(graph)
    active_nodes = [n for n in graph.nodes if n.status != "offline"]
    total_nodes = len(active_nodes)
    
    if total_nodes == 0:
        return CriticalityResult(rankings=[], articulation_points=[], bridges=[])

    art_points, bridges = find_articulation_points_and_bridges(graph)
    art_set = set(art_points)

    base_conn = calculate_connectivity(graph)
    base_capacity = sum(float(e.capacity) for e in graph.edges if e.status != "offline")

    rankings: List[CriticalityNode] = []

    for node in active_nodes:
        # Simulate removing this node
        exclude_nodes = {node.id}
        conn = calculate_connectivity(graph, exclude_nodes=exclude_nodes)
        disconnected_count = len(conn.isolated_nodes)

        # Capacity loss
        G_after = build_nx_graph(graph, exclude_nodes=exclude_nodes)
        cap_after = sum(float(G_after.edges[u, v]['capacity']) for u, v in G_after.edges())
        cap_lost_pct = round(((base_capacity - cap_after) / max(1.0, base_capacity)) * 100.0, 1)

        # Score formula
        is_spof = node.id in art_set
        score = (disconnected_count / max(1, total_nodes - 1)) * 60.0 + (cap_lost_pct * 0.3) + (25.0 if is_spof else 0.0)
        score = round(min(100.0, score), 1)

        # Auto-generate human readable rationale
        if is_spof and disconnected_count > 0:
            explanation = f"Critical Single Point of Failure: Removing this {node.name} isolates {disconnected_count} downstream nodes and cuts {cap_lost_pct}% flow capacity."
        elif disconnected_count > 0:
            explanation = f"High impact hub: Failure isolates {disconnected_count} nodes from gateway and drops capacity by {cap_lost_pct}%."
        elif cap_lost_pct > 20:
            explanation = f"Major capacity bottleneck: Failure reduces network throughput by {cap_lost_pct}%."
        else:
            explanation = f"Redundant node: Subnetwork maintains alternative backup routes with {cap_lost_pct}% capacity impact."

        rankings.append(CriticalityNode(
            id=node.id,
            name=node.name,
            type=node.type,
            tier=node.tier,
            score=score,
            disconnected_count=disconnected_count,
            capacity_lost=cap_lost_pct,
            explanation=explanation
        ))

    # Sort rankings descending by criticality score
    rankings.sort(key=lambda x: x.score, reverse=True)

    return CriticalityResult(
        rankings=rankings[:5],  # Top 5 most critical nodes
        articulation_points=art_points,
        bridges=bridges
    )


def simulate_attack_scenario(
    graph: NetworkGraphModel,
    attacked_nodes: List[str],
    attacked_edges: List[str]
) -> AttackSimulationResult:
    """Run full graph recomputation under targeted attack state."""
    root_id = get_root_id(graph)
    exclude_nodes = set(attacked_nodes)
    exclude_edges = set(attacked_edges)

    # Copy graph and mark status
    updated_nodes = []
    for n in graph.nodes:
        n_copy = n.model_copy()
        if n.id in exclude_nodes:
            n_copy.status = "damaged"
        updated_nodes.append(n_copy)

    updated_edges = []
    for e in graph.edges:
        e_copy = e.model_copy()
        if e.id in exclude_edges or e.source in exclude_nodes or e.target in exclude_nodes:
            e_copy.status = "damaged"
        updated_edges.append(e_copy)

    updated_graph = NetworkGraphModel(nodes=updated_nodes, edges=updated_edges, root_id=root_id)

    # Compute connectivity
    conn = calculate_connectivity(updated_graph, exclude_nodes=exclude_nodes, exclude_edges=exclude_edges)

    # Compute total capacity lost
    base_cap = sum(float(e.capacity) for e in graph.edges)
    active_cap = sum(float(e.capacity) for e in updated_edges if e.status == "active")
    cap_lost = max(0.0, base_cap - active_cap)

    # Calculate resilience
    resilience = calculate_resilience(updated_graph, exclude_nodes=exclude_nodes, exclude_edges=exclude_edges)

    # Rerouted shortest paths from root to all reachable nodes using remaining graph
    G_rem = build_nx_graph(updated_graph, exclude_nodes=exclude_nodes, exclude_edges=exclude_edges, directed=False)
    rerouted_paths: Dict[str, List[str]] = {}

    if root_id in G_rem:
        for target in conn.reachable_nodes:
            if target != root_id and target in G_rem:
                try:
                    path = nx.shortest_path(G_rem, source=root_id, target=target, weight='weight')
                    rerouted_paths[target] = path
                except Exception:
                    pass

    return AttackSimulationResult(
        graph=updated_graph,
        attacked_nodes=attacked_nodes,
        attacked_edges=attacked_edges,
        isolated_nodes=conn.isolated_nodes,
        reachable_nodes=conn.reachable_nodes,
        total_capacity_lost=round(cap_lost, 1),
        resilience=resilience,
        rerouted_paths=rerouted_paths
    )
