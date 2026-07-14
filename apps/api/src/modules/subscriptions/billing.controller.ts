import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Headers,
  RawBodyRequest,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { BillingService } from './billing.service';
import { SubscriptionsService } from './subscriptions.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
@ApiTags('billing')
@ApiBearerAuth()
@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a Stripe checkout session' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['priceId', 'successUrl', 'cancelUrl'],
      properties: {
        priceId: { type: 'string', description: 'Stripe price ID' },
        successUrl: { type: 'string', description: 'URL to redirect on success' },
        cancelUrl: { type: 'string', description: 'URL to redirect on cancellation' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Checkout session URL created' })
  @ApiResponse({ status: 400, description: 'Invalid input or Stripe not configured' })
  async createCheckoutSession(
    @CurrentUser() user: any,
    @Body() body: { priceId: string; successUrl: string; cancelUrl: string },
  ) {
    return this.billingService.createCheckoutSession(
      user.organizationId,
      body.priceId,
      body.successUrl,
      body.cancelUrl,
    );
  }

  @Post('portal')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a Stripe customer portal session' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['returnUrl'],
      properties: {
        returnUrl: { type: 'string', description: 'URL to return to after portal' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Portal session URL created' })
  @ApiResponse({ status: 400, description: 'Stripe not configured' })
  async createPortalSession(
    @CurrentUser() user: any,
    @Body() body: { returnUrl: string },
  ) {
    return this.billingService.createCustomerPortalSession(
      user.organizationId,
      body.returnUrl,
    );
  }

  @Get('subscription')
  @ApiOperation({ summary: 'Get current subscription with usage details' })
  @ApiResponse({ status: 200, description: 'Current subscription returned' })
  async getSubscription(@CurrentUser() user: any) {
    const subscription = await this.billingService.getCurrentSubscription(
      user.organizationId,
    );

    if (!subscription) {
      return this.subscriptionsService.findCurrent(user.organizationId);
    }

    return subscription;
  }

  @Post('upgrade')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upgrade organization plan' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['plan'],
      properties: {
        plan: {
          type: 'string',
          enum: ['FREE', 'PRO', 'BUSINESS', 'ENTERPRISE'],
          description: 'Target plan',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Plan upgrade initiated' })
  @ApiResponse({ status: 400, description: 'Invalid plan' })
  @ApiResponse({ status: 404, description: 'No subscription found' })
  async upgradePlan(
    @CurrentUser() user: any,
    @Body() body: { plan: string },
  ) {
    return this.billingService.upgradePlan(user.organizationId, body.plan);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook handler' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature' })
  async handleWebhook(
    @Req() req: RawBodyRequest<ExpressRequest>,
    @Headers('stripe-signature') signature: string,
  ) {
    const event = await this.billingService.createWebhookEvent(
      req.rawBody!,
      signature,
    );

    await this.billingService.handleWebhookEvent(event);

    return { received: true };
  }
}
