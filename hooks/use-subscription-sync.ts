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

  const syncSubscription = useCallback(async (force = false) => {
    const supabase = createClient();
    
    // Utiliser getSession() au lieu de getUser() pour éviter les déconnexions
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      setStatus('anonymous');
      setIsAdmin(false);
      setSubscription(null);
      return;
    }

    const user = session.user;

    // Vérifier si l'utilisateur est admin
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('is_super_admin')
      .eq('id', user.id)
      .maybeSingle();

    const isUserAdmin = adminData?.is_super_admin === true;
    setIsAdmin(isUserAdmin);

    // Si admin, donner accès complet
    if (isUserAdmin) {
      setStatus('admin');
      setSubscription(null); // Pas besoin d'abonnement pour les admins
      return;
    }

    // Charger l'abonnement depuis la base de données
    const sub = await getCurrentSubscription();
    
    if (!sub || sub.status === 'free') {
      setStatus('free');
      setSubscription(sub);
      return;
    }

    // Si l'abonnement est "incomplete" avec stripe_customer_id mais sans stripe_subscription_id,
    // ou si force = true, synchroniser avec Stripe
    if (force || (sub.status === 'incomplete' && sub.stripe_customer_id && !sub.stripe_subscription_id)) {
      setIsSyncing(true);
      try {
        const response = await fetch('/api/subscription/sync-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data: SubscriptionSyncResult = await response.json();
        
        if (data.subscription) {
          setSubscription(data.subscription);
          setStatus(data.status as UserStatus);
          setLastSync(new Date());
        } else {
          // Déterminer le statut utilisateur basé sur l'abonnement
          let userStatus: UserStatus = 'free';
          
          if (sub.status === 'trial' || sub.status === 'active') {
            if (sub.plan_type === 'kickoff') {
              userStatus = 'kickoff';
            } else if (sub.plan_type === 'pro_league') {
              userStatus = 'pro_league';
            } else if (sub.plan_type === 'vip') {
              userStatus = 'vip';
            } else {
              userStatus = 'trial';
            }
          } else if (sub.status === 'incomplete' && sub.stripe_subscription_id) {
            if (sub.plan_type === 'kickoff') {
              userStatus = 'kickoff';
            } else if (sub.plan_type === 'pro_league') {
              userStatus = 'pro_league';
            } else if (sub.plan_type === 'vip') {
              userStatus = 'vip';
            } else {
              userStatus = 'trial';
            }
          }
          
          setSubscription(sub);
          setStatus(userStatus);
        }
      } catch (error) {
        console.error('Error syncing subscription:', error);
        setSubscription(sub);
        setStatus(sub.status as UserStatus);
      } finally {
        setIsSyncing(false);
      }
    } else {
      // Déterminer le statut utilisateur immédiatement
      let userStatus: UserStatus = 'free';
      
      if (sub.status === 'trial' || sub.status === 'active') {
        if (sub.plan_type === 'kickoff') {
          userStatus = 'kickoff';
        } else if (sub.plan_type === 'pro_league') {
          userStatus = 'pro_league';
        } else if (sub.plan_type === 'vip') {
          userStatus = 'vip';
        } else {
          userStatus = 'trial';
        }
      } else if (sub.status === 'incomplete' && sub.stripe_subscription_id) {
        // Si incomplete mais avec stripe_subscription_id, considérer comme actif
        if (sub.plan_type === 'kickoff') {
          userStatus = 'kickoff';
        } else if (sub.plan_type === 'pro_league') {
          userStatus = 'pro_league';
        } else if (sub.plan_type === 'vip') {
          userStatus = 'vip';
        } else {
          userStatus = 'trial';
        }
      }
      
      setSubscription(sub);
      setStatus(userStatus);
      setIsSyncing(false); // S'assurer que isSyncing est false après avoir défini le statut
    }
  }, []);

  // Charger l'abonnement au montage - S'assurer que c'est appelé immédiatement
  useEffect(() => {
    syncSubscription(false); // false = ne pas forcer la synchronisation
  }, []); // [] = seulement au montage, pas de dépendances pour éviter les re-renders

  // Rafraîchir automatiquement lors du focus de la fenêtre
  useEffect(() => {
    const handleFocus = () => {
      syncSubscription();
    };
    window.addEventListener('focus', handleFocus);

    // Rafraîchir toutes les 30 secondes si l'abonnement est incomplete
    let interval: NodeJS.Timeout | null = null;
    if (subscription?.status === 'incomplete' && subscription.stripe_customer_id) {
      interval = setInterval(() => {
        syncSubscription(true);
      }, 30000); // 30 secondes
      
      // Arrêter après 5 minutes
      setTimeout(() => {
        if (interval) {
          clearInterval(interval);
        }
      }, 300000); // 5 minutes
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [subscription?.status, subscription?.stripe_customer_id, syncSubscription]);

  return {
    subscription,
    status,
    isAdmin,
    isSyncing,
    lastSync,
    syncSubscription: () => syncSubscription(true),
  };
}

