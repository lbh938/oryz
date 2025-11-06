'use client';

import { useState, useEffect, useRef } from 'react';
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
  // Initialiser hasAccess de manière optimiste basé sur le contexte pour éviter les flashs
  const { subscription, status, isAdmin, isSyncing, syncSubscription } = useSubscriptionContext();
  const isPremium = isPremiumChannel(channelName);
  
  // Initialiser hasAccess de manière optimiste pour éviter les flashs
  // Si on a déjà un statut premium, on peut initialiser à true
  const initialHasAccess = isPremium 
    ? (isAdmin || status === 'admin' || status === 'trial' || status === 'kickoff' || status === 'pro_league' || status === 'vip')
    : true; // Non-premium = accès libre
  
  const [hasAccess, setHasAccess] = useState<boolean | null>(initialHasAccess ? true : null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Utiliser le hook de prévisualisation gratuite uniquement pour les chaînes premium ET si l'utilisateur n'est pas admin/premium
  // Les admins et les utilisateurs avec abonnement premium (trial, kickoff, pro_league, vip) n'ont pas besoin de vérification de prévisualisation
  const shouldUsePreview = isPremium && 
                           !isAdmin && 
                           status !== 'admin' && 
                           status !== 'trial' && 
                           status !== 'kickoff' && 
                           status !== 'pro_league' && 
                           status !== 'vip';
  const { 
    isLoading: previewLoading, 
    isAuthorized,
    authorizationError
  } = useFreePreview(shouldUsePreview ? channelId : 'not-premium');

  // Déclencher une synchronisation immédiate si l'utilisateur semble non premium
  // pour éviter le besoin de recharger la page après achat/activation essai
  const syncTriggeredRef = useRef(false);
  const [deferRestriction, setDeferRestriction] = useState(false);
  
  // Timeout global pour éviter le chargement infini (peu importe la chaîne)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const componentMountTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isPremium) return; // inutile pour non-premium
    if (isAdmin || status === 'admin') return;
    const isPremiumStatus = status === 'trial' || status === 'kickoff' || status === 'pro_league' || status === 'vip';
    if (isPremiumStatus) return;

    // Si on est en anonymous/free, déclencher une sync immédiate une seule fois
    if ((status === 'anonymous' || status === 'free') && !syncTriggeredRef.current) {
      syncTriggeredRef.current = true;
      // Déférer l'affichage de la restriction pendant une courte durée pour laisser la sync aboutir
      setDeferRestriction(true);
      try { syncSubscription(); } catch {}
      const t = setTimeout(() => setDeferRestriction(false), 1500);
      return () => clearTimeout(t);
    }
  }, [status, isPremium, isAdmin, syncSubscription]);

  // Timeout global de sécurité : après 8 secondes max, forcer la résolution
  // 8 secondes pour laisser le temps à l'API (5s) + marge de sécurité
  useEffect(() => {
    if (!isPremium) return;
    
    // Si on a déjà un statut premium, pas besoin de timeout
    if (status === 'kickoff' || status === 'pro_league' || status === 'vip' || status === 'trial' || status === 'admin' || isAdmin) {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      return;
    }
    
    // Si hasAccess est déjà résolu, nettoyer le timeout
    if (hasAccess !== null) {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      return;
    }
    
    // Timeout global de 8 secondes pour forcer la résolution
    if (!loadingTimeoutRef.current) {
      loadingTimeoutRef.current = setTimeout(() => {
        // Après 8 secondes, forcer la résolution
        // Si on est encore en train de charger, on bloque l'accès
        setHasAccess(false);
        setLoading(false);
        loadingTimeoutRef.current = null;
      }, 8000);
    }
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [isPremium, status, isAdmin, hasAccess]);

  // Déterminer l'accès premium basé sur le contexte de subscription
  // UNE SEULE SOURCE DE VÉRITÉ: Le contexte a DÉJÀ vérifié les dates d'expiration
  // Si status === 'trial'/'kickoff'/'pro_league'/'vip'/'admin', l'accès est TOUJOURS accordé
  useEffect(() => {
    // PRIORITÉ ABSOLUE: Admin → accès complet
    if (isAdmin || status === 'admin') {
      setHasAccess(true);
      setLoading(false);
      return;
    }

    // PRIORITÉ HAUTE: Statut premium actif → accès complet
    // Le contexte a DÉJÀ vérifié les dates avant de définir ce status
    // IMPORTANT: Vérifier aussi directement dans subscription si status n'est pas encore synchronisé
    if (status === 'kickoff' || status === 'pro_league' || status === 'vip' || status === 'trial') {
      setHasAccess(true);
      setLoading(false);
      return;
    }

    // VÉRIFICATION DE SECOURS: Si subscription existe avec statut 'trial' ou 'active' mais status n'est pas encore mis à jour
    // Cela peut arriver pendant le chargement initial
    if (subscription && (subscription.status === 'trial' || subscription.status === 'active')) {
      const now = new Date();
      // Vérifier les dates d'expiration
      if (subscription.status === 'trial' && subscription.trial_end) {
        if (new Date(subscription.trial_end) > now) {
          // Essai actif → accès accordé
          setHasAccess(true);
          setLoading(false);
          return;
        }
      } else if (subscription.status === 'active' && subscription.current_period_end) {
        if (new Date(subscription.current_period_end) > now) {
          // Abonnement actif → accès accordé
          setHasAccess(true);
          setLoading(false);
          return;
        }
      }
    }

    // Chaîne non-premium → accès libre
    if (!isPremium) {
      setHasAccess(true);
      setLoading(false);
      return;
    }


    // Attendre la synchronisation uniquement si on n'a pas encore de statut pour les chaînes premium
    // NE PAS mettre hasAccess à false pendant la synchronisation pour éviter les flashs
    if (isSyncing && status === 'anonymous' && !subscription && isPremium) {
      // Garder hasAccess à null pour afficher le loader
      // Ne pas modifier hasAccess ici pour éviter les flashs
      return;
    }

    // Statut 'free' ou 'anonymous' → pas d'accès pour les chaînes premium
    // MAIS seulement si on a fini de charger (pas pendant le chargement initial)
    if ((status === 'free' || status === 'anonymous') && !isSyncing) {
      // Si on utilise le preview, attendre qu'il charge (max 8s via timeout global)
      if (shouldUsePreview && isAuthorized === null && previewLoading) {
        // Encore en train de charger le preview, attendre
        // Le timeout global de 8 secondes forcera la résolution si nécessaire
        return;
      }
      // La sync est terminée, on peut déterminer l'accès
      // Si le preview est autorisé et disponible, on l'utilisera (géré plus bas)
      // Sinon, on bloque l'accès
      if (!shouldUsePreview || (isAuthorized !== null && !isAuthorized)) {
        setHasAccess(false);
        setLoading(false);
        return;
      }
      // Si preview autorisé mais pas encore chargé, attendre (timeout global s'en chargera)
      if (shouldUsePreview && isAuthorized === null) {
        return;
      }
    }

    // Si on est encore en train de synchroniser, garder hasAccess à null
    if (isSyncing && hasAccess === null) {
      return;
    }

    // Si le preview charge, attendre (timeout global s'en chargera)
    if (previewLoading && shouldUsePreview && isAuthorized === null && hasAccess === null) {
      return;
    }

    // Cas par défaut: pas d'accès si tout est chargé et pas de preview disponible
    if (!isSyncing && (isAuthorized !== null || !shouldUsePreview)) {
      // Si preview autorisé, accès accordé
      if (shouldUsePreview && isAuthorized === true) {
        setHasAccess(true);
        setLoading(false);
        return;
      }
      // Sinon, bloquer l'accès
      setHasAccess(false);
      setLoading(false);
    }
  }, [subscription, status, isAdmin, isSyncing, isPremium, isAuthorized, previewLoading, shouldUsePreview]);

  const handleSubscribe = async () => {
    router.push('/subscription');
  };

  // Afficher le loader si :
  // - hasAccess est null (chargement initial) ET c'est premium
  // - OU on attend la synchronisation (status anonymous, isSyncing, pas de subscription)
  // - OU le preview charge pour les non-abonnés (mais avec timeout de 5 secondes max)
  // - OU on diffère l'affichage de la restriction
  // JAMAIS si on a déjà un statut premium valide
  // IMPORTANT: Pour les utilisateurs anonymes, ne pas attendre indéfiniment
  const shouldShowLoader = isPremium && 
                          !(status === 'kickoff' || status === 'pro_league' || status === 'vip' || status === 'trial' || status === 'admin' || isAdmin) &&
                          (
                            hasAccess === null || // Chargement initial (mais avec timeout)
                            deferRestriction || // Différer la restriction
                            (isSyncing && status === 'anonymous' && !subscription) || // Synchronisation en cours
                            (previewLoading && shouldUsePreview && isAuthorized === null) // Preview en cours de chargement (mais avec timeout)
                          );
  
  if (shouldShowLoader) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3498DB]"></div>
      </div>
    );
  }

  // Si l'utilisateur a un abonnement actif, autoriser l'accès
  if (hasAccess === true) {
    return <>{children}</>;
  }

  // Si c'est une chaîne premium et que l'utilisateur n'a pas d'abonnement
  // NE JAMAIS afficher le message de restriction si hasAccess est null (chargement en cours)
  // Cela devrait être géré par shouldShowLoader, mais on double-vérifie pour sécurité
  if (isPremium && hasAccess === false) {
    // Si l'accès gratuit est autorisé, afficher avec bannière simple
    if (shouldUsePreview && isAuthorized === true) {
      return (
        <>
          <FreePreviewBanner
            onSubscribe={handleSubscribe}
          />
          {children}
        </>
      );
    }

    // Sinon (temps dépassé, pas autorisé, ou autre), afficher le message standard de restriction
    // Pas de mention des 15 minutes - même message que pour les utilisateurs sans abonnement
    // NE PAS afficher si on est encore en train de charger (isAuthorized === null et shouldUsePreview)
    if (shouldUsePreview && isAuthorized === null) {
      // Encore en train de charger, afficher le loader
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3498DB]"></div>
        </div>
      );
    }

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

  // Si ce n'est pas une chaîne premium, autoriser l'accès
  return <>{children}</>;
}

