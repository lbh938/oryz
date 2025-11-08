'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Hook pour gérer le timer de visionnage de 15 minutes
 * Pour les utilisateurs free (avec ou sans compte)
 */
export function useViewingTimer(isActive: boolean, userStatus: string) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [hasExceeded, setHasExceeded] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const FIFTEEN_MINUTES_MS = 15 * 60 * 1000; // 15 minutes en millisecondes

  useEffect(() => {
    // Si l'utilisateur est premium, pas de timer
    const isPremium = ['trial', 'kickoff', 'pro_league', 'vip', 'admin'].includes(userStatus);
    if (isPremium || !isActive) {
      setTimeRemaining(null);
      setHasExceeded(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Récupérer ou initialiser le temps de début depuis sessionStorage
    const storageKey = 'viewing_start_time';
    const storedStartTime = sessionStorage.getItem(storageKey);
    
    if (storedStartTime) {
      startTimeRef.current = parseInt(storedStartTime, 10);
    } else {
      startTimeRef.current = Date.now();
      sessionStorage.setItem(storageKey, startTimeRef.current.toString());
    }

    // Calculer le temps restant
    const updateTimer = () => {
      if (!startTimeRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      const remaining = FIFTEEN_MINUTES_MS - elapsed;

      if (remaining <= 0) {
        setTimeRemaining(0);
        setHasExceeded(true);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        setTimeRemaining(remaining);
        setHasExceeded(false);
      }
    };

    // Mettre à jour immédiatement
    updateTimer();

    // Mettre à jour toutes les secondes
    intervalRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, userStatus]);

  // Fonction pour formater le temps restant
  const formatTimeRemaining = (ms: number | null): string => {
    if (ms === null) return '';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Fonction pour réinitialiser le timer (pour les tests)
  const resetTimer = () => {
    sessionStorage.removeItem('viewing_start_time');
    startTimeRef.current = Date.now();
    sessionStorage.setItem('viewing_start_time', startTimeRef.current.toString());
    setHasExceeded(false);
    setTimeRemaining(FIFTEEN_MINUTES_MS);
  };

  return {
    timeRemaining,
    hasExceeded,
    formatTimeRemaining: () => formatTimeRemaining(timeRemaining),
    resetTimer,
  };
}

