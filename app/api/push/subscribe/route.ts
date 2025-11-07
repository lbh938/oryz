import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * API pour enregistrer un abonnement push dans Supabase
 * Appelé quand l'utilisateur active les notifications
 * IMPORTANT: Permet les inscriptions anonymes (user_id peut être NULL)
 */
export async function POST(request: Request) {
  try {
    // Utiliser le client SSR qui gère correctement les cookies de session
    const supabase = await createClient();
    
    // Récupérer l'utilisateur actuel (peut être null pour les utilisateurs anonymes)
    let user = null;
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (!authError && authUser) {
      user = authUser;
      }
    } catch (error) {
      // Ignorer les erreurs d'authentification - les utilisateurs anonymes sont autorisés
      console.log('User not authenticated, allowing anonymous subscription');
    }
    
    // Récupérer les données de l'abonnement
    const subscription = await request.json();
    
    if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return NextResponse.json(
        { error: 'Abonnement invalide: endpoint, p256dh et auth requis' },
        { status: 400 }
      );
    }

    // Détecter le navigateur
    const userAgent = request.headers.get('user-agent') || '';
    let browser = 'unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    // Sauvegarder l'abonnement dans Supabase
    // Utiliser upsert avec endpoint comme clé unique
    // user_id peut être NULL pour les utilisateurs anonymes
    console.log('📝 Sauvegarde abonnement:', { 
      userId: user?.id || 'ANONYME', 
      browser,
      endpoint: subscription.endpoint.substring(0, 50) + '...'
    });
    
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user?.id || null, // NULL pour anonymes
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        browser: browser,
        device_info: userAgent,
        is_active: true,
      }, {
        onConflict: 'endpoint',
        ignoreDuplicates: false
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('❌ Erreur sauvegarde abonnement:', error);
      return NextResponse.json(
        { 
          error: 'Erreur lors de la sauvegarde',
          details: error.message,
          hint: error.hint
        },
        { status: 500 }
      );
    }

    console.log('✅ Abonnement enregistré:', { 
      id: data.id, 
      userId: user?.id || 'ANONYME', 
      browser 
    });

    return NextResponse.json({
      success: true,
      id: data.id,
      message: 'Abonnement enregistré avec succès'
    });

  } catch (error) {
    console.error('Erreur inattendue:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

