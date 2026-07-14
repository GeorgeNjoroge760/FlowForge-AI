import { Injectable, Logger } from '@nestjs/common';
import { UnrecoverableError } from 'bullmq';

export interface NodeExecutionInput {
  nodeId: string;
  nodeType: string;
  category: string;
  label: string;
  config: Record<string, unknown>;
  previousOutputs: Record<string, unknown>;
  triggerData: Record<string, unknown>;
  executionId: string;
  organizationId: string;
}

export interface NodeExecutionResult {
  data: Record<string, unknown>;
  metadata?: {
    duration?: number;
    tokenUsage?: number;
    [key: string]: unknown;
  };
}

export interface NodeHandler {
  category: string;
  validate(config: Record<string, unknown>): { valid: boolean; errors: string[] };
  execute(
    input: NodeExecutionInput,
    config: Record<string, unknown>,
  ): Promise<NodeExecutionResult>;
}

@Injectable()
export class NodeExecutor {
  private readonly logger = new Logger(NodeExecutor.name);
  private handlers = new Map<string, NodeHandler>();

  constructor() {
    this.registerDefaultHandlers();
  }

  registerHandler(category: string, handler: NodeHandler) {
    this.handlers.set(category, handler);
  }

  async execute(input: NodeExecutionInput): Promise<NodeExecutionResult> {
    const handler = this.handlers.get(input.category);

    if (!handler) {
      throw new UnrecoverableError(
        `No handler registered for node category: ${input.category}`,
      );
    }

    // Validate config
    const validation = handler.validate(input.config);
    if (!validation.valid) {
      throw new UnrecoverableError(
        `Invalid config for ${input.category}: ${validation.errors.join(', ')}`,
      );
    }

    const startTime = Date.now();

    try {
      this.logger.log(`Executing node ${input.nodeId} (${input.category})`);

      const result = await handler.execute(input, input.config);

      const duration = Date.now() - startTime;
      this.logger.log(
        `Node ${input.nodeId} completed in ${duration}ms`,
      );

      return {
        data: result.data,
        metadata: {
          ...result.metadata,
          duration,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Node ${input.nodeId} failed after ${duration}ms: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  private registerDefaultHandlers() {
    // Logic handlers
    this.handlers.set('LOGIC_DELAY', new DelayHandler());
    this.handlers.set('LOGIC_FILTER', new FilterHandler());
    this.handlers.set('LOGIC_CONDITION', new ConditionHandler());
    this.handlers.set('LOGIC_CODE', new CodeHandler());

    // Placeholder handlers for triggers and actions
    // These will be replaced with real implementations
    this.handlers.set('TRIGGER_WEBHOOK', new PassthroughHandler('webhook'));
    this.handlers.set('TRIGGER_SCHEDULE', new PassthroughHandler('schedule'));
    this.handlers.set('TRIGGER_CRON', new PassthroughHandler('cron'));
    this.handlers.set('ACTION_OPENAI', new PassthroughHandler('openai'));
    this.handlers.set('ACTION_SLACK', new PassthroughHandler('slack'));
    this.handlers.set('ACTION_EMAIL', new PassthroughHandler('email'));
    this.handlers.set('ACTION_TELEGRAM', new PassthroughHandler('telegram'));
    this.handlers.set('ACTION_HTTP_REQUEST', new PassthroughHandler('http'));
    this.handlers.set('ACTION_WEBHOOK', new PassthroughHandler('webhook'));
  }
}

// ─── Built-in Handlers ─────────────────────────────

class DelayHandler implements NodeHandler {
  category = 'LOGIC_DELAY';

  validate(config: Record<string, unknown>) {
    if (!config.duration || typeof config.duration !== 'number') {
      return { valid: false, errors: ['duration is required'] };
    }
    return { valid: true, errors: [] };
  }

  async execute(input: NodeExecutionInput, config: Record<string, unknown>) {
    const duration = config.duration as number;
    const unit = (config.unit as string) || 'seconds';

    let ms = duration;
    switch (unit) {
      case 'minutes': ms = duration * 60 * 1000; break;
      case 'hours': ms = duration * 60 * 60 * 1000; break;
      case 'days': ms = duration * 24 * 60 * 60 * 1000; break;
      default: ms = duration * 1000;
    }

    // Cap at 5 minutes for safety
    ms = Math.min(ms, 5 * 60 * 1000);

    await new Promise((resolve) => setTimeout(resolve, ms));

    const firstInput = Object.values(input.previousOutputs)[0] as Record<string, unknown> | undefined;
    return { data: (firstInput || {}) as Record<string, unknown> };
  }
}

class FilterHandler implements NodeHandler {
  category = 'LOGIC_FILTER';

  validate(config: Record<string, unknown>) {
    if (!config.field) {
      return { valid: false, errors: ['field is required'] };
    }
    return { valid: true, errors: [] };
  }

  async execute(input: NodeExecutionInput, config: Record<string, unknown>) {
    const field = config.field as string;
    const operator = (config.operator as string) || 'equals';
    const value = config.value;

    const firstInput = Object.values(input.previousOutputs)[0] as Record<string, unknown> || {};
    const fieldValue = getNestedValue(firstInput, field);

    let passes = false;
    switch (operator) {
      case 'equals': passes = fieldValue === value; break;
      case 'not_equals': passes = fieldValue !== value; break;
      case 'contains': passes = String(fieldValue).includes(String(value)); break;
      case 'gt': passes = Number(fieldValue) > Number(value); break;
      case 'lt': passes = Number(fieldValue) < Number(value); break;
      case 'gte': passes = Number(fieldValue) >= Number(value); break;
      case 'lte': passes = Number(fieldValue) <= Number(value); break;
      case 'is_empty': passes = !fieldValue || fieldValue === ''; break;
      case 'is_not_empty': passes = !!fieldValue && fieldValue !== ''; break;
      default: passes = true;
    }

    return {
      data: {
        ...firstInput,
        _filterPasses: passes,
      },
    };
  }
}

class ConditionHandler implements NodeHandler {
  category = 'LOGIC_CONDITION';

  validate(config: Record<string, unknown>) {
    return { valid: true, errors: [] };
  }

  async execute(input: NodeExecutionInput, config: Record<string, unknown>) {
    const conditions = (config.conditions as any[]) || [];
    const combinator = (config.combinator as string) || 'and';

    const firstInput = Object.values(input.previousOutputs)[0] as Record<string, unknown> || {};

    let result = combinator === 'and';
    for (const condition of conditions) {
      const fieldValue = getNestedValue(firstInput, condition.field);
      let conditionResult = false;

      switch (condition.operator) {
        case 'equals': conditionResult = fieldValue === condition.value; break;
        case 'not_equals': conditionResult = fieldValue !== condition.value; break;
        case 'contains': conditionResult = String(fieldValue).includes(String(condition.value)); break;
        case 'gt': conditionResult = Number(fieldValue) > Number(condition.value); break;
        case 'lt': conditionResult = Number(fieldValue) < Number(condition.value); break;
        default: conditionResult = true;
      }

      if (combinator === 'and') {
        result = result && conditionResult;
      } else {
        result = result || conditionResult;
      }
    }

    return {
      data: {
        ...firstInput,
        _conditionResult: result,
      },
    };
  }
}

class CodeHandler implements NodeHandler {
  category = 'LOGIC_CODE';

  validate(config: Record<string, unknown>) {
    if (!config.code) {
      return { valid: false, errors: ['code is required'] };
    }
    return { valid: true, errors: [] };
  }

  async execute(input: NodeExecutionInput, config: Record<string, unknown>) {
    const code = config.code as string;
    const firstInput = Object.values(input.previousOutputs)[0] || {};

    // Create a sandboxed execution context
    const fn = new Function('input', 'data', `
      "use strict";
      return (function() {
        ${code}
      })();
    `);

    try {
      const result = fn(firstInput, firstInput);
      return { data: (result || firstInput) as Record<string, unknown> };
    } catch (error) {
      throw new Error(`Code execution failed: ${(error as Error).message}`);
    }
  }
}

class PassthroughHandler implements NodeHandler {
  category: string;

  constructor(category: string) {
    this.category = category;
  }

  validate() {
    return { valid: true, errors: [] };
  }

  async execute(input: NodeExecutionInput) {
    // Placeholder: returns input data as output
    // Real handlers will make API calls, etc.
    return {
      data: {
        ...input.triggerData,
        ...((Object.values(input.previousOutputs)[0] as Record<string, unknown>) || {}),
      },
      metadata: {
        placeholder: true,
        message: `Handler for ${this.category} not yet implemented`,
      },
    };
  }
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: any, key: string) => {
    return current?.[key];
  }, obj);
}
