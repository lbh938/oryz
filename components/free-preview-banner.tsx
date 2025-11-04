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
    <div className="fixed top-20 left-0 right-0 z-50 px-4 sm:px-6">
      <Card className={`max-w-4xl mx-auto border-2 ${
        isLowTime 
          ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/50' 
          : 'bg-gradient-to-r from-[#3498DB]/20 to-[#0F4C81]/20 border-[#3498DB]/50'
      } backdrop-blur-xl shadow-2xl`}>
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                isLowTime ? 'bg-red-500/20' : 'bg-[#3498DB]/20'
              }`}>
                {isLowTime ? (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <Clock className="h-5 w-5 text-[#3498DB]" />
                )}
              </div>
              <div>
                <p className="text-white font-label font-semibold text-sm sm:text-base">
                  {isLowTime ? 'Temps gratuit presque écoulé !' : 'Visionnage gratuit'}
                </p>
                <p className="text-white/70 text-xs sm:text-sm font-sans">
                  {isLowTime 
                    ? `Il reste ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''}` 
                    : `Temps restant : ${timeRemaining}`}
                </p>
              </div>
            </div>
            <Button
              onClick={onSubscribe}
              className="bg-gradient-to-r from-[#3498DB] to-[#0F4C81] hover:from-[#3498DB]/90 hover:to-[#0F4C81]/90 text-white font-label font-semibold h-10 sm:h-12 px-4 sm:px-6 whitespace-nowrap"
            >
              <Crown className="h-4 w-4 mr-2" />
              S'abonner maintenant
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

