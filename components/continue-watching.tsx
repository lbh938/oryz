'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { channels } from '@/lib/channels';
import { getRecentWatchHistory } from '@/lib/watch-history';
import { Clock, ChevronRight } from 'lucide-react';
import { FavoriteButton } from './favorite-button';

export function ContinueWatching() {
  const [recentChannels, setRecentChannels] = useState<typeof channels>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecent = () => {
      const history = getRecentWatchHistory(6); // Limiter à 6 chaînes
      const channelIds = history.map(h => h.channelId);
      const filtered = channels.filter(ch => channelIds.includes(ch.id));
      
      // Trier dans l'ordre de l'historique
      const sorted = channelIds
        .map(id => filtered.find(ch => ch.id === id))
        .filter(Boolean) as typeof channels;
      
      setRecentChannels(sorted);
      setIsLoading(false);
    };

    loadRecent();

    // Écouter les changements d'historique
    const handleHistoryChanged = () => {
      loadRecent();
    };

    window.addEventListener('historyChanged', handleHistoryChanged);
    return () => window.removeEventListener('historyChanged', handleHistoryChanged);
  }, []);

  // Ne rien afficher si pas d'historique
  if (!isLoading && recentChannels.length === 0) {
    return null;
  }

  return (
    <section className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-[#3498DB]" />
          <h2 className="text-base sm:text-xl md:text-2xl font-display font-bold text-white uppercase">
            CONTINUER À REGARDER
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
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl aspect-video mb-2"></div>
              <div className="h-3 bg-white/5 backdrop-blur-xl rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        /* Channels Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {recentChannels.map((channel) => (
            <Link 
              key={channel.id}
              href={`/watch/${channel.id}`}
              className="group block"
            >
              <div className="relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#3498DB] transition-all duration-300 hover:shadow-xl hover:shadow-[#3498DB]/20">
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-[#0F4C81]/10 to-[#3498DB]/10">
                  <img
                    src={channel.thumbnail}
                    alt={channel.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Badge "Vu récemment" */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <div className="flex items-center gap-1 text-white text-xs">
                      <Clock className="h-3 w-3" />
                      <span className="font-label">Récent</span>
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
        Reprenez où vous vous êtes arrêté
      </p>
    </section>
  );
}

