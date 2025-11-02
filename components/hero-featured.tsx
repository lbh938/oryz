'use client';

import Link from 'next/link';
import { Play } from 'lucide-react';
import { Button } from './ui/button';

interface HeroFeaturedProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  href: string;
}

export function HeroFeatured({ title, subtitle, imageUrl, href }: HeroFeaturedProps) {
  return (
    <section className="relative h-[220px] sm:h-[280px] md:h-[350px] lg:h-[400px] overflow-hidden rounded-xl sm:rounded-2xl mt-3 sm:mt-0">
      {/* Image de fond */}
      <div className="absolute inset-0">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
      </div>

      {/* Contenu en bas à gauche */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 lg:p-10">
        <div className="max-w-2xl">
          {/* Titre */}
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-display font-bold text-white mb-2 sm:mb-3 uppercase">
            {title}
          </h1>

          {/* Sous-titre */}
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/90 font-sans mb-3 sm:mb-4 md:mb-6 max-w-xl line-clamp-2">
            {subtitle}
          </p>

          {/* Bouton */}
          <Link href={href}>
            <Button className="bg-[#3498DB] hover:bg-[#3498DB]/90 text-white font-label font-semibold text-xs sm:text-sm md:text-base px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 h-auto rounded-lg gap-1.5 sm:gap-2 shadow-xl">
              <Play className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 fill-current" />
              Regarder
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

