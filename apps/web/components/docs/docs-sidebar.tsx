'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sections = [
  {
    title: 'Introduction',
    items: [
      { label: 'Overview', href: '/docs' },
      { label: 'Getting Started', href: '/docs/getting-started' },
    ],
  },
  {
    title: 'Core Concepts',
    items: [
      { label: 'Workflow Builder', href: '/docs/workflow-builder' },
      { label: 'Node Types', href: '/docs/node-types' },
      { label: 'Integrations', href: '/docs/integrations' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { label: 'API Reference', href: '/docs/api-reference' },
      { label: 'Billing & Plans', href: '/docs/billing' },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-64 shrink-0 border-r border-gray-200 bg-gray-50 p-6">
      {sections.map((section) => (
        <div key={section.title} className="mb-6">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            {section.title}
          </h4>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-50 font-medium text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
