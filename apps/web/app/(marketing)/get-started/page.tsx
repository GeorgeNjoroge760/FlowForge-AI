import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, Workflow, BarChart3, Check, Zap } from 'lucide-react';
import { CTASection } from '@/components/marketing/cta-section';

const steps = [
  {
    number: '1',
    color: 'bg-blue-600',
    title: 'Sign up in seconds',
    description:
      'Create your free account with email or SSO. No credit card needed. You are building workflows within 60 seconds of signing up.',
  },
  {
    number: '2',
    color: 'bg-violet-600',
    title: 'Describe what you want',
    description:
      'Type in plain English: "When I get an email from a customer, summarize it with AI and post it to Slack." Our AI builds the workflow for you.',
  },
  {
    number: '3',
    color: 'bg-green-600',
    title: 'Review and customize',
    description:
      'See your workflow as a visual diagram. Drag and drop nodes, adjust settings, add conditions. You are always in control.',
  },
  {
    number: '4',
    color: 'bg-amber-600',
    title: 'Deploy and monitor',
    description:
      'Toggle your workflow on. Every execution is logged in real-time. See exactly what happened, when, and why.',
  },
];

const capabilities = [
  {
    icon: Brain,
    title: 'AI Workflow Generation',
    description: 'Turn natural language into executable workflows. Our AI understands context, handles edge cases, and suggests optimizations.',
  },
  {
    icon: Workflow,
    title: 'Visual Drag-and-Drop Editor',
    description: 'Fine-tune your workflows with our React Flow canvas. Move nodes, add branches, configure conditions visually.',
  },
  {
    icon: Zap,
    title: '32 Node Types',
    description: 'Triggers, actions, and logic nodes for every use case: email, Slack, AI, HTTP, webhooks, schedules, filters, and more.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Monitoring',
    description: 'Track every execution with detailed logs, timelines, and error debugging. Know exactly what is happening at all times.',
  },
];

export default function GetStartedPage() {
  return (
    <>
      {/* Hero */}
      <section className="container py-24 text-center">
        <div className="inline-flex items-center rounded-full border border-border/60 px-4 py-1.5 text-sm text-muted-foreground mb-6">
          <span className="mr-2 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Free to start
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl max-w-3xl">
          Get started in{' '}
          <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            minutes
          </span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Build powerful automations without writing code. Describe what you want,
          and FlowForge AI does the rest.
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <Link href="/sign-up">
            <Button size="lg" className="h-12 px-8">
              Start for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/docs">
            <Button variant="outline" size="lg" className="h-12 px-8">
              Read the Docs
            </Button>
          </Link>
        </div>
      </section>

      {/* Steps */}
      <section className="container py-24 border-t">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">How to get started</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From sign-up to your first running workflow in four steps.
          </p>
        </div>
        <div className="max-w-3xl mx-auto space-y-12">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-6">
              <div className={`h-10 w-10 rounded-full ${step.color} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
                {step.number}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-muted-foreground mt-2">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section className="container py-24 border-t">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">What you get on day one</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything is included from the start. No feature gating, no surprises.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {capabilities.map((cap) => (
            <div key={cap.title} className="flex gap-4 p-6 rounded-xl border border-border/60">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <cap.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{cap.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{cap.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Checklist */}
      <section className="container py-24 border-t">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">What is included for free</h2>
          <ul className="space-y-4">
            {[
              'AI-powered workflow generation',
              'Visual drag-and-drop builder',
              '100 executions per month',
              '3 active workflows',
              '10+ integrations',
              'Execution logs (7-day history)',
              'Community support',
              'No credit card required',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CTASection
        headline="Ready to build your first workflow?"
        subtext="Join 500+ teams automating their work with FlowForge AI."
        ctaText="Create Free Account"
        ctaHref="/sign-up"
      />
    </>
  );
}
