import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { BullModule } from '@nestjs/bullmq';
import { memoryStorage } from 'multer';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController } from './knowledge.controller';
import { RagModule } from '../rag/rag.module';
import { DOCUMENT_PROCESSING_QUEUE } from '../queue/queue.module';

import { BillingModule } from '../billing/billing.module';

import { TechSyncService } from './tech-sync.service';

@Module({
  imports: [
    RagModule,
    BillingModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
    BullModule.registerQueue({ name: DOCUMENT_PROCESSING_QUEUE }),
  ],
  providers: [KnowledgeService, TechSyncService],
  controllers: [KnowledgeController],
  exports: [KnowledgeService, TechSyncService],
})
export class KnowledgeModule { }
