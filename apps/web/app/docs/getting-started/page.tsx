import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Getting Started - FlowForge AI Docs',
};

export default function GettingStartedPage() {
  return (
    <>
      <h1>Getting Started</h1>
      <p className="text-lg text-gray-600">
        Follow these steps to create your first automated workflow in under 5 minutes.
      </p>

      <h2>Step 1: Create Your Account</h2>
      <p>
        Visit <code>flowforge.ai</code> and click <strong>Get Started</strong>. You can sign up with
        your email address or use Google/GitHub OAuth. The free tier includes 100 workflow executions
        per month.
      </p>

      <h2>Step 2: Set Up Your Organization</h2>
      <p>
        After signing up, you&apos;ll be prompted to create an organization. This is the workspace where
        your team collaborates. You can invite members later from <strong>Settings &gt; Team</strong>.
      </p>

      <h2>Step 3: Connect an Integration</h2>
      <p>
        Navigate to <strong>Connections</strong> and click <strong>Add Connection</strong>. Select the
        service you want to automate (e.g., Gmail, Slack, GitHub). Follow the OAuth flow to authorize
        access. API key-based integrations are also supported.
      </p>

      <h2>Step 4: Build Your First Workflow</h2>
      <p>
        Go to <strong>Workflows</strong> and click <strong>New Workflow</strong>. The visual editor opens
        with a blank canvas. Start by adding a trigger node, then connect action nodes to define what
        happens next.
      </p>
      <ul>
        <li><strong>Drag</strong> nodes from the left panel onto the canvas</li>
        <li><strong>Connect</strong> nodes by dragging from one output port to another input port</li>
        <li><strong>Configure</strong> each node by clicking it and filling in the settings panel</li>
      </ul>

      <h2>Step 5: Test and Activate</h2>
      <p>
        Click <strong>Run Workflow</strong> to test with sample data. Check the execution log for each
        node to verify output. Once satisfied, toggle the workflow to <strong>Active</strong> to enable
        real-time triggers.
      </p>

      <h2>Using Templates</h2>
      <p>
        Not sure where to start? Browse the <strong>Templates</strong> library for pre-built workflows
        like lead generation, email follow-ups, and content pipelines. Click <strong>Use Template</strong>
        to clone it into your workspace and customize it.
      </p>
    </>
  );
}
