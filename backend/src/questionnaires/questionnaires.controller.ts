import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Param,
  ParseFilePipe,
  MaxFileSizeValidator,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiOperation,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { QuestionnairesService } from './questionnaires.service';
import { BillingService } from '../billing/billing.service';

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  answerText?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  saveToVault?: boolean;
}

@ApiTags('Questionnaires')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workspaces/:workspaceId/questionnaires')
export class QuestionnairesController {
  constructor(
    private readonly questionnairesService: QuestionnairesService,
    private readonly billingService: BillingService,
  ) { }

  @Post('demo-sandbox')
  @Roles(Role.OWNER, Role.EDITOR)
  @ApiOperation({ summary: 'Spawn instant 25-question Acme Cloud SOC 2 demo questionnaire' })
  async createDemoSandbox(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.questionnairesService.createDemoSandbox(workspaceId, userId);
  }

  @Post('upload')
  @Roles(Role.OWNER, Role.EDITOR)
  @ApiOperation({ summary: 'Upload and process an XLSX/CSV questionnaire' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadQuestionnaire(
    @Param('workspaceId') workspaceId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.questionnairesService.processAndUploadQuestionnaire(
      workspaceId,
      file,
    );
  }

  @Get()
  @Roles(Role.OWNER, Role.EDITOR, Role.VIEWER)
  @ApiOperation({ summary: 'List questionnaires in workspace' })
  async getQuestionnaires(@Param('workspaceId') workspaceId: string) {
    return this.questionnairesService.getQuestionnaires(workspaceId);
  }

  @Get(':questionnaireId')
  @Roles(Role.OWNER, Role.EDITOR, Role.VIEWER)
  @ApiOperation({
    summary: 'Get questionnaire details including questions and answers',
  })
  async getQuestionnaireDetails(
    @Param('workspaceId') workspaceId: string,
    @Param('questionnaireId') questionnaireId: string,
  ) {
    return this.questionnairesService.getQuestionnaireDetails(
      workspaceId,
      questionnaireId,
    );
  }

  @Patch(':questionnaireId/questions/:questionId')
  @Roles(Role.OWNER, Role.EDITOR)
  @ApiOperation({ summary: 'Update a question answer, status, and optionally save to Knowledge Vault' })
  async updateQuestion(
    @Param('workspaceId') workspaceId: string,
    @Param('questionnaireId') questionnaireId: string,
    @Param('questionId') questionId: string,
    @Body() body: UpdateQuestionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.questionnairesService.updateQuestionAnswer(
      workspaceId,
      questionnaireId,
      questionId,
      body,
      userId,
    );
  }

  @Post(':questionnaireId/bulk-approve')
  @Roles(Role.OWNER, Role.EDITOR)
  @ApiOperation({ summary: 'Approve all verified & grounded answers (confidence >= 85%)' })
  async bulkApproveVerified(
    @Param('workspaceId') workspaceId: string,
    @Param('questionnaireId') questionnaireId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.questionnairesService.bulkApproveVerified(
      workspaceId,
      questionnaireId,
      userId,
    );
  }

  @Delete(':questionnaireId')
  @Roles(Role.OWNER, Role.EDITOR)
  @ApiOperation({
    summary: 'Delete a questionnaire',
  })
  async deleteQuestionnaire(
    @Param('workspaceId') workspaceId: string,
    @Param('questionnaireId') questionnaireId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.questionnairesService.deleteQuestionnaire(
      workspaceId,
      questionnaireId,
      userId,
    );
  }

  @Get(':questionnaireId/export')
  @Roles(Role.OWNER, Role.EDITOR, Role.VIEWER)
  @ApiOperation({ summary: 'Export questionnaire as Excel' })
  async export(
    @Param('workspaceId') workspaceId: string,
    @Param('questionnaireId') questionnaireId: string,
    @Res() res: Response,
  ) {
    const isAllowed = await this.billingService.checkQuestionnaireExportAccess(
      workspaceId,
      questionnaireId,
    );

    if (!isAllowed) {
      throw new HttpException(
        {
          statusCode: HttpStatus.PAYMENT_REQUIRED,
          error: 'Payment Required',
          message:
            'Questionnaire export requires an active Pro subscription or a Single Deal Pass.',
          code: 'EXPORT_LOCKED',
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    const { buffer, fileName } = await this.questionnairesService.exportToExcel(
      workspaceId,
      questionnaireId,
    );

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}

