'use client';

import { ReactNode } from 'react';
import { useSubscriptionContext } from '@/contexts/subscription-context';
import { Loader2, Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PremiumGateProps {
  channelName: string;
  channelId: string;
  children: ReactNode;
}

/**
 * PremiumGate - Simplifié : Accès libre pour tous
 * Plus de blocage, plus de fingerprint, plus de vérification IP
 */
export function PremiumGate({ channelName, channelId, children }: PremiumGateProps) {
  const { status, isSyncing } = useSubscriptionContext();

  // Déterminer si l'utilisateur a un statut premium
  const hasPremiumStatus = ['trial', 'kickoff', 'pro_league', 'vip', 'admin'].includes(status);

  // ACCÈS LIBRE POUR TOUS - Plus de restrictions
  // Afficher un loader uniquement pendant la synchronisation initiale
  if (isSyncing && status === 'anonymous') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-[#3498DB]" />
        <p className="text-white/60 text-sm">Chargement...</p>
      </div>
    );
  }

  // Tout le monde a accès au contenu
  return <>{children}</>;

  // Message de restriction supprimé - Plus de blocage
}
