import { Module } from '@nestjs/common';
import { ExecutionLogsService } from './execution-logs.service';

@Module({
  providers: [ExecutionLogsService],
  exports: [ExecutionLogsService],
})
export class ExecutionLogsModule {}
