'use client';

import { VideoPlayer } from '@/components/video-player';
import { IframePlayer } from '@/components/iframe-player';
import { getContentById } from '@/lib/content';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Radio, RefreshCw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { addToWatchHistory } from '@/lib/watch-history';
import { ShareButton } from '@/components/share-button';
import { LikeButton } from '@/components/like-button';
import { useSourceDetection } from '@/hooks/use-source-detection';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WatchPageProps {
  params: Promise<{ id: string }>;
}

export default function WatchPage({ params }: WatchPageProps) {
  const [id, setId] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState(0);
  const [sportUrl, setSportUrl] = useState<string | null>(null);
  const [sportMatchName, setSportMatchName] = useState<string | null>(null);

  useEffect(() => {
    params.then(p => setId(p.id));
    
    // Vérifier les paramètres URL pour les matches sportifs
    const searchParams = new URLSearchParams(window.location.search);
    const urlParam = searchParams.get('url');
    const typeParam = searchParams.get('type');
    const nameParam = searchParams.get('name');
    
    if (typeParam === 'sport' && urlParam) {
      setSportUrl(decodeURIComponent(urlParam));
      setSportMatchName(nameParam ? decodeURIComponent(nameParam) : null);
    }
  }, [params]);

  // Ajouter à l'historique quand la page charge
  useEffect(() => {
    if (id) {
      addToWatchHistory(id);
    }
  }, [id]);

  // Préparer les URLs pour la détection (doit être appelé AVANT tous les returns conditionnels)
  const content = id ? getContentById(id) : null;
  const currentUrl = content && (content.sources && content.sources.length > 0 
    ? content.sources[selectedSource]?.url 
    : content.url) || '';
  
  // Détection automatique du type de source (HLS vs iframe)
  // Toujours appeler le hook, même si on ne l'utilise pas (règle des Hooks React)
  const sourceDetection = useSourceDetection(currentUrl || sportUrl || '');
  const useHLS = sourceDetection.type === 'hls' && !sourceDetection.isLoading && !sourceDetection.error;

  if (!id) return null;

  // Si c'est un match sportif, utiliser l'URL fournie directement
  if (sportUrl) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-xl border-b border-border">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-center h-14 sm:h-16">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-[#3498DB]/10 hover:text-[#3498DB]"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                  <img src="/logo.png" alt="ORYZ STREAM" className="h-7 sm:h-8 md:h-9 w-auto" />
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="pt-16 sm:pt-20 pb-8 sm:pb-12">
          <div className="container max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
            {sportMatchName && (
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#0F4C81] to-[#3498DB] bg-clip-text text-transparent mb-2">
                  {sportMatchName}
                </h1>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold w-fit">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  EN DIRECT
                </span>
              </div>
            )}

            <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border/50">
              <IframePlayer src={sportUrl} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    notFound();
  }

  const hasMultipleSources = content.sources && content.sources.length > 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation - ORYZ Style */}
      <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-[#3498DB]/10 hover:text-[#3498DB]"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                <img src="/logo.png" alt="ORYZ STREAM" className="h-7 sm:h-8 md:h-9 w-auto" />
              </Link>
            </div>
            <div className="flex items-center gap-2">
              {content.isLive && (
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-600 text-white text-xs font-bold shadow-lg">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  LIVE
                </div>
              )}
              <LikeButton 
                contentId={content.id}
                contentType={content.type === 'movie' ? 'movie' : 'channel'}
                variant="compact"
                size="sm"
              />
              <ShareButton 
                channelId={content.id} 
                channelName={content.name}
                variant="icon"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16 sm:pt-20 pb-8 sm:pb-12">
        <div className="container max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
          {/* Source Selector - Dropdown pour les séries avec beaucoup d'épisodes */}
          {hasMultipleSources && (
            <div className="mb-3 sm:mb-4 flex items-center gap-2 justify-center flex-wrap">
              {/* Si plus de 5 sources, utiliser un dropdown scrollable, sinon utiliser les boutons */}
              {content.sources && content.sources.length > 5 ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="min-w-[200px] sm:min-w-[250px] justify-between bg-card border-border hover:border-[#3498DB] hover:bg-[#3498DB]/10"
                    >
                      <span className="truncate text-sm font-medium">
                        {content.sources[selectedSource]?.name || 'Sélectionner un épisode'}
                      </span>
                      <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    className="w-[200px] sm:w-[250px] max-h-[400px] overflow-y-auto scrollbar-thin"
                    align="center"
                  >
                    {content.sources.map((source, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => setSelectedSource(index)}
                        className={`cursor-pointer ${
                          selectedSource === index
                            ? 'bg-[#3498DB]/20 text-[#3498DB] font-semibold'
                            : ''
                        }`}
                      >
                        {source.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
              <div className="inline-flex items-center gap-1 p-1 rounded-full bg-card border border-border">
                {content.sources?.map((source, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSource(index)}
                    className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                      selectedSource === index
                        ? 'bg-gradient-to-r from-[#0F4C81] to-[#3498DB] text-white shadow-lg'
                        : 'text-muted-foreground hover:text-[#3498DB]'
                    }`}
                  >
                    {source.name}
                  </button>
                ))}
              </div>
              )}
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-border hover:border-[#3498DB] hover:bg-[#3498DB]/10 hover:text-[#3498DB] h-8 w-8"
                onClick={() => window.location.reload()}
                title="Recharger le lecteur"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {/* Player */}
          <div className="mb-8">
            <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border/50 relative">
              {/* Badge indicateur de qualité (HLS) */}
              {!sourceDetection.isLoading && useHLS && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="px-2 py-1 rounded-md bg-green-600/90 backdrop-blur-sm text-white text-xs font-semibold">
                    HD HLS
                  </span>
                </div>
              )}
              
              {/* Détection automatique : HLS prioritaire, iframe en fallback */}
              {sourceDetection.isLoading ? (
                <div className="flex items-center justify-center h-full bg-black">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3498DB] mx-auto mb-4"></div>
                    <p className="text-white/70 text-sm">Détection du type de source...</p>
                  </div>
                </div>
              ) : useHLS ? (
                // Utiliser VideoPlayer (HLS natif) si disponible - meilleure qualité
                <VideoPlayer 
                  src={sourceDetection.url} 
                  channelId={content.id} 
                />
              ) : (
                // Fallback vers IframePlayer si HLS non disponible
                <IframePlayer src={currentUrl} />
              )}
            </div>
          </div>

          {/* Content Info - Enriched */}
          <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            {/* Title & Badges */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#0F4C81] to-[#3498DB] bg-clip-text text-transparent">
                  {content.name}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  {content.isLive && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      LIVE
                    </span>
                  )}
                  {content.isNew && (
                    <span className="px-3 py-1 rounded-full bg-green-600 text-white text-xs font-bold">
                      NOUVEAU
                    </span>
                  )}
                  {content.isPopular && (
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                      POPULAIRE
                    </span>
                  )}
                </div>
              </div>

              {/* Meta Info - Year, Duration, Rating - Sans icônes */}
              {(content.year || content.duration || content.rating) && (
                <div className="flex items-center gap-4 sm:gap-6 flex-wrap text-sm text-white/70">
                  {content.year && (
                    <span className="font-medium">{content.year}</span>
                  )}
                  {content.duration && (
                    <span className="font-medium">{content.duration}</span>
                  )}
                  {content.rating && (
                    <span className="font-medium">{content.rating.toFixed(1)}/10</span>
                  )}
                  {hasMultipleSources && (
                    <span className="font-medium">{content.sources?.length} {content.sources?.length === 1 ? 'source' : 'sources'}</span>
                  )}
                </div>
              )}

              {/* Genres */}
              {content.genre && content.genre.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-white/50 font-medium">Genres:</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {content.genre.map((genre, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 rounded-md bg-[#3498DB]/20 text-[#3498DB] text-xs font-medium border border-[#3498DB]/30"
                      >
                        {genre}
                  </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {content.description && (
              <div className="space-y-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">Synopsis</h2>
                <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-3xl">
                  {content.description}
                </p>
              </div>
            )}

            {/* Category */}
            {content.category && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50 font-medium">Catégorie:</span>
                <span className="px-2.5 py-1 rounded-md bg-[#0F4C81]/30 text-[#3498DB] text-xs font-medium">
                  {content.category}
                </span>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
