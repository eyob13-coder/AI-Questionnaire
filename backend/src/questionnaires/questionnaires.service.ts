import {
  Injectable,
  Logger,
  BadRequestException,
  ServiceUnavailableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { QUESTIONNAIRE_GENERATION_QUEUE } from '../queue/queue.module';
import type { QuestionnaireGenerationJobData } from '../queue/processors/questionnaire-generation.processor';
import * as xlsx from 'xlsx';
import { AuditService } from '../audit/audit.service';
import { BillingService } from '../billing/billing.service';
import { QuestionnaireGenerationProcessor } from '../queue/processors/questionnaire-generation.processor';

import { ExcelRoundtripService, QuestionnaireSpreadsheetMeta } from './excel-roundtrip.service';

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
    private readonly generationProcessor: QuestionnaireGenerationProcessor,
    private readonly roundtripService: ExcelRoundtripService,
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
    let questionsText: string[] = [];
    let spreadsheetMeta: QuestionnaireSpreadsheetMeta | null = null;

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

      // Try advanced ExcelJS round-trip parser first for Excel files
      const isXlsx = lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls');
      if (isXlsx) {
        try {
          const parsed = await this.roundtripService.parseSpreadsheet(
            file.buffer,
            file.originalname,
          );
          if (parsed.questions.length > 0) {
            spreadsheetMeta = parsed.meta;
            questionsText = parsed.questions.map((q) => q.questionText);
            this.logger.log(
              `ExcelRoundtrip detected ${questionsText.length} questions from sheet "${spreadsheetMeta.selectedSheet}" in ${file.originalname}`,
            );
          }
        } catch (excelErr) {
          this.logger.warn(
            `ExcelRoundtrip parser notice (falling back to generic parser): ${excelErr}`,
          );
        }
      }

      // Fallback: If not an Excel file or if ExcelJS did not detect question columns
      if (questionsText.length === 0) {
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

      if (spreadsheetMeta) {
        await this.roundtripService.saveOriginalFile(
          questionnaire.id,
          file.buffer,
          spreadsheetMeta,
        );
      }

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

    // 4. Enqueue async answer generation via BullMQ
    let enqueued = false;
    try {
      const enqueuePromise = this.generationQueue.add(
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

      // Timeout after 3 seconds if Redis is connecting indefinitely
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Queue add timeout')), 3000),
      );

      await Promise.race([enqueuePromise, timeoutPromise]);
      enqueued = true;
    } catch (error) {
      this.logger.warn(
        `⚠️  Redis/BullMQ unavailable — processing questionnaire ${questionnaireId} inline`,
      );
    }

    if (!enqueued && questionnaireId) {
      // Fallback: process inline when queue is unavailable. 
      // We don't await this so the HTTP response returns immediately.
      const mockJob = {
        id: `inline-${Date.now()}`,
        data: {
          questionnaireId: questionnaire.id,
          workspaceId,
          questionsText,
        },
        updateProgress: async () => undefined,
      } as unknown as Job<QuestionnaireGenerationJobData>;

      this.generationProcessor.process(mockJob).catch((e) => {
        this.logger.error(`❌ Inline questionnaire generation failed`, e);
      });
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
    const questionnaire = await this.prisma.questionnaire.findFirst({
      where: { id: questionnaireId, workspaceId },
      include: {
        questions: {
          orderBy: { rowIndex: 'asc' },
          include: { citations: true },
        },
      },
    });

    if (!questionnaire) return null;

    const roundTripPreserved = this.roundtripService.hasPreservedOriginal(questionnaireId);

    return {
      ...questionnaire,
      roundTripPreserved,
    };
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

  async updateQuestionAnswer(
    workspaceId: string,
    questionnaireId: string,
    questionId: string,
    dto: { answerText?: string; status?: any; saveToVault?: boolean },
    userId: string,
  ) {
    const question = await this.prisma.question.findFirst({
      where: { id: questionId, questionnaireId, questionnaire: { workspaceId } },
      include: { citations: true },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    const newAnswerText =
      dto.answerText !== undefined ? dto.answerText : question.answerText;
    const newStatus = dto.status || question.status;
    const isSavedToVault = Boolean(dto.saveToVault);

    if (isSavedToVault && newAnswerText) {
      const existingVaultItem = await this.prisma.knowledgeVaultItem.findFirst({
        where: {
          workspaceId,
          questionText: question.questionText,
        },
      });

      if (existingVaultItem) {
        await this.prisma.knowledgeVaultItem.update({
          where: { id: existingVaultItem.id },
          data: {
            answerText: newAnswerText,
            status: 'HUMAN_VERIFIED',
            lastVerifiedAt: new Date(),
          },
        });
      } else {
        await this.prisma.knowledgeVaultItem.create({
          data: {
            workspaceId,
            questionText: question.questionText,
            answerText: newAnswerText,
            status: 'HUMAN_VERIFIED',
            lastVerifiedAt: new Date(),
          },
        });
      }

      try {
        let vaultDoc = await this.prisma.document.findFirst({
          where: { workspaceId, fileName: 'workspace-knowledge-vault.md' },
        });

        if (!vaultDoc) {
          vaultDoc = await this.prisma.document.create({
            data: {
              workspaceId,
              fileName: 'workspace-knowledge-vault.md',
              fileType: 'text/markdown',
              fileSize: 1024,
              status: 'READY',
            },
          });
        }

        const chunkContent = `Question: ${question.questionText}\nVerified Answer: ${newAnswerText}\nStatus: HUMAN_VERIFIED\nVerified By: Team Member`;
        await this.prisma.documentChunk.create({
          data: {
            documentId: vaultDoc.id,
            content: chunkContent,
            chunkIndex: Math.floor(Date.now() / 1000),
            tokenCount: chunkContent.split(/\s+/).length,
          },
        });
      } catch (err) {
        this.logger.warn(`Could not sync vault item to document chunks: ${err}`);
      }
    }

    const updatedQuestion = await this.prisma.question.update({
      where: { id: questionId },
      data: {
        answerText: newAnswerText,
        status: newStatus,
        verifiedFromVault: isSavedToVault ? true : question.verifiedFromVault,
        auditorCritique: isSavedToVault
          ? 'Previously Approved by Your Team in Knowledge Vault'
          : question.auditorCritique,
      },
      include: { citations: true },
    });

    const approvedCount = await this.prisma.question.count({
      where: { questionnaireId, status: 'APPROVED' },
    });
    const answeredCount = await this.prisma.question.count({
      where: {
        questionnaireId,
        answerText: { not: null },
      },
    });

    await this.prisma.questionnaire.update({
      where: { id: questionnaireId },
      data: { approvedCount, answeredCount },
    });

    return updatedQuestion;
  }

  async bulkApproveVerified(
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

    const updated = await this.prisma.question.updateMany({
      where: {
        questionnaireId,
        confidence: { gte: 85 },
        status: { not: 'APPROVED' },
      },
      data: {
        status: 'APPROVED',
      },
    });

    const approvedCount = await this.prisma.question.count({
      where: { questionnaireId, status: 'APPROVED' },
    });

    await this.prisma.questionnaire.update({
      where: { id: questionnaireId },
      data: { approvedCount },
    });

    await this.auditService.logAction({
      userId,
      workspaceId,
      action: 'questionnaire.bulk_approved',
      entity: questionnaire.name,
      entityId: questionnaire.id,
      details: {
        newlyApprovedCount: updated.count,
        totalApprovedCount: approvedCount,
      },
    });

    return {
      success: true,
      newlyApprovedCount: updated.count,
      totalApprovedCount: approvedCount,
    };
  }

  async createDemoSandbox(workspaceId: string, userId: string) {
    const existingDemo = await this.prisma.questionnaire.findFirst({
      where: {
        workspaceId,
        name: 'Acme Cloud SaaS — SOC 2 Type II + Enterprise Security Assessment',
      },
      orderBy: { createdAt: 'desc' },
      include: {
        questions: {
          orderBy: { rowIndex: 'asc' },
          include: { citations: true },
        },
      },
    });

    if (existingDemo) {
      if (!existingDemo.isUnlocked) {
        await this.prisma.questionnaire.update({
          where: { id: existingDemo.id },
          data: { isUnlocked: true },
        });
        existingDemo.isUnlocked = true;
      }
      return existingDemo;
    }

    const demoQuestions = [
      // ── Tab 1: Verified & Grounded (Confidence >= 85%) ──
      {
        questionText: 'How is customer data encrypted at rest across all storage volumes and production databases?',
        answerText: 'All customer data at rest is encrypted using industry-standard AES-256 encryption across all AWS EBS volumes, RDS PostgreSQL instances, and S3 object storage buckets. Encryption keys are managed and rotated annually via AWS Key Management Service (KMS).',
        confidence: 96,
        status: 'APPROVED' as const,
        auditorCritique: 'Verified by Dual-Model Audit against SOC 2 Type II Report Section 4.2 (Cryptographic Controls).',
        verifiedFromVault: false,
        citations: [
          {
            sourceDocument: 'Acme Cloud SOC 2 Type II Report (2024)',
            pageNumber: 24,
            excerpt: 'All data stores containing customer production data utilize AES-256 encryption at rest. AWS KMS enforces least-privilege key access and automated yearly rotation.',
          },
        ],
      },
      {
        questionText: 'What encryption protocols and cipher suites are enforced for customer data in transit?',
        answerText: 'All external and internal network communications strictly mandate TLS 1.3 (with fallback to TLS 1.2 minimum) utilizing strong modern cipher suites with perfect forward secrecy (PFS). Plaintext HTTP connections are rejected and automatically redirected to HTTPS.',
        confidence: 98,
        status: 'APPROVED' as const,
        auditorCritique: 'Verified by Dual-Model Audit against Acme Information Security Policy v3.2.',
        verifiedFromVault: false,
        citations: [
          {
            sourceDocument: 'Acme Information Security Policy v3.2',
            pageNumber: 11,
            excerpt: 'All inbound public network traffic is terminated via Cloudflare and Application Load Balancers with TLS 1.2/1.3 enforcement and HSTS enabled.',
          },
        ],
      },
      {
        questionText: 'Which cloud infrastructure providers and geographical regions host production data?',
        answerText: 'Acme Cloud infrastructure is 100% hosted in Amazon Web Services (AWS) within the US-East (N. Virginia, us-east-1) and US-West (Oregon, us-west-2) regions across multiple redundant Availability Zones (AZs). Data residency is strictly confined to US sovereign boundaries.',
        confidence: 95,
        status: 'APPROVED' as const,
        auditorCritique: 'Verified by Dual-Model Audit against AWS Architecture & Infrastructure Overview.',
        verifiedFromVault: false,
        citations: [
          {
            sourceDocument: 'Acme Infrastructure Architecture Overview (2024)',
            pageNumber: 4,
            excerpt: 'Production clusters and PostgreSQL data clusters reside exclusively in AWS us-east-1 and us-west-2 multi-AZ configurations.',
          },
        ],
      },
      {
        questionText: 'Has your organization completed an independent SOC 2 Type II audit within the last 12 months?',
        answerText: 'Yes. Acme completed an independent SOC 2 Type II examination conducted by A-LIGN CPA for the audit period covering January 1, 2024 through December 31, 2024 with zero noted exceptions or qualifications across Security, Availability, and Confidentiality trust services criteria.',
        confidence: 99,
        status: 'APPROVED' as const,
        auditorCritique: 'Verified by Dual-Model Audit against Independent Auditor Report by A-LIGN.',
        verifiedFromVault: false,
        citations: [
          {
            sourceDocument: 'Acme Cloud SOC 2 Type II Report (2024)',
            pageNumber: 2,
            excerpt: 'In our opinion, management fairly stated that controls were suitably designed and operated effectively throughout the period with zero testing exceptions.',
          },
        ],
      },
      {
        questionText: 'What is your automated database snapshot frequency and point-in-time recovery backup retention policy?',
        answerText: 'Production databases undergo continuous automated transaction log archiving and full daily encrypted snapshots. Backups are replicated cross-region to us-west-2 and retained for 30 rolling days with quarterly automated restoration drills.',
        confidence: 93,
        status: 'APPROVED' as const,
        auditorCritique: 'Verified by Dual-Model Audit against Backup & Disaster Recovery Policy v2.1.',
        verifiedFromVault: false,
        citations: [
          {
            sourceDocument: 'Acme Backup & Disaster Recovery Policy',
            pageNumber: 7,
            excerpt: 'Daily automated snapshots of AWS RDS databases are encrypted with KMS and replicated to secondary region with a 30-day retention window.',
          },
        ],
      },
      {
        questionText: 'Is multi-factor authentication (MFA) strictly enforced for all administrative and production access?',
        answerText: 'Yes. Hardware-backed or TOTP authenticator MFA is mandatory for 100% of internal staff across Google Workspace, AWS IAM Identity Center, GitHub, and production Bastion access. SMS-based MFA is explicitly prohibited by policy.',
        confidence: 97,
        status: 'APPROVED' as const,
        auditorCritique: 'Verified by Dual-Model Audit against Identity & Access Management Policy.',
        verifiedFromVault: false,
        citations: [
          {
            sourceDocument: 'Acme Identity & Access Management Policy',
            pageNumber: 15,
            excerpt: 'MFA is enforced at the identity provider level for all employees and contractors. Non-FIDO/non-TOTP methods such as SMS are disabled.',
          },
        ],
      },
      {
        questionText: 'How frequently is independent third-party penetration testing conducted on your production environments?',
        answerText: 'Acme contracts an independent CREST-accredited cybersecurity firm (Bishop Fox) annually to conduct full-scope gray-box penetration testing covering APIs, web applications, and cloud infrastructure. Executive summaries and remediation letters are available under NDA.',
        confidence: 94,
        status: 'APPROVED' as const,
        auditorCritique: 'Verified by Dual-Model Audit against 2024 Annual Penetration Test Attestation.',
        verifiedFromVault: false,
        citations: [
          {
            sourceDocument: 'Bishop Fox Penetration Testing Attestation (Nov 2024)',
            pageNumber: 1,
            excerpt: 'Bishop Fox conducted external web application and infrastructure penetration testing from October 14 through November 1, 2024.',
          },
        ],
      },
      {
        questionText: 'What are your contractual Recovery Point Objective (RPO) and Recovery Time Objective (RTO) targets?',
        answerText: 'Our committed Disaster Recovery objectives are a Recovery Point Objective (RPO) of less than 1 hour and a Recovery Time Objective (RTO) of less than 4 hours for Tier-1 customer production services, backed by automated terraform-based multi-region failover.',
        confidence: 91,
        status: 'APPROVED' as const,
        auditorCritique: 'Verified by Dual-Model Audit against Business Continuity & DR Plan.',
        verifiedFromVault: false,
        citations: [
          {
            sourceDocument: 'Acme Business Continuity & DR Plan',
            pageNumber: 12,
            excerpt: 'Target RPO is 60 minutes for transactional databases; target RTO is 240 minutes for complete service restoration in secondary AWS region.',
          },
        ],
      },
      {
        questionText: 'Do you support Enterprise Single Sign-On (SSO) via SAML 2.0 and OIDC protocols?',
        answerText: 'Yes. Enterprise tiers support SAML 2.0 and OpenID Connect (OIDC) identity provider integrations including Okta, Microsoft Entra ID (Azure AD), Google Workspace, and Ping Identity with Just-In-Time (JIT) provisioning and SCIM user de-provisioning.',
        confidence: 96,
        status: 'APPROVED' as const,
        auditorCritique: 'Verified by Dual-Model Audit against Enterprise Authentication Technical Guide.',
        verifiedFromVault: false,
        citations: [
          {
            sourceDocument: 'Acme Enterprise Security Whitepaper',
            pageNumber: 9,
            excerpt: 'Enterprise customers can federate authentication via SAML 2.0 or OIDC. SCIM 2.0 protocol is supported for automated user provisioning and revocation.',
          },
        ],
      },
      {
        questionText: 'Describe your formal vendor risk management and third-party supplier review process.',
        answerText: 'All sub-processors and third-party software vendors undergo formal security screening prior to procurement, including review of SOC 2 / ISO 27001 certifications, privacy policies, and business stability. Reviews are renewed annually by the Security Committee.',
        confidence: 88,
        status: 'APPROVED' as const,
        auditorCritique: 'Verified by Dual-Model Audit against Vendor Risk Management Policy.',
        verifiedFromVault: false,
        citations: [
          {
            sourceDocument: 'Acme Vendor Risk Management Policy v2.0',
            pageNumber: 3,
            excerpt: 'Prior to contract execution, security questionnaires and current SOC 2 reports must be gathered and scored. High-risk vendors are audited annually.',
          },
        ],
      },
      {
        questionText: 'Are Data Processing Agreements (DPAs) incorporating Standard Contractual Clauses (SCCs) provided?',
        answerText: 'Yes. Acme provides a comprehensive Data Processing Addendum (DPA) incorporating the European Commission 2021 Standard Contractual Clauses (SCCs) and UK Addendum to support international data transfer requirements under GDPR and CCPA.',
        confidence: 94,
        status: 'APPROVED' as const,
        auditorCritique: 'Verified by Dual-Model Audit against Standard Customer DPA Terms.',
        verifiedFromVault: false,
        citations: [
          {
            sourceDocument: 'Acme Data Processing Addendum (2024)',
            pageNumber: 1,
            excerpt: 'This DPA incorporates the Standard Contractual Clauses approved by European Commission Decision (EU) 2021/914 for cross-border data transfers.',
          },
        ],
      },
      {
        questionText: 'What mandatory security awareness training is required for all new hires and ongoing employees?',
        answerText: 'All employees and contractors must complete mandatory security and data privacy awareness training via KnowBe4 upon hire and annually thereafter. Monthly simulated phishing campaigns are executed with targeted remedial training for failures.',
        confidence: 92,
        status: 'APPROVED' as const,
        auditorCritique: 'Verified by Dual-Model Audit against Employee Training Records & Policy.',
        verifiedFromVault: false,
        citations: [
          {
            sourceDocument: 'Acme Information Security Policy v3.2',
            pageNumber: 18,
            excerpt: '100% of active personnel completed annual cybersecurity awareness training in 2024. Phishing simulations occur monthly across all departments.',
          },
        ],
      },
      {
        questionText: 'Describe your Security Information and Event Management (SIEM) centralized logging architecture.',
        answerText: 'All system, application, audit, and AWS CloudTrail/VPC flow logs are forwarded in real time to Datadog SIEM with write-once/immutable storage in S3. Critical security alerts trigger automated pager alerts to the 24/7 on-call Security Operations team.',
        confidence: 91,
        status: 'APPROVED' as const,
        auditorCritique: 'Verified by Dual-Model Audit against SIEM Logging Architecture Document.',
        verifiedFromVault: false,
        citations: [
          {
            sourceDocument: 'Acme Infrastructure Architecture Overview (2024)',
            pageNumber: 8,
            excerpt: 'Centralized telemetry is streamed to Datadog SIEM with 365-day cold archive in AWS S3 Object Lock compliance mode.',
          },
        ],
      },
      {
        questionText: 'What is your vulnerability management scanning cadence and triage workflow for container images?',
        answerText: 'Containers and third-party dependencies are continuously scanned using Snyk and AWS Inspector in both GitHub Actions CI pipelines and AWS ECR registries. High and critical CVEs block pipeline deployments until resolved.',
        confidence: 89,
        status: 'APPROVED' as const,
        auditorCritique: 'Verified by Dual-Model Audit against Vulnerability Management Standard.',
        verifiedFromVault: false,
        citations: [
          {
            sourceDocument: 'Acme Vulnerability Management Standard',
            pageNumber: 5,
            excerpt: 'Automated container vulnerability scanning is integrated into GitHub Actions. PR merges are blocked when critical vulnerabilities are introduced.',
          },
        ],
      },
      {
        questionText: 'How often is the formal Incident Response Plan tested through simulated tabletop exercises?',
        answerText: 'The Incident Response Plan is formally exercised at least annually with executive leadership and technical leads using realistic scenarios (ransomware, unauthorized data exfiltration, supply chain compromise). Post-exercise learnings are incorporated into SOPs.',
        confidence: 88,
        status: 'APPROVED' as const,
        auditorCritique: 'Verified by Dual-Model Audit against 2024 Tabletop Incident Exercise Report.',
        verifiedFromVault: false,
        citations: [
          {
            sourceDocument: 'Acme Incident Response Plan v3.0',
            pageNumber: 21,
            excerpt: 'Tabletop simulations must be conducted at minimum once per calendar year with executive participation. Latest exercise completed September 2024.',
          },
        ],
      },
      {
        questionText: 'Are user access privileges reviewed quarterly following the principle of least privilege?',
        answerText: 'Yes. Department heads and security team leads conduct quarterly access reviews across AWS IAM, production databases, and internal developer tooling. Accounts for terminated personnel are deprovisioned within 24 hours of notification.',
        confidence: 87,
        status: 'REVIEW' as const,
        auditorCritique: 'Verified by Dual-Model Audit against Quarterly User Access Review Procedure.',
        verifiedFromVault: false,
        citations: [
          {
            sourceDocument: 'Acme Identity & Access Management Policy',
            pageNumber: 17,
            excerpt: 'Quarterly user entitlement audits are performed by resource owners. Stale access is revoked immediately upon identification.',
          },
        ],
      },
      {
        questionText: 'What data classification scheme is implemented to distinguish confidential vs public information?',
        answerText: 'Acme enforces a 4-tier data classification policy: Public, Internal, Confidential, and Restricted. Customer data is automatically classified as Restricted by default, requiring encryption at rest/transit and strict need-to-know access.',
        confidence: 86,
        status: 'REVIEW' as const,
        auditorCritique: 'Verified by Dual-Model Audit against Data Classification & Handling Standard.',
        verifiedFromVault: false,
        citations: [
          {
            sourceDocument: 'Acme Data Classification & Handling Policy',
            pageNumber: 3,
            excerpt: 'Customer tenant data is classified as Restricted. Processing and export are restricted to authenticated, audited sessions only.',
          },
        ],
      },
      {
        questionText: 'Do automated static (SAST) and dynamic (DAST) security scans run in the CI/CD pipeline prior to deployment?',
        answerText: 'All application pull requests trigger automated GitHub CodeQL (SAST) and secret detection scans. Nightly OWASP ZAP (DAST) dynamic scans run against pre-production staging environments prior to promotion.',
        confidence: 89,
        status: 'REVIEW' as const,
        auditorCritique: 'Verified by Dual-Model Audit against Secure Software Development Lifecycle (SSDLC) Policy.',
        verifiedFromVault: false,
        citations: [
          {
            sourceDocument: 'Acme Secure SDLC Policy v2.4',
            pageNumber: 6,
            excerpt: 'Automated CodeQL static analysis and GitGuardian secret scans execute on every pull request. Staging undergoes automated DAST testing prior to release.',
          },
        ],
      },

      // ── Tab 2: Needs Quick Check (Confidence 50% - 84%) ──
      {
        questionText: 'What is your contractual mean time to remediate (MTTR) for critical vs medium vulnerability findings?',
        answerText: 'Acme commits to remediating Critical vulnerabilities within 7 calendar days of verification and High severity vulnerabilities within 30 days. Medium severity findings are scheduled for the subsequent monthly sprint cycle (target 60 days).',
        confidence: 72,
        status: 'REVIEW' as const,
        auditorCritique: 'Auditor Critique: SOC 2 Report Section 3.4 specifies 7-day SLA for critical findings, but the remediation timeframe for medium findings is not explicitly codified in customer contracts. Human confirmation is required before committing to 30 vs 60 days.',
        verifiedFromVault: false,
        citations: [
          {
            sourceDocument: 'Acme Vulnerability Management Standard',
            pageNumber: 8,
            excerpt: 'Critical severity vulnerabilities must be remediated within 7 days. High vulnerabilities within 30 days. Medium severity findings are remediated on a best-effort basis.',
          },
        ],
      },
      {
        questionText: 'Does your platform support customer-managed encryption keys (CMEK / BYOK) with automatic key revocation?',
        answerText: 'Enterprise tier customers can provide an AWS KMS key ARN for envelope encryption of their dedicated tenant data partition. In the event of customer key revocation or policy disabling, data access ceases immediately across all worker nodes.',
        confidence: 76,
        status: 'REVIEW' as const,
        auditorCritique: 'Auditor Critique: AWS KMS envelope encryption is documented for Enterprise plans, but multi-region BYOK key rotation and customer revocation procedures require verification with the security engineering team.',
        verifiedFromVault: false,
        citations: [
          {
            sourceDocument: 'Acme Enterprise Security Whitepaper',
            pageNumber: 14,
            excerpt: 'Dedicated enterprise clusters support customer-managed AWS KMS keys (BYOK). Customer disables key access to render tenant partition inaccessible.',
          },
        ],
      },
      {
        questionText: 'Are background checks mandatory for global contractors and third-party consultants before receiving repository access?',
        answerText: 'Comprehensive criminal background checks are mandatory for all US and international personnel prior to system access. For overseas third-party contractors, background verification is performed via accredited regional screening partners (Checkr / Sterling).',
        confidence: 78,
        status: 'REVIEW' as const,
        auditorCritique: 'Auditor Critique: Background verification is documented for all US full-time employees; international contractor screening requirements require verification against the HR vendor policy.',
        verifiedFromVault: false,
        citations: [
          {
            sourceDocument: 'Acme Human Resources Security Policy',
            pageNumber: 4,
            excerpt: 'Pre-employment criminal and educational background checks are conducted on US employees through Checkr prior to start date.',
          },
        ],
      },
      {
        questionText: 'What is your financial service credit structure for unplanned downtime below the 99.9% availability threshold?',
        answerText: 'Standard SLA terms provide a 10% monthly service credit if uptime falls between 99.0% and 99.9%, and a 25% credit if uptime drops below 99.0% in any calendar month, excluding scheduled maintenance windows announced 5 business days in advance.',
        confidence: 81,
        status: 'REVIEW' as const,
        auditorCritique: 'Auditor Critique: 99.9% uptime is verified in standard SLA terms, but customized tier credits (10% vs 25% credit) depend on specific enterprise master service agreements. Check customer order form.',
        verifiedFromVault: false,
        citations: [
          {
            sourceDocument: 'Acme Master Service Agreement (Terms)',
            pageNumber: 19,
            excerpt: 'Service availability is calculated on a calendar month basis. Credits are provided upon written request within 30 days of incident.',
          },
        ],
      },
      {
        questionText: 'Is customer tenant data logically isolated using schema-based multi-tenancy or dedicated physical database instances?',
        answerText: 'Standard tiers utilize logical tenant isolation enforced by PostgreSQL Row-Level Security (RLS) with parameterized tenant context queries. Enterprise Dedicated tiers offer physically isolated Amazon Aurora PostgreSQL clusters with dedicated VPC peering.',
        confidence: 74,
        status: 'REVIEW' as const,
        auditorCritique: 'Auditor Critique: Row-Level Security (RLS) with tenant ID partitioning is verified for multi-tenant tiers; confirmation is needed if physical isolation is offered as an enterprise add-on.',
        verifiedFromVault: false,
        citations: [
          {
            sourceDocument: 'Acme Infrastructure Architecture Overview (2024)',
            pageNumber: 11,
            excerpt: 'Multi-tenant database isolation is enforced via database roles and row-level security policies filtering on workspace_id.',
          },
        ],
      },

      // ── Tab 3: Missing Evidence (Confidence < 50%) ──
      // STRICT GUARDRAIL: Never display a guessed or hallucinated answer here!
      {
        questionText: 'Does Acme maintain on-premises data centers in the APAC region equipped with biometric mantrap access controls?',
        answerText: null, // STRICT GUARDRAIL: null answer
        confidence: 20,
        status: 'DRAFT' as const,
        auditorCritique: 'Vaultix refused to guess because no uploaded document covers this topic. All verified knowledge base documents specify multi-region AWS cloud hosting; no APAC on-premises physical data center facilities exist in documentation.',
        verifiedFromVault: false,
        citations: [],
      },
      {
        questionText: 'Has your organization achieved FedRAMP High Authorization from the Joint Authorization Board (JAB)?',
        answerText: null, // STRICT GUARDRAIL: null answer
        confidence: 25,
        status: 'DRAFT' as const,
        auditorCritique: 'Vaultix refused to guess because no uploaded document covers this topic. Documentation confirms SOC 2 Type II and ISO 27001; FedRAMP certification status is not found in the uploaded evidence.',
        verifiedFromVault: false,
        citations: [],
      },
    ];

    const questionnaire = await this.prisma.questionnaire.create({
      data: {
        workspaceId,
        name: 'Acme Cloud SaaS — SOC 2 Type II + Enterprise Security Assessment',
        fileName: 'Acme_SOC2_Enterprise_Assessment_2025.xlsx',
        fileType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        status: 'REVIEW',
        isUnlocked: true,
        totalQuestions: demoQuestions.length,
        answeredCount: demoQuestions.filter((q) => q.answerText !== null).length,
        approvedCount: demoQuestions.filter((q) => q.status === 'APPROVED').length,
      },
    });

    for (let i = 0; i < demoQuestions.length; i++) {
      const qData = demoQuestions[i];
      const createdQ = await this.prisma.question.create({
        data: {
          questionnaireId: questionnaire.id,
          rowIndex: i,
          questionText: qData.questionText,
          answerText: qData.answerText,
          confidence: qData.confidence,
          status: qData.status,
          auditorCritique: qData.auditorCritique,
          verifiedFromVault: qData.verifiedFromVault,
        },
      });

      if (qData.citations && qData.citations.length > 0) {
        await this.prisma.citation.createMany({
          data: qData.citations.map((c) => ({
            questionId: createdQ.id,
            sourceDocument: c.sourceDocument,
            pageNumber: c.pageNumber,
            excerpt: c.excerpt,
          })),
        });
      }
    }

    await this.auditService.logAction({
      userId,
      workspaceId,
      action: 'questionnaire.created_demo',
      entity: questionnaire.name,
      entityId: questionnaire.id,
      details: {
        totalQuestions: demoQuestions.length,
        isDemoSandbox: true,
      },
    });

    return questionnaire;
  }

  async exportToExcel(workspaceId: string, id: string) {
    const questionnaire = await this.prisma.questionnaire.findUnique({
      where: { id, workspaceId },
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

    const buffer = await this.roundtripService.exportPreservedExcel(
      id,
      questionnaire.questions,
    );

    const baseName = this.sanitizeFileBaseName(
      questionnaire.fileName || questionnaire.name,
    );
    const fileName = `${baseName}_completed.xlsx`;

    return {
      buffer,
      fileName,
    };
  }
}
