'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Hook pour rafraîchir automatiquement la session Supabase
 * Évite les déconnexions intempestives dues à l'expiration de la session
 */
export function useAuthRefresh() {
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();

    // Fonction pour rafraîchir la session de manière agressive
    const refreshSession = async (force = false) => {
      // Éviter les refreshs simultanés
      if (isRefreshingRef.current && !force) return;
      
      try {
        isRefreshingRef.current = true;
        
        // SÉCURITÉ: Utiliser getUser() pour vérifier l'authentification avant de rafraîchir
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          isRefreshingRef.current = false;
          return;
        }
        
        // Récupérer la session pour vérifier l'expiration (mais ne pas utiliser user de session)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          isRefreshingRef.current = false;
          return;
        }
        
        // Si la session expire dans moins de 15 minutes, la rafraîchir
        if (session.expires_at) {
          const expiresAt = new Date(session.expires_at * 1000);
          const now = new Date();
          const timeUntilExpiry = expiresAt.getTime() - now.getTime();
          const fifteenMinutes = 15 * 60 * 1000;
          
          if (force || timeUntilExpiry < fifteenMinutes) {
            // Rafraîchir la session
            const { error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError) {
              console.error('Error refreshing session:', refreshError);
            }
          }
        } else {
          // Si pas de expires_at, rafraîchir quand même pour être sûr
          await supabase.auth.refreshSession();
        }
      } catch (error) {
        console.error('Error in refreshSession:', error);
      } finally {
        isRefreshingRef.current = false;
      }
    };

    // Rafraîchir immédiatement au montage
    refreshSession(true);

    // Rafraîchir toutes les 3 minutes (plus agressif)
    const interval = setInterval(() => {
      refreshSession(false);
    }, 3 * 60 * 1000);

    // Rafraîchir lors du focus de la fenêtre (mais pas de manière agressive)
    const handleFocus = () => {
      // Ne rafraîchir que si la session expire bientôt (éviter les rafraîchissements inutiles)
      refreshSession(false);
    };
    window.addEventListener('focus', handleFocus);

    // NE PAS rafraîchir lors de visibilitychange - cela peut causer des déconnexions lors de la navigation
    // Le changement de visibilité se produit souvent lors de la navigation vers une nouvelle page
    // et rafraîchir la session à ce moment peut causer des conflits avec le middleware

    // NE PAS rafraîchir lors de beforeunload - cela peut causer des déconnexions
    // Le beforeunload se produit lors de la navigation et un refresh async peut être interrompu
    // causant une session invalide

    // NE PAS rafraîchir sur tous les clics de liens - cela peut causer des déconnexions
    // Le refresh se fait déjà automatiquement toutes les 3 minutes et sur focus
    // Retirer ces rafraîchissements pour éviter les déconnexions lors de la navigation

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      // Ne plus écouter visibilitychange et beforeunload pour éviter les déconnexions
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);
}

