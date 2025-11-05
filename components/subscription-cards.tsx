'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PLANS, Plan, getCurrentSubscription } from '@/lib/subscriptions';
import { Crown, Check, ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function SubscriptionCards() {
  const router = useRouter();
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadSubscription = async () => {
    try {
      const sub = await getCurrentSubscription();
      setCurrentSubscription(sub);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, []);

  useEffect(() => {
    // Rafraîchir automatiquement lors du focus de la fenêtre
    const handleFocus = () => {
      loadSubscription();
    };
    window.addEventListener('focus', handleFocus);

    // Rafraîchir toutes les 3 secondes si l'abonnement existe mais n'est pas encore actif
    // (pour détecter les changements après paiement)
    let interval: NodeJS.Timeout | null = null;
    if (currentSubscription && 
        (currentSubscription.status === 'incomplete' || 
         (currentSubscription.status !== 'trial' && currentSubscription.status !== 'active'))) {
      interval = setInterval(() => {
        loadSubscription();
      }, 3000);
      
      // Arrêter le rafraîchissement après 2 minutes
      setTimeout(() => {
        if (interval) {
          clearInterval(interval);
        }
      }, 120000); // 2 minutes
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [currentSubscription?.status]); // Re-exécuter si le statut change

  const handleCardClick = (plan: Plan) => {
    // Rediriger vers la page d'abonnement avec le plan sélectionné
    router.push(`/subscription#plan-${plan.id}`);
  };

  // Fonction pour vérifier si un plan est un upgrade
  const isUpgrade = (planId: string): boolean => {
    if (!currentSubscription) return false;
    const currentPlan = currentSubscription.plan_type;
    
    // Ordre des plans : free < kickoff < pro_league < vip
    const planOrder: Record<string, number> = {
      'free': 0,
      'kickoff': 1,
      'pro_league': 2,
      'vip': 3
    };
    
    return planOrder[planId] > (planOrder[currentPlan] || 0);
  };

  // Fonction pour vérifier si c'est le plan actuel
  const isCurrentPlan = (planId: string): boolean => {
    if (!currentSubscription) return false;
    
    // Vérifier que c'est le bon plan
    if (currentSubscription.plan_type !== planId) return false;
    
    // Si le statut est 'active' ou 'trial', c'est le plan actuel
    if (currentSubscription.status === 'active' || currentSubscription.status === 'trial') {
      return true;
    }
    
    // Si le statut est 'incomplete' mais qu'il y a un stripe_subscription_id,
    // cela signifie que le paiement a été effectué mais le webhook n'a pas encore mis à jour le statut
    // On considère l'abonnement comme actif si les dates sont valides
    if (currentSubscription.status === 'incomplete' && currentSubscription.stripe_subscription_id) {
      // Vérifier si les dates sont valides (trial_end ou current_period_end dans le futur)
      if (currentSubscription.trial_end) {
        return new Date(currentSubscription.trial_end) > new Date();
      }
      if (currentSubscription.current_period_end) {
        return new Date(currentSubscription.current_period_end) > new Date();
      }
      // Si pas de dates mais qu'il y a un stripe_subscription_id, on considère que c'est actif
      return true;
    }
    
    return false;
  };

  return (
    <section className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12" data-subscription-section>
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold bg-gradient-to-r from-[#0F4C81] to-[#3498DB] bg-clip-text text-transparent mb-4">
          Abonnements Premium
        </h2>
        <p className="text-white/70 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
          Accédez à toutes les chaînes premium : beIN SPORT, DAZN, Canal+, RMC Sport et plus encore
        </p>
      </div>

      {/* Cartes d'offres */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`relative overflow-hidden hover:shadow-2xl hover:shadow-[#3498DB]/30 hover:border-white/20 transition-all duration-300 border-white/10 bg-white/5 backdrop-blur-xl group ${
              plan.isPopular ? 'ring-2 ring-[#3498DB] border-[#3498DB]/50' : ''
            }`}
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-0 bg-gradient-to-r from-[#3498DB] to-[#0F4C81] px-2 sm:px-3 py-0.5 sm:py-1 rounded-bl-lg">
                <span className="text-white text-[10px] sm:text-xs font-bold uppercase">Populaire</span>
              </div>
            )}
            
            <div className="p-4 sm:p-5 md:p-6 flex flex-col h-full">
              {/* En-tête */}
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Crown className={`h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 ${plan.isPopular ? 'text-[#3498DB]' : 'text-white/60'}`} />
                <h3 className="text-lg sm:text-xl font-display font-bold text-white truncate">{plan.name}</h3>
              </div>

              {/* Prix */}
              <div className="mb-3 sm:mb-4">
                <div className="flex items-baseline gap-1 sm:gap-2">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white">
                    {plan.price.toFixed(2)}€
                  </span>
                  <span className="text-white/60 text-xs sm:text-sm">/mois</span>
                </div>
                {plan.trialDays && (
                  <p className="text-[#3498DB] text-xs sm:text-sm font-semibold mt-1">
                    🎁 {plan.trialDays} jours d'essai gratuit (0€)
                    <br />
                    <span className="text-white/60 text-[10px] sm:text-xs font-normal">
                      Carte requise, aucun débit pendant l'essai
                    </span>
                  </p>
                )}
              </div>

              {/* Description */}
              <p className="text-white/70 text-xs sm:text-sm mb-4 sm:mb-6 flex-grow line-clamp-2">{plan.description}</p>

              {/* Features principales */}
              <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
                {plan.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-start gap-1.5 sm:gap-2">
                    <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#3498DB] flex-shrink-0 mt-0.5" />
                    <span className="text-white/80 text-xs sm:text-sm leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Bouton */}
              {loading ? (
                <Button
                  disabled
                  className="w-full h-10 sm:h-11 md:h-12 text-xs sm:text-sm md:text-base bg-white/5 text-white/50 border border-white/10 font-label font-semibold"
                >
                  Chargement...
                </Button>
              ) : isCurrentPlan(plan.id) ? (
                <Button
                  disabled
                  className="w-full h-10 sm:h-11 md:h-12 text-xs sm:text-sm md:text-base bg-green-600/20 text-green-400 border border-green-600/30 font-label font-semibold"
                >
                  ✓ Plan actuel
                </Button>
              ) : isUpgrade(plan.id) ? (
                <Button
                  onClick={() => handleCardClick(plan)}
                  className={`w-full h-10 sm:h-11 md:h-12 text-xs sm:text-sm md:text-base ${
                    plan.isPopular
                      ? 'bg-gradient-to-r from-[#3498DB] to-[#0F4C81] hover:from-[#3498DB]/90 hover:to-[#0F4C81]/90 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  } font-label font-semibold`}
                >
                  <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  <span className="hidden sm:inline">Upgrade vers {plan.name}</span>
                  <span className="sm:hidden">Upgrade</span>
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1.5 sm:ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={() => handleCardClick(plan)}
                  className={`w-full h-10 sm:h-11 md:h-12 text-xs sm:text-sm md:text-base ${
                    plan.isPopular
                      ? 'bg-gradient-to-r from-[#3498DB] to-[#0F4C81] hover:from-[#3498DB]/90 hover:to-[#0F4C81]/90 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  } font-label font-semibold`}
                >
                  <span className="hidden sm:inline">{plan.isPopular ? 'Commencer maintenant' : 'Voir les détails'}</span>
                  <span className="sm:hidden">{plan.isPopular ? 'Commencer' : 'Détails'}</span>
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1.5 sm:ml-2" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Bouton Comparer */}
      <div className="text-center">
        <Link href="/subscription">
          <Button
            variant="outline"
            className="border-[#3498DB] text-[#3498DB] hover:bg-[#3498DB] hover:text-white font-label font-semibold px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base h-10 sm:h-11 md:h-12"
          >
            <span className="hidden sm:inline">Comparer tous les plans</span>
            <span className="sm:hidden">Comparer</span>
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1.5 sm:ml-2" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

