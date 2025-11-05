'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Crown, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isPremiumChannel } from '@/lib/subscriptions';
import { useFreePreview } from '@/hooks/use-free-preview';
import { FreePreviewBanner } from './free-preview-banner';
import { useSubscriptionContext } from '@/contexts/subscription-context';

interface PremiumGateProps {
  channelName: string;
  channelId: string;
  children: React.ReactNode;
}

export function PremiumGate({ channelName, channelId, children }: PremiumGateProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false); // Commencer à false car on utilise le contexte
  const router = useRouter();
  const isPremium = isPremiumChannel(channelName);
  
  // Utiliser le contexte de subscription pour un accès instantané
  const { subscription, status, isAdmin, isSyncing } = useSubscriptionContext();
  
  // Utiliser le hook de prévisualisation gratuite uniquement pour les chaînes premium ET si l'utilisateur n'est pas admin
  // Les admins n'ont pas besoin de vérification de prévisualisation
  const shouldUsePreview = isPremium && !isAdmin && status !== 'admin';
  const { 
    timeRemaining, 
    hasExceededLimit, 
    isLoading: previewLoading, 
    isAuthorized,
    authorizationError,
    formatTimeRemaining, 
    minutesRemaining 
  } = useFreePreview(shouldUsePreview ? channelId : 'not-premium');

  // Déterminer l'accès premium basé sur le contexte de subscription (rapide)
  useEffect(() => {
    // Si l'utilisateur est admin, accès complet sans restriction (priorité absolue)
    if (isAdmin || status === 'admin') {
      setHasAccess(true);
      setLoading(false);
      return;
    }

    // Si le statut indique un abonnement actif, l'utilisateur a accès (priorité haute)
    if (status === 'kickoff' || status === 'pro_league' || status === 'vip' || status === 'trial') {
      setHasAccess(true);
      setLoading(false);
      return;
    }

    // Si on est encore en train de synchroniser mais qu'on a déjà un statut 'free', autoriser pour les chaînes non-premium
    if (isSyncing && status === 'free' && !isPremium) {
      setHasAccess(true);
      setLoading(false);
      return;
    }

    // Si on est encore en train de synchroniser sans statut, attendre uniquement pour les chaînes premium
    if (isSyncing && status === 'anonymous' && !subscription && isPremium) {
      // Attendre que la synchronisation soit terminée pour les chaînes premium
      return;
    }
    
    // Si l'abonnement est incomplete mais avec stripe_subscription_id, considérer comme actif
    if (subscription && subscription.status === 'incomplete' && subscription.stripe_subscription_id) {
      // Vérifier les dates si disponibles
      const now = new Date();
      if (subscription.trial_end && new Date(subscription.trial_end) > now) {
        setHasAccess(true);
        setLoading(false);
        return;
      }
      if (subscription.current_period_end && new Date(subscription.current_period_end) > now) {
        setHasAccess(true);
        setLoading(false);
        return;
      }
      // Si pas de dates mais stripe_subscription_id existe, considérer actif
      setHasAccess(true);
      setLoading(false);
      return;
    }
    
    // Si l'abonnement est trial ou active, vérifier les dates
    if (subscription && (subscription.status === 'trial' || subscription.status === 'active')) {
      const now = new Date();
      if (subscription.status === 'trial' && subscription.trial_end) {
        setHasAccess(new Date(subscription.trial_end) > now);
        setLoading(false);
        return;
      }
      if (subscription.status === 'active' && subscription.current_period_end) {
        setHasAccess(new Date(subscription.current_period_end) > now);
        setLoading(false);
        return;
      }
      // Si pas de dates mais statut actif, considérer comme actif
      setHasAccess(true);
      setLoading(false);
      return;
    }
    
    // Si ce n'est pas une chaîne premium, autoriser l'accès
    if (!isPremium) {
      setHasAccess(true);
      setLoading(false);
      return;
    }
    
    // Sinon, pas d'accès (pour chaîne premium sans abonnement)
    setHasAccess(false);
    setLoading(false);
  }, [subscription, status, isAdmin, isSyncing, isPremium]);

  const handleSubscribe = async () => {
    // Rediriger vers la page d'abonnement
    // L'utilisateur pourra sélectionner un plan et compléter le checkout
    router.push('/subscription');
  };

  // Afficher le loader seulement si :
  // 1. On est en train de synchroniser ET qu'on n'a pas encore de statut ET que c'est une chaîne premium
  // 2. Le preview charge pour les non-abonnés ET qu'on n'a pas d'accès ET que c'est premium
  // Ne JAMAIS bloquer si :
  // - On a déjà hasAccess = true (même si isSyncing est true)
  // - On a un statut d'abonnement valide (kickoff, pro_league, vip, trial, admin)
  // - Ce n'est pas une chaîne premium
  const shouldShowLoader = hasAccess === null && 
                           isPremium && 
                           ((isSyncing && status === 'anonymous' && !subscription) || 
                            (previewLoading && !isAdmin && status !== 'admin' && !hasAccess && shouldUsePreview));
  
  // Si on a un statut d'abonnement valide, toujours autoriser l'accès (même si isSyncing est true)
  if (status === 'kickoff' || status === 'pro_league' || status === 'vip' || status === 'trial' || status === 'admin' || isAdmin) {
    if (hasAccess !== true) {
      setHasAccess(true);
      setLoading(false);
    }
  }
  
  if (shouldShowLoader) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3498DB]"></div>
      </div>
    );
  }

  // Si l'utilisateur a un abonnement actif, autoriser l'accès
  if (hasAccess) {
    return <>{children}</>;
  }

  // Si c'est une chaîne premium et que l'utilisateur n'a pas d'abonnement
  if (isPremium && !hasAccess) {
    // Si l'utilisateur n'est pas autorisé (VPN, proxy, limite atteinte, etc.)
    if (isAuthorized === false) {
      return (
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
          <Card className="bg-gradient-to-br from-[#3498DB]/20 via-[#0F4C81]/20 to-[#3498DB]/20 border-[#3498DB]/30 p-6 sm:p-8 md:p-12 text-center">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="rounded-full bg-gradient-to-br from-[#3498DB]/30 to-[#0F4C81]/30 p-3 sm:p-4">
                <Crown className="h-8 w-8 sm:h-12 sm:w-12 text-[#3498DB]" />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold text-white mb-3 sm:mb-4">
              🎁 Débloquez l'accès complet
            </h1>

            <p className="text-white/90 text-base sm:text-lg md:text-xl mb-3 sm:mb-4 font-sans">
              Profitez de toutes les chaînes premium sans limite
            </p>

            <p className="text-white/70 text-sm sm:text-base mb-6 sm:mb-8 px-2">
              Accédez à beIN SPORT, DAZN, Canal+, RMC Sport et plus encore avec un abonnement premium
            </p>

            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-3 justify-center mb-3 sm:mb-4">
                <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-[#3498DB]" />
                <h2 className="text-lg sm:text-xl md:text-2xl font-display font-bold text-white">
                  Avantages Premium
                </h2>
              </div>
              <ul className="text-left space-y-2 sm:space-y-3 text-white/90 max-w-md mx-auto text-sm sm:text-base">
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="text-[#3498DB] text-lg sm:text-xl font-bold">✓</span>
                  <span>Accès illimité à toutes les chaînes premium</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="text-[#3498DB] text-lg sm:text-xl font-bold">✓</span>
                  <span>7 jours d'essai gratuit (0€) - Carte requise, aucun débit pendant l'essai</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="text-[#3498DB] text-lg sm:text-xl font-bold">✓</span>
                  <span>Qualité HD/4K sans limite</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="text-[#3498DB] text-lg sm:text-xl font-bold">✓</span>
                  <span>Sans engagement - Résiliez à tout moment</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 sm:gap-4">
              <Button
                onClick={handleSubscribe}
                className="w-full sm:w-auto mx-auto bg-gradient-to-r from-[#3498DB] to-[#0F4C81] hover:from-[#3498DB]/90 hover:to-[#0F4C81]/90 text-white font-label font-bold text-sm sm:text-base h-12 sm:h-14 px-6 sm:px-10 shadow-lg shadow-[#3498DB]/30"
              >
                <Crown className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="hidden sm:inline">Commencer l'essai gratuit (0€)</span>
                <span className="sm:hidden">Essai gratuit 0€</span>
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full sm:w-auto mx-auto border-white/20 text-white/80 hover:bg-white/10 hover:text-white font-label text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-8"
              >
                Découvrir plus de contenu
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    // Si le temps gratuit est dépassé, afficher un message de conversion positif
    if (hasExceededLimit) {
      return (
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
          <Card className="bg-gradient-to-br from-[#3498DB]/20 via-[#0F4C81]/20 to-[#3498DB]/20 border-[#3498DB]/30 p-6 sm:p-8 md:p-12 text-center">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="rounded-full bg-gradient-to-br from-[#3498DB]/30 to-[#0F4C81]/30 p-3 sm:p-4">
                <Crown className="h-8 w-8 sm:h-12 sm:w-12 text-[#3498DB]" />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold text-white mb-3 sm:mb-4">
              🎉 Continuez votre expérience premium
            </h1>

            <p className="text-white/90 text-base sm:text-lg md:text-xl mb-2 sm:mb-3 font-sans">
              Vous avez profité de vos 15 minutes gratuites sur {channelName}
            </p>

            <p className="text-white/70 text-sm sm:text-base mb-6 sm:mb-8 px-2">
              Abonnez-vous maintenant pour un accès illimité à toutes les chaînes premium
            </p>

            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-3 justify-center mb-3 sm:mb-4">
                <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-[#3498DB]" />
                <h2 className="text-lg sm:text-xl md:text-2xl font-display font-bold text-white">
                  Pourquoi s'abonner ?
                </h2>
              </div>
              <ul className="text-left space-y-2 sm:space-y-3 text-white/90 max-w-md mx-auto text-sm sm:text-base">
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="text-[#3498DB] text-lg sm:text-xl font-bold">✓</span>
                  <span>Accès illimité à toutes les chaînes premium (beIN SPORT, DAZN, Canal+, RMC Sport)</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="text-[#3498DB] text-lg sm:text-xl font-bold">✓</span>
                  <span>7 jours d'essai gratuit (0€) - Carte requise, aucun débit pendant l'essai</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="text-[#3498DB] text-lg sm:text-xl font-bold">✓</span>
                  <span>Qualité HD/4K sans limite</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="text-[#3498DB] text-lg sm:text-xl font-bold">✓</span>
                  <span>Sans engagement - Résiliez à tout moment</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 sm:gap-4">
              <Button
                onClick={handleSubscribe}
                className="w-full sm:w-auto mx-auto bg-gradient-to-r from-[#3498DB] to-[#0F4C81] hover:from-[#3498DB]/90 hover:to-[#0F4C81]/90 text-white font-label font-bold text-sm sm:text-base h-12 sm:h-14 px-6 sm:px-10 shadow-lg shadow-[#3498DB]/30"
              >
                <Crown className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="hidden sm:inline">Commencer l'essai gratuit (0€)</span>
                <span className="sm:hidden">Essai gratuit 0€</span>
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full sm:w-auto mx-auto border-white/20 text-white/80 hover:bg-white/10 hover:text-white font-label text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-8"
              >
                Découvrir plus de contenu
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    // Si le temps gratuit est encore disponible, autoriser l'accès avec bannière
    return (
      <>
        <FreePreviewBanner
          timeRemaining={formatTimeRemaining()}
          minutesRemaining={minutesRemaining}
          onSubscribe={handleSubscribe}
        />
        {children}
      </>
    );
  }

  // Si ce n'est pas une chaîne premium, autoriser l'accès
  return <>{children}</>;
}

