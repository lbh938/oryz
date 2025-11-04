'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Crown, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { hasPremiumAccess, isPremiumChannel } from '@/lib/subscriptions';
import { useFreePreview } from '@/hooks/use-free-preview';
import { FreePreviewBanner } from './free-preview-banner';

interface PremiumGateProps {
  channelName: string;
  channelId: string;
  children: React.ReactNode;
}

export function PremiumGate({ channelName, channelId, children }: PremiumGateProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const isPremium = isPremiumChannel(channelName);
  
  // Utiliser le hook de prévisualisation gratuite uniquement pour les chaînes premium
  const { 
    timeRemaining, 
    hasExceededLimit, 
    isLoading: previewLoading, 
    isAuthorized,
    authorizationError,
    formatTimeRemaining, 
    minutesRemaining 
  } = useFreePreview(isPremium ? channelId : 'not-premium');

  useEffect(() => {
    const checkAccess = async () => {
      const access = await hasPremiumAccess();
      setHasAccess(access);
      setLoading(false);
    };

    checkAccess();
  }, []);

  const handleSubscribe = () => {
    router.push('/subscription');
  };

  if (loading || previewLoading) {
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
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Card className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/30 p-8 sm:p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-red-500/20 p-4">
                <Lock className="h-12 w-12 text-red-500" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Accès Restreint
            </h1>

            <p className="text-white/80 text-lg mb-2">
              {authorizationError || 'Accès non autorisé'}
            </p>

            <p className="text-white/70 text-sm sm:text-base mb-8">
              L'utilisation de VPN, proxy ou le dépassement de la limite d'essais gratuits est détecté.
            </p>

            <div className="bg-white/5 backdrop-blur-xl rounded-lg p-6 mb-8">
              <div className="flex items-center gap-3 justify-center mb-4">
                <Crown className="h-6 w-6 text-[#3498DB]" />
                <h2 className="text-xl font-display font-bold text-white">
                  Abonnez-vous pour continuer
                </h2>
              </div>
              <ul className="text-left space-y-2 text-white/80 max-w-md mx-auto">
                <li className="flex items-center gap-2">
                  <span className="text-[#3498DB]">✓</span>
                  <span>Accès illimité sans restriction</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#3498DB]">✓</span>
                  <span>7 jours d'essai gratuit (0€)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#3498DB]">✓</span>
                  <span>Sans engagement</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleSubscribe}
                className="bg-gradient-to-r from-[#3498DB] to-[#0F4C81] hover:from-[#3498DB]/90 hover:to-[#0F4C81]/90 text-white font-label font-semibold h-12 px-8"
              >
                <Crown className="h-4 w-4 mr-2" />
                S'abonner maintenant (0€ pendant 7 jours)
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="border-[#3498DB] text-[#3498DB] hover:bg-[#3498DB] hover:text-white font-label font-semibold h-12 px-8"
              >
                Retour à l'accueil
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    // Si le temps gratuit est dépassé, bloquer
    if (hasExceededLimit) {
      return (
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Card className="bg-gradient-to-br from-[#3498DB]/20 to-[#0F4C81]/20 border-[#3498DB]/30 p-8 sm:p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-[#3498DB]/20 p-4">
                <Lock className="h-12 w-12 text-[#3498DB]" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Temps gratuit écoulé
            </h1>

            <p className="text-white/80 text-lg mb-2">
              Vous avez utilisé vos 15 minutes gratuites pour {channelName}
            </p>

            <p className="text-white/70 text-sm sm:text-base mb-8">
              Abonnez-vous pour continuer à regarder toutes les chaînes premium
            </p>

            <div className="bg-white/5 backdrop-blur-xl rounded-lg p-6 mb-8">
              <div className="flex items-center gap-3 justify-center mb-4">
                <Crown className="h-6 w-6 text-[#3498DB]" />
                <h2 className="text-xl font-display font-bold text-white">
                  Avantages Premium
                </h2>
              </div>
              <ul className="text-left space-y-2 text-white/80 max-w-md mx-auto">
                <li className="flex items-center gap-2">
                  <span className="text-[#3498DB]">✓</span>
                  <span>Accès illimité à toutes les chaînes premium</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#3498DB]">✓</span>
                  <span>beIN SPORT, DAZN, Canal+, RMC Sport</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#3498DB]">✓</span>
                  <span>Qualité HD sans limite</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#3498DB]">✓</span>
                  <span>7 jours d'essai gratuit (0€)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#3498DB]">✓</span>
                  <span>Sans engagement</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleSubscribe}
                className="bg-gradient-to-r from-[#3498DB] to-[#0F4C81] hover:from-[#3498DB]/90 hover:to-[#0F4C81]/90 text-white font-label font-semibold h-12 px-8"
              >
                <Crown className="h-4 w-4 mr-2" />
                S'abonner maintenant (0€ pendant 7 jours)
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="border-[#3498DB] text-[#3498DB] hover:bg-[#3498DB] hover:text-white font-label font-semibold h-12 px-8"
              >
                Retour à l'accueil
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

