'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">FlowForge AI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/pricing"
            className={`text-sm transition-colors ${
              pathname === '/pricing' ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pricing
          </Link>
          <Link
            href="/docs"
            className={`text-sm transition-colors ${
              pathname.startsWith('/docs') ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Docs
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/get-started">
            <Button size="sm">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-lg">
          <nav className="container flex flex-col gap-2 py-4">
            <Link
              href="/pricing"
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-accent"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-accent"
              onClick={() => setMobileOpen(false)}
            >
              Docs
            </Link>
            <div className="flex gap-2 pt-2">
              <Link href="/sign-in" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full">Sign In</Button>
              </Link>
              <Link href="/get-started" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="w-full">Get Started</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
