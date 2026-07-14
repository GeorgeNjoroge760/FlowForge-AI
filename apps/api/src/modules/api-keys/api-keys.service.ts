import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { randomBytes, createHash } from 'crypto';

@Injectable()
export class ApiKeysService {
  constructor(private prisma: PrismaService) {}

  private generateKey(): string {
    const prefix = 'ak_';
    const bytes = randomBytes(32);
    return prefix + bytes.toString('hex');
  }

  private hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }

  async findAll(organizationId: string) {
    return this.prisma.apiKey.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
      },
    });
  }

  async findById(id: string, organizationId: string) {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: { id, organizationId },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    if (!apiKey) {
      throw new NotFoundException(`API key not found: ${id}`);
    }

    return apiKey;
  }

  async create(organizationId: string, data: { name: string; expiresAt?: Date }) {
    const fullKey = this.generateKey();
    const keyPrefix = fullKey.substring(0, 7);
    const keyHash = this.hashKey(fullKey);

    const apiKey = await this.prisma.apiKey.create({
      data: {
        userId: '',
        organizationId,
        name: data.name,
        keyHash,
        keyPrefix,
        expiresAt: data.expiresAt,
      },
    });

    return {
      id: apiKey.id,
      name: apiKey.name,
      key: fullKey,
      keyPrefix: apiKey.keyPrefix,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
    };
  }

  async delete(id: string, organizationId: string) {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: { id, organizationId },
    });

    if (!apiKey) {
      throw new NotFoundException(`API key not found: ${id}`);
    }

    await this.prisma.apiKey.delete({ where: { id } });
    return { deleted: true };
  }

  async validateKey(key: string) {
    const keyHash = this.hashKey(key);
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { keyHash },
      include: { organization: true },
    });

    if (!apiKey) {
      return null;
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null;
    }

    await this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    return apiKey;
  }
}
