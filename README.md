<div align="center">

# 🌐 AXIAL
### **Network Infrastructure Builder & Resilience Simulator**

*A full-stack, graph-theory-driven platform to design, analyze, stress-test, and simulate cyber-physical attacks on critical network infrastructures in real-time.*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![NetworkX](https://img.shields.io/badge/NetworkX-3.0+-blue?style=for-the-badge&logo=python&logoColor=white)](https://networkx.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

</div>

## 📌 Overview

**Axial** bridges theoretical discrete mathematics, graph theory, and real-world network engineering into an interactive web application. 

It allows engineers, architects, students, and cybersecurity researchers to visually construct complex network topologies across multiple enterprise tiers, compute topological bottlenecks, detect single points of failure (SPOFs), and execute realistic outage and cyber-attack scenarios with real-time dynamic rerouting.

---

## ✨ Key Features

### 🛠️ Interactive Visual Builder
- **3-Tier Hardware Hierarchy**:
  - **Tier 1 (Core Backbone)**: Internet Gateways, Core Backbone Routers, Data Center Clusters.
  - **Tier 2 (Distribution)**: Layer-3 Aggregation Switches, Regional Fiber Hubs.
  - **Tier 3 (Edge & Access)**: WiFi 6E Access Points, Workstation Terminals, Smart IoT Telemetry Controllers.
- **Drag-and-Drop Canvas**: Powered by `@xyflow/react` with smooth zooming, panning, and interactive edge wiring.
- **Dynamic Inspector Drawer**: Click any device or cable to adjust capacity (Gbps), latency (ms), name, and health status in real time.

### 🔬 Graph Theory Algorithmic Engine
- **Tarjan's Algorithm**: Detects articulation points (nodes whose failure splits the network) and critical bridge links.
- **Menger's Theorem**: Computes vertex-disjoint and edge-disjoint independent routing paths between any selected source and destination.
- **Edmonds-Karp Algorithm**: Solves Min-Cut / Max-Flow boundaries to locate network throughput bottlenecks.
- **Leave-One-Out Criticality Ranking**: Simulates removing each node to rank the Top 5 most vulnerable assets with plain-English blast radius explanations.
- **Objective Resilience Scoring**: Calculates a resilience score ($0 - 100$) and letter grade (**A+** to **F**) based on reachability, capacity retention, redundancy ratio, and SPOF penalties.

### 💥 Cyber-Physical Attack Simulator
- **Interactive Manual Attack**: Click nodes or cables on the canvas to stage targeted strikes.
- **Pre-configured Attack Scenarios**:
  - 🎯 **Single Point of Failure**: Instantly targets the highest-criticality bottleneck.
  - ⚡ **Regional Grid Outage**: Simulates simultaneous failure of regional power or distribution hubs.
  - 🛡️ **Coordinated Cyber-Physical Strike**: Executes a multi-vector attack on core routers and fiber trunks.
- **Live Disruption Visualizer**:
  - Disconnected nodes glow red with an *ISOLATED* status.
  - Computes exact throughput lost (in Gbps).
  - Recalculates and displays surviving traffic routes in real time.

### 📁 Templates & Persistence
- **Starter Templates**:
  - 🏛️ *University Campus Network* (Core Datacenter to Department Labs & Dorm WiFi).
  - 🏢 *Corporate HQ Infrastructure* (Dual multi-homed ISP fiber, DB clusters, floor ring redundancy).
  - 🏙️ *Metropolitan ISP Backbone* (City Internet Exchange, regional ring routers, 5G towers, power grid substations).
- **JSON Import / Export**: Save topologies locally as JSON files and load them at any time.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 16)                    │
│                                                             │
│  [ React Flow Canvas ] ──► [ Component Palette & Inspector ] │
│  [ Attack Simulator  ] ──► [ Telemetry & Leaderboard Panel ]│
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP REST / WebSockets
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI Engine)                 │
│                                                             │
│  [ Tarjan's SPOF / Bridges ] ──► [ Menger's Disjoint Paths ]│
│  [ Edmonds-Karp Min-Cut    ] ──► [ Leave-One-Out Ranking   ]│
│  [ Attack Simulator Engine ] ──► [ Resilience Scorer (A-F) ]│
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.0.0 or higher) & **npm**
- **Python** (v3.9 or higher) & **pip**

---

### Installation & Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/jrin-jsph/Axial.git
cd Axial
```

#### 2. Start the Backend Server (FastAPI)
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Launch backend
python run.py
```
*Backend runs on `http://localhost:8000` (API documentation at `http://localhost:8000/docs`).*

#### 3. Start the Frontend Application (Next.js)
Open a new terminal window:
```bash
cd frontend

# Install Node dependencies
npm install

# Start development server
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

---

## 📂 Project Structure

```text
Axial/
├── backend/
│   ├── graph_engine.py       # Graph algorithms (Tarjan, Menger, Min-Cut, Resilience)
│   ├── main.py               # FastAPI REST API & WebSocket simulation stream
│   ├── models.py             # Pydantic data schemas & request models
│   ├── requirements.txt      # Python dependencies (FastAPI, NetworkX, Uvicorn)
│   └── run.py                # Backend launcher script
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js App Router (page.tsx, layout.tsx, globals.css)
│   │   ├── components/
│   │   │   ├── build/        # BuilderCanvas, ComponentPalette, CustomNode, InspectorDrawer
│   │   │   ├── analyze/      # AnalyzeCanvas, AttackPanel, LeaderboardPanel, StatsPanel, MengerPathPanel
│   │   │   └── navbar/       # Header bar, TemplateModal
│   │   └── lib/              # API clients, starter templates, TypeScript types
│   ├── package.json          # Node dependencies & Next.js scripts
│   └── tsconfig.json         # TypeScript configuration
├── Manual.md                 # Full user manual, formula breakdowns, & graph theory glossary
├── README.md                 # Project landing documentation
└── package.json              # Workspace scripts
```

---

## 📖 Complete Documentation & User Manual

For an in-depth explanation of all graph theory formulas, network terms, and step-by-step guides, refer to [Manual.md](Manual.md).

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
