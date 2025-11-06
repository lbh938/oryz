'use client';

import React from 'react';

interface SkeletonGridProps {
  count?: number;
  variant?: 'card' | 'tile';
}

export function SkeletonGrid({ count = 6, variant = 'card' }: SkeletonGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden h-full flex flex-col ${variant === 'card' ? '' : ''}`}>
            <div className={`${variant === 'card' ? 'aspect-[3/4]' : 'aspect-video'} bg-gradient-to-br from-black/20 to-black/40`} />
            <div className="p-3 sm:p-4 flex flex-col flex-1">
              <div className="h-3.5 sm:h-4 bg-white/10 rounded w-3/4 mb-2" />
              <div className="h-2.5 sm:h-3 bg-white/5 rounded w-1/2 mt-auto" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


