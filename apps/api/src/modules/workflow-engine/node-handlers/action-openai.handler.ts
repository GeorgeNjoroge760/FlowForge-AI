import OpenAI from 'openai';
import { UnrecoverableError } from 'bullmq';
import { NodeHandler, NodeExecutionInput, NodeExecutionResult } from '../node-executor';

interface OpenAIConfig {
  model?: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  apiKey?: string;
}

export class OpenAIHandler implements NodeHandler {
  category = 'ACTION_OPENAI';

  validate(config: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.prompt || typeof config.prompt !== 'string') {
      errors.push('prompt is required and must be a string');
    }

    if (config.temperature !== undefined) {
      const temp = Number(config.temperature);
      if (isNaN(temp) || temp < 0 || temp > 2) {
        errors.push('temperature must be between 0 and 2');
      }
    }

    if (config.maxTokens !== undefined) {
      const max = Number(config.maxTokens);
      if (isNaN(max) || max < 1 || max > 128000) {
        errors.push('maxTokens must be between 1 and 128000');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  async execute(
    input: NodeExecutionInput,
    config: Record<string, unknown>,
  ): Promise<NodeExecutionResult> {
    const cfg = config as unknown as OpenAIConfig;
    const apiKey = cfg.apiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new UnrecoverableError(
        'OpenAI API key not configured. Set OPENAI_API_KEY environment variable or provide apiKey in config.',
      );
    }

    const client = new OpenAI({ apiKey });

    const model = (cfg.model as string) || 'gpt-4o';
    const temperature = cfg.temperature ?? 0.7;
    const maxTokens = cfg.maxTokens ?? 1024;

    const previousData = Object.values(input.previousOutputs)[0] as Record<string, unknown> || {};
    const triggerData = input.triggerData || {};

    const interpolatedPrompt = interpolateString(cfg.prompt, { ...triggerData, ...previousData });

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    if (cfg.systemPrompt) {
      const interpolatedSystem = interpolateString(cfg.systemPrompt, { ...triggerData, ...previousData });
      messages.push({ role: 'system', content: interpolatedSystem });
    }

    messages.push({ role: 'user', content: interpolatedPrompt });

    const startTime = Date.now();

    const response = await client.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    const duration = Date.now() - startTime;

    const choice = response.choices[0];
    if (!choice) {
      throw new UnrecoverableError('OpenAI returned no choices');
    }

    const usage = response.usage;

    return {
      data: {
        text: choice.message?.content || '',
        finishReason: choice.finish_reason,
        model: response.model,
      },
      metadata: {
        duration,
        tokenUsage: usage?.total_tokens || 0,
        promptTokens: usage?.prompt_tokens || 0,
        completionTokens: usage?.completion_tokens || 0,
        model: response.model,
      },
    };
  }
}

function interpolateString(
  template: string,
  data: Record<string, unknown>,
): string {
  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, path: string) => {
    const value = path.split('.').reduce((obj: any, key: string) => obj?.[key], data);
    return value !== undefined && value !== null ? String(value) : `{{${path}}}`;
  });
}
