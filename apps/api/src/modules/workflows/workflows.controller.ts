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
import { WorkflowsService } from './workflows.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('workflows')
@Controller('workflows')
export class WorkflowsController {
  constructor(private workflowsService: WorkflowsService) {}

  @Get()
  @ApiOperation({ description: 'List workflows' })
  async listWorkflows(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.workflowsService.findAll(user.organizationId, {
      page,
      limit,
      search,
      status,
    });
  }

  @Get('stats')
  @ApiOperation({ description: 'Get workflow statistics' })
  async getStats(@CurrentUser() user: any) {
    return this.workflowsService.getStats(user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ description: 'Get workflow by ID' })
  async getWorkflow(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.workflowsService.findById(id, user.organizationId);
  }

  @Post()
  @ApiOperation({ description: 'Create a new workflow' })
  async createWorkflow(
    @CurrentUser() user: any,
    @Body() body: { name: string; description?: string; definition?: any },
  ) {
    return this.workflowsService.create(user.organizationId, body);
  }

  @Patch(':id')
  @ApiOperation({ description: 'Update a workflow' })
  async updateWorkflow(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { name?: string; description?: string; status?: string; definition?: any },
  ) {
    return this.workflowsService.update(id, user.organizationId, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Delete a workflow' })
  async deleteWorkflow(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.workflowsService.delete(id, user.organizationId);
  }

  @Post(':id/duplicate')
  @ApiOperation({ description: 'Duplicate a workflow' })
  async duplicateWorkflow(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.workflowsService.duplicate(id, user.organizationId);
  }
}
