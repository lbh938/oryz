import { createClient } from '@/lib/supabase/client';

/**
 * Supprimer le compte utilisateur
 * Appelle l'API route pour supprimer le compte côté serveur
 */
export async function deleteUserAccount(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Appeler l'API route pour supprimer le compte
    const response = await fetch('/api/user/delete-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de la suppression du compte'
      };
    }

    // Nettoyer le localStorage
    try {
      localStorage.removeItem('oryz_notification_status');
      localStorage.removeItem('oryz_notification_date');
      sessionStorage.clear();
    } catch (error) {
      console.warn('Erreur nettoyage localStorage:', error);
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression du compte:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue'
    };
  }
}

