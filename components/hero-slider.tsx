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
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-play avec transition fluide
  useEffect(() => {
    if (!isAutoPlaying || heroes.length <= 1 || isTransitioning) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => (prev + 1) % heroes.length);
      // Réinitialiser l'état de transition après l'animation
      setTimeout(() => setIsTransitioning(false), 1000);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, heroes.length, autoPlayInterval, isTransitioning]);

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  const goToPrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + heroes.length) % heroes.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % heroes.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  if (heroes.length === 0) {
    return null;
  }

  const currentHero = heroes[currentIndex];

  return (
    <div className="relative w-full group" data-hero>
      {/* Hero Content */}
      <div className="relative h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] xl:h-[550px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#0F4C81]/10 to-[#3498DB]/10">
        {/* Background Images avec transition fluide */}
        {heroes.map((hero, index) => (
          <div
            key={hero.id || index}
            className={`absolute inset-0 transition-opacity duration-[1000ms] ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            style={{
              transitionTimingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
            }}
          >
            {hero.image_url && (
              <img
                src={hero.image_url}
                alt={hero.title}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
                loading={index === currentIndex || index === currentIndex + 1 || index === currentIndex - 1 ? 'eager' : 'lazy'}
              />
            )}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            
            {/* Content avec animation fluide style Netflix */}
            <div 
              className={`relative h-full flex flex-col justify-center px-6 sm:px-8 md:px-12 lg:px-16 ${
                index === currentIndex 
                  ? 'opacity-100 translate-x-0' 
                  : index < currentIndex 
                    ? 'opacity-0 -translate-x-8' 
                    : 'opacity-0 translate-x-8'
              }`}
              style={{
                transition: 'opacity 1000ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 1000ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                willChange: index === currentIndex ? 'auto' : 'opacity, transform'
              }}
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-bold text-white mb-2 sm:mb-3 md:mb-4 leading-tight">
                {hero.title}
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-4 sm:mb-6 md:mb-8 max-w-2xl line-clamp-2">
                {hero.subtitle}
              </p>
              <div>
                <Link
                  href={hero.cta_url}
                  className="inline-flex items-center gap-2 px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 bg-gradient-to-r from-[#0F4C81] to-[#3498DB] hover:from-[#0F4C81]/90 hover:to-[#3498DB]/90 text-white font-label font-bold rounded-lg transition-all shadow-lg shadow-[#3498DB]/30 text-sm sm:text-base md:text-lg"
                >
                  {hero.cta_text}
                </Link>
              </div>
            </div>
          </div>
        ))}

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

