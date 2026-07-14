import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Integrations - FlowForge AI Docs',
};

const integrations = [
  {
    name: 'Gmail',
    auth: 'OAuth2',
    capabilities: ['Read emails', 'Send emails', 'Search by query', 'Manage labels'],
    setup: 'Connect your Google account via OAuth. Select the Gmail scopes you need.',
  },
  {
    name: 'Slack',
    auth: 'OAuth2',
    capabilities: ['Post messages', 'Upload files', 'List channels', 'React to messages'],
    setup: 'Install the FlowForge app to your Slack workspace and grant permissions.',
  },
  {
    name: 'GitHub',
    auth: 'OAuth2',
    capabilities: ['Create issues', 'Manage PRs', 'Read repo contents', 'List commits'],
    setup: 'Authorize FlowForge to access your GitHub repositories.',
  },
  {
    name: 'Airtable',
    auth: 'API Key',
    capabilities: ['CRUD on records', 'List tables', 'Upload attachments'],
    setup: 'Provide your Airtable API key and base ID in the connection settings.',
  },
  {
    name: 'HubSpot',
    auth: 'OAuth2',
    capabilities: ['Manage contacts', 'Create deals', 'Send marketing emails', 'Track events'],
    setup: 'Connect your HubSpot account and select the objects to access.',
  },
  {
    name: 'Stripe',
    auth: 'API Key',
    capabilities: ['Process payments', 'Manage subscriptions', 'Handle webhooks', 'Create invoices'],
    setup: 'Enter your Stripe secret key. Use test mode keys for development.',
  },
  {
    name: 'OpenAI',
    auth: 'API Key',
    capabilities: ['Chat completions', 'Text embeddings', 'Image generation', 'Moderation'],
    setup: 'Provide your OpenAI API key. Usage is billed per token.',
  },
  {
    name: 'Notion',
    auth: 'OAuth2',
    capabilities: ['Create pages', 'Update databases', 'Search content', 'Read blocks'],
    setup: 'Authorize FlowForge to access your Notion workspace.',
  },
];

export default function IntegrationsPage() {
  return (
    <>
      <h1>Integrations</h1>
      <p className="text-lg text-gray-600">
        Connect external services to your workflows. FlowForge supports OAuth2 and API key-based
        authentication.
      </p>

      <h2>How Integrations Work</h2>
      <p>
        Each integration is configured as a <strong>Connection</strong>. Connections store your
        credentials securely (encrypted at rest) and are referenced by workflow nodes. You can create
        multiple connections for the same service (e.g., multiple Gmail accounts).
      </p>

      <h2>Authentication Types</h2>
      <ul>
        <li>
          <strong>OAuth2</strong> - Redirect-based flow. You authorize FlowForge via the service&apos;s
          login page. Tokens are auto-refreshed.
        </li>
        <li>
          <strong>API Key</strong> - Static key provided by the service. Stored encrypted and passed in
          request headers.
        </li>
      </ul>

      <h2>Available Integrations</h2>
      {integrations.map((integration) => (
        <div key={integration.name}>
          <h3>
            {integration.name}{' '}
            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
              {integration.auth}
            </span>
          </h3>
          <ul>
            {integration.capabilities.map((cap) => (
              <li key={cap}>{cap}</li>
            ))}
          </ul>
          <p className="text-sm text-gray-600">{integration.setup}</p>
        </div>
      ))}

      <h2>Managing Connections</h2>
      <p>
        Go to <strong>Connections</strong> in the sidebar to view, test, or delete your connections.
        Each connection shows its status (active, expired, error) and last used timestamp.
      </p>
    </>
  );
}
