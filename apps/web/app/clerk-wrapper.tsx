'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export function ClerkWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <ClerkProvider>{children}</ClerkProvider>;
}
