import { UnrecoverableError } from 'bullmq';
import { NodeHandler, NodeExecutionInput, NodeExecutionResult } from '../node-executor';

interface GmailConfig {
  accessToken?: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
  labelIds?: string[];
  query?: string;
  maxResults?: number;
  newerThan?: string;
}

interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload?: {
    headers: Array<{ name: string; value: string }>;
    body?: { data?: string; sizeEstimate?: number };
    parts?: Array<{
      mimeType: string;
      body?: { data?: string; sizeEstimate?: number };
      filename?: string;
    }>;
  };
  internalDate: string;
  labelIds: string[];
  sizeEstimate: number;
}

interface GmailListResponse {
  messages: Array<{ id: string; threadId: string }>;
  nextPageToken?: string;
  resultSizeEstimate: number;
}

export class GmailHandler implements NodeHandler {
  category = 'TRIGGER_GMAIL';

  validate(config: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.maxResults !== undefined) {
      const max = Number(config.maxResults);
      if (isNaN(max) || max < 1 || max > 100) {
        errors.push('maxResults must be between 1 and 100');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  async execute(
    input: NodeExecutionInput,
    config: Record<string, unknown>,
  ): Promise<NodeExecutionResult> {
    const cfg = config as unknown as GmailConfig;

    const accessToken = cfg.accessToken || process.env.GMAIL_ACCESS_TOKEN;

    if (!accessToken) {
      throw new UnrecoverableError(
        'Gmail access token not configured. Set GMAIL_ACCESS_TOKEN environment variable or provide accessToken in config.',
      );
    }

    const maxResults = Math.min(cfg.maxResults || 10, 100);

    const params = new URLSearchParams({
      maxResults: String(maxResults),
    });

    if (cfg.labelIds && cfg.labelIds.length > 0) {
      for (const labelId of cfg.labelIds) {
        params.append('labelIds', labelId);
      }
    }

    if (cfg.query) {
      params.set('q', cfg.query);
    } else if (cfg.newerThan) {
      params.set('q', `newer_than:${cfg.newerThan}`);
    }

    const listResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!listResponse.ok) {
      const errorBody = await listResponse.text();
      throw new UnrecoverableError(
        `Gmail API list error: ${listResponse.status} - ${errorBody}`,
      );
    }

    const listData = (await listResponse.json()) as GmailListResponse;

    if (!listData.messages || listData.messages.length === 0) {
      return {
        data: {
          emails: [],
          count: 0,
          hasMore: false,
        },
        metadata: {
          gmailQuery: cfg.query || cfg.newerThan || 'inbox',
        },
      };
    }

    const emails: Array<{
      id: string;
      threadId: string;
      subject: string;
      from: string;
      to: string;
      date: string;
      snippet: string;
      body: string;
      labels: string[];
    }> = [];

    for (const msgRef of listData.messages) {
      const msgResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgRef.id}?format=full`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!msgResponse.ok) {
        continue;
      }

      const msg = (await msgResponse.json()) as GmailMessage;

      const headers = msg.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

      let body = '';
      if (msg.payload?.body?.data) {
        body = Buffer.from(msg.payload.body.data, 'base64url').toString('utf-8');
      } else if (msg.payload?.parts) {
        const textPart = msg.payload.parts.find(
          (p) => p.mimeType === 'text/plain',
        );
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, 'base64url').toString('utf-8');
        }
      }

      emails.push({
        id: msg.id,
        threadId: msg.threadId,
        subject: getHeader('Subject'),
        from: getHeader('From'),
        to: getHeader('To'),
        date: getHeader('Date') || new Date(Number(msg.internalDate)).toISOString(),
        snippet: msg.snippet,
        body,
        labels: msg.labelIds,
      });
    }

    return {
      data: {
        emails,
        count: emails.length,
        hasMore: !!listData.nextPageToken,
        nextPageToken: listData.nextPageToken || null,
      },
      metadata: {
        totalResults: listData.resultSizeEstimate,
        fetchedCount: emails.length,
      },
    };
  }
}
