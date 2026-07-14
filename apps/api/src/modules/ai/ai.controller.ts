import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('generate-workflow')
  @ApiOperation({ description: 'Generate a workflow from natural language' })
  async generateWorkflow(
    @CurrentUser() user: any,
    @Body() body: { prompt: string },
  ) {
    return this.aiService.generateWorkflow(body.prompt);
  }

  @Post('explain-workflow')
  @ApiOperation({ description: 'Explain a workflow in plain language' })
  async explainWorkflow(
    @CurrentUser() user: any,
    @Body() body: { definition: any },
  ) {
    return this.aiService.explainWorkflow(body.definition);
  }

  @Post('optimize-workflow')
  @ApiOperation({ description: 'Get optimization suggestions for a workflow' })
  async optimizeWorkflow(
    @CurrentUser() user: any,
    @Body() body: { definition: any },
  ) {
    return this.aiService.optimizeWorkflow(body.definition);
  }

  @Post('debug-execution')
  @ApiOperation({ description: 'Debug a failed execution' })
  async debugExecution(
    @CurrentUser() user: any,
    @Body() body: { execution: any; logs: any[]; error: string },
  ) {
    return this.aiService.debugExecution(body.execution, body.logs, body.error);
  }
}
