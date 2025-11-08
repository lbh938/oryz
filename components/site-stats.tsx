'use client';

import { useEffect, useState } from 'react';
import { Tv, Users, Clock, Zap } from 'lucide-react';
import { channels } from '@/lib/channels';

interface Stat {
  icon: React.ElementType;
  value: string;
  label: string;
  color: string;
}

export function SiteStats() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Calculer les statistiques réelles
    const totalChannels = channels.length;
    const liveChannels = channels.filter(ch => ch.isLive).length;
    const totalViews = channels.reduce((sum, ch) => sum + (ch.viewCount || 0), 0);
    const hdChannels = channels.filter(ch => ch.quality === 'HD' || ch.quality === '4K').length;

    setStats([
      {
        icon: Tv,
        value: `${totalChannels}+`,
        label: 'Chaînes disponibles',
        color: 'text-[#3498DB]'
      },
      {
        icon: Zap,
        value: `${liveChannels}`,
        label: 'Chaînes TV en direct',
        color: 'text-red-500'
      },
      {
        icon: Users,
        value: `${Math.floor(totalViews / 1000)}K+`,
        label: 'Spectateurs',
        color: 'text-green-500'
      },
      {
        icon: Clock,
        value: '24/7',
        label: 'Streaming continu',
        color: 'text-purple-500'
      }
    ]);

    // Animation d'apparition
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <section className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white uppercase mb-2 sm:mb-3">
            ORYZ EN CHIFFRES
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-sans max-w-2xl mx-auto">
            Rejoignez des milliers de spectateurs qui profitent du streaming en direct de qualité
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="relative group"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#333333] to-[#1a1a1a] border border-[#333333] hover:border-[#3498DB] transition-all duration-300 p-5 sm:p-6 md:p-8 hover:scale-105">
                  {/* Gradient overlay au hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0F4C81]/0 to-[#3498DB]/0 group-hover:from-[#0F4C81]/10 group-hover:to-[#3498DB]/10 transition-all duration-300 rounded-2xl" />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#0F4C81]/20 to-[#3498DB]/20 mb-3 sm:mb-4 ${stat.color}`}>
                      <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                    </div>

                    {/* Value */}
                    <div className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-1 sm:mb-2">
                      {stat.value}
                    </div>

                    {/* Label */}
                    <div className="text-xs sm:text-sm text-muted-foreground font-label uppercase tracking-wide">
                      {stat.label}
                    </div>
                  </div>

                  {/* Decoration */}
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#3498DB] rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-300" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Info */}
        <div className="mt-8 sm:mt-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-[#0F4C81]/20 to-[#3498DB]/20 border border-[#3498DB]/30">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-[#3498DB] fill-current animate-pulse" />
            <span className="text-xs sm:text-sm text-white font-label font-semibold">
              HD 1080p • Streaming Illimité
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

