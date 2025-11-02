import { createClient } from '@/lib/supabase/client';

/**
 * Supprimer le compte utilisateur
 * Supprime toutes les données associées (profil, avatar, préférences, etc.)
 */
export async function deleteUserAccount(): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Non authentifié' };
    }

    // 1. Supprimer l'avatar du storage (si existe)
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();
      
      if (profile?.avatar_url) {
        const urlWithoutParams = profile.avatar_url.split('?')[0];
        const filePath = urlWithoutParams.split('/user-avatars/').pop();
        
        if (filePath) {
          await supabase.storage
            .from('user-avatars')
            .remove([filePath]);
        }
      }
    } catch (error) {
      console.warn('Erreur suppression avatar:', error);
      // Continue même si erreur
    }

    // 2. Supprimer les abonnements push
    try {
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id);
    } catch (error) {
      console.warn('Erreur suppression push subscriptions:', error);
    }

    // 3. Supprimer les préférences de notifications
    try {
      await supabase
        .from('notification_preferences')
        .delete()
        .eq('user_id', user.id);
    } catch (error) {
      console.warn('Erreur suppression notification preferences:', error);
    }

    // 4. Supprimer le profil utilisateur
    try {
      await supabase
        .from('user_profiles')
        .delete()
        .eq('id', user.id);
    } catch (error) {
      console.warn('Erreur suppression profil:', error);
    }

    // 5. Supprimer le compte auth (cette action est irréversible)
    const { error: deleteError } = await supabase.rpc('delete_user');
    
    if (deleteError) {
      // Si la fonction RPC n'existe pas, utiliser l'API admin
      console.error('Erreur suppression compte:', deleteError);
      return { 
        success: false, 
        error: 'Impossible de supprimer le compte. Contactez le support.' 
      };
    }

    // 6. Se déconnecter
    await supabase.auth.signOut();
    
    // 7. Nettoyer le localStorage
    localStorage.removeItem('oryz_notification_status');
    localStorage.removeItem('oryz_notification_date');
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression du compte:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue'
    };
  }
}

