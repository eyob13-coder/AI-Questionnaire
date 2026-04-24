import {
  Injectable,
  Logger,
  BadRequestException,
  ServiceUnavailableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { QUESTIONNAIRE_GENERATION_QUEUE } from '../queue/queue.module';
import type { QuestionnaireGenerationJobData } from '../queue/processors/questionnaire-generation.processor';
import * as xlsx from 'xlsx';
import { AuditService } from '../audit/audit.service';
import { BillingService } from '../billing/billing.service';

type ExportFormat = 'xlsx' | 'csv';

@Injectable()
export class QuestionnairesService {
  private readonly logger = new Logger(QuestionnairesService.name);

  private static readonly SUPPORTED_MIME_TYPES = new Set([
    'text/csv',
    'application/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ]);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUESTIONNAIRE_GENERATION_QUEUE)
    private readonly generationQueue: Queue<QuestionnaireGenerationJobData>,
    private readonly auditService: AuditService,
    private readonly billing: BillingService,
  ) {}

  private normalizeExportFormat(format?: string): ExportFormat {
    const value = (format || '').trim().toLowerCase();
    if (!value) return 'xlsx';
    if (value === 'xlsx' || value === 'csv') return value;

    throw new BadRequestException(
      'Invalid export format. Supported formats are xlsx and csv.',
    );
  }

  private sanitizeFileBaseName(input: string): string {
    const withoutExtension = input.replace(/\.[^/.]+$/, '');
    const sanitized = withoutExtension
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/(^[-_.]+|[-_.]+$)/g, '');

    return sanitized || 'questionnaire';
  }

  private isInfraError(error: unknown): boolean {
    const err = error as { code?: string; message?: string } | undefined;
    const code = err?.code;
    const message = (err?.message || '').toLowerCase();

    return (
      code === 'P1017' ||
      code === 'P1001' ||
      code === 'P1008' ||
      code === 'ETIMEDOUT' ||
      code === 'ECONNREFUSED' ||
      message.includes('server has closed the connection') ||
      message.includes('connection closed') ||
      message.includes('timed out') ||
      message.includes('econnrefused') ||
      message.includes('redis') ||
      message.includes('queue')
    );
  }

  /**
   * Upload a questionnaire file, extract questions, and enqueue
   * answer generation via BullMQ.
   */
  async processAndUploadQuestionnaire(
    workspaceId: string,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!file.buffer?.length) {
      throw new BadRequestException(
        'Upload processing failed. Please try uploading the file again.',
      );
    }

    // 1. Parse the spreadsheet to extract questions
    const questionsText: string[] = [];
    try {
      const lowerName = file.originalname.toLowerCase();
      const hasSupportedExtension =
        lowerName.endsWith('.csv') ||
        lowerName.endsWith('.xlsx') ||
        lowerName.endsWith('.xls');
      const hasSupportedMime = QuestionnairesService.SUPPORTED_MIME_TYPES.has(
        file.mimetype,
      );

      if (!hasSupportedMime && !hasSupportedExtension) {
        throw new BadRequestException(
          'Unsupported file format. Please upload .csv, .xlsx, or .xls.',
        );
      }

      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rawRows = xlsx.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });

      for (const row of rawRows) {
        for (const cell of row) {
          if (
            typeof cell === 'string' &&
            cell.trim().length > 10 &&
            cell.toLowerCase().includes('?')
          ) {
            questionsText.push(cell.trim());
            break;
          }

          if (typeof cell === 'string' && cell.trim().length > 15) {
            questionsText.push(cell.trim());
            break;
          }
        }
      }
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        'We could not read that spreadsheet. Please ensure it is a valid CSV or Excel file and try again.',
      );
    }

    if (questionsText.length === 0) {
      throw new BadRequestException(
        'Could not identify any questions in the file.',
      );
    }

    // 2. Enforce Plan Limits
    await this.billing.checkLimit(workspaceId, 'questionnaires', 1);
    await this.billing.checkLimit(workspaceId, 'questions', questionsText.length);

    // 3. Create the Questionnaire record
    let questionnaireId: string | null = null;

    let questionnaire: {
      id: string;
      workspaceId: string;
      name: string;
      fileName: string;
      fileType: string;
      totalQuestions: number;
      status: string;
    };

    try {
      questionnaire = await this.prisma.questionnaire.create({
        data: {
          workspaceId,
          name: file.originalname.split('.')[0],
          fileName: file.originalname,
          fileType: file.mimetype,
          totalQuestions: questionsText.length,
          status: 'PROCESSING',
        },
      });
      questionnaireId = questionnaire.id;

      // Create placeholder rows immediately so the UI can render questions
      // before AI answers are generated by the queue worker.
      await this.prisma.question.createMany({
        data: questionsText.map((questionText, index) => ({
          questionnaireId: questionnaire.id,
          questionText,
          rowIndex: index,
          status: 'DRAFT',
        })),
      });
    } catch (error) {
      if (this.isInfraError(error)) {
        throw new ServiceUnavailableException(
          'Database is temporarily unavailable. Please retry in a moment.',
        );
      }
      throw error;
    }

    // 3. Enqueue async answer generation via BullMQ
    try {
      await this.generationQueue.add(
        'generate-answers',
        {
          questionnaireId: questionnaire.id,
          workspaceId,
          questionsText,
        },
        {
          attempts: 2,
          backoff: { type: 'exponential', delay: 10000 },
          removeOnComplete: { count: 50 },
          removeOnFail: { count: 200 },
        },
      );
    } catch (error) {
      if (questionnaireId) {
        await this.prisma.questionnaire
          .delete({
            where: { id: questionnaireId },
          })
          .catch(() => undefined);
      }

      if (this.isInfraError(error)) {
        throw new ServiceUnavailableException(
          'Processing is temporarily unavailable. Please retry in a moment.',
        );
      }

      throw new ServiceUnavailableException(
        'We received the file, but could not start processing. Please retry in a moment.',
      );
    }

    this.logger.log(
      `Questionnaire ${questionnaire.id} enqueued - ${questionsText.length} questions`,
    );

    return questionnaire;
  }

  /**
   * Get all questionnaires for a workspace
   */
  async getQuestionnaires(workspaceId: string) {
    return this.prisma.questionnaire.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get questionnaire by ID with its questions
   */
  async getQuestionnaireDetails(workspaceId: string, questionnaireId: string) {
    return this.prisma.questionnaire.findFirst({
      where: { id: questionnaireId, workspaceId },
      include: {
        questions: {
          orderBy: { rowIndex: 'asc' },
          include: { citations: true },
        },
      },
    });
  }

  async exportQuestionnaire(
    workspaceId: string,
    questionnaireId: string,
    userId: string,
    format?: string,
  ) {
    const resolvedFormat = this.normalizeExportFormat(format);

    const questionnaire = await this.prisma.questionnaire.findFirst({
      where: { id: questionnaireId, workspaceId },
      include: {
        questions: {
          orderBy: { rowIndex: 'asc' },
          include: { citations: true },
        },
      },
    });

    if (!questionnaire) {
      throw new NotFoundException('Questionnaire not found');
    }

    const rows = questionnaire.questions.map((question, index) => ({
      '#': index + 1,
      Question: question.questionText,
      Answer: question.answerText || '',
      Confidence:
        typeof question.confidence === 'number'
          ? `${Math.round(question.confidence)}%`
          : '',
      Status: question.status,
      Citations:
        question.citations.length > 0
          ? question.citations
              .map((citation) =>
                citation.pageNumber
                  ? `${citation.sourceDocument} (p.${citation.pageNumber})`
                  : citation.sourceDocument,
              )
              .join('; ')
          : '',
    }));

    const worksheet = xlsx.utils.json_to_sheet(rows);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Answers');

    const baseName = this.sanitizeFileBaseName(questionnaire.fileName || questionnaire.name);
    const extension = resolvedFormat === 'csv' ? 'csv' : 'xlsx';
    const fileName = `${baseName}-answers.${extension}`;

    const buffer =
      resolvedFormat === 'csv'
        ? Buffer.from(xlsx.utils.sheet_to_csv(worksheet), 'utf8')
        : xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const contentType =
      resolvedFormat === 'csv'
        ? 'text/csv; charset=utf-8'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    const answeredCount = questionnaire.questions.filter(
      (question) => typeof question.answerText === 'string' && question.answerText.trim().length > 0,
    ).length;

    await this.auditService.logAction({
      userId,
      workspaceId,
      action: 'questionnaire.exported',
      entity: questionnaire.name,
      entityId: questionnaire.id,
      details: {
        format: resolvedFormat.toUpperCase(),
        fileName,
        questionCount: questionnaire.questions.length,
        answeredCount,
      },
    });

    return {
      fileName,
      contentType,
      buffer,
    };
  }

  async deleteQuestionnaire(
    workspaceId: string,
    questionnaireId: string,
    userId: string,
  ) {
    const questionnaire = await this.prisma.questionnaire.findFirst({
      where: { id: questionnaireId, workspaceId },
    });

    if (!questionnaire) {
      throw new NotFoundException('Questionnaire not found');
    }

    await this.prisma.questionnaire.delete({
      where: { id: questionnaireId },
    });

    await this.auditService.logAction({
      userId,
      workspaceId,
      action: 'questionnaire.deleted',
      entity: questionnaire.name,
      entityId: questionnaire.id,
      details: {
        totalQuestions: questionnaire.totalQuestions,
      },
    });

    return { success: true };
  }

  async exportToExcel(workspaceId: string, id: string) {
    const questionnaire = await this.prisma.questionnaire.findUnique({
      where: { id, workspaceId },
      include: {
        questions: {
          orderBy: { rowIndex: 'asc' },
        },
      },
    });

    if (!questionnaire) {
      throw new NotFoundException('Questionnaire not found');
    }

    const data = questionnaire.questions.map((q) => ({
      '#': q.rowIndex,
      Question: q.questionText,
      'AI Answer': q.answerText || '',
    }));

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Answers');

    // Set column widths
    const wscols = [
      { wch: 5 }, // #
      { wch: 60 }, // Question
      { wch: 80 }, // AI Answer (wider for better reading)
    ];
    worksheet['!cols'] = wscols;

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return {
      buffer,
      fileName: `${questionnaire.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_exported.xlsx`,
    };
  }
}
