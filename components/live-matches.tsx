'use client';

import { useEffect, useState } from 'react';
import { getLiveMatches, groupMatchesByTimeAndName, GroupedSportMatch } from '@/lib/sports-schedule';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Play, Radio, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LiveMatches() {
  const [liveMatches, setLiveMatches] = useState<GroupedSportMatch[]>([]);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateMatches = () => {
      const matches = getLiveMatches();
      const grouped = groupMatchesByTimeAndName(matches);
      setLiveMatches(grouped);
      
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };

    // Mettre à jour immédiatement
    updateMatches();

    // Mettre à jour toutes les minutes
    const interval = setInterval(updateMatches, 60000);

    return () => clearInterval(interval);
  }, []);

  if (liveMatches.length === 0) {
    return null;
  }

  const createMatchId = (matchName: string, url: string): string => {
    return `match-${matchName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${url.split('/').pop()}`;
  };

  return (
    <section className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8" data-live-matches>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Radio className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 animate-pulse" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#0F4C81] to-[#3498DB] bg-clip-text text-transparent">
              En Direct Maintenant
            </h2>
            <p className="text-xs sm:text-sm text-white/60 font-sans mt-0.5">
              {currentTime} • {liveMatches.length} match{liveMatches.length > 1 ? 'es' : ''} en cours
            </p>
          </div>
        </div>
        <Link href="/sports">
          <Button
            variant="outline"
            size="sm"
            className="border-[#3498DB] text-[#3498DB] hover:bg-[#3498DB]/10"
          >
            Voir tous
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 items-stretch">
        {liveMatches.slice(0, 8).map((match, index) => {
          const hasMultipleSources = match.sources.length > 1;
          const primarySource = match.sources[0];
          const matchId = createMatchId(match.name, primarySource.url);
          
          return (
            <Card
              key={`${match.name}-${index}`}
              className="overflow-hidden hover:shadow-2xl hover:shadow-red-500/30 hover:border-white/20 transition-all duration-300 border-white/10 bg-white/5 backdrop-blur-xl group relative h-full flex flex-col"
            >
              {/* Badge LIVE */}
              <div className="absolute top-3 right-3 z-10">
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold shadow-lg">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  LIVE
                </span>
              </div>

              <div className="p-4 sm:p-6 relative flex flex-col flex-1">
                {/* Heure */}
                <div className="flex items-center gap-2 text-[#3498DB] mb-3 pr-20">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span className="font-bold text-sm">{match.time}</span>
                </div>

                {/* Nom du match */}
                <h3 className="text-white font-bold text-base sm:text-lg mb-3 line-clamp-2 group-hover:text-[#3498DB] transition-colors pr-2 flex-grow">
                  {match.name}
                </h3>

                {/* Nombre de sources */}
                {hasMultipleSources && (
                  <div className="mb-3 flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-white/50 font-medium">
                      {match.sources.length} source{match.sources.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                {/* Actions - Toujours en bas */}
                <div className="mt-auto pt-2">
                  {hasMultipleSources ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-600/90 hover:to-red-700/90 text-white font-semibold"
                          size="sm"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Regarder
                          <ChevronDown className="h-4 w-4 ml-2 opacity-70" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-[250px] max-h-[300px] overflow-y-auto scrollbar-thin bg-[#1a1a1a] border-[#333333]"
                        align="end"
                      >
                        {match.sources.map((source, sourceIndex) => {
                          const sourceMatchId = createMatchId(match.name, source.url);
                          return (
                            <DropdownMenuItem key={sourceIndex} asChild>
                              <Link
                                href={`/watch/${encodeURIComponent(sourceMatchId)}?url=${encodeURIComponent(source.url)}&type=sport&name=${encodeURIComponent(match.name)}`}
                                className="cursor-pointer flex items-center gap-2 px-3 py-2 text-white hover:bg-[#3498DB]/20 hover:text-[#3498DB]"
                              >
                                <Play className="h-3 w-3" />
                                <span className="text-sm font-medium">
                                  {source.label || `Source ${sourceIndex + 1}`}
                                </span>
                              </Link>
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Link
                      href={`/watch/${encodeURIComponent(matchId)}?url=${encodeURIComponent(primarySource.url)}&type=sport&name=${encodeURIComponent(match.name)}`}
                      className="block"
                    >
                      <Button
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-600/90 hover:to-red-700/90 text-white font-semibold"
                        size="sm"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Regarder
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {liveMatches.length > 8 && (
        <div className="mt-6 text-center">
          <Link href="/sports">
            <Button
              variant="outline"
              className="border-[#3498DB] text-[#3498DB] hover:bg-[#3498DB]/10"
            >
              Voir tous les {liveMatches.length} matches en direct
            </Button>
          </Link>
        </div>
      )}
    </section>
  );
}

