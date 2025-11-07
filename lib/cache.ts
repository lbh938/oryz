/**
 * Système de cache en mémoire pour les données fréquemment accédées
 * Réduit les requêtes répétées à la base de données
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en ms
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();

  /**
   * Stocker une valeur dans le cache
   * @param key - Clé unique pour identifier la valeur
   * @param data - Données à mettre en cache
   * @param ttl - Durée de vie en millisecondes (défaut: 5 secondes)
   */
  set<T>(key: string, data: T, ttl: number = 5000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Récupérer une valeur du cache
   * @param key - Clé unique
   * @returns Les données mises en cache ou null si expirées/inexistantes
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      // Cache expiré, supprimer
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Vérifier si une clé existe dans le cache (sans l'expirer)
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Invalider une clé spécifique
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalider toutes les clés qui commencent par un préfixe
   * Utile pour invalider un groupe de données liées
   */
  invalidatePrefix(prefix: string): void {
    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Vider tout le cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Nettoyer les entrées expirées
   * À appeler périodiquement pour libérer la mémoire
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Instance globale du cache
export const cache = new MemoryCache();

// Nettoyer le cache toutes les minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 60000); // 1 minute
}

