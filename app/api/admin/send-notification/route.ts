import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import webpush from 'web-push';

// Configuration Web Push (à mettre dans vos variables d'environnement)
// Pour générer les clés : npx web-push generate-vapid-keys
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

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Vérifier que l'utilisateur est admin
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier si l'utilisateur est admin (utiliser maybeSingle pour éviter les erreurs)
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('is_super_admin')
      .eq('id', user.id)
      .maybeSingle();

    if (adminError) {
      console.error('Error checking admin status:', adminError);
      return NextResponse.json(
        { error: 'Erreur lors de la vérification des permissions' },
        { status: 500 }
      );
    }

    if (!adminData?.is_super_admin) {
      return NextResponse.json(
        { error: 'Accès refusé - Admin uniquement' },
        { status: 403 }
      );
    }

    // Récupérer et valider les données de la notification
    const { title, body, icon, badge, tag } = await request.json();

    // Validation des entrées utilisateur
    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Le titre est requis et doit être une chaîne de caractères' },
        { status: 400 }
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        { error: 'Le titre ne peut pas dépasser 200 caractères' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'string') {
      return NextResponse.json(
        { error: 'Le message est requis et doit être une chaîne de caractères' },
        { status: 400 }
      );
    }

    if (body.length > 1000) {
      return NextResponse.json(
        { error: 'Le message ne peut pas dépasser 1000 caractères' },
        { status: 400 }
      );
    }

    // Validation optionnelle des URLs
    if (icon && typeof icon === 'string' && icon.length > 500) {
      return NextResponse.json(
        { error: 'L\'URL de l\'icône est trop longue' },
        { status: 400 }
      );
    }

    if (badge && typeof badge === 'string' && badge.length > 500) {
      return NextResponse.json(
        { error: 'L\'URL du badge est trop longue' },
        { status: 400 }
      );
    }

    // Vérifier que VAPID keys sont configurées
    if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
      return NextResponse.json(
        { 
          error: 'VAPID keys non configurées',
          note: 'Configurez NEXT_PUBLIC_VAPID_PUBLIC_KEY et VAPID_PRIVATE_KEY dans vos variables d\'environnement'
        },
        { status: 500 }
      );
    }

    // Récupérer tous les abonnements actifs
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('is_active', true);

    if (subError) {
      console.error('Erreur lors de la récupération des abonnements:', subError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des abonnements' },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucun abonnement actif',
        sentTo: 0
      });
    }

    // Préparer le payload de la notification
    const payload = JSON.stringify({
      title,
      body,
      icon: icon || '/icon-192x192.png',
      badge: badge || '/icon-192x192.png',
      tag: tag || 'oryz-notification',
      data: {
        url: '/',
        dateOfArrival: Date.now()
      }
    });

    // Envoyer à tous les abonnés
    const results = {
      success: 0,
      failed: 0,
      expired: 0
    };

    const now = new Date().toISOString();

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          },
          payload
        );
        results.success++;
        
        // Mettre à jour last_notification_at pour suivi
        await supabase
          .from('push_subscriptions')
          .update({ last_notification_at: now })
          .eq('endpoint', sub.endpoint);
      } catch (err: any) {
        console.error('Erreur envoi vers', sub.endpoint, err.statusCode);
        
        // Supprimer les abonnements expirés (410 Gone)
        if (err.statusCode === 410) {
          results.expired++;
          await supabase
            .from('push_subscriptions')
            .update({ is_active: false })
            .eq('endpoint', sub.endpoint);
        } else {
          results.failed++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Notification envoyée à ${results.success} utilisateur(s)`,
      sentTo: results.success,
      failed: results.failed,
      expired: results.expired,
      total: subscriptions.length
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de la notification' },
      { status: 500 }
    );
  }
}

