import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workflow Builder - FlowForge AI Docs',
};

export default function WorkflowBuilderPage() {
  return (
    <>
      <h1>Workflow Builder</h1>
      <p className="text-lg text-gray-600">
        The visual canvas where you design, connect, and manage your automated workflows.
      </p>

      <h2>Canvas Overview</h2>
      <p>
        The workflow editor is a drag-and-drop canvas powered by React Flow. Nodes represent steps in
        your workflow, and edges define the flow of data between them. The canvas supports zooming,
        panning, and minimap navigation.
      </p>

      <h2>Node Types</h2>
      <p>There are three categories of nodes:</p>
      <ul>
        <li>
          <strong>Trigger Nodes</strong> - Start your workflow. Examples: webhook received, schedule
          (cron), email received, form submitted.
        </li>
        <li>
          <strong>Action Nodes</strong> - Perform operations. Examples: send email, create record,
          update database row, call API.
        </li>
        <li>
          <strong>Logic Nodes</strong> - Control flow. Examples: if/else conditions, delays, loops,
          filters, code execution.
        </li>
      </ul>

      <h2>Connecting Nodes</h2>
      <p>
        Drag from an output port (right side of a node) to an input port (left side of another node)
        to create an edge. Each output carries the result data of that node, which becomes available as
        input to the next node via template variables.
      </p>

      <h2>Node Configuration Panel</h2>
      <p>
        Click any node to open the configuration panel on the right. The panel varies by node type but
        generally includes:
      </p>
      <ul>
        <li><strong>Name</strong> - A descriptive label for the node</li>
        <li><strong>Settings</strong> - Node-specific configuration (e.g., recipient email, API URL)</li>
        <li><strong>Input Mapping</strong> - Map data from previous nodes using template expressions</li>
        <li><strong>Error Handling</strong> - Define retry logic and fallback behavior</li>
      </ul>

      <h2>Template Variables</h2>
      <p>
        Reference data from previous nodes using the <code>{'{{node.output.fieldName}}'}</code> syntax.
        For example, if a previous node named &quot;fetchUser&quot; returned <code>{'{"name": "Alice"}'}</code>,
        you can use <code>{'{{fetchUser.name}}'}</code> in downstream nodes.
      </p>

      <h2>Execution Flow</h2>
      <p>
        Workflows execute sequentially from trigger to final action. Each node receives input from its
        predecessors and produces output for its successors. If a node fails, the workflow stops unless
        error handling is configured.
      </p>

      <h2>Publishing</h2>
      <p>
        Click <strong>Publish</strong> to save a version and make the workflow executable. Every publish
        creates an immutable version snapshot. You can view version history and roll back to any
        previous version.
      </p>
    </>
  );
}
