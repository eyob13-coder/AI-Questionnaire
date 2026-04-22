import { Controller, Get, UseGuards, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AuditService } from './audit.service';

@ApiTags('Audit Log')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workspaces/:workspaceId/audit')
export class AuditController {
    constructor(private readonly auditService: AuditService) { }

    @Get()
    @Roles(Role.OWNER, Role.EDITOR, Role.VIEWER)
    @ApiOperation({ summary: 'List audit log entries for the workspace' })
    async list(
        @Param('workspaceId') workspaceId: string,
        @Query('limit') limit?: string,
        @Query('skip') skip?: string,
    ) {
        const take = Math.min(Number(limit) || 50, 200);
        const offset = Math.max(Number(skip) || 0, 0);
        return this.auditService.getLogsForWorkspace(workspaceId, take, offset);
    }
}
