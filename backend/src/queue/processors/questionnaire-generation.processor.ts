import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { AiQuotaExceededError, RagService } from '../../rag/rag.service';

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

  private extractKeywords(input: string): string[] {
    const stopWords = new Set([
      'the',
      'and',
      'for',
      'with',
      'that',
      'this',
      'from',
      'your',
      'you',
      'are',
      'our',
      'what',
      'when',
      'where',
      'which',
      'how',
      'why',
      'who',
      'does',
      'have',
      'has',
      'about',
      'into',
      'onto',
      'their',
      'they',
      'them',
      'can',
      'will',
      'would',
      'should',
    ]);

    return Array.from(
      new Set(
        input
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, ' ')
          .split(/\s+/)
          .filter((word) => word.length >= 4 && !stopWords.has(word))
          .slice(0, 8),
      ),
    );
  }

  private async findContextWithoutEmbeddings(
    workspaceId: string,
    questionText: string,
  ): Promise<string[]> {
    const chunks = await this.prisma.$queryRaw<
      { content: string; created_at: Date }[]
    >`
      SELECT dc.content, dc.created_at
      FROM document_chunks dc
      JOIN documents d ON d.id = dc.document_id
      WHERE d.workspace_id = ${workspaceId} AND d.status = 'READY'
      ORDER BY dc.created_at DESC
      LIMIT 250
    `;

    if (chunks.length === 0) return [];

    const keywords = this.extractKeywords(questionText);
    const scored = chunks
      .map((chunk) => {
        const text = chunk.content.toLowerCase();
        let score = 0;

        for (const keyword of keywords) {
          if (text.includes(keyword)) score += 1;
        }

        return { ...chunk, score };
      })
      .sort((a, b) => b.score - a.score);

    const matched = scored.filter((item) => item.score > 0).slice(0, 5);
    if (matched.length > 0) {
      return matched.map((item) => item.content);
    }

    return scored.slice(0, 3).map((item) => item.content);
  }

  private async saveAnswerForRow(params: {
    questionnaireId: string;
    rowIndex: number;
    questionText: string;
    answerText: string | null;
    confidence: number | null;
    status: 'DRAFT' | 'REVIEW' | 'APPROVED';
  }) {
    const {
      questionnaireId,
      rowIndex,
      questionText,
      answerText,
      confidence,
      status,
    } = params;

    const updated = await this.prisma.question.updateMany({
      where: {
        questionnaireId,
        rowIndex,
      },
      data: {
        questionText,
        answerText,
        confidence,
        status,
      },
    });

    if (updated.count === 0) {
      await this.prisma.question.create({
        data: {
          questionnaireId,
          rowIndex,
          questionText,
          answerText,
          confidence,
          status,
        },
      });
    }
  }

  private quotaDraftMessage(retryAfterSeconds: number | null): string {
    if (retryAfterSeconds && retryAfterSeconds > 0) {
      return `AI quota is temporarily exceeded. Retry after about ${retryAfterSeconds} seconds, or upgrade billing limits.`;
    }

    return 'AI quota is exceeded for this project. Enable billing or raise limits, then retry generation.';
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
      let vectorSearchAvailable = true;
      let quotaBlocked = false;

      for (let i = 0; i < questionsText.length; i++) {
        if (quotaBlocked) {
          break;
        }

        const questionText = questionsText[i];

        try {
          let contextTexts: string[] = [];

          // A. Prefer vector search, but degrade gracefully if embeddings fail.
          if (vectorSearchAvailable) {
            try {
              const questionEmbedding =
                await this.ragService.generateEmbedding(questionText);

              const searchResults = await this.prisma.$queryRaw<
                { content: string; document_id: string; similarity: number }[]
              >`
                SELECT 
                    dc.content, 
                    dc.document_id,
                    1 - (dc.embedding <=> ${questionEmbedding}::vector) as similarity
                FROM document_chunks dc
                JOIN documents d ON d.id = dc.document_id
                WHERE d.workspace_id = ${workspaceId}
                  AND d.status = 'READY'
                  AND dc.embedding IS NOT NULL
                ORDER BY dc.embedding <=> ${questionEmbedding}::vector
                LIMIT 5
              `;

              contextTexts = searchResults.map((r) => r.content);
            } catch (embeddingError) {
              vectorSearchAvailable = false;
              this.logger.warn(
                `Embedding unavailable for questionnaire ${questionnaireId}; switching to keyword fallback retrieval.`,
              );
              contextTexts = await this.findContextWithoutEmbeddings(
                workspaceId,
                questionText,
              );
            }
          } else {
            contextTexts = await this.findContextWithoutEmbeddings(
              workspaceId,
              questionText,
            );
          }

          // B. Generate answer using Gemini
          const result = await this.ragService.generateAnswer(
            questionText,
            contextTexts,
          );

          // C. Upsert answer into pre-created row (or create if missing)
          await this.saveAnswerForRow({
            questionnaireId,
            rowIndex: i,
            questionText,
            answerText: result.answer,
            confidence: result.confidence,
            status: result.confidence > 85 ? 'APPROVED' : 'REVIEW',
          });

          answeredCount++;
        } catch (questionError) {
          if (questionError instanceof AiQuotaExceededError) {
            const quotaMessage = this.quotaDraftMessage(
              questionError.retryAfterSeconds,
            );

            this.logger.warn(
              `AI quota exceeded for questionnaire ${questionnaireId}; stopping remaining generation.`,
            );

            await this.saveAnswerForRow({
              questionnaireId,
              rowIndex: i,
              questionText,
              answerText: quotaMessage,
              confidence: null,
              status: 'DRAFT',
            });

            for (let j = i + 1; j < questionsText.length; j++) {
              await this.saveAnswerForRow({
                questionnaireId,
                rowIndex: j,
                questionText: questionsText[j],
                answerText: quotaMessage,
                confidence: null,
                status: 'DRAFT',
              });
            }

            quotaBlocked = true;
          } else {
            this.logger.warn(
              `Question ${i + 1}/${questionsText.length} failed for questionnaire ${questionnaireId}`,
            );

            // Preserve the question row even if generation failed for this item.
            await this.saveAnswerForRow({
              questionnaireId,
              rowIndex: i,
              questionText,
              answerText:
                'AI could not generate an answer for this question yet. Please review manually and retry later.',
              confidence: null,
              status: 'DRAFT',
            });
          }
        }

        // E. Update progress by processed row count to keep UI moving.
        await this.prisma.questionnaire.update({
          where: { id: questionnaireId },
          data: { answeredCount },
        });

        if (quotaBlocked) {
          await job.updateProgress(100);
        } else {
          await job.updateProgress(
            Math.round(((i + 1) / questionsText.length) * 100),
          );
        }
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
