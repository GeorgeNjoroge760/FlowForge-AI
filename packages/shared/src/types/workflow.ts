import { z } from 'zod';

export const WorkflowStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'ERROR']);
export type WorkflowStatus = z.infer<typeof WorkflowStatusEnum>;

export const NodeTypeEnum = z.enum(['TRIGGER', 'ACTION', 'LOGIC']);
export type NodeType = z.infer<typeof NodeTypeEnum>;

export const NodeCategoryEnum = z.enum([
  'TRIGGER_WEBHOOK',
  'TRIGGER_SCHEDULE',
  'TRIGGER_CRON',
  'TRIGGER_GMAIL',
  'TRIGGER_GOOGLE_FORMS',
  'TRIGGER_STRIPE',
  'TRIGGER_GITHUB',
  'TRIGGER_DISCORD',
  'TRIGGER_TELEGRAM',
  'TRIGGER_RSS',
  'TRIGGER_GOOGLE_SHEETS',
  'TRIGGER_HTTP_REQUEST',
  'ACTION_OPENAI',
  'ACTION_CLAUDE',
  'ACTION_GEMINI',
  'ACTION_GOOGLE_SHEETS',
  'ACTION_SLACK',
  'ACTION_DISCORD',
  'ACTION_TELEGRAM',
  'ACTION_NOTION',
  'ACTION_EMAIL',
  'ACTION_SMS',
  'ACTION_WEBHOOK',
  'ACTION_HTTP_REQUEST',
  'ACTION_JSON_PARSER',
  'ACTION_FORMATTER',
  'LOGIC_DELAY',
  'LOGIC_FILTER',
  'LOGIC_LOOP',
  'LOGIC_ROUTER',
  'LOGIC_CONDITION',
  'LOGIC_CODE',
]);
export type NodeCategory = z.infer<typeof NodeCategoryEnum>;

export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});
export type Position = z.infer<typeof PositionSchema>;

export const WorkflowNodeSchema = z.object({
  id: z.string(),
  type: NodeTypeEnum,
  category: NodeCategoryEnum,
  label: z.string(),
  position: PositionSchema,
  config: z.record(z.unknown()).default({}),
  width: z.number().optional(),
  height: z.number().optional(),
});
export type WorkflowNodeData = z.infer<typeof WorkflowNodeSchema>;

export const HandleSchema = z.object({
  id: z.string(),
  type: z.enum(['source', 'target']),
  label: z.string().optional(),
});
export type Handle = z.infer<typeof HandleSchema>;

export const WorkflowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  label: z.string().optional(),
  condition: z.record(z.unknown()).optional(),
});
export type WorkflowEdgeData = z.infer<typeof WorkflowEdgeSchema>;

export const WorkflowDefinitionSchema = z.object({
  nodes: z.array(WorkflowNodeSchema),
  edges: z.array(WorkflowEdgeSchema),
});
export type WorkflowDefinition = z.infer<typeof WorkflowDefinitionSchema>;

export interface Workflow {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  status: WorkflowStatus;
  definition: WorkflowDefinition;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowWithNodes extends Workflow {
  nodes: WorkflowNodeData[];
  edges: WorkflowEdgeData[];
}

export interface CreateWorkflowInput {
  name: string;
  description?: string;
  definition?: WorkflowDefinition;
}

export interface UpdateWorkflowInput {
  name?: string;
  description?: string;
  status?: WorkflowStatus;
  definition?: WorkflowDefinition;
}
