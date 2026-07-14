import { NodeHandler, NodeExecutionInput, NodeExecutionResult } from '../node-executor';

interface WebhookConfig {
  method?: string;
  path?: string;
  expectedSecret?: string;
  headers?: Record<string, string>;
}

export class WebhookHandler implements NodeHandler {
  category = 'TRIGGER_WEBHOOK';

  validate(config: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.method && typeof config.method !== 'string') {
      errors.push('method must be a string');
    }

    if (config.path && typeof config.path !== 'string') {
      errors.push('path must be a string');
    }

    return { valid: errors.length === 0, errors };
  }

  async execute(
    input: NodeExecutionInput,
    config: Record<string, unknown>,
  ): Promise<NodeExecutionResult> {
    const cfg = config as unknown as WebhookConfig;

    const webhookData = input.triggerData || {};

    if (cfg.expectedSecret) {
      const signature = (webhookData as any)._headers?.['x-webhook-signature'] as string | undefined;
      if (signature !== cfg.expectedSecret) {
        return {
          data: {
            received: false,
            error: 'Invalid webhook signature',
          },
          metadata: {
            verified: false,
          },
        };
      }
    }

    const receivedAt = new Date().toISOString();
    const method = (cfg.method || webhookData._method || 'POST') as string;
    const path = cfg.path || webhookData._path || '/webhook';

    return {
      data: {
        received: true,
        method,
        path,
        body: webhookData._body || webhookData,
        headers: webhookData._headers || {},
        query: webhookData._query || {},
        receivedAt,
      },
      metadata: {
        receivedAt,
        method,
        path,
        hasBody: !!webhookData._body,
      },
    };
  }
}
