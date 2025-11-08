'use client';

import { useState, useEffect } from 'react';

/**
 * Hook de preview gratuit - DÉSACTIVÉ
 * Système de blocage supprimé - Accès libre pour tous
 */
export function useFreePreview(channelId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(true);
  const [authorizationError, setAuthorizationError] = useState<string | null>(null);

  useEffect(() => {
    // Toujours autoriser l'accès
    setIsAuthorized(true);
    setIsLoading(false);
  }, [channelId]);

  return {
    isLoading,
    isAuthorized,
    authorizationError,
  };
}

