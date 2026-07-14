import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkflowsService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string, query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = { organizationId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [workflows, total] = await Promise.all([
      this.prisma.workflow.findMany({
        where,
        include: {
          _count: {
            select: { nodes: true, edges: true, executions: true },
          },
          executions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { status: true, createdAt: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.workflow.count({ where }),
    ]);

    return {
      data: workflows,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, organizationId: string) {
    const workflow = await this.prisma.workflow.findFirst({
      where: { id, organizationId },
      include: {
        nodes: true,
        edges: true,
        _count: {
          select: { executions: true },
        },
      },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow not found: ${id}`);
    }

    return workflow;
  }

  async create(organizationId: string, data: {
    name: string;
    description?: string;
    definition?: any;
  }) {
    const workflow = await this.prisma.workflow.create({
      data: {
        organizationId,
        name: data.name,
        description: data.description,
        definition: data.definition || { nodes: [], edges: [] },
        nodes: {
          create: (data.definition?.nodes || []).map((node: any) => ({
            type: node.type,
            category: node.category,
            label: node.label,
            positionX: node.position?.x || 0,
            positionY: node.position?.y || 0,
            config: node.config || {},
            width: node.width,
            height: node.height,
          })),
        },
        edges: {
          create: (data.definition?.edges || []).map((edge: any) => ({
            sourceNodeId: edge.source,
            targetNodeId: edge.target,
            sourceHandleId: edge.sourceHandle,
            targetHandleId: edge.targetHandle,
            label: edge.label,
            condition: edge.condition,
          })),
        },
      },
      include: {
        nodes: true,
        edges: true,
      },
    });

    return workflow;
  }

  async update(id: string, organizationId: string, data: {
    name?: string;
    description?: string;
    status?: string;
    definition?: any;
  }) {
    const existing = await this.prisma.workflow.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new NotFoundException(`Workflow not found: ${id}`);
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;

    // If definition is being updated, also update nodes and edges
    if (data.definition) {
      updateData.definition = data.definition;
      updateData.version = existing.version + 1;

      // Replace nodes and edges
      await this.prisma.workflowNode.deleteMany({ where: { workflowId: id } });
      await this.prisma.workflowEdge.deleteMany({ where: { workflowId: id } });

      updateData.nodes = {
        create: data.definition.nodes?.map((node: any) => ({
          type: node.type,
          category: node.category,
          label: node.label,
          positionX: node.position?.x || 0,
          positionY: node.position?.y || 0,
          config: node.config || {},
          width: node.width,
          height: node.height,
        })) || [],
      };

      updateData.edges = {
        create: data.definition.edges?.map((edge: any) => ({
          sourceNodeId: edge.source,
          targetNodeId: edge.target,
          sourceHandleId: edge.sourceHandle,
          targetHandleId: edge.targetHandle,
          label: edge.label,
          condition: edge.condition,
        })) || [],
      };
    }

    return this.prisma.workflow.update({
      where: { id },
      data: updateData,
      include: {
        nodes: true,
        edges: true,
      },
    });
  }

  async delete(id: string, organizationId: string) {
    const existing = await this.prisma.workflow.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new NotFoundException(`Workflow not found: ${id}`);
    }

    // Check for running executions
    const runningExecutions = await this.prisma.execution.count({
      where: {
        workflowId: id,
        status: { in: ['PENDING', 'RUNNING', 'WAITING'] },
      },
    });

    if (runningExecutions > 0) {
      throw new ForbiddenException('Cannot delete workflow with running executions');
    }

    await this.prisma.workflow.delete({ where: { id } });
    return { deleted: true };
  }

  async duplicate(id: string, organizationId: string) {
    const existing = await this.prisma.workflow.findFirst({
      where: { id, organizationId },
      include: { nodes: true, edges: true },
    });

    if (!existing) {
      throw new NotFoundException(`Workflow not found: ${id}`);
    }

    return this.create(organizationId, {
      name: `${existing.name} (Copy)`,
      description: existing.description || undefined,
      definition: existing.definition,
    });
  }

  async getStats(organizationId: string) {
    const [
      totalWorkflows,
      activeWorkflows,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      recentExecutions,
    ] = await Promise.all([
      this.prisma.workflow.count({ where: { organizationId } }),
      this.prisma.workflow.count({ where: { organizationId, status: 'ACTIVE' } }),
      this.prisma.execution.count({
        where: { workflow: { organizationId } },
      }),
      this.prisma.execution.count({
        where: { workflow: { organizationId }, status: 'SUCCESS' },
      }),
      this.prisma.execution.count({
        where: { workflow: { organizationId }, status: 'FAILED' },
      }),
      this.prisma.execution.findMany({
        where: { workflow: { organizationId } },
        include: { workflow: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // Get today's executions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayExecutions = await this.prisma.execution.count({
      where: {
        workflow: { organizationId },
        createdAt: { gte: today },
      },
    });

    return {
      totalWorkflows,
      activeWorkflows,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      todayExecutions,
      successRate: totalExecutions > 0
        ? Math.round((successfulExecutions / totalExecutions) * 100)
        : 0,
      recentExecutions,
    };
  }
}
