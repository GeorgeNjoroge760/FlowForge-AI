import { Module, forwardRef } from '@nestjs/common';
import { WorkflowEngineService } from './workflow-engine.service';
import { DagResolver } from './dag-resolver';
import { NodeExecutor } from './node-executor';
import { HandlerRegistrar } from './handler-registrar';
import { ExecutionsModule } from '../executions/executions.module';

@Module({
  imports: [forwardRef(() => ExecutionsModule)],
  providers: [WorkflowEngineService, DagResolver, NodeExecutor, HandlerRegistrar],
  exports: [WorkflowEngineService],
})
export class WorkflowEngineModule {}
