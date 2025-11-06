'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Crown } from 'lucide-react';
import { useSubscriptionContext } from '@/contexts/subscription-context';

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { syncSubscription, status } = useSubscriptionContext();

  useEffect(() => {
    // Synchroniser immédiatement avec Stripe pour obtenir le statut à jour
    syncSubscription();
    
    // Attendre un peu pour que le webhook Stripe ait le temps de traiter
    // puis synchroniser à nouveau pour être sûr
    const timer = setTimeout(() => {
      syncSubscription();
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [syncSubscription]);

  return (
    <div className="container max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Card className="bg-gradient-to-br from-[#3498DB]/20 to-[#0F4C81]/20 border-[#3498DB]/30 p-8 sm:p-12 text-center">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3498DB]"></div>
            <p className="text-white/70">Vérification de votre abonnement...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-[#3498DB]/20 p-4">
                <CheckCircle className="h-12 w-12 text-[#3498DB]" />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
              Abonnement Confirmé !
            </h1>
            
            <p className="text-white/80 text-lg mb-8">
              Bienvenue dans l'abonnement Premium ! Votre essai gratuit de 7 jours a commencé.
            </p>

            <div className="bg-white/5 backdrop-blur-xl rounded-lg p-6 mb-8">
              <div className="flex items-center gap-3 justify-center mb-4">
                <Crown className="h-6 w-6 text-[#3498DB]" />
                <h2 className="text-xl font-display font-bold text-white">
                  Accès Premium Activé
                </h2>
              </div>
              <ul className="text-left space-y-2 text-white/80">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-[#3498DB]" />
                  <span>Accès à toutes les chaînes premium</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-[#3498DB]" />
                  <span>beIN SPORT, DAZN, Canal+, RMC Sport</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-[#3498DB]" />
                  <span>Qualité HD sans limite</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push('/')}
                className="bg-gradient-to-r from-[#3498DB] to-[#0F4C81] hover:from-[#3498DB]/90 hover:to-[#0F4C81]/90 text-white font-label font-semibold"
              >
                Retour à l'accueil
              </Button>
              <Button
                onClick={() => router.push('/channels')}
                variant="outline"
                className="border-[#3498DB] text-[#3498DB] hover:bg-[#3498DB] hover:text-white font-label font-semibold"
              >
                Voir les chaînes
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <MainLayout>
      <Suspense fallback={
        <div className="container max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3498DB]"></div>
          </div>
        </div>
      }>
        <SubscriptionSuccessContent />
      </Suspense>
    </MainLayout>
  );
}

