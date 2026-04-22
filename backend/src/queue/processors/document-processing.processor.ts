import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { RagService } from '../../rag/rag.service';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');
import * as mammoth from 'mammoth';

export interface DocumentProcessingJobData {
  documentId: string;
  workspaceId: string;
  fileName: string;
  fileType: string;
  /** Base64-encoded file buffer */
  fileBuffer: string;
}

@Processor('document-processing')
export class DocumentProcessingProcessor extends WorkerHost {
  private readonly logger = new Logger(DocumentProcessingProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ragService: RagService,
  ) {
    super();
  }

  async process(job: Job<DocumentProcessingJobData>): Promise<void> {
    const { documentId, fileType, fileBuffer } = job.data;
    this.logger.log(`Processing document ${documentId} [job ${job.id}]`);

    try {
      const buffer = Buffer.from(fileBuffer, 'base64');

      // 1. Extract text
      let extractedText = '';
      if (fileType === 'application/pdf') {
        const data = (await pdfParse(buffer)) as { text: string };
        extractedText = data.text;
      } else if (
        fileType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        const result = (await mammoth.extractRawText({ buffer })) as {
          value: string;
        };
        extractedText = result.value;
      } else if (fileType === 'text/plain') {
        extractedText = buffer.toString('utf-8');
      }

      // 2. Chunk text
      const chunks = this.chunkText(extractedText, 1000);

      // 3. Generate embeddings (when available) and save chunks
      let embeddingAvailable = true;

      for (let i = 0; i < chunks.length; i++) {
        const textChunk = chunks[i];
        if (!textChunk.trim()) continue;

        await job.updateProgress(Math.round((i / chunks.length) * 90));

        let embeddingVector: number[] | null = null;

        if (embeddingAvailable) {
          try {
            embeddingVector = await this.ragService.generateEmbedding(textChunk);
          } catch (embeddingError) {
            embeddingAvailable = false;
            this.logger.warn(
              `Embedding generation unavailable for document ${documentId}; storing chunks without vectors.`,
            );
          }
        }

        if (embeddingVector) {
          await this.prisma.$executeRaw`
            INSERT INTO document_chunks (id, content, chunk_index, document_id, created_at, embedding)
            VALUES (
              gen_random_uuid(), 
              ${textChunk}, 
              ${i}, 
              ${documentId}, 
              NOW(), 
              ${embeddingVector}::vector
            )
          `;
        } else {
          await this.prisma.$executeRaw`
            INSERT INTO document_chunks (id, content, chunk_index, document_id, created_at)
            VALUES (
              gen_random_uuid(), 
              ${textChunk}, 
              ${i}, 
              ${documentId}, 
              NOW()
            )
          `;
        }
      }

      // 4. Mark as ready
      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: 'READY' },
      });

      await job.updateProgress(100);
      this.logger.log(`✅ Document ${documentId} processed successfully`);
    } catch (error: unknown) {
      this.logger.error(`❌ Document ${documentId} processing failed`, error);
      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: 'FAILED' },
      });
      throw error; // Let BullMQ handle retries
    }
  }

  private chunkText(text: string, chunkSize: number): string[] {
    const regex = new RegExp(
      `.{1,${chunkSize}}(\\s|$)|.{1,${chunkSize}}`,
      'g',
    );
    return text.match(regex) || [];
  }
}
