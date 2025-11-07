'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useSubscriptionSync, UserStatus } from '@/hooks/use-subscription-sync';

interface SubscriptionContextType {
  subscription: any;
  status: UserStatus;
  isAdmin: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  syncSubscription: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { subscription, status, isAdmin, isSyncing, lastSync, syncSubscription } = useSubscriptionSync();

  // OPTIMISATION: Stabiliser la valeur du contexte avec useMemo pour éviter les re-renders inutiles
  // Ne recréer l'objet que si les valeurs critiques changent
  const value = useMemo(() => ({
    subscription,
    status,
    isAdmin,
    isSyncing,
    lastSync,
    syncSubscription,
  }), [
    subscription?.id, // ID de l'abonnement (change rarement)
    subscription?.status, // Statut de l'abonnement
    subscription?.plan_type, // Type de plan
    status, // Statut utilisateur
    isAdmin, // Statut admin
    isSyncing, // État de synchronisation
    lastSync?.getTime(), // Timestamp de la dernière sync (convertir Date en nombre pour comparaison)
    syncSubscription, // Fonction stable grâce à useCallback dans useSubscriptionSync
  ]);

  return (
    <SubscriptionContext.Provider value={value}>
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

