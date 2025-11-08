'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useSubscriptionContext } from '@/contexts/subscription-context';
import { useViewingTimer } from '@/hooks/use-viewing-timer';
import { Loader2, Lock, Crown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

interface PremiumGateProps {
  channelName: string;
  channelId: string;
  children: ReactNode;
}

/**
 * PremiumGate - Avec timer de 15 minutes pour utilisateurs free
 * Pas de fingerprint, pas de tracking IP, juste un timer de session
 */
export function PremiumGate({ channelName, channelId, children }: PremiumGateProps) {
  const { status, isSyncing } = useSubscriptionContext();
  const [isWatching, setIsWatching] = useState(false);

  // Déterminer si l'utilisateur a un statut premium
  const hasPremiumStatus = ['trial', 'kickoff', 'admin'].includes(status);
  
  // Déterminer si l'utilisateur est free (avec ou sans compte)
  const isFreeUser = status === 'free' || status === 'anonymous';

  // Hook de timer de visionnage (seulement pour les free)
  const { timeRemaining, hasExceeded, formatTimeRemaining } = useViewingTimer(
    isWatching && isFreeUser,
    status
  );

  // Activer le timer quand le composant est monté
  useEffect(() => {
    setIsWatching(true);
    return () => setIsWatching(false);
  }, []);

  // Afficher un loader pendant la synchronisation initiale
  if (isSyncing && status === 'anonymous') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-[#3498DB]" />
        <p className="text-white/60 text-sm">Chargement...</p>
      </div>
    );
  }

  // Overlay de message après 15 minutes (sans bloquer le visionnage)
  const showOverlayMessage = isFreeUser && hasExceeded;

  // Afficher le contenu avec un banner de temps restant pour les free
  return (
    <div className="relative">
      {/* Banner de temps restant (avant 15 minutes) */}
      {isFreeUser && timeRemaining !== null && !hasExceeded && (
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-b border-orange-500/30 py-2 px-4">
          <div className="container max-w-7xl mx-auto flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-white">
              <Clock className="h-4 w-4" />
              <span className="font-medium">
                Temps restant : <span className="font-bold">{formatTimeRemaining()}</span>
              </span>
            </div>
            <Link href="/subscription">
              <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-xs">
                <Crown className="h-3 w-3 mr-1" />
                Passer Premium
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Contenu vidéo */}
      {children}

      {/* Overlay de message après 15 minutes (sans bloquer la vidéo) */}
      {showOverlayMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="max-w-md w-full p-6 sm:p-8 bg-gradient-to-br from-[#0F4C81]/95 to-[#3498DB]/95 border-[#3498DB]/50 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center gap-4 sm:gap-6">
              {/* Icône */}
              <div className="relative">
                <div className="absolute inset-0 bg-[#3498DB]/30 blur-xl rounded-full"></div>
                <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-white/20 to-white/5 border-2 border-white/30">
                  <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-display font-bold text-white">
                  Temps de visionnage écoulé
                </h3>
                <p className="text-white/90 text-sm">
                  Vous avez atteint la limite de 15 minutes de visionnage gratuit.
                </p>
                <p className="text-white/70 text-xs">
                  La vidéo continue, mais passez Premium pour une expérience sans interruption !
                </p>
              </div>

              {/* Avantages Premium */}
              <div className="w-full space-y-2 bg-white/10 rounded-lg p-3 sm:p-4 border border-white/20">
                <p className="text-white/80 text-xs font-semibold uppercase tracking-wide">
                  Avec Premium :
                </p>
                <ul className="space-y-1.5 text-xs sm:text-sm text-white/90">
                  <li className="flex items-center gap-2">
                    <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-300 flex-shrink-0" />
                    <span>Visionnage illimité</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-300 flex-shrink-0" />
                    <span>Qualité HD/4K</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-300 flex-shrink-0" />
                    <span>Sans publicité</span>
                  </li>
                </ul>
              </div>

              {/* Boutons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                <Link href="/subscription" className="flex-1">
                  <Button className="w-full bg-white text-[#0F4C81] hover:bg-white/90 font-semibold text-sm">
                    <Crown className="h-4 w-4 mr-2" />
                    Voir les offres
                  </Button>
                </Link>
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full border-white/40 text-white hover:bg-white/10 text-sm">
                    Retour
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
