import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { DocumentProcessingProcessor } from './processors/document-processing.processor';
import { QuestionnaireGenerationProcessor } from './processors/questionnaire-generation.processor';
import { RagModule } from '../rag/rag.module';

export const DOCUMENT_PROCESSING_QUEUE = 'document-processing';
export const QUESTIONNAIRE_GENERATION_QUEUE = 'questionnaire-generation';

@Module({
  imports: [
    RagModule,
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD', '') || undefined,
          maxRetriesPerRequest: null,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: DOCUMENT_PROCESSING_QUEUE },
      { name: QUESTIONNAIRE_GENERATION_QUEUE },
    ),
  ],
  providers: [DocumentProcessingProcessor, QuestionnaireGenerationProcessor],
  exports: [BullModule],
})
export class QueueModule {}
