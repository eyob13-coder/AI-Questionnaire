import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getWorkspaceStats(workspaceId: string) {
    const [questionnairesCount, documentsCount, questionsStats] =
      await Promise.all([
        this.prisma.questionnaire.count({ where: { workspaceId } }),
        this.prisma.document.count({ where: { workspaceId } }),
        this.prisma.question.aggregate({
          where: { questionnaire: { workspaceId } },
          _count: { id: true },
          _avg: { confidence: true },
        }),
      ]);

    // Calculate accepted (Approved) answers ratio
    const approvedQuestions = await this.prisma.question.count({
      where: {
        questionnaire: { workspaceId },
        status: 'APPROVED',
      },
    });

    const totalQuestions = questionsStats._count.id;
    const approvalRate =
      totalQuestions > 0 ? (approvedQuestions / totalQuestions) * 100 : 0;

    // Calculate dummy time saved (e.g. 5 mins per question automated)
    const timeSavedHours = Math.round((approvedQuestions * 5) / 60);

    return {
      totalQuestionnaires: questionnairesCount,
      totalDocuments: documentsCount,
      questionsAnswered: totalQuestions,
      averageConfidence: Math.round(questionsStats._avg.confidence || 0),
      approvalRate: Math.round(approvalRate),
      timeSavedHours,
    };
  }

  async getRecentActivity(workspaceId: string) {
    return this.prisma.questionnaire.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });
  }
}
