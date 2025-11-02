/**
 * Gestionnaire de notifications ORYZ
 * Gestion persistante des préférences utilisateur
 */

export type NotificationStatus = 'accepted' | 'declined' | 'error' | null;

export interface NotificationPreferences {
  status: NotificationStatus;
  date: string | null;
  browserPermission: NotificationPermission;
}

/**
 * Récupérer le statut actuel des notifications
 */
export function getNotificationStatus(): NotificationPreferences {
  if (typeof window === 'undefined') {
    return {
      status: null,
      date: null,
      browserPermission: 'default'
    };
  }

  const status = localStorage.getItem('oryz_notification_status') as NotificationStatus;
  const date = localStorage.getItem('oryz_notification_date');
  const browserPermission = Notification.permission;

  return {
    status,
    date,
    browserPermission
  };
}

/**
 * Réinitialiser les préférences de notification
 * (permet à l'utilisateur de rechoisir)
 */
export function resetNotificationPreferences(): void {
  if (typeof window === 'undefined') return;

  console.log('🔄 Réinitialisation des préférences de notification');
  
  localStorage.removeItem('oryz_notification_status');
  localStorage.removeItem('oryz_notification_date');
  
  // Déclencher un événement pour mettre à jour l'UI
  window.dispatchEvent(new CustomEvent('oryzNotificationsReset'));
}

/**
 * Vérifier si l'utilisateur peut recevoir des notifications
 */
export function canReceiveNotifications(): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  const { status, browserPermission } = getNotificationStatus();
  
  return status === 'accepted' && browserPermission === 'granted';
}

/**
 * Vérifier si l'utilisateur a refusé les notifications
 */
export function hasDeclinedNotifications(): boolean {
  if (typeof window === 'undefined') return false;

  const { status, browserPermission } = getNotificationStatus();
  
  return status === 'declined' || browserPermission === 'denied';
}

/**
 * Enregistrer l'acceptation des notifications
 */
export function saveNotificationAcceptance(): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem('oryz_notification_status', 'accepted');
  localStorage.setItem('oryz_notification_date', new Date().toISOString());
  
  console.log('✅ Préférence de notification sauvegardée: ACCEPTÉ');
}

/**
 * Enregistrer le refus des notifications
 */
export function saveNotificationDecline(): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem('oryz_notification_status', 'declined');
  localStorage.setItem('oryz_notification_date', new Date().toISOString());
  
  console.log('❌ Préférence de notification sauvegardée: REFUSÉ');
}

/**
 * Obtenir un message lisible du statut
 */
export function getNotificationStatusMessage(): string {
  const { status, browserPermission } = getNotificationStatus();

  if (browserPermission === 'granted') {
    return '✅ Notifications activées';
  }

  if (browserPermission === 'denied') {
    return '❌ Notifications bloquées par le navigateur';
  }

  if (status === 'declined') {
    return '🔕 Notifications désactivées';
  }

  if (status === 'error') {
    return '⚠️ Erreur lors de l\'activation';
  }

  return '🔔 Notifications non configurées';
}

