'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PLANS, Plan } from '@/lib/subscriptions';
import { Crown, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function SubscriptionCards() {
  const router = useRouter();

  const handleCardClick = (plan: Plan) => {
    // Rediriger vers la page d'abonnement avec le plan sélectionné
    router.push(`/subscription#plan-${plan.id}`);
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

