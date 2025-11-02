import { createClient } from '@/lib/supabase/client';

export interface UserProfile {
  id: string;
  username: string;
  username_last_changed: string;
  avatar_url?: string;
  first_name?: string;
  last_name?: string;
  birth_date?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Récupérer le profil de l'utilisateur actuel
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
}

/**
 * Mettre à jour le profil utilisateur (sauf username)
 */
export async function updateUserProfile(updates: {
  avatar_url?: string;
  first_name?: string;
  last_name?: string;
  birth_date?: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Non authentifié' };
  }
  
  const { error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', user.id);
  
  if (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

/**
 * Mettre à jour le username (avec vérification de la limite d'un an)
 */
export async function updateUsername(newUsername: string): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Non authentifié' };
  }
  
  // Vérifier le format du username
  if (newUsername.length < 3 || newUsername.length > 20) {
    return { 
      success: false, 
      error: 'Le username doit contenir entre 3 et 20 caractères' 
    };
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
    return { 
      success: false, 
      error: 'Le username ne peut contenir que des lettres, chiffres et underscores' 
    };
  }
  
  // Appeler la fonction PostgreSQL pour mettre à jour le username
  const { data, error } = await supabase.rpc('update_username', {
    user_id: user.id,
    new_username: newUsername
  });
  
  if (error) {
    console.error('Error updating username:', error);
    return { success: false, error: error.message };
  }
  
  return data as { success: boolean; error?: string; message?: string };
}

/**
 * Vérifier si l'utilisateur peut changer son username
 */
export async function canChangeUsername(): Promise<{
  canChange: boolean;
  nextChangeDate?: string;
}> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { canChange: false };
  }
  
  const { data, error } = await supabase.rpc('can_change_username', {
    user_id: user.id
  });
  
  if (error) {
    console.error('Error checking username change:', error);
    return { canChange: false };
  }
  
  // Récupérer la date du dernier changement
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('username_last_changed')
    .eq('id', user.id)
    .single();
  
  let nextChangeDate: string | undefined;
  if (profile?.username_last_changed) {
    const lastChanged = new Date(profile.username_last_changed);
    const nextChange = new Date(lastChanged);
    nextChange.setFullYear(nextChange.getFullYear() + 1);
    nextChangeDate = nextChange.toISOString();
  }
  
  return {
    canChange: data as boolean,
    nextChangeDate
  };
}

/**
 * Uploader une photo de profil
 */
export async function uploadAvatar(file: File): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Non authentifié' };
  }
  
  // Vérifier le type de fichier
  if (!file.type.startsWith('image/')) {
    return { success: false, error: 'Le fichier doit être une image' };
  }
  
  // Vérifier la taille (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: 'L\'image ne doit pas dépasser 5MB' };
  }
  
  // 1. SUPPRIMER L'ANCIEN AVATAR s'il existe
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single();
    
    if (profile?.avatar_url) {
      // Extraire le chemin du fichier de l'URL (enlever les query params)
      const urlWithoutParams = profile.avatar_url.split('?')[0];
      const oldPath = urlWithoutParams.split('/user-avatars/').pop();
      if (oldPath) {
        // Supprimer l'ancien fichier (ignorer les erreurs)
        await supabase.storage
          .from('user-avatars')
          .remove([oldPath]);
      }
    }
  } catch (error) {
    // Ignorer les erreurs de suppression
    console.log('No old avatar to delete or error deleting:', error);
  }
  
  // 2. UPLOADER LE NOUVEAU FICHIER
  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;
  
  const { error: uploadError } = await supabase.storage
    .from('user-avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false // Ne pas écraser, créer un nouveau fichier
    });
  
  if (uploadError) {
    console.error('Error uploading avatar:', uploadError);
    return { success: false, error: uploadError.message };
  }
  
  // 3. RÉCUPÉRER L'URL PUBLIQUE
  const { data: { publicUrl } } = supabase.storage
    .from('user-avatars')
    .getPublicUrl(filePath);
  
  // 4. METTRE À JOUR LE PROFIL (sans cache-busting dans la DB)
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id);
  
  if (updateError) {
    console.error('Error updating avatar URL:', updateError);
    return { success: false, error: updateError.message };
  }
  
  // Retourner l'URL avec cache-busting pour affichage immédiat
  const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;
  return { success: true, url: urlWithCacheBust };
}

/**
 * Supprimer la photo de profil
 */
export async function deleteAvatar(): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Non authentifié' };
  }
  
  try {
    // 1. Récupérer l'URL actuelle
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single();
    
    if (profile?.avatar_url) {
      // 2. Extraire le chemin du fichier
      const urlWithoutParams = profile.avatar_url.split('?')[0];
      const filePath = urlWithoutParams.split('/user-avatars/').pop();
      
      if (filePath) {
        // 3. Supprimer le fichier du storage
        await supabase.storage
          .from('user-avatars')
          .remove([filePath]);
      }
    }
    
    // 4. Mettre à jour le profil (retirer l'URL)
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ avatar_url: null })
      .eq('id', user.id);
    
    if (updateError) {
      console.error('Error removing avatar URL:', updateError);
      return { success: false, error: updateError.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting avatar:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur lors de la suppression' 
    };
  }
}

