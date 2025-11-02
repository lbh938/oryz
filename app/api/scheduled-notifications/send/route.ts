import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import webpush from 'web-push';

// Configuration Web Push
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
  subject: process.env.VAPID_SUBJECT || 'mailto:admin@oryz.stream'
};

if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    vapidKeys.subject,
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
}

/**
 * API pour déclencher l'envoi des notifications programmées
 * Appelée manuellement ou par un cron externe (EasyCron, etc.)
 */
export async function GET(request: Request) {
  try {
    console.log('🔔 Vérification des notifications programmées...');
    
    const supabase = await createClient();
    
    // Récupérer et marquer les notifications prêtes
    const { data: notifications, error: notifError } = await supabase
      .rpc('get_notifications_to_send');

    if (notifError) {
      console.error('❌ Erreur récupération:', notifError);
      return NextResponse.json({ 
        error: notifError.message,
        details: notifError.hint 
      }, { status: 500 });
    }

    if (!notifications || notifications.length === 0) {
      console.log('✅ Aucune notification à envoyer');
      return NextResponse.json({
        success: true,
        message: 'Aucune notification programmée pour le moment',
        checked: new Date().toISOString(),
        sent: 0
      });
    }

    console.log(`📋 ${notifications.length} notification(s) à envoyer`);


    // Récupérer tous les abonnements push actifs
    const { data: pushSubscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('is_active', true);

    if (subError) {
      console.error('❌ Erreur récupération abonnements:', subError);
      return NextResponse.json({ error: subError.message }, { status: 500 });
    }

    let totalSent = 0;
    const now = new Date().toISOString();

    // Envoyer chaque notification à tous les abonnés
    for (const notif of notifications) {
      const payload = JSON.stringify({
        title: notif.title,
        body: notif.body,
        icon: notif.icon || '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: `scheduled-${notif.id}`,
        data: { url: '/', dateOfArrival: Date.now() }
      });

      if (pushSubscriptions && pushSubscriptions.length > 0 && vapidKeys.publicKey) {
        for (const sub of pushSubscriptions) {
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: { p256dh: sub.p256dh, auth: sub.auth }
              },
              payload
            );
            totalSent++;
            
            await supabase
              .from('push_subscriptions')
              .update({ last_notification_at: now })
              .eq('endpoint', sub.endpoint);
          } catch (err: any) {
            if (err.statusCode === 410) {
              await supabase
                .from('push_subscriptions')
                .update({ is_active: false })
                .eq('endpoint', sub.endpoint);
            }
          }
        }
      }

      // Si répétition, créer la prochaine occurrence
      if (notif.repeat_type && notif.repeat_type !== 'once') {
        console.log(`🔄 Planification prochaine occurrence (${notif.repeat_type})`);
        await supabase.rpc('schedule_next_occurrence_simple', { notification_id: notif.id });
      }
    }

    console.log(`✅ Envoi terminé: ${notifications.length} notification(s) → ${totalSent} appareil(s)`);

    return NextResponse.json({
      success: true,
      message: `${notifications.length} notification(s) envoyée(s) à ${totalSent} appareil(s)`,
      notifications: notifications.length,
      sentTo: totalSent,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi' },
      { status: 500 }
    );
  }
}

export const POST = GET;

