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
    const { title, body, icon, badge } = await request.json();

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
      return NextResponse.json(
        {
          error: 'Erreur lors de la sauvegarde',
          details: dbError.message,
          hint: dbError.hint || 'Vérifiez que la table broadcast_notifications existe'
        },
        { status: 500 }
      );
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

