'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { isFavorite, toggleFavorite } from '@/lib/favorites';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  channelId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card';
}

export function FavoriteButton({ 
  channelId, 
  className,
  size = 'md',
  variant = 'default'
}: FavoriteButtonProps) {
  const [isFav, setIsFav] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Charger l'état initial
  useEffect(() => {
    setIsFav(isFavorite(channelId));
  }, [channelId]);

  // Écouter les changements de favoris
  useEffect(() => {
    const handleFavoritesChanged = () => {
      setIsFav(isFavorite(channelId));
    };

    window.addEventListener('favoritesChanged', handleFavoritesChanged);
    return () => window.removeEventListener('favoritesChanged', handleFavoritesChanged);
  }, [channelId]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newState = toggleFavorite(channelId);
    setIsFav(newState);
    setIsAnimating(true);
    
    if (newState) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 800);
    }
    
    setTimeout(() => setIsAnimating(false), 400);
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  if (variant === 'card') {
    // Version pour les cartes (absolue en haut à droite)
    return (
      <button
        onClick={handleClick}
        className={cn(
          "absolute top-3 right-3 z-10",
          sizeClasses[size],
          "rounded-full backdrop-blur-md",
          "flex items-center justify-center",
          "transform transition-all duration-300 ease-out",
          "hover:scale-110 active:scale-90",
          isFav 
            ? "bg-red-500/90 text-white shadow-lg shadow-red-500/50" 
            : "bg-black/40 text-white hover:bg-black/60",
          isAnimating && (isFav ? "scale-125" : "scale-90"),
          className
        )}
        aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
      >
        <Heart 
          className={cn(
            iconSizes[size],
            "transform transition-all duration-300 ease-out",
            isFav ? "fill-current" : "",
            isAnimating && (isFav ? "scale-110" : "scale-75"),
            justAdded && "animate-[heartBeat_0.8s_ease-in-out]"
          )} 
        />
      </button>
    );
  }

  // Version par défaut (bouton standalone)
  return (
    <button
      onClick={handleClick}
      className={cn(
        sizeClasses[size],
        "rounded-full transform transition-all duration-300 ease-out",
        "flex items-center justify-center",
        "border-2",
        "hover:scale-110 active:scale-90",
        isFav 
          ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30" 
          : "bg-transparent border-[#3498DB] text-[#3498DB] hover:bg-[#3498DB] hover:text-white",
        isAnimating && (isFav ? "scale-125" : "scale-90"),
        className
      )}
      aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Heart 
        className={cn(
          iconSizes[size],
          "transform transition-all duration-300 ease-out",
          isFav ? "fill-current" : "",
          isAnimating && (isFav ? "scale-110" : "scale-75"),
          justAdded && "animate-[heartBeat_0.8s_ease-in-out]"
        )} 
      />
    </button>
  );
}

