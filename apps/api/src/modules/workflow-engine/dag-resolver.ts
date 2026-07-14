import { Injectable, Logger } from '@nestjs/common';

export interface DagNode {
  id: string;
  category: string;
  config: Record<string, unknown>;
  type: string;
  label: string;
}

export interface DagEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  condition?: Record<string, unknown>;
}

export interface DagResult {
  executionOrder: string[][];
  hasCycle: boolean;
}

@Injectable()
export class DagResolver {
  private readonly logger = new Logger(DagResolver.name);

  /**
   * Resolve the execution order of workflow nodes using topological sort.
   * Returns tiers of nodes that can execute in parallel.
   */
  resolve(nodes: DagNode[], edges: DagEdge[]): DagResult {
    const adjacencyList = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    const nodeMap = new Map<string, DagNode>();

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
   * Get downstream nodes from a given node.
   */
  getDownstreamNodes(nodeId: string, edges: DagEdge[]): string[] {
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
   * Evaluate a condition against data.
   */
  evaluateCondition(
    condition: Record<string, unknown>,
    data: Record<string, unknown>,
  ): boolean {
    const { field, operator, value } = condition as {
      field: string;
      operator: string;
      value: unknown;
    };

    const fieldValue = this.getNestedValue(data, field);

    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'not_equals':
        return fieldValue !== value;
      case 'contains':
        return String(fieldValue).includes(String(value));
      case 'gt':
        return Number(fieldValue) > Number(value);
      case 'lt':
        return Number(fieldValue) < Number(value);
      case 'gte':
        return Number(fieldValue) >= Number(value);
      case 'lte':
        return Number(fieldValue) <= Number(value);
      case 'is_empty':
        return !fieldValue || fieldValue === '';
      case 'is_not_empty':
        return !!fieldValue && fieldValue !== '';
      default:
        return true;
    }
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current: any, key: string) => {
      return current?.[key];
    }, obj);
  }
}
