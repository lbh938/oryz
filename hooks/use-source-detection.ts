import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

export type SourceType = 'hls' | 'iframe' | 'unknown';

export interface SourceDetection {
  type: SourceType;
  url: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook pour détecter automatiquement le type de source vidéo
 * et extraire l'URL M3U8 si c'est Supervideo
 */
export function useSourceDetection(originalUrl: string): SourceDetection {
  const [detection, setDetection] = useState<SourceDetection>({
    type: 'unknown',
    url: originalUrl,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!originalUrl) {
      setDetection({
        type: 'iframe',
        url: originalUrl,
        isLoading: false,
        error: null,
      });
      return;
    }

    const detectSource = async () => {
      setDetection(prev => ({ ...prev, isLoading: true, error: null }));

      // 1. Vérifier si c'est déjà une URL M3U8 (HLS direct)
      if (originalUrl.includes('.m3u8') || originalUrl.includes('application/x-mpegURL')) {
        setDetection({
          type: 'hls',
          url: originalUrl,
          isLoading: false,
          error: null,
        });
        return;
      }

      // 2. Vérifier si c'est Supervideo - utiliser directement l'URL
      if (
        originalUrl.includes('supervideo.') ||
        originalUrl.includes('supervideo.cc') ||
        originalUrl.includes('supervideo.my')
      ) {
        // Utiliser directement l'URL Supervideo (si nécessaire, utilisez un proxy)
        setDetection({
          type: 'iframe',
          url: originalUrl,
          isLoading: false,
          error: null,
        });
        return;
      }

      // 3. Détecter Omega/Darkino (basé sur les patterns d'URL)
      const isOmega = originalUrl.includes('omega') || originalUrl.includes('omgplayer');
      const isDarkino = originalUrl.includes('darkino') || originalUrl.includes('dkn');

      // 4. Déterminer le type final
      let sourceType: SourceType = 'iframe';

      // Sources qui nécessitent iframe (embed players)
      const iframeSources = [
        'sharecloudy',
        'uqload',
        'vidzy',
        'voe',
        'filmoon',
        'netu',
        'vidmoly',
        'moovtop',
        'mikaylaarealike',
        'kakaflix',
        'multiup',
        'score808',
        'href.li',
      ];

      const needsIframe = iframeSources.some(source => originalUrl.includes(source));

      if (needsIframe) {
        sourceType = 'iframe';
      } else if (isOmega || isDarkino) {
        // Omega et Darkino peuvent être HLS ou iframe selon le contexte
        // Pour l'instant, on utilise iframe comme fallback
        sourceType = 'iframe';
      }

      setDetection({
        type: sourceType,
        url: originalUrl,
        isLoading: false,
        error: null,
      });
    };

    detectSource();
  }, [originalUrl]);

  return detection;
}
