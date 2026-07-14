import type { IntegrationDefinition } from '../types/integration';

export const INTEGRATIONS: IntegrationDefinition[] = [
  {
    id: 'gmail',
    name: 'gmail',
    displayName: 'Gmail',
    description: 'Send and receive emails with Gmail',
    icon: 'mail',
    authType: 'oauth2',
    scopes: ['https://mail.google.com/', 'https://www.googleapis.com/auth/gmail.modify'],
    triggers: ['TRIGGER_GMAIL'],
    actions: ['ACTION_EMAIL'],
  },
  {
    id: 'google-sheets',
    name: 'google-sheets',
    displayName: 'Google Sheets',
    description: 'Read and write Google Sheets',
    icon: 'table',
    authType: 'oauth2',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    triggers: ['TRIGGER_GOOGLE_SHEETS'],
    actions: ['ACTION_GOOGLE_SHEETS'],
  },
  {
    id: 'slack',
    name: 'slack',
    displayName: 'Slack',
    description: 'Send messages and manage Slack channels',
    icon: 'hash',
    authType: 'oauth2',
    scopes: ['chat:write', 'channels:read', 'channels:history'],
    triggers: [],
    actions: ['ACTION_SLACK'],
  },
  {
    id: 'discord',
    name: 'discord',
    displayName: 'Discord',
    description: 'Send messages and manage Discord channels',
    icon: 'message-circle',
    authType: 'bot_token',
    triggers: ['TRIGGER_DISCORD'],
    actions: ['ACTION_DISCORD'],
  },
  {
    id: 'telegram',
    name: 'telegram',
    displayName: 'Telegram',
    description: 'Send and receive Telegram messages',
    icon: 'send',
    authType: 'bot_token',
    triggers: ['TRIGGER_TELEGRAM'],
    actions: ['ACTION_TELEGRAM'],
  },
  {
    id: 'github',
    name: 'github',
    displayName: 'GitHub',
    description: 'Monitor GitHub repositories and automate workflows',
    icon: 'git-branch',
    authType: 'oauth2',
    scopes: ['repo', 'read:org'],
    triggers: ['TRIGGER_GITHUB'],
    actions: [],
  },
  {
    id: 'openai',
    name: 'openai',
    displayName: 'OpenAI',
    description: 'Generate text and images with OpenAI',
    icon: 'sparkles',
    authType: 'api_key',
    triggers: [],
    actions: ['ACTION_OPENAI'],
  },
  {
    id: 'notion',
    name: 'notion',
    displayName: 'Notion',
    description: 'Create and manage Notion pages',
    icon: 'book-open',
    authType: 'oauth2',
    scopes: ['read_content', 'update_content', 'insert_content'],
    triggers: [],
    actions: ['ACTION_NOTION'],
  },
  {
    id: 'stripe',
    name: 'stripe',
    displayName: 'Stripe',
    description: 'Process payments and manage subscriptions',
    icon: 'credit-card',
    authType: 'api_key',
    triggers: ['TRIGGER_STRIPE'],
    actions: [],
  },
];

export function getIntegrationByName(name: string): IntegrationDefinition | undefined {
  return INTEGRATIONS.find((i) => i.name === name);
}

export function getIntegrationByProvider(provider: string): IntegrationDefinition | undefined {
  return INTEGRATIONS.find((i) => i.name === provider);
}
