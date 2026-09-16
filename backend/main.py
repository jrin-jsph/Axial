import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from models import (
    NetworkGraphModel, AttackRequest, MinCutRequest, MengerRequest,
    ConnectivityResult, MinCutResult, MengerResult,
    CriticalityResult, ResilienceResult, AttackSimulationResult
)
import graph_engine

app = FastAPI(
    title="Axial Graph Theory Engine",
    description="Backend API and WebSocket engine for Network Infrastructure Resilience Simulation",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Axial Graph Engine",
        "version": "1.0.0"
    }


@app.post("/api/connectivity", response_model=ConnectivityResult)
def get_connectivity(graph: NetworkGraphModel):
    return graph_engine.calculate_connectivity(graph)


@app.post("/api/mincut", response_model=MinCutResult)
def get_mincut(req: MinCutRequest):
    return graph_engine.compute_min_cut_max_flow(req.graph, req.source_id, req.sink_id)


@app.post("/api/disjoint-paths", response_model=MengerResult)
def get_disjoint_paths(req: MengerRequest):
    return graph_engine.compute_menger_paths(req.graph, req.source_id, req.sink_id)


@app.post("/api/simulate-attack", response_model=AttackSimulationResult)
def simulate_attack(req: AttackRequest):
    return graph_engine.simulate_attack_scenario(req.graph, req.attacked_nodes, req.attacked_edges)


@app.post("/api/criticality-ranking", response_model=CriticalityResult)
def get_criticality_ranking(graph: NetworkGraphModel):
    return graph_engine.rank_criticality(graph)


@app.post("/api/resilience-score", response_model=ResilienceResult)
def get_resilience_score(graph: NetworkGraphModel):
    return graph_engine.calculate_resilience(graph)


@app.websocket("/ws/simulate")
async def websocket_simulation(websocket: WebSocket):
    """
    WebSocket endpoint for live animated scenario playback.
    Accepts JSON containing { "scenario": "single_point|regional|coordinated", "graph": ... }
    Emits step-by-step event messages for the frontend.
    """
    await websocket.accept()
    try:
        while True:
            data_str = await websocket.receive_text()
            data = json.loads(data_str)
            
            scenario = data.get("scenario", "single_point")
            graph_data = data.get("graph")
            if not graph_data:
                await websocket.send_json({"error": "No graph provided"})
                continue
                
            graph = NetworkGraphModel(**graph_data)
            root_id = graph_engine.get_root_id(graph)
            
            # Step 1: Initial Scan
            await websocket.send_json({
                "step": 1,
                "phase": "SCANNING",
                "caption": "Initiating network topological vulnerability scan...",
                "active_nodes": [n.id for n in graph.nodes]
            })
            await asyncio.sleep(0.8)
            
            # Select targets based on scenario
            crit_res = graph_engine.rank_criticality(graph)
            top_nodes = [n.id for n in crit_res.rankings]
            
            target_nodes = []
            target_edges = []
            
            if scenario == "single_point":
                target_nodes = top_nodes[:1] if top_nodes else (graph.nodes[:1] if graph.nodes else [])
                caption_text = f"Targeting critical single point of failure: {target_nodes[0] if target_nodes else 'node'}"
            elif scenario == "regional":
                # Take top 2 critical nodes + any interconnecting edge
                target_nodes = top_nodes[:2] if len(top_nodes) >= 2 else [n.id for n in graph.nodes[:2]]
                caption_text = "Simulating regional power/link grid outage across multiple hubs..."
            else:  # Coordinated
                target_nodes = top_nodes[:3] if len(top_nodes) >= 3 else [n.id for n in graph.nodes[:3]]
                if len(graph.edges) > 0:
                    target_edges = [graph.edges[0].id]
                caption_text = "Executing multi-vector coordinated cyber-physical attack..."

            # Step 2: Target Lock
            await websocket.send_json({
                "step": 2,
                "phase": "LOCK_TARGET",
                "caption": caption_text,
                "target_nodes": target_nodes,
                "target_edges": target_edges
            })
            await asyncio.sleep(1.0)
            
            # Step 3: Attack Trigger & Disruption
            res = graph_engine.simulate_attack_scenario(graph, target_nodes, target_edges)
            await websocket.send_json({
                "step": 3,
                "phase": "IMPACT",
                "caption": f"Attack impact recorded! {len(res.isolated_nodes)} nodes disconnected. Capacity lost: {res.total_capacity_lost} Gbps.",
                "attacked_nodes": target_nodes,
                "attacked_edges": target_edges,
                "isolated_nodes": res.isolated_nodes,
                "reachable_nodes": res.reachable_nodes,
                "resilience": res.resilience.model_dump()
            })
            await asyncio.sleep(1.2)
            
            # Step 4: Rerouting & Final Analysis
            await websocket.send_json({
                "step": 4,
                "phase": "REROUTING",
                "caption": f"Rerouting surviving traffic. Final Resilience Score: {res.resilience.resilience_score}/100 ({res.resilience.grade})",
                "rerouted_paths": res.rerouted_paths,
                "result": res.model_dump()
            })
            
    except WebSocketDisconnect:
        print("WebSocket client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
