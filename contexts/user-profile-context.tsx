'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { getCurrentUserProfile, UserProfile } from '@/lib/user-profile';
import { getCachedUser, invalidateUserCache } from '@/lib/auth-cache';

interface UserProfileContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Vérifier d'abord si l'utilisateur est connecté (avec cache)
      const user = await getCachedUser();
      if (!user) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      // Charger le profil
      const profileData = await getCurrentUserProfile();
      setProfile(profileData);
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du profil');
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  // Écouter les changements d'auth pour recharger le profil
  // OPTIMISATION: Ne pas recharger pendant le visionnage pour éviter les déconnexions
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    // Import dynamique pour éviter les imports circulaires
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient();
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string) => {
        // Vérifier si on est sur une page de visionnage
        const isWatchPage = window.location.pathname.includes('/watch/');
        
        if (event === 'SIGNED_IN') {
          // TOUJOURS recharger lors de la connexion (même en visionnage)
          invalidateUserCache();
          await refreshProfile();
        } else if (event === 'TOKEN_REFRESHED') {
          // Invalider le cache
          invalidateUserCache();
          
          // Ne recharger le profil que si on n'est PAS en train de regarder du contenu
          if (!isWatchPage) {
            await refreshProfile();
          }
          // Si on est en visionnage, le profil sera rechargé à la prochaine navigation
        } else if (event === 'SIGNED_OUT') {
          // TOUJOURS recharger lors de la déconnexion (même en visionnage)
          invalidateUserCache();
          setProfile(null);
          setIsLoading(false);
        }
      });

      // Stocker la fonction de nettoyage
      unsubscribe = () => subscription.unsubscribe();
    });

    // Retourner la fonction de nettoyage
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [refreshProfile]);

  // Stabiliser la valeur du contexte avec useMemo
  const value = useMemo(() => ({
    profile,
    isLoading,
    error,
    refreshProfile,
  }), [profile?.id, profile?.updated_at, isLoading, error, refreshProfile]);

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within UserProfileProvider');
  }
  return context;
}


