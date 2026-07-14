export const IntegrationStatusEnum = ['connected', 'expired', 'error'] as const;
export type IntegrationStatus = (typeof IntegrationStatusEnum)[number];

export interface Integration {
  id: string;
  organizationId: string;
  provider: string;
  displayName: string;
  status: IntegrationStatus;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OAuthToken {
  id: string;
  integrationId: string;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
  scope: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationDefinition {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  authType: 'oauth2' | 'api_key' | 'bot_token';
  scopes?: string[];
  triggers: string[];
  actions: string[];
}

export interface ConnectIntegrationInput {
  provider: string;
  code?: string;
  state?: string;
}
