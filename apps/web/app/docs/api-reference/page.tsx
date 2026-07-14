import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Reference - FlowForge AI Docs',
};

export default function ApiReferencePage() {
  return (
    <>
      <h1>API Reference</h1>
      <p className="text-lg text-gray-600">
        FlowForge AI provides a RESTful API for programmatic access to all platform features.
      </p>

      <h2>Base URL</h2>
      <pre>
        <code>http://localhost:4000/api/v1</code>
      </pre>

      <h2>Authentication</h2>
      <p>
        All API requests require a Bearer token in the <code>Authorization</code> header. Obtain
        tokens via the Clerk authentication flow.
      </p>
      <pre>
        <code>{`Authorization: Bearer <your-token>`}</code>
      </pre>

      <h2>Workflows</h2>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Endpoint</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>GET</code></td>
            <td><code>/workflows</code></td>
            <td>List all workflows in your organization</td>
          </tr>
          <tr>
            <td><code>POST</code></td>
            <td><code>/workflows</code></td>
            <td>Create a new workflow</td>
          </tr>
          <tr>
            <td><code>GET</code></td>
            <td><code>/workflows/:id</code></td>
            <td>Get workflow details</td>
          </tr>
          <tr>
            <td><code>PATCH</code></td>
            <td><code>/workflows/:id</code></td>
            <td>Update workflow name, definition, or status</td>
          </tr>
          <tr>
            <td><code>DELETE</code></td>
            <td><code>/workflows/:id</code></td>
            <td>Delete a workflow</td>
          </tr>
          <tr>
            <td><code>POST</code></td>
            <td><code>/workflows/:id/publish</code></td>
            <td>Publish a new version</td>
          </tr>
          <tr>
            <td><code>POST</code></td>
            <td><code>/workflows/:id/run</code></td>
            <td>Execute the workflow</td>
          </tr>
        </tbody>
      </table>

      <h2>Executions</h2>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Endpoint</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>GET</code></td>
            <td><code>/executions</code></td>
            <td>List all executions (filterable by workflow, status)</td>
          </tr>
          <tr>
            <td><code>GET</code></td>
            <td><code>/executions/:id</code></td>
            <td>Get execution details and step results</td>
          </tr>
          <tr>
            <td><code>GET</code></td>
            <td><code>/executions/:id/logs</code></td>
            <td>Get detailed execution logs</td>
          </tr>
        </tbody>
      </table>

      <h2>Templates</h2>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Endpoint</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>GET</code></td>
            <td><code>/templates</code></td>
            <td>List available workflow templates</td>
          </tr>
          <tr>
            <td><code>GET</code></td>
            <td><code>/templates/:id</code></td>
            <td>Get template details</td>
          </tr>
          <tr>
            <td><code>POST</code></td>
            <td><code>/templates/:id/use</code></td>
            <td>Create a workflow from a template</td>
          </tr>
        </tbody>
      </table>

      <h2>AI Features</h2>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Endpoint</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>POST</code></td>
            <td><code>/ai/suggest</code></td>
            <td>Get AI-suggested workflow structure from natural language</td>
          </tr>
          <tr>
            <td><code>POST</code></td>
            <td><code>/ai/optimize</code></td>
            <td>Get optimization suggestions for an existing workflow</td>
          </tr>
          <tr>
            <td><code>POST</code></td>
            <td><code>/ai/chat</code></td>
            <td>Chat with the AI assistant for workflow help</td>
          </tr>
        </tbody>
      </table>

      <h2>Other Endpoints</h2>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Endpoint</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>GET</code></td>
            <td><code>/notifications</code></td>
            <td>List notifications</td>
          </tr>
          <tr>
            <td><code>PATCH</code></td>
            <td><code>/notifications/:id/read</code></td>
            <td>Mark a notification as read</td>
          </tr>
          <tr>
            <td><code>PATCH</code></td>
            <td><code>/notifications/read-all</code></td>
            <td>Mark all notifications as read</td>
          </tr>
          <tr>
            <td><code>GET</code></td>
            <td><code>/usage</code></td>
            <td>Get current usage summary</td>
          </tr>
          <tr>
            <td><code>GET</code></td>
            <td><code>/usage/history</code></td>
            <td>Get usage history over time</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
