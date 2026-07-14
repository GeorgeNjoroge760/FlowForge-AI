import { Controller, Get, Post, Body, Headers, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private prisma: PrismaService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Handle Clerk webhook events' })
  async handleWebhook(
    @Body() body: any,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
  ) {
    // In production, verify webhook signature with CLERK_WEBHOOK_SECRET
    const eventType = body.type;
    const data = body.data;

    this.logger.log(`Clerk webhook received: ${eventType}`);

    switch (eventType) {
      case 'user.created':
        await this.prisma.user.upsert({
          where: { clerkId: data.id },
          update: {
            email: data.email_addresses?.[0]?.email_address || '',
            name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || null,
            avatarUrl: data.image_url || null,
          },
          create: {
            clerkId: data.id,
            email: data.email_addresses?.[0]?.email_address || '',
            name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || null,
            avatarUrl: data.image_url || null,
          },
        });
        break;

      case 'user.updated':
        await this.prisma.user.updateMany({
          where: { clerkId: data.id },
          data: {
            email: data.email_addresses?.[0]?.email_address || undefined,
            name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || undefined,
            avatarUrl: data.image_url || undefined,
          },
        });
        break;

      case 'user.deleted':
        await this.prisma.user.deleteMany({
          where: { clerkId: data.id },
        });
        break;
    }

    return { received: true };
  }

  @Get('me')
  @ApiOperation({ description: 'Get current user profile' })
  async getProfile(@CurrentUser() user: any) {
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      organizationId: user.organizationId,
      role: user.role,
      memberships: user.memberships?.map((m: any) => ({
        id: m.id,
        role: m.role,
        organization: {
          id: m.organization.id,
          name: m.organization.name,
          slug: m.organization.slug,
          plan: m.organization.plan,
        },
      })),
    };
  }
}
