import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Shield, Brain, Workflow, Clock, BarChart3 } from 'lucide-react';

export default function MarketingPage() {
  return (
    <>
      {/* Hero */}
      <section className="container flex flex-col items-center justify-center gap-4 py-24 md:py-32 text-center">
        <div className="inline-flex items-center rounded-full border border-border/60 px-4 py-1.5 text-sm text-muted-foreground">
          <span className="mr-2 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Now in public beta
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl">
          Build workflows with{' '}
          <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            natural language
          </span>
        </h1>
        <p className="max-w-[600px] text-lg text-muted-foreground">
          Describe what you want to automate in plain English. FlowForge AI converts
          your words into powerful, executable workflows.
        </p>
        <div className="flex items-center gap-4 mt-4">
          <Link href="/get-started">
            <Button size="lg" className="h-12 px-8">
              Start for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/docs">
            <Button variant="outline" size="lg" className="h-12 px-8">
              View Documentation
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container py-24 border-t">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">Everything you need to automate</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            From simple tasks to complex workflows, FlowForge AI handles it all.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6">
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold">AI-Powered Builder</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Describe your workflow in natural language and watch it come to life. No coding required.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6">
            <div className="h-12 w-12 rounded-lg bg-violet-500/10 flex items-center justify-center mb-4">
              <Workflow className="h-6 w-6 text-violet-500" />
            </div>
            <h3 className="text-lg font-semibold">Visual Workflow Builder</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Drag and drop nodes, connect them visually, and build complex automations with ease.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6">
            <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold">Enterprise Security</h3>
            <p className="text-sm text-muted-foreground mt-2">
              OAuth2, encrypted API keys, rate limiting, and audit logs keep your data safe.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container py-24 border-t">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold">10K+</div>
            <div className="text-sm text-muted-foreground mt-1">Workflows Created</div>
          </div>
          <div>
            <div className="text-3xl font-bold">500+</div>
            <div className="text-sm text-muted-foreground mt-1">Teams Using FlowForge</div>
          </div>
          <div>
            <div className="text-3xl font-bold">1M+</div>
            <div className="text-sm text-muted-foreground mt-1">Executions Run</div>
          </div>
          <div>
            <div className="text-3xl font-bold">99.9%</div>
            <div className="text-sm text-muted-foreground mt-1">Uptime SLA</div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="container py-24 border-t">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">Connect to everything</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Native integrations with the tools your team already uses.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {['Slack', 'Gmail', 'Telegram', 'OpenAI', 'GitHub', 'Stripe', 'Notion', 'Discord'].map((name) => (
            <div key={name} className="flex items-center gap-2 rounded-lg border border-border/60 px-4 py-2 text-sm font-medium">
              {name}
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-24 border-t">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">How it works</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Three steps to your first automated workflow.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center">
            <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm mb-4">1</div>
            <h3 className="text-lg font-semibold">Describe your workflow</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Write in plain English what you want to automate. Our AI understands your intent.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="h-10 w-10 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-sm mb-4">2</div>
            <h3 className="text-lg font-semibold">Review & customize</h3>
            <p className="text-sm text-muted-foreground mt-2">
              See your workflow as a visual diagram. Drag, drop, and configure nodes to fine-tune it.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="h-10 w-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm mb-4">3</div>
            <h3 className="text-lg font-semibold">Deploy & monitor</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Activate your workflow and track every execution in real-time with detailed logs.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t py-24">
        <div className="container text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to automate?</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Start building workflows for free. No credit card required.
          </p>
          <div className="mt-8">
            <Link href="/get-started">
              <Button size="lg" className="h-12 px-8">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
