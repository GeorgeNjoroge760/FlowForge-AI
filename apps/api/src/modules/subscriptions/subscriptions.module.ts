import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';

@Module({
  controllers: [SubscriptionsController, BillingController],
  providers: [SubscriptionsService, BillingService],
  exports: [SubscriptionsService, BillingService],
})
export class SubscriptionsModule {}
