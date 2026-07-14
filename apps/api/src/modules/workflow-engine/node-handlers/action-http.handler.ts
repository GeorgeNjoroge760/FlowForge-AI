import { UnrecoverableError } from 'bullmq';
import { NodeHandler, NodeExecutionInput, NodeExecutionResult } from '../node-executor';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

interface HttpConfig {
  url: string;
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  query?: Record<string, string>;
  authentication?: {
    type: 'bearer' | 'basic';
    token?: string;
    username?: string;
    password?: string;
  };
}

interface HttpResult {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
  duration: number;
}

export class HttpHandler implements NodeHandler {
  category = 'ACTION_HTTP_REQUEST';

  validate(config: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.url || typeof config.url !== 'string') {
      errors.push('url is required and must be a string');
    } else {
      try {
        new URL(config.url as string);
      } catch {
        errors.push('url must be a valid URL');
      }
    }

    if (config.method) {
      const validMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
      if (!validMethods.includes((config.method as string).toUpperCase() as HttpMethod)) {
        errors.push(`method must be one of: ${validMethods.join(', ')}`);
      }
    }

    if (config.timeout !== undefined) {
      const timeout = Number(config.timeout);
      if (isNaN(timeout) || timeout < 0) {
        errors.push('timeout must be a non-negative number');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  async execute(
    input: NodeExecutionInput,
    config: Record<string, unknown>,
  ): Promise<NodeExecutionResult> {
    const cfg = config as unknown as HttpConfig;
    const method = (cfg.method || 'GET').toUpperCase() as HttpMethod;

    const previousData = Object.values(input.previousOutputs)[0] as Record<string, unknown> || {};
    const triggerData = input.triggerData || {};
    const templateData = { ...triggerData, ...previousData };

    let url = interpolateString(cfg.url, templateData);

    if (cfg.query) {
      const interpolatedQuery: Record<string, string> = {};
      for (const [key, value] of Object.entries(cfg.query)) {
        interpolatedQuery[key] = interpolateString(value, templateData);
      }
      const urlObj = new URL(url);
      for (const [key, value] of Object.entries(interpolatedQuery)) {
        urlObj.searchParams.set(key, value);
      }
      url = urlObj.toString();
    }

    const headers: Record<string, string> = {
      'User-Agent': 'WorkflowEngine/1.0',
    };

    if (cfg.headers) {
      for (const [key, value] of Object.entries(cfg.headers)) {
        headers[key] = interpolateString(value, templateData);
      }
    }

    if (cfg.authentication) {
      if (cfg.authentication.type === 'bearer' && cfg.authentication.token) {
        headers['Authorization'] = `Bearer ${interpolateString(cfg.authentication.token, templateData)}`;
      } else if (cfg.authentication.type === 'basic') {
        const username = interpolateString(cfg.authentication.username || '', templateData);
        const password = interpolateString(cfg.authentication.password || '', templateData);
        const encoded = Buffer.from(`${username}:${password}`).toString('base64');
        headers['Authorization'] = `Basic ${encoded}`;
      }
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(cfg.timeout || 30000),
    };

    if (['POST', 'PUT', 'PATCH'].includes(method) && cfg.body !== undefined) {
      let body = cfg.body;
      if (typeof body === 'object' && body !== null) {
        body = interpolateObject(body as Record<string, unknown>, templateData);
      }
      fetchOptions.body = JSON.stringify(body);
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
    }

    const startTime = Date.now();

    let response: Response;
    try {
      response = await fetch(url, fetchOptions);
    } catch (error: any) {
      if (error.name === 'TimeoutError') {
        throw new UnrecoverableError(`HTTP request timed out after ${cfg.timeout || 30000}ms`);
      }
      throw new UnrecoverableError(`HTTP request failed: ${error.message}`);
    }

    const duration = Date.now() - startTime;

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    let responseBody: unknown;
    const contentType = response.headers.get('content-type') || '';

    try {
      if (contentType.includes('application/json')) {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
      }
    } catch {
      responseBody = null;
    }

    return {
      data: {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: responseBody,
        ok: response.ok,
        url: response.url,
      },
      metadata: {
        duration,
        method,
        finalUrl: response.url,
        contentType,
        size: Number(response.headers.get('content-length')) || undefined,
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

function interpolateObject(
  obj: Record<string, unknown>,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = interpolateString(value, data);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = interpolateObject(value as Record<string, unknown>, data);
    } else {
      result[key] = value;
    }
  }
  return result;
}
