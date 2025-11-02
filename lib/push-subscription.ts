'use client';

/**
 * Gestion des abonnements push pour Web Push Notifications
 */

/**
 * Convertir la clé VAPID publique en ArrayBuffer compatible avec PushManager.subscribe
 */
function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

/**
 * S'abonner aux notifications push
 * Enregistre l'abonnement dans Supabase
 */
export async function subscribeToPushNotifications(): Promise<{
  success: boolean;
  subscription?: PushSubscription;
  error?: string;
}> {
  try {
    // Vérifier le support
    if (!('serviceWorker' in navigator)) {
      return { success: false, error: 'Service Worker non supporté' };
    }

    if (!('PushManager' in window)) {
      return { success: false, error: 'Push Notifications non supportées' };
    }

    // Vérifier la clé VAPID publique
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error('❌ VAPID public key manquante');
      return { success: false, error: 'Configuration incomplète (VAPID key)' };
    }

    console.log('🔄 Attente du service worker...');
    
    // Attendre l'enregistrement du service worker avec timeout
    let registration;
    try {
      registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: Service Worker non prêt')), 10000)
        )
      ]) as ServiceWorkerRegistration;
      console.log('✅ Service worker prêt');
    } catch (err) {
      console.error('❌ Erreur service worker:', err);
      return { success: false, error: 'Service Worker non disponible' };
    }

    // Vérifier si déjà abonné
    let subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      console.log('ℹ️ Abonnement push existant trouvé');
      // Vérifier si l'abonnement existe déjà dans Supabase
      try {
        const response = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });

        if (response.ok) {
          console.log('✅ Abonnement existant synchronisé');
          return { success: true, subscription };
        }
      } catch (err) {
        console.warn('⚠️ Erreur lors de la synchro:', err);
      }
    }

    // Créer un nouvel abonnement
    console.log('🔄 Création d\'un nouvel abonnement push...');
    try {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToArrayBuffer(vapidPublicKey)
      });
      console.log('✅ Abonnement push créé');
    } catch (err: any) {
      console.error('❌ Erreur création abonnement:', err);
      return { 
        success: false, 
        error: 'Impossible de créer l\'abonnement push' 
      };
    }

    // Sauvegarder dans Supabase
    console.log('🔄 Sauvegarde dans Supabase...');
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erreur API:', errorData);
        return { 
          success: false, 
          error: errorData.error || 'Erreur lors de l\'enregistrement' 
        };
      }

      console.log('✅ Abonnement push enregistré dans Supabase');
      return { success: true, subscription };
    } catch (err: any) {
      console.error('❌ Erreur sauvegarde Supabase:', err);
      return { 
        success: false, 
        error: 'Erreur lors de l\'enregistrement dans la base' 
      };
    }

  } catch (error: any) {
    console.error('❌ Erreur générale:', error);
    return { 
      success: false, 
      error: error.message || 'Erreur inattendue' 
    };
  }
}

/**
 * Se désabonner des notifications push
 */
export async function unsubscribeFromPushNotifications(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      console.log('✅ Abonnement push supprimé');
      return { success: true };
    }

    return { success: true, error: 'Aucun abonnement actif' };

  } catch (error: any) {
    console.error('Erreur lors du désabonnement:', error);
    return { 
      success: false, 
      error: error.message || 'Erreur lors du désabonnement' 
    };
  }
}

/**
 * Vérifier si l'utilisateur est déjà abonné
 */
export async function isSubscribedToPush(): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    return !!subscription;
  } catch {
    return false;
  }
}

