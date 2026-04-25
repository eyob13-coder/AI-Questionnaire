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
   * Returns immediately with the document record in PROCESSING status.
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

    // 2. Enqueue for async processing
    await this.documentQueue.add(
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

    this.logger.log(
      `📄 Document ${document.id} enqueued for processing`,
    );

    return document;
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
