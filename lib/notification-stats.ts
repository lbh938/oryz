/**
 * Statistiques sur les notifications
 * Pour le panel admin
 */

import { createClient } from '@/lib/supabase/client';

export interface NotificationStats {
  usersWithNotifications: number;
  anonymousWithNotifications: number;
  usersDeclined: number;
  activeDevices: number;
  totalPreferences: number;
  totalEnabled: number;
}

/**
 * Récupérer les statistiques de notification depuis Supabase
 */
export async function getNotificationStats(): Promise<NotificationStats> {
  const supabase = createClient();

  try {
    // Récupérer depuis la vue SQL
    const { data, error } = await supabase
      .from('notification_stats')
      .select('*')
      .single();

    if (error) {
      console.error('Erreur lors de la récupération des stats:', error);
      
      // Fallback : compter depuis localStorage (client-side only)
      return getLocalNotificationStats();
    }

    return {
      usersWithNotifications: data?.users_with_notifications || 0,
      anonymousWithNotifications: data?.anonymous_with_notifications || 0,
      usersDeclined: data?.users_declined || 0,
      activeDevices: data?.active_devices || 0,
      totalPreferences: data?.total_preferences || 0,
      totalEnabled: (data?.users_with_notifications || 0) + (data?.anonymous_with_notifications || 0),
    };
  } catch (error) {
    console.error('Erreur inattendue:', error);
    return getLocalNotificationStats();
  }
}

/**
 * Fallback : récupérer les stats depuis localStorage
 * (utilisé si la base de données n'est pas encore configurée)
 */
function getLocalNotificationStats(): NotificationStats {
  if (typeof window === 'undefined') {
    return {
      usersWithNotifications: 0,
      anonymousWithNotifications: 0,
      usersDeclined: 0,
      activeDevices: 0,
      totalPreferences: 0,
      totalEnabled: 0,
    };
  }

  const status = localStorage.getItem('oryz_notification_status');
  
  return {
    usersWithNotifications: 0,
    anonymousWithNotifications: status === 'accepted' ? 1 : 0,
    usersDeclined: status === 'declined' ? 1 : 0,
    activeDevices: 0,
    totalPreferences: status ? 1 : 0,
    totalEnabled: status === 'accepted' ? 1 : 0,
  };
}

/**
 * Enregistrer une préférence de notification dans Supabase
 */
export async function saveNotificationPreference(
  status: 'accepted' | 'declined' | 'error',
  browserPermission: NotificationPermission
): Promise<void> {
  const supabase = createClient();

  try {
    // Récupérer l'utilisateur actuel (peut être null)
    const { data: { user } } = await supabase.auth.getUser();

    // Créer un fingerprint pour les utilisateurs non connectés
    const browserFingerprint = !user ? generateBrowserFingerprint() : null;

    // Vérifier si une préférence existe déjà
    let query = supabase.from('notification_preferences').select('id');
    
    if (user) {
      query = query.eq('user_id', user.id);
    } else if (browserFingerprint) {
      query = query.eq('browser_fingerprint', browserFingerprint);
    }

    const { data: existing } = await query.single();

    const preferenceData = {
      user_id: user?.id || null,
      browser_fingerprint: browserFingerprint,
      status,
      browser_permission: browserPermission,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    };

    if (existing) {
      // Mettre à jour
      await supabase
        .from('notification_preferences')
        .update(preferenceData)
        .eq('id', existing.id);
    } else {
      // Créer
      await supabase
        .from('notification_preferences')
        .insert(preferenceData);
    }

    console.log('✅ Préférence de notification sauvegardée dans Supabase');
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde de la préférence:', error);
    // Ne pas bloquer l'utilisateur si la DB n'est pas accessible
  }
}

/**
 * Générer un fingerprint unique pour le navigateur
 */
function generateBrowserFingerprint(): string {
  if (typeof window === 'undefined') return 'server';

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const txt = 'ORYZ';
  
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText(txt, 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText(txt, 4, 17);
  }

  const b64 = canvas.toDataURL().replace('data:image/png;base64,', '');
  
  // Combiner avec d'autres infos
  const fingerprint = [
    b64.slice(0, 50),
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset(),
    screen.width + 'x' + screen.height,
  ].join('|');

  // Hash simple
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return 'fp_' + Math.abs(hash).toString(36);
}

