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

  // NE PLUS ÉCOUTER onAuthStateChange - Cela causait des déconnexions après visionnage
  // Le profil est chargé au montage et peut être rafraîchi manuellement via refreshProfile()
  // Le middleware vérifie la session sur chaque navigation
  // Supabase gère automatiquement le refresh de session
  useEffect(() => {
    // Pas de listener d'auth ici
    // Le profil est déjà chargé au montage via refreshProfile()
    // Les composants peuvent appeler refreshProfile() manuellement si nécessaire
    
    // Cleanup vide
    return () => {};
  }, []);

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


