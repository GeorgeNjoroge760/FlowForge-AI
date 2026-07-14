import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ExecutionsService } from './executions.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { WorkflowEngineService } from '../workflow-engine/workflow-engine.service';

@ApiTags('executions')
@Controller('executions')
export class ExecutionsController {
  constructor(
    private executionsService: ExecutionsService,
    private workflowEngine: WorkflowEngineService,
  ) {}

  @Get()
  @ApiOperation({ description: 'List executions' })
  async listExecutions(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('workflowId') workflowId?: string,
    @Query('status') status?: string,
  ) {
    return this.executionsService.findAll(user.organizationId, {
      page,
      limit,
      workflowId,
      status,
    });
  }

  @Get('stats')
  @ApiOperation({ description: 'Get execution statistics' })
  async getStats(@CurrentUser() user: any) {
    return this.executionsService.getStats(user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ description: 'Get execution by ID' })
  async getExecution(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.executionsService.findById(id, user.organizationId);
  }

  @Post(':id/retry')
  @ApiOperation({ description: 'Retry a failed execution' })
  async retryExecution(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.executionsService.retry(id, user.organizationId);
  }

  @Post('workflow/:workflowId')
  @ApiOperation({ description: 'Trigger a workflow execution' })
  async executeWorkflow(
    @Param('workflowId') workflowId: string,
    @CurrentUser() user: any,
    @Body() body: { input?: Record<string, unknown>; triggerType?: string },
  ) {
    return this.workflowEngine.execute(workflowId, user.organizationId, {
      input: body.input,
      triggerType: body.triggerType || 'manual',
    });
  }
}
