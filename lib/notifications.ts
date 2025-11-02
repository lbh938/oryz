'use client';

/**
 * Système de notifications push pour PWA ORYZ
 * Permet d'envoyer des notifications aux utilisateurs
 */

const NOTIFICATION_PERMISSION_KEY = 'oryz_notification_permission';

/**
 * Demande la permission pour les notifications
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Ce navigateur ne supporte pas les notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('L\'utilisateur a refusé les notifications');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    localStorage.setItem(NOTIFICATION_PERMISSION_KEY, permission);
    return permission === 'granted';
  } catch (error) {
    console.error('Erreur lors de la demande de permission:', error);
    return false;
  }
}

/**
 * Vérifie si les notifications sont autorisées
 */
export function isNotificationPermissionGranted(): boolean {
  if (!('Notification' in window)) return false;
  return Notification.permission === 'granted';
}

/**
 * Envoie une notification locale
 */
export async function sendNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if (!isNotificationPermissionGranted()) {
    console.warn('Permission de notification non accordée');
    return;
  }

  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Utiliser le Service Worker pour les notifications (meilleur pour PWA)
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        ...options
      } as NotificationOptions);
    } else {
      // Fallback : notification normale
      new Notification(title, {
        icon: '/icon-192x192.png',
        ...options
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
  }
}

/**
 * Notifications prédéfinies pour ORYZ
 */
export const NotificationTemplates = {
  /**
   * Notification pour une nouvelle chaîne
   */
  newChannel: (channelName: string) => ({
    title: 'Nouvelle chaîne disponible',
    body: `${channelName} est maintenant disponible sur ORYZ`,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'new-channel',
    requireInteraction: false,
    actions: [
      { action: 'view', title: 'Regarder' },
      { action: 'close', title: 'Plus tard' }
    ]
  }),

  /**
   * Notification pour un match en direct
   */
  liveMatch: (matchName: string) => ({
    title: 'Match en direct',
    body: `${matchName} vient de commencer`,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'live-match',
    requireInteraction: true,
    actions: [
      { action: 'watch', title: 'Regarder maintenant' },
      { action: 'remind', title: 'Me rappeler' }
    ]
  }),

  /**
   * Notification pour un nouveau film/série
   */
  newContent: (contentTitle: string, contentType: 'film' | 'série') => ({
    title: `Nouveau ${contentType} disponible`,
    body: `${contentTitle} est maintenant disponible sur ORYZ`,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'new-content',
    actions: [
      { action: 'view', title: 'Voir' },
      { action: 'later', title: 'Ajouter à ma liste' }
    ]
  }),

  /**
   * Notification de rappel
   */
  reminder: (message: string) => ({
    title: 'Rappel ORYZ',
    body: message,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'reminder',
    requireInteraction: false
  }),

  /**
   * Notification générale
   */
  general: (title: string, message: string) => ({
    title: title,
    body: message,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'general'
  })
};

/**
 * Envoie une notification avec un template
 */
export async function sendTemplateNotification(
  template: ReturnType<typeof NotificationTemplates[keyof typeof NotificationTemplates]>
): Promise<void> {
  const { title, ...options } = template;
  await sendNotification(title, options);
}

/**
 * Planifier une notification (pour les rappels)
 */
export function scheduleNotification(
  delay: number,
  title: string,
  options?: NotificationOptions
): number {
  return window.setTimeout(() => {
    sendNotification(title, options);
  }, delay);
}

/**
 * Annuler une notification planifiée
 */
export function cancelScheduledNotification(timerId: number): void {
  clearTimeout(timerId);
}

