import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workspaces/:workspaceId/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles(Role.OWNER, Role.EDITOR, Role.VIEWER)
  @ApiOperation({ summary: 'Get aggregated stats for the workspace dashboard' })
  async getStats(@Param('workspaceId') workspaceId: string) {
    return this.dashboardService.getWorkspaceStats(workspaceId);
  }

  @Get('activity')
  @Roles(Role.OWNER, Role.EDITOR, Role.VIEWER)
  @ApiOperation({ summary: 'Get recent questionnaire activity' })
  async getActivity(@Param('workspaceId') workspaceId: string) {
    return this.dashboardService.getRecentActivity(workspaceId);
  }
}
