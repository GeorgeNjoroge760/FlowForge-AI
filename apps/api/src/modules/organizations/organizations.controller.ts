import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Get()
  @ApiOperation({ description: 'List organizations for current user' })
  async listOrganizations(@CurrentUser() user: any) {
    return this.organizationsService.findByUser(user.id);
  }

  @Post()
  @ApiOperation({ description: 'Create a new organization' })
  async createOrganization(
    @CurrentUser() user: any,
    @Body() body: { name: string },
  ) {
    return this.organizationsService.create(user.id, body);
  }

  @Get(':id')
  @ApiOperation({ description: 'Get organization by ID' })
  async getOrganization(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.organizationsService.findById(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ description: 'Update organization' })
  async updateOrganization(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { name?: string; logoUrl?: string },
  ) {
    return this.organizationsService.update(id, user.id, body);
  }
}
