import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

type ModelCandidate = {
  name: string;
  model: GenerativeModel;
};

type ErrorLike = {
  status?: number;
  code?: string | number;
  message?: string;
  errorDetails?: Array<Record<string, unknown>>;
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
  private readonly genAI: GoogleGenerativeAI;
  private readonly completionModels: ModelCandidate[];
  private readonly embeddingModels: ModelCandidate[];
  private readonly embeddingDimensions: number;

  private resolvedCompletionModelName: string | null = null;
  private resolvedEmbeddingModelName: string | null = null;

  private readonly logger = new Logger(RagService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not set. AI features will fail.');
    }

    // Initialize the Gemini SDK
    this.genAI = new GoogleGenerativeAI(apiKey || 'unconfigured');

    const completionModelNames = this.parseModelNames(
      this.configService.get<string>('GEMINI_COMPLETION_MODELS'),
      ['gemini-2.5-flash', 'gemini-2.0-flash'],
    );

    const embeddingModelNames = this.parseModelNames(
      this.configService.get<string>('GEMINI_EMBEDDING_MODELS'),
      ['gemini-embedding-001', 'text-embedding-004'],
    );

    this.completionModels = completionModelNames.map((name) => ({
      name,
      model: this.genAI.getGenerativeModel({ model: name }),
    }));

    this.embeddingModels = embeddingModelNames.map((name) => ({
      name,
      model: this.genAI.getGenerativeModel({ model: name }),
    }));

    const rawEmbeddingDimensions =
      this.configService.get<string>('EMBEDDING_DIMENSIONS') || '768';
    const parsedEmbeddingDimensions = Number.parseInt(rawEmbeddingDimensions, 10);

    this.embeddingDimensions =
      Number.isFinite(parsedEmbeddingDimensions) && parsedEmbeddingDimensions > 0
        ? parsedEmbeddingDimensions
        : 768;
  }

  private normalizeModelName(input: string): string {
    return input.trim().replace(/^models\//i, '');
  }

  private parseModelNames(input: string | undefined, defaults: string[]): string[] {
    const values = (input || '')
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);

    const normalized = values.map((value) => this.normalizeModelName(value));
    const normalizedDefaults = defaults.map((value) =>
      this.normalizeModelName(value),
    );

    if (normalized.length > 0) {
      return Array.from(new Set([...normalized, ...normalizedDefaults]));
    }

    return normalizedDefaults;
  }

  private getModelCandidates(
    models: ModelCandidate[],
    resolvedModelName: string | null,
  ): ModelCandidate[] {
    if (!resolvedModelName) return models;

    const preferred = models.find((candidate) => candidate.name === resolvedModelName);
    if (!preferred) return models;

    return [preferred, ...models.filter((candidate) => candidate.name !== resolvedModelName)];
  }

  private isModelFallbackError(error: unknown): boolean {
    const err = error as ErrorLike | undefined;
    const status = err?.status;
    const message = (err?.message || '').toLowerCase();

    return (
      status === 404 ||
      status === 400 ||
      status === 429 ||
      message.includes('not found') ||
      message.includes('is not supported') ||
      message.includes('unsupported') ||
      message.includes('quota exceeded') ||
      message.includes('too many requests')
    );
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

  private parseRetryAfterSeconds(error: unknown): number | null {
    const err = error as ErrorLike | undefined;

    const details = Array.isArray(err?.errorDetails) ? err?.errorDetails : [];
    for (const detail of details) {
      const retryDelay = detail?.retryDelay;
      if (typeof retryDelay === 'string') {
        const match = retryDelay.match(/^(\d+)(?:\.\d+)?s$/i);
        if (match) {
          return Number.parseInt(match[1], 10);
        }
      }
    }

    const message = err?.message || '';
    const messageMatch = message.match(/retry in\s+(\d+(?:\.\d+)?)s/i);
    if (messageMatch) {
      return Math.ceil(Number.parseFloat(messageMatch[1]));
    }

    return null;
  }

  private normalizeEmbedding(values: number[]): number[] {
    if (values.length === this.embeddingDimensions) {
      return values;
    }

    if (values.length > this.embeddingDimensions) {
      return values.slice(0, this.embeddingDimensions);
    }

    return values.concat(
      Array.from(
        { length: this.embeddingDimensions - values.length },
        () => 0,
      ),
    );
  }

  /**
   * Generates a dense vector embedding for a piece of text.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const candidates = this.getModelCandidates(
      this.embeddingModels,
      this.resolvedEmbeddingModelName,
    );

    let lastError: unknown = null;

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];

      try {
        const result = await candidate.model.embedContent(text);
        const rawValues = result.embedding?.values || [];
        if (!rawValues.length) {
          throw new Error('Embedding response did not include values.');
        }

        if (this.resolvedEmbeddingModelName !== candidate.name) {
          this.resolvedEmbeddingModelName = candidate.name;
          this.logger.log(`Using embedding model: ${candidate.name}`);
        }

        return this.normalizeEmbedding(rawValues);
      } catch (error) {
        lastError = error;

        const hasAnotherCandidate = i < candidates.length - 1;
        if (hasAnotherCandidate && this.isModelFallbackError(error)) {
          this.logger.warn(
            `Embedding model ${candidate.name} unavailable; trying next candidate.`,
          );
          continue;
        }

        break;
      }
    }

    this.logger.error('Failed to generate embedding', lastError);
    if (this.isQuotaExceededError(lastError)) {
      const retryAfterSeconds = this.parseRetryAfterSeconds(lastError);
      throw new AiQuotaExceededError(
        'AI embedding quota exceeded.',
        retryAfterSeconds,
      );
    }

    throw new InternalServerErrorException('AI Embedding Generation Failed');
  }

  /**
   * Drafts an answer based on a given question and an array of context snippets.
   */
  async generateAnswer(question: string, contextTexts: string[]) {
    const candidates = this.getModelCandidates(
      this.completionModels,
      this.resolvedCompletionModelName,
    );

    const combinedContext = contextTexts.join('\n\n---\n\n');

    const prompt = `
You are a highly capable AI specialized in answering security questionnaires for enterprise B2B software companies.
You must answer the user's question accurately using ONLY the provided context.
If the context does not contain enough information to fully answer the question, clearly state that you do not have enough information, but provide whatever partial answer is possible.

CONTEXT:
${combinedContext}

QUESTION:
${question}

Provide your answer in a clear, professional, and concise tone appropriate for an auditor or security professional.
`;

    let lastError: unknown = null;

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];

      try {
        const result = await candidate.model.generateContent(prompt);
        const answer = result.response.text();

        if (this.resolvedCompletionModelName !== candidate.name) {
          this.resolvedCompletionModelName = candidate.name;
          this.logger.log(`Using completion model: ${candidate.name}`);
        }

        // Calculate a pseudo-confidence score based on if it found the context
        let confidence = 85 + Math.floor(Math.random() * 10);
        if (
          answer.toLowerCase().includes('do not have enough information') ||
          answer.toLowerCase().includes('not mentioned in the context')
        ) {
          confidence = 25 + Math.floor(Math.random() * 20); // Low confidence
        }

        return {
          answer,
          confidence,
        };
      } catch (error) {
        lastError = error;

        const hasAnotherCandidate = i < candidates.length - 1;
        if (hasAnotherCandidate && this.isModelFallbackError(error)) {
          this.logger.warn(
            `Completion model ${candidate.name} unavailable; trying next candidate.`,
          );
          continue;
        }

        break;
      }
    }

    this.logger.error('Failed to generate answer', lastError);
    if (this.isQuotaExceededError(lastError)) {
      const retryAfterSeconds = this.parseRetryAfterSeconds(lastError);
      throw new AiQuotaExceededError(
        'AI generation quota exceeded.',
        retryAfterSeconds,
      );
    }

    throw new InternalServerErrorException('AI Answer Generation Failed');
  }
}
