import { Module, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { BullModule, getQueueToken } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { DocumentProcessingProcessor } from './processors/document-processing.processor';
import { QuestionnaireGenerationProcessor } from './processors/questionnaire-generation.processor';
import { RagModule } from '../rag/rag.module';

export const DOCUMENT_PROCESSING_QUEUE = 'document-processing';
export const QUESTIONNAIRE_GENERATION_QUEUE = 'questionnaire-generation';

const logger = new Logger('QueueModule');

@Module({
  imports: [
    RagModule,
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const rawDisabled = configService.get<string | boolean>('REDIS_DISABLED', false);
        const isDisabled = String(rawDisabled).toLowerCase() === 'true';

        if (isDisabled) {
          logger.warn('⚠️  Redis is disabled — BullMQ job queues will not connect');
        }

        const redisUrl = configService.get<string>('REDIS_URL');
        let connectionConfig: Record<string, any>;

        if (redisUrl) {
          try {
            const parsed = new URL(redisUrl);
            connectionConfig = {
              host: parsed.hostname === 'localhost' ? '127.0.0.1' : parsed.hostname,
              port: Number.parseInt(parsed.port || '6379', 10),
              password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
              username: parsed.username ? decodeURIComponent(parsed.username) : undefined,
              tls: parsed.protocol === 'rediss:' ? {} : undefined,
            };
          } catch {
            connectionConfig = { host: '127.0.0.1', port: 6379 };
          }
        } else {
          const rawHost = configService.get<string>('REDIS_HOST', '127.0.0.1');
          connectionConfig = {
            host: rawHost === 'localhost' ? '127.0.0.1' : rawHost,
            port: configService.get<number>('REDIS_PORT', 6379),
            password: configService.get<string>('REDIS_PASSWORD', '') || undefined,
          };
        }

        return {
          connection: {
            ...connectionConfig,
            enableOfflineQueue: false,
            maxRetriesPerRequest: null,
            lazyConnect: true,
            retryStrategy: (times: number) => {
              if (isDisabled) return null;
              if (times > 2) return null;
              return Math.min(times * 500, 2000);
            },
            connectTimeout: 1000,
            commandTimeout: 1000,
          },
        };
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: DOCUMENT_PROCESSING_QUEUE },
      { name: QUESTIONNAIRE_GENERATION_QUEUE },
    ),
  ],
  providers: [DocumentProcessingProcessor, QuestionnaireGenerationProcessor],
  exports: [BullModule, QuestionnaireGenerationProcessor, DocumentProcessingProcessor],
})
export class QueueModule implements OnModuleInit {
  constructor(
    @Inject(getQueueToken(DOCUMENT_PROCESSING_QUEUE))
    private readonly docQueue: Queue,
    @Inject(getQueueToken(QUESTIONNAIRE_GENERATION_QUEUE))
    private readonly questQueue: Queue,
  ) {}

  onModuleInit() {
    const noop = () => {};
    this.docQueue.on('error', noop);
    this.questQueue.on('error', noop);
    this.docQueue.client?.then?.((c: any) => c?.on?.('error', noop)).catch?.(noop);
    this.questQueue.client?.then?.((c: any) => c?.on?.('error', noop)).catch?.(noop);
  }
}
