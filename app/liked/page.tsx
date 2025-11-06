'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/main-layout';
import { channels } from '@/lib/channels';
import { getLikedContentIds } from '@/lib/likes';
import { Heart, Tv } from 'lucide-react';
import Link from 'next/link';
import { LikeButton } from '@/components/like-button';
import { SkeletonGrid } from '@/components/skeleton-grid';

export default function LikedPage() {
  const [likedChannels, setLikedChannels] = useState<typeof channels>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLiked = () => {
      const likedIds = getLikedContentIds();
      const filtered = channels.filter(channel => likedIds.includes(channel.id));
      setLikedChannels(filtered);
      setIsLoading(false);
    };

    loadLiked();

    // Écouter les changements
    const handleLikeChanged = () => {
      loadLiked();
    };

    window.addEventListener('likeChanged', handleLikeChanged);
    return () => window.removeEventListener('likeChanged', handleLikeChanged);
  }, []);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="container max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 fill-current" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white uppercase">
            MES J'AIME
          </h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground font-sans">
          {likedChannels.length === 0 
            ? "Vous n'avez pas encore aimé de contenu"
            : `${likedChannels.length} contenu${likedChannels.length > 1 ? 's' : ''} aimé${likedChannels.length > 1 ? 's' : ''}`
          }
        </p>
      </section>

      {/* Channels Grid */}
      <section className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          <SkeletonGrid count={8} variant="card" />
        ) : likedChannels.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500/20 to-pink-500/20 mb-6">
              <Heart className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-3 uppercase">
              AUCUN J'AIME
            </h3>
            <p className="text-muted-foreground font-sans mb-8 max-w-md mx-auto">
              Commencez à aimer vos contenus préférés en cliquant sur le ❤️
            </p>
            <Link 
              href="/channels"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-500/90 hover:to-pink-500/90 text-white font-label font-semibold rounded-lg transition-all shadow-lg shadow-red-500/30"
            >
              <Tv className="h-5 w-5" />
              Découvrir les chaînes
            </Link>
          </div>
        ) : (
          // Liked Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {likedChannels.map((channel) => (
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
                    
                    {/* Badge "Aimé" */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <div className="flex items-center gap-1 text-red-500 text-xs">
                        <Heart className="h-3 w-3 fill-current" />
                        <span className="font-label font-bold">J'aime</span>
                      </div>
                    </div>
                    
                    {/* Bouton Like */}
                    <div className="absolute top-2 right-2">
                      <LikeButton 
                        contentId={channel.id}
                        contentType="channel"
                        size="sm"
                        showCount={false}
                      />
                    </div>
                    
                    {/* LIVE Badge */}
                    {channel.isLive && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-red-600 text-white text-xs font-label font-bold shadow-lg">
                        <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
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

