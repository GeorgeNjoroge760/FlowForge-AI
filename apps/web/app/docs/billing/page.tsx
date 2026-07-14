import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Billing & Plans - FlowForge AI Docs',
};

export default function BillingPage() {
  return (
    <>
      <h1>Billing & Plans</h1>
      <p className="text-lg text-gray-600">
        FlowForge AI offers flexible pricing based on workflow executions and team size.
      </p>

      <h2>Plans Overview</h2>
      <table>
        <thead>
          <tr>
            <th>Plan</th>
            <th>Price</th>
            <th>Executions/mo</th>
            <th>Workflows</th>
            <th>Team Members</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="font-semibold">Free</td>
            <td>$0</td>
            <td>100</td>
            <td>5</td>
            <td>1</td>
          </tr>
          <tr>
            <td className="font-semibold">Pro</td>
            <td>$29/mo</td>
            <td>10,000</td>
            <td>Unlimited</td>
            <td>5</td>
          </tr>
          <tr>
            <td className="font-semibold">Business</td>
            <td>$99/mo</td>
            <td>100,000</td>
            <td>Unlimited</td>
            <td>25</td>
          </tr>
          <tr>
            <td className="font-semibold">Enterprise</td>
            <td>Custom</td>
            <td>Custom</td>
            <td>Unlimited</td>
            <td>Unlimited</td>
          </tr>
        </tbody>
      </table>

      <h2>Execution Limits</h2>
      <p>
        Each workflow run counts as one execution, regardless of the number of nodes. If you exceed your
        plan&apos;s monthly limit, new workflow runs will be paused until the next billing cycle or until
        you upgrade.
      </p>

      <h2>Subscription Management</h2>
      <p>
        Go to <strong>Settings &gt; Billing</strong> to manage your subscription. You can:
      </p>
      <ul>
        <li>Upgrade or downgrade your plan at any time</li>
        <li>View invoices and payment history</li>
        <li>Update your payment method</li>
        <li>Cancel your subscription</li>
      </ul>

      <h2>Payment</h2>
      <p>
        Payments are processed via Stripe. We accept all major credit cards. Annual billing is available
        at a 20% discount. Enterprise plans support invoicing and wire transfers.
      </p>

      <h2>Overages</h2>
      <p>
        If you exceed your execution limit, you have two options:
      </p>
      <ul>
        <li><strong>Wait</strong> - Your limit resets at the start of the next billing cycle.</li>
        <li><strong>Upgrade</strong> - Upgrade to a higher plan for immediate additional capacity.</li>
      </ul>

      <h2>Refunds</h2>
      <p>
        Monthly subscriptions can be cancelled at any time. You will retain access until the end of the
        current billing period. Annual subscriptions receive a prorated refund within the first 30 days.
      </p>

      <h2>Free Tier</h2>
      <p>
        The free tier is available indefinitely with no credit card required. It includes 100 executions
        per month, 5 workflows, and 1 team member. All core features (AI, integrations, templates) are
        included.
      </p>
    </>
  );
}
