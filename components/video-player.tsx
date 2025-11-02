'use client';

import { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
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

  // Fetch the actual stream URL if channelId is provided
  useEffect(() => {
    const fetchStreamUrl = async () => {
      if (channelId) {
        try {
          setIsLoading(true);
          setError(null);
          const response = await fetch(`/api/stream/${channelId}`);
          const data = await response.json();
          
          console.log('API Response:', data);
          
          if (data.success && data.streamUrl) {
            console.log('Stream URL found:', data.streamUrl);
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
    if (!isLoading && !playerRef.current && videoRef.current) {
      const videoElement = document.createElement('video-js');
      videoElement.classList.add('vjs-big-play-centered');
      videoElement.classList.add('vjs-default-skin');
      videoRef.current.appendChild(videoElement);

      const player = videojs(videoElement, {
        ...options,
        autoplay: true,
        controls: true,
        fluid: true,
        responsive: true,
        preload: 'auto',
        liveui: true,
        html5: {
          vhs: {
            overrideNative: true,
            withCredentials: false,
          },
          nativeVideoTracks: false,
          nativeAudioTracks: false,
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

      // Optional: You can also listen to player events
      player.on('play', () => {
        console.log('Video is playing');
      });
    }

    // Cleanup function
    return () => {
      if (playerRef.current) {
        if (!playerRef.current.isDisposed()) {
          playerRef.current.dispose();
        }
        playerRef.current = null;
      }
    };
  }, [streamUrl, options, isLoading]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-black/20 min-h-[400px]">
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
      <div className="flex items-center justify-center h-full bg-black/20 min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-primary" />
          <p className="text-lg font-semibold">Chargement du flux...</p>
        </div>
      </div>
    );
  }

  return (
    <div data-vjs-player className={className}>
      <div ref={videoRef} />
    </div>
  );
}

