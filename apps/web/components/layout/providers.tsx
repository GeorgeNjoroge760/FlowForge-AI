'use client';

import { ReactFlowProvider as RFProvider } from '@xyflow/react';
import { ThemeProvider } from './theme-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <RFProvider>{children}</RFProvider>
    </ThemeProvider>
  );
}
