import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async generateWorkflow(prompt: string): Promise<{
    name: string;
    description: string;
    nodes: any[];
    edges: any[];
  }> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an AI assistant that converts natural language descriptions into workflow definitions for FlowForge AI.

Available node types and their categories:

TRIGGERS:
- TRIGGER_WEBHOOK: Webhook receiver (config: method, path)
- TRIGGER_SCHEDULE: Scheduled interval (config: interval in minutes)
- TRIGGER_CRON: Cron expression (config: expression, timezone)
- TRIGGER_GMAIL: Gmail trigger (config: filter, labelIds)
- TRIGGER_GOOGLE_FORMS: Google Forms (config: formId)
- TRIGGER_STRIPE: Stripe events (config: eventTypes)
- TRIGGER_GITHUB: GitHub events (config: events, branch)
- TRIGGER_DISCORD: Discord messages (config: channelId)
- TRIGGER_TELEGRAM: Telegram messages (config: botToken)
- TRIGGER_RSS: RSS feed (config: feedUrl)
- TRIGGER_GOOGLE_SHEETS: Google Sheets rows (config: spreadsheetId, sheetName)

ACTIONS:
- ACTION_OPENAI: OpenAI text generation (config: model, prompt, temperature, maxTokens)
- ACTION_SLACK: Send Slack message (config: channelId, message)
- ACTION_GOOGLE_SHEETS: Google Sheets operations (config: spreadsheetId, sheetName, operation)
- ACTION_EMAIL: Send email (config: to, subject, body, isHtml)
- ACTION_TELEGRAM: Send Telegram message (config: chatId, message, parseMode)
- ACTION_HTTP_REQUEST: HTTP request (config: url, method, headers, body)
- ACTION_WEBHOOK: Send to webhook (config: url, method, headers)
- ACTION_JSON_PARSER: Parse JSON (config: expression, template)
- ACTION_FORMATTER: Format text (config: template, format)

LOGIC:
- LOGIC_DELAY: Wait (config: duration, unit)
- LOGIC_FILTER: Filter data (config: field, operator, value)
- LOGIC_CONDITION: If/else (config: conditions, combinator)
- LOGIC_LOOP: Iterate (config: sourceField, batchSize)
- LOGIC_ROUTER: Route paths (config: routes)
- LOGIC_CODE: JavaScript code (config: code)

Return ONLY valid JSON with this structure:
{
  "name": "Workflow name",
  "description": "Brief description",
  "nodes": [
    {
      "id": "node-1",
      "type": "TRIGGER|ACTION|LOGIC",
      "category": "NODE_CATEGORY",
      "label": "Node Label",
      "position": { "x": 250, "y": 100 },
      "config": { ... }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2"
    }
  ]
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    try {
      const parsed = JSON.parse(content);
      return {
        name: parsed.name || 'AI Generated Workflow',
        description: parsed.description || '',
        nodes: parsed.nodes || [],
        edges: parsed.edges || [],
      };
    } catch (error) {
      throw new Error('Failed to parse AI response');
    }
  }

  async explainWorkflow(definition: any): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant that explains workflows in plain language. Be concise and clear.',
        },
        {
          role: 'user',
          content: `Explain this workflow:\n${JSON.stringify(definition, null, 2)}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || 'Unable to explain workflow';
  }

  async optimizeWorkflow(definition: any): Promise<{
    suggestions: string[];
    optimizedDefinition?: any;
  }> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant that optimizes workflows. Analyze the workflow and provide:
1. A list of specific improvement suggestions
2. An optimized version of the workflow (if improvements are possible)

Return JSON:
{
  "suggestions": ["suggestion1", "suggestion2"],
  "optimizedDefinition": { ... } // optional improved workflow
}`,
        },
        {
          role: 'user',
          content: `Optimize this workflow:\n${JSON.stringify(definition, null, 2)}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { suggestions: ['Unable to analyze workflow'] };
    }

    try {
      return JSON.parse(content);
    } catch {
      return { suggestions: ['Unable to parse optimization results'] };
    }
  }

  async debugExecution(
    execution: any,
    logs: any[],
    error: string,
  ): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a debugging assistant for workflow executions. Analyze the error and execution logs, then provide a clear diagnosis and fix suggestion.',
        },
        {
          role: 'user',
          content: `Execution failed with error: ${error}\n\nExecution logs:\n${JSON.stringify(logs, null, 2)}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || 'Unable to debug execution';
  }
}
