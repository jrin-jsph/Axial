import { NetworkGraph } from './types';

export interface StarterTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  graph: NetworkGraph;
}

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: 'campus',
    name: 'University Campus Network',
    category: 'Higher Education / Enterprise',
    description: 'Tier-1 Gateway connected to central data center core, fanning out to CS department, engineering labs, campus library, and dormitory wireless hubs.',
    graph: {
      root_id: 'gw-1',
      nodes: [
        { id: 'gw-1', name: 'Campus ISP Gateway', type: 'gateway', tier: 1, capacity: 100, status: 'active', x: 500, y: 30 },
        { id: 'core-1', name: 'Central Datacenter Core', type: 'core_router', tier: 1, capacity: 80, status: 'active', x: 500, y: 160 },
        { id: 'sw-cs', name: 'CS Dept Main Switch', type: 'switch', tier: 2, capacity: 40, status: 'active', x: 120, y: 300 },
        { id: 'sw-eng', name: 'Engineering Hall Switch', type: 'switch', tier: 2, capacity: 40, status: 'active', x: 420, y: 300 },
        { id: 'sw-lib', name: 'Campus Library Switch', type: 'switch', tier: 2, capacity: 20, status: 'active', x: 720, y: 300 },
        { id: 'ap-dorm', name: 'Dormitory Fiber Hub', type: 'regional_hub', tier: 2, capacity: 30, status: 'active', x: 1020, y: 300 },
        { id: 'lab-cs1', name: 'AI Supercomputing Cluster', type: 'workstation', tier: 3, capacity: 20, status: 'active', x: 40, y: 460 },
        { id: 'lab-cs2', name: 'Cybersecurity Lab', type: 'workstation', tier: 3, capacity: 10, status: 'active', x: 230, y: 460 },
        { id: 'lab-eng', name: 'Robotics Prototyping Bay', type: 'workstation', tier: 3, capacity: 15, status: 'active', x: 420, y: 460 },
        { id: 'ap-lib', name: 'Library Public WiFi AP', type: 'access_point', tier: 3, capacity: 10, status: 'active', x: 720, y: 460 },
        { id: 'iot-dorm', name: 'Dorm HVAC Smart Sensors', type: 'iot_device', tier: 3, capacity: 5, status: 'active', x: 1020, y: 460 },
      ],
      edges: [
        { id: 'e1', source: 'gw-1', target: 'core-1', capacity: 100, latency: 2, status: 'active' },
        { id: 'e2', source: 'core-1', target: 'sw-cs', capacity: 40, latency: 4, status: 'active' },
        { id: 'e3', source: 'core-1', target: 'sw-eng', capacity: 40, latency: 3, status: 'active' },
        { id: 'e4', source: 'core-1', target: 'sw-lib', capacity: 20, latency: 5, status: 'active' },
        { id: 'e5', source: 'core-1', target: 'ap-dorm', capacity: 30, latency: 6, status: 'active' },
        { id: 'e6', source: 'sw-cs', target: 'sw-eng', capacity: 20, latency: 2, status: 'active' }, // redundant cross-link
        { id: 'e7', source: 'sw-cs', target: 'lab-cs1', capacity: 20, latency: 1, status: 'active' },
        { id: 'e8', source: 'sw-cs', target: 'lab-cs2', capacity: 10, latency: 1, status: 'active' },
        { id: 'e9', source: 'sw-eng', target: 'lab-eng', capacity: 15, latency: 2, status: 'active' },
        { id: 'e10', source: 'sw-lib', target: 'ap-lib', capacity: 10, latency: 3, status: 'active' },
        { id: 'e11', source: 'ap-dorm', target: 'iot-dorm', capacity: 5, latency: 4, status: 'active' },
      ]
    }
  },
  {
    id: 'smart_grid',
    name: 'National Critical Energy & Smart Grid',
    category: 'Critical Infrastructure & SCADA',
    description: 'High-resilience dual-control power transmission grid featuring primary & secondary federal dispatch centers, inter-regional HVDC ties, nuclear safety vaults, and regional microgrids with ring failover.',
    graph: {
      root_id: 'grid-hq1',
      nodes: [
        { id: 'grid-hq1', name: 'Primary National Dispatch Center', type: 'gateway', tier: 1, capacity: 120, status: 'active', x: 340, y: 30 },
        { id: 'grid-hq2', name: 'Secondary Backup Control Center', type: 'gateway', tier: 1, capacity: 120, status: 'active', x: 800, y: 30 },
        { id: 'hvdc-east', name: 'East Coast HVDC Interconnect Core', type: 'core_router', tier: 1, capacity: 100, status: 'active', x: 180, y: 160 },
        { id: 'nuke-scada', name: 'Nuclear Telemetry & Safety Vault', type: 'datacenter', tier: 1, capacity: 80, status: 'active', x: 570, y: 160 },
        { id: 'hvdc-west', name: 'West Coast HVDC Interconnect Core', type: 'core_router', tier: 1, capacity: 100, status: 'active', x: 960, y: 160 },
        { id: 'sub-metro-e', name: 'Metro East Distribution Substation', type: 'switch', tier: 2, capacity: 50, status: 'active', x: 50, y: 300 },
        { id: 'sub-ind-e', name: 'Industrial Corridor Stepdown Hub', type: 'switch', tier: 2, capacity: 50, status: 'active', x: 310, y: 300 },
        { id: 'sub-renew-c', name: 'Central Wind & Solar Aggregator', type: 'regional_hub', tier: 2, capacity: 60, status: 'active', x: 570, y: 300 },
        { id: 'sub-metro-w', name: 'Metro West Distribution Substation', type: 'switch', tier: 2, capacity: 50, status: 'active', x: 830, y: 300 },
        { id: 'sub-hydro-w', name: 'Hydroelectric Generation Hub', type: 'regional_hub', tier: 2, capacity: 60, status: 'active', x: 1090, y: 300 },
        { id: 'grid-sensor-1', name: 'Metro East Smart Grid Phasors', type: 'iot_device', tier: 3, capacity: 10, status: 'active', x: 50, y: 460 },
        { id: 'plant-ctrl-1', name: 'Portside Generation Terminal', type: 'workstation', tier: 3, capacity: 15, status: 'active', x: 180, y: 550 },
        { id: 'plant-ctrl-2', name: 'Refinery Feeder Protection Bay', type: 'workstation', tier: 3, capacity: 15, status: 'active', x: 310, y: 460 },
        { id: 'solar-telemetry', name: 'Solar Array Tracking Sensors', type: 'iot_device', tier: 3, capacity: 10, status: 'active', x: 570, y: 460 },
        { id: 'metro-w-ap', name: 'Substation Field Tech WiFi', type: 'access_point', tier: 3, capacity: 15, status: 'active', x: 830, y: 460 },
        { id: 'dam-scada', name: 'Reservoir Dam Pressure SCADA', type: 'iot_device', tier: 3, capacity: 10, status: 'active', x: 1090, y: 460 },
      ],
      edges: [
        // Dual Gateway Backbone to Core
        { id: 'ge1', source: 'grid-hq1', target: 'hvdc-east', capacity: 100, latency: 2, status: 'active' },
        { id: 'ge2', source: 'grid-hq1', target: 'nuke-scada', capacity: 80, latency: 1, status: 'active' },
        { id: 'ge3', source: 'grid-hq2', target: 'nuke-scada', capacity: 80, latency: 1, status: 'active' },
        { id: 'ge4', source: 'grid-hq2', target: 'hvdc-west', capacity: 100, latency: 2, status: 'active' },
        { id: 'ge5', source: 'hvdc-east', target: 'hvdc-west', capacity: 90, latency: 3, status: 'active' }, // Trans-continental Core Tie
        { id: 'ge6', source: 'hvdc-east', target: 'nuke-scada', capacity: 60, latency: 2, status: 'active' },
        { id: 'ge7', source: 'hvdc-west', target: 'nuke-scada', capacity: 60, latency: 2, status: 'active' },
        // Tier 1 to Tier 2 Distribution
        { id: 'ge8', source: 'hvdc-east', target: 'sub-metro-e', capacity: 50, latency: 2, status: 'active' },
        { id: 'ge9', source: 'hvdc-east', target: 'sub-ind-e', capacity: 50, latency: 3, status: 'active' },
        { id: 'ge10', source: 'nuke-scada', target: 'sub-renew-c', capacity: 60, latency: 2, status: 'active' },
        { id: 'ge11', source: 'hvdc-west', target: 'sub-metro-w', capacity: 50, latency: 2, status: 'active' },
        { id: 'ge12', source: 'hvdc-west', target: 'sub-hydro-w', capacity: 60, latency: 3, status: 'active' },
        // Regional Inter-Substation Ring Links
        { id: 'ge13', source: 'sub-metro-e', target: 'sub-ind-e', capacity: 30, latency: 2, status: 'active' },
        { id: 'ge14', source: 'sub-ind-e', target: 'sub-renew-c', capacity: 40, latency: 3, status: 'active' },
        { id: 'ge15', source: 'sub-renew-c', target: 'sub-metro-w', capacity: 40, latency: 3, status: 'active' },
        { id: 'ge16', source: 'sub-metro-w', target: 'sub-hydro-w', capacity: 35, latency: 2, status: 'active' },
        // Tier 2 to Tier 3 Edge & Telemetry
        { id: 'ge17', source: 'sub-metro-e', target: 'grid-sensor-1', capacity: 10, latency: 1, status: 'active' },
        { id: 'ge18', source: 'sub-metro-e', target: 'plant-ctrl-1', capacity: 15, latency: 1, status: 'active' },
        { id: 'ge19', source: 'sub-ind-e', target: 'plant-ctrl-2', capacity: 15, latency: 2, status: 'active' },
        { id: 'ge20', source: 'sub-renew-c', target: 'solar-telemetry', capacity: 10, latency: 2, status: 'active' },
        { id: 'ge21', source: 'sub-metro-w', target: 'metro-w-ap', capacity: 15, latency: 1, status: 'active' },
        { id: 'ge22', source: 'sub-hydro-w', target: 'dam-scada', capacity: 10, latency: 3, status: 'active' },
      ]
    }
  },
  {
    id: 'global_fintech',
    name: 'Global High-Frequency Trading & Banking Cloud',
    category: 'Fintech & Cloud Banking',
    description: 'Ultra-low-latency financial backbone connecting New York, London, and Tokyo colocation exchanges with subsea trans-oceanic fiber, redundant SWIFT settlement vaults, and FPGA order execution nodes.',
    graph: {
      root_id: 'nyse-colo',
      nodes: [
        { id: 'lse-colo', name: 'London Transit & LSE Gateway', type: 'gateway', tier: 1, capacity: 200, status: 'active', x: 140, y: 30 },
        { id: 'nyse-colo', name: 'New York Direct Exchange Gateway', type: 'gateway', tier: 1, capacity: 250, status: 'active', x: 570, y: 30 },
        { id: 'tse-colo', name: 'Tokyo Financial Gateway (JPX)', type: 'gateway', tier: 1, capacity: 200, status: 'active', x: 1000, y: 30 },
        { id: 'trans-atlantic', name: 'Trans-Atlantic Subsea Fiber Core', type: 'core_router', tier: 1, capacity: 150, status: 'active', x: 280, y: 160 },
        { id: 'clearing-dc', name: 'Fedwire & SWIFT Settlement Vault', type: 'datacenter', tier: 1, capacity: 120, status: 'active', x: 570, y: 160 },
        { id: 'trans-pacific', name: 'Trans-Pacific Subsea Fiber Core', type: 'core_router', tier: 1, capacity: 150, status: 'active', x: 860, y: 160 },
        { id: 'hft-engine-lon', name: 'London Liquidity Pool Switch', type: 'switch', tier: 2, capacity: 60, status: 'active', x: 140, y: 300 },
        { id: 'hft-engine-ny', name: 'NY HFT Order-Matching Engine', type: 'switch', tier: 2, capacity: 80, status: 'active', x: 430, y: 300 },
        { id: 'risk-cluster', name: 'Real-Time Fraud & Margin Engine', type: 'regional_hub', tier: 2, capacity: 70, status: 'active', x: 720, y: 300 },
        { id: 'hft-engine-tky', name: 'Tokyo Arbitrage Execution Hub', type: 'switch', tier: 2, capacity: 60, status: 'active', x: 1000, y: 300 },
        { id: 'terminal-trading1', name: 'Mayfair Hedge Fund Terminals', type: 'workstation', tier: 3, capacity: 20, status: 'active', x: 140, y: 460 },
        { id: 'terminal-trading2', name: 'Wall St Market Making Desks', type: 'workstation', tier: 3, capacity: 30, status: 'active', x: 350, y: 460 },
        { id: 'algo-colo-node', name: 'FPGA Microwave Execution Bay', type: 'workstation', tier: 3, capacity: 35, status: 'active', x: 570, y: 460 },
        { id: 'risk-telemetry', name: 'Hardware Security Module (HSM)', type: 'iot_device', tier: 3, capacity: 10, status: 'active', x: 780, y: 460 },
        { id: 'terminal-trading3', name: 'Nihonbashi FX Trading Desks', type: 'workstation', tier: 3, capacity: 20, status: 'active', x: 1000, y: 460 },
      ],
      edges: [
        // Multi-Exchange Interconnect Backbone
        { id: 'fe1', source: 'nyse-colo', target: 'trans-atlantic', capacity: 150, latency: 1, status: 'active' },
        { id: 'fe2', source: 'nyse-colo', target: 'clearing-dc', capacity: 120, latency: 1, status: 'active' },
        { id: 'fe3', source: 'nyse-colo', target: 'trans-pacific', capacity: 150, latency: 1, status: 'active' },
        { id: 'fe4', source: 'lse-colo', target: 'trans-atlantic', capacity: 120, latency: 2, status: 'active' },
        { id: 'fe5', source: 'tse-colo', target: 'trans-pacific', capacity: 120, latency: 2, status: 'active' },
        { id: 'fe6', source: 'trans-atlantic', target: 'clearing-dc', capacity: 100, latency: 3, status: 'active' },
        { id: 'fe7', source: 'trans-pacific', target: 'clearing-dc', capacity: 100, latency: 3, status: 'active' },
        { id: 'fe8', source: 'trans-atlantic', target: 'trans-pacific', capacity: 80, latency: 4, status: 'active' }, // Continental bypass
        // Core to Regional HFT / Risk Engines
        { id: 'fe9', source: 'trans-atlantic', target: 'hft-engine-lon', capacity: 60, latency: 1, status: 'active' },
        { id: 'fe10', source: 'trans-atlantic', target: 'hft-engine-ny', capacity: 80, latency: 1, status: 'active' },
        { id: 'fe11', source: 'clearing-dc', target: 'hft-engine-ny', capacity: 70, latency: 1, status: 'active' },
        { id: 'fe12', source: 'clearing-dc', target: 'risk-cluster', capacity: 70, latency: 1, status: 'active' },
        { id: 'fe13', source: 'trans-pacific', target: 'risk-cluster', capacity: 60, latency: 2, status: 'active' },
        { id: 'fe14', source: 'trans-pacific', target: 'hft-engine-tky', capacity: 60, latency: 1, status: 'active' },
        // Inter-Engine Resilience Cross-Links
        { id: 'fe15', source: 'hft-engine-lon', target: 'hft-engine-ny', capacity: 40, latency: 2, status: 'active' },
        { id: 'fe16', source: 'hft-engine-ny', target: 'risk-cluster', capacity: 50, latency: 1, status: 'active' },
        { id: 'fe17', source: 'risk-cluster', target: 'hft-engine-tky', capacity: 40, latency: 2, status: 'active' },
        // Edge Trading Desks & Execution
        { id: 'fe18', source: 'hft-engine-lon', target: 'terminal-trading1', capacity: 20, latency: 1, status: 'active' },
        { id: 'fe19', source: 'hft-engine-ny', target: 'terminal-trading2', capacity: 30, latency: 1, status: 'active' },
        { id: 'fe20', source: 'hft-engine-ny', target: 'algo-colo-node', capacity: 35, latency: 1, status: 'active' },
        { id: 'fe21', source: 'risk-cluster', target: 'algo-colo-node', capacity: 30, latency: 1, status: 'active' },
        { id: 'fe22', source: 'risk-cluster', target: 'risk-telemetry', capacity: 10, latency: 1, status: 'active' },
        { id: 'fe23', source: 'hft-engine-tky', target: 'terminal-trading3', capacity: 20, latency: 1, status: 'active' },
      ]
    }
  },
  {
    id: 'corporate_hq',
    name: 'Corporate HQ Infrastructure',
    category: 'Commercial Data Center',
    description: 'Dual multi-homed ISP fiber entry points, high-availability database cluster, and ring floor distribution for enterprise operations.',
    graph: {
      root_id: 'gw-isp1',
      nodes: [
        { id: 'gw-isp1', name: 'Primary Fiber Gateway (AT&T)', type: 'gateway', tier: 1, capacity: 50, status: 'active', x: 340, y: 30 },
        { id: 'gw-isp2', name: 'Backup Gateway (Verizon)', type: 'gateway', tier: 1, capacity: 50, status: 'active', x: 740, y: 30 },
        { id: 'db-cluster', name: 'Primary DB & Auth Cluster', type: 'datacenter', tier: 1, capacity: 60, status: 'active', x: 240, y: 160 },
        { id: 'core-hq', name: 'HQ Server Room Core', type: 'core_router', tier: 1, capacity: 80, status: 'active', x: 540, y: 160 },
        { id: 'sw-fl1', name: 'Floor 1 Finance Switch', type: 'switch', tier: 2, capacity: 25, status: 'active', x: 180, y: 300 },
        { id: 'sw-fl2', name: 'Floor 2 Executive Switch', type: 'switch', tier: 2, capacity: 25, status: 'active', x: 540, y: 300 },
        { id: 'sw-fl3', name: 'Floor 3 Dev & Ops Switch', type: 'switch', tier: 2, capacity: 30, status: 'active', x: 880, y: 300 },
        { id: 'iot-bms', name: 'Smart BMS Security Gateway', type: 'iot_device', tier: 3, capacity: 5, status: 'active', x: 1100, y: 300 },
        { id: 'work-fin', name: 'Trading & Payroll Terminals', type: 'workstation', tier: 3, capacity: 15, status: 'active', x: 180, y: 460 },
        { id: 'ap-exec', name: 'Executive Suite WiFi 6E', type: 'access_point', tier: 3, capacity: 10, status: 'active', x: 540, y: 460 },
        { id: 'work-dev', name: 'Engineering Workstations', type: 'workstation', tier: 3, capacity: 20, status: 'active', x: 880, y: 460 },
      ],
      edges: [
        { id: 'e1', source: 'gw-isp1', target: 'core-hq', capacity: 50, latency: 2, status: 'active' },
        { id: 'e2', source: 'gw-isp2', target: 'core-hq', capacity: 50, latency: 2, status: 'active' },
        { id: 'e3', source: 'core-hq', target: 'db-cluster', capacity: 60, latency: 1, status: 'active' },
        { id: 'e4', source: 'core-hq', target: 'sw-fl1', capacity: 25, latency: 3, status: 'active' },
        { id: 'e5', source: 'core-hq', target: 'sw-fl2', capacity: 25, latency: 2, status: 'active' },
        { id: 'e6', source: 'core-hq', target: 'sw-fl3', capacity: 30, latency: 2, status: 'active' },
        { id: 'e7', source: 'sw-fl1', target: 'sw-fl2', capacity: 15, latency: 2, status: 'active' }, // Floor ring
        { id: 'e8', source: 'sw-fl2', target: 'sw-fl3', capacity: 15, latency: 2, status: 'active' }, // Floor ring
        { id: 'e9', source: 'sw-fl1', target: 'work-fin', capacity: 15, latency: 1, status: 'active' },
        { id: 'e10', source: 'sw-fl2', target: 'ap-exec', capacity: 10, latency: 2, status: 'active' },
        { id: 'e11', source: 'sw-fl3', target: 'work-dev', capacity: 20, latency: 1, status: 'active' },
        { id: 'e12', source: 'sw-fl3', target: 'iot-bms', capacity: 5, latency: 4, status: 'active' },
      ]
    }
  },
  {
    id: 'city_backbone',
    name: 'Metropolitan ISP Backbone',
    category: 'Smart City & Telecom',
    description: 'City Internet Exchange connecting regional ring routers, municipal power substations, public transit nodes, and 5G cell towers.',
    graph: {
      root_id: 'ixp-main',
      nodes: [
        { id: 'ixp-main', name: 'Metropolitan Internet Exchange', type: 'gateway', tier: 1, capacity: 200, status: 'active', x: 550, y: 30 },
        { id: 'r-north', name: 'North Metro Core Router', type: 'core_router', tier: 1, capacity: 90, status: 'active', x: 260, y: 160 },
        { id: 'r-south', name: 'South Metro Core Router', type: 'core_router', tier: 1, capacity: 90, status: 'active', x: 840, y: 160 },
        { id: 'hub-downtown', name: 'Downtown Distribution Hub', type: 'regional_hub', tier: 2, capacity: 50, status: 'active', x: 160, y: 300 },
        { id: 'hub-techpark', name: 'Tech Park Regional Hub', type: 'regional_hub', tier: 2, capacity: 60, status: 'active', x: 550, y: 300 },
        { id: 'hub-harbor', name: 'Harbor District Hub', type: 'regional_hub', tier: 2, capacity: 40, status: 'active', x: 940, y: 300 },
        { id: 'cell-5g1', name: 'Downtown 5G Tower Alpha', type: 'access_point', tier: 3, capacity: 20, status: 'active', x: 60, y: 460 },
        { id: 'substation', name: 'Grid Substation Controller', type: 'iot_device', tier: 3, capacity: 10, status: 'active', x: 260, y: 460 },
        { id: 'datacenter-tp', name: 'Tech Park Cloud Datacenter', type: 'datacenter', tier: 2, capacity: 50, status: 'active', x: 550, y: 460 },
        { id: 'cell-5g2', name: 'Harbor 5G Cell Tower', type: 'access_point', tier: 3, capacity: 20, status: 'active', x: 840, y: 460 },
        { id: 'transit-hub', name: 'Metro Rail Control System', type: 'workstation', tier: 3, capacity: 15, status: 'active', x: 1040, y: 460 },
      ],
      edges: [
        { id: 'e1', source: 'ixp-main', target: 'r-north', capacity: 90, latency: 1, status: 'active' },
        { id: 'e2', source: 'ixp-main', target: 'r-south', capacity: 90, latency: 1, status: 'active' },
        { id: 'e3', source: 'r-north', target: 'r-south', capacity: 60, latency: 2, status: 'active' }, // Ring backbone link
        { id: 'e4', source: 'r-north', target: 'hub-downtown', capacity: 50, latency: 3, status: 'active' },
        { id: 'e5', source: 'r-north', target: 'hub-techpark', capacity: 60, latency: 2, status: 'active' },
        { id: 'e6', source: 'r-south', target: 'hub-techpark', capacity: 60, latency: 2, status: 'active' },
        { id: 'e7', source: 'r-south', target: 'hub-harbor', capacity: 40, latency: 3, status: 'active' },
        { id: 'e8', source: 'hub-downtown', target: 'cell-5g1', capacity: 20, latency: 2, status: 'active' },
        { id: 'e9', source: 'hub-downtown', target: 'substation', capacity: 10, latency: 2, status: 'active' },
        { id: 'e10', source: 'hub-techpark', target: 'datacenter-tp', capacity: 50, latency: 1, status: 'active' },
        { id: 'e11', source: 'hub-harbor', target: 'cell-5g2', capacity: 20, latency: 3, status: 'active' },
        { id: 'e12', source: 'hub-harbor', target: 'transit-hub', capacity: 15, latency: 2, status: 'active' },
      ]
    }
  }
];
