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
import { IntegrationsService } from './integrations.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('integrations')
@Controller('integrations')
export class IntegrationsController {
  constructor(private integrationsService: IntegrationsService) {}

  @Get()
  @ApiOperation({ summary: 'List connected integrations' })
  async listIntegrations(@CurrentUser() user: any) {
    return this.integrationsService.findAll(user.organizationId);
  }

  @Get(':provider')
  @ApiOperation({ summary: 'Get integration by provider' })
  async getIntegration(@Param('provider') provider: string, @CurrentUser() user: any) {
    return this.integrationsService.findByProvider(user.organizationId, provider);
  }

  @Post(':provider/connect')
  @ApiOperation({ summary: 'Connect a provider' })
  async connectProvider(
    @Param('provider') provider: string,
    @CurrentUser() user: any,
    @Body() body: { displayName?: string; metadata?: any } = {},
  ) {
    return this.integrationsService.connect(user.organizationId, {
      provider,
      displayName: body.displayName || provider,
      metadata: body.metadata,
    });
  }

  @Delete(':provider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disconnect an integration' })
  async disconnectIntegration(@Param('provider') provider: string, @CurrentUser() user: any) {
    return this.integrationsService.disconnectByProvider(provider, user.organizationId);
  }
}
