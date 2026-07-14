'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ReactFlowProvider as RFProvider } from '@xyflow/react';
import { ThemeProvider } from './theme-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ThemeProvider>
        <RFProvider>{children}</RFProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
