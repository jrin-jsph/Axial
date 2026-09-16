# 📘 Axial User Manual & Architecture Glossary

Welcome to the **Axial Network Infrastructure Builder & Resilience Simulator** comprehensive user manual and glossary. This guide explains all networking and graph theory concepts used in the application, how every feature works, and how to interpret your resilience scores.

---

## 📑 Table of Contents
1. [Core Glossary & Graph Theory Concepts](#1-core-glossary--graph-theory-concepts)
2. [Network Hardware Hierarchy (3 Tiers)](#2-network-hardware-hierarchy-3-tiers)
3. [Key Features & User Manual](#3-key-features--user-manual)
   - [Builder Mode (Design & Edit)](#builder-mode-design--edit)
   - [Analyze & Attack Mode (Stress Testing)](#analyze--attack-mode-stress-testing)
   - [Telemetry & Analytics Panels](#telemetry--analytics-panels)
4. [Understanding the Resilience Formula & Letter Grades](#4-understanding-the-resilience-formula--letter-grades)
5. [Pre-built Templates Guide](#5-pre-built-templates-guide)
6. [Quick Start & Troubleshooting](#6-quick-start--troubleshooting)

---

## 1. Core Glossary & Graph Theory Concepts

Axial uses discrete mathematics and graph theory algorithms to evaluate network reliability:

| Term | Simple Definition | Practical Networking Meaning |
| :--- | :--- | :--- |
| **Node (Vertex)** | A point or device in the network. | Physical equipment such as a router, switch, gateway, data center, or workstation. |
| **Edge (Link)** | A line connecting two nodes. | Physical fiber optic, copper Ethernet, or wireless backhaul connection. |
| **Root Node (Gateway)** | The primary entry point / upstream ISP link. | The gateway that connects your local infrastructure to the global Internet. |
| **Reachability (BFS / DFS)** | Ability to trace an unbroken path from the Root Node to any target node. | If an unbroken cable/link exists from the gateway to an office terminal, that terminal is "online". |
| **Isolated Node** | A node that has lost all paths back to the Root Gateway. | Devices experiencing an outage because their upstream switch or link failed. |
| **Articulation Point (SPOF)** | A node whose failure divides the network into two or more disconnected pieces (*computed via Tarjan's Algorithm*). | A single switch or router whose failure causes an entire wing, building, or department to lose connectivity. |
| **Bridge Edge** | A cable or link whose cut splits the network into disconnected segments. | A single uplink fiber cable without a backup line. |
| **Menger’s Theorem (Disjoint Paths)** | Mathematical theorem stating that the minimum number of nodes/edges to disconnect $S$ and $T$ equals the maximum number of independent disjoint paths between them. | **Vertex-Disjoint**: Paths that share no intermediate hardware.<br>**Edge-Disjoint**: Paths that share no common cables. |
| **Edmonds-Karp Min-Cut / Max-Flow** | Calculates the maximum data rate (Gbps) that can flow from Source to Sink and identifies the bottleneck edges. | Pinpoints the weakest links that restrict overall network throughput. |
| **Leave-One-Out Simulation** | An automated testing method that takes down one device at a time and measures total network damage. | Used to rank the **Top 5 Most Critical Nodes** based on how many downstream nodes get disconnected if that node fails. |

---

## 2. Network Hardware Hierarchy (3 Tiers)

Axial organizes infrastructure into three standard enterprise network tiers:

```
                      [ Tier 1: Core Backbone ]
                      (Gateways, Core Routers, Data Centers)
                                  │
                                  ▼
                      [ Tier 2: Distribution ]
                      (L3 Switches, Regional Fiber Hubs)
                                  │
                                  ▼
                      [ Tier 3: Edge & Access ]
                      (WiFi 6E APs, Workstations, IoT Sensors)
```

1. **Tier 1: Core Backbone (High Throughput, 60–100 Gbps)**
   - **Internet Gateway**: Ingress/egress edge router connecting to Tier-1 ISPs.
   - **Core Backbone Router**: Central routing engine handling high-speed traffic between zones.
   - **Data Center Cluster**: High-availability server farm hosting databases, identity, and application workloads.

2. **Tier 2: Distribution Aggregation (25–40 Gbps)**
   - **Distribution Switch**: Layer-3 aggregation switch bridging core infrastructure to local access switches.
   - **Regional Hub**: Fiber distribution node aggregating physical buildings or neighborhood zones.

3. **Tier 3: Edge & Access (5–15 Gbps)**
   - **Wireless AP (WiFi 6E)**: High-density wireless access point for client laptops and smartphones.
   - **Workstation Terminal**: Fixed desktop terminals, trading desks, or lab computers.
   - **Smart IoT Controller**: Telemetry sensors, smart building management (BMS), or power grid controllers.

---

## 3. Key Features & User Manual

### Top Navigation Bar
- **Mode Switcher (`Build` vs `Analyze`)**: Toggle between drafting topologies and stress-testing them.
- **Project Name**: Click to rename your network project.
- **Templates**: Open the template library to load pre-built networks.
- **Save / Load JSON**: Export your network design to a file or import an existing `.json` topology.
- **Engine Status Badge**: Indicates if the Python FastAPI algorithmic backend is **Online** (green) or using local fallback (amber).

---

### Builder Mode (Design & Edit)

```
┌─────────────────┬──────────────────────────────────────────┬─────────────────┐
│                 │                                          │                 │
│    COMPONENT    │             INTERACTIVE CANVAS           │    INSPECTOR    │
│     PALETTE     │         (Add, Move, Connect Nodes)       │     DRAWER      │
│                 │                                          │                 │
│  • Gateway      │         [Gateway]                        │  Name: Core-1   │
│  • Core Router  │             │                            │  Tier: Tier 1   │
│  • Switch       │      [Core Router]                       │  Capacity: 80G  │
│  • Workstation  │       /         \                        │  Latency: 2ms   │
│  • IoT Device   │  [Switch A]   [Switch B]                 │  [Delete]       │
│                 │                                          │                 │
└─────────────────┴──────────────────────────────────────────┴─────────────────┘
```

1. **Adding Hardware**: Drag any device from the **Component Palette** on the left and drop it onto the grid canvas.
2. **Connecting Cables**: Click and drag from the circular connector handle of one node to another.
3. **Inspecting & Modifying Parameters**:
   - Click any node or link to open the **Inspector Drawer** on the right.
   - Edit the **Device Name**, **Capacity (Gbps)**, and **Latency (ms)**.
   - Change device status between `Active`, `Damaged`, or `Offline`.
   - Delete obsolete components using the trash icon.

---

### Analyze & Attack Mode (Stress Testing)

In **Analyze Mode**, you can simulate real-world cyber-attacks, physical line cuts, or hardware failures to measure network fault tolerance.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [ Attack Panel ]: [Single Point Preset]  [Regional Preset]  [Execute Attack] │
├──────────────────────────────────────────┬───────────────────────────────────┤
│                                          │  [ RESILIENCE SCORE: 88/100 (A) ] │
│             ANALYSIS CANVAS              ├───────────────────────────────────┤
│                                          │  [ CRITICALITY LEADERBOARD ]      │
│  🟢 Surviving Nodes (Active)             │  1. Core Datacenter (Score: 92.4) │
│  🔴 Isolated Nodes (Outage)              │  2. Main CS Switch  (Score: 68.1) │
│  ⚡ Highlighted Disjoint Paths           ├───────────────────────────────────┤
│                                          │  [ MENGER DISJOINT PATHS ]        │
│                                          │  Source: gw-1  Sink: lab-cs1      │
│                                          │  Independent Routes: 2 Paths      │
└──────────────────────────────────────────┴───────────────────────────────────┘
```

#### How to Run an Attack:
1. **Manual Custom Attack**: Click directly on nodes or cables on the canvas. Selected targets will glow with a red border. Click **Execute Attack**.
2. **Preset Attack Scenarios**:
   - **Single Point of Failure**: Automatically targets the #1 most critical bottleneck in your network.
   - **Regional Power Grid Outage**: Takes down multiple distribution hubs simultaneously.
   - **Coordinated Cyber-Physical Attack**: Strikes both core routers and main fiber trunks at once.
3. **Visual Feedback**:
   - Disconnected nodes glow **Red** with an *ISOLATED* status pill.
   - Surviving nodes stay **Cyan/Green** with active traffic routes.
   - Surviving backup traffic paths are dynamically calculated using Dijkstra's shortest path algorithm.

---

### Telemetry & Analytics Panels

Located in the right sidebar during Analyze Mode:

1. **Stats Panel**:
   - **Resilience Score & Grade**: Real-time score (0–100) and letter rating (A+ to F).
   - **Isolated Nodes**: Total count of endpoints currently cut off from the Internet gateway.
   - **Capacity Lost**: Total lost throughput measured in **Gbps**.
   - **Single Points of Failure**: Count of dangerous articulation points identified by Tarjan's algorithm.

2. **Criticality Leaderboard**:
   - Displays the top 5 most hazardous nodes.
   - Shows the exact percentage of network capacity lost and number of endpoints isolated if that specific node fails.
   - Explains the blast radius in plain English (e.g., *"Critical Single Point of Failure: Isolates 4 downstream nodes"*).

3. **Menger Path Panel**:
   - Choose any **Source Node** and **Destination Node**.
   - Click **Compute Independent Paths**.
   - Reveals the total number of distinct, non-overlapping backup routes between those two points.

---

## 4. Understanding the Resilience Formula & Letter Grades

Axial calculates an objective resilience score ($0 - 100$) using four weighted metrics:

$$\text{Resilience Score} = (R \times 45) + (C \times 35) + \left(\min\left(1.0, \frac{\text{Redundancy}}{1.5}\right) \times 20\right) - \text{Penalty}_{\text{SPOF}}$$

- **$R$ (Reachability Ratio, 45%)**: Percentage of nodes that retain an active connection to the gateway.
- **$C$ (Capacity Retention, 35%)**: Percentage of total network bandwidth (Gbps) still operational.
- **$\text{Redundancy Index}$ (20%)**: Ratio of active edges compared to a minimal spanning tree ($E / (V - 1)$).
- **$\text{Penalty}_{\text{SPOF}}$**: Subtraction penalty (up to $-30$ points) for each unmitigated Single Point of Failure.

### Grading Scale

| Grade | Score Range | System Interpretation | Recommended Action |
| :---: | :---: | :--- | :--- |
| **A+** | $90 - 100$ | **Ultra Resilient**: Multi-homed, dual ring redundancy, zero single points of failure. | Ideal architecture for mission-critical operations. |
| **A** | $80 - 89$ | **Highly Resilient**: Strong backup paths with minimal disruption under single node loss. | Minor link tuning optional. |
| **B** | $70 - 79$ | **Moderate Resilience**: Network survives most failures, but some non-critical nodes may isolate. | Add redundant cross-links between Tier-2 distribution switches. |
| **C** | $55 - 69$ | **Vulnerable Topology**: Key articulation points present. One hardware fault will isolate entire branches. | Eliminate single points of failure by adding mesh or ring links. |
| **D** | $40 - 54$ | **High Risk**: Low redundancy and multiple single points of failure. | Restructure tree topology into a dual-homed hierarchy. |
| **F** | $< 40$ | **Critical Failure State**: Severe fragmentation; majority of nodes isolated. | Urgent overhaul required. |

---

## 5. Pre-built Templates Guide

Axial includes three industry-standard starter topologies:

1. **University Campus Network (`campus`)**:
   - **Topology**: Gateway $\rightarrow$ Central Datacenter Core $\rightarrow$ CS Department, Engineering Labs, Library, and Dormitory hubs.
   - **Key Feature**: Includes a redundant cross-link between the CS and Engineering switches to demonstrate multi-path failover.

2. **National Critical Energy & Smart Grid (`smart_grid`)**:
   - **Topology**: Dual federal dispatch centers (Primary + Backup), inter-regional HVDC ties, nuclear safety vault, and microgrid distribution ring (16 nodes, 22 links).
   - **Attack Showcase**: Demonstrates multi-hub cascade blackouts, SCADA telemetry loss, and inter-substation ring failovers under regional attack.

3. **Global High-Frequency Trading & Banking Cloud (`global_fintech`)**:
   - **Topology**: Ultra-low-latency financial backbone connecting London, New York, and Tokyo exchanges via trans-oceanic subsea fiber and redundant SWIFT vaults (15 nodes, 23 links).
   - **Attack Showcase**: Shows Menger theorem multi-path rerouting across continents, subsea fiber cuts, and transaction volume capacity retention under targeted strikes.

4. **Corporate HQ Infrastructure (`corporate_hq`)**:
   - **Topology**: Dual ISP fiber entry points (AT&T + Verizon), high-availability database cluster, and ring floor distribution (Floor 1 $\leftrightarrow$ Floor 2 $\leftrightarrow$ Floor 3).
   - **Key Feature**: Ring topology prevents floor outages if a single switch fails.

5. **Metropolitan ISP Backbone (`city_backbone`)**:
   - **Topology**: City Internet Exchange (IXP) connecting North & South core routers in a dual ring to 5G towers, municipal power substations, and rail control centers.
   - **Key Feature**: High throughput (200 Gbps) and multi-region failover.

---

## 6. Quick Start & Troubleshooting

### Start Commands

```bash
# Terminal 1 - Start Backend Engine
cd backend
python run.py

# Terminal 2 - Start Frontend Interface
cd frontend
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### Common Questions & Troubleshooting

- **Why is the Engine status badge Amber (Local Fallback)?**
  - Make sure Python dependencies are installed (`pip install -r requirements.txt`) and `python run.py` is running on port 8000.
- **How do I fix a Single Point of Failure (SPOF)?**
  - Switch to **Builder Mode**, locate the node highlighted in the **Criticality Leaderboard**, and draw a second cable (edge) from that node's children to an alternate switch or core router.
- **How do I export my network for a presentation or report?**
  - Click the **Save JSON** button in the header bar. You can import this `.json` file anytime on any computer running Axial.
