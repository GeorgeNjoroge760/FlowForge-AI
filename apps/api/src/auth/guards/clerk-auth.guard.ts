import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from '@clerk/backend';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger('ClerkAuthGuard');

  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    try {
      const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');
      const payload = await verifyToken(token, { secretKey });

      // Lazy-sync: find or create user in our database
      const user = await this.prisma.user.upsert({
        where: { clerkId: payload.sub },
        update: {
          email: String(payload.email || ''),
          name: (payload.name as string) || null,
        },
        create: {
          clerkId: payload.sub,
          email: String(payload.email || ''),
          name: (payload.name as string) || null,
        },
      });

      // Get user's memberships
      let memberships = await this.prisma.membership.findMany({
        where: { userId: user.id },
        include: { organization: true },
      });

      // Auto-create organization for new users
      if (memberships.length === 0) {
        const slug = `org-${user.id.slice(0, 8)}`;
        const organization = await this.prisma.organization.create({
          data: {
            name: `${user.name || user.email}'s Organization`,
            slug,
            plan: 'FREE',
          },
        });

        const membership = await this.prisma.membership.create({
          data: {
            userId: user.id,
            organizationId: organization.id,
            role: 'OWNER',
          },
          include: { organization: true },
        });

        memberships = [membership];
      }

      request.user = {
        ...user,
        memberships,
        organizationId: memberships[0]?.organizationId || null,
        role: memberships[0]?.role || null,
      };

      return true;
    } catch (error) {
      this.logger.error(`Auth failed: ${(error as Error).message}`);
      throw new UnauthorizedException('Invalid authentication token');
    }
  }
}
