'use client';

import { useState, useEffect, useRef } from 'react';

const CACHE_DURATION = 5 * 1000; // 5 secondes de cache

/**
 * Hook de preview gratuit avec vérification IP et fingerprinting
 * Pour les utilisateurs free uniquement (pas anonymous)
 */
export function useFreePreview(channelId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [authorizationError, setAuthorizationError] = useState<string | null>(null);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  
  const authCacheRef = useRef<Map<string, { authorized: boolean; timestamp: number; remainingMs: number | null }>>(new Map());
  const authorizationCheckedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;
    let abortController: AbortController | null = null;

    const checkAuthorization = async () => {
      // Vérifier le cache
      const cacheKey = channelId;
      const cached = authCacheRef.current.get(cacheKey);
      const now = Date.now();

      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        if (isMounted) {
          setIsAuthorized(cached.authorized);
          setRemainingMs(cached.remainingMs);
          setIsLoading(false);
        }
        return;
      }

      // Si déjà en cours de vérification pour ce channel, ne pas relancer
      if (authorizationCheckedRef.current.has(cacheKey)) {
        return;
      }

      authorizationCheckedRef.current.add(cacheKey);

      try {
        // Générer le fingerprint
        const { generateDeviceFingerprint } = await import('@/lib/security/device-fingerprint');
        const deviceFingerprint = await generateDeviceFingerprint();

        abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController?.abort(), 5000);

        const response = await fetch('/api/security/check-preview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            deviceFingerprint,
            channelId,
          }),
          signal: abortController.signal,
          // En PWA, éviter le cache pour avoir des données fraîches
          cache: 'no-store',
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (isMounted) {
          setIsAuthorized(data.canUse === true);
          setRemainingMs(data.remainingMs);
          setAuthorizationError(data.reason || null);
          
          // Mettre en cache
          authCacheRef.current.set(cacheKey, {
            authorized: data.canUse === true,
            timestamp: now,
            remainingMs: data.remainingMs,
          });

          // Nettoyer le cache après 30 secondes pour éviter qu'il ne grandisse indéfiniment
          setTimeout(() => {
            authCacheRef.current.delete(cacheKey);
          }, 30000);
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.warn('Timeout lors de la vérification de preview');
          // En cas de timeout, bloquer l'accès pour éviter les abus
          if (isMounted) {
            setIsAuthorized(false);
            setRemainingMs(0);
            setAuthorizationError('Timeout lors de la vérification');
          }
        } else {
          console.error('Erreur lors de la vérification de preview:', error);
          // En cas d'erreur, bloquer l'accès par sécurité
          if (isMounted) {
            setIsAuthorized(false);
            setRemainingMs(0);
            setAuthorizationError('Erreur de vérification');
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
        authorizationCheckedRef.current.delete(cacheKey);
      }
    };

    checkAuthorization();

    return () => {
      isMounted = false;
      if (abortController) {
        abortController.abort();
      }
    };
  }, [channelId]);

  return {
    isLoading,
    isAuthorized,
    authorizationError,
    remainingMs,
  };
}
