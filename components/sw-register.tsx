'use client';

import { useEffect, useState } from 'react';
import { logger } from '@/lib/logger';

export function SWRegister() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Enregistrer IMMÉDIATEMENT au chargement (navigateur ET PWA)
    const registerSW = async () => {
      // Vérifier HTTPS (sauf localhost)
      if (typeof window !== 'undefined') {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const isHttps = window.location.protocol === 'https:';
        
        if (!isLocalhost && !isHttps) {
          const errorMsg = '⚠️ ERREUR: HTTPS requis pour les notifications';
          console.error(errorMsg);
          setError(errorMsg);
          return;
        }

        // Détecter si on est en PWA
        const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;
        
        logger.debug('Mode', isPWA ? 'PWA' : 'navigateur');
      }

      if (!('serviceWorker' in navigator)) {
        console.error('❌ Service Worker non supporté');
        setError('Service Worker non supporté');
        return;
      }

      try {
        // Enregistrer le service worker
        const registration = await navigator.serviceWorker.register('/sw.js', { 
          scope: '/',
          updateViaCache: 'none'
        });
        
        // Forcer la mise à jour
        await registration.update();
        
        // Écouter les mises à jour
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                // Recharger pour utiliser la nouvelle version
                window.location.reload();
              }
            });
          }
        });

      } catch (error: any) {
        console.error('❌ Erreur SW:', error);
        setError(`Erreur: ${error.message}`);
      }
    };

    // Lancer l'enregistrement immédiatement
    registerSW();

    // Re-vérifier toutes les 30 secondes (au cas où)
    const interval = setInterval(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration('/').then((reg) => {
          if (!reg) {
            logger.warn('⚠️ Service Worker perdu, réenregistrement...');
            registerSW();
          }
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Afficher une erreur en développement
  if (error && process.env.NODE_ENV === 'development') {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'red',
        color: 'white',
        padding: '10px',
        zIndex: 9999,
        textAlign: 'center',
        fontSize: '12px'
      }}>
        {error}
      </div>
    );
  }

  return null;
}

