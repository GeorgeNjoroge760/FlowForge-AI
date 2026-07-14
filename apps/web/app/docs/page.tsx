import Link from 'next/link';

export default function DocsOverviewPage() {
  return (
    <>
      <h1>FlowForge AI Documentation</h1>
      <p className="text-lg text-gray-600">
        Everything you need to build, deploy, and manage automated workflows powered by AI.
      </p>

      <h2>Quick Links</h2>
      <div className="not-prose grid gap-4 sm:grid-cols-2">
        <Link href="/docs/getting-started" className="block rounded-lg border border-gray-200 p-4 transition hover:border-blue-300 hover:shadow-md">
          <h3 className="mb-1 font-semibold text-gray-900">Getting Started</h3>
          <p className="text-sm text-gray-600">Set up your account and create your first workflow in minutes.</p>
        </Link>
        <Link href="/docs/workflow-builder" className="block rounded-lg border border-gray-200 p-4 transition hover:border-blue-300 hover:shadow-md">
          <h3 className="mb-1 font-semibold text-gray-900">Workflow Builder</h3>
          <p className="text-sm text-gray-600">Learn how to use the visual canvas to design automations.</p>
        </Link>
        <Link href="/docs/node-types" className="block rounded-lg border border-gray-200 p-4 transition hover:border-blue-300 hover:shadow-md">
          <h3 className="mb-1 font-semibold text-gray-900">Node Types</h3>
          <p className="text-sm text-gray-600">Reference for every trigger, action, and logic node available.</p>
        </Link>
        <Link href="/docs/integrations" className="block rounded-lg border border-gray-200 p-4 transition hover:border-blue-300 hover:shadow-md">
          <h3 className="mb-1 font-semibold text-gray-900">Integrations</h3>
          <p className="text-sm text-gray-600">Connect your favorite apps and services to your workflows.</p>
        </Link>
        <Link href="/docs/api-reference" className="block rounded-lg border border-gray-200 p-4 transition hover:border-blue-300 hover:shadow-md">
          <h3 className="mb-1 font-semibold text-gray-900">API Reference</h3>
          <p className="text-sm text-gray-600">Full REST API documentation for programmatic access.</p>
        </Link>
        <Link href="/docs/billing" className="block rounded-lg border border-gray-200 p-4 transition hover:border-blue-300 hover:shadow-md">
          <h3 className="mb-1 font-semibold text-gray-900">Billing & Plans</h3>
          <p className="text-sm text-gray-600">Understand pricing tiers, limits, and subscription management.</p>
        </Link>
      </div>
    </>
  );
}
