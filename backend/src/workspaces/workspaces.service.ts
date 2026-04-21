import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserWorkspaces(userId: string) {
    const memberships = await this.prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: true,
      },
      orderBy: { joinedAt: 'asc' },
    });

    return memberships.map((m) => m.workspace);
  }

  async getWorkspaceDetails(workspaceId: string, userId: string) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
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

    return {
      ...member.workspace,
      myRole: member.role,
    };
  }

  async getMembers(workspaceId: string) {
    return this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });
  }
}
