import { Module } from '@nestjs/common';
import { WorkflowEdgesService } from './workflow-edges.service';

@Module({
  providers: [WorkflowEdgesService],
  exports: [WorkflowEdgesService],
})
export class WorkflowEdgesModule {}
