import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { RagService } from '../../rag/rag.service';

export interface QuestionnaireGenerationJobData {
  questionnaireId: string;
  workspaceId: string;
  questionsText: string[];
}

@Processor('questionnaire-generation')
export class QuestionnaireGenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(
    QuestionnaireGenerationProcessor.name,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly ragService: RagService,
  ) {
    super();
  }

  async process(job: Job<QuestionnaireGenerationJobData>): Promise<void> {
    const { questionnaireId, workspaceId, questionsText } = job.data;
    this.logger.log(
      `Generating answers for questionnaire ${questionnaireId} [job ${job.id}]`,
    );

    try {
      // Update status to generating
      await this.prisma.questionnaire.update({
        where: { id: questionnaireId },
        data: { status: 'GENERATING' },
      });

      let answeredCount = 0;

      for (let i = 0; i < questionsText.length; i++) {
        const questionText = questionsText[i];

        // A. Embed the question
        const questionEmbedding =
          await this.ragService.generateEmbedding(questionText);

        // B. Perform similarity search with tenant isolation
        const searchResults = await this.prisma.$queryRaw<
          { content: string; document_id: string; similarity: number }[]
        >`
          SELECT 
              dc.content, 
              dc.document_id,
              1 - (dc.embedding <=> ${questionEmbedding}::vector) as similarity
          FROM document_chunks dc
          JOIN documents d ON d.id = dc.document_id
          WHERE d.workspace_id = ${workspaceId} AND d.status = 'READY'
          ORDER BY dc.embedding <=> ${questionEmbedding}::vector
          LIMIT 5
        `;

        const contextTexts = searchResults.map((r) => r.content);

        // C. Generate answer using Gemini
        const result = await this.ragService.generateAnswer(
          questionText,
          contextTexts,
        );

        // D. Save question and answer
        await this.prisma.question.create({
          data: {
            questionnaireId,
            questionText,
            answerText: result.answer,
            confidence: result.confidence,
            rowIndex: i,
            status: result.confidence > 85 ? 'APPROVED' : 'REVIEW',
          },
        });

        answeredCount++;

        // E. Update progress
        await this.prisma.questionnaire.update({
          where: { id: questionnaireId },
          data: { answeredCount },
        });

        await job.updateProgress(
          Math.round((answeredCount / questionsText.length) * 100),
        );
      }

      // Mark as completed
      await this.prisma.questionnaire.update({
        where: { id: questionnaireId },
        data: { status: 'REVIEW' },
      });

      this.logger.log(
        `✅ Questionnaire ${questionnaireId} — ${answeredCount} answers generated`,
      );
    } catch (error: unknown) {
      this.logger.error(
        `❌ Questionnaire ${questionnaireId} generation failed`,
        error,
      );
      // Don't update status to FAILED here — partial progress is still useful
      throw error;
    }
  }
}
