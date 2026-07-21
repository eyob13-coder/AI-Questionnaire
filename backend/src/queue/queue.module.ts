import { Module, Logger } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
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
        const isDisabled = configService.get<boolean>('REDIS_DISABLED', false);
        
        if (isDisabled) {
          logger.warn('Redis is disabled - BullMQ job queues will not work');
        }

        return {
          connection: {
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
            password: configService.get<string>('REDIS_PASSWORD', '') || undefined,
            maxRetriesPerRequest: null,
            // Aggressive retry backoff to fail fast if Redis is down
            retryStrategy: (times: number) => {
              if (times > 3) return null;
              return Math.min(times * 100, 300);
            },
            connectTimeout: 2000,
            commandTimeout: 2000,
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
export class QueueModule {}
