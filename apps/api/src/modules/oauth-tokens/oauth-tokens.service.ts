import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OAuthTokensService {
  constructor(private prisma: PrismaService) {}

  async find(organizationId: string, provider: string) {
    const integration = await this.prisma.integration.findFirst({
      where: { organizationId, provider },
    });

    if (!integration) {
      return null;
    }

    return this.prisma.oAuthToken.findFirst({
      where: { integrationId: integration.id },
    });
  }

  async findAll(organizationId: string) {
    const integrations = await this.prisma.integration.findMany({
      where: { organizationId },
      include: { oauthTokens: true },
    });

    return integrations.flatMap((i) => i.oauthTokens);
  }

  async store(organizationId: string, data: {
    provider: string;
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    scope?: string;
    metadata?: any;
  }) {
    const integration = await this.prisma.integration.findFirst({
      where: { organizationId, provider: data.provider },
    });

    if (!integration) {
      throw new NotFoundException(`Integration not found for provider: ${data.provider}`);
    }

    const existing = await this.prisma.oAuthToken.findFirst({
      where: { integrationId: integration.id },
    });

    if (existing) {
      return this.prisma.oAuthToken.update({
        where: { id: existing.id },
        data: {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: data.expiresAt,
          scope: data.scope,
        },
      });
    }

    return this.prisma.oAuthToken.create({
      data: {
        integrationId: integration.id,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        scope: data.scope,
      },
    });
  }

  async delete(organizationId: string, provider: string) {
    const integration = await this.prisma.integration.findFirst({
      where: { organizationId, provider },
    });

    if (!integration) {
      throw new NotFoundException(`Integration not found for provider: ${provider}`);
    }

    const token = await this.prisma.oAuthToken.findFirst({
      where: { integrationId: integration.id },
    });

    if (!token) {
      throw new NotFoundException(`OAuth token not found for provider: ${provider}`);
    }

    await this.prisma.oAuthToken.delete({ where: { id: token.id } });
    return { deleted: true };
  }

  async isExpired(organizationId: string, provider: string): Promise<boolean> {
    const token = await this.find(organizationId, provider);
    if (!token) return true;
    if (!token.expiresAt) return false;
    return token.expiresAt < new Date();
  }
}
