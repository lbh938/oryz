'use client';

import { useState, useEffect, useRef } from 'react';
import { generateDeviceFingerprintSync } from '@/lib/security/device-fingerprint';

/**
 * Hook simplifié pour gérer l'accès gratuit de 15 minutes à la page
 * Le serveur gère la limite de 15 minutes via preview_start_at
 * Pas de timer client - juste vérification d'autorisation
 */
export function useFreePreview(channelId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [authorizationError, setAuthorizationError] = useState<string | null>(null);

  // Vérifier l'autorisation avant de permettre l'accès
  // Utiliser un ref pour éviter les appels multiples
  const authorizationCheckedRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    // Reset des états quand channelId change
    setIsAuthorized(null);
    setIsLoading(true);
    setAuthorizationError(null);
    
    // Si ce n'est pas une chaîne premium, autoriser immédiatement
    if (!channelId || channelId === 'not-premium') {
      setIsAuthorized(true);
      setIsLoading(false);
      return;
    }
    
    // Éviter les appels multiples pour le même channelId
    if (authorizationCheckedRef.current.has(channelId)) {
      return;
    }
    
    const checkAuthorization = async () => {
      try {
        // Marquer comme vérifié immédiatement pour éviter les appels multiples
        authorizationCheckedRef.current.add(channelId);
        
        // Générer le fingerprint du device
        const deviceFingerprint = generateDeviceFingerprintSync();
        
        // Timeout de 5 secondes pour l'API
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        // Vérifier l'autorisation d'accès (le serveur gère les 15 minutes)
        const response = await fetch('/api/security/check-preview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            deviceFingerprint,
            userAgent: navigator.userAgent,
            channelId,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data = await response.json();

        if (!data.canUse) {
          setIsAuthorized(false);
          setAuthorizationError(data.reason || 'Accès non autorisé');
          setIsLoading(false);
          return;
        }

        // Accès autorisé - le serveur gère les 15 minutes
        setIsAuthorized(true);
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error checking authorization:', error);
        // En cas d'erreur ou timeout, autoriser quand même (pour ne pas bloquer les utilisateurs légitimes)
        setIsAuthorized(true);
        setIsLoading(false);
        // Retirer du cache en cas d'erreur pour permettre une nouvelle tentative
        authorizationCheckedRef.current.delete(channelId);
      }
    };

    checkAuthorization();
  }, [channelId]);

  return {
    isLoading,
    isAuthorized,
    authorizationError,
  };
}

