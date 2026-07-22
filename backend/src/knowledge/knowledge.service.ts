import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { DOCUMENT_PROCESSING_QUEUE } from '../queue/queue.module';
import type { DocumentProcessingJobData } from '../queue/processors/document-processing.processor';
import { BillingService } from '../billing/billing.service';
import { RagService } from '../rag/rag.service';
import { PDFParse } from 'pdf-parse';
import * as mammoth from 'mammoth';

const RECONCILE_INTERVAL_MS = 60_000;
const STUCK_THRESHOLD_MS = 15 * 60_000;

@Injectable()
export class KnowledgeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KnowledgeService.name);
  private reconcileTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(DOCUMENT_PROCESSING_QUEUE)
    private readonly documentQueue: Queue<DocumentProcessingJobData>,
    private readonly billing: BillingService,
    private readonly ragService: RagService,
  ) { }

  async onModuleInit() {
    // Run an immediate reconciliation, then every minute. This recovers
    // documents that finished chunking but never got their final
    // "status = READY" update (e.g. worker killed by a dev restart).
    await this.reconcileStuckDocuments();
    this.reconcileTimer = setInterval(
      () => {
        this.reconcileStuckDocuments().catch((err) =>
          this.logger.error('Document reconciliation failed', err as Error),
        );
      },
      RECONCILE_INTERVAL_MS,
    );
  }

  onModuleDestroy() {
    if (this.reconcileTimer) {
      clearInterval(this.reconcileTimer);
      this.reconcileTimer = null;
    }
  }

  /**
   * Reconciles documents stuck in PROCESSING:
   * - If they already have at least one chunk → mark READY.
   * - If they have no chunks and have been processing > 15 min → mark FAILED.
   */
  private async reconcileStuckDocuments() {
    const stuck = await this.prisma.document.findMany({
      where: { status: 'PROCESSING' },
      include: { _count: { select: { chunks: true } } },
    });

    if (stuck.length === 0) return;

    const now = Date.now();
    let recovered = 0;
    let failed = 0;

    for (const doc of stuck) {
      if (doc._count.chunks > 0) {
        await this.prisma.document.update({
          where: { id: doc.id },
          data: { status: 'READY' },
        });
        recovered++;
        continue;
      }

      const ageMs = now - doc.updatedAt.getTime();
      if (ageMs > STUCK_THRESHOLD_MS) {
        await this.prisma.document.update({
          where: { id: doc.id },
          data: { status: 'FAILED' },
        });
        failed++;
      }
    }

    if (recovered > 0 || failed > 0) {
      this.logger.log(
        `Reconciled stuck documents — recovered: ${recovered}, marked failed: ${failed}`,
      );
    }
  }

  /**
   * Upload a document and enqueue it for async processing via BullMQ.
   * Falls back to synchronous inline processing when Redis/BullMQ is unavailable.
   */
  async processAndUploadDocument(
    workspaceId: string,
    file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file provided');

    // Validate file type upfront
    const supportedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (!supportedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Unsupported file format. Use PDF, DOCX, or TXT.',
      );
    }

    // 0. Enforce plan limit
    await this.billing.checkLimit(workspaceId, 'documents');

    // 1. Create document record
    const document = await this.prisma.document.create({
      data: {
        workspaceId,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        status: 'PROCESSING',
      },
    });

    // 2. Try to enqueue for async processing via BullMQ
    let enqueued = false;
    try {
      const enqueuePromise = this.documentQueue.add(
        'process-document',
        {
          documentId: document.id,
          workspaceId,
          fileName: file.originalname,
          fileType: file.mimetype,
          fileBuffer: file.buffer.toString('base64'),
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 500 },
        },
      );

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Queue add timeout')), 3000),
      );

      await Promise.race([enqueuePromise, timeoutPromise]);
      enqueued = true;
      this.logger.log(`📄 Document ${document.id} enqueued for processing`);
    } catch (queueError) {
      this.logger.warn(
        `⚠️  Redis/BullMQ unavailable — processing document ${document.id} synchronously`,
      );
    }

    // 3. Fallback: process inline when queue is unavailable
    if (!enqueued) {
      try {
        await this.processDocumentInline(document.id, file);
      } catch (inlineError) {
        this.logger.error(
          `❌ Inline processing failed for document ${document.id}`,
          inlineError as Error,
        );
        await this.prisma.document.update({
          where: { id: document.id },
          data: { status: 'FAILED' },
        });
      }
    }

    return document;
  }

  /**
   * Processes a document synchronously (same logic as the BullMQ worker).
   * Used as a fallback when Redis is unavailable.
   */
  private async processDocumentInline(
    documentId: string,
    file: Express.Multer.File,
  ) {
    const buffer = file.buffer;

    // 1. Extract text
    let extractedText = '';
    if (file.mimetype === 'application/pdf') {
      const parser = new PDFParse({ data: buffer });
      const data = await parser.getText();
      extractedText = data.text;
      await parser.destroy();
    } else if (
      file.mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = (await mammoth.extractRawText({ buffer })) as {
        value: string;
      };
      extractedText = result.value;
    } else if (file.mimetype === 'text/plain') {
      extractedText = buffer.toString('utf-8');
    }

    // 2. Chunk text
    const chunks = this.chunkText(extractedText, 1000);

    // 3. Generate embeddings and save chunks
    let embeddingAvailable = true;

    for (let i = 0; i < chunks.length; i++) {
      const textChunk = chunks[i];
      if (!textChunk.trim()) continue;

      let embeddingVector: number[] | null = null;

      if (embeddingAvailable) {
        try {
          embeddingVector =
            await this.ragService.generateEmbedding(textChunk);
        } catch {
          embeddingAvailable = false;
          this.logger.warn(
            `Embedding generation unavailable for document ${documentId}; storing chunks without vectors.`,
          );
        }
      }

      if (embeddingVector) {
        const vectorString = `[${embeddingVector.join(',')}]`;
        await this.prisma.$executeRaw`
          INSERT INTO document_chunks (id, content, chunk_index, document_id, created_at, embedding)
          VALUES (
            gen_random_uuid(), 
            ${textChunk}, 
            ${i}, 
            ${documentId}, 
            NOW(), 
            ${vectorString}::vector
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

    this.logger.log(`✅ Document ${documentId} processed synchronously`);
  }

  private chunkText(text: string, chunkSize: number): string[] {
    const regex = new RegExp(`.{1,${chunkSize}}(\\s|$)|.{1,${chunkSize}}`, 'g');
    return text.match(regex) || [];
  }

  async listDocuments(workspaceId: string) {
    const docs = await this.prisma.document.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { chunks: true } } },
    });
    return docs.map((d) => ({
      id: d.id,
      fileName: d.fileName,
      fileType: d.fileType,
      fileSize: d.fileSize,
      status: d.status,
      pageCount: d.pageCount,
      chunkCount: d._count.chunks,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));
  }

  async deleteDocument(workspaceId: string, documentId: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id: documentId, workspaceId },
    });
    if (!doc) throw new NotFoundException('Document not found');
    await this.prisma.document.delete({ where: { id: documentId } });
    return { success: true };
  }
}
