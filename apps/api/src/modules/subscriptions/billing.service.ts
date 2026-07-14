import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../../prisma/prisma.service';
const PLAN_LIMITS: Record<
  string,
  { executions: number; aiTokens: number; apiCalls: number }
> = {
  FREE: { executions: 100, aiTokens: 10_000, apiCalls: 1_000 },
  PRO: { executions: 10_000, aiTokens: 100_000, apiCalls: 100_000 },
  BUSINESS: { executions: 100_000, aiTokens: 1_000_000, apiCalls: 1_000_000 },
  ENTERPRISE: { executions: Infinity, aiTokens: Infinity, apiCalls: Infinity },
};

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      this.logger.warn('STRIPE_SECRET_KEY is not set. Billing features are disabled.');
    }
    this.stripe = new Stripe(secretKey ?? '', {
      apiVersion: '2025-06-30.basil' as any,
    });
  }

  private getStripe(): Stripe {
    if (!this.config.get<string>('STRIPE_SECRET_KEY')) {
      throw new BadRequestException('Stripe is not configured');
    }
    return this.stripe;
  }

  async createCheckoutSession(
    organizationId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ url: string }> {
    const stripe = this.getStripe();
    const customer = await this.getOrCreateCustomer(organizationId);

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { organizationId },
      subscription_data: {
        metadata: { organizationId },
      },
    });

    if (!session.url) {
      throw new InternalServerErrorException('Failed to create checkout session');
    }

    return { url: session.url };
  }

  async createCustomerPortalSession(
    organizationId: string,
    returnUrl: string,
  ): Promise<{ url: string }> {
    const stripe = this.getStripe();
    const customer = await this.getOrCreateCustomer(organizationId);

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: returnUrl,
    });

    if (!session.url) {
      throw new InternalServerErrorException('Failed to create portal session');
    }

    return { url: session.url };
  }

  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        this.logger.debug(`Unhandled webhook event type: ${event.type}`);
    }
  }

  async getCurrentSubscription(organizationId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { organizationId },
    });

    if (!subscription) {
      return null;
    }

    const usage = await this.getCurrentUsage(organizationId);
    const limits = PLAN_LIMITS[subscription.plan];

    return {
      ...subscription,
      usage,
      limits,
    };
  }

  async checkUsageLimits(
    organizationId: string,
  ): Promise<{ allowed: boolean; usage: Record<string, number>; limits: Record<string, number> }> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { organizationId },
    });

    const plan = subscription?.plan ?? 'FREE';
    const limits = PLAN_LIMITS[plan];
    const usage = await this.getCurrentUsage(organizationId);

    const allowed =
      usage.executions < limits.executions &&
      usage.aiTokens < limits.aiTokens &&
      usage.apiCalls < limits.apiCalls;

    return { allowed, usage, limits };
  }

  async upgradePlan(
    organizationId: string,
    newPlan: string,
  ): Promise<{ url?: string; subscription: any }> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { organizationId },
    });

    if (!subscription) {
      throw new NotFoundException('No subscription found for this organization');
    }

    if (newPlan === 'FREE') {
      return this.downgradeToFree(organizationId, subscription);
    }

    const priceId = this.getPriceIdForPlan(newPlan);
    if (!priceId) {
      throw new BadRequestException(`No Stripe price configured for plan: ${newPlan}`);
    }

    const stripe = this.getStripe();

    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        items: [{ id: (await this.getStripeSubscriptionItem(subscription.stripeSubscriptionId)), price: priceId }],
        proration_behavior: 'create_prorations',
      });

      const updated = await this.prisma.subscription.update({
        where: { organizationId },
        data: { plan: newPlan, stripePriceId: priceId },
      });

      await this.prisma.organization.update({
        where: { id: organizationId },
        data: { plan: newPlan },
      });

      return { subscription: updated };
    }

    const customer = await this.getOrCreateCustomer(organizationId);
    const successUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${successUrl}/billing?upgraded=true`,
      cancel_url: `${successUrl}/billing?cancelled=true`,
      metadata: { organizationId },
      subscription_data: {
        metadata: { organizationId },
      },
    });

    if (!session.url) {
      throw new InternalServerErrorException('Failed to create upgrade session');
    }

    return { url: session.url, subscription };
  }

  async createWebhookEvent(
    payload: Buffer,
    signature: string,
  ): Promise<Stripe.Event> {
    const stripe = this.getStripe();
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      throw new BadRequestException('Stripe webhook secret is not configured');
    }

    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  private async getOrCreateCustomer(organizationId: string): Promise<Stripe.Customer> {
    const stripe = this.getStripe();
    const existing = await this.prisma.subscription.findUnique({
      where: { organizationId },
      select: { stripeCustomerId: true },
    });

    if (existing?.stripeCustomerId) {
      const customer = await stripe.customers.retrieve(existing.stripeCustomerId);
      if (!customer.deleted) {
        return customer as Stripe.Customer;
      }
    }

    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true, slug: true },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const customer = await stripe.customers.create({
      name: organization.name,
      metadata: { organizationId, slug: organization.slug },
    });

    await this.prisma.subscription.upsert({
      where: { organizationId },
      update: { stripeCustomerId: customer.id },
      create: {
        organizationId,
        stripeCustomerId: customer.id,
        plan: 'FREE',
        status: 'active',
      },
    });

    return customer;
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const organizationId = session.metadata?.organizationId;
    if (!organizationId) {
      this.logger.warn('Checkout session missing organizationId metadata');
      return;
    }

    const subscriptionId = session.subscription as string;
    if (!subscriptionId) return;

    const stripe = this.getStripe();
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = stripeSubscription.items.data[0]?.price?.id;

    await this.prisma.subscription.upsert({
      where: { organizationId },
      update: {
        stripeSubscriptionId: subscriptionId,
        stripePriceId: priceId ?? null,
        status: stripeSubscription.status,
        plan: this.getPlanFromPriceId(priceId),
        currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      },
      create: {
        organizationId,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: subscriptionId,
        stripePriceId: priceId ?? null,
        status: stripeSubscription.status,
        plan: this.getPlanFromPriceId(priceId),
        currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      },
    });

    const plan = this.getPlanFromPriceId(priceId);
    await this.prisma.organization.update({
      where: { id: organizationId },
      data: { plan },
    });

    this.logger.log(`Subscription created/updated for org ${organizationId}: ${plan}`);
  }

  private async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription): Promise<void> {
    const organizationId = stripeSubscription.metadata?.organizationId;
    if (!organizationId) {
      this.logger.warn('Subscription update missing organizationId metadata');
      return;
    }

    const priceId = stripeSubscription.items.data[0]?.price?.id;

    await this.prisma.subscription.upsert({
      where: { organizationId },
      update: {
        status: stripeSubscription.status,
        plan: this.getPlanFromPriceId(priceId),
        currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        stripePriceId: priceId ?? null,
      },
      create: {
        organizationId,
        stripeCustomerId: stripeSubscription.customer as string,
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: priceId ?? null,
        status: stripeSubscription.status,
        plan: this.getPlanFromPriceId(priceId),
        currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      },
    });

    const plan = this.getPlanFromPriceId(priceId);
    await this.prisma.organization.update({
      where: { id: organizationId },
      data: { plan },
    });

    this.logger.log(`Subscription updated for org ${organizationId}: status=${stripeSubscription.status}, plan=${plan}`);
  }

  private async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription): Promise<void> {
    const organizationId = stripeSubscription.metadata?.organizationId;
    if (!organizationId) {
      this.logger.warn('Subscription deletion missing organizationId metadata');
      return;
    }

    await this.prisma.subscription.update({
      where: { organizationId },
      data: {
        status: 'canceled',
        plan: 'FREE',
        stripeSubscriptionId: null,
        stripePriceId: null,
        cancelAtPeriodEnd: false,
      },
    });

    await this.prisma.organization.update({
      where: { id: organizationId },
      data: { plan: 'FREE' },
    });

    this.logger.log(`Subscription canceled for org ${organizationId}, downgraded to FREE`);
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = invoice.subscription as string;
    if (!subscriptionId) return;

    const stripe = this.getStripe();
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    const organizationId = stripeSubscription.metadata?.organizationId;

    if (!organizationId) return;

    await this.prisma.subscription.update({
      where: { organizationId },
      data: { status: 'past_due' },
    });

    this.logger.warn(`Payment failed for org ${organizationId}, subscription marked as past_due`);
  }

  private async getCurrentUsage(organizationId: string) {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const usage = await this.prisma.usage.findUnique({
      where: { organizationId_period: { organizationId, period } },
    });

    return {
      executions: usage?.executions ?? 0,
      aiTokens: usage?.aiTokens ?? 0,
      apiCalls: usage?.apiCalls ?? 0,
    };
  }

  private getPriceIdForPlan(plan: string): string | null {
    switch (plan) {
      case 'PRO':
        return this.config.get<string>('STRIPE_PRICE_PRO') ?? null;
      case 'BUSINESS':
        return this.config.get<string>('STRIPE_PRICE_BUSINESS') ?? null;
      default:
        return null;
    }
  }

  private getPlanFromPriceId(priceId: string | null | undefined): string {
    if (!priceId) return 'FREE';
    if (priceId === this.config.get<string>('STRIPE_PRICE_PRO')) return 'PRO';
    if (priceId === this.config.get<string>('STRIPE_PRICE_BUSINESS')) return 'BUSINESS';
    return 'FREE';
  }

  private async getStripeSubscriptionItem(subscriptionId: string): Promise<string> {
    const stripe = this.getStripe();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription.items.data[0].id;
  }

  private async downgradeToFree(
    organizationId: string,
    subscription: any,
  ): Promise<{ subscription: any }> {
    const stripe = this.getStripe();

    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    }

    const updated = await this.prisma.subscription.update({
      where: { organizationId },
      data: {
        plan: 'FREE',
        status: 'canceled',
        stripeSubscriptionId: null,
        stripePriceId: null,
        cancelAtPeriodEnd: false,
      },
    });

    await this.prisma.organization.update({
      where: { id: organizationId },
      data: { plan: 'FREE' },
    });

    return { subscription: updated };
  }
}
