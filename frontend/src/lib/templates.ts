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
        { id: 'gw-1', name: 'Campus ISP Gateway', type: 'gateway', tier: 1, capacity: 100, status: 'active', x: 450, y: 50 },
        { id: 'core-1', name: 'Central Datacenter Core', type: 'core_router', tier: 1, capacity: 80, status: 'active', x: 450, y: 180 },
        { id: 'sw-cs', name: 'CS Dept Main Switch', type: 'switch', tier: 2, capacity: 40, status: 'active', x: 180, y: 320 },
        { id: 'sw-eng', name: 'Engineering Hall Switch', type: 'switch', tier: 2, capacity: 40, status: 'active', x: 450, y: 320 },
        { id: 'sw-lib', name: 'Campus Library Switch', type: 'switch', tier: 2, capacity: 20, status: 'active', x: 720, y: 320 },
        { id: 'ap-dorm', name: 'Dormitory Fiber Hub', type: 'regional_hub', tier: 2, capacity: 30, status: 'active', x: 920, y: 320 },
        { id: 'lab-cs1', name: 'AI Supercomputing Cluster', type: 'workstation', tier: 3, capacity: 20, status: 'active', x: 80, y: 480 },
        { id: 'lab-cs2', name: 'Cybersecurity Lab', type: 'workstation', tier: 3, capacity: 10, status: 'active', x: 280, y: 480 },
        { id: 'lab-eng', name: 'Robotics Prototyping Bay', type: 'workstation', tier: 3, capacity: 15, status: 'active', x: 450, y: 480 },
        { id: 'ap-lib', name: 'Library Public WiFi AP', type: 'access_point', tier: 3, capacity: 10, status: 'active', x: 670, y: 480 },
        { id: 'iot-dorm', name: 'Dorm HVAC Smart Sensors', type: 'iot_device', tier: 3, capacity: 5, status: 'active', x: 920, y: 480 },
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
    id: 'corporate_hq',
    name: 'Corporate HQ Infrastructure',
    category: 'Commercial Data Center',
    description: 'Dual multi-homed ISP fiber entry points, high-availability database cluster, and ring floor distribution for enterprise operations.',
    graph: {
      root_id: 'gw-isp1',
      nodes: [
        { id: 'gw-isp1', name: 'Primary Fiber Gateway (AT&T)', type: 'gateway', tier: 1, capacity: 50, status: 'active', x: 320, y: 60 },
        { id: 'gw-isp2', name: 'Backup Gateway (Verizon)', type: 'gateway', tier: 1, capacity: 50, status: 'active', x: 620, y: 60 },
        { id: 'core-hq', name: 'HQ Server Room Core', type: 'core_router', tier: 1, capacity: 80, status: 'active', x: 470, y: 190 },
        { id: 'db-cluster', name: 'Primary DB & Auth Cluster', type: 'datacenter', tier: 1, capacity: 60, status: 'active', x: 180, y: 220 },
        { id: 'sw-fl1', name: 'Floor 1 Finance Switch', type: 'switch', tier: 2, capacity: 25, status: 'active', x: 220, y: 350 },
        { id: 'sw-fl2', name: 'Floor 2 Executive Switch', type: 'switch', tier: 2, capacity: 25, status: 'active', x: 470, y: 350 },
        { id: 'sw-fl3', name: 'Floor 3 Dev & Ops Switch', type: 'switch', tier: 2, capacity: 30, status: 'active', x: 720, y: 350 },
        { id: 'work-fin', name: 'Trading & Payroll Terminals', type: 'workstation', tier: 3, capacity: 15, status: 'active', x: 180, y: 490 },
        { id: 'ap-exec', name: 'Executive Suite WiFi 6E', type: 'access_point', tier: 3, capacity: 10, status: 'active', x: 470, y: 490 },
        { id: 'work-dev', name: 'Engineering Workstations', type: 'workstation', tier: 3, capacity: 20, status: 'active', x: 720, y: 490 },
        { id: 'iot-bms', name: 'Smart BMS Security Gateway', type: 'iot_device', tier: 3, capacity: 5, status: 'active', x: 910, y: 350 },
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
        { id: 'ixp-main', name: 'Metropolitan Internet Exchange', type: 'gateway', tier: 1, capacity: 200, status: 'active', x: 480, y: 50 },
        { id: 'r-north', name: 'North Metro Core Router', type: 'core_router', tier: 1, capacity: 90, status: 'active', x: 260, y: 170 },
        { id: 'r-south', name: 'South Metro Core Router', type: 'core_router', tier: 1, capacity: 90, status: 'active', x: 700, y: 170 },
        { id: 'hub-downtown', name: 'Downtown Distribution Hub', type: 'regional_hub', tier: 2, capacity: 50, status: 'active', x: 180, y: 310 },
        { id: 'hub-techpark', name: 'Tech Park Regional Hub', type: 'regional_hub', tier: 2, capacity: 60, status: 'active', x: 480, y: 310 },
        { id: 'hub-harbor', name: 'Harbor District Hub', type: 'regional_hub', tier: 2, capacity: 40, status: 'active', x: 780, y: 310 },
        { id: 'cell-5g1', name: 'Downtown 5G Tower Alpha', type: 'access_point', tier: 3, capacity: 20, status: 'active', x: 100, y: 460 },
        { id: 'substation', name: 'Grid Substation Controller', type: 'iot_device', tier: 3, capacity: 10, status: 'active', x: 260, y: 460 },
        { id: 'datacenter-tp', name: 'Tech Park Cloud Datacenter', type: 'datacenter', tier: 2, capacity: 50, status: 'active', x: 480, y: 460 },
        { id: 'cell-5g2', name: 'Harbor 5G Cell Tower', type: 'access_point', tier: 3, capacity: 20, status: 'active', x: 700, y: 460 },
        { id: 'transit-hub', name: 'Metro Rail Control System', type: 'workstation', tier: 3, capacity: 15, status: 'active', x: 880, y: 460 },
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
