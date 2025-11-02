import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * API pour enregistrer un abonnement push dans Supabase
 * Appelé quand l'utilisateur active les notifications
 * IMPORTANT: Utilise anon key pour permettre les inscriptions anonymes
 */
export async function POST(request: Request) {
  try {
    // Utiliser le client anon pour permettre les utilisateurs non connectés
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Récupérer l'utilisateur actuel depuis le header Authorization (peut être null)
    const authHeader = request.headers.get('authorization');
    let user = null;
    
    if (authHeader) {
      const { data: { user: authUser } } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      );
      user = authUser;
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
      .single();

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

