import { Module } from '@nestjs/common';
import { WorkflowNodesService } from './workflow-nodes.service';

@Module({
  providers: [WorkflowNodesService],
  exports: [WorkflowNodesService],
})
export class WorkflowNodesModule {}
