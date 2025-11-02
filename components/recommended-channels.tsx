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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-[#333333] rounded-xl aspect-video mb-2"></div>
              <div className="h-3 bg-[#333333] rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        /* Channels Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {recommendations.map((channel) => (
            <Link 
              key={channel.id}
              href={`/watch/${channel.id}`}
              className="group block"
            >
              <div className="relative overflow-hidden rounded-xl bg-[#333333] border border-[#333333] hover:border-[#3498DB] transition-all duration-300 hover:shadow-xl hover:shadow-[#3498DB]/20">
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-[#0F4C81]/10 to-[#3498DB]/10">
                  <img
                    src={channel.thumbnail}
                    alt={channel.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Badge "Recommandé" */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <div className="flex items-center gap-1 text-[#3498DB] text-xs">
                      <span className="font-label font-bold">Pour vous</span>
                    </div>
                  </div>
                  
                  {/* Bouton Favori */}
                  <FavoriteButton 
                    channelId={channel.id} 
                    variant="card" 
                    size="sm"
                  />
                  
                  {/* LIVE Badge */}
                  {channel.isLive && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-red-600 text-white text-xs font-label font-bold shadow-lg">
                      <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                      LIVE
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-2 sm:p-3">
                  <h3 className="font-display font-bold text-xs sm:text-sm text-white uppercase line-clamp-1 relative inline-block">
                    {channel.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#3498DB] transition-all duration-300 group-hover:w-full"></span>
                  </h3>
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

