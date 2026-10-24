import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { BillingService } from './billing.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import type { Request } from 'express';

@ApiTags('Billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workspaces/:workspaceId/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get()
  @Roles(Role.OWNER, Role.EDITOR, Role.VIEWER)
  @ApiOperation({ summary: 'Get billing plan, Polar status, and usage' })
  async getBilling(@Param('workspaceId') workspaceId: string) {
    return this.billingService.getBilling(workspaceId);
  }

  @Post('checkout')
  @Roles(Role.OWNER, Role.EDITOR)
  @ApiOperation({ summary: 'Create Polar.sh checkout session for Single Deal Pass or Pro plan' })
  async createCheckout(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.billingService.createCheckoutSession(workspaceId, userId, dto);
  }

  @Post('portal')
  @Roles(Role.OWNER, Role.EDITOR)
  @ApiOperation({ summary: 'Create Polar Customer Portal session for EU VAT invoices & payment methods' })
  async createCustomerPortal(@Param('workspaceId') workspaceId: string) {
    return this.billingService.createCustomerPortalSession(workspaceId);
  }

  @Post('questionnaires/:questionnaireId/unlock')
  @Roles(Role.OWNER, Role.EDITOR)
  @ApiOperation({ summary: 'Unlock questionnaire export using available Single Deal Pass credit' })
  async unlockQuestionnaire(
    @Param('workspaceId') workspaceId: string,
    @Param('questionnaireId') questionnaireId: string,
  ) {
    return this.billingService.unlockQuestionnaireWithCredit(workspaceId, questionnaireId);
  }
}

@ApiTags('Billing Webhook')
@Controller('billing')
export class BillingWebhookController {
  constructor(private readonly billingService: BillingService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Public webhook endpoint for Polar.sh events' })
  async handleWebhook(
    @Body() payload: any,
    @Headers() headers: Record<string, string>,
    @Req() req: Request,
  ) {
    return this.billingService.handleWebhook(payload, headers);
  }
}
