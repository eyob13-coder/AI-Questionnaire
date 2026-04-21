import {
  Controller,
  Post,
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
import { KnowledgeService } from './knowledge.service';

@ApiTags('Knowledge Base')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workspaces/:workspaceId/knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post('upload')
  @Roles(Role.OWNER, Role.EDITOR)
  @ApiOperation({
    summary: 'Upload and process a document into the Knowledge Base',
  })
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
  async uploadDocument(
    @Param('workspaceId') workspaceId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: /(pdf|docx|txt)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.knowledgeService.processAndUploadDocument(workspaceId, file);
  }
}
