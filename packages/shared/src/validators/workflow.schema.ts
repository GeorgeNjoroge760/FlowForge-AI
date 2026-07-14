import { z } from 'zod';
import {
  WorkflowDefinitionSchema,
  WorkflowNodeSchema,
  WorkflowEdgeSchema,
  NodeCategoryEnum,
  NodeTypeEnum,
  type NodeCategory,
} from '../types/workflow';

export const CreateWorkflowDTOSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  definition: WorkflowDefinitionSchema.optional(),
});

export const UpdateWorkflowDTOSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ERROR']).optional(),
  definition: WorkflowDefinitionSchema.optional(),
});

export const ExecuteWorkflowDTOSchema = z.object({
  input: z.record(z.unknown()).optional(),
  triggerType: z.string().optional(),
});

export const AddNodeDTOSchema = z.object({
  type: NodeTypeEnum,
  category: NodeCategoryEnum,
  label: z.string().min(1),
  position: z.object({ x: z.number(), y: z.number() }),
  config: z.record(z.unknown()).default({}),
});

export const UpdateNodeDTOSchema = z.object({
  label: z.string().min(1).optional(),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  config: z.record(z.unknown()).optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const AddEdgeDTOSchema = z.object({
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  label: z.string().optional(),
  condition: z.record(z.unknown()).optional(),
});

export function validateWorkflowDefinition(definition: unknown) {
  return WorkflowDefinitionSchema.safeParse(definition);
}

export function validateNodeConfig(category: NodeCategory, config: Record<string, unknown>) {
  const nodeTypes = require('../constants/node-types');
  const nodeInfo = nodeTypes.NODE_TYPES[category];
  if (!nodeInfo) return { valid: false, errors: [`Unknown node category: ${category}`] };

  const errors: string[] = [];
  // Validate required config fields
  for (const [key, schema] of Object.entries(nodeInfo.configSchema) as any[]) {
    if (schema.required && !config[key]) {
      errors.push(`Missing required config field: ${key}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export type CreateWorkflowDTO = z.infer<typeof CreateWorkflowDTOSchema>;
export type UpdateWorkflowDTO = z.infer<typeof UpdateWorkflowDTOSchema>;
export type ExecuteWorkflowDTO = z.infer<typeof ExecuteWorkflowDTOSchema>;
export type AddNodeDTO = z.infer<typeof AddNodeDTOSchema>;
export type UpdateNodeDTO = z.infer<typeof UpdateNodeDTOSchema>;
export type AddEdgeDTO = z.infer<typeof AddEdgeDTOSchema>;
