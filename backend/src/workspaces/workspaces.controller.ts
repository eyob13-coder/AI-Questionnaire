import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  UseGuards,
  Param,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { WorkspacesService } from './workspaces.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@ApiTags('Workspaces')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) { }

  @Get()
  @ApiOperation({ summary: 'List all workspaces for the authenticated user' })
  async getMyWorkspaces(@CurrentUser('id') userId: string) {
    return this.workspacesService.getUserWorkspaces(userId);
  }

  @Post('bootstrap')
  @ApiOperation({ summary: 'Create a default workspace if the user has none' })
  async bootstrapWorkspace(@CurrentUser('id') userId: string) {
    return this.workspacesService.ensurePersonalWorkspace(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workspace details and stats' })
  async getWorkspaceDetails(
    @Param('id') workspaceId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.workspacesService.getWorkspaceDetails(workspaceId, userId);
  }

  @Patch(':workspaceId')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Update workspace (owner only)' })
  async update(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    return this.workspacesService.update(workspaceId, dto);
  }

  @Get(':workspaceId/members')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.EDITOR, Role.VIEWER)
  @ApiOperation({ summary: 'List all members in the workspace' })
  async getWorkspaceMembers(@Param('workspaceId') workspaceId: string) {
    return this.workspacesService.getMembers(workspaceId);
  }

  @Post(':workspaceId/members')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Invite (or add) a member by email' })
  async inviteMember(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.workspacesService.inviteMember(workspaceId, dto.email, dto.role);
  }

  @Delete(':workspaceId/members/:memberId')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Remove a member from the workspace' })
  async removeMember(
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
    @CurrentUser('id') userId: string,
  ) {
    const member = await this.workspacesService.getMemberById(memberId);
    if (!member || member.workspaceId !== workspaceId) {
      throw new ForbiddenException('Member not found in workspace');
    }
    if (member.role === Role.OWNER) {
      throw new ForbiddenException('Cannot remove workspace owner');
    }
    if (member.userId === userId) {
      throw new ForbiddenException('Use leave workspace instead');
    }
    return this.workspacesService.removeMember(memberId);
  }

  @Get(':workspaceId/notifications')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.EDITOR, Role.VIEWER)
  @ApiOperation({ summary: 'Get workspace notifications for the topbar bell' })
  async getNotifications(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? Number(limit) : 8;
    return this.workspacesService.getNotifications(workspaceId, userId, parsedLimit);
  }

  @Patch(':workspaceId/notifications/:notificationId/read')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.EDITOR, Role.VIEWER)
  @ApiOperation({ summary: 'Mark a single notification as read' })
  async markNotificationRead(
    @Param('workspaceId') workspaceId: string,
    @Param('notificationId') notificationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.workspacesService.markNotificationRead(
      workspaceId,
      userId,
      notificationId,
    );
  }

  @Post(':workspaceId/notifications/read-all')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.EDITOR, Role.VIEWER)
  @ApiOperation({ summary: 'Mark all fetched notifications as read' })
  async markAllNotificationsRead(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.workspacesService.markAllNotificationsRead(workspaceId, userId);
  }
}
