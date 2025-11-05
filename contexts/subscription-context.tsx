'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSubscriptionSync, UserStatus } from '@/hooks/use-subscription-sync';

interface SubscriptionContextType {
  subscription: any;
  status: UserStatus;
  isSyncing: boolean;
  lastSync: Date | null;
  syncSubscription: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { subscription, status, isSyncing, lastSync, syncSubscription } = useSubscriptionSync();

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        status,
        isSyncing,
        lastSync,
        syncSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider');
  }
  return context;
}

