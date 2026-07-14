import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current subscription' })
  async getCurrentSubscription(@CurrentUser() user: any) {
    return this.subscriptionsService.findCurrent(user.organizationId);
  }

  @Get()
  @ApiOperation({ summary: 'List all subscriptions' })
  async listSubscriptions(@CurrentUser() user: any) {
    return this.subscriptionsService.findAll(user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription by ID' })
  async getSubscription(@Param('id') id: string, @CurrentUser() user: any) {
    return this.subscriptionsService.findById(id, user.organizationId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a subscription' })
  async createSubscription(
    @CurrentUser() user: any,
    @Body() body: {
      plan: string;
      status?: string;
      currentPeriodStart?: Date;
      currentPeriodEnd?: Date;
      stripeSubscriptionId?: string;
    },
  ) {
    return this.subscriptionsService.create(user.organizationId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a subscription' })
  async updateSubscription(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: {
      plan?: string;
      status?: string;
      currentPeriodStart?: Date;
      currentPeriodEnd?: Date;
      stripeSubscriptionId?: string;
    },
  ) {
    return this.subscriptionsService.update(id, user.organizationId, body);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a subscription' })
  async cancelSubscription(@Param('id') id: string, @CurrentUser() user: any) {
    return this.subscriptionsService.cancel(id, user.organizationId);
  }
}
