import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    RedisModule,
    QueueModule,
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
  ],
})
export class AppModule { }
