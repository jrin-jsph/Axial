import { SavedProject, NetworkGraph, ResilienceResult } from './types';
import { STARTER_TEMPLATES } from './templates';

const STORAGE_KEY = 'axial_saved_networks_v1';

export const getSavedProjects = (): SavedProject[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load saved networks from localStorage:', err);
    return [];
  }
};

export const saveProjectList = (projects: SavedProject[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save networks to localStorage:', err);
  }
};

export const createNewProject = (
  name: string,
  graph: NetworkGraph,
  description?: string,
  resilience?: ResilienceResult | null,
  category?: string
): SavedProject => {
  const totalCapacity = graph.nodes.reduce((acc, n) => acc + (n.capacity || 0), 0);
  const newProject: SavedProject = {
    id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: name || 'Untitled Topology',
    description: description || `${graph.nodes.length} nodes network topology`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    graph,
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    totalCapacityGbps: totalCapacity,
    resilienceScore: resilience?.resilience_score,
    grade: resilience?.grade,
    category: category || 'Custom Design',
  };

  const existing = getSavedProjects();
  const updated = [newProject, ...existing];
  saveProjectList(updated);
  return newProject;
};

export const updateProject = (
  id: string,
  updates: Partial<SavedProject> & { graph?: NetworkGraph; resilience?: ResilienceResult | null }
): SavedProject[] => {
  const existing = getSavedProjects();
  const index = existing.findIndex(p => p.id === id);

  if (index === -1) {
    // If not found, create new
    if (updates.graph) {
      createNewProject(updates.name || 'Untitled Topology', updates.graph, updates.description, updates.resilience);
    }
    return getSavedProjects();
  }

  const current = existing[index];
  const graph = updates.graph || current.graph;
  const totalCapacity = graph.nodes.reduce((acc, n) => acc + (n.capacity || 0), 0);

  const updatedItem: SavedProject = {
    ...current,
    ...updates,
    graph,
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    totalCapacityGbps: totalCapacity,
    resilienceScore: updates.resilience ? updates.resilience.resilience_score : current.resilienceScore,
    grade: updates.resilience ? updates.resilience.grade : current.grade,
    updatedAt: new Date().toISOString(),
  };

  existing[index] = updatedItem;
  saveProjectList(existing);
  return existing;
};

export const deleteProject = (id: string): SavedProject[] => {
  const existing = getSavedProjects();
  const filtered = existing.filter(p => p.id !== id);
  saveProjectList(filtered);
  return filtered;
};

export const seedSampleProjectsIfEmpty = (): SavedProject[] => {
  const existing = getSavedProjects();
  if (existing.length > 0) return existing;

  // Seed with starter templates as initial accessible workspaces
  const sample1 = STARTER_TEMPLATES[0]; // Campus Network
  const sample2 = STARTER_TEMPLATES[1]; // Smart Grid

  const seeded: SavedProject[] = [
    {
      id: `proj-${sample1.id}`,
      name: sample1.name,
      description: sample1.description,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      graph: sample1.graph,
      nodeCount: sample1.graph.nodes.length,
      edgeCount: sample1.graph.edges.length,
      totalCapacityGbps: sample1.graph.nodes.reduce((acc, n) => acc + (n.capacity || 0), 0),
      resilienceScore: 78,
      grade: 'B',
      category: sample1.category,
    },
    {
      id: `proj-${sample2.id}`,
      name: sample2.name,
      description: sample2.description,
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      graph: sample2.graph,
      nodeCount: sample2.graph.nodes.length,
      edgeCount: sample2.graph.edges.length,
      totalCapacityGbps: sample2.graph.nodes.reduce((acc, n) => acc + (n.capacity || 0), 0),
      resilienceScore: 94,
      grade: 'A+',
      category: sample2.category,
    }
  ];

  saveProjectList(seeded);
  return seeded;
};
