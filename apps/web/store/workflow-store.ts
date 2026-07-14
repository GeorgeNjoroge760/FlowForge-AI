import { create } from 'zustand';
import type { Node, Edge, OnNodesChange, OnEdgesChange, Connection } from '@xyflow/react';

export interface WorkflowNodeData extends Record<string, unknown> {
  type: string;
  category: string;
  label: string;
  config: Record<string, unknown>;
}

interface WorkflowState {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;

  // Actions
  setNodes: (nodes: Node<WorkflowNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node<WorkflowNodeData>) => void;
  removeNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
  selectNode: (nodeId: string | null) => void;
  duplicateNode: (nodeId: string) => void;
  clearCanvas: () => void;
  loadWorkflow: (nodes: Node<WorkflowNodeData>[], edges: Edge[]) => void;
  markDirty: () => void;
  markSaved: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,

  setNodes: (nodes) => set({ nodes, isDirty: true }),
  setEdges: (edges) => set({ edges, isDirty: true }),

  onNodesChange: (changes) => {
    const { nodes } = get();
    const updated = applyNodeChanges(changes, nodes);
    set({ nodes: updated, isDirty: true });
  },

  onEdgesChange: (changes) => {
    const { edges } = get();
    const updated = applyEdgeChanges(changes, edges);
    set({ edges: updated, isDirty: true });
  },

  onConnect: (connection) => {
    const { edges } = get();
    const newEdge: Edge = {
      id: `edge-${Date.now()}`,
      source: connection.source || '',
      target: connection.target || '',
      sourceHandle: connection.sourceHandle || undefined,
      targetHandle: connection.targetHandle || undefined,
      type: 'default',
      animated: true,
    };
    set({ edges: [...edges, newEdge], isDirty: true });
  },

  addNode: (node) => {
    const { nodes } = get();
    set({ nodes: [...nodes, node], isDirty: true });
  },

  removeNode: (nodeId) => {
    const { nodes, edges } = get();
    set({
      nodes: nodes.filter((n) => n.id !== nodeId),
      edges: edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
      isDirty: true,
    });
  },

  updateNodeData: (nodeId, data) => {
    const { nodes } = get();
    set({
      nodes: nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n,
      ),
      isDirty: true,
    });
  },

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  duplicateNode: (nodeId) => {
    const { nodes, edges } = get();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const newNodeId = `node-${Date.now()}`;
    const newNode: Node<WorkflowNodeData> = {
      ...node,
      id: newNodeId,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
      data: { ...node.data },
    };

    set({ nodes: [...nodes, newNode], isDirty: true });
  },

  clearCanvas: () => set({ nodes: [], edges: [], isDirty: true }),

  loadWorkflow: (nodes, edges) =>
    set({ nodes, edges, isDirty: false, selectedNodeId: null }),

  markDirty: () => set({ isDirty: true }),
  markSaved: () => set({ isDirty: false, isSaving: false, lastSavedAt: new Date() }),
}));

// Helpers to apply changes (simplified versions)
function applyNodeChanges(changes: any[], nodes: any[]) {
  let result = [...nodes];
  for (const change of changes) {
    if (change.type === 'position' && change.position) {
      result = result.map((n) =>
        n.id === change.id ? { ...n, position: change.position } : n,
      );
    } else if (change.type === 'remove') {
      result = result.filter((n) => n.id !== change.id);
    } else if (change.type === 'select') {
      result = result.map((n) =>
        n.id === change.id ? { ...n, selected: change.selected } : n,
      );
    } else if (change.type === 'dimensions' && change.dimensions) {
      result = result.map((n) =>
        n.id === change.id
          ? { ...n, measured: { width: change.dimensions.width, height: change.dimensions.height } }
          : n,
      );
    }
  }
  return result;
}

function applyEdgeChanges(changes: any[], edges: any[]) {
  let result = [...edges];
  for (const change of changes) {
    if (change.type === 'remove') {
      result = result.filter((e) => e.id !== change.id);
    } else if (change.type === 'select') {
      result = result.map((e) =>
        e.id === change.id ? { ...e, selected: change.selected } : e,
      );
    }
  }
  return result;
}
