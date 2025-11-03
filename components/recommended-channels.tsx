'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { channels } from '@/lib/channels';
import { getHistoryChannelIds } from '@/lib/watch-history';
import { getFavoriteIds } from '@/lib/favorites';
import { Sparkles, ChevronRight } from 'lucide-react';
import { FavoriteButton } from './favorite-button';

/**
 * Algorithme de recommandation basé sur :
 * 1. Les catégories des chaînes regardées
 * 2. Les catégories des favoris
 * 3. Les chaînes populaires (LIVE)
 */
export function RecommendedChannels() {
  const [recommendations, setRecommendations] = useState<typeof channels>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = () => {
      const historyIds = getHistoryChannelIds();
      const favoriteIds = getFavoriteIds();
      
      // Récupérer les catégories de l'historique et des favoris
      const watchedChannels = channels.filter(ch => historyIds.includes(ch.id));
      const favoriteChannels = channels.filter(ch => favoriteIds.includes(ch.id));
      
      const watchedCategories = [...new Set(watchedChannels.map(ch => ch.category))];
      const favoriteCategories = [...new Set(favoriteChannels.map(ch => ch.category))];
      
      // Combiner les catégories
      const preferredCategories = [...new Set([...watchedCategories, ...favoriteCategories])];
      
      // Exclure les chaînes déjà vues ou en favoris
      const excludeIds = [...new Set([...historyIds, ...favoriteIds])];
      
      let recommended: typeof channels = [];
      
      if (preferredCategories.length > 0) {
        // Recommander des chaînes dans les catégories préférées
        recommended = channels.filter(
          ch => preferredCategories.includes(ch.category) && !excludeIds.includes(ch.id)
        );
      } else {
        // Si pas d'historique, recommander les chaînes LIVE
        recommended = channels.filter(
          ch => ch.isLive && !excludeIds.includes(ch.id)
        );
      }
      
      // Mélanger et limiter à 6
      const shuffled = recommended.sort(() => 0.5 - Math.random());
      setRecommendations(shuffled.slice(0, 6));
      setIsLoading(false);
    };

    loadRecommendations();

    // Écouter les changements
    const handleUpdate = () => {
      loadRecommendations();
    };

    window.addEventListener('historyChanged', handleUpdate);
    window.addEventListener('favoritesChanged', handleUpdate);
    
    return () => {
      window.removeEventListener('historyChanged', handleUpdate);
      window.removeEventListener('favoritesChanged', handleUpdate);
    };
  }, []);

  // Ne rien afficher si pas de recommandations
  if (!isLoading && recommendations.length === 0) {
    return null;
  }

  return (
    <section className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header - Mobile optimized */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6 px-1">
        <div className="flex items-center gap-2 sm:gap-3">
          <h2 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-display font-bold text-white uppercase tracking-tight">
            RECOMMANDÉ POUR VOUS
          </h2>
        </div>
        <Link 
          href="/channels"
          className="flex items-center gap-1 text-[#3498DB] hover:text-[#3498DB]/80 active:text-[#3498DB]/60 font-label text-xs sm:text-sm md:text-base transition-colors touch-manipulation"
          aria-label="Voir toutes les chaînes"
        >
          <span className="hidden sm:inline">Tout voir</span>
          <span className="sm:hidden">Voir</span>
          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Link>
      </div>

      {/* Loading State - Mobile optimized */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden h-full flex flex-col">
                <div className="aspect-[3/4] bg-gradient-to-br from-black/20 to-black/40 rounded-t-xl sm:rounded-t-2xl"></div>
                <div className="p-3 sm:p-4 flex flex-col flex-1">
                  <div className="h-3.5 sm:h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                  <div className="h-2.5 sm:h-3 bg-white/5 rounded w-1/2 mt-auto"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Channels Grid - Mobile First Design (Apple/Netflix/Disney+ style) */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {recommendations.map((channel) => (
            <Link 
              key={channel.id}
              href={`/watch/${channel.id}`}
              className="block group active:scale-95 transition-transform duration-150"
            >
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:shadow-xl hover:shadow-[#3498DB]/20 sm:hover:shadow-2xl sm:hover:shadow-[#3498DB]/30 hover:border-white/20 active:border-[#3498DB]/40 transition-all duration-300 h-full flex flex-col">
                {/* Thumbnail - Mobile optimized */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-black/20 to-black/40 rounded-t-xl sm:rounded-t-2xl flex-shrink-0">
                  <img
                    src={channel.thumbnail}
                    alt={channel.name}
                    className="w-full h-full object-cover group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Overlay subtle pour mobile */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 sm:block hidden"></div>
                  
                  {/* Bouton Favori - Mobile friendly */}
                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 sm:opacity-0 transition-opacity duration-300">
                    <FavoriteButton 
                      channelId={channel.id} 
                      variant="card" 
                      size="sm"
                    />
                  </div>
                  
                  {/* Badges - Discrets pour mobile */}
                  <div className="absolute top-2 left-2 right-2 flex items-start justify-between z-10">
                    {channel.isLive && (
                      <div className="flex items-center gap-1 bg-red-600 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md text-[10px] sm:text-xs font-label font-bold">
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full animate-pulse" />
                        <span className="hidden sm:inline">LIVE</span>
                      </div>
                    )}
                  </div>

                  {/* Badge "Pour vous" - Discret style Apple/Netflix */}
                  <div className="absolute bottom-2 left-2 z-10">
                    <div className="px-2 py-1 rounded-md bg-[#3498DB]/90 backdrop-blur-md text-white text-[10px] sm:text-xs font-label font-semibold shadow-lg">
                      <span className="hidden sm:inline">Pour vous</span>
                      <span className="sm:hidden">⭐</span>
                    </div>
                  </div>
                </div>

                {/* Content - Mobile optimized typography */}
                <div className="p-3 sm:p-4 flex flex-col flex-1 min-h-[60px] sm:min-h-[70px]">
                  <h3 className="font-display font-bold text-white text-xs sm:text-sm md:text-base line-clamp-2 group-active:text-[#3498DB] group-hover:text-[#3498DB] transition-colors mb-1 sm:mb-2 leading-tight">
                    {channel.name}
                  </h3>
                  {channel.viewCount && (
                    <p className="text-[10px] sm:text-xs text-white/50 font-sans mt-auto leading-snug">
                      {channel.viewCount >= 1000 
                        ? `${(channel.viewCount / 1000).toFixed(1)}k vues`
                        : `${channel.viewCount} vues`
                      }
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <p className="text-center text-white/40 sm:text-white/50 text-[10px] sm:text-xs font-sans mt-3 sm:mt-4 px-2">
        Basé sur vos préférences et votre historique
      </p>
    </section>
  );
}

