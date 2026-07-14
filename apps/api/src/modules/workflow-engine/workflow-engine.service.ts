import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ExecutionsService } from '../executions/executions.service';
import { DagResolver } from './dag-resolver';
import { NodeExecutor } from './node-executor';

export interface ExecuteWorkflowOptions {
  input?: Record<string, unknown>;
  triggerType?: string;
  resumeFromNodeId?: string;
}

@Injectable()
export class WorkflowEngineService {
  private readonly logger = new Logger(WorkflowEngineService.name);

  constructor(
    private prisma: PrismaService,
    private executionsService: ExecutionsService,
    private dagResolver: DagResolver,
    private nodeExecutor: NodeExecutor,
  ) {}

  async execute(
    workflowId: string,
    organizationId: string,
    options: ExecuteWorkflowOptions = {},
  ) {
    // Fetch workflow with nodes and edges
    const workflow = await this.prisma.workflow.findFirst({
      where: { id: workflowId, organizationId },
      include: {
        nodes: true,
        edges: true,
      },
    });

    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    if (workflow.status === 'INACTIVE') {
      throw new Error('Cannot execute inactive workflow');
    }

    // Create execution record
    const execution = await this.executionsService.create(workflowId, {
      triggerType: options.triggerType || 'manual',
      input: options.input,
    });

    this.logger.log(`Starting execution ${execution.id} for workflow ${workflowId}`);

    try {
      // Mark as running
      await this.executionsService.updateStatus(execution.id, 'RUNNING');

      // Resolve DAG execution order
      const tiers = this.dagResolver.resolve(
        workflow.nodes.map((n) => ({
          id: n.id,
          category: n.category,
          config: (JSON.parse(n.config || '{}') as Record<string, unknown>),
          type: n.type,
          label: n.label,
        })),
        workflow.edges.map((e) => ({
          id: e.id,
          source: e.sourceNodeId,
          target: e.targetNodeId,
          sourceHandle: e.sourceHandleId || undefined,
          targetHandle: e.targetHandleId || undefined,
          condition: (e.condition ? JSON.parse(e.condition) : undefined) as Record<string, unknown> | undefined,
        })),
      );

      if (tiers.hasCycle) {
        throw new Error('Workflow contains a cycle');
      }

      // Execute tiers sequentially, nodes within a tier in parallel
      const nodeOutputs = new Map<string, any>();
      let totalCredits = 0;
      const startTime = Date.now();

      for (const tier of tiers.executionOrder) {
        this.logger.log(`Executing tier: ${tier.join(', ')}`);

        const results = await Promise.allSettled(
          tier.map(async (nodeId) => {
            const node = workflow.nodes.find((n) => n.id === nodeId);
            if (!node) return;

            // Gather inputs from upstream nodes
            const upstreamEdges = workflow.edges.filter((e) => e.targetNodeId === nodeId);
            const previousOutputs: Record<string, any> = {};
            for (const edge of upstreamEdges) {
              previousOutputs[edge.sourceNodeId] = nodeOutputs.get(edge.sourceNodeId);
            }

            const result = await this.nodeExecutor.execute({
              nodeId: node.id,
              nodeType: node.type,
              category: node.category,
              label: node.label,
              config: (JSON.parse(node.config || '{}') as Record<string, any>),
              previousOutputs,
              triggerData: options.input || {},
              executionId: execution.id,
              organizationId,
            });

            nodeOutputs.set(nodeId, result.data);

            // Log the execution
            await this.executionsService.addLog(execution.id, {
              nodeId: node.id,
              nodeType: node.type,
              nodeLabel: node.label,
              status: 'success',
              input: previousOutputs,
              output: result.data,
              duration: result.metadata?.duration as number | undefined,
            });

            if (result.metadata?.tokenUsage) {
              totalCredits += result.metadata.tokenUsage as number;
            }

            return result;
          }),
        );

        // Check for failures
        for (const result of results) {
          if (result.status === 'rejected') {
            throw result.reason;
          }
        }
      }

      const duration = Date.now() - startTime;
      const lastOutput = nodeOutputs.size > 0
        ? Array.from(nodeOutputs.values())[nodeOutputs.size - 1]
        : null;

      // Mark as success
      await this.executionsService.updateStatus(execution.id, 'SUCCESS', {
        output: lastOutput,
        duration,
        creditsUsed: totalCredits,
      });

      this.logger.log(`Execution ${execution.id} completed in ${duration}ms`);

      return {
        executionId: execution.id,
        status: 'SUCCESS',
        duration,
        output: lastOutput,
      };
    } catch (error) {
      this.logger.error(`Execution ${execution.id} failed: ${(error as Error).message}`);

      await this.executionsService.updateStatus(execution.id, 'FAILED', {
        error: (error as Error).message,
      });

      return {
        executionId: execution.id,
        status: 'FAILED',
        error: (error as Error).message,
      };
    }
  }
}
