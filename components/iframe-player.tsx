'use client';

import { useEffect, useRef, useState } from 'react';
import { usePopupBlocker } from '@/hooks/use-popup-blocker';

interface IframePlayerProps {
  src: string;
  className?: string;
}

export function IframePlayer({ src, className }: IframePlayerProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Activer le bloqueur de pop-ups pendant la lecture
  usePopupBlocker(true);

  // Détecter et traiter différents types d'URLs
  let proxyUrl = src;
  
  // Omega player (via API movix) : utiliser notre proxy avec protection intelligente
  if (src.includes('api.movix.club/api/omega')) {
    // Extraire l'URL originale depuis l'URL Omega
    try {
      const urlParams = new URL(src);
      const originalUrl = urlParams.searchParams.get('url');
      if (originalUrl) {
        // Utiliser notre proxy Omega avec protection intelligente
        proxyUrl = `/api/proxy/omega?url=${encodeURIComponent(originalUrl)}`;
      } else {
        proxyUrl = src;
      }
    } catch (e) {
      // Si erreur parsing, utiliser directement
      proxyUrl = src;
    }
  }
  // ShareCloudy: utiliser le proxy
  else if (src.includes('sharecloudy.com')) {
    proxyUrl = `/api/proxy/sharecloudy?url=${encodeURIComponent(src)}`;
  }
  // Wrappers score808 ou href.li: utiliser directement (l'iframe peut les gérer)
  // Les wrappers sont généralement conçus pour être embeddés dans des iframes
  else if (src.includes('score808.app/frame.html?link=') || src.includes('href.li/?')) {
    // Utiliser directement le wrapper (il est fait pour être embeddé)
    proxyUrl = src;
  }

  useEffect(() => {
    setError(false);
    setLoading(true);
    
    // Timeout pour détecter si l'iframe ne charge pas
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [src, proxyUrl]);

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
            sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
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
