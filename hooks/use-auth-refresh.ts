'use client';

import { useEffect } from 'react';

/**
 * Hook pour rafraîchir automatiquement la session Supabase
 * DÉSACTIVÉ: Ce hook causait des déconnexions intempestives
 * Supabase gère automatiquement le refresh de session via son client
 * Le middleware vérifie déjà la session sur chaque requête
 */
export function useAuthRefresh() {
  useEffect(() => {
    // HOOK COMPLÈTEMENT DÉSACTIVÉ
    // Supabase gère automatiquement le refresh de session
    // via son client interne (toutes les 60 secondes avant expiration)
    // 
    // Ce hook causait des problèmes:
    // - Déconnexions intempestives pendant la navigation
    // - Conflits avec le middleware
    // - Lenteur de connexion due aux multiples refreshs
    // - Interruptions pendant le visionnage de contenu
    //
    // Le client Supabase gère déjà:
    // - Auto-refresh 60 secondes avant expiration
    // - Persistance de session dans localStorage
    // - Récupération de session au montage
    //
    // Le middleware gère:
    // - Vérification de session sur chaque requête
    // - Refresh si nécessaire côté serveur
    
    console.log('⚠️ useAuthRefresh: Hook désactivé - Supabase gère automatiquement le refresh');
    
    // Pas de cleanup nécessaire
    return () => {};
  }, []);
}

