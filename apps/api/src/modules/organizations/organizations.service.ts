import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { slugify } from '../../shared/utils/slugify';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async findByUser(userId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            subscriptions: true,
            _count: {
              select: {
                workflows: true,
                memberships: true,
                integrations: true,
              },
            },
          },
        },
      },
    });

    return memberships.map((m) => ({
      ...m.organization,
      role: m.role,
      memberCount: m.organization._count.memberships,
      workflowCount: m.organization._count.workflows,
      integrationCount: m.organization._count.integrations,
    }));
  }

  async findById(id: string, userId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: { userId, organizationId: id },
      },
      include: {
        organization: {
          include: {
            subscriptions: true,
            _count: {
              select: {
                workflows: true,
                memberships: true,
                integrations: true,
              },
            },
          },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Organization not found');
    }

    return {
      ...membership.organization,
      role: membership.role,
      memberCount: membership.organization._count.memberships,
      workflowCount: membership.organization._count.workflows,
      integrationCount: membership.organization._count.integrations,
    };
  }

  async create(userId: string, data: { name: string }) {
    const slug = slugify(data.name);

    // Check for existing slug
    const existing = await this.prisma.organization.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ForbiddenException('Organization name already taken');
    }

    const organization = await this.prisma.organization.create({
      data: {
        name: data.name,
        slug,
        memberships: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
        subscriptions: {
          create: {
            plan: 'FREE',
            status: 'active',
          },
        },
      },
      include: {
        memberships: true,
        subscriptions: true,
      },
    });

    return organization;
  }

  async update(id: string, userId: string, data: { name?: string; logoUrl?: string }) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: { userId, organizationId: id },
      },
    });

    if (!membership || membership.role === 'VIEWER') {
      throw new ForbiddenException('Insufficient permissions');
    }

    const updateData: any = {};
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = slugify(data.name);
    }
    if (data.logoUrl !== undefined) {
      updateData.logoUrl = data.logoUrl;
    }

    return this.prisma.organization.update({
      where: { id },
      data: updateData,
    });
  }

  async getMemberCount(organizationId: string) {
    return this.prisma.membership.count({
      where: { organizationId },
    });
  }
}
