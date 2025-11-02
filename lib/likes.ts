'use client';

/**
 * Système de "J'aime" (Like System) pour ORYZ
 * Permet aux utilisateurs d'exprimer leur appréciation pour un contenu
 */

const LIKES_KEY = 'oryz_likes';
const LIKE_COUNTS_KEY = 'oryz_like_counts';

export interface LikeData {
  contentId: string;
  contentType: 'channel' | 'movie' | 'series';
  likedAt: number; // timestamp
}

export interface LikeCount {
  contentId: string;
  count: number;
  lastUpdated: number;
}

/**
 * Récupère tous les likes de l'utilisateur
 */
export function getUserLikes(): LikeData[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(LIKES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading likes:', error);
    return [];
  }
}

/**
 * Récupère le compteur de likes pour un contenu
 */
export function getLikeCount(contentId: string): number {
  if (typeof window === 'undefined') return 0;
  
  try {
    const stored = localStorage.getItem(LIKE_COUNTS_KEY);
    const counts: LikeCount[] = stored ? JSON.parse(stored) : [];
    const count = counts.find(c => c.contentId === contentId);
    return count ? count.count : 0;
  } catch (error) {
    console.error('Error reading like count:', error);
    return 0;
  }
}

/**
 * Met à jour le compteur de likes
 */
function updateLikeCount(contentId: string, increment: boolean): number {
  if (typeof window === 'undefined') return 0;
  
  try {
    const stored = localStorage.getItem(LIKE_COUNTS_KEY);
    let counts: LikeCount[] = stored ? JSON.parse(stored) : [];
    
    const existingIndex = counts.findIndex(c => c.contentId === contentId);
    
    if (existingIndex >= 0) {
      counts[existingIndex].count += increment ? 1 : -1;
      counts[existingIndex].count = Math.max(0, counts[existingIndex].count);
      counts[existingIndex].lastUpdated = Date.now();
    } else if (increment) {
      counts.push({
        contentId,
        count: 1,
        lastUpdated: Date.now()
      });
    }
    
    localStorage.setItem(LIKE_COUNTS_KEY, JSON.stringify(counts));
    
    // Dispatch event pour mettre à jour l'UI
    window.dispatchEvent(new CustomEvent('likeCountChanged', { 
      detail: { contentId, count: counts[existingIndex]?.count || 1 }
    }));
    
    return counts[existingIndex]?.count || 1;
  } catch (error) {
    console.error('Error updating like count:', error);
    return 0;
  }
}

/**
 * Vérifie si l'utilisateur a liké un contenu
 */
export function hasLiked(contentId: string): boolean {
  const likes = getUserLikes();
  return likes.some(like => like.contentId === contentId);
}

/**
 * Ajoute un like
 */
export function addLike(
  contentId: string, 
  contentType: 'channel' | 'movie' | 'series'
): void {
  if (typeof window === 'undefined') return;
  
  try {
    const likes = getUserLikes();
    
    // Vérifier si déjà liké
    if (likes.some(like => like.contentId === contentId)) {
      return;
    }
    
    const newLike: LikeData = {
      contentId,
      contentType,
      likedAt: Date.now()
    };
    
    likes.push(newLike);
    localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
    
    // Incrémenter le compteur
    updateLikeCount(contentId, true);
    
    // Dispatch event pour mettre à jour l'UI
    window.dispatchEvent(new CustomEvent('likeChanged', { 
      detail: { contentId, liked: true }
    }));
  } catch (error) {
    console.error('Error adding like:', error);
  }
}

/**
 * Retire un like
 */
export function removeLike(contentId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const likes = getUserLikes();
    const filtered = likes.filter(like => like.contentId !== contentId);
    localStorage.setItem(LIKES_KEY, JSON.stringify(filtered));
    
    // Décrémenter le compteur
    updateLikeCount(contentId, false);
    
    // Dispatch event pour mettre à jour l'UI
    window.dispatchEvent(new CustomEvent('likeChanged', { 
      detail: { contentId, liked: false }
    }));
  } catch (error) {
    console.error('Error removing like:', error);
  }
}

/**
 * Toggle like (ajoute si pas présent, retire si présent)
 */
export function toggleLike(
  contentId: string,
  contentType: 'channel' | 'movie' | 'series'
): boolean {
  if (hasLiked(contentId)) {
    removeLike(contentId);
    return false;
  } else {
    addLike(contentId, contentType);
    return true;
  }
}

/**
 * Récupère tous les contenus likés par type
 */
export function getLikesByType(type: 'channel' | 'movie' | 'series'): LikeData[] {
  return getUserLikes().filter(like => like.contentType === type);
}

/**
 * Récupère le nombre total de likes de l'utilisateur
 */
export function getTotalLikesCount(): number {
  return getUserLikes().length;
}

/**
 * Récupère les IDs des contenus likés
 */
export function getLikedContentIds(): string[] {
  return getUserLikes().map(like => like.contentId);
}

/**
 * API Backend (À implémenter avec votre serveur)
 * Ces fonctions enverront les données à votre API
 */

/**
 * Synchroniser les likes avec le backend
 */
export async function syncLikesWithBackend(): Promise<void> {
  // TODO: Implémenter l'appel API
  // const likes = getUserLikes();
  // await fetch('/api/likes/sync', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ likes })
  // });
}

/**
 * Récupérer les likes depuis le backend
 */
export async function fetchLikesFromBackend(userId: string): Promise<LikeData[]> {
  // TODO: Implémenter l'appel API
  // const response = await fetch(`/api/likes/user/${userId}`);
  // return await response.json();
  return [];
}

/**
 * Envoyer un like au backend
 */
export async function sendLikeToBackend(
  contentId: string,
  contentType: 'channel' | 'movie' | 'series',
  userId: string
): Promise<void> {
  // TODO: Implémenter l'appel API
  // await fetch('/api/likes', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ userId, contentId, contentType })
  // });
}

/**
 * Supprimer un like du backend
 */
export async function removeLikeFromBackend(
  contentId: string,
  userId: string
): Promise<void> {
  // TODO: Implémenter l'appel API
  // await fetch(`/api/likes/${contentId}`, {
  //   method: 'DELETE',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ userId })
  // });
}

