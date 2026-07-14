import Link from 'next/link';
import { Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t py-12 mt-auto">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-bold">FlowForge AI</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              AI-powered workflow automation for modern teams.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-3">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Documentation</Link></li>
              <li><Link href="/get-started" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Get Started</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-3">Resources</h4>
            <ul className="space-y-2">
              <li><Link href="/docs/getting-started" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Getting Started</Link></li>
              <li><Link href="/docs/api-reference" className="text-sm text-muted-foreground hover:text-foreground transition-colors">API Reference</Link></li>
              <li><Link href="/docs/integrations" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Integrations</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-3">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} FlowForge AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              GitHub
            </Link>
            <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Twitter
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
