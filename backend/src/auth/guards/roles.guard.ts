import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '@prisma/client';

function isDbConnectionError(error: unknown): boolean {
  const e = error as { code?: string; message?: string };
  const code = e?.code;
  const message = (e?.message || '').toLowerCase();

  return (
    code === 'P1017' ||
    code === 'P1001' ||
    code === 'P1008' ||
    code === 'ETIMEDOUT' ||
    message.includes('server has closed the connection') ||
    message.includes('connection closed') ||
    message.includes('timed out')
  );
}

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const workspaceId =
      request.headers['x-workspace-id'] || request.params.workspaceId;

    if (!user || !workspaceId) {
      throw new ForbiddenException('Workspace context required');
    }

    let member: { role: Role } | null;
    try {
      member = await this.prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: user.id,
            workspaceId,
          },
        },
      });
    } catch (error) {
      if (isDbConnectionError(error)) {
        this.logger.warn(
          `Database unavailable while checking roles for workspace ${workspaceId}`,
        );
        throw new ServiceUnavailableException(
          'Database is temporarily unavailable. Please retry in a moment.',
        );
      }
      throw error;
    }

    if (!member) {
      throw new ForbiddenException('Not a member of this workspace');
    }

    if (!requiredRoles.includes(member.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    // Attach the workspace membership to the request for downstream use
    request.workspaceMember = member;
    return true;
  }
}
