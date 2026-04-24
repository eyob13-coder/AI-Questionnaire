import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PLAN_LIMITS } from './billing.constants';

@Injectable()
export class BillingService {
    constructor(private readonly prisma: PrismaService) { }

    async getBilling(workspaceId: string) {
        const ws = await this.prisma.workspace.findUnique({
            where: { id: workspaceId },
        });
        if (!ws) throw new NotFoundException('Workspace not found');

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

        const limits = PLAN_LIMITS[ws.plan] ?? PLAN_LIMITS.TRIAL;
        return {
            plan: ws.plan,
            price: limits.price,
            trialEndsAt: ws.trialEndsAt,
            stripeCustomerId: ws.stripeCustomerId,
            features: {
                support: limits.support,
                hasSSO: limits.hasSSO,
                hasSLA: limits.hasSLA,
            },
            usage: {
                questionsUsed: questionsThisMonth,
                questionsLimit: limits.questions,
                questionnairesUsed: questionnairesProcessed,
                questionnairesLimit: limits.questionnaires,
                documentsLimit: limits.documents,
                membersLimit: limits.members,
            },
        };
    }

    async checkLimit(
        workspaceId: string,
        limitType: 'questions' | 'questionnaires' | 'documents' | 'members',
        requiredAmount: number = 1
    ): Promise<void> {
        const ws = await this.prisma.workspace.findUnique({
            where: { id: workspaceId },
        });
        if (!ws) throw new NotFoundException('Workspace not found');

        const limits = PLAN_LIMITS[ws.plan] ?? PLAN_LIMITS.TRIAL;
        const limit = limits[limitType];

        // -1 means unlimited
        if (limit === -1) return;

        let currentUsage = 0;

        if (limitType === 'members') {
            currentUsage = await this.prisma.workspaceMember.count({ where: { workspaceId } });
        } else if (limitType === 'documents') {
            currentUsage = await this.prisma.document.count({ where: { workspaceId } });
        } else {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            if (limitType === 'questionnaires') {
                currentUsage = await this.prisma.questionnaire.count({
                    where: { workspaceId, createdAt: { gte: startOfMonth } },
                });
            } else if (limitType === 'questions') {
                currentUsage = await this.prisma.question.count({
                    where: {
                        questionnaire: { workspaceId },
                        createdAt: { gte: startOfMonth },
                    },
                });
            }
        }

        if (currentUsage + requiredAmount > limit) {
            throw new HttpException(
                `Plan limit reached for ${limitType}. You have used ${currentUsage} out of ${limit}. Please upgrade your plan.`,
                HttpStatus.PAYMENT_REQUIRED
            );
        }
    }
}
