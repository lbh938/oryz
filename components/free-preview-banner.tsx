'use client';

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Clock, Crown, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface FreePreviewBannerProps {
  timeRemaining: string;
  minutesRemaining: number;
  onSubscribe: () => void;
}

export function FreePreviewBanner({ timeRemaining, minutesRemaining, onSubscribe }: FreePreviewBannerProps) {
  const isLowTime = minutesRemaining <= 3;

  return (
    <div className="fixed top-16 sm:top-20 left-0 right-0 z-50 px-3 sm:px-4 md:px-6">
      <Card className={`max-w-4xl mx-auto border-2 ${
        isLowTime 
          ? 'bg-gradient-to-r from-[#FF6B6B]/20 to-[#FFA500]/20 border-[#FF6B6B]/50' 
          : 'bg-gradient-to-r from-[#3498DB]/20 to-[#0F4C81]/20 border-[#3498DB]/50'
      } backdrop-blur-xl shadow-2xl`}>
        <div className="p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${
                isLowTime ? 'bg-[#FF6B6B]/20' : 'bg-[#3498DB]/20'
              }`}>
                {isLowTime ? (
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-[#FF6B6B]" />
                ) : (
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-[#3498DB]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-label font-bold text-xs sm:text-sm md:text-base truncate">
                  {isLowTime ? '🎁 Plus que quelques minutes !' : '🎁 Visionnage gratuit en cours'}
                </p>
                <p className="text-white/80 text-[10px] sm:text-xs md:text-sm font-sans">
                  {isLowTime 
                    ? `Il reste ${minutesRemaining} min${minutesRemaining > 1 ? 's' : ''} - Abonnez-vous pour continuer` 
                    : `Temps restant : ${timeRemaining}`}
                </p>
              </div>
            </div>
            <Button
              onClick={onSubscribe}
              className="w-full sm:w-auto bg-gradient-to-r from-[#3498DB] to-[#0F4C81] hover:from-[#3498DB]/90 hover:to-[#0F4C81]/90 text-white font-label font-bold text-xs sm:text-sm md:text-base h-9 sm:h-10 md:h-12 px-3 sm:px-4 md:px-6 whitespace-nowrap shadow-lg shadow-[#3498DB]/30 flex-shrink-0"
            >
              <Crown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Commencer l'essai gratuit</span>
              <span className="sm:hidden">S'abonner</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

