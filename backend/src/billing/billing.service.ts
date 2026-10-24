import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PLAN_LIMITS,
  POLAR_PRICING,
  OrderStatus,
  PlanTier,
  PurchaseType,
} from './billing.constants';
import { Polar } from './polar.client';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly polar: Polar;
  private readonly db: any;

  constructor(private readonly prisma: PrismaService) {
    this.db = prisma;
    this.polar = new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
      server: process.env.POLAR_ENV === 'production' ? 'production' : 'sandbox',
    });
  }

  async getBilling(workspaceId: string) {
    let ws: any = await this.db.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        billingOrders: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
    if (!ws) throw new NotFoundException('Workspace not found');

    // Auto-sync pending orders with Polar in case webhook was delayed or dropped
    const pendingOrders = ws.billingOrders?.filter(
      (o: any) => o.status === OrderStatus.PENDING && o.polarCheckoutId,
    );
    if (pendingOrders && pendingOrders.length > 0) {
      for (const order of pendingOrders) {
        try {
          const checkout = await this.polar.checkouts.get(order.polarCheckoutId);
          if (checkout && (checkout.status === 'succeeded' || checkout.status === 'confirmed')) {
            await this.fulfillOrder(order, checkout);
          }
        } catch {
          // ignore sync failure
        }
      }
      ws = await this.db.workspace.findUnique({
        where: { id: workspaceId },
        include: {
          billingOrders: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [questionsThisMonth, questionnairesProcessed] = await Promise.all([
      this.prisma.question.count({
        where: {
          questionnaire: { workspaceId },
          createdAt: { gte: startOfMonth },
        },
      }),
      this.prisma.questionnaire.count({
        where: { workspaceId, createdAt: { gte: startOfMonth } },
      }),
    ]);

    const isPro = ws.plan === PlanTier.PRO && ws.subscriptionStatus !== 'canceled';
    const limits = PLAN_LIMITS[ws.plan] ?? PLAN_LIMITS.FREE;

    return {
      plan: ws.plan,
      isPro,
      exportCredits: ws.exportCredits ?? 0,
      price: limits.price,
      trialEndsAt: ws.trialEndsAt,
      polarCustomerId: ws.polarCustomerId,
      polarSubscriptionId: ws.polarSubscriptionId,
      subscriptionStatus: ws.subscriptionStatus || (isPro ? 'active' : 'inactive'),
      currentPeriodEnd: ws.currentPeriodEnd,
      pricing: {
        singlePass: { amountCents: 4900, currency: 'USD', formatted: '$49' },
        proMonthly: { amountCents: 14900, currency: 'USD', formatted: '$149' },
      },
      features: {
        support: limits.support,
        hasSSO: limits.hasSSO,
        hasSLA: limits.hasSLA,
        unlimitedExports: isPro,
      },
      usage: {
        questionsUsed: questionsThisMonth,
        questionsThisMonth,
        questionsLimit: limits.questions,
        questionnairesUsed: questionnairesProcessed,
        questionnairesProcessed,
        questionnairesLimit: limits.questionnaires,
        documentsLimit: limits.documents,
        membersLimit: limits.members,
        limits: {
          questions: limits.questions,
          questionnaires: limits.questionnaires,
          documents: limits.documents,
          members: limits.members,
          price: limits.price,
        },
      },
      recentOrders: ws.billingOrders || [],
    };
  }

  async createCheckoutSession(
    workspaceId: string,
    userId: string,
    dto: CreateCheckoutDto,
  ) {
    const ws: any = await this.db.workspace.findUnique({ where: { id: workspaceId } });
    if (!ws) throw new NotFoundException('Workspace not found');

    const user: any = await this.db.user.findUnique({ where: { id: userId } });
    const pricing = POLAR_PRICING[dto.purchaseType] ?? POLAR_PRICING[PurchaseType.SINGLE_PASS];

    const frontendBaseUrl =
      process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    let successUrl =
      dto.successUrl ||
      `${frontendBaseUrl}/dashboard/questionnaires${
        dto.questionnaireId ? `/${dto.questionnaireId}` : ''
      }?checkout=success&type=${dto.purchaseType}`;

    if (!successUrl.includes('checkout=')) {
      successUrl += `${successUrl.includes('?') ? '&' : '?'}checkout=success&success=1`;
    }
    if (!successUrl.includes('{CHECKOUT_ID}')) {
      successUrl += `&checkout_id={CHECKOUT_ID}`;
    }

    const returnUrl = dto.returnUrl || `${frontendBaseUrl}/dashboard/billing`;

    const productId =
      dto.purchaseType === PurchaseType.SINGLE_PASS
        ? process.env.POLAR_SINGLE_PASS_PRODUCT_ID || process.env.POLAR_PRODUCT_SINGLE_PASS_ID
        : process.env.POLAR_PRO_PRODUCT_ID || process.env.POLAR_PRODUCT_PRO_SUBSCRIPTION_ID;

    let checkoutId = '';
    let checkoutUrl = '';

    const accessToken = process.env.POLAR_ACCESS_TOKEN;
    const polarClient = new Polar({
      accessToken,
      server: process.env.POLAR_ENV === 'production' ? 'production' : 'sandbox',
    });

    if (accessToken && productId) {
      try {
        const metadata: Record<string, string> = {
          workspaceId,
          purchaseType: dto.purchaseType,
          userId,
        };
        if (dto.questionnaireId && dto.questionnaireId.trim()) {
          metadata.questionnaireId = dto.questionnaireId.trim();
        }

        const checkout = await polarClient.checkouts.create({
          products: [productId],
          customer_email: user?.email || undefined,
          customerEmail: user?.email || undefined,
          success_url: successUrl,
          successUrl,
          return_url: returnUrl,
          returnUrl,
          metadata,
        });
        if (checkout?.id) {
          checkoutId = String(checkout.id);
        }
        if (checkout?.url) {
          checkoutUrl = String(checkout.url);
        }
      } catch (err: any) {
        this.logger.error(`Polar checkout creation error: ${err?.message || err}`);
      }
    }

    if (!checkoutUrl || !checkoutId) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_GATEWAY,
          message: 'Could not create Polar checkout session. Please ensure POLAR_ACCESS_TOKEN and POLAR_SINGLE_PASS_PRODUCT_ID are configured in backend environment.',
          code: 'CHECKOUT_CREATION_FAILED',
        },
        HttpStatus.BAD_GATEWAY,
      );
    }

    // Record pending billing order
    const order = await this.db.billingOrder.create({
      data: {
        workspaceId,
        questionnaireId: dto.questionnaireId || null,
        polarCheckoutId: checkoutId,
        purchaseType: dto.purchaseType,
        amountCents: pricing.amountCents,
        currency: pricing.currency,
        status: OrderStatus.PENDING,
      },
    });

    return {
      orderId: order.id,
      checkoutId,
      checkoutUrl,
      purchaseType: dto.purchaseType,
      amountCents: pricing.amountCents,
      currency: pricing.currency,
    };
  }

  async handleWebhook(rawPayload: any, headers: Record<string, string>) {
    let event = rawPayload;

    // Validate webhook secret if configured
    if (process.env.POLAR_WEBHOOK_SECRET) {
      try {
        event = this.polar.validateWebhook(
          typeof rawPayload === 'string' ? rawPayload : JSON.stringify(rawPayload),
          headers,
          process.env.POLAR_WEBHOOK_SECRET,
        );
      } catch (err) {
        this.logger.warn(`Polar webhook validation warning: ${err}`);
      }
    }

    const eventType = event.type || event.event;
    const data = event.data || event;
    const metadata = data.metadata || data.custom_field_data || {};
    const workspaceId = metadata.workspaceId || metadata.workspace_id;
    const questionnaireId = metadata.questionnaireId || metadata.questionnaire_id;
    const purchaseType = metadata.purchaseType || metadata.purchase_type;

    this.logger.log(`Processing Polar webhook: ${eventType} for workspace ${workspaceId}`);

    if (eventType === 'order.created' || eventType === 'order.paid' || eventType === 'checkout.updated') {
      const checkoutId = data.checkout_id || data.id;
      const orderId = data.order_id || data.id;

      // Update matching order
      if (checkoutId) {
        await this.db.billingOrder
          .updateMany({
            where: { polarCheckoutId: checkoutId },
            data: {
              status: OrderStatus.PAID,
              polarOrderId: orderId ? String(orderId) : undefined,
            },
          })
          .catch(() => null);
      }

      if (workspaceId) {
        if (purchaseType === PurchaseType.SINGLE_PASS || purchaseType === 'SINGLE_PASS') {
          // Unlock questionnaire if specified, otherwise grant export credit
          if (questionnaireId) {
            await this.db.questionnaire
              .update({
                where: { id: questionnaireId },
                data: { isUnlocked: true },
              })
              .catch(() => null);
          }
          await this.db.workspace.update({
            where: { id: workspaceId },
            data: { exportCredits: { increment: 1 } },
          });
        } else if (purchaseType === PurchaseType.PRO_SUBSCRIPTION || purchaseType === 'PRO_SUBSCRIPTION') {
          await this.db.workspace.update({
            where: { id: workspaceId },
            data: {
              plan: PlanTier.PRO,
              subscriptionStatus: 'active',
              polarCustomerId: data.customer_id || data.customerId || null,
              currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : null,
            },
          });
        }
      }
    } else if (
      eventType === 'subscription.created' ||
      eventType === 'subscription.active' ||
      eventType === 'subscription.updated'
    ) {
      if (workspaceId) {
        await this.db.workspace.update({
          where: { id: workspaceId },
          data: {
            plan: PlanTier.PRO,
            subscriptionStatus: 'active',
            polarSubscriptionId: data.id ? String(data.id) : undefined,
            polarCustomerId: data.customer_id ? String(data.customer_id) : undefined,
            currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : null,
          },
        });
      }
    } else if (eventType === 'subscription.canceled' || eventType === 'subscription.revoked') {
      if (workspaceId) {
        await this.db.workspace.update({
          where: { id: workspaceId },
          data: {
            plan: PlanTier.FREE,
            subscriptionStatus: 'canceled',
          },
        });
      }
    }

    return { received: true };
  }

  async createCustomerPortalSession(workspaceId: string) {
    const ws: any = await this.db.workspace.findUnique({ where: { id: workspaceId } });
    if (!ws) throw new NotFoundException('Workspace not found');

    if (ws.polarCustomerId && process.env.POLAR_ACCESS_TOKEN) {
      try {
        const session = await this.polar.customerSessions.create({
          customerId: ws.polarCustomerId,
        });
        return { portalUrl: session.customer_portal_url || session.customerPortalUrl };
      } catch (err: any) {
        this.logger.warn(`Could not create Polar customer portal session: ${err?.message}`);
      }
    }

    // Default portal link or sandbox customer portal
    const serverHost =
      process.env.POLAR_ENV === 'production'
        ? 'https://polar.sh/purchases'
        : 'https://sandbox.polar.sh/purchases';
    return { portalUrl: serverHost };
  }

  async unlockQuestionnaireWithCredit(workspaceId: string, questionnaireId: string) {
    const ws: any = await this.db.workspace.findUnique({ where: { id: workspaceId } });
    if (!ws) throw new NotFoundException('Workspace not found');

    const q: any = await this.db.questionnaire.findUnique({
      where: { id: questionnaireId, workspaceId },
    });
    if (!q) throw new NotFoundException('Questionnaire not found');

    if (ws.plan === PlanTier.PRO || q.isUnlocked) {
      return { success: true, isUnlocked: true, remainingCredits: ws.exportCredits ?? 0 };
    }

    if (!ws.exportCredits || ws.exportCredits <= 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.PAYMENT_REQUIRED,
          message: 'Insufficient deal pass credits. Purchase a Single Deal Pass or upgrade to Pro.',
          code: 'INSUFFICIENT_CREDITS',
          exportCredits: ws.exportCredits ?? 0,
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    // Deduct 1 credit and unlock questionnaire
    const [updatedWs, updatedQ]: any = await this.db.$transaction([
      this.db.workspace.update({
        where: { id: workspaceId },
        data: { exportCredits: { decrement: 1 } },
      }),
      this.db.questionnaire.update({
        where: { id: questionnaireId },
        data: { isUnlocked: true },
      }),
    ]);

    return {
      success: true,
      isUnlocked: updatedQ.isUnlocked,
      remainingCredits: updatedWs.exportCredits,
    };
  }

  async checkQuestionnaireExportAccess(workspaceId: string, questionnaireId: string): Promise<boolean> {
    const ws: any = await this.db.workspace.findUnique({ where: { id: workspaceId } });
    if (!ws) return false;

    if (ws.plan === PlanTier.PRO) return true;

    const q: any = await this.db.questionnaire.findUnique({
      where: { id: questionnaireId, workspaceId },
    });
    return Boolean(q?.isUnlocked);
  }

  async checkLimit(
    workspaceId: string,
    resource: 'questions' | 'questionnaires' | 'documents' | 'members',
    count: number = 1,
  ) {
    const ws: any = await this.db.workspace.findUnique({
      where: { id: workspaceId },
    });
    if (!ws) throw new NotFoundException('Workspace not found');

    const limits = PLAN_LIMITS[ws.plan] ?? PLAN_LIMITS.FREE;
    const limit = limits[resource];

    // -1 means unlimited (e.g. Pro tier)
    if (limit === -1 || limit === undefined) {
      return;
    }

    let current = 0;
    if (resource === 'documents') {
      current = await this.prisma.document.count({ where: { workspaceId } });
    } else if (resource === 'questionnaires') {
      current = await this.prisma.questionnaire.count({ where: { workspaceId } });
    } else if (resource === 'members') {
      current = await this.prisma.workspaceMember.count({ where: { workspaceId } });
    } else if (resource === 'questions') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      current = await this.prisma.question.count({
        where: {
          questionnaire: { workspaceId },
          createdAt: { gte: startOfMonth },
        },
      });
    }

    if (current + count > limit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          error: 'Plan Limit Exceeded',
          message: `Workspace limit for ${resource} reached (${current}/${limit}). Upgrade to Pro to unlock unlimited usage.`,
          code: 'PLAN_LIMIT_EXCEEDED',
          resource,
          current,
          limit,
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  private async fulfillOrder(order: any, checkoutData: any) {
    const purchaseType = order.purchaseType;
    const questionnaireId = order.questionnaireId;
    const workspaceId = order.workspaceId;

    await this.db.billingOrder
      .update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PAID,
          polarOrderId: checkoutData.id ? String(checkoutData.id) : undefined,
        },
      })
      .catch(() => null);

    if (purchaseType === PurchaseType.SINGLE_PASS || purchaseType === 'SINGLE_PASS') {
      if (questionnaireId) {
        await this.db.questionnaire
          .update({
            where: { id: questionnaireId },
            data: { isUnlocked: true },
          })
          .catch(() => null);
      }
      await this.db.workspace.update({
        where: { id: workspaceId },
        data: {
          exportCredits: { increment: 1 },
          polarCustomerId: checkoutData.customer_id ? String(checkoutData.customer_id) : undefined,
        },
      });
      this.logger.log(`Order ${order.id} fulfilled: 1 export credit added to workspace ${workspaceId}`);
    } else if (purchaseType === PurchaseType.PRO_SUBSCRIPTION || purchaseType === 'PRO_SUBSCRIPTION') {
      await this.db.workspace.update({
        where: { id: workspaceId },
        data: {
          plan: PlanTier.PRO,
          subscriptionStatus: 'active',
          polarCustomerId: checkoutData.customer_id ? String(checkoutData.customer_id) : undefined,
          polarSubscriptionId: checkoutData.subscription_id ? String(checkoutData.subscription_id) : undefined,
        },
      });
      this.logger.log(`Order ${order.id} fulfilled: Pro plan activated for workspace ${workspaceId}`);
    }
  }
}

