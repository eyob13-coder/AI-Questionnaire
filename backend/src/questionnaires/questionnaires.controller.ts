import {
  Controller,
  Post,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Param,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
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
import { Role } from '@prisma/client';
import { QuestionnairesService } from './questionnaires.service';

@ApiTags('Questionnaires')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workspaces/:workspaceId/questionnaires')
export class QuestionnairesController {
  constructor(private readonly questionnairesService: QuestionnairesService) { }

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
          // Accepting excel formats
          new FileTypeValidator({ fileType: /(csv|spreadsheetml|excel)/ }),
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
}
