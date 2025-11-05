import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getCurrentSubscription } from '@/lib/subscriptions';

export type UserStatus = 'anonymous' | 'free' | 'trial' | 'kickoff' | 'pro_league' | 'vip' | 'admin';

interface SubscriptionSyncResult {
  subscription: any;
  status: UserStatus;
  planType: string;
  synced: boolean;
}

export function useSubscriptionSync() {
  const [subscription, setSubscription] = useState<any>(null);
  const [status, setStatus] = useState<UserStatus>('anonymous');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Fonction pour déterminer le statut rapidement depuis l'abonnement
  const determineStatusFromSubscription = useCallback((sub: any): UserStatus => {
    if (!sub || sub.status === 'free') {
      return 'free';
    }

    if (sub.status === 'trial' || sub.status === 'active') {
      if (sub.plan_type === 'kickoff') return 'kickoff';
      if (sub.plan_type === 'pro_league') return 'pro_league';
      if (sub.plan_type === 'vip') return 'vip';
      return 'trial';
    }

    if (sub.status === 'incomplete' && sub.stripe_subscription_id) {
      // Si incomplete mais avec stripe_subscription_id, considérer comme actif
      if (sub.plan_type === 'kickoff') return 'kickoff';
      if (sub.plan_type === 'pro_league') return 'pro_league';
      if (sub.plan_type === 'vip') return 'vip';
      return 'trial';
    }

    return 'free';
  }, []);

  const syncSubscription = useCallback(async (force = false) => {
    const supabase = createClient();
    
    // Utiliser getSession() au lieu de getUser() pour éviter les déconnexions
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      setStatus('anonymous');
      setIsAdmin(false);
      setSubscription(null);
      setIsSyncing(false);
      return;
    }

    const user = session.user;

    // Vérifier si l'utilisateur est admin EN PARALLÈLE avec le chargement de l'abonnement
    const [adminData, sub] = await Promise.all([
      supabase
        .from('admin_users')
        .select('is_super_admin')
        .eq('id', user.id)
        .maybeSingle(),
      getCurrentSubscription()
    ]);

    const isUserAdmin = adminData.data?.is_super_admin === true;
    setIsAdmin(isUserAdmin);

    // Si admin, donner accès complet IMMÉDIATEMENT
    if (isUserAdmin) {
      setStatus('admin');
      setSubscription(null);
      setIsSyncing(false);
      return;
    }

    // Déterminer et définir le statut IMMÉDIATEMENT depuis la DB (sans attendre Stripe)
    if (!sub || sub.status === 'free') {
      setStatus('free');
      setSubscription(sub || null);
      setIsSyncing(false);
      return;
    }

    // Définir le statut IMMÉDIATEMENT depuis l'abonnement
    const userStatus = determineStatusFromSubscription(sub);
    setSubscription(sub);
    setStatus(userStatus);
    setIsSyncing(false); // Ne pas bloquer l'affichage

    // Synchroniser avec Stripe EN ARRIÈRE-PLAN seulement si nécessaire
    const needsSync = force || (sub.status === 'incomplete' && sub.stripe_customer_id && !sub.stripe_subscription_id);
    
    if (needsSync) {
      // Ne pas mettre isSyncing à true pour éviter de bloquer l'UI
      // Synchroniser en arrière-plan sans bloquer
      fetch('/api/subscription/sync-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then((data: SubscriptionSyncResult) => {
          if (data.subscription && data.status) {
            // Mettre à jour seulement si la synchronisation a réussi
            setSubscription(data.subscription);
            setStatus(data.status as UserStatus);
            setLastSync(new Date());
          }
        })
        .catch(error => {
          console.error('Error syncing subscription in background:', error);
          // Ne pas changer le statut en cas d'erreur, garder celui de la DB
        });
    }
  }, [determineStatusFromSubscription]);

  // Charger l'abonnement au montage - IMMÉDIATEMENT et de manière optimisée
  useEffect(() => {
    syncSubscription(false); // false = ne pas forcer la synchronisation Stripe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // [] = seulement au montage, syncSubscription est stable grâce à useCallback

  // Rafraîchir automatiquement lors du focus de la fenêtre (sans bloquer)
  useEffect(() => {
    const handleFocus = () => {
      // Rafraîchir en arrière-plan sans bloquer l'UI
      syncSubscription(false);
    };
    window.addEventListener('focus', handleFocus);

    // Rafraîchir toutes les 60 secondes si l'abonnement est incomplete (moins agressif)
    let interval: NodeJS.Timeout | null = null;
    if (subscription?.status === 'incomplete' && subscription.stripe_customer_id && !subscription.stripe_subscription_id) {
      interval = setInterval(() => {
        syncSubscription(true); // Forcer la synchronisation seulement pour incomplete
      }, 60000); // 60 secondes (moins agressif)
      
      // Arrêter après 10 minutes
      setTimeout(() => {
        if (interval) {
          clearInterval(interval);
        }
      }, 600000); // 10 minutes
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [subscription?.status, subscription?.stripe_customer_id, subscription?.stripe_subscription_id, syncSubscription]);

  return {
    subscription,
    status,
    isAdmin,
    isSyncing,
    lastSync,
    syncSubscription: () => syncSubscription(true),
  };
}

