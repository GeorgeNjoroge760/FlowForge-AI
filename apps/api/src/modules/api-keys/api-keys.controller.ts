import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('api-keys')
@Controller('api-keys')
export class ApiKeysController {
  constructor(private apiKeysService: ApiKeysService) {}

  @Get()
  @ApiOperation({ summary: 'List API keys' })
  async listApiKeys(@CurrentUser() user: any) {
    return this.apiKeysService.findAll(user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get API key by ID' })
  async getApiKey(@Param('id') id: string, @CurrentUser() user: any) {
    return this.apiKeysService.findById(id, user.organizationId);
  }

  @Post()
  @ApiOperation({ summary: 'Create an API key' })
  async createApiKey(
    @CurrentUser() user: any,
    @Body() body: { name: string; expiresAt?: Date },
  ) {
    return this.apiKeysService.create(user.organizationId, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an API key' })
  async deleteApiKey(@Param('id') id: string, @CurrentUser() user: any) {
    return this.apiKeysService.delete(id, user.organizationId);
  }
}
