import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Node Types - FlowForge AI Docs',
};

const nodeCategories = [
  {
    name: 'Triggers',
    description: 'Start your workflow in response to events.',
    nodes: [
      { name: 'Webhook', description: 'Trigger when an HTTP request is received at a unique URL.' },
      { name: 'Schedule', description: 'Trigger on a cron-based schedule (e.g., every day at 9 AM).' },
      { name: 'Email Received', description: 'Trigger when an email arrives in a connected inbox.' },
      { name: 'Form Submitted', description: 'Trigger when a FlowForge form is submitted.' },
      { name: 'RSS Feed', description: 'Trigger when a new item appears in an RSS feed.' },
    ],
  },
  {
    name: 'Actions',
    description: 'Perform operations with connected services.',
    nodes: [
      { name: 'Send Email', description: 'Send an email via Gmail, Outlook, or SMTP.' },
      { name: 'Send Slack Message', description: 'Post a message to a Slack channel or DM.' },
      { name: 'Create Record', description: 'Create a row in Airtable, Notion, or Google Sheets.' },
      { name: 'Update Record', description: 'Update an existing record by ID.' },
      { name: 'HTTP Request', description: 'Make any HTTP call (GET, POST, PUT, DELETE) to an API.' },
      { name: 'AI Completion', description: 'Send a prompt to OpenAI and return the response.' },
      { name: 'File Upload', description: 'Upload a file to cloud storage (S3, GCS).' },
    ],
  },
  {
    name: 'Logic',
    description: 'Control the flow of execution.',
    nodes: [
      { name: 'If / Else', description: 'Branch based on a condition (expression evaluation).' },
      { name: 'Delay', description: 'Pause execution for a fixed duration before continuing.' },
      { name: 'Filter', description: 'Stop the workflow unless a condition is met.' },
      { name: 'Loop', description: 'Iterate over a list and run child nodes for each item.' },
      { name: 'Code', description: 'Run custom JavaScript/TypeScript code with full input access.' },
    ],
  },
  {
    name: 'AI & Transform',
    description: 'Process and transform data using AI.',
    nodes: [
      { name: 'Classify', description: 'Use AI to classify text into predefined categories.' },
      { name: 'Extract Data', description: 'Use AI to extract structured data from unstructured text.' },
      { name: 'Summarize', description: 'Summarize long text using AI.' },
      { name: 'Transform', description: 'Map, filter, or reshape data between nodes.' },
      { name: 'Merge', description: 'Combine data from multiple upstream branches.' },
    ],
  },
  {
    name: 'Integrations',
    description: 'Direct service connectors.',
    nodes: [
      { name: 'Gmail', description: 'Read, send, and search Gmail messages.' },
      { name: 'Slack', description: 'Post messages, upload files, manage channels.' },
      { name: 'GitHub', description: 'Create issues, PRs, and manage repositories.' },
      { name: 'HubSpot', description: 'Manage contacts, deals, and CRM records.' },
      { name: 'Stripe', description: 'Process payments, manage subscriptions, handle webhooks.' },
    ],
  },
];

export default function NodeTypesPage() {
  return (
    <>
      <h1>Node Types</h1>
      <p className="text-lg text-gray-600">
        FlowForge AI provides a library of pre-built nodes. Here is a reference for each category.
      </p>

      {nodeCategories.map((category) => (
        <div key={category.name}>
          <h2>{category.name}</h2>
          <p className="text-gray-600">{category.description}</p>
          <table>
            <thead>
              <tr>
                <th>Node</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {category.nodes.map((node) => (
                <tr key={node.name}>
                  <td className="font-semibold">{node.name}</td>
                  <td>{node.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </>
  );
}
