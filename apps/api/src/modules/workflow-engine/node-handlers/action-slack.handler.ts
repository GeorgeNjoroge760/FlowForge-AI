import { UnrecoverableError } from 'bullmq';
import { NodeHandler, NodeExecutionInput, NodeExecutionResult } from '../node-executor';

interface SlackConfig {
  channelId: string;
  message: string;
  token?: string;
  threadTs?: string;
  unfurlLinks?: boolean;
  unfurlMedia?: boolean;
}

interface SlackApiResponse {
  ok: boolean;
  channel: string;
  ts: string;
  message: {
    text: string;
    ts: string;
  };
  error?: string;
}

export class SlackHandler implements NodeHandler {
  category = 'ACTION_SLACK';

  validate(config: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.channelId || typeof config.channelId !== 'string') {
      errors.push('channelId is required and must be a string');
    }

    if (!config.message || typeof config.message !== 'string') {
      errors.push('message is required and must be a string');
    }

    return { valid: errors.length === 0, errors };
  }

  async execute(
    input: NodeExecutionInput,
    config: Record<string, unknown>,
  ): Promise<NodeExecutionResult> {
    const cfg = config as unknown as SlackConfig;
    const token = cfg.token || process.env.SLACK_BOT_TOKEN;

    if (!token) {
      throw new UnrecoverableError(
        'Slack token not configured. Set SLACK_BOT_TOKEN environment variable or provide token in config.',
      );
    }

    const previousData = Object.values(input.previousOutputs)[0] as Record<string, unknown> || {};
    const triggerData = input.triggerData || {};
    const templateData = { ...triggerData, ...previousData };

    const interpolatedMessage = interpolateString(cfg.message, templateData);

    const body: Record<string, unknown> = {
      channel: cfg.channelId,
      text: interpolatedMessage,
    };

    if (cfg.threadTs) {
      body.thread_ts = cfg.threadTs;
    }
    if (cfg.unfurlLinks !== undefined) {
      body.unfurl_links = cfg.unfurlLinks;
    }
    if (cfg.unfurlMedia !== undefined) {
      body.unfurl_media = cfg.unfurlMedia;
    }

    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new UnrecoverableError(
        `Slack API HTTP error: ${response.status} ${response.statusText}`,
      );
    }

    const result = (await response.json()) as SlackApiResponse;

    if (!result.ok) {
      throw new UnrecoverableError(`Slack API error: ${result.error}`);
    }

    return {
      data: {
        channelId: result.channel,
        timestamp: result.ts,
        message: result.message?.text || interpolatedMessage,
        posted: true,
      },
      metadata: {
        slackTs: result.ts,
        channelId: result.channel,
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
