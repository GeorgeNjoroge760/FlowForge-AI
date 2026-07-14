import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkflowNodesService {
  constructor(private prisma: PrismaService) {}

  async findAllByWorkflow(workflowId: string) {
    return this.prisma.workflowNode.findMany({
      where: { workflowId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: string) {
    const node = await this.prisma.workflowNode.findUnique({
      where: { id },
    });

    if (!node) {
      throw new NotFoundException(`Workflow node not found: ${id}`);
    }

    return node;
  }

  async create(data: {
    workflowId: string;
    type: string;
    category?: string;
    label?: string;
    positionX?: number;
    positionY?: number;
    config?: any;
    width?: number;
    height?: number;
  }) {
    return this.prisma.workflowNode.create({
      data: {
        workflowId: data.workflowId,
        type: data.type,
        category: data.category ?? 'general',
        label: data.label ?? data.type,
        positionX: data.positionX ?? 0,
        positionY: data.positionY ?? 0,
        config: data.config ?? {},
        width: data.width,
        height: data.height,
      },
    });
  }

  async update(id: string, data: {
    type?: string;
    category?: string;
    label?: string;
    positionX?: number;
    positionY?: number;
    config?: any;
    width?: number;
    height?: number;
  }) {
    const existing = await this.prisma.workflowNode.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Workflow node not found: ${id}`);
    }

    return this.prisma.workflowNode.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const existing = await this.prisma.workflowNode.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Workflow node not found: ${id}`);
    }

    await this.prisma.workflowNode.delete({ where: { id } });
    return { deleted: true };
  }

  async deleteManyByWorkflow(workflowId: string) {
    await this.prisma.workflowNode.deleteMany({
      where: { workflowId },
    });
    return { deleted: true };
  }
}
