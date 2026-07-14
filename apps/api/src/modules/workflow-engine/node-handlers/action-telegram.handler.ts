import { UnrecoverableError } from 'bullmq';
import { NodeHandler, NodeExecutionInput, NodeExecutionResult } from '../node-executor';

interface TelegramConfig {
  chatId: string;
  message: string;
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  token?: string;
  disableNotification?: boolean;
  disableWebPagePreview?: boolean;
  replyToMessageId?: number;
}

interface TelegramApiResponse {
  ok: boolean;
  result: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username: string;
    };
    chat: {
      id: number;
      title?: string;
      type: string;
    };
    date: number;
    text: string;
  };
  description?: string;
  error_code?: number;
}

export class TelegramHandler implements NodeHandler {
  category = 'ACTION_TELEGRAM';

  validate(config: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.chatId || typeof config.chatId !== 'string') {
      errors.push('chatId is required and must be a string');
    }

    if (!config.message || typeof config.message !== 'string') {
      errors.push('message is required and must be a string');
    }

    if (config.parseMode && !['HTML', 'Markdown', 'MarkdownV2'].includes(config.parseMode as string)) {
      errors.push('parseMode must be one of: HTML, Markdown, MarkdownV2');
    }

    return { valid: errors.length === 0, errors };
  }

  async execute(
    input: NodeExecutionInput,
    config: Record<string, unknown>,
  ): Promise<NodeExecutionResult> {
    const cfg = config as unknown as TelegramConfig;
    const token = cfg.token || process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      throw new UnrecoverableError(
        'Telegram bot token not configured. Set TELEGRAM_BOT_TOKEN environment variable or provide token in config.',
      );
    }

    const previousData = Object.values(input.previousOutputs)[0] as Record<string, unknown> || {};
    const triggerData = input.triggerData || {};
    const templateData = { ...triggerData, ...previousData };

    const interpolatedMessage = interpolateString(cfg.message, templateData);

    const body: Record<string, unknown> = {
      chat_id: cfg.chatId,
      text: interpolatedMessage,
    };

    if (cfg.parseMode) {
      body.parse_mode = cfg.parseMode;
    }
    if (cfg.disableNotification !== undefined) {
      body.disable_notification = cfg.disableNotification;
    }
    if (cfg.disableWebPagePreview !== undefined) {
      body.disable_web_page_preview = cfg.disableWebPagePreview;
    }
    if (cfg.replyToMessageId !== undefined) {
      body.reply_to_message_id = cfg.replyToMessageId;
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new UnrecoverableError(
        `Telegram API HTTP error: ${response.status} ${response.statusText}`,
      );
    }

    const result = (await response.json()) as TelegramApiResponse;

    if (!result.ok) {
      throw new UnrecoverableError(
        `Telegram API error: ${result.description || 'Unknown error'} (code: ${result.error_code})`,
      );
    }

    return {
      data: {
        messageId: result.result.message_id,
        chatId: String(result.result.chat.id),
        chatTitle: result.result.chat.title || null,
        chatType: result.result.chat.type,
        text: result.result.text,
        date: result.result.date,
        sent: true,
      },
      metadata: {
        telegramMessageId: result.result.message_id,
        chatId: result.result.chat.id,
        chatType: result.result.chat.type,
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
