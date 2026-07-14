'use client';

import { usePathname } from 'next/navigation';
import { Search, Bell, Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';
import { cn } from '@/lib/utils';
import { MobileNav } from './mobile-nav';

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  workflows: 'Workflows',
  executions: 'Executions',
  integrations: 'Integrations',
  templates: 'Templates',
  notifications: 'Notifications',
  settings: 'Settings',
};

export function Header() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = segments.map((segment, index) => ({
    label: routeLabels[segment] ?? segment,
    href: '/' + segments.slice(0, index + 1).join('/'),
    isLast: index === segments.length - 1,
  }));

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      <MobileNav />

      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.href} className="flex items-center gap-1">
            {index > 0 && <span className="text-muted-foreground/50">/</span>}
            <span
              className={cn(
                'transition-colors',
                crumb.isLast
                  ? 'font-medium text-foreground'
                  : 'hover:text-foreground'
              )}
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search..."
            className="h-9 rounded-md border border-border bg-muted/50 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <button
          className="relative rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>

        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Toggle dark mode"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>

        <button
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium"
          aria-label="User menu"
        >
          U
        </button>
      </div>
    </header>
  );
}
