'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Hook pour rafraîchir automatiquement la session Supabase
 * Évite les déconnexions intempestives dues à l'expiration de la session
 */
export function useAuthRefresh() {
  useEffect(() => {
    const supabase = createClient();

    // Fonction pour rafraîchir la session
    const refreshSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && session.expires_at) {
          const expiresAt = new Date(session.expires_at * 1000);
          const now = new Date();
          const timeUntilExpiry = expiresAt.getTime() - now.getTime();
          const tenMinutes = 10 * 60 * 1000;
          
          // Si la session expire dans moins de 10 minutes, la rafraîchir
          if (timeUntilExpiry < tenMinutes && timeUntilExpiry > 0) {
            await supabase.auth.refreshSession();
          }
        }
      } catch (error) {
        console.error('Error refreshing session:', error);
      }
    };

    // Rafraîchir immédiatement
    refreshSession();

    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(refreshSession, 5 * 60 * 1000);

    // Rafraîchir lors du focus de la fenêtre
    const handleFocus = () => {
      refreshSession();
    };
    window.addEventListener('focus', handleFocus);

    // Rafraîchir avant que la page ne soit déchargée (si possible)
    const handleBeforeUnload = () => {
      refreshSession();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
}

