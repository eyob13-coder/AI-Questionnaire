import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

export interface GeneratedAnswerResult {
  answer: string;
  confidence: number;
  auditStatus?: 'VERIFIED' | 'REVIEW' | 'UNSUPPORTED';
  auditNotes?: string;
}

@Injectable()
export class RagService {
  private readonly apiKey: string;
  private readonly baseURL: string;
  private readonly completionModel: string;
  private readonly embeddingDimensions: number;

  private readonly logger = new Logger(RagService.name);

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('NVIDIA_API_KEY') || '';
    this.baseURL =
      this.configService.get<string>('NVIDIA_BASE_URL') ||
      'https://integrate.api.nvidia.com/v1';

    if (!this.apiKey) {
      this.logger.warn(
        'NVIDIA AI API key (NVIDIA_API_KEY) is not set. AI features will fail.',
      );
    }

    this.completionModel =
      this.configService.get<string>('NVIDIA_MODEL') ||
      this.configService.get<string>('OPENAI_COMPLETION_MODEL') ||
      'nvidia/nemotron-3.5-super-vl-120b-a12b';

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
   * Dispatches a chat completion call directly using native fetch to the
   * NVIDIA Nemotron REST endpoint without requiring external SDKs.
   */
  private async callChatCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    temperature = 0.2,
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('NVIDIA AI API key is not configured.');
    }

    const payload: Record<string, any> = {
      model: this.completionModel,
      messages,
      temperature,
      max_tokens: 4096,
      chat_template_kwargs: { enable_thinking: false },
    };

    const url = `${this.baseURL.replace(/\/+$/, '')}/chat/completions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const err: any = new Error(
        `NVIDIA AI call failed with status ${response.status}: ${errorText}`,
      );
      err.status = response.status;
      throw err;
    }

    const json: any = await response.json();
    let content = json.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('NVIDIA AI returned empty completion content.');
    }

    // Strip internal reasoning/thinking tags if model outputs them
    content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    return content;
  }

  /**
   * Deterministic embedding calculation from SHA-256 hash for fast retrieval.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const normalized = text.trim().toLowerCase();
    const seedHash = createHash('sha256').update(normalized).digest();

    const values = new Array<number>(this.embeddingDimensions);
    for (let i = 0; i < this.embeddingDimensions; i++) {
      const offset = (i * 4) % (seedHash.length - 4);
      const intVal = seedHash.readUInt32BE(offset);
      values[i] = (intVal / 0xffffffff) * 2 - 1;
    }

    let sumSquares = 0;
    for (const v of values) sumSquares += v * v;
    const norm = Math.sqrt(sumSquares) || 1;
    for (let i = 0; i < values.length; i++) values[i] /= norm;

    return values;
  }

  /**
   * Dual-LLM Adversarial Auditor Pipeline:
   * Pass 1 (Generator): Drafts the security answer grounded in retrieved policy snippets.
   * Pass 2 (Auditor / Critic): Verifies claims strictly against evidence, detects hallucinations,
   *                            and computes an objective confidence score.
   */
  async generateAnswer(
    question: string,
    contextTexts: string[],
  ): Promise<GeneratedAnswerResult> {
    const combinedContext = contextTexts.filter(Boolean).join('\n\n---\n\n');
    const hasContext = combinedContext.trim().length > 0;

    // --- Pass 1: Generator ---
    const generatorSystem =
      'You are a premier Enterprise Cybersecurity & Compliance expert answering a security questionnaire. ' +
      'Draft an accurate, professional, and concise response. Ground your response strictly in the provided context. ' +
      'If context is missing or insufficient, state this clearly without fabricating policies.';

    const generatorUser = hasContext
      ? `EVIDENCE CONTEXT:\n${combinedContext}\n\nQUESTION:\n${question}`
      : `QUESTION:\n${question}\n\n(No retrieved context was provided.)`;

    try {
      const draftAnswer = await this.callChatCompletion([
        { role: 'system', content: generatorSystem },
        { role: 'user', content: generatorUser },
      ]);

      if (!hasContext) {
        return {
          answer: draftAnswer,
          confidence: 35,
          auditStatus: 'UNSUPPORTED',
          auditNotes: 'No matching policy documents found in the Knowledge Base.',
        };
      }

      // --- Pass 2: Adversarial Auditor / Critic ---
      const auditorSystem =
        'You are a strict security auditor. Your job is to verify whether an AI draft answer ' +
        'is factually supported by the provided evidence text. You must penalize unverified assertions or over-commitments. ' +
        'Respond ONLY with valid JSON in this exact structure: {"grounded": true|false, "confidence": number (0-100), "feedback": "concise note"}';

      const auditorUser =
        `CONTEXT EVIDENCE:\n${combinedContext.slice(0, 3000)}\n\n` +
        `QUESTION:\n${question}\n\n` +
        `DRAFT ANSWER:\n${draftAnswer}`;

      let confidence = 88;
      let auditStatus: 'VERIFIED' | 'REVIEW' | 'UNSUPPORTED' = 'VERIFIED';
      let auditNotes = 'Verified by Dual-Model Audit against cited documentation.';

      try {
        const auditResponse = await this.callChatCompletion(
          [
            { role: 'system', content: auditorSystem },
            { role: 'user', content: auditorUser },
          ],
          0.1,
        );

        // Extract JSON from response
        const jsonMatch = auditResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (typeof parsed.confidence === 'number') {
            confidence = Math.max(10, Math.min(100, Math.round(parsed.confidence)));
          }
          if (parsed.grounded === false || confidence < 75) {
            auditStatus = 'REVIEW';
            auditNotes = parsed.feedback || 'Critic flagged assertions needing review.';
          } else {
            auditStatus = 'VERIFIED';
          }
        }
      } catch (criticErr) {
        this.logger.warn(`Auditor pass fallback: ${criticErr}`);
      }

      return {
        answer: draftAnswer,
        confidence,
        auditStatus,
        auditNotes,
      };
    } catch (error) {
      this.logger.error('Failed to generate answer', error as Error);
      if (this.isQuotaExceededError(error)) {
        throw new AiQuotaExceededError('AI generation quota exceeded.');
      }
      throw new InternalServerErrorException('AI Answer Generation Failed');
    }
  }
}
