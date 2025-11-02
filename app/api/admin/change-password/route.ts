import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Route pour changer le mot de passe admin via Supabase Auth
 */
export async function POST(request: NextRequest) {
  try {
    const { newPassword } = await request.json();

    if (!newPassword) {
      return NextResponse.json({
        success: false,
        error: 'Le nouveau mot de passe est requis'
      }, { status: 400 });
    }

    // Validation du nouveau mot de passe
    if (newPassword.length < 8) {
      return NextResponse.json({
        success: false,
        error: 'Le nouveau mot de passe doit contenir au moins 8 caractères'
      }, { status: 400 });
    }

    const supabase = await createClient();

    // Récupérer l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Non authentifié'
      }, { status: 401 });
    }

    // Mettre à jour le mot de passe via Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors du changement de mot de passe'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Mot de passe changé avec succès'
    });

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
}

