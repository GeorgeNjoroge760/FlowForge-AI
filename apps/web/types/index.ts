export interface Workflow {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  definition: WorkflowDefinition;
  version: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    nodes: number;
    edges: number;
    executions: number;
  };
  executions?: Array<{
    status: string;
    createdAt: string;
  }>;
}

export interface WorkflowDefinition {
  nodes: WorkflowNodeData[];
  edges: WorkflowEdgeData[];
}

export interface WorkflowNodeData {
  id: string;
  type: 'TRIGGER' | 'ACTION' | 'LOGIC';
  category: string;
  label: string;
  position: { x: number; y: number };
  config: Record<string, unknown>;
  width?: number;
  height?: number;
}

export interface WorkflowEdgeData {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  condition?: Record<string, unknown>;
}

export interface Execution {
  id: string;
  workflowId: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'WAITING';
  triggerType: string | null;
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
  duration: number | null;
  creditsUsed: number;
  createdAt: string;
  workflow?: {
    id: string;
    name: string;
  };
  logs?: ExecutionLog[];
}

export interface ExecutionLog {
  id: string;
  executionId: string;
  nodeId: string;
  nodeType: string;
  nodeLabel: string;
  status: 'running' | 'success' | 'failed' | 'skipped';
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  error: string | null;
  duration: number | null;
  retryCount: number;
  startedAt: string;
  completedAt: string | null;
}

export interface Integration {
  id: string;
  provider: string;
  displayName: string;
  status: 'connected' | 'expired' | 'error';
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  definition: WorkflowDefinition;
  icon: string | null;
  isPublic: boolean;
  rating: number;
  usageCount: number;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface WorkflowStats {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  todayExecutions: number;
  successRate: number;
  recentExecutions: Array<{
    id: string;
    status: string;
    createdAt: string;
    workflow: { id: string; name: string };
  }>;
}
