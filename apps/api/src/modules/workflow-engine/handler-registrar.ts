import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { NodeExecutor } from './node-executor';
import { registerAllHandlers } from './node-handlers';

@Injectable()
export class HandlerRegistrar implements OnModuleInit {
  private readonly logger = new Logger(HandlerRegistrar.name);

  constructor(private nodeExecutor: NodeExecutor) {}

  onModuleInit() {
    this.logger.log('Registering workflow node handlers...');
    registerAllHandlers(this.nodeExecutor);
    this.logger.log('All node handlers registered');
  }
}
