import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class IntegrationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.integration.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, organizationId: string) {
    const integration = await this.prisma.integration.findFirst({
      where: { id, organizationId },
    });

    if (!integration) {
      throw new NotFoundException(`Integration not found: ${id}`);
    }

    return integration;
  }

  async findByProvider(organizationId: string, provider: string) {
    return this.prisma.integration.findFirst({
      where: { organizationId, provider },
    });
  }

  async connect(organizationId: string, data: {
    provider: string;
    displayName: string;
    metadata?: any;
  }) {
    const existing = await this.prisma.integration.findFirst({
      where: { organizationId, provider: data.provider },
    });

    if (existing) {
      return this.prisma.integration.update({
        where: { id: existing.id },
        data: {
          displayName: data.displayName,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
          status: 'connected',
        },
      });
    }

    return this.prisma.integration.create({
      data: {
        organizationId,
        provider: data.provider,
        displayName: data.displayName,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        status: 'connected',
      },
    });
  }

  async disconnect(id: string, organizationId: string) {
    const integration = await this.prisma.integration.findFirst({
      where: { id, organizationId },
    });

    if (!integration) {
      throw new NotFoundException(`Integration not found: ${id}`);
    }

    return this.prisma.integration.update({
      where: { id },
      data: {
        status: 'disconnected',
      },
    });
  }

  async disconnectByProvider(provider: string, organizationId: string) {
    const integration = await this.prisma.integration.findFirst({
      where: { organizationId, provider },
    });

    if (!integration) {
      throw new NotFoundException(`Integration not found for provider: ${provider}`);
    }

    return this.prisma.integration.delete({
      where: { id: integration.id },
    });
  }

  async delete(id: string, organizationId: string) {
    const integration = await this.prisma.integration.findFirst({
      where: { id, organizationId },
    });

    if (!integration) {
      throw new NotFoundException(`Integration not found: ${id}`);
    }

    await this.prisma.integration.delete({ where: { id } });
    return { deleted: true };
  }
}
