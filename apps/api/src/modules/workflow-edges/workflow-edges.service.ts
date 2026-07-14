import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkflowEdgesService {
  constructor(private prisma: PrismaService) {}

  async findAllByWorkflow(workflowId: string) {
    return this.prisma.workflowEdge.findMany({
      where: { workflowId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: string) {
    const edge = await this.prisma.workflowEdge.findUnique({
      where: { id },
    });

    if (!edge) {
      throw new NotFoundException(`Workflow edge not found: ${id}`);
    }

    return edge;
  }

  async create(data: {
    workflowId: string;
    sourceNodeId: string;
    targetNodeId: string;
    sourceHandleId?: string;
    targetHandleId?: string;
    label?: string;
    condition?: any;
  }) {
    return this.prisma.workflowEdge.create({
      data: {
        workflowId: data.workflowId,
        sourceNodeId: data.sourceNodeId,
        targetNodeId: data.targetNodeId,
        sourceHandleId: data.sourceHandleId,
        targetHandleId: data.targetHandleId,
        label: data.label,
        condition: data.condition,
      },
    });
  }

  async update(id: string, data: {
    sourceNodeId?: string;
    targetNodeId?: string;
    sourceHandleId?: string;
    targetHandleId?: string;
    label?: string;
    condition?: any;
  }) {
    const existing = await this.prisma.workflowEdge.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Workflow edge not found: ${id}`);
    }

    return this.prisma.workflowEdge.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const existing = await this.prisma.workflowEdge.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Workflow edge not found: ${id}`);
    }

    await this.prisma.workflowEdge.delete({ where: { id } });
    return { deleted: true };
  }

  async deleteManyByWorkflow(workflowId: string) {
    await this.prisma.workflowEdge.deleteMany({
      where: { workflowId },
    });
    return { deleted: true };
  }
}
