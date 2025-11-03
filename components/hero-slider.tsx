'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { HeroConfig } from '@/lib/admin-api';

interface HeroSliderProps {
  heroes: HeroConfig[];
  autoPlayInterval?: number; // en millisecondes
}

export function HeroSlider({ heroes, autoPlayInterval = 5000 }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying || heroes.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroes.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, heroes.length, autoPlayInterval]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false); // Arrêter l'auto-play quand l'utilisateur interagit
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + heroes.length) % heroes.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % heroes.length);
    setIsAutoPlaying(false);
  };

  if (heroes.length === 0) {
    return null;
  }

  const currentHero = heroes[currentIndex];

  return (
    <div className="relative w-full group">
      {/* Hero Content */}
      <div className="relative h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] xl:h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#0F4C81]/10 to-[#3498DB]/10 shadow-2xl shadow-black/30">
        {/* Background Image avec transition smooth */}
        {heroes.map((hero, index) => (
          <img
            key={hero.id || index}
            src={hero.image_url}
            alt={hero.title}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ))}

        {/* Gradient Overlay avec effet de profondeur */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent z-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-20" />

        {/* Content avec animation */}
        <div className="relative h-full flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 z-30">
          <div 
            key={currentIndex}
            className="animate-in fade-in slide-in-from-right-4 duration-700"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-bold text-white mb-2 sm:mb-3 md:mb-4 leading-tight drop-shadow-2xl">
              {currentHero.title}
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/95 mb-4 sm:mb-6 md:mb-8 max-w-2xl line-clamp-3 drop-shadow-lg">
              {currentHero.subtitle}
            </p>
            <div>
              <Link
                href={currentHero.cta_url}
                className="inline-flex items-center gap-2 px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 bg-gradient-to-r from-[#0F4C81] to-[#3498DB] hover:from-[#0F4C81]/90 hover:to-[#3498DB]/90 text-white font-label font-bold rounded-lg transition-all shadow-lg shadow-[#3498DB]/50 hover:shadow-xl hover:shadow-[#3498DB]/60 hover:scale-105 text-sm sm:text-base md:text-lg active:scale-95"
              >
                {currentHero.cta_text}
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Arrows - Toujours visibles avec glassmorphism */}
        {heroes.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-white transition-all shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 z-40 flex"
              aria-label="Précédent"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-white transition-all shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 z-40 flex"
              aria-label="Suivant"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator amélioré */}
      {heroes.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {heroes.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-10 h-2.5 bg-[#3498DB] shadow-lg shadow-[#3498DB]/50'
                  : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Aller au slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

