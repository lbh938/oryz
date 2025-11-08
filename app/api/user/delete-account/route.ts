import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

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

    // 5. Supprimer les likes (si table existe) - Ignorer si table n'existe pas
    try {
      const { error: likesError } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', user.id);
      
      if (likesError) {
        // Ignorer l'erreur si la table n'existe pas (code PGRST205)
        if (likesError.code !== 'PGRST205') {
          console.warn('Erreur suppression likes:', likesError);
        }
      } else {
        console.log('Likes supprimés');
      }
    } catch (error: any) {
      // Ignorer si la table n'existe pas
      if (error?.code !== 'PGRST205') {
        console.warn('Erreur suppression likes:', error);
      }
    }

    // 6. Supprimer les favoris (si table existe) - Ignorer si table n'existe pas
    try {
      const { error: favError } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id);
      
      if (favError) {
        // Ignorer l'erreur si la table n'existe pas (code PGRST205)
        if (favError.code !== 'PGRST205') {
          console.warn('Erreur suppression favorites:', favError);
        }
      } else {
        console.log('Favorites supprimés');
      }
    } catch (error: any) {
      // Ignorer si la table n'existe pas
      if (error?.code !== 'PGRST205') {
        console.warn('Erreur suppression favorites:', error);
      }
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

    // 8. Supprimer l'utilisateur auth avec le service role key
    try {
      // Utiliser le service role key pour avoir les permissions admin
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      
      if (!serviceRoleKey || !supabaseUrl) {
        console.warn('Service role key non disponible, tentative avec RPC');
        
        // Essayer d'utiliser la fonction RPC si elle existe
        const { error: rpcError } = await supabase.rpc('delete_user');
        
        if (rpcError) {
          console.error('Erreur RPC delete_user:', rpcError);
          return NextResponse.json(
            { 
              error: 'Impossible de supprimer le compte. Service role key requis.',
              details: 'SUPABASE_SERVICE_ROLE_KEY non configuré'
            },
            { status: 500 }
          );
        }
        
        console.log('Compte auth supprimé via RPC');
      } else {
        // Créer un client admin avec le service role key
        const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });
        
        // Supprimer l'utilisateur avec les permissions admin
        const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
        
        if (deleteAuthError) {
          console.error('Erreur suppression compte auth:', deleteAuthError);
          
          // Fallback: Essayer la fonction RPC
          const { error: rpcError } = await supabase.rpc('delete_user');
          
          if (rpcError) {
            return NextResponse.json(
              { 
                error: 'Impossible de supprimer le compte. Veuillez contacter le support.',
                details: deleteAuthError.message
              },
              { status: 500 }
            );
          }
          
          console.log('Compte auth supprimé via RPC (fallback)');
        } else {
          console.log('Compte auth supprimé avec succès via admin API');
        }
      }
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

    console.log(`Compte supprimé avec succès pour l'utilisateur: ${user.id}`);
    
    // Note: La déconnexion sera gérée côté client pour garantir
    // que tous les états et caches sont correctement nettoyés
    
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

