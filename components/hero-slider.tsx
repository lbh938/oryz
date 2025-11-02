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
      <div className="relative h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] xl:h-[400px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#0F4C81]/10 to-[#3498DB]/10">
        {/* Background Image */}
        {currentHero.image_url && (
          <img
            src={currentHero.image_url}
            alt={currentHero.title}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

        {/* Content */}
        <div className="relative h-full flex flex-col justify-center px-6 sm:px-8 md:px-12 lg:px-16">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-bold text-white mb-2 sm:mb-3 md:mb-4 leading-tight">
            {currentHero.title}
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-4 sm:mb-6 md:mb-8 max-w-2xl line-clamp-2">
            {currentHero.subtitle}
          </p>
          <div>
            <Link
              href={currentHero.cta_url}
              className="inline-flex items-center gap-2 px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 bg-gradient-to-r from-[#0F4C81] to-[#3498DB] hover:from-[#0F4C81]/90 hover:to-[#3498DB]/90 text-white font-label font-bold rounded-lg transition-all shadow-lg shadow-[#3498DB]/30 text-sm sm:text-base md:text-lg"
            >
              {currentHero.cta_text}
            </Link>
          </div>
        </div>

        {/* Navigation Arrows (Desktop only) */}
        {heroes.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all opacity-0 group-hover:opacity-100"
              aria-label="Précédent"
            >
              <ChevronLeft className="h-6 w-6 lg:h-7 lg:w-7" />
            </button>
            <button
              onClick={goToNext}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all opacity-0 group-hover:opacity-100"
              aria-label="Suivant"
            >
              <ChevronRight className="h-6 w-6 lg:h-7 lg:w-7" />
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {heroes.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {heroes.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all ${
                index === currentIndex
                  ? 'w-8 h-2 bg-[#3498DB]'
                  : 'w-2 h-2 bg-white/30 hover:bg-white/50'
              } rounded-full`}
              aria-label={`Aller au slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

