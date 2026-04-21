import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { DOCUMENT_PROCESSING_QUEUE } from '../queue/queue.module';
import type { DocumentProcessingJobData } from '../queue/processors/document-processing.processor';

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(DOCUMENT_PROCESSING_QUEUE)
    private readonly documentQueue: Queue<DocumentProcessingJobData>,
  ) {}

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
}
