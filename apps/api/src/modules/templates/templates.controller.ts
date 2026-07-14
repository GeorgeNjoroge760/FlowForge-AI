import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('templates')
@Controller('templates')
export class TemplatesController {
  constructor(private templatesService: TemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'List organization templates' })
  async listTemplates(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.templatesService.findAll(user.organizationId, { page, limit, search, category });
  }

  @Get('public')
  @ApiOperation({ summary: 'List public templates' })
  async listPublicTemplates(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.templatesService.findPublic({ page, limit, search, category });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  async getTemplate(@Param('id') id: string, @CurrentUser() user: any) {
    return this.templatesService.findById(id, user.organizationId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a template' })
  async createTemplate(
    @CurrentUser() user: any,
    @Body() body: { name: string; description?: string; category?: string; definition?: any; isPublic?: boolean },
  ) {
    return this.templatesService.create(user.organizationId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a template' })
  async updateTemplate(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { name?: string; description?: string; category?: string; definition?: any; isPublic?: boolean },
  ) {
    return this.templatesService.update(id, user.organizationId, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a template' })
  async deleteTemplate(@Param('id') id: string, @CurrentUser() user: any) {
    return this.templatesService.delete(id, user.organizationId);
  }

  @Post(':id/clone')
  @ApiOperation({ summary: 'Clone a template' })
  async cloneTemplate(@Param('id') id: string, @CurrentUser() user: any) {
    return this.templatesService.clone(id, user.organizationId);
  }
}
