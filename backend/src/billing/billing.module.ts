import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController, BillingWebhookController } from './billing.controller';

@Module({
  controllers: [BillingController, BillingWebhookController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
