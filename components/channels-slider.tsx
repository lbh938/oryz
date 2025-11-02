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
}

export function ChannelsSlider({ channels, title = "Chaînes disponibles" }: ChannelsSliderProps) {
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
  };
  
  const prevSlide = () => {
    if (isAnimating) return;
    if (currentIndex === 0) return;
    setIsAnimating(true);
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 700);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
          {/* Titre à gauche */}
          <h3 className="text-lg sm:text-xl md:text-2xl font-display font-bold text-white uppercase">
            {title}
          </h3>

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

      {/* Slider avec support tactile */}
      <div 
        className="relative overflow-hidden touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex gap-4 sm:gap-5 md:gap-6 transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / cardsVisible + 1.5)}%)`,
            transitionTimingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
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
                <div className="group/card relative overflow-hidden rounded-xl bg-[#333333] border border-[#333333] hover:border-[#3498DB] transition-all duration-300 hover:shadow-xl hover:shadow-[#3498DB]/20 h-full flex flex-col">
                  {/* Thumbnail - Plus grande */}
                  <div className="relative flex-1 overflow-hidden bg-gradient-to-br from-[#0F4C81]/10 to-[#3498DB]/10">
                    <img
                      src={channel.thumbnail}
                      alt={channel.name}
                      className={`w-full h-full ${channel.name.includes('RMC') ? 'object-contain' : 'object-cover'} group-hover/card:scale-110 transition-transform duration-700`}
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
                    
                    {/* Badges (Nouveau, Populaire, HD) */}
                    <div className="absolute bottom-2 left-2 right-2">
                      <ChannelBadges channel={channel} variant="compact" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-3 md:p-4">
                    <h3 className="font-display font-bold text-xs sm:text-sm text-white uppercase relative inline-block">
                      {channel.name}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#3498DB] transition-all duration-300 group-hover/card:w-full"></span>
                    </h3>
                    {channel.viewCount && (
                      <p className="text-xs text-muted-foreground font-sans mt-1">
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

