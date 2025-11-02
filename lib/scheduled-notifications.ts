import { createClient } from '@/lib/supabase/client';

export interface ScheduledNotification {
  id?: string;
  title: string;
  body: string;
  icon?: string;
  scheduled_for: string; // ISO datetime
  repeat_type: 'once' | 'daily' | 'weekly' | 'monthly';
  timezone?: string;
  is_sent?: boolean;
  is_active?: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  sent_at?: string;
}

/**
 * Créer une notification programmée
 */
export async function createScheduledNotification(
  notification: Omit<ScheduledNotification, 'id' | 'is_sent' | 'is_active' | 'created_by' | 'created_at' | 'updated_at' | 'sent_at'>
): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = createClient();

  console.log('🔄 Insertion dans Supabase:', {
    title: notification.title,
    body: notification.body,
    scheduled_for: notification.scheduled_for,
    repeat_type: notification.repeat_type,
    timezone: notification.timezone || 'Europe/Paris',
  });

  const { data, error } = await supabase
    .from('scheduled_notifications')
    .insert({
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/icon-192x192.png',
      scheduled_for: notification.scheduled_for,
      repeat_type: notification.repeat_type,
      timezone: notification.timezone || 'Europe/Paris',
      is_active: true,
      is_sent: false,
    })
    .select('id')
    .single();

  if (error) {
    console.error('❌ Erreur Supabase:', error);
    return { 
      success: false, 
      error: `${error.message} | Code: ${error.code} | Details: ${error.details || 'N/A'}` 
    };
  }

  if (!data || !data.id) {
    console.error('❌ Pas de données retournées (RLS bloque probablement)');
    return { 
      success: false, 
      error: 'INSERT bloqué - Vérifiez que vous êtes bien super_admin dans la table admin_users' 
    };
  }

  console.log('✅ Notification créée avec ID:', data.id);
  return { success: true, id: data.id };
}

/**
 * Récupérer toutes les notifications programmées
 */
export async function getScheduledNotifications(
  includeInactive = false
): Promise<ScheduledNotification[]> {
  const supabase = createClient();

  let query = supabase
    .from('scheduled_notifications')
    .select('*')
    .order('scheduled_for', { ascending: true });

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching scheduled notifications:', error);
    return [];
  }

  return data || [];
}

/**
 * Récupérer les notifications prêtes à être envoyées
 */
export async function getNotificationsToSend(): Promise<ScheduledNotification[]> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_notifications_to_send');

  if (error) {
    console.error('Error fetching notifications to send:', error);
    return [];
  }

  return data || [];
}

/**
 * Marquer une notification comme envoyée
 */
export async function markNotificationAsSent(id: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase.rpc('mark_notification_as_sent', {
    notification_id: id,
  });

  if (error) {
    console.error('Error marking notification as sent:', error);
    return false;
  }

  return true;
}

/**
 * Planifier la prochaine occurrence (pour les répétitions)
 */
export async function scheduleNextOccurrence(id: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase.rpc('schedule_next_occurrence', {
    notification_id: id,
  });

  if (error) {
    console.error('Error scheduling next occurrence:', error);
    return false;
  }

  return true;
}

/**
 * Supprimer une notification programmée
 */
export async function deleteScheduledNotification(id: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from('scheduled_notifications')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting scheduled notification:', error);
    return false;
  }

  return true;
}

/**
 * Mettre à jour une notification programmée
 */
export async function updateScheduledNotification(
  id: string,
  updates: Partial<ScheduledNotification>
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from('scheduled_notifications')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating scheduled notification:', error);
    return false;
  }

  return true;
}

/**
 * Désactiver une notification programmée
 */
export async function deactivateScheduledNotification(id: string): Promise<boolean> {
  return updateScheduledNotification(id, { is_active: false });
}

/**
 * Activer une notification programmée
 */
export async function activateScheduledNotification(id: string): Promise<boolean> {
  return updateScheduledNotification(id, { is_active: true });
}

