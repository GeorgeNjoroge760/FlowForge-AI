import { type NodeCategory } from '../types/workflow';

export interface NodeTypeInfo {
  category: NodeCategory;
  type: 'TRIGGER' | 'ACTION' | 'LOGIC';
  label: string;
  description: string;
  icon: string;
  color: string;
  handles: {
    inputs: string[];
    outputs: string[];
  };
  configSchema: Record<string, unknown>;
}

export const NODE_TYPES: Record<NodeCategory, NodeTypeInfo> = {
  TRIGGER_WEBHOOK: {
    category: 'TRIGGER_WEBHOOK',
    type: 'TRIGGER',
    label: 'Webhook',
    description: 'Trigger when a webhook is received',
    icon: 'webhook',
    color: '#10b981',
    handles: { inputs: [], outputs: ['response'] },
    configSchema: {
      method: { type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'], default: 'POST' },
      path: { type: 'string', default: '/webhook' },
      authentication: { type: 'select', options: ['none', 'api_key', 'basic'], default: 'none' },
    },
  },
  TRIGGER_SCHEDULE: {
    category: 'TRIGGER_SCHEDULE',
    type: 'TRIGGER',
    label: 'Schedule',
    description: 'Trigger on a schedule interval',
    icon: 'clock',
    color: '#10b981',
    handles: { inputs: [], outputs: ['tick'] },
    configSchema: {
      interval: { type: 'number', default: 60, description: 'Interval in minutes' },
    },
  },
  TRIGGER_CRON: {
    category: 'TRIGGER_CRON',
    type: 'TRIGGER',
    label: 'Cron',
    description: 'Trigger on a cron expression',
    icon: 'calendar',
    color: '#10b981',
    handles: { inputs: [], outputs: ['tick'] },
    configSchema: {
      expression: { type: 'string', default: '0 * * * *', description: 'Cron expression' },
      timezone: { type: 'string', default: 'UTC' },
    },
  },
  TRIGGER_GMAIL: {
    category: 'TRIGGER_GMAIL',
    type: 'TRIGGER',
    label: 'Gmail',
    description: 'Trigger when a new email is received',
    icon: 'mail',
    color: '#ea4335',
    handles: { inputs: [], outputs: ['email'] },
    configSchema: {
      filter: { type: 'string', description: 'Gmail search filter' },
      labelIds: { type: 'string', description: 'Comma-separated label IDs' },
      maxResults: { type: 'number', default: 10 },
    },
  },
  TRIGGER_GOOGLE_FORMS: {
    category: 'TRIGGER_GOOGLE_FORMS',
    type: 'TRIGGER',
    label: 'Google Forms',
    description: 'Trigger on new form submission',
    icon: 'form',
    color: '#4285f4',
    handles: { inputs: [], outputs: ['response'] },
    configSchema: {
      formId: { type: 'string', description: 'Google Form ID' },
    },
  },
  TRIGGER_STRIPE: {
    category: 'TRIGGER_STRIPE',
    type: 'TRIGGER',
    label: 'Stripe',
    description: 'Trigger on Stripe events',
    icon: 'credit-card',
    color: '#635bff',
    handles: { inputs: [], outputs: ['event'] },
    configSchema: {
      eventTypes: { type: 'string', description: 'Comma-separated event types' },
    },
  },
  TRIGGER_GITHUB: {
    category: 'TRIGGER_GITHUB',
    type: 'TRIGGER',
    label: 'GitHub',
    description: 'Trigger on GitHub events',
    icon: 'git-branch',
    color: '#f0f0f0',
    handles: { inputs: [], outputs: ['payload'] },
    configSchema: {
      events: { type: 'string', description: 'Comma-separated events (push, pull_request, issues)' },
      branch: { type: 'string', description: 'Branch filter' },
    },
  },
  TRIGGER_DISCORD: {
    category: 'TRIGGER_DISCORD',
    type: 'TRIGGER',
    label: 'Discord',
    description: 'Trigger on Discord messages',
    icon: 'message-circle',
    color: '#5865f2',
    handles: { inputs: [], outputs: ['message'] },
    configSchema: {
      channelId: { type: 'string', description: 'Discord channel ID' },
    },
  },
  TRIGGER_TELEGRAM: {
    category: 'TRIGGER_TELEGRAM',
    type: 'TRIGGER',
    label: 'Telegram',
    description: 'Trigger on Telegram messages',
    icon: 'send',
    color: '#0088cc',
    handles: { inputs: [], outputs: ['message'] },
    configSchema: {
      botToken: { type: 'string', description: 'Telegram bot token' },
      allowedUsers: { type: 'string', description: 'Comma-separated user IDs' },
    },
  },
  TRIGGER_RSS: {
    category: 'TRIGGER_RSS',
    type: 'TRIGGER',
    label: 'RSS',
    description: 'Trigger on new RSS feed items',
    icon: 'rss',
    color: '#f26522',
    handles: { inputs: [], outputs: ['item'] },
    configSchema: {
      feedUrl: { type: 'string', description: 'RSS feed URL' },
    },
  },
  TRIGGER_GOOGLE_SHEETS: {
    category: 'TRIGGER_GOOGLE_SHEETS',
    type: 'TRIGGER',
    label: 'Google Sheets',
    description: 'Trigger on new spreadsheet rows',
    icon: 'table',
    color: '#0f9d58',
    handles: { inputs: [], outputs: ['row'] },
    configSchema: {
      spreadsheetId: { type: 'string', description: 'Spreadsheet ID' },
      sheetName: { type: 'string', description: 'Sheet name' },
      range: { type: 'string', default: 'A:Z' },
    },
  },
  TRIGGER_HTTP_REQUEST: {
    category: 'TRIGGER_HTTP_REQUEST',
    type: 'TRIGGER',
    label: 'HTTP Request',
    description: 'Trigger on HTTP response polling',
    icon: 'globe',
    color: '#8b5cf6',
    handles: { inputs: [], outputs: ['response'] },
    configSchema: {
      url: { type: 'string', description: 'URL to poll' },
      method: { type: 'select', options: ['GET', 'POST'], default: 'GET' },
      headers: { type: 'json', description: 'Request headers' },
      pollInterval: { type: 'number', default: 300, description: 'Poll interval in seconds' },
    },
  },
  ACTION_OPENAI: {
    category: 'ACTION_OPENAI',
    type: 'ACTION',
    label: 'OpenAI',
    description: 'Generate text with OpenAI',
    icon: 'sparkles',
    color: '#10a37f',
    handles: { inputs: ['input'], outputs: ['output'] },
    configSchema: {
      model: { type: 'select', options: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'], default: 'gpt-4o' },
      prompt: { type: 'textarea', description: 'System prompt' },
      temperature: { type: 'number', default: 0.7, min: 0, max: 2 },
      maxTokens: { type: 'number', default: 1000 },
    },
  },
  ACTION_CLAUDE: {
    category: 'ACTION_CLAUDE',
    type: 'ACTION',
    label: 'Claude',
    description: 'Generate text with Claude',
    icon: 'sparkles',
    color: '#d97706',
    handles: { inputs: ['input'], outputs: ['output'] },
    configSchema: {
      model: { type: 'select', options: ['claude-sonnet-4-20250514', 'claude-3-haiku-20240307'], default: 'claude-sonnet-4-20250514' },
      prompt: { type: 'textarea', description: 'System prompt' },
      maxTokens: { type: 'number', default: 1000 },
    },
  },
  ACTION_GEMINI: {
    category: 'ACTION_GEMINI',
    type: 'ACTION',
    label: 'Gemini',
    description: 'Generate text with Gemini',
    icon: 'sparkles',
    color: '#4285f4',
    handles: { inputs: ['input'], outputs: ['output'] },
    configSchema: {
      model: { type: 'select', options: ['gemini-pro', 'gemini-1.5-flash'], default: 'gemini-pro' },
      prompt: { type: 'textarea', description: 'System prompt' },
    },
  },
  ACTION_GOOGLE_SHEETS: {
    category: 'ACTION_GOOGLE_SHEETS',
    type: 'ACTION',
    label: 'Google Sheets',
    description: 'Add or update spreadsheet rows',
    icon: 'table',
    color: '#0f9d58',
    handles: { inputs: ['input'], outputs: ['output'] },
    configSchema: {
      spreadsheetId: { type: 'string', description: 'Spreadsheet ID' },
      sheetName: { type: 'string', description: 'Sheet name' },
      operation: { type: 'select', options: ['append', 'update', 'clear'], default: 'append' },
    },
  },
  ACTION_SLACK: {
    category: 'ACTION_SLACK',
    type: 'ACTION',
    label: 'Slack',
    description: 'Send a Slack message',
    icon: 'hash',
    color: '#4a154b',
    handles: { inputs: ['input'], outputs: ['output'] },
    configSchema: {
      channelId: { type: 'string', description: 'Slack channel ID or name' },
      message: { type: 'textarea', description: 'Message template' },
      threadTs: { type: 'string', description: 'Thread timestamp for replies' },
    },
  },
  ACTION_DISCORD: {
    category: 'ACTION_DISCORD',
    type: 'ACTION',
    label: 'Discord',
    description: 'Send a Discord message',
    icon: 'message-circle',
    color: '#5865f2',
    handles: { inputs: ['input'], outputs: ['output'] },
    configSchema: {
      channelId: { type: 'string', description: 'Discord channel ID' },
      content: { type: 'textarea', description: 'Message content' },
      embedTitle: { type: 'string', description: 'Embed title' },
      embedDescription: { type: 'textarea', description: 'Embed description' },
    },
  },
  ACTION_TELEGRAM: {
    category: 'ACTION_TELEGRAM',
    type: 'ACTION',
    label: 'Telegram',
    description: 'Send a Telegram message',
    icon: 'send',
    color: '#0088cc',
    handles: { inputs: ['input'], outputs: ['output'] },
    configSchema: {
      chatId: { type: 'string', description: 'Chat ID' },
      message: { type: 'textarea', description: 'Message content' },
      parseMode: { type: 'select', options: ['HTML', 'Markdown', 'MarkdownV2'], default: 'HTML' },
    },
  },
  ACTION_NOTION: {
    category: 'ACTION_NOTION',
    type: 'ACTION',
    label: 'Notion',
    description: 'Create or update Notion pages',
    icon: 'book-open',
    color: '#000000',
    handles: { inputs: ['input'], outputs: ['output'] },
    configSchema: {
      databaseId: { type: 'string', description: 'Notion database ID' },
      operation: { type: 'select', options: ['create_page', 'update_page', 'query_database'], default: 'create_page' },
      properties: { type: 'json', description: 'Page properties' },
    },
  },
  ACTION_EMAIL: {
    category: 'ACTION_EMAIL',
    type: 'ACTION',
    label: 'Send Email',
    description: 'Send an email via SMTP',
    icon: 'mail',
    color: '#ea4335',
    handles: { inputs: ['input'], outputs: ['output'] },
    configSchema: {
      to: { type: 'string', description: 'Recipient email' },
      subject: { type: 'string', description: 'Email subject' },
      body: { type: 'textarea', description: 'Email body (HTML)' },
      isHtml: { type: 'boolean', default: true },
    },
  },
  ACTION_SMS: {
    category: 'ACTION_SMS',
    type: 'ACTION',
    label: 'SMS',
    description: 'Send an SMS via Twilio',
    icon: 'smartphone',
    color: '#f43e3e',
    handles: { inputs: ['input'], outputs: ['output'] },
    configSchema: {
      to: { type: 'string', description: 'Phone number' },
      body: { type: 'textarea', description: 'SMS content' },
    },
  },
  ACTION_WEBHOOK: {
    category: 'ACTION_WEBHOOK',
    type: 'ACTION',
    label: 'Webhook',
    description: 'Send data to a webhook URL',
    icon: 'webhook',
    color: '#8b5cf6',
    handles: { inputs: ['input'], outputs: ['output'] },
    configSchema: {
      url: { type: 'string', description: 'Webhook URL' },
      method: { type: 'select', options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], default: 'POST' },
      headers: { type: 'json', description: 'Request headers' },
    },
  },
  ACTION_HTTP_REQUEST: {
    category: 'ACTION_HTTP_REQUEST',
    type: 'ACTION',
    label: 'HTTP Request',
    description: 'Make an HTTP request',
    icon: 'globe',
    color: '#8b5cf6',
    handles: { inputs: ['input'], outputs: ['output'] },
    configSchema: {
      url: { type: 'string', description: 'Request URL' },
      method: { type: 'select', options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], default: 'GET' },
      headers: { type: 'json', description: 'Request headers' },
      body: { type: 'json', description: 'Request body' },
    },
  },
  ACTION_JSON_PARSER: {
    category: 'ACTION_JSON_PARSER',
    type: 'ACTION',
    label: 'JSON Parser',
    description: 'Parse or transform JSON data',
    icon: 'braces',
    color: '#f59e0b',
    handles: { inputs: ['input'], outputs: ['output'] },
    configSchema: {
      expression: { type: 'string', description: 'JSON path expression' },
      template: { type: 'json', description: 'Output template' },
    },
  },
  ACTION_FORMATTER: {
    category: 'ACTION_FORMATTER',
    type: 'ACTION',
    label: 'Formatter',
    description: 'Format text with variables',
    icon: 'type',
    color: '#f59e0b',
    handles: { inputs: ['input'], outputs: ['output'] },
    configSchema: {
      template: { type: 'textarea', description: 'Template with {{variable}} placeholders' },
      format: { type: 'select', options: ['text', 'html', 'markdown'], default: 'text' },
    },
  },
  LOGIC_DELAY: {
    category: 'LOGIC_DELAY',
    type: 'LOGIC',
    label: 'Delay',
    description: 'Wait before continuing',
    icon: 'pause',
    color: '#6366f1',
    handles: { inputs: ['input'], outputs: ['output'] },
    configSchema: {
      duration: { type: 'number', default: 1, description: 'Delay duration' },
      unit: { type: 'select', options: ['seconds', 'minutes', 'hours', 'days'], default: 'seconds' },
    },
  },
  LOGIC_FILTER: {
    category: 'LOGIC_FILTER',
    type: 'LOGIC',
    label: 'Filter',
    description: 'Filter data based on conditions',
    icon: 'filter',
    color: '#6366f1',
    handles: { inputs: ['input'], outputs: ['output'] },
    configSchema: {
      field: { type: 'string', description: 'Field to check' },
      operator: {
        type: 'select',
        options: ['equals', 'not_equals', 'contains', 'gt', 'lt', 'gte', 'lte', 'is_empty', 'is_not_empty'],
        default: 'equals',
      },
      value: { type: 'string', description: 'Value to compare against' },
    },
  },
  LOGIC_LOOP: {
    category: 'LOGIC_LOOP',
    type: 'LOGIC',
    label: 'Loop',
    description: 'Iterate over items',
    icon: 'repeat',
    color: '#6366f1',
    handles: { inputs: ['input'], outputs: ['item', 'done'] },
    configSchema: {
      sourceField: { type: 'string', description: 'Field containing the array to iterate' },
      batchSize: { type: 'number', default: 1, description: 'Items per batch' },
    },
  },
  LOGIC_ROUTER: {
    category: 'LOGIC_ROUTER',
    type: 'LOGIC',
    label: 'Router',
    description: 'Route to different paths based on conditions',
    icon: 'git-branch',
    color: '#6366f1',
    handles: { inputs: ['input'], outputs: ['path_1', 'path_2', 'path_3'] },
    configSchema: {
      routes: { type: 'json', description: 'Route definitions' },
    },
  },
  LOGIC_CONDITION: {
    category: 'LOGIC_CONDITION',
    type: 'LOGIC',
    label: 'Condition',
    description: 'If/else branching',
    icon: 'split',
    color: '#6366f1',
    handles: { inputs: ['input'], outputs: ['true', 'false'] },
    configSchema: {
      conditions: { type: 'json', description: 'Condition definitions' },
      combinator: { type: 'select', options: ['and', 'or'], default: 'and' },
    },
  },
  LOGIC_CODE: {
    category: 'LOGIC_CODE',
    type: 'LOGIC',
    label: 'Code',
    description: 'Run custom JavaScript code',
    icon: 'code',
    color: '#6366f1',
    handles: { inputs: ['input'], outputs: ['output'] },
    configSchema: {
      code: { type: 'code', language: 'javascript', description: 'JavaScript code to execute' },
    },
  },
};

export function getNodeTypeInfo(category: NodeCategory): NodeTypeInfo {
  return NODE_TYPES[category];
}

export function getNodesByType(type: 'TRIGGER' | 'ACTION' | 'LOGIC'): NodeTypeInfo[] {
  return Object.values(NODE_TYPES).filter((node) => node.type === type);
}
