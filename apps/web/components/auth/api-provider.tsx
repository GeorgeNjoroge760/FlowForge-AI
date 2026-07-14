'use client';

import { useEffect } from 'react';
import { api } from '@/lib/api';

export function ApiProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    api.setTokenGetter(async () => {
      try {
        const w = window as any;
        if (w.Clerk?.session) {
          return await w.Clerk.session.getToken();
        }
      } catch {}
      return null;
    });
  }, []);

  return <>{children}</>;
}
