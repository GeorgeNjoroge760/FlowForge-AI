import { UnrecoverableError } from 'bullmq';
import { NodeHandler, NodeExecutionInput, NodeExecutionResult } from '../node-executor';

interface CodeConfig {
  code: string;
  timeout?: number;
}

export class CodeHandler implements NodeHandler {
  category = 'LOGIC_CODE';

  validate(config: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.code || typeof config.code !== 'string') {
      errors.push('code is required and must be a string');
    }

    if (config.timeout !== undefined) {
      const timeout = Number(config.timeout);
      if (isNaN(timeout) || timeout < 100) {
        errors.push('timeout must be at least 100ms');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  async execute(
    input: NodeExecutionInput,
    config: Record<string, unknown>,
  ): Promise<NodeExecutionResult> {
    const cfg = config as unknown as CodeConfig;
    const code = cfg.code;
    const timeout = cfg.timeout || 10000;

    const firstInput = Object.values(input.previousOutputs)[0] as Record<string, unknown> || {};
    const allInputs = input.previousOutputs;

    const wrappedCode = `
      "use strict";
      const __exports = {};
      const module = { exports: __exports };
      const exports = __exports;

      const __fn = (input, allInputs, require, console, exports) => {
        ${code}
      };

      return __fn;
    `;

    let fn: (input: any, allInputs: any, require: any, console: any, exports: any) => any;

    try {
      fn = new Function(wrappedCode)() as any;
    } catch (error: any) {
      throw new UnrecoverableError(`Code compilation failed: ${error.message}`);
    }

    const sandboxConsole = {
      log: (...args: unknown[]) => { /* noop in production */ },
      error: (...args: unknown[]) => { /* noop in production */ },
      warn: (...args: unknown[]) => { /* noop in production */ },
      info: (...args: unknown[]) => { /* noop in production */ },
    };

    const sandboxRequire = () => {
      throw new UnrecoverableError('require is not available in sandboxed code');
    };

    let result: unknown;
    const startTime = Date.now();

    try {
      const executionPromise = new Promise<unknown>((resolve, reject) => {
        try {
          const value = fn(firstInput, allInputs, sandboxRequire, sandboxConsole, {});
          resolve(value);
        } catch (err: any) {
          reject(err);
        }
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new UnrecoverableError(`Code execution timed out after ${timeout}ms`));
        }, timeout);
      });

      result = await Promise.race([executionPromise, timeoutPromise]);
    } catch (error: any) {
      if (error instanceof UnrecoverableError) {
        throw error;
      }
      throw new UnrecoverableError(`Code execution failed: ${error.message}`);
    }

    const duration = Date.now() - startTime;

    const outputData = typeof result === 'object' && result !== null
      ? { ...firstInput, ...result as Record<string, unknown> }
      : { ...firstInput, _result: result };

    return {
      data: outputData,
      metadata: {
        duration,
        resultType: typeof result,
        codeLength: code.length,
      },
    };
  }
}
