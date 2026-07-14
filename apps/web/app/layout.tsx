import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { ApiProvider } from '@/components/auth/api-provider';
import { headers } from 'next/headers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'FlowForge AI - Workflow Automation Platform',
  description: 'Build powerful AI-driven workflows. Automate anything.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await headers();

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen antialiased">
          <ApiProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </ApiProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
