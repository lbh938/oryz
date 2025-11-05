'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Crown, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getCurrentSubscription, hasPremiumAccess, Subscription, PLANS } from '@/lib/subscriptions';

export function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const loadSubscription = async () => {
      const sub = await getCurrentSubscription();
      const access = await hasPremiumAccess();
      setSubscription(sub);
      setHasAccess(access);
      setLoading(false);
    };

    loadSubscription();
  }, []);

  if (loading) {
    return (
      <Card className="bg-[#1a1a1a] border border-[#333333] rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3498DB]"></div>
        </div>
      </Card>
    );
  }

  // Si pas d'abonnement ou abonnement gratuit
  if (!subscription || subscription.status === 'free') {
    return (
      <Card className="bg-[#1a1a1a] border border-[#333333] rounded-2xl p-6 sm:p-8 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10">
            <Crown className="h-6 w-6 text-white/60" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-display font-bold text-white mb-2 uppercase">
              Abonnement
            </h3>
            <p className="text-white/70 text-sm mb-4 font-sans">
              Vous n'avez pas d'abonnement actif
            </p>
            <Link href="/subscription">
              <Button className="bg-gradient-to-r from-[#3498DB] to-[#0F4C81] hover:from-[#3498DB]/90 hover:to-[#0F4C81]/90 text-white font-label font-semibold">
                <Crown className="h-4 w-4 mr-2" />
                S'abonner maintenant
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  // Afficher le statut de l'abonnement
  const getStatusInfo = () => {
    // Si le statut est 'incomplete', c'est que le checkout n'a pas été complété
    if (subscription.status === 'incomplete') {
      return {
        icon: AlertCircle,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        label: 'En attente',
        description: 'Veuillez compléter le processus de paiement pour activer votre essai gratuit'
      };
    }
    
    switch (subscription.status) {
      case 'trial':
        return {
          icon: Clock,
          color: 'text-[#3498DB]',
          bgColor: 'bg-[#3498DB]/10',
          borderColor: 'border-[#3498DB]/30',
          label: 'Essai gratuit',
          description: subscription.trial_end
            ? `Jusqu'au ${new Date(subscription.trial_end).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}`
            : 'Actif'
        };
      case 'active':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          label: 'Actif',
          description: subscription.current_period_end
            ? `Renouvellement le ${new Date(subscription.current_period_end).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}`
            : 'Actif'
        };
      case 'canceled':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          label: 'Annulé',
          description: subscription.current_period_end
            ? `Accès jusqu'au ${new Date(subscription.current_period_end).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}`
            : 'Annulé'
        };
      case 'past_due':
        return {
          icon: AlertCircle,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
          label: 'Paiement en retard',
          description: 'Veuillez mettre à jour votre moyen de paiement'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-white/60',
          bgColor: 'bg-white/5',
          borderColor: 'border-white/10',
          label: subscription.status,
          description: 'Statut inconnu'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const Icon = statusInfo.icon;

  return (
    <Card className="bg-[#1a1a1a] border border-[#333333] rounded-2xl p-6 sm:p-8 mb-6">
      <div className="flex items-start gap-4">
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${statusInfo.bgColor} border ${statusInfo.borderColor}`}>
          <Icon className={`h-6 w-6 ${statusInfo.color}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-display font-bold text-white uppercase">
              Abonnement Premium
            </h3>
            <span className={`px-3 py-1 rounded-full ${statusInfo.bgColor} border ${statusInfo.borderColor} ${statusInfo.color} text-xs font-label font-bold`}>
              {statusInfo.label}
            </span>
          </div>
          
          <div className="space-y-2 mb-4">
              <p className="text-white/80 text-sm font-sans">
                <span className="font-semibold">Plan:</span>{' '}
                {subscription.plan_type === 'kickoff' ? 'Kick-Off' :
                 subscription.plan_type === 'pro_league' ? 'Pro League' :
                 subscription.plan_type === 'vip' ? 'VIP' :
                 'Premium'}
              </p>
            <p className="text-white/70 text-sm font-sans">
              {statusInfo.description}
            </p>
            {subscription.price_monthly && (
              <p className="text-white/70 text-sm font-sans">
                <span className="font-semibold">Prix:</span>{' '}
                {subscription.price_monthly.toFixed(2)}€/mois
              </p>
            )}
            {subscription.cancel_at_period_end && (
              <p className="text-yellow-400 text-sm font-sans font-semibold">
                ⚠️ Votre abonnement sera annulé à la fin de la période actuelle
              </p>
            )}
          </div>

          {hasAccess && (
            <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-green-400 text-sm font-sans font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Accès premium actif
              </p>
            </div>
          )}

          {subscription.status === 'incomplete' && (
            <div className="mt-4">
              <p className="text-yellow-400 text-sm font-sans font-semibold mb-3">
                ⚠️ Votre abonnement n'est pas encore activé. Complétez le processus de paiement pour commencer votre essai gratuit.
              </p>
              <Button
                onClick={async () => {
                  setCompleting(true);
                  try {
                    // Trouver le plan correspondant au plan_type de l'abonnement
                    const plan = PLANS.find(p => 
                      (p.id === 'kickoff' && subscription.plan_type === 'kickoff') ||
                      (p.id === 'pro_league' && subscription.plan_type === 'pro_league') ||
                      (p.id === 'vip' && subscription.plan_type === 'vip')
                    );

                    if (!plan || !plan.priceId) {
                      alert('Erreur : Plan non trouvé. Veuillez contacter le support.');
                      setCompleting(false);
                      return;
                    }

                    // Créer une session checkout Stripe
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
                      setCompleting(false);
                      return;
                    }

                    // Rediriger directement vers l'URL de checkout Stripe
                    if (data.url) {
                      window.location.href = data.url;
                    } else {
                      alert('Erreur : URL de checkout non disponible');
                      setCompleting(false);
                    }
                  } catch (error: any) {
                    console.error('Error completing subscription:', error);
                    alert('Erreur lors de la finalisation de l\'abonnement. Veuillez réessayer.');
                    setCompleting(false);
                  }
                }}
                disabled={completing}
                className="bg-gradient-to-r from-[#3498DB] to-[#0F4C81] hover:from-[#3498DB]/90 hover:to-[#0F4C81]/90 text-white font-label font-semibold"
              >
                <Crown className="h-4 w-4 mr-2" />
                {completing ? 'Redirection vers le paiement...' : 'Compléter l\'abonnement'}
              </Button>
            </div>
          )}

          {!hasAccess && subscription.status !== 'canceled' && subscription.status !== 'incomplete' && (
            <Link href="/subscription" className="inline-block mt-4">
              <Button variant="outline" className="border-[#3498DB] text-[#3498DB] hover:bg-[#3498DB] hover:text-white font-label font-semibold">
                Gérer l'abonnement
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}

