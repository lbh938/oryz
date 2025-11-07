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

  // OPTIMISATION: Cache des vérifications avec timestamp pour éviter les appels excessifs
  // Cache réduit à 5 secondes pour permettre la re-vérification après expiration des 15 minutes
  const authCacheRef = useRef<Map<string, { authorized: boolean; timestamp: number }>>(new Map());
  const CACHE_DURATION = 5000; // 5 secondes (réduit de 30s pour permettre la re-vérification rapide)
  
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
    
    // Vérifier le cache avec timestamp
    const cached = authCacheRef.current.get(channelId);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      // Si le cache dit "non autorisé", toujours utiliser le cache
      // Si le cache dit "autorisé", vérifier quand même après 5 secondes
      // pour détecter l'expiration des 15 minutes
      if (!cached.authorized) {
        setIsAuthorized(false);
        setAuthorizationError('Accès restreint');
        setIsLoading(false);
        return;
      }
      // Pour les autorisations, on continue la vérification après 5s
      // pour détecter l'expiration des 15 minutes côté serveur
    }
    
    const checkAuthorization = async () => {
      try {
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
          // Mettre en cache le résultat négatif
          authCacheRef.current.set(channelId, { authorized: false, timestamp: Date.now() });
          return;
        }

        // Accès autorisé - le serveur gère les 15 minutes
        setIsAuthorized(true);
        setIsLoading(false);
        // Mettre en cache le résultat positif
        authCacheRef.current.set(channelId, { authorized: true, timestamp: Date.now() });
      } catch (error: any) {
        console.error('Error checking authorization:', error);
        
        // En cas de timeout (AbortError), bloquer l'accès au lieu d'autoriser
        // Cela évite de contourner la limite de 15 minutes en cas d'erreur réseau
        if (error.name === 'AbortError') {
          console.warn('Authorization check timed out, blocking access');
          setIsAuthorized(false);
          setAuthorizationError('Vérification impossible - Veuillez réessayer');
          setIsLoading(false);
          // Ne pas mettre en cache pour permettre une nouvelle tentative
          return;
        }
        
        // Pour les autres erreurs, autoriser quand même (pour ne pas bloquer les utilisateurs légitimes)
        setIsAuthorized(true);
        setIsLoading(false);
        // Ne pas mettre en cache les erreurs pour permettre une nouvelle tentative
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

