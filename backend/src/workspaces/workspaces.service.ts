import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) { }

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
}
