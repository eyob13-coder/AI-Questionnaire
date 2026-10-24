import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
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

  @OnWorkerEvent('error')
  onError(error: Error) {
    // Suppress unhandled AggregateError when Redis is offline in local dev
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
    auditorCritique?: string | null;
    verifiedFromVault?: boolean;
  }) {
    const {
      questionnaireId,
      rowIndex,
      questionText,
      answerText,
      confidence,
      status,
      auditorCritique,
      verifiedFromVault,
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
        auditorCritique: auditorCritique ?? null,
        verifiedFromVault: verifiedFromVault ?? false,
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
          auditorCritique: auditorCritique ?? null,
          verifiedFromVault: verifiedFromVault ?? false,
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

      const CONCURRENCY = 1; // NVIDIA free tier will likely hang or rate limit if >1
      for (let i = 0; i < questionsText.length; i += CONCURRENCY) {
        if (quotaBlocked) {
          break;
        }

        const batch = questionsText.slice(i, i + CONCURRENCY);
        
        await Promise.all(batch.map(async (questionText, batchIdx) => {
          if (quotaBlocked) return;
          const actualIndex = i + batchIdx;

          try {
            // Feature 4: "Fix Once, Remember Forever" (Knowledge Vault Memory Loop)
            // If an answer was previously approved by the team in the Knowledge Vault, retrieve it first with "Previously Approved by Your Team"
            const vaultItems = await this.prisma.knowledgeVaultItem.findMany({
              where: { workspaceId },
              orderBy: { lastVerifiedAt: 'desc' },
              take: 50,
            });

            let matchedVault = null;
            const cleanQ = questionText.toLowerCase().trim();
            for (const item of vaultItems) {
              const itemQ = item.questionText.toLowerCase().trim();
              if (cleanQ === itemQ || cleanQ.includes(itemQ) || itemQ.includes(cleanQ)) {
                matchedVault = item;
                break;
              }
              const qWords = cleanQ.split(/\s+/).filter((w) => w.length > 4);
              const matchedWords = qWords.filter((w) => itemQ.includes(w));
              if (qWords.length >= 3 && matchedWords.length / qWords.length >= 0.7) {
                matchedVault = item;
                break;
              }
            }

            if (matchedVault) {
              await this.saveAnswerForRow({
                questionnaireId,
                rowIndex: actualIndex,
                questionText,
                answerText: matchedVault.answerText,
                confidence: 99,
                status: 'APPROVED',
                auditorCritique: 'Previously Approved by Your Team in Knowledge Vault',
                verifiedFromVault: true,
              });

              const qRow = await this.prisma.question.findFirst({
                where: { questionnaireId, rowIndex: actualIndex },
              });
              if (qRow) {
                await this.prisma.citation.create({
                  data: {
                    questionId: qRow.id,
                    sourceDocument: 'Workspace Knowledge Vault (Human Verified)',
                    pageNumber: 1,
                    excerpt: `Verified by team member: "${matchedVault.answerText.slice(0, 160)}"`,
                  },
                });
              }

              answeredCount++;
              return;
            }

            let contextTexts: string[] = [];

            if (vectorSearchAvailable) {
              try {
                const questionEmbedding = await this.ragService.generateEmbedding(questionText);
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
                this.logger.warn(`Embedding unavailable for questionnaire ${questionnaireId}; switching to keyword fallback retrieval.`);
                contextTexts = await this.findContextWithoutEmbeddings(workspaceId, questionText);
              }
            } else {
              contextTexts = await this.findContextWithoutEmbeddings(workspaceId, questionText);
            }

            const result = await this.ragService.generateAnswer(questionText, contextTexts);

            // STRICT GUARDRAIL: Never display a guessed or hallucinated answer when confidence is < 50% or unsupported
            const isMissingEvidence = result.confidence < 50 || result.auditStatus === 'UNSUPPORTED';
            const finalAnswer = isMissingEvidence ? null : result.answer;
            const finalCritique = isMissingEvidence
              ? 'Vaultix refused to guess because no uploaded document covers this topic.'
              : result.auditNotes || 'Verified by Dual-Model Audit against cited documentation.';

            await this.saveAnswerForRow({
              questionnaireId,
              rowIndex: actualIndex,
              questionText,
              answerText: finalAnswer,
              confidence: result.confidence,
              status: isMissingEvidence ? 'DRAFT' : result.confidence >= 85 ? 'APPROVED' : 'REVIEW',
              auditorCritique: finalCritique,
              verifiedFromVault: false,
            });

            if (finalAnswer !== null) {
              answeredCount++;
            }
          } catch (questionError) {
            if (questionError instanceof AiQuotaExceededError) {
              quotaBlocked = true;
              const quotaMessage = this.quotaDraftMessage(questionError.retryAfterSeconds);
              this.logger.warn(`AI quota exceeded for questionnaire ${questionnaireId}; stopping remaining generation.`);
              
              await this.saveAnswerForRow({
                questionnaireId,
                rowIndex: actualIndex,
                questionText,
                answerText: quotaMessage,
                confidence: null,
                status: 'DRAFT',
              });
            } else {
              this.logger.warn(`Error generating answer for question [${actualIndex}]`, questionError as Error);
              await this.saveAnswerForRow({
                questionnaireId,
                rowIndex: actualIndex,
                questionText,
                answerText: null,
                confidence: null,
                status: 'DRAFT',
              });
            }
          }
        }));

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
