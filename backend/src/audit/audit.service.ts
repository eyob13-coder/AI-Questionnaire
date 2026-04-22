import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateAuditLogData {
  userId: string;
  workspaceId: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) { }

  async logAction(data: CreateAuditLogData) {
    try {
      await this.prisma.auditLog.create({
        data,
      });
    } catch (error) {
      // We don't want audit log failures to crash the main transaction
      this.logger.error('Failed to write audit log', error);
    }
  }

  async getLogsForWorkspace(workspaceId: string, limit = 50, skip = 0) {
    return this.prisma.auditLog.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }
}
