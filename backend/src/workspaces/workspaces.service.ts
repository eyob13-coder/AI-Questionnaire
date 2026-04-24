import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Role } from '@prisma/client';
import { RedisService } from '../redis/redis.service';
import { BillingService } from '../billing/billing.service';

type NotificationPriority = 'info' | 'success' | 'warning' | 'danger';

export interface WorkspaceNotification {
  id: string;
  workspaceId: string;
  kind: string;
  priority: NotificationPriority;
  title: string;
  message: string;
  href: string | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
  actorName?: string | null;
}

@Injectable()
export class WorkspacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly billing: BillingService,
  ) {}

  private readKey(workspaceId: string, userId: string) {
    return `notifications:workspace:${workspaceId}:user:${userId}:read`;
  }

  private async ensureWorkspaceMembership(workspaceId: string, userId: string) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
      select: { id: true },
    });

    if (!member) {
      throw new NotFoundException('Workspace not found or access denied');
    }
  }

  private async getReadIds(workspaceId: string, userId: string) {
    const key = this.readKey(workspaceId, userId);

    try {
      const raw = await this.redis.get(key);
      if (!raw) return new Set<string>();

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return new Set<string>();

      return new Set<string>(parsed.filter((id): id is string => typeof id === 'string'));
    } catch {
      return new Set<string>();
    }
  }

  private async persistReadIds(
    workspaceId: string,
    userId: string,
    ids: Set<string>,
  ) {
    const key = this.readKey(workspaceId, userId);

    try {
      await this.redis.setex(
        key,
        60 * 60 * 24 * 30, // 30 days
        JSON.stringify(Array.from(ids)),
      );
    } catch {
      // Redis may be down; fail soft so notifications endpoint still works.
    }
  }

  private async buildNotifications(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceNotification[]> {
    const [questionnaires, documents, logs, readIds] = await Promise.all([
      this.prisma.questionnaire.findMany({
        where: { workspaceId },
        orderBy: { updatedAt: 'desc' },
        take: 25,
        select: {
          id: true,
          name: true,
          status: true,
          updatedAt: true,
          answeredCount: true,
          totalQuestions: true,
        },
      }),
      this.prisma.document.findMany({
        where: { workspaceId },
        orderBy: { updatedAt: 'desc' },
        take: 25,
        select: {
          id: true,
          fileName: true,
          status: true,
          updatedAt: true,
        },
      }),
      this.prisma.auditLog.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
        take: 25,
        select: {
          id: true,
          action: true,
          entity: true,
          createdAt: true,
          user: {
            select: { name: true },
          },
        },
      }),
      this.getReadIds(workspaceId, userId),
    ]);

    const questionnaireNotifications: WorkspaceNotification[] = questionnaires
      .filter((q) => q.status !== 'PROCESSING')
      .map((q) => {
        let kind = 'SYSTEM';
        let priority: NotificationPriority = 'info';
        let title = 'Questionnaire updated';
        let message = `${q.name} has been updated.`;

        if (q.status === 'COMPLETED') {
          kind = 'QUESTIONNAIRE_COMPLETED';
          priority = 'success';
          title = 'Questionnaire completed';
          message = `${q.name} is complete and ready for export.`;
        } else if (q.status === 'REVIEW') {
          kind = 'QUESTIONNAIRE_REVIEW_REQUIRED';
          priority = 'warning';
          title = 'Review required';
          message = `${q.name} needs review before final export.`;
        } else if (q.status === 'GENERATING') {
          kind = 'SYSTEM';
          priority = 'info';
          title = 'Answer generation in progress';
          message = `${q.name} is currently generating answers.`;
        }

        const id = `questionnaire:${q.id}`;

        return {
          id,
          workspaceId,
          kind,
          priority,
          title,
          message,
          href: `/dashboard/questionnaires/${q.id}`,
          isRead: readIds.has(id),
          createdAt: q.updatedAt.toISOString(),
          readAt: readIds.has(id) ? q.updatedAt.toISOString() : null,
        };
      });

    const documentNotifications: WorkspaceNotification[] = documents
      .filter((d) => d.status === 'READY' || d.status === 'FAILED')
      .map((d) => {
        const ready = d.status === 'READY';
        const id = `document:${d.id}`;

        return {
          id,
          workspaceId,
          kind: ready ? 'KNOWLEDGE_INDEXED' : 'KNOWLEDGE_FAILED',
          priority: ready ? 'success' : 'danger',
          title: ready ? 'Knowledge indexed' : 'Knowledge indexing failed',
          message: ready
            ? `${d.fileName} is now available for AI retrieval.`
            : `${d.fileName} could not be indexed. Retry upload or review file format.`,
          href: '/dashboard/knowledge',
          isRead: readIds.has(id),
          createdAt: d.updatedAt.toISOString(),
          readAt: readIds.has(id) ? d.updatedAt.toISOString() : null,
        };
      });

    const teamNotifications: WorkspaceNotification[] = logs
      .filter((log) =>
        ['MEMBER_INVITED', 'MEMBER_REMOVED', 'ROLE_UPDATED'].includes(log.action),
      )
      .map((log) => {
        const id = `audit:${log.id}`;

        return {
          id,
          workspaceId,
          kind: 'TEAM_ACTIVITY',
          priority: 'info',
          title: 'Team activity',
          message: `${log.user?.name ?? 'A teammate'} performed ${log.action.toLowerCase().replace(/_/g, ' ')}.`,
          href: '/dashboard/team',
          isRead: readIds.has(id),
          createdAt: log.createdAt.toISOString(),
          readAt: readIds.has(id) ? log.createdAt.toISOString() : null,
          actorName: log.user?.name ?? null,
        };
      });

    return [...questionnaireNotifications, ...documentNotifications, ...teamNotifications]
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  private toSlug(value: string): string {
    const base = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    return base || `workspace-${Math.random().toString(36).slice(2, 8)}`;
  }

  private async buildUniqueSlug(
    tx: Prisma.TransactionClient,
    base: string,
  ): Promise<string> {
    let slug = base;
    let attempts = 0;

    while (attempts < 10) {
      const existing = await tx.workspace.findUnique({ where: { slug } });
      if (!existing) return slug;
      slug = `${base}-${Math.random().toString(36).slice(2, 7)}`;
      attempts += 1;
    }

    return `${base}-${Date.now().toString(36)}`;
  }

  async ensurePersonalWorkspace(userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const existingMembership = await tx.workspaceMember.findFirst({
        where: { userId },
        include: { workspace: true },
        orderBy: { joinedAt: 'asc' },
      });

      if (existingMembership) {
        return { ...existingMembership.workspace, myRole: existingMembership.role };
      }

      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, company: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const workspaceName = user.company
        ? `${user.company} Workspace`
        : `${user.name}'s Workspace`;
      const baseSlug = this.toSlug(workspaceName);
      const slug = await this.buildUniqueSlug(tx, baseSlug);

      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName,
          slug,
          members: {
            create: {
              userId: user.id,
              role: Role.OWNER,
            },
          },
        },
      });

      return { ...workspace, myRole: Role.OWNER };
    });
  }

  async getUserWorkspaces(userId: string) {
    const memberships = await this.prisma.workspaceMember.findMany({
      where: { userId },
      include: { workspace: true },
      orderBy: { joinedAt: 'asc' },
    });
    return memberships.map((m) => ({ ...m.workspace, myRole: m.role }));
  }

  async getWorkspaceDetails(workspaceId: string, userId: string) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
      include: {
        workspace: {
          include: {
            _count: {
              select: { members: true, documents: true, questionnaires: true },
            },
          },
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Workspace not found or access denied');
    }

    return { ...member.workspace, myRole: member.role };
  }

  async update(
    workspaceId: string,
    data: { name?: string; slug?: string },
  ) {
    if (data.slug) {
      const existing = await this.prisma.workspace.findUnique({
        where: { slug: data.slug },
      });
      if (existing && existing.id !== workspaceId) {
        throw new ConflictException('Slug already in use');
      }
    }
    return this.prisma.workspace.update({
      where: { id: workspaceId },
      data,
    });
  }

  async deleteWorkspace(workspaceId: string) {
    return this.prisma.workspace.delete({
      where: { id: workspaceId },
    });
  }

  async getMembers(workspaceId: string) {
    return this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      orderBy: { joinedAt: 'asc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true, avatarUrl: true },
        },
      },
    });
  }

  async getMemberById(memberId: string) {
    return this.prisma.workspaceMember.findUnique({
      where: { id: memberId },
    });
  }

  async inviteMember(workspaceId: string, email: string, role: Role) {
    await this.billing.checkLimit(workspaceId, 'members');

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // For now we require the user to already have an account. A proper
      // invite-by-email flow would create a pending Verification record and
      // send an email — left as a follow-up.
      throw new BadRequestException(
        'No account exists for that email. Ask them to sign up first.',
      );
    }

    const existing = await this.prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: user.id, workspaceId } },
    });
    if (existing) {
      throw new ConflictException('User is already a member');
    }

    return this.prisma.workspaceMember.create({
      data: { workspaceId, userId: user.id, role },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });
  }

  async removeMember(memberId: string) {
    await this.prisma.workspaceMember.delete({ where: { id: memberId } });
    return { success: true };
  }

  async getNotifications(workspaceId: string, userId: string, limit = 8) {
    await this.ensureWorkspaceMembership(workspaceId, userId);

    const safeLimit = Number.isFinite(limit)
      ? Math.max(1, Math.min(Math.trunc(limit), 50))
      : 8;

    const all = await this.buildNotifications(workspaceId, userId);
    const items = all.slice(0, safeLimit);
    const unreadCount = items.filter((item) => !item.isRead).length;

    return { items, unreadCount };
  }

  async markNotificationRead(
    workspaceId: string,
    userId: string,
    notificationId: string,
  ) {
    await this.ensureWorkspaceMembership(workspaceId, userId);

    const readIds = await this.getReadIds(workspaceId, userId);
    readIds.add(notificationId);
    await this.persistReadIds(workspaceId, userId, readIds);

    const items = await this.buildNotifications(workspaceId, userId);
    const item = items.find((entry) => entry.id === notificationId);
    const unreadCount = items.filter((entry) => !entry.isRead).length;

    return { item, unreadCount };
  }

  async markAllNotificationsRead(workspaceId: string, userId: string) {
    await this.ensureWorkspaceMembership(workspaceId, userId);

    const items = await this.buildNotifications(workspaceId, userId);
    const readIds = await this.getReadIds(workspaceId, userId);

    for (const item of items) {
      readIds.add(item.id);
    }

    await this.persistReadIds(workspaceId, userId, readIds);

    return { unreadCount: 0 };
  }
}
