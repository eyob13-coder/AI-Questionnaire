// Trigger restart for auth fixes
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { QueueModule } from './queue/queue.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { QuestionnairesModule } from './questionnaires/questionnaires.module';
import { RagModule } from './rag/rag.module';
import { AuditModule } from './audit/audit.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { BillingModule } from './billing/billing.module';
import { ResourcesModule } from './resources/resources.module';
import { MailerModule } from './mailer/mailer.module';

const getQueueModuleImports = () => {
  // For now, always include QueueModule but it won't connect if Redis is disabled
  return [QueueModule];
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    RedisModule,
    ...getQueueModuleImports(),
    AuthModule,
    UsersModule,
    WorkspacesModule,
    KnowledgeModule,
    QuestionnairesModule,
    RagModule,
    AuditModule,
    DashboardModule,
    BillingModule,
    ResourcesModule,
    MailerModule,
  ],
})
export class AppModule { }
