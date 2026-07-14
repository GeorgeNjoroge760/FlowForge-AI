import { z } from 'zod';

export const ExecutionStatusEnum = z.enum([
  'PENDING',
  'RUNNING',
  'SUCCESS',
  'FAILED',
  'CANCELLED',
  'WAITING',
]);
export type ExecutionStatus = z.infer<typeof ExecutionStatusEnum>;

export const ExecutionLogStatusEnum = z.enum([
  'running',
  'success',
  'failed',
  'skipped',
]);
export type ExecutionLogStatus = z.infer<typeof ExecutionLogStatusEnum>;

export interface Execution {
  id: string;
  workflowId: string;
  status: ExecutionStatus;
  triggerType: string | null;
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  error: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  duration: number | null;
  creditsUsed: number;
  createdAt: Date;
}

export interface ExecutionLog {
  id: string;
  executionId: string;
  nodeId: string;
  nodeType: string;
  nodeLabel: string;
  status: ExecutionLogStatus;
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  error: string | null;
  duration: number | null;
  retryCount: number;
  startedAt: Date;
  completedAt: Date | null;
}

export interface ExecutionWithLogs extends Execution {
  logs: ExecutionLog[];
  workflow?: {
    id: string;
    name: string;
  };
}

export interface NodeInput {
  previousOutputs: Record<string, unknown>;
  triggerData?: Record<string, unknown>;
  config: Record<string, unknown>;
}

export interface NodeOutput {
  data: Record<string, unknown>;
  metadata?: {
    duration?: number;
    tokenUsage?: number;
    [key: string]: unknown;
  };
}

export interface ExecutionContext {
  executionId: string;
  workflowId: string;
  organizationId: string;
  nodeId: string;
  nodeCategory: string;
  retryCount: number;
  timeoutMs: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
