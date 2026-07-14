import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsageService {
  constructor(private prisma: PrismaService) {}

  async getCurrentPeriod(organizationId: string) {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    let usage = await this.prisma.usage.findFirst({
      where: {
        organizationId,
        period,
      },
    });

    if (!usage) {
      usage = await this.prisma.usage.create({
        data: {
          organizationId,
          period,
          executions: 0,
          apiCalls: 0,
          aiTokens: 0,
        },
      });
    }

    return usage;
  }

  async increment(organizationId: string, metric: string, amount: number = 1) {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const usage = await this.prisma.usage.findFirst({
      where: {
        organizationId,
        period,
      },
    });

    if (!usage) {
      const data: any = {
        organizationId,
        period,
        executions: 0,
        apiCalls: 0,
        aiTokens: 0,
      };
      data[metric] = amount;
      return this.prisma.usage.create({ data });
    }

    const updateData: any = {};
    updateData[metric] = { increment: amount };
    return this.prisma.usage.update({
      where: { id: usage.id },
      data: updateData,
    });
  }

  async getHistory(organizationId: string, months: number = 6) {
    return this.prisma.usage.findMany({
      where: {
        organizationId,
      },
      orderBy: { createdAt: 'desc' },
      take: months,
    });
  }
}
