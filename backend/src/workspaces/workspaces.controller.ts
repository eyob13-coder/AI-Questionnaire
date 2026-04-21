import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { WorkspacesService } from './workspaces.service';

@ApiTags('Workspaces')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  @ApiOperation({ summary: 'List all workspaces for the authenticated user' })
  async getMyWorkspaces(@CurrentUser('id') userId: string) {
    return this.workspacesService.getUserWorkspaces(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workspace details and stats' })
  async getWorkspaceDetails(
    @Param('id') workspaceId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.workspacesService.getWorkspaceDetails(workspaceId, userId);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'List all members in the workspace' })
  async getWorkspaceMembers(@Param('id') workspaceId: string) {
    return this.workspacesService.getMembers(workspaceId);
  }
}
