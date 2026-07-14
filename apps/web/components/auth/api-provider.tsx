'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api';

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    api.setTokenGetter(getToken);
  }, [getToken]);

  return <>{children}</>;
}
