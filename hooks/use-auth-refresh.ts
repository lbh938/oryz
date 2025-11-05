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
        
        // Toujours récupérer la session actuelle
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          isRefreshingRef.current = false;
          return;
        }
        
        if (!session) {
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

    // Rafraîchir lors du focus de la fenêtre
    const handleFocus = () => {
      refreshSession(true);
    };
    window.addEventListener('focus', handleFocus);

    // Rafraîchir lors de la visibilité de la page
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshSession(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Rafraîchir avant les navigations importantes
    const handleBeforeUnload = () => {
      // Ne pas faire de refresh async ici car beforeunload peut être interrompu
      // Mais on peut essayer
      refreshSession(true);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Rafraîchir avant les clics sur les liens (interception)
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && link.href) {
        // Rafraîchir avant la navigation
        refreshSession(true);
      }
    };
    document.addEventListener('click', handleClick, true);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClick, true);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);
}

