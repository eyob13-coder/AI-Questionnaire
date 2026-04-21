import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

@Injectable()
export class RagService {
  private readonly genAI: GoogleGenerativeAI;
  private readonly completionModel: GenerativeModel;
  private readonly embeddingModel: GenerativeModel;
  private readonly logger = new Logger(RagService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not set. AI features will fail.');
    }

    // Initialize the Gemini SDK
    this.genAI = new GoogleGenerativeAI(apiKey || 'unconfigured');

    // Choose appropriate Gemini models
    this.completionModel = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
    });
    this.embeddingModel = this.genAI.getGenerativeModel({
      model: 'text-embedding-004',
    });
  }

  /**
   * Generates a dense vector embedding for a piece of text.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const result = await this.embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      this.logger.error('Failed to generate embedding', error);
      throw new InternalServerErrorException('AI Embedding Generation Failed');
    }
  }

  /**
   * Drafts an answer based on a given question and an array of context snippets.
   */
  async generateAnswer(question: string, contextTexts: string[]) {
    try {
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

      const result = await this.completionModel.generateContent(prompt);
      const answer = result.response.text();

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
      this.logger.error('Failed to generate answer', error);
      throw new InternalServerErrorException('AI Answer Generation Failed');
    }
  }
}
