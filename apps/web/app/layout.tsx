import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { ApiProvider } from '@/components/auth/api-provider';
import { ClerkWrapper } from './clerk-wrapper';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'FlowForge AI - Workflow Automation Platform',
  description: 'Build powerful workflows with natural language. Automate anything with AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ClerkWrapper>
          <ApiProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </ApiProvider>
        </ClerkWrapper>
      </body>
    </html>
  );
}
