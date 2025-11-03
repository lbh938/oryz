'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Channel } from '@/lib/channels';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { FavoriteButton } from './favorite-button';
import { ChannelBadges } from './channel-badges';

interface ChannelsSliderProps {
  channels: Channel[];
  title?: string;
  showTitle?: boolean;
}

export function ChannelsSlider({ channels, title = "Chaînes disponibles", showTitle = true }: ChannelsSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  // Nombre de cartes visibles selon la taille d'écran
  const [cardsVisible, setCardsVisible] = useState(2);
  
  useEffect(() => {
    const updateCardsVisible = () => {
      if (window.innerWidth >= 1024) { // lg
        setCardsVisible(5);
      } else if (window.innerWidth >= 768) { // md
        setCardsVisible(4);
      } else if (window.innerWidth >= 640) { // sm
        setCardsVisible(3);
      } else {
        setCardsVisible(2);
      }
    };

    updateCardsVisible();
    window.addEventListener('resize', updateCardsVisible);
    return () => window.removeEventListener('resize', updateCardsVisible);
  }, []);
  
  const maxIndex = Math.max(0, channels.length - cardsVisible);
  
  const nextSlide = () => {
    if (isAnimating) return;
    if (currentIndex >= maxIndex) return;
    setIsAnimating(true);
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
    // Réinitialiser après la transition
    setTimeout(() => setIsAnimating(false), 850);
  };
  
  const prevSlide = () => {
    if (isAnimating) return;
    if (currentIndex === 0) return;
    setIsAnimating(true);
    setCurrentIndex(prev => Math.max(prev - 1, 0));
    // Réinitialiser après la transition
    setTimeout(() => setIsAnimating(false), 850);
  };

  // Gestion du swipe tactile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }

    // Reset
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div className="space-y-6">
      {/* Header avec titre et boutons de navigation */}
      {(showTitle || channels.length > cardsVisible) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
          {/* Titre à gauche - affiché seulement si showTitle est true */}
          {showTitle && (
            <h3 className="text-lg sm:text-xl md:text-2xl font-display font-bold text-white uppercase">
              {title}
            </h3>
          )}

          {/* Boutons de navigation à droite */}
          {channels.length > cardsVisible && (
            <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full bg-[#3498DB] text-white border-[#3498DB] hover:bg-[#3498DB]/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              onClick={prevSlide}
              disabled={isAnimating || currentIndex === 0}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full bg-[#3498DB] text-white border-[#3498DB] hover:bg-[#3498DB]/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              onClick={nextSlide}
              disabled={isAnimating || currentIndex >= maxIndex}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          )}
        </div>
      )}

      {/* Slider avec support tactile */}
      <div 
        className="relative overflow-hidden touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex gap-4 sm:gap-5 md:gap-6"
          style={{
            transform: `translateX(-${currentIndex * (100 / cardsVisible + 1.5)}%)`,
            transition: 'transform 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            willChange: 'transform'
          }}
        >
          {channels.map((channel) => (
            <div
              key={channel.id}
              className="flex-shrink-0 w-[calc(50%-0.625rem)] sm:w-[calc(33.333%-0.75rem)] md:w-[calc(25%-1rem)] lg:w-[calc(20%-1rem)]"
            >
              <Link 
                href={`/watch/${channel.id}`}
                className="block h-full"
              >
                <div className="group/card relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:shadow-2xl hover:shadow-[#3498DB]/30 hover:border-white/20 transition-all duration-300 ease-out h-full flex flex-col">
                  {/* Thumbnail */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-black/20 to-black/40 rounded-t-2xl flex-shrink-0">
                    <img
                      src={channel.thumbnail}
                      alt={channel.name}
                      className={`w-full h-full ${channel.name.includes('RMC') ? 'object-contain' : 'object-cover'} group-hover/card:scale-110 transition-transform duration-500 ease-out`}
                      loading="lazy"
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
                    
                    {/* Badges (Nouveau, Populaire, HD) */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between z-10">
                      <ChannelBadges channel={channel} variant="compact" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-4 flex flex-col flex-1">
                    <h3 className="font-display font-bold text-white text-sm sm:text-base line-clamp-2 group-hover/card:text-[#3498DB] transition-colors mb-2">
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
            </div>
          ))}
        </div>
      </div>
      
      {/* Indicateur de progression */}
      {channels.length > cardsVisible && (
        <div className="flex justify-center gap-2 mt-6">
          <div className="w-32 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#3498DB] rounded-full transition-all duration-500 shadow-lg shadow-[#3498DB]/50"
              style={{ 
                width: `${((currentIndex + cardsVisible) / channels.length) * 100}%` 
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

