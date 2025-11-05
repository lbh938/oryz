'use client';

import { useState, useEffect, Suspense } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PLANS, Plan, hasPremiumAccess, getCurrentSubscription } from '@/lib/subscriptions';
import { Check, Crown, X, Monitor, Smartphone, Tablet } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function SubscriptionPageContent() {
  const [subscription, setSubscription] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Fonction pour scroller vers un plan spécifique
  const scrollToPlan = (planId: string) => {
    const element = document.getElementById(`plan-${planId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsAuthenticated(!!user);
      
      if (user) {
        const sub = await getCurrentSubscription();
        const access = await hasPremiumAccess();
        setSubscription(sub);
        setHasAccess(access);
        
        // Vérifier si l'utilisateur vient de s'inscrire et doit être redirigé vers Stripe
        const autoSubscribePlanId = searchParams.get('auto-subscribe');
        const planFromStorage = localStorage.getItem('selectedPlanId');
        const planId = autoSubscribePlanId || planFromStorage;
        
        if (planId && !access) {
          // Scroller vers le plan sélectionné
          scrollToPlan(planId);
          
          // Trouver le plan correspondant
          const plan = PLANS.find(p => p.id === planId);
          if (plan) {
            // Attendre un peu que l'état soit mis à jour puis lancer l'abonnement
            setTimeout(() => {
              handleSubscribe(plan);
              // Nettoyer le localStorage après utilisation
              localStorage.removeItem('selectedPlanId');
            }, 1500);
          }
        }
      } else {
        // Vérifier si un plan est enregistré dans localStorage (pour redirection après inscription)
        const planFromStorage = localStorage.getItem('selectedPlanId');
        if (planFromStorage) {
          // Scroller vers le plan sélectionné
          scrollToPlan(planFromStorage);
        }
      }
      
      setLoading(false);
    };

    checkAuth();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
      
      if (session?.user) {
        const sub = await getCurrentSubscription();
        const access = await hasPremiumAccess();
        setSubscription(sub);
        setHasAccess(access);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubscribe = async (plan: Plan) => {
    // Si l'utilisateur n'est pas authentifié, rediriger vers l'inscription avec le plan sélectionné
    if (!isAuthenticated || !user) {
      // Sauvegarder le plan sélectionné dans localStorage pour le récupérer après inscription
      localStorage.setItem('selectedPlanId', plan.id);
      // Utiliser window.location.href pour éviter les problèmes de navigation Next.js
      window.location.href = `/auth/sign-up?redirect=/subscription&plan=${plan.id}`;
      return;
    }

    if (!plan.priceId) {
      alert('Configuration Stripe manquante. Veuillez contacter le support.');
      return;
    }

    setProcessing(plan.id);

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          planId: plan.id,
        }),
      });

      const data = await response.json();

      if (data.error) {
        // Si l'erreur est liée à l'authentification, rediriger vers la connexion
        if (response.status === 401 || data.error === 'Non authentifié') {
          const confirmCreate = window.confirm(
            'Vous devez être connecté pour vous abonner. Souhaitez-vous être redirigé vers la page de connexion ?'
          );
          if (confirmCreate) {
            router.push('/auth/login?redirect=/subscription');
          }
        } else {
          alert(data.error);
        }
        setProcessing(null);
        return;
      }

      // Rediriger directement vers l'URL de checkout Stripe
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Erreur : URL de checkout non disponible');
        setProcessing(null);
      }
    } catch (error: any) {
      console.error('Error subscribing:', error);
      alert('Erreur lors de l\'abonnement. Veuillez réessayer.');
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3498DB]"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-[#0F4C81] to-[#3498DB] bg-clip-text text-transparent mb-4">
            Abonnements Premium
          </h1>
          <p className="text-white/70 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-4">
            Accédez à toutes les chaînes premium : beIN SPORT, DAZN, Canal+, RMC Sport et plus encore
          </p>
          {!isAuthenticated && (
            <Card className="bg-gradient-to-r from-[#3498DB]/20 to-[#0F4C81]/20 border-[#3498DB]/30 p-4 sm:p-6 max-w-2xl mx-auto">
              <p className="text-white/90 text-sm sm:text-base font-label font-semibold text-center">
                🎁 Cliquez sur "Essai gratuit" pour commencer votre essai de 7 jours (0€). Une carte de paiement est requise pour facturer automatiquement à la fin de l'essai.
              </p>
            </Card>
          )}
        </div>

        {/* Statut actuel */}
        {subscription && subscription.status !== 'free' && (
          <div className="mb-8 sm:mb-12">
            <Card className="bg-gradient-to-r from-[#3498DB]/20 to-[#0F4C81]/20 border-[#3498DB]/30 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Crown className="h-6 w-6 text-[#3498DB]" />
                <h2 className="text-xl font-display font-bold text-white">
                  {subscription.status === 'incomplete' ? 'Abonnement en attente' : 'Abonnement Actif'}
                </h2>
              </div>
              <div className="space-y-2 text-sm text-white/80">
                <p>
                  <span className="font-semibold">Plan:</span>{' '}
                  {subscription.plan_type === 'kickoff' ? 'Kick-Off' :
                   subscription.plan_type === 'pro_league' ? 'Pro League' :
                   subscription.plan_type === 'vip' ? 'VIP' : 'Premium'}
                </p>
                {subscription.status === 'incomplete' && (
                  <div className="mt-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                    <p className="text-yellow-400 font-semibold mb-3">
                      ⚠️ Votre abonnement n'est pas encore activé
                    </p>
                    <p className="text-white/80 mb-4">
                      Complétez le processus de paiement pour activer votre essai gratuit de 7 jours.
                    </p>
                    <Button
                      onClick={async () => {
                        // Trouver le plan correspondant
                        const plan = PLANS.find(p => 
                          (p.id === 'kickoff' && subscription.plan_type === 'kickoff') ||
                          (p.id === 'pro_league' && subscription.plan_type === 'pro_league') ||
                          (p.id === 'vip' && subscription.plan_type === 'vip')
                        );
                        
                        if (!plan || !plan.priceId) {
                          alert('Erreur : Plan non trouvé. Veuillez contacter le support.');
                          return;
                        }

                        setProcessing(plan.id);

                        try {
                          // Créer une session checkout Stripe directement
                          const response = await fetch('/api/stripe/create-checkout', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              priceId: plan.priceId,
                              planId: plan.id,
                            }),
                          });

                          const data = await response.json();

                          if (data.error) {
                            alert(data.error);
                            setProcessing(null);
                            return;
                          }

                          // Rediriger directement vers l'URL de checkout Stripe
                          if (data.url) {
                            window.location.href = data.url;
                          } else {
                            alert('Erreur : URL de checkout non disponible');
                            setProcessing(null);
                          }
                        } catch (error: any) {
                          console.error('Error completing subscription:', error);
                          alert('Erreur lors de la finalisation de l\'abonnement. Veuillez réessayer.');
                          setProcessing(null);
                        }
                      }}
                      disabled={processing === subscription.plan_type}
                      className="bg-gradient-to-r from-[#3498DB] to-[#0F4C81] hover:from-[#3498DB]/90 hover:to-[#0F4C81]/90 text-white font-label font-semibold"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      {processing === subscription.plan_type ? 'Redirection vers le paiement...' : 'Compléter l\'abonnement'}
                    </Button>
                  </div>
                )}
                {subscription.status === 'trial' && subscription.trial_end && (
                  <p>
                    <span className="font-semibold">Essai gratuit jusqu'au:</span>{' '}
                    {new Date(subscription.trial_end).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                )}
                {subscription.status === 'active' && subscription.current_period_end && (
                  <p>
                    <span className="font-semibold">Renouvellement le:</span>{' '}
                    {new Date(subscription.current_period_end).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                )}
                {subscription.cancel_at_period_end && (
                  <p className="text-yellow-400">
                    ⚠️ Votre abonnement sera annulé à la fin de la période actuelle
                  </p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Tableau comparatif - Responsive */}
        <div className="mb-8 sm:mb-12">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <div className="overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
                <table className="min-w-full divide-y divide-white/10">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-label font-semibold text-white/80 uppercase tracking-wider">
                        Fonctionnalités
                      </th>
                      {PLANS.map((plan) => (
                        <th
                          id={`plan-${plan.id}`}
                          key={plan.id}
                          className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-center ${
                            plan.isPopular
                              ? 'bg-gradient-to-b from-[#3498DB]/20 to-[#0F4C81]/20 border-l-2 border-r-2 border-[#3498DB]'
                              : ''
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                              <Crown className={`h-4 w-4 sm:h-5 sm:w-5 ${plan.isPopular ? 'text-[#3498DB]' : 'text-white/60'}`} />
                              <h3 className="text-base sm:text-lg md:text-xl font-display font-bold text-white">{plan.name}</h3>
                              {plan.isPopular && (
                                <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-gradient-to-r from-[#3498DB] to-[#0F4C81] text-white text-[10px] sm:text-xs font-bold uppercase whitespace-nowrap">
                                  Populaire
                                </span>
                              )}
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white">
                                {plan.price.toFixed(2)}€
                              </span>
                              <span className="text-white/60 text-[10px] sm:text-xs">/mois</span>
                            </div>
                            {plan.trialDays && (
                              <div className="text-[#3498DB] text-[10px] sm:text-xs font-semibold text-center">
                                <p>🎁 {plan.trialDays} jours d'essai gratuit (0€)</p>
                                <p className="text-white/60 text-[9px] sm:text-[10px] font-normal mt-0.5">
                                  Carte requise, aucun débit pendant l'essai
                                </p>
                              </div>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {/* Chaînes premium */}
                    <tr className="bg-white/2.5">
                      <td className="px-4 sm:px-6 py-4 text-sm font-label font-semibold text-white">
                        Chaînes premium
                      </td>
                      {PLANS.map((plan) => (
                        <td
                          key={plan.id}
                          className={`px-4 sm:px-6 py-4 text-center ${
                            plan.isPopular ? 'bg-[#3498DB]/5' : ''
                          }`}
                        >
                          <div className="flex flex-col gap-2 text-xs text-white/80">
                            <div className="flex items-center justify-center gap-1">
                              <Check className="h-4 w-4 text-[#3498DB]" />
                              <span>beIN SPORT</span>
                            </div>
                            <div className="flex items-center justify-center gap-1">
                              <Check className="h-4 w-4 text-[#3498DB]" />
                              <span>DAZN</span>
                            </div>
                            <div className="flex items-center justify-center gap-1">
                              <Check className="h-4 w-4 text-[#3498DB]" />
                              <span>Canal+</span>
                            </div>
                            <div className="flex items-center justify-center gap-1">
                              <Check className="h-4 w-4 text-[#3498DB]" />
                              <span>RMC Sport</span>
                            </div>
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Kick-off */}
                    <tr className="bg-white/2.5">
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-label font-semibold text-white">
                        Kick-off en direct
                      </td>
                      {PLANS.map((plan) => (
                        <td
                          key={plan.id}
                          className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-center ${
                            plan.isPopular ? 'bg-[#3498DB]/5' : ''
                          }`}
                        >
                          <Check className="h-4 w-4 sm:h-5 sm:w-5 text-[#3498DB] mx-auto" />
                        </td>
                      ))}
                    </tr>

                    {/* Pro League */}
                    <tr className="bg-white/2.5">
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-label font-semibold text-white">
                        Pro League
                      </td>
                      {PLANS.map((plan) => (
                        <td
                          key={plan.id}
                          className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-center ${
                            plan.isPopular ? 'bg-[#3498DB]/5' : ''
                          }`}
                        >
                          {plan.id === 'kickoff' ? (
                            <Check className="h-4 w-4 sm:h-5 sm:w-5 text-[#3498DB] mx-auto" />
                          ) : (
                            <span className="text-[#3498DB] font-semibold text-xs sm:text-sm">Complète</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Séries */}
                    <tr className="bg-white/2.5">
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-label font-semibold text-white">
                        Séries
                      </td>
                      {PLANS.map((plan) => (
                        <td
                          key={plan.id}
                          className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-center ${
                            plan.isPopular ? 'bg-[#3498DB]/5' : ''
                          }`}
                        >
                          {plan.id === 'kickoff' ? (
                            <span className="text-white/60 text-[10px] sm:text-xs">Limité</span>
                          ) : plan.id === 'pro_league' ? (
                            <Check className="h-4 w-4 sm:h-5 sm:w-5 text-[#3498DB] mx-auto" />
                          ) : (
                            <span className="text-[#3498DB] font-semibold text-xs sm:text-sm">Illimitées</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Films */}
                    <tr className="bg-white/2.5">
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-label font-semibold text-white">
                        Films
                      </td>
                      {PLANS.map((plan) => (
                        <td
                          key={plan.id}
                          className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-center ${
                            plan.isPopular ? 'bg-[#3498DB]/5' : ''
                          }`}
                        >
                          {plan.id === 'kickoff' ? (
                            <span className="text-white/60 text-[10px] sm:text-xs">Limité</span>
                          ) : plan.id === 'pro_league' ? (
                            <Check className="h-4 w-4 sm:h-5 sm:w-5 text-[#3498DB] mx-auto" />
                          ) : (
                            <span className="text-[#3498DB] font-semibold text-xs sm:text-sm">Illimités</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Autres championnats */}
                    <tr className="bg-white/2.5">
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-label font-semibold text-white">
                        Autres championnats
                      </td>
                      {PLANS.map((plan) => (
                        <td
                          key={plan.id}
                          className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-center ${
                            plan.isPopular ? 'bg-[#3498DB]/5' : ''
                          }`}
                        >
                          {plan.id === 'kickoff' ? (
                            <X className="h-4 w-4 sm:h-5 sm:w-5 text-white/30 mx-auto" />
                          ) : plan.id === 'pro_league' ? (
                            <Check className="h-4 w-4 sm:h-5 sm:w-5 text-[#3498DB] mx-auto" />
                          ) : (
                            <span className="text-[#3498DB] font-semibold text-xs sm:text-sm">Tous inclus</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Appareils */}
                    <tr className="bg-white/2.5">
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-label font-semibold text-white">
                        Appareils
                      </td>
                      {PLANS.map((plan) => (
                        <td
                          key={plan.id}
                          className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-center ${
                            plan.isPopular ? 'bg-[#3498DB]/5' : ''
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                            <Monitor className="h-3 w-3 sm:h-4 sm:w-4 text-[#3498DB]" />
                            <Smartphone className="h-3 w-3 sm:h-4 sm:w-4 text-[#3498DB]" />
                            <Tablet className="h-3 w-3 sm:h-4 sm:w-4 text-[#3498DB]" />
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Qualité */}
                    <tr className="bg-white/2.5">
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-label font-semibold text-white">
                        Qualité
                      </td>
                      {PLANS.map((plan) => (
                        <td
                          key={plan.id}
                          className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-center ${
                            plan.isPopular ? 'bg-[#3498DB]/5' : ''
                          }`}
                        >
                          {plan.id === 'kickoff' ? (
                            <span className="text-white/80 text-xs sm:text-sm">HD</span>
                          ) : plan.id === 'pro_league' ? (
                            <span className="text-[#3498DB] font-semibold text-xs sm:text-sm">HD sans limite</span>
                          ) : (
                            <span className="text-[#3498DB] font-semibold text-xs sm:text-sm">HD/4K sans limite</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Plusieurs écrans */}
                    <tr className="bg-white/2.5">
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-label font-semibold text-white">
                        Plusieurs écrans simultanés
                      </td>
                      {PLANS.map((plan) => (
                        <td
                          key={plan.id}
                          className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-center ${
                            plan.isPopular ? 'bg-[#3498DB]/5' : ''
                          }`}
                        >
                          {plan.id === 'vip' ? (
                            <Check className="h-4 w-4 sm:h-5 sm:w-5 text-[#3498DB] mx-auto" />
                          ) : (
                            <X className="h-4 w-4 sm:h-5 sm:w-5 text-white/30 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Boutons d'action */}
                    <tr className="bg-white/5">
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4"></td>
                      {PLANS.map((plan) => (
                        <td
                          key={plan.id}
                          className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-center ${
                            plan.isPopular ? 'bg-[#3498DB]/10' : ''
                          }`}
                        >
                          <Button
                            onClick={() => handleSubscribe(plan)}
                            disabled={processing === plan.id || (isAuthenticated === true && hasAccess)}
                            className={`w-full sm:w-auto min-w-[140px] sm:min-w-[180px] ${
                              plan.isPopular
                                ? 'bg-gradient-to-r from-[#3498DB] to-[#0F4C81] hover:from-[#3498DB]/90 hover:to-[#0F4C81]/90 text-white shadow-lg shadow-[#3498DB]/30'
                                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                            } font-label font-semibold h-10 sm:h-11 text-xs sm:text-sm`}
                          >
                            {processing === plan.id ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                                <span className="hidden sm:inline">Redirection vers Stripe...</span>
                                <span className="sm:hidden">...</span>
                              </div>
                            ) : isAuthenticated && hasAccess ? (
                              'Déjà abonné'
                            ) : (
                              <>
                                <span className="hidden sm:inline">Commencer l'essai gratuit</span>
                                <span className="sm:hidden">Essai gratuit</span>
                              </>
                            )}
                          </Button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 sm:mt-12 text-center">
          <p className="text-white/60 text-xs sm:text-sm">
            Sans engagement • Résiliez à tout moment • Paiement sécurisé par Stripe
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3498DB]"></div>
          </div>
        </div>
      </MainLayout>
    }>
      <SubscriptionPageContent />
    </Suspense>
  );
}

