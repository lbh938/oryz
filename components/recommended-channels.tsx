'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { channels } from '@/lib/channels';
import { getHistoryChannelIds } from '@/lib/watch-history';
import { getFavoriteIds } from '@/lib/favorites';
import { Sparkles, ChevronRight } from 'lucide-react';
import { ContentCard } from './content-card';

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
        /* Channels Grid - Utilise ContentCard comme dans la page films */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 md:gap-6">
          {recommendations.map((channel) => {
            // Convertir le channel en format ContentItem pour ContentCard
            const contentItem = {
              id: channel.id,
              name: channel.name,
              description: channel.description || '',
              thumbnail: channel.thumbnail,
              url: `/watch/${channel.id}`,
              category: channel.category,
              isLive: channel.isLive,
              isNew: channel.isNew,
              isPopular: channel.isPopular,
              quality: channel.quality,
              viewCount: channel.viewCount,
              year: undefined,
              duration: undefined,
              rating: undefined,
              genre: [],
              type: 'channel' as const
            };
            return <ContentCard key={channel.id} content={contentItem} />;
          })}
        </div>
      )}

      <p className="text-center text-white/40 sm:text-white/50 text-[10px] sm:text-xs font-sans mt-3 sm:mt-4 px-2">
        Basé sur vos préférences et votre historique
      </p>
    </section>
  );
}

