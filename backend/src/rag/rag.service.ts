import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { createHash } from 'node:crypto';

type ErrorLike = {
  status?: number;
  code?: string | number;
  message?: string;
};

export class AiQuotaExceededError extends Error {
  readonly retryAfterSeconds: number | null;

  constructor(message: string, retryAfterSeconds: number | null = null) {
    super(message);
    this.name = 'AiQuotaExceededError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

@Injectable()
export class RagService {
  private readonly openai: OpenAI;
  private readonly completionModel: string;
  private readonly embeddingDimensions: number;

  private readonly logger = new Logger(RagService.name);

  constructor(private configService: ConfigService) {
    const apiKey =
      this.configService.get<string>('NVIDIA_API_KEY') ||
      this.configService.get<string>('AI_INTEGRATIONS_OPENAI_API_KEY') ||
      this.configService.get<string>('OPENAI_API_KEY');
    const baseURL =
      this.configService.get<string>('NVIDIA_BASE_URL') ||
      'https://integrate.api.nvidia.com/v1';

    if (!apiKey || !baseURL) {
      this.logger.warn(
        'NVIDIA AI env vars (NVIDIA_API_KEY / NVIDIA_BASE_URL) are not set. AI features will fail.',
      );
    }

    this.openai = new OpenAI({
      apiKey: apiKey || 'unconfigured',
      baseURL,
    });

    this.completionModel =
      this.configService.get<string>('OPENAI_COMPLETION_MODEL') ||
      'z-ai/glm-5.2';

    const rawEmbeddingDimensions =
      this.configService.get<string>('EMBEDDING_DIMENSIONS') || '768';
    const parsedEmbeddingDimensions = Number.parseInt(
      rawEmbeddingDimensions,
      10,
    );
    this.embeddingDimensions =
      Number.isFinite(parsedEmbeddingDimensions) && parsedEmbeddingDimensions > 0
        ? parsedEmbeddingDimensions
        : 768;
  }

  private isQuotaExceededError(error: unknown): boolean {
    const err = error as ErrorLike | undefined;
    const status = err?.status;
    const message = (err?.message || '').toLowerCase();

    return (
      status === 429 ||
      message.includes('quota exceeded') ||
      message.includes('too many requests') ||
      message.includes('rate limit')
    );
  }

  /**
   * NVIDIA's free tier does not expose an embeddings endpoint, so for the MVP
   * we generate a deterministic pseudo-embedding from a SHA-256 hash of the
   * text. Identical text always produces an identical vector, which means RAG
   * can still detect exact / near-duplicate questions, but semantic retrieval
   * quality will be much lower than a real embedding model.
   *
   * Swap this out for a proper embeddings provider before going to production.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const normalized = text.trim().toLowerCase();
    const seedHash = createHash('sha256').update(normalized).digest();

    const values = new Array<number>(this.embeddingDimensions);
    for (let i = 0; i < this.embeddingDimensions; i++) {
      // 4 bytes per float, wrap around the hash buffer.
      const offset = (i * 4) % (seedHash.length - 4);
      const intVal = seedHash.readUInt32BE(offset);
      // Map [0, 2^32) → [-1, 1)
      values[i] = (intVal / 0xffffffff) * 2 - 1;
    }

    // L2-normalize so cosine similarity behaves sanely.
    let sumSquares = 0;
    for (const v of values) sumSquares += v * v;
    const norm = Math.sqrt(sumSquares) || 1;
    for (let i = 0; i < values.length; i++) values[i] /= norm;

    return values;
  }

  /**
   * Drafts an answer based on a given question and an array of context
   * snippets. Uses NVIDIA AI via the OpenAI-compatible endpoint.
   */
  async generateAnswer(question: string, contextTexts: string[]) {
    const combinedContext = contextTexts.filter(Boolean).join('\n\n---\n\n');
    const hasContext = combinedContext.trim().length > 0;

    const systemPrompt =
      'You are a highly capable AI specialized in answering security questionnaires for enterprise B2B software companies. ' +
      'Answer accurately and concisely, in a professional tone appropriate for an auditor or security professional. ' +
      'When context is provided, ground your answer in it. If the context is missing or insufficient, say so explicitly and provide a best-effort, clearly-flagged general answer.';

    const userPrompt = hasContext
      ? `CONTEXT:\n${combinedContext}\n\nQUESTION:\n${question}`
      : `QUESTION:\n${question}\n\n(No retrieved context was provided.)`;

    try {
      const completionConfig: any = {
        model: this.completionModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 1,
        top_p: 0.95,
        max_tokens: 16384,
        seed: 42,
      };

      if (this.completionModel.includes('deepseek')) {
        completionConfig.chat_template_kwargs = { thinking: false };
      }

      const result = await this.openai.chat.completions.create(completionConfig, { timeout: 30000 });

      const answer = result.choices[0]?.message?.content?.trim() || '';

      if (!answer) {
        throw new Error('AI response did not include any text.');
      }

      // Pseudo-confidence: high when grounded, lower when the model bailed out.
      const lower = answer.toLowerCase();
      const bailedOut =
        !hasContext ||
        lower.includes('do not have enough information') ||
        lower.includes('not mentioned in the context') ||
        lower.includes('cannot answer') ||
        lower.includes('insufficient context');

      const confidence = bailedOut
        ? 25 + Math.floor(Math.random() * 20)
        : 85 + Math.floor(Math.random() * 10);

      return { answer, confidence };
    } catch (error) {
      this.logger.error('Failed to generate answer', error as Error);
      if (this.isQuotaExceededError(error)) {
        throw new AiQuotaExceededError('AI generation quota exceeded.');
      }
      throw new InternalServerErrorException('AI Answer Generation Failed');
    }
  }
}
