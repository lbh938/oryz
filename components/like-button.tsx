'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { hasLiked, toggleLike, getLikeCount } from '@/lib/likes';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  contentId: string;
  contentType: 'channel' | 'movie' | 'series';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact';
  showCount?: boolean;
}

export function LikeButton({ 
  contentId, 
  contentType,
  className,
  size = 'md',
  variant = 'default',
  showCount = true
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Charger l'état initial
  useEffect(() => {
    setIsLiked(hasLiked(contentId));
    setLikeCount(getLikeCount(contentId));
  }, [contentId]);

  // Écouter les changements
  useEffect(() => {
    const handleLikeChanged = (event: CustomEvent) => {
      if (event.detail.contentId === contentId) {
        setIsLiked(event.detail.liked);
      }
    };

    const handleCountChanged = (event: CustomEvent) => {
      if (event.detail.contentId === contentId) {
        setLikeCount(event.detail.count);
      }
    };

    window.addEventListener('likeChanged', handleLikeChanged as EventListener);
    window.addEventListener('likeCountChanged', handleCountChanged as EventListener);
    
    return () => {
      window.removeEventListener('likeChanged', handleLikeChanged as EventListener);
      window.removeEventListener('likeCountChanged', handleCountChanged as EventListener);
    };
  }, [contentId]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAnimating(true);
    const newState = toggleLike(contentId, contentType);
    setIsLiked(newState);
    
    // Animation
    setTimeout(() => setIsAnimating(false), 600);
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

  if (variant === 'compact') {
    // Version compacte sans compteur
    return (
      <button
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300",
          "border-2",
          isLiked 
            ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30" 
            : "bg-transparent border-[#3498DB] text-[#3498DB] hover:bg-[#3498DB] hover:text-white",
          isAnimating && "scale-110",
          className
        )}
        aria-label={isLiked ? "Retirer des J'aime" : "Ajouter aux J'aime"}
      >
        <Heart 
          className={cn(
            "h-4 w-4 transition-all duration-300",
            isLiked ? "fill-current" : "",
            isAnimating && "animate-bounce"
          )} 
        />
        {showCount && likeCount > 0 && (
          <span className="text-sm font-label font-bold">
            {likeCount}
          </span>
        )}
      </button>
    );
  }

  // Version par défaut (bouton icon seul)
  return (
    <button
      onClick={handleClick}
      className={cn(
        sizeClasses[size],
        "rounded-full transition-all duration-300 relative group",
        "flex items-center justify-center",
        "border-2",
        "hover:scale-110 active:scale-95",
        isLiked 
          ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30" 
          : "bg-transparent border-[#3498DB] text-[#3498DB] hover:bg-[#3498DB] hover:text-white",
        isAnimating && "animate-pulse",
        className
      )}
      aria-label={isLiked ? "Retirer des J'aime" : "Ajouter aux J'aime"}
    >
      <Heart 
        className={cn(
          iconSizes[size],
          "transition-all duration-300",
          isLiked ? "fill-current" : "",
          isAnimating && "scale-125"
        )} 
      />
      
      {/* Compteur en tooltip */}
      {showCount && likeCount > 0 && (
        <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-label font-bold rounded-full flex items-center justify-center shadow-lg ring-2 ring-background">
          {likeCount > 99 ? '99+' : likeCount}
        </div>
      )}
      
      {/* Tooltip */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-xs font-label rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {isLiked ? "J'aime" : "J'aime"}
      </div>
    </button>
  );
}

