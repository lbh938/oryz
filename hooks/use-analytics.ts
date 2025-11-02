'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackActiveVisitor, trackPageView } from '@/lib/admin-api';

/**
 * Hook pour tracker automatiquement les visiteurs et les vues de page
 */
export function useAnalytics() {
  const pathname = usePathname();
  const sessionIdRef = useRef<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Générer ou récupérer un session ID
    let sessionId = sessionStorage.getItem('oryz_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('oryz_session_id', sessionId);
    }
    sessionIdRef.current = sessionId;

    // Fonction pour tracker le visiteur actif
    const trackVisitor = () => {
      if (typeof window === 'undefined') return;

      trackActiveVisitor({
        session_id: sessionIdRef.current,
        user_agent: navigator.userAgent,
        current_page: window.location.pathname,
        last_seen: new Date().toISOString()
      });
    };

    // Tracker immédiatement
    trackVisitor();

    // Tracker toutes les 30 secondes pour maintenir la session active
    intervalRef.current = setInterval(trackVisitor, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Tracker les changements de page
  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) return;

    trackPageView({
      page_url: pathname,
      page_title: document.title,
      session_id: sessionIdRef.current,
      user_agent: navigator.userAgent,
      referrer: document.referrer
    });
  }, [pathname]);
}

