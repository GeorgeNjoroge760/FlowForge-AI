import type { WorkflowNodeData, WorkflowEdgeData } from '../types/workflow';

export interface DagNode {
  id: string;
  category: string;
  config: Record<string, unknown>;
  dependencies: string[];
}

export interface DagResult {
  executionOrder: string[][];
  hasCycle: boolean;
}

/**
 * Topological sort of workflow nodes using Kahn's algorithm.
 * Returns execution tiers - nodes in the same tier can run in parallel.
 */
export function topologicalSort(
  nodes: WorkflowNodeData[],
  edges: WorkflowEdgeData[],
): DagResult {
  const adjacencyList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  const nodeMap = new Map<string, WorkflowNodeData>();

  for (const node of nodes) {
    adjacencyList.set(node.id, []);
    inDegree.set(node.id, 0);
    nodeMap.set(node.id, node);
  }

  for (const edge of edges) {
    adjacencyList.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  }

  const tiers: string[][] = [];
  const queue: string[] = [];

  // Start with nodes that have no dependencies (triggers)
  for (const [nodeId, degree] of inDegree) {
    if (degree === 0) {
      queue.push(nodeId);
    }
  }

  let processed = 0;

  while (queue.length > 0) {
    const currentTier = [...queue];
    tiers.push(currentTier);
    queue.length = 0;

    for (const nodeId of currentTier) {
      processed++;
      const neighbors = adjacencyList.get(nodeId) || [];

      for (const neighbor of neighbors) {
        const newDegree = (inDegree.get(neighbor) || 1) - 1;
        inDegree.set(neighbor, newDegree);

        if (newDegree === 0) {
          queue.push(neighbor);
        }
      }
    }
  }

  return {
    executionOrder: tiers,
    hasCycle: processed !== nodes.length,
  };
}

/**
 * Get all downstream nodes from a given node.
 */
export function getDownstreamNodes(
  nodeId: string,
  edges: WorkflowEdgeData[],
): string[] {
  const downstream = new Set<string>();
  const queue = [nodeId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const targets = edges
      .filter((e) => e.source === current)
      .map((e) => e.target);

    for (const target of targets) {
      if (!downstream.has(target)) {
        downstream.add(target);
        queue.push(target);
      }
    }
  }

  return Array.from(downstream);
}

/**
 * Get all upstream nodes from a given node.
 */
export function getUpstreamNodes(
  nodeId: string,
  edges: WorkflowEdgeData[],
): string[] {
  const upstream = new Set<string>();
  const queue = [nodeId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const sources = edges
      .filter((e) => e.target === current)
      .map((e) => e.source);

    for (const source of sources) {
      if (!upstream.has(source)) {
        upstream.add(source);
        queue.push(source);
      }
    }
  }

  return Array.from(upstream);
}

/**
 * Validate that a workflow definition has no cycles and all edges reference valid nodes.
 */
export function validateWorkflowGraph(
  nodes: WorkflowNodeData[],
  edges: WorkflowEdgeData[],
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const nodeIds = new Set(nodes.map((n) => n.id));

  // Check edge references
  for (const edge of edges) {
    if (!nodeIds.has(edge.source)) {
      errors.push(`Edge references non-existent source node: ${edge.source}`);
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`Edge references non-existent target node: ${edge.target}`);
    }
    if (edge.source === edge.target) {
      errors.push(`Self-loop detected on node: ${edge.source}`);
    }
  }

  // Check for cycles
  const result = topologicalSort(nodes, edges);
  if (result.hasCycle) {
    errors.push('Workflow contains a cycle');
  }

  // Check triggers exist
  const triggers = nodes.filter((n) => n.type === 'TRIGGER');
  if (triggers.length === 0) {
    errors.push('Workflow must have at least one trigger node');
  }

  return { valid: errors.length === 0, errors };
}
