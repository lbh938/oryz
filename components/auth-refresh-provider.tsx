'use client';

import { useAuthRefresh } from '@/hooks/use-auth-refresh';
import { ReactNode } from 'react';

interface AuthRefreshProviderProps {
  children: ReactNode;
}

export function AuthRefreshProvider({ children }: AuthRefreshProviderProps) {
  useAuthRefresh();
  return <>{children}</>;
}

