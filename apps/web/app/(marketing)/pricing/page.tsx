import { PricingCard } from '@/components/marketing/pricing-card';
import { CTASection } from '@/components/marketing/cta-section';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'mo',
    description: 'Perfect for exploring FlowForge AI and personal projects.',
    features: [
      '100 workflow executions / month',
      '3 active workflows',
      '1 user',
      'Visual workflow builder',
      'AI workflow generation',
      'Community support',
    ],
    cta: 'Start Free',
    ctaHref: '/sign-up',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'mo',
    description: 'For professionals and small teams automating real work.',
    features: [
      '5,000 workflow executions / month',
      'Unlimited active workflows',
      '5 team members',
      'All integrations (Slack, Gmail, OpenAI, etc.)',
      'Advanced AI features',
      'Execution history & logs',
      'Email support',
    ],
    cta: 'Start Pro Trial',
    ctaHref: '/sign-up',
    highlighted: true,
  },
  {
    name: 'Business',
    price: '$99',
    period: 'mo',
    description: 'For growing teams that need control and compliance.',
    features: [
      '25,000 workflow executions / month',
      'Unlimited active workflows',
      '25 team members',
      'SSO / SAML authentication',
      'Audit logs & compliance',
      'Custom integrations',
      'Priority support',
      'Team management & roles',
    ],
    cta: 'Start Business Trial',
    ctaHref: '/sign-up',
    highlighted: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For organizations with advanced security and scale needs.',
    features: [
      'Unlimited executions',
      'Unlimited users',
      'Custom SLA (99.99%+)',
      'Dedicated infrastructure',
      'On-premise deployment option',
      'Dedicated account manager',
      'Custom integrations & SSO',
      'SOC 2 compliance',
    ],
    cta: 'Contact Sales',
    ctaHref: '/sign-up',
    highlighted: false,
  },
];

const faqs = [
  {
    question: 'What counts as a workflow execution?',
    answer:
      'Each time a workflow trigger fires and the workflow runs, that counts as one execution. For example, if your workflow triggers on every new email and processes 100 emails in a day, that is 100 executions.',
  },
  {
    question: 'Can I switch plans at any time?',
    answer:
      'Yes. You can upgrade or downgrade your plan at any time from your account settings. When you upgrade, you are billed a prorated amount for the remainder of the billing cycle. When you downgrade, the change takes effect at the start of the next billing cycle.',
  },
  {
    question: 'What happens if I exceed my execution limit?',
    answer:
      'Workflows will pause when you reach your monthly execution limit. You can either wait for the limit to reset at the start of the next billing cycle or upgrade to a plan with more executions.',
  },
  {
    question: 'Is there a free trial for paid plans?',
    answer:
      'Yes. All paid plans include a 14-day free trial with full access to all features. No credit card required to start the trial.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'We offer a full refund within 7 days of any new subscription or upgrade. Contact our support team to request a refund.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express) and wire transfers for Enterprise plans. All payments are processed securely through Stripe.',
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Header */}
      <section className="container py-24 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">Simple, transparent pricing</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Start free and scale as you grow. No hidden fees.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="container pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <PricingCard key={plan.name} {...plan} />
          ))}
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="container py-24 border-t">
        <h2 className="text-2xl font-bold text-center mb-12">Compare plans</h2>
        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Feature</th>
                <th className="text-center py-3 px-4 font-medium">Free</th>
                <th className="text-center py-3 px-4 font-medium">Pro</th>
                <th className="text-center py-3 px-4 font-medium">Business</th>
                <th className="text-center py-3 px-4 font-medium">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Executions / month', free: '100', pro: '5,000', business: '25,000', enterprise: 'Unlimited' },
                { feature: 'Active workflows', free: '3', pro: 'Unlimited', business: 'Unlimited', enterprise: 'Unlimited' },
                { feature: 'Team members', free: '1', pro: '5', business: '25', enterprise: 'Unlimited' },
                { feature: 'AI workflow builder', free: true, pro: true, business: true, enterprise: true },
                { feature: 'Visual editor', free: true, pro: true, business: true, enterprise: true },
                { feature: 'All integrations', free: false, pro: true, business: true, enterprise: true },
                { feature: 'Execution logs', free: '7 days', pro: '90 days', business: '1 year', enterprise: 'Unlimited' },
                { feature: 'SSO / SAML', free: false, pro: false, business: true, enterprise: true },
                { feature: 'Audit logs', free: false, pro: false, business: true, enterprise: true },
                { feature: 'Custom SLA', free: false, pro: false, business: false, enterprise: true },
                { feature: 'Support', free: 'Community', pro: 'Email', business: 'Priority', enterprise: 'Dedicated' },
              ].map((row) => (
                <tr key={row.feature} className="border-b last:border-0">
                  <td className="py-3 px-4 text-muted-foreground">{row.feature}</td>
                  {(['free', 'pro', 'business', 'enterprise'] as const).map((plan) => (
                    <td key={plan} className="text-center py-3 px-4">
                      {typeof row[plan] === 'boolean' ? (
                        row[plan] ? (
                          <span className="text-green-600">&#10003;</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )
                      ) : (
                        <span className="text-muted-foreground">{row[plan]}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="container py-24 border-t">
        <h2 className="text-2xl font-bold text-center mb-12">Frequently asked questions</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq) => (
            <div key={faq.question} className="border-b pb-6 last:border-0">
              <h3 className="font-semibold mb-2">{faq.question}</h3>
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <CTASection
        headline="Start building for free"
        subtext="No credit card required. Upgrade when you are ready."
        ctaText="Get Started Free"
        ctaHref="/sign-up"
      />
    </>
  );
}
