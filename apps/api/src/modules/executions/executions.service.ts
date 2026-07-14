import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExecutionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string, query: {
    page?: number;
    limit?: number;
    workflowId?: string;
    status?: string;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      workflow: { organizationId },
    };

    if (query.workflowId) {
      where.workflowId = query.workflowId;
    }

    if (query.status) {
      where.status = query.status;
    }

    const [executions, total] = await Promise.all([
      this.prisma.execution.findMany({
        where,
        include: {
          workflow: {
            select: { id: true, name: true },
          },
          logs: {
            orderBy: { startedAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.execution.count({ where }),
    ]);

    return {
      data: executions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, organizationId: string) {
    const execution = await this.prisma.execution.findFirst({
      where: {
        id,
        workflow: { organizationId },
      },
      include: {
        workflow: {
          select: { id: true, name: true },
        },
        logs: {
          orderBy: { startedAt: 'asc' },
        },
      },
    });

    if (!execution) {
      throw new NotFoundException(`Execution not found: ${id}`);
    }

    return execution;
  }

  async create(workflowId: string, data: {
    triggerType?: string;
    input?: Record<string, unknown>;
  }) {
    return this.prisma.execution.create({
      data: {
        workflowId,
        status: 'PENDING',
        triggerType: data.triggerType || 'manual',
        input: (data.input || {}) as Prisma.InputJsonValue,
      },
    });
  }

  async updateStatus(id: string, status: string, data?: {
    output?: Record<string, unknown>;
    error?: string;
    duration?: number;
    creditsUsed?: number;
  }) {
    const updateData: any = { status };

    if (status === 'RUNNING') {
      updateData.startedAt = new Date();
    }

    if (status === 'SUCCESS' || status === 'FAILED' || status === 'CANCELLED') {
      updateData.completedAt = new Date();
    }

    if (data?.output !== undefined) updateData.output = data.output as Prisma.InputJsonValue;
    if (data?.error !== undefined) updateData.error = data.error;
    if (data?.duration !== undefined) updateData.duration = data.duration;
    if (data?.creditsUsed !== undefined) updateData.creditsUsed = data.creditsUsed;

    return this.prisma.execution.update({
      where: { id },
      data: updateData,
    });
  }

  async addLog(executionId: string, data: {
    nodeId: string;
    nodeType: string;
    nodeLabel: string;
    status: string;
    input?: Record<string, unknown>;
    output?: Record<string, unknown>;
    error?: string;
    duration?: number;
    retryCount?: number;
  }) {
    return this.prisma.executionLog.create({
      data: {
        executionId,
        nodeId: data.nodeId,
        nodeType: data.nodeType,
        nodeLabel: data.nodeLabel,
        status: data.status,
        input: (data.input as Prisma.InputJsonValue) ?? Prisma.DbNull,
        output: (data.output as Prisma.InputJsonValue) ?? Prisma.DbNull,
        error: data.error || null,
        duration: data.duration || null,
        retryCount: data.retryCount || 0,
      },
    });
  }

  async retry(id: string, organizationId: string) {
    const execution = await this.findById(id, organizationId);

    if (execution.status !== 'FAILED') {
      throw new Error('Can only retry failed executions');
    }

    return this.create(execution.workflowId, {
      triggerType: 'retry',
      input: execution.input as Record<string, unknown> | undefined,
    });
  }

  async getStats(organizationId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalToday,
      successfulToday,
      failedToday,
      activeNow,
    ] = await Promise.all([
      this.prisma.execution.count({
        where: {
          workflow: { organizationId },
          createdAt: { gte: today },
        },
      }),
      this.prisma.execution.count({
        where: {
          workflow: { organizationId },
          createdAt: { gte: today },
          status: 'SUCCESS',
        },
      }),
      this.prisma.execution.count({
        where: {
          workflow: { organizationId },
          createdAt: { gte: today },
          status: 'FAILED',
        },
      }),
      this.prisma.execution.count({
        where: {
          workflow: { organizationId },
          status: { in: ['PENDING', 'RUNNING', 'WAITING'] },
        },
      }),
    ]);

    return {
      today: {
        total: totalToday,
        successful: successfulToday,
        failed: failedToday,
      },
      activeNow,
    };
  }
}
