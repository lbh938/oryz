'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export function ClearCacheButton() {
  const [isClearing, setIsClearing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isPWA, setIsPWA] = useState(false);

  // Détecter le mode PWA au montage
  useState(() => {
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true ||
                          document.referrer.includes('android-app://');
      setIsPWA(isStandalone);
    };
    checkPWA();
  });

  const handleClearCache = async () => {
    setIsClearing(true);
    setStatus('idle');

    try {
      // 1. Vider le cache du Service Worker
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('✅ Cache Service Worker vidé');
      }

      // 2. Désinscrire le Service Worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(registration => registration.unregister())
        );
        console.log('✅ Service Worker désinscrit');
      }

      // 3. Vider le localStorage
      localStorage.clear();
      console.log('✅ localStorage vidé');

      // 4. Vider le sessionStorage
      sessionStorage.clear();
      console.log('✅ sessionStorage vidé');

      // 5. Vider les cookies (si possible)
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      console.log('✅ Cookies vidés');

      setStatus('success');

      // Réinscrire le Service Worker après 2 secondes
      setTimeout(async () => {
        if ('serviceWorker' in navigator) {
          try {
            await navigator.serviceWorker.register('/sw.js', { scope: '/' });
            console.log('✅ Service Worker réinscrit');
          } catch (error) {
            console.error('❌ Erreur réinscription SW:', error);
          }
        }

        // Recharger la page après 3 secondes
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }, 2000);

    } catch (error) {
      console.error('❌ Erreur lors du vidage du cache:', error);
      setStatus('error');
      setIsClearing(false);
    }
  };

  return (
    <div className="bg-[#1a1a1a] border border-[#333333] rounded-2xl p-6 sm:p-8 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 flex-shrink-0">
            <Trash2 className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-white mb-1">
              Vider le Cache {isPWA && '(PWA)'}
            </h3>
            <p className="text-sm text-white/60 font-sans">
              {isPWA 
                ? 'Videz le cache de la PWA pour résoudre les problèmes de lecture vidéo'
                : 'Videz le cache pour actualiser les données et améliorer les performances'
              }
            </p>
            {status === 'success' && (
              <div className="flex items-center gap-2 mt-2 text-green-500 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                <span>Cache vidé ! Rechargement...</span>
              </div>
            )}
            {status === 'error' && (
              <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Erreur lors du vidage du cache</span>
              </div>
            )}
          </div>
        </div>
        <Button
          onClick={handleClearCache}
          disabled={isClearing}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-label font-bold h-12 px-6 shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isClearing ? (
            <>
              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
              Vidage...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-5 w-5" />
              Vider le Cache
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

