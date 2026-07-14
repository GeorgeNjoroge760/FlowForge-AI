import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string, query: { page?: number; limit?: number; search?: string; category?: string }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = { organizationId };

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [templates, total] = await Promise.all([
      this.prisma.template.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.template.count({ where }),
    ]);

    return {
      data: templates,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findPublic(query: { page?: number; limit?: number; search?: string; category?: string }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = { isPublic: true };

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [templates, total] = await Promise.all([
      this.prisma.template.findMany({
        where,
        orderBy: { usageCount: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.template.count({ where }),
    ]);

    return {
      data: templates,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string, organizationId: string) {
    const template = await this.prisma.template.findFirst({
      where: { id, organizationId },
    });

    if (!template) {
      throw new NotFoundException(`Template not found: ${id}`);
    }

    return template;
  }

  async create(organizationId: string, data: {
    name: string;
    description?: string;
    category?: string;
    definition?: any;
    isPublic?: boolean;
  }) {
    return this.prisma.template.create({
      data: {
        organizationId,
        name: data.name,
        description: data.description ?? '',
        category: data.category ?? 'general',
        definition: data.definition ? JSON.stringify(data.definition) : '{}',
        isPublic: data.isPublic ?? false,
      },
    });
  }

  async update(id: string, organizationId: string, data: {
    name?: string;
    description?: string;
    category?: string;
    definition?: any;
    isPublic?: boolean;
  }) {
    const existing = await this.prisma.template.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new NotFoundException(`Template not found: ${id}`);
    }

    const updateData: any = { ...data };
    if (data.definition !== undefined) {
      updateData.definition = JSON.stringify(data.definition);
    }

    return this.prisma.template.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string, organizationId: string) {
    const existing = await this.prisma.template.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new NotFoundException(`Template not found: ${id}`);
    }

    await this.prisma.template.delete({ where: { id } });
    return { deleted: true };
  }

  async clone(id: string, organizationId: string) {
    const existing = await this.prisma.template.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Template not found: ${id}`);
    }

    return this.prisma.template.create({
      data: {
        organizationId,
        name: `${existing.name} (Copy)`,
        description: existing.description,
        category: existing.category,
        definition: existing.definition,
        isPublic: false,
      },
    });
  }
}
