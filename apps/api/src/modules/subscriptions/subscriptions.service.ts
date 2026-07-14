import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async findCurrent(organizationId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        organizationId,
        status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    return subscription || null;
  }

  async findById(id: string, organizationId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { id, organizationId },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription not found: ${id}`);
    }

    return subscription;
  }

  async findAll(organizationId: string) {
    return this.prisma.subscription.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(organizationId: string, data: {
    plan: string;
    status?: string;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    stripeSubscriptionId?: string;
  }) {
    return this.prisma.subscription.create({
      data: {
        organizationId,
        plan: data.plan,
        status: data.status ?? 'ACTIVE',
        currentPeriodStart: data.currentPeriodStart ?? new Date(),
        currentPeriodEnd: data.currentPeriodEnd,
        stripeSubscriptionId: data.stripeSubscriptionId,
      },
    });
  }

  async update(id: string, organizationId: string, data: {
    plan?: string;
    status?: string;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    stripeSubscriptionId?: string;
  }) {
    const existing = await this.prisma.subscription.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new NotFoundException(`Subscription not found: ${id}`);
    }

    return this.prisma.subscription.update({
      where: { id },
      data,
    });
  }

  async cancel(id: string, organizationId: string) {
    const existing = await this.prisma.subscription.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new NotFoundException(`Subscription not found: ${id}`);
    }

    return this.prisma.subscription.update({
      where: { id },
      data: { status: 'CANCELED' },
    });
  }
}
