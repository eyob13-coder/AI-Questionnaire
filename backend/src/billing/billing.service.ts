import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const PLAN_LIMITS: Record<
    string,
    { questions: number; questionnaires: number; documents: number; members: number; price: string }
> = {
    TRIAL: { questions: 100, questionnaires: 3, documents: 5, members: 3, price: '$0' },
    STARTER: { questions: 500, questionnaires: 5, documents: 10, members: 1, price: '$49' },
    PRO: { questions: 5000, questionnaires: 9999, documents: 100, members: 10, price: '$149' },
    ENTERPRISE: { questions: 999999, questionnaires: 999999, documents: 999999, members: 999, price: 'Custom' },
};

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
}
