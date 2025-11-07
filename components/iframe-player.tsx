'use client';

import { useEffect, useRef, useState } from 'react';
import { usePopupBlocker } from '@/hooks/use-popup-blocker';
import { useAdBlocker } from '@/hooks/use-ad-blocker';
import { getAppSetting } from '@/lib/admin-api';

interface IframePlayerProps {
  src: string;
  className?: string;
}

export function IframePlayer({ src, className }: IframePlayerProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sandboxEnabled, setSandboxEnabled] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Activer le bloqueur de pop-ups et de publicités pendant la lecture
  usePopupBlocker(true);
  useAdBlocker(true);

  // Détecter et traiter différents types d'URLs - DOIT ÊTRE AVANT LES useEffect
  let proxyUrl = src;
  
  // ShareCloudy: utiliser le proxy
  if (src.includes('sharecloudy.com')) {
    proxyUrl = `/api/proxy/sharecloudy?url=${encodeURIComponent(src)}`;
  }
  // Wrappers score808 ou href.li: utiliser directement (l'iframe peut les gérer)
  // Les wrappers sont généralement conçus pour être embeddés dans des iframes
  else if (src.includes('score808.app/frame.html?link=') || src.includes('href.li/?')) {
    // Utiliser directement le wrapper (il est fait pour être embeddé)
    proxyUrl = src;
  }

  // Charger le paramètre sandbox depuis la base de données
  // Par défaut, activer le sandbox pour la sécurité (même si le paramètre admin est désactivé)
  useEffect(() => {
    const loadSandboxSetting = async () => {
      try {
        const setting = await getAppSetting('iframe_sandbox_enabled');
        // Si le paramètre existe et est explicitement désactivé, respecter le choix
        // Sinon, activer par défaut pour la sécurité
        setSandboxEnabled(setting !== 'false'); // Actif par défaut, désactivé seulement si 'false'
      } catch (error) {
        // En cas d'erreur, activer par défaut pour la sécurité
        setSandboxEnabled(true);
      }
    };
    loadSandboxSetting();
  }, []);

  // Bloqueur renforcé pour les iframes sans sandbox - intercepte tous les messages
  useEffect(() => {
    if (!iframeRef.current) return;

    // Intercepter tous les messages de l'iframe
    const handleMessage = (event: MessageEvent) => {
      // Vérifier si le message vient de notre iframe
      try {
        // Bloquer les tentatives d'ouverture de fenêtres
        if (event.data && (
          typeof event.data === 'object' && (
            event.data.type === 'openWindow' ||
            event.data.action === 'open' ||
            event.data.method === 'open'
          ) ||
          typeof event.data === 'string' && (
            event.data.includes('window.open') ||
            event.data.includes('openWindow') ||
            event.data.includes('popup')
          )
        )) {
          console.warn('[Iframe Blocker] Tentative d\'ouverture bloquée:', event.data);
          event.stopPropagation();
          event.preventDefault();
          return false;
        }

        // Bloquer les redirections suspectes
        if (event.data && typeof event.data === 'object' && (
          event.data.type === 'redirect' ||
          event.data.action === 'redirect' ||
          event.data.url && !event.data.url.includes(window.location.origin)
        )) {
          console.warn('[Iframe Blocker] Redirection suspecte bloquée:', event.data);
          event.stopPropagation();
          return false;
        }
      } catch (e) {
        // Ignorer les erreurs
      }
    };

    window.addEventListener('message', handleMessage, true);

    // Intercepter les tentatives de navigation depuis l'iframe
    const originalOpen = window.open;
    window.open = function(...args: Parameters<typeof window.open>) {
      // Si appelé depuis un contexte suspect, bloquer
      const stack = new Error().stack || '';
      const urlString = args[0] ? String(args[0]) : '';
      if (stack.includes('iframe') || urlString.includes('ad') || urlString.includes('popup')) {
        console.warn('[Iframe Blocker] window.open bloqué:', args[0]);
        return null;
      }
      return originalOpen.apply(window, args);
    };

    return () => {
      window.removeEventListener('message', handleMessage, true);
      window.open = originalOpen;
    };
  }, [src]); // Utiliser src au lieu de proxyUrl pour éviter l'erreur d'initialisation

  useEffect(() => {
    setError(false);
    setLoading(true);
    
    // Timeout pour détecter si l'iframe ne charge pas
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [src]);

  if (!src) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center bg-black ${className}`}>
        <p className="text-white">Aucune URL de vidéo disponible</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3498DB]"></div>
        </div>
      )}
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center p-4">
            <p className="text-white mb-2">Erreur de chargement</p>
            <p className="text-white/60 text-sm mb-4 break-all">{src}</p>
            <button
              onClick={() => setError(false)}
              className="px-4 py-2 bg-[#3498DB] text-white rounded-lg hover:bg-[#3498DB]/90"
            >
              Réessayer
            </button>
          </div>
        </div>
      ) : (
        <iframe
            key={proxyUrl}
            ref={iframeRef}
            src={proxyUrl}
            className="absolute inset-0 w-full h-full"
            scrolling="no"
            frameBorder="0"
            allowFullScreen
            style={{ border: 'none' }}
            referrerPolicy="no-referrer-when-downgrade"
            {...(sandboxEnabled ? {
              sandbox: "allow-scripts allow-same-origin allow-presentation allow-forms"
            } : {})}
            // Retirer loading="lazy" pour les TV - charger immédiatement
            onLoad={() => {
              setLoading(false);
            }}
            onError={() => {
              setError(true);
              setLoading(false);
            }}
          />
      )}
    </div>
  );
}
