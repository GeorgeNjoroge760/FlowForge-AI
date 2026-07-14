'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
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

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground',
        className
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <Zap className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold tracking-tight">FlowForge AI</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
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

      <div className="border-t border-sidebar-border px-6 py-4">
        <p className="text-xs text-sidebar-foreground/40">
          FlowForge AI v1.0
        </p>
      </div>
    </aside>
  );
}
