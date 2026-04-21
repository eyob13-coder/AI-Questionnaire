import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
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

    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
    });

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
