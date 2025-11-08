import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * API Route pour supprimer le compte utilisateur
 * POST /api/user/delete-account
 */
export async function POST() {
  try {
    const supabase = await createClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    console.log(`Début de suppression du compte pour l'utilisateur: ${user.id}`);

    // 1. Supprimer l'avatar du storage (si existe)
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profile?.avatar_url) {
        const urlWithoutParams = profile.avatar_url.split('?')[0];
        const filePath = urlWithoutParams.split('/user-avatars/').pop();
        
        if (filePath) {
          await supabase.storage
            .from('user-avatars')
            .remove([filePath]);
          console.log('Avatar supprimé');
        }
      }
    } catch (error) {
      console.warn('Erreur suppression avatar:', error);
      // Continue même si erreur
    }

    // 2. Supprimer les abonnements (si table existe)
    try {
      const { error: subError } = await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', user.id);
      
      if (subError) {
        console.warn('Erreur suppression subscriptions:', subError);
      } else {
        console.log('Subscriptions supprimées');
      }
    } catch (error) {
      console.warn('Table subscriptions non accessible:', error);
    }

    // 3. Supprimer les abonnements push
    try {
      const { error: pushError } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id);
      
      if (pushError) {
        console.warn('Erreur suppression push subscriptions:', pushError);
      } else {
        console.log('Push subscriptions supprimées');
      }
    } catch (error) {
      console.warn('Erreur suppression push subscriptions:', error);
    }

    // 4. Supprimer les préférences de notifications
    try {
      const { error: prefError } = await supabase
        .from('notification_preferences')
        .delete()
        .eq('user_id', user.id);
      
      if (prefError) {
        console.warn('Erreur suppression notification preferences:', prefError);
      } else {
        console.log('Notification preferences supprimées');
      }
    } catch (error) {
      console.warn('Erreur suppression notification preferences:', error);
    }

    // 5. Supprimer les likes (si table existe)
    try {
      const { error: likesError } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', user.id);
      
      if (likesError) {
        console.warn('Erreur suppression likes:', likesError);
      } else {
        console.log('Likes supprimés');
      }
    } catch (error) {
      console.warn('Erreur suppression likes:', error);
    }

    // 6. Supprimer les favoris (si table existe)
    try {
      const { error: favError } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id);
      
      if (favError) {
        console.warn('Erreur suppression favorites:', favError);
      } else {
        console.log('Favorites supprimés');
      }
    } catch (error) {
      console.warn('Erreur suppression favorites:', error);
    }

    // 7. Supprimer le profil utilisateur
    try {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', user.id);
      
      if (profileError) {
        console.warn('Erreur suppression profil:', profileError);
      } else {
        console.log('Profil supprimé');
      }
    } catch (error) {
      console.warn('Erreur suppression profil:', error);
    }

    // 8. Essayer d'utiliser la fonction RPC si elle existe
    try {
      const { error: rpcError } = await supabase.rpc('delete_user');
      
      if (rpcError) {
        console.warn('Fonction RPC delete_user non disponible:', rpcError);
        
        // Fallback: Supprimer via l'API admin
        const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(user.id);
        
        if (deleteAuthError) {
          console.error('Erreur suppression compte auth:', deleteAuthError);
          return NextResponse.json(
            { 
              error: 'Impossible de supprimer le compte. Veuillez contacter le support.',
              details: deleteAuthError.message
            },
            { status: 500 }
          );
        }
      }
      
      console.log('Compte auth supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du compte auth:', error);
      return NextResponse.json(
        { 
          error: 'Impossible de supprimer le compte. Veuillez contacter le support.',
          details: error instanceof Error ? error.message : 'Erreur inconnue'
        },
        { status: 500 }
      );
    }

    // 9. Déconnecter l'utilisateur
    await supabase.auth.signOut();
    
    console.log(`Compte supprimé avec succès pour l'utilisateur: ${user.id}`);
    
    return NextResponse.json({ 
      success: true,
      message: 'Compte supprimé avec succès'
    });
    
  } catch (error) {
    console.error('Erreur lors de la suppression du compte:', error);
    return NextResponse.json(
      { 
        error: 'Une erreur est survenue lors de la suppression du compte',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

