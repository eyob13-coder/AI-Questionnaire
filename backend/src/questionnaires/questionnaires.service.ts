import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { QUESTIONNAIRE_GENERATION_QUEUE } from '../queue/queue.module';
import type { QuestionnaireGenerationJobData } from '../queue/processors/questionnaire-generation.processor';
import * as xlsx from 'xlsx';

@Injectable()
export class QuestionnairesService {
  private readonly logger = new Logger(QuestionnairesService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUESTIONNAIRE_GENERATION_QUEUE)
    private readonly generationQueue: Queue<QuestionnaireGenerationJobData>,
  ) { }

  /**
   * Upload a questionnaire file, extract questions, and enqueue
   * answer generation via BullMQ.
   */
  async processAndUploadQuestionnaire(
    workspaceId: string,
    file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file provided');

    // 1. Parse the spreadsheet to extract questions
    const questionsText: string[] = [];
    try {
      if (
        file.mimetype === 'text/csv' ||
        file.mimetype.includes('spreadsheetml')
      ) {
        const workbook = xlsx.read(file.buffer);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const rawJson: any[] = xlsx.utils.sheet_to_json(sheet, { header: 1 });

        for (const row of rawJson) {
          for (const cell of row) {
            if (
              typeof cell === 'string' &&
              cell.trim().length > 10 &&
              cell.toLowerCase().includes('?')
            ) {
              questionsText.push(cell.trim());
              break;
            } else if (typeof cell === 'string' && cell.trim().length > 15) {
              questionsText.push(cell.trim());
              break;
            }
          }
        }
      } else {
        throw new BadRequestException(
          'Unsupported format. Please upload XLSX or CSV.',
        );
      }
    } catch (error: unknown) {
      const errMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        'Failed to parse spreadsheet: ' + errMessage,
      );
    }

    if (questionsText.length === 0) {
      throw new BadRequestException(
        'Could not identify any questions in the file.',
      );
    }

    // 2. Create the Questionnaire record
    const questionnaire = await this.prisma.questionnaire.create({
      data: {
        workspaceId,
        name: file.originalname.split('.')[0],
        fileName: file.originalname,
        fileType: file.mimetype,
        totalQuestions: questionsText.length,
        status: 'PROCESSING',
      },
    });

    // 3. Enqueue async answer generation via BullMQ
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

    this.logger.log(
      `📋 Questionnaire ${questionnaire.id} enqueued — ${questionsText.length} questions`,
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
}
