/**
 * Cache intelligent pour l'authentification utilisateur
 * Évite les appels multiples à getUser() en mettant en cache le résultat
 */

import { createClient } from '@/lib/supabase/client';

interface CachedUser {
  user: any;
  timestamp: number;
}

let cachedUser: CachedUser | null = null;
const CACHE_DURATION = 5000; // 5 secondes de cache

/**
 * Récupérer l'utilisateur avec cache intelligent
 * Utilise getUser() (sécurisé) mais met en cache le résultat pour éviter les appels multiples
 */
export async function getCachedUser(): Promise<any | null> {
  const now = Date.now();
  
  // Si cache valide, retourner immédiatement
  if (cachedUser && (now - cachedUser.timestamp) < CACHE_DURATION) {
    return cachedUser.user;
  }
  
  // Sinon, faire un seul appel getUser() (sécurisé)
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (user && !error) {
    cachedUser = { user, timestamp: now };
    return user;
  }
  
  // Si erreur, invalider le cache
  cachedUser = null;
  return null;
}

/**
 * Invalider le cache utilisateur
 * À appeler après déconnexion ou mise à jour du profil
 */
export function invalidateUserCache() {
  cachedUser = null;
}

/**
 * Mettre à jour le cache utilisateur manuellement
 * Utile après mise à jour du profil
 */
export function updateUserCache(user: any) {
  cachedUser = { user, timestamp: Date.now() };
}

