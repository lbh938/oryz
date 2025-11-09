'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useSubscriptionContext } from '@/contexts/subscription-context';
import { useFreePreview } from '@/hooks/use-free-preview';
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
 * Tracking IP et fingerprinting pour éviter les abus
 * Seuls les utilisateurs free (avec compte) ont accès à la preview
 */
export function PremiumGate({ channelName, channelId, children }: PremiumGateProps) {
  const { status, isSyncing } = useSubscriptionContext();

  // Déterminer si l'utilisateur a un statut premium
  const hasPremiumStatus = ['trial', 'kickoff', 'admin'].includes(status);
  
  // Seuls les utilisateurs free (avec compte) peuvent utiliser la preview
  // Les anonymous n'ont pas accès
  const isFreeUser = status === 'free';

  // Hook de vérification de preview avec IP et fingerprinting (seulement pour les free)
  const { isLoading: previewLoading, isAuthorized, authorizationError, remainingMs } = useFreePreview(
    isFreeUser ? channelId : ''
  );

  // Calculer le temps restant et si le temps est écoulé
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [hasExceeded, setHasExceeded] = useState(false);
  const [isStable, setIsStable] = useState(false); // État stable pour éviter les flashes

  useEffect(() => {
    if (remainingMs !== null && remainingMs !== undefined) {
      setTimeRemaining(remainingMs);
      setHasExceeded(remainingMs <= 0);
      
      // Attendre un court délai avant de considérer l'état comme stable (évite les flashes)
      const stabilityTimer = setTimeout(() => {
        setIsStable(true);
      }, 300);

      // Mettre à jour le timer toutes les secondes
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 0) {
            setHasExceeded(true);
            return 0;
          }
          const newRemaining = prev - 1000;
          if (newRemaining <= 0) {
            setHasExceeded(true);
            return 0;
          }
          return newRemaining;
        });
      }, 1000);

      return () => {
        clearInterval(interval);
        clearTimeout(stabilityTimer);
      };
    } else {
      setIsStable(false);
    }
  }, [remainingMs]);

  // Fonction pour formater le temps restant
  const formatTimeRemaining = (ms: number | null): string => {
    if (ms === null || ms <= 0) return '0:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Afficher un loader pendant la synchronisation initiale ou la vérification de preview
  // Attendre que l'état soit stable pour éviter les flashes en PWA
  if (isSyncing || (isFreeUser && (!isStable || (previewLoading && isAuthorized === null)))) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-[#3498DB]" />
        <p className="text-white/60 text-sm">Chargement...</p>
      </div>
    );
  }

  // Si l'utilisateur free n'est pas autorisé, afficher le message de restriction
  // Utiliser isStable pour éviter les flashes
  if (isFreeUser && isStable && isAuthorized === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 p-6">
        <div className="text-center space-y-4">
          <Lock className="h-16 w-16 text-[#3498DB] mx-auto" />
          <h3 className="text-2xl font-display font-bold text-white">
            Accès restreint
          </h3>
          <p className="text-white/80 text-base max-w-md">
            {authorizationError || 'Vous avez atteint la limite de votre essai gratuit de 15 minutes.'}
          </p>
          <p className="text-white/60 text-sm">
            Passez Premium pour un accès illimité à tous les contenus !
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Link href="/subscription">
              <Button className="bg-gradient-to-r from-[#0F4C81] to-[#3498DB] hover:from-[#0F4C81]/90 hover:to-[#3498DB]/90 text-white font-semibold">
                <Crown className="h-4 w-4 mr-2" />
                Voir les offres Premium
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="border-white/40 text-white hover:bg-white/10">
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Overlay de message après 15 minutes (sans bloquer le visionnage)
  // Utiliser isStable pour éviter les flashes
  const showOverlayMessage = isFreeUser && isStable && hasExceeded && isAuthorized === true;

  // Afficher le contenu avec un banner de temps restant pour les free
  return (
    <div className="relative">
      {/* Banner de temps restant (avant 15 minutes) */}
      {/* Utiliser isStable pour éviter les flashes en PWA */}
      {isFreeUser && isStable && isAuthorized === true && timeRemaining !== null && !hasExceeded && (
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-b border-orange-500/30 py-2 px-4">
          <div className="container max-w-7xl mx-auto flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-white">
              <Clock className="h-4 w-4" />
              <span className="font-medium">
                Temps restant : <span className="font-bold">{formatTimeRemaining(timeRemaining)}</span>
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" style={{ pointerEvents: 'auto' }}>
          <Card className="max-w-md w-full p-6 sm:p-8 bg-gradient-to-br from-[#0F4C81]/98 to-[#3498DB]/98 border-[#3498DB]/50 shadow-2xl animate-in fade-in zoom-in duration-300 relative z-[10000]">
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
                <p className="text-white/90 text-sm sm:text-base">
                  Vous avez atteint la limite de 15 minutes de visionnage gratuit.
                </p>
                <p className="text-white/70 text-xs sm:text-sm">
                  La vidéo continue, mais passez Premium pour une expérience sans interruption !
                </p>
              </div>

              {/* Avantages Premium */}
              <div className="w-full space-y-2 bg-white/10 rounded-lg p-3 sm:p-4 border border-white/20">
                <p className="text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
                  Avec Premium :
                </p>
                <ul className="space-y-1.5 text-xs sm:text-sm text-white/90 text-left">
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

              {/* Boutons - S'assurer qu'ils sont bien visibles et cliquables */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full mt-2">
                <Link href="/subscription" className="flex-1" style={{ pointerEvents: 'auto', zIndex: 10001 }}>
                  <Button 
                    className="w-full bg-white text-[#0F4C81] hover:bg-white/90 font-semibold text-sm h-10 sm:h-11 shadow-lg hover:shadow-xl transition-all"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Voir les offres
                  </Button>
                </Link>
                <Link href="/" className="flex-1" style={{ pointerEvents: 'auto', zIndex: 10001 }}>
                  <Button 
                    variant="outline" 
                    className="w-full border-white/40 text-white hover:bg-white/10 text-sm h-10 sm:h-11 shadow-lg hover:shadow-xl transition-all"
                    style={{ pointerEvents: 'auto' }}
                  >
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
