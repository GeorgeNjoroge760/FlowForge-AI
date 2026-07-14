'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  LayoutDashboard,
  GitBranch,
  Play,
  Plug,
  FileText,
  Bell,
  Settings,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Workflows', href: '/workflows', icon: GitBranch },
  { name: 'Executions', href: '/executions', icon: Play },
  { name: 'Integrations', href: '/integrations', icon: Plug },
  { name: 'Templates', href: '/templates', icon: FileText },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            onClick={() => setOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground animate-slide-in lg:hidden">
            <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
              <div className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold tracking-tight">
                  FlowForge AI
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-sidebar-foreground/60 transition-colors hover:text-sidebar-foreground"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4">
              {navigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-foreground'
                        : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
