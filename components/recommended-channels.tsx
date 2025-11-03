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
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <h2 className="text-base sm:text-xl md:text-2xl font-display font-bold text-white uppercase">
            RECOMMANDÉ POUR VOUS
          </h2>
        </div>
        <Link 
          href="/channels"
          className="flex items-center gap-1 text-[#3498DB] hover:text-[#3498DB]/80 font-label text-sm sm:text-base transition-colors"
        >
          Tout voir
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden h-full flex flex-col">
                <div className="aspect-[3/4] bg-gradient-to-br from-black/20 to-black/40 rounded-t-2xl"></div>
                <div className="p-3 sm:p-4 flex flex-col flex-1">
                  <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-white/5 rounded w-1/2 mt-auto"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Channels Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 md:gap-6">
          {recommendations.map((channel) => (
            <Link 
              key={channel.id}
              href={`/watch/${channel.id}`}
              className="block group"
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:shadow-2xl hover:shadow-[#3498DB]/30 hover:border-white/20 transition-all duration-300 h-full flex flex-col">
                {/* Thumbnail */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-black/20 to-black/40 rounded-t-2xl flex-shrink-0">
                  <img
                    src={channel.thumbnail}
                    alt={channel.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Bouton Favori */}
                  <FavoriteButton 
                    channelId={channel.id} 
                    variant="card" 
                    size="sm"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 right-2 flex items-start justify-between z-10">
                    {channel.isLive && (
                      <div className="flex items-center gap-1.5 bg-red-600 text-white px-2 py-1 rounded-md text-xs font-label font-bold">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        LIVE
                      </div>
                    )}
                  </div>

                  {/* Badges bas */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between z-10">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#3498DB]/80 backdrop-blur-sm text-white text-xs font-label font-bold">
                      Pour vous
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-4 flex flex-col flex-1">
                  <h3 className="font-display font-bold text-white text-sm sm:text-base line-clamp-2 group-hover:text-[#3498DB] transition-colors mb-2">
                    {channel.name}
                  </h3>
                  {channel.viewCount && (
                    <p className="text-xs text-white/60 font-sans mt-auto">
                      {channel.viewCount.toLocaleString()} vues
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <p className="text-center text-muted-foreground text-xs sm:text-sm font-sans mt-3 sm:mt-4">
        Basé sur vos préférences et votre historique
      </p>
    </section>
  );
}

