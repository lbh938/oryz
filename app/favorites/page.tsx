'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import { channels } from '@/lib/channels';
import { getFavoriteIds } from '@/lib/favorites';
import { Heart, Tv } from 'lucide-react';
import Link from 'next/link';
import { FavoriteButton } from '@/components/favorite-button';

export default function FavoritesPage() {
  const [favoriteChannels, setFavoriteChannels] = useState<typeof channels>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les favoris
  useEffect(() => {
    const loadFavorites = () => {
      const favoriteIds = getFavoriteIds();
      const filtered = channels.filter(channel => favoriteIds.includes(channel.id));
      setFavoriteChannels(filtered);
      setIsLoading(false);
    };

    loadFavorites();

    // Écouter les changements
    const handleFavoritesChanged = () => {
      loadFavorites();
    };

    window.addEventListener('favoritesChanged', handleFavoritesChanged);
    return () => window.removeEventListener('favoritesChanged', handleFavoritesChanged);
  }, []);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="container max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 fill-current" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white uppercase">
            MES FAVORIS
          </h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground font-sans">
          {favoriteChannels.length === 0 
            ? "Vous n'avez pas encore ajouté de chaînes à vos favoris"
            : `${favoriteChannels.length} chaîne${favoriteChannels.length > 1 ? 's' : ''} dans vos favoris`
          }
        </p>
      </section>

      {/* Channels Grid */}
      <section className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          // Loading State
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-[#333333] rounded-xl aspect-video mb-3"></div>
                <div className="h-4 bg-[#333333] rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : favoriteChannels.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#0F4C81]/20 to-[#3498DB]/20 mb-6">
              <Heart className="w-10 h-10 text-[#3498DB]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-3 uppercase">
              AUCUN FAVORI
            </h3>
            <p className="text-muted-foreground font-sans mb-8 max-w-md mx-auto">
              Commencez à ajouter vos chaînes préférées en cliquant sur le ❤️ sur chaque chaîne
            </p>
            <Link 
              href="/channels"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#3498DB] hover:bg-[#3498DB]/90 text-white font-label font-semibold rounded-lg transition-all shadow-lg shadow-[#3498DB]/30"
            >
              <Tv className="h-5 w-5" />
              Découvrir les chaînes
            </Link>
          </div>
        ) : (
          // Favorites Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {favoriteChannels.map((channel) => (
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
                    
                    {/* Bouton Favori */}
                    <FavoriteButton 
                      channelId={channel.id} 
                      variant="card" 
                      size="sm"
                    />
                    
                    {/* LIVE Badge */}
                    {channel.isLive && (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-label font-bold shadow-lg">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        LIVE
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-display font-bold text-sm text-white uppercase relative inline-block">
                      {channel.name}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#3498DB] transition-all duration-300 group-hover:w-full"></span>
                    </h3>
                    <p className="text-xs text-muted-foreground font-sans mt-1 line-clamp-2">
                      {channel.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  );
}

