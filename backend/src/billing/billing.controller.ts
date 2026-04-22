import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { BillingService } from './billing.service';

@ApiTags('Billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workspaces/:workspaceId/billing')
export class BillingController {
    constructor(private readonly billingService: BillingService) { }

    @Get()
    @Roles(Role.OWNER, Role.EDITOR, Role.VIEWER)
    @ApiOperation({ summary: 'Get billing plan and usage for workspace' })
    async getBilling(@Param('workspaceId') workspaceId: string) {
        return this.billingService.getBilling(workspaceId);
    }
}
