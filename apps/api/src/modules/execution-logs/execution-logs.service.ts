import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExecutionLogsService {
  constructor(private prisma: PrismaService) {}

  async findByExecution(executionId: string, query: { page?: number; limit?: number; level?: string }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 50));
    const skip = (page - 1) * limit;

    const where: any = { executionId };

    if (query.level) {
      where.level = query.level;
    }

    const [logs, total] = await Promise.all([
      this.prisma.executionLog.findMany({
        where,
        orderBy: { startedAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.executionLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const log = await this.prisma.executionLog.findUnique({
      where: { id },
    });

    if (!log) {
      throw new NotFoundException(`Execution log not found: ${id}`);
    }

    return log;
  }

  async create(data: {
    executionId: string;
    nodeId: string;
    level: string;
    message: string;
    metadata?: any;
  }) {
    return this.prisma.executionLog.create({
      data: {
        executionId: data.executionId,
        nodeId: data.nodeId,
        nodeType: '',
        nodeLabel: '',
        status: data.level,
        error: data.message,
        retryCount: 0,
        startedAt: new Date(),
      },
    });
  }

  async deleteByExecution(executionId: string) {
    await this.prisma.executionLog.deleteMany({
      where: { executionId },
    });
    return { deleted: true };
  }
}
