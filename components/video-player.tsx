'use client';

import { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import { logger } from '@/lib/logger';
import { usePopupBlocker } from '@/hooks/use-popup-blocker';
import { useAdBlocker } from '@/hooks/use-ad-blocker';
import 'video.js/dist/video-js.css';
import '@videojs/themes/dist/sea/index.css';
import { AlertCircle } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  channelId?: string;
  options?: any;
  className?: string;
}

export function VideoPlayer({ src, channelId, options, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [isPWA, setIsPWA] = useState(false);
  
  // Activer le bloqueur de pop-ups et de publicités pendant la lecture
  usePopupBlocker(true);
  useAdBlocker(true);

  // Détecter le mode PWA
  useEffect(() => {
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true ||
                          document.referrer.includes('android-app://');
      setIsPWA(isStandalone);
      
      // Log pour debug
      if (isStandalone) {
        console.log('🎬 VideoPlayer: Mode PWA détecté');
        console.log('🔊 Audio:', !isStandalone ? 'Muté au départ' : 'Activé');
        console.log('▶️ Autoplay:', isStandalone ? 'Direct' : 'Muté');
      }
    };
    checkPWA();
  }, []);

  // Fetch the actual stream URL if channelId is provided
  useEffect(() => {
    const fetchStreamUrl = async () => {
      if (channelId) {
        try {
          setIsLoading(true);
          setError(null);
          const response = await fetch(`/api/stream/${channelId}`);
          const data = await response.json();
          
          if (data.success && data.streamUrl) {
            setStreamUrl(data.streamUrl);
          } else {
            setError(
              data.error || 'Impossible de récupérer le flux vidéo. Le site source pourrait être inaccessible.'
            );
          }
        } catch (err) {
          console.error('Error fetching stream URL:', err);
          setError('Erreur lors de la récupération du flux vidéo.');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchStreamUrl();
  }, [channelId]);

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    // En PWA, attendre un peu plus pour éviter les conflits de montage
    if (!isLoading && !playerRef.current && videoRef.current) {
      // En PWA, ajouter un petit délai pour stabiliser le DOM
      const initDelay = isPWA ? 100 : 0;
      
      const initTimer = setTimeout(() => {
        if (!videoRef.current || playerRef.current) return;
        
        const videoElement = document.createElement('video-js');
        videoElement.classList.add('vjs-big-play-centered');
        videoElement.classList.add('vjs-default-skin');
        videoRef.current.appendChild(videoElement);

        const player = videojs(videoElement, {
          ...options,
          autoplay: isPWA ? true : 'muted', // Autoplay direct en PWA
          muted: !isPWA, // Ne pas muter en PWA
          controls: true,
          fluid: true,
          responsive: true,
          preload: 'auto',
          liveui: true,
          playsinline: true, // Important pour mobile
          // En PWA, désactiver certaines optimisations qui peuvent causer des bugs
          techOrder: isPWA ? ['html5'] : undefined, // Forcer HTML5 en PWA
          html5: {
            vhs: {
              overrideNative: !isPWA, // Utiliser natif en PWA pour meilleures performances
              withCredentials: false,
              enableLowInitialPlaylist: isPWA, // Démarrage plus rapide en PWA
              smoothQualityChange: isPWA, // Transitions fluides en PWA
              bandwidth: isPWA ? 5000000 : undefined, // Bande passante optimisée en PWA
            },
            nativeVideoTracks: isPWA, // Utiliser natif en PWA
            nativeAudioTracks: isPWA,
            nativeTextTracks: false,
          },
          sources: [
            {
              src: streamUrl,
              type: 'application/x-mpegURL',
            },
          ],
        });

        playerRef.current = player;

      // Error handling
      player.on('error', () => {
        const error = player.error();
        if (error) {
          console.error('Video player error:', error);
          setError(
            error.code === 4
              ? 'Le flux vidéo n\'est pas disponible pour le moment. Veuillez réessayer plus tard.'
              : `Erreur de lecture: ${error.message || 'Code ' + error.code}`
          );
        }
      });

      player.on('loadstart', () => {
        setError(null);
      });

        // Gestion du son différente selon le mode
        if (!isPWA) {
        // Mode Web: Démuter automatiquement après le premier play
        let hasUnmuted = false;
        
        // Méthode 1: Démuter au premier clic utilisateur sur le lecteur (plus fiable)
        const unmuteOnInteraction = () => {
          if (!hasUnmuted && player.muted()) {
            try {
              player.muted(false);
              hasUnmuted = true;
              logger.debug('Video unmuted on user interaction');
            } catch (e) {
              logger.debug('Could not unmute on interaction');
            }
          }
        };

        // Écouter les interactions utilisateur
        player.on('click', unmuteOnInteraction);
        player.on('useractive', unmuteOnInteraction);
        player.on('play', () => {
          logger.debug('Video is playing');
          // Démuter automatiquement après la lecture commence
          if (!hasUnmuted && player.muted()) {
            setTimeout(() => {
              try {
                player.muted(false);
                hasUnmuted = true;
                logger.debug('Video automatically unmuted');
              } catch (e) {
                logger.debug('Could not unmute automatically');
              }
            }, 1000);
          }
        });

        // Méthode 2: Essayer de démuter quand la vidéo est prête (fallback)
        player.ready(() => {
          // Attendre que la vidéo soit vraiment prête
          player.one('canplay', () => {
            setTimeout(() => {
              if (player.muted() && !hasUnmuted) {
                try {
                  player.muted(false);
                  hasUnmuted = true;
                  logger.debug('Video unmuted on ready');
                } catch (e) {
                  logger.debug('Could not unmute on ready');
                }
              }
            }, 1500);
          });
        });
        } else {
          // Mode PWA: Le son est déjà activé dès le départ
          logger.debug('PWA mode: Audio enabled by default');
        }
      }, initDelay);

      // Cleanup function
      return () => {
        clearTimeout(initTimer);
        if (playerRef.current) {
          if (!playerRef.current.isDisposed()) {
            playerRef.current.dispose();
          }
          playerRef.current = null;
        }
      };
    }
  }, [streamUrl, options, isLoading, isPWA]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-black/20">
        <div className="text-center space-y-4 p-8">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <p className="text-lg font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-black/20">
        <div className="text-center space-y-4">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-primary" />
          <p className="text-lg font-semibold">Chargement du flux...</p>
        </div>
      </div>
    );
  }

  return (
    <div data-vjs-player className={className} style={{ width: '100%', height: '100%' }}>
      <div ref={videoRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

