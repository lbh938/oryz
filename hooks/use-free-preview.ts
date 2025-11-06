'use client';

import { useState, useEffect, useRef } from 'react';
import { generateDeviceFingerprintSync } from '@/lib/security/device-fingerprint';

const FREE_PREVIEW_DURATION = 15 * 60 * 1000; // 15 minutes en millisecondes
const STORAGE_KEY_PREFIX = 'free_preview_';

/**
 * Hook pour gérer le temps de visionnage gratuit (15 minutes)
 * pour les chaînes premium avec vérification anti-fraude
 */
export function useFreePreview(channelId: string) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [hasExceededLimit, setHasExceededLimit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [authorizationError, setAuthorizationError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Vérifier l'autorisation avant de permettre l'essai
  // Utiliser un ref pour éviter les appels multiples
  const authorizationCheckedRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
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
        
        // Récupérer l'IP (sera fait côté serveur, mais on peut aussi utiliser un service)
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
        });

        const data = await response.json();

        if (!data.canUse) {
          setIsAuthorized(false);
          setAuthorizationError(data.reason || 'Accès non autorisé');
          // Si le serveur renvoie remainingMs, synchroniser l'état du timer
          if (typeof data.remainingMs === 'number') {
            setTimeRemaining(Math.max(0, data.remainingMs));
            setHasExceededLimit(data.remainingMs <= 0);
          }
          setIsLoading(false);
          return;
        }

        setIsAuthorized(true);
        // Si le serveur renvoie remainingMs, utiliser le timer serveur
        if (typeof data.remainingMs === 'number') {
          setTimeRemaining(Math.max(0, data.remainingMs));
          setHasExceededLimit(data.remainingMs <= 0);
        }
      } catch (error) {
        console.error('Error checking authorization:', error);
        // En cas d'erreur, autoriser quand même (pour ne pas bloquer les utilisateurs légitimes)
        setIsAuthorized(true);
        // Retirer du cache en cas d'erreur pour permettre une nouvelle tentative
        authorizationCheckedRef.current.delete(channelId);
      }
    };

    // Ne vérifier que si channelId n'est pas 'not-premium'
    if (channelId && channelId !== 'not-premium') {
      checkAuthorization();
    } else {
      // Si ce n'est pas une chaîne premium, autoriser immédiatement
      setIsAuthorized(true);
      setIsLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    // Attendre l'autorisation avant de démarrer le timer
    if (isAuthorized === null) return;

    const storageKey = `${STORAGE_KEY_PREFIX}${channelId}`;
    
    // Récupérer le temps de début depuis le localStorage
    const getStartTime = (): number | null => {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const startTime = parseInt(stored, 10);
        // Vérifier si c'est aujourd'hui (pas plus de 24h)
        const now = Date.now();
        const dayInMs = 24 * 60 * 60 * 1000;
        if (now - startTime < dayInMs) {
          return startTime;
        } else {
          // Plus de 24h, réinitialiser
          localStorage.removeItem(storageKey);
          return null;
        }
      }
      return null;
    };

    // Sauvegarder le temps de début
    const saveStartTime = (startTime: number) => {
      localStorage.setItem(storageKey, startTime.toString());
    };

    // Si le serveur a déjà positionné timeRemaining via la phase d'auth, ne pas surcharger
    if (timeRemaining === null) {
      // Fallback local (si remainingMs non fourni par le serveur)
      const startTime = getStartTime();
      if (startTime) {
        startTimeRef.current = startTime;
        const elapsed = Date.now() - startTime;
        if (elapsed >= FREE_PREVIEW_DURATION) {
          setHasExceededLimit(true);
          setTimeRemaining(0);
          setIsLoading(false);
          return;
        } else {
          const remaining = FREE_PREVIEW_DURATION - elapsed;
          setTimeRemaining(remaining);
          setHasExceededLimit(false);
        }
      } else {
        const newStartTime = Date.now();
        startTimeRef.current = newStartTime;
        saveStartTime(newStartTime);
        setTimeRemaining(FREE_PREVIEW_DURATION);
        setHasExceededLimit(false);
      }
    }

    setIsLoading(false);

    // Mettre à jour le timer toutes les secondes
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null) return prev;
        const next = prev - 1000;
        if (next <= 0) {
          setHasExceededLimit(true);
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return next;
      });
    }, 1000);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [channelId]);

  // Formater le temps restant en minutes:secondes
  const formatTimeRemaining = (): string => {
    if (timeRemaining === null) return '00:00';
    
    const totalSeconds = Math.floor(timeRemaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Réinitialiser le timer (pour les tests ou si l'utilisateur s'abonne)
  const resetTimer = () => {
    const storageKey = `${STORAGE_KEY_PREFIX}${channelId}`;
    localStorage.removeItem(storageKey);
    startTimeRef.current = null;
    setTimeRemaining(FREE_PREVIEW_DURATION);
    setHasExceededLimit(false);
  };

  return {
    timeRemaining,
    hasExceededLimit,
    isLoading,
    isAuthorized,
    authorizationError,
    formatTimeRemaining,
    resetTimer,
    minutesRemaining: timeRemaining ? Math.ceil(timeRemaining / 60000) : 0
  };
}

