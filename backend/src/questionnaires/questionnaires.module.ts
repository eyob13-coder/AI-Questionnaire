import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { BullModule } from '@nestjs/bullmq';
import { memoryStorage } from 'multer';
import { QuestionnairesService } from './questionnaires.service';
import { QuestionnairesController } from './questionnaires.controller';
import { RagModule } from '../rag/rag.module';
import { QUESTIONNAIRE_GENERATION_QUEUE } from '../queue/queue.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    RagModule,
    AuditModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
    BullModule.registerQueue({ name: QUESTIONNAIRE_GENERATION_QUEUE }),
  ],
  providers: [QuestionnairesService],
  controllers: [QuestionnairesController],
  exports: [QuestionnairesService],
})
export class QuestionnairesModule { }
