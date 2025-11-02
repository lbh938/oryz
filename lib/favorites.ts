'use client';

/**
 * Système de gestion des favoris avec localStorage
 * Permet aux utilisateurs de sauvegarder leurs chaînes préférées
 */

const FAVORITES_KEY = 'oryz_favorites';

export interface FavoriteChannel {
  id: string;
  addedAt: number; // timestamp
}

/**
 * Récupère tous les favoris
 */
export function getFavorites(): FavoriteChannel[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading favorites:', error);
    return [];
  }
}

/**
 * Vérifie si une chaîne est dans les favoris
 */
export function isFavorite(channelId: string): boolean {
  const favorites = getFavorites();
  return favorites.some(fav => fav.id === channelId);
}

/**
 * Ajoute une chaîne aux favoris
 */
export function addFavorite(channelId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const favorites = getFavorites();
    
    // Éviter les doublons
    if (favorites.some(fav => fav.id === channelId)) {
      return;
    }
    
    const newFavorite: FavoriteChannel = {
      id: channelId,
      addedAt: Date.now()
    };
    
    favorites.push(newFavorite);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    
    // Dispatch custom event pour mettre à jour l'UI
    window.dispatchEvent(new CustomEvent('favoritesChanged'));
  } catch (error) {
    console.error('Error adding favorite:', error);
  }
}

/**
 * Retire une chaîne des favoris
 */
export function removeFavorite(channelId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const favorites = getFavorites();
    const filtered = favorites.filter(fav => fav.id !== channelId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    
    // Dispatch custom event pour mettre à jour l'UI
    window.dispatchEvent(new CustomEvent('favoritesChanged'));
  } catch (error) {
    console.error('Error removing favorite:', error);
  }
}

/**
 * Toggle favori (ajoute si pas présent, retire si présent)
 */
export function toggleFavorite(channelId: string): boolean {
  if (isFavorite(channelId)) {
    removeFavorite(channelId);
    return false;
  } else {
    addFavorite(channelId);
    return true;
  }
}

/**
 * Récupère le nombre de favoris
 */
export function getFavoritesCount(): number {
  return getFavorites().length;
}

/**
 * Récupère les IDs des favoris seulement
 */
export function getFavoriteIds(): string[] {
  return getFavorites().map(fav => fav.id);
}

