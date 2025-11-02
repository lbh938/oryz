'use client';

/**
 * Système de gestion de l'historique de visionnage avec localStorage
 * Permet de tracker les chaînes récemment regardées
 */

const HISTORY_KEY = 'oryz_watch_history';
const MAX_HISTORY_ITEMS = 20; // Limite d'historique

export interface WatchHistoryItem {
  channelId: string;
  watchedAt: number; // timestamp
  duration?: number; // Durée de visionnage en secondes (optionnel)
}

/**
 * Récupère tout l'historique (trié du plus récent au plus ancien)
 */
export function getWatchHistory(): WatchHistoryItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    const history: WatchHistoryItem[] = stored ? JSON.parse(stored) : [];
    
    // Trier par date décroissante
    return history.sort((a, b) => b.watchedAt - a.watchedAt);
  } catch (error) {
    console.error('Error reading watch history:', error);
    return [];
  }
}

/**
 * Ajoute une chaîne à l'historique (ou met à jour si déjà présente)
 */
export function addToWatchHistory(channelId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    let history = getWatchHistory();
    
    // Retirer l'ancienne entrée si elle existe
    history = history.filter(item => item.channelId !== channelId);
    
    // Ajouter la nouvelle entrée au début
    const newItem: WatchHistoryItem = {
      channelId,
      watchedAt: Date.now()
    };
    
    history.unshift(newItem);
    
    // Limiter la taille de l'historique
    if (history.length > MAX_HISTORY_ITEMS) {
      history = history.slice(0, MAX_HISTORY_ITEMS);
    }
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    
    // Dispatch custom event pour mettre à jour l'UI
    window.dispatchEvent(new CustomEvent('historyChanged'));
  } catch (error) {
    console.error('Error adding to watch history:', error);
  }
}

/**
 * Retire une chaîne de l'historique
 */
export function removeFromHistory(channelId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const history = getWatchHistory();
    const filtered = history.filter(item => item.channelId !== channelId);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    
    // Dispatch custom event pour mettre à jour l'UI
    window.dispatchEvent(new CustomEvent('historyChanged'));
  } catch (error) {
    console.error('Error removing from history:', error);
  }
}

/**
 * Efface tout l'historique
 */
export function clearWatchHistory(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(HISTORY_KEY);
    window.dispatchEvent(new CustomEvent('historyChanged'));
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}

/**
 * Récupère les IDs des chaînes de l'historique
 */
export function getHistoryChannelIds(): string[] {
  return getWatchHistory().map(item => item.channelId);
}

/**
 * Récupère les N dernières chaînes regardées
 */
export function getRecentWatchHistory(limit: number = 10): WatchHistoryItem[] {
  const history = getWatchHistory();
  return history.slice(0, limit);
}

/**
 * Vérifie si une chaîne est dans l'historique
 */
export function isInHistory(channelId: string): boolean {
  const history = getWatchHistory();
  return history.some(item => item.channelId === channelId);
}

