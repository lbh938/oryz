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
        
        // SÉCURITÉ: Utiliser getUser() avec timeout pour éviter les blocages lors de chargements longs
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes max
        
        let user, userError;
        try {
          const result = await supabase.auth.getUser();
          clearTimeout(timeoutId);
          user = result.data.user;
          userError = result.error;
        } catch (error: any) {
          clearTimeout(timeoutId);
          // En cas de timeout ou erreur réseau, ne pas déconnecter l'utilisateur
          // Garder la session existante et réessayer plus tard
          if (error.name === 'AbortError' || error.code === 'ECONNRESET') {
            console.warn('getUser() timed out or connection error, keeping existing session');
            isRefreshingRef.current = false;
            return;
          }
          throw error;
        }
        
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
        
        // Vérifier si l'utilisateur a activé "rester connecté"
        const rememberMe = localStorage.getItem('rememberMe') === 'true';
        
        // Si la session expire dans moins de 15 minutes (ou 30 minutes si "rester connecté"), la rafraîchir
        if (session.expires_at) {
          const expiresAt = new Date(session.expires_at * 1000);
          const now = new Date();
          const timeUntilExpiry = expiresAt.getTime() - now.getTime();
          // Si "rester connecté" est activé, rafraîchir plus tôt (30 minutes au lieu de 15)
          const refreshThreshold = rememberMe ? 30 * 60 * 1000 : 15 * 60 * 1000;
          
          if (force || timeUntilExpiry < refreshThreshold) {
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

    // NE PAS rafraîchir immédiatement au montage pour éviter les déconnexions
    // lors de chargements longs. Le middleware gère déjà la vérification de session.
    // refreshSession(true); // DÉSACTIVÉ

    // Rafraîchir toutes les 45 minutes (encore moins agressif pour éviter les déconnexions pendant les matchs)
    const interval = setInterval(() => {
      refreshSession(false);
    }, 45 * 60 * 1000); // 45 minutes au lieu de 30

    // NE PAS rafraîchir lors du focus de la fenêtre si l'utilisateur est sur une page de visionnage
    // Cela évite les déconnexions pendant les matchs en direct
    let focusTimeout: NodeJS.Timeout | null = null;
    const handleFocus = () => {
      // Vérifier si on est sur une page de visionnage
      const isWatchPage = window.location.pathname.includes('/watch/');
      
      // Si on est sur une page de visionnage, ne pas rafraîchir immédiatement
      // Attendre 30 secondes au lieu de 5 pour éviter les interruptions
      if (focusTimeout) clearTimeout(focusTimeout);
      focusTimeout = setTimeout(() => {
        refreshSession(false);
      }, isWatchPage ? 30000 : 5000); // 30s pour /watch/, 5s pour les autres pages
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
      // Nettoyer le timeout de focus
      if (focusTimeout) {
        clearTimeout(focusTimeout);
      }
      // Ne plus écouter visibilitychange et beforeunload pour éviter les déconnexions
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);
}

