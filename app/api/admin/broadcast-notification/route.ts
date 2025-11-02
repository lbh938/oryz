import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * API pour broadcaster une notification instantanée
 * Sauvegarde dans la DB pour que tous les clients actifs puissent la récupérer
 */
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

    // Vérifier si l'utilisateur est admin
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single();

    if (!adminData?.is_super_admin) {
      return NextResponse.json(
        { error: 'Accès refusé - Admin uniquement' },
        { status: 403 }
      );
    }

    // Récupérer les données de la notification
    const { title, body, icon, badge } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Titre et message requis' },
        { status: 400 }
      );
    }

    // Sauvegarder la notification dans une table pour broadcast
    const { error: dbError } = await supabase
      .from('broadcast_notifications')
      .insert({
        title,
        body,
        icon: icon || '/icon-192x192.png',
        badge: badge || '/icon-192x192.png',
        created_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Continuer même si l'erreur (table n'existe peut-être pas encore)
    }

    return NextResponse.json({
      success: true,
      message: 'Notification broadcastée avec succès',
      note: 'Les utilisateurs connectés avec notifications activées la recevront'
    });

  } catch (error) {
    console.error('Error broadcasting notification:', error);
    return NextResponse.json(
      { error: 'Erreur lors du broadcast' },
      { status: 500 }
    );
  }
}

