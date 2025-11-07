'use client';

import { useState } from 'react';
import { sportsSchedule, getMatchesByDay, groupMatchesByTimeAndName, GroupedSportMatch, getMatchMaxDuration, SportMatch, groupMatchesBySport, sortSportsByPriority } from '@/lib/sports-schedule';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ExternalLink, Play, ChevronDown, Lock, Crown } from 'lucide-react';
import Link from 'next/link';
import { MainLayout } from '@/components/main-layout';
import { useSubscriptionContext } from '@/contexts/subscription-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;
const DAY_NAMES_FR = {
  'SUNDAY': 'Dimanche',
  'MONDAY': 'Lundi',
  'TUESDAY': 'Mardi',
  'WEDNESDAY': 'Mercredi',
  'THURSDAY': 'Jeudi',
  'FRIDAY': 'Vendredi',
  'SATURDAY': 'Samedi'
};

type DayType = typeof DAYS[number];

export default function SportsPage() {
  // Vérifier l'abonnement de l'utilisateur
  const { status, isAdmin } = useSubscriptionContext();
  const hasPremiumAccess = isAdmin || 
                           status === 'admin' || 
                           status === 'trial' || 
                           status === 'kickoff' || 
                           status === 'pro_league' || 
                           status === 'vip';
  
  const [selectedDay, setSelectedDay] = useState<DayType>(() => {
    const today = new Date();
    return DAYS[today.getDay()] as DayType;
  });

  const allMatches = getMatchesByDay(selectedDay);
  
  // Filtrer les matchs terminés
  const now = new Date();
  const currentDayIndex = now.getDay();
  const selectedDayIndex = DAYS.indexOf(selectedDay);
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const [currentHour, currentMin] = currentTime.split(':').map(Number);
  const currentMinutes = currentHour * 60 + currentMin;
  
  // Fonction pour filtrer les matchs en diffusion pour un jour donné
  const getLiveMatchesForDay = (day: DayType): SportMatch[] => {
    const dayMatches = getMatchesByDay(day);
    const dayIndex = DAYS.indexOf(day);
    
    return dayMatches.filter(match => {
      const matchTime = match.time;
      const [matchHour, matchMin] = matchTime.split(':').map(Number);
      const matchMinutes = matchHour * 60 + matchMin;
      const maxDuration = getMatchMaxDuration(match.name);
      
      // Si c'est aujourd'hui, vérifier si le match est en cours
      if (dayIndex === currentDayIndex) {
        const diff = currentMinutes - matchMinutes;
        // Match en cours si l'heure actuelle est >= heure du match et <= durée max
        if (diff >= 0 && diff <= maxDuration) {
          return true; // Match en diffusion
        }
        return false; // Match terminé ou pas encore commencé
      }
      
      // Si c'est un jour futur, aucun match n'est en diffusion
      if (dayIndex > currentDayIndex || (dayIndex === 0 && currentDayIndex === 6)) {
        return false;
      }
      
      // Si c'est un jour passé, vérifier si les matchs sont encore en cours
      let diff: number;
      if (dayIndex < currentDayIndex) {
        // Jour passé récent (hier par exemple)
        const daysDiff = currentDayIndex - dayIndex;
        diff = (daysDiff * 24 * 60) + currentMinutes - matchMinutes;
      } else {
        // Dimanche passé (dayIndex = 0, currentDayIndex pourrait être 1-6)
        const daysDiff = 7 - currentDayIndex + dayIndex;
        diff = (daysDiff * 24 * 60) + currentMinutes - matchMinutes;
      }
      
      // Match encore en diffusion si le temps écoulé <= durée max
      if (diff >= 0 && diff <= maxDuration) {
        return true; // Match encore en diffusion
      }
      return false; // Match terminé
    });
  };

  const matches = allMatches.filter(match => {
    const matchTime = match.time;
    const [matchHour, matchMin] = matchTime.split(':').map(Number);
    const matchMinutes = matchHour * 60 + matchMin;
    const maxDuration = getMatchMaxDuration(match.name);
    
    // Si c'est aujourd'hui, vérifier si le match est terminé
    if (selectedDayIndex === currentDayIndex) {
      const diff = currentMinutes - matchMinutes;
      // Le match est terminé s'il a dépassé sa durée maximale
      if (diff < 0) return true; // Match à venir, on l'affiche
      if (diff > maxDuration) return false; // Match terminé, on le cache
      return true; // Match en cours ou à venir
    }
    
    // Si c'est un jour futur, afficher tous les matchs
    if (selectedDayIndex > currentDayIndex || (selectedDayIndex === 0 && currentDayIndex === 6)) {
      return true;
    }
    
    // Si c'est un jour passé, vérifier si les matchs sont terminés
    // Pour un jour passé, on calcule le temps écoulé
    let diff: number;
    if (selectedDayIndex < currentDayIndex) {
      // Jour passé récent (hier par exemple)
      const daysDiff = currentDayIndex - selectedDayIndex;
      diff = (daysDiff * 24 * 60) + currentMinutes - matchMinutes;
    } else {
      // Dimanche passé (selectedDayIndex = 0, currentDayIndex pourrait être 1-6)
      const daysDiff = 7 - currentDayIndex + selectedDayIndex;
      diff = (daysDiff * 24 * 60) + currentMinutes - matchMinutes;
    }
    
    // Si le match a dépassé sa durée maximale, on le cache
    if (diff > maxDuration) return false;
    return true;
  });
  
  const groupedMatches = groupMatchesByTimeAndName(matches);
  const matchesBySport = groupMatchesBySport(groupedMatches);
  const sortedSports = sortSportsByPriority(Array.from(matchesBySport.keys()));

  // Créer un ID unique pour chaque match (basé sur le nom)
  const createMatchId = (matchName: string, url: string): string => {
    return `match-${matchName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${url.split('/').pop()}`;
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-background py-8 sm:py-12">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          {/* Titre */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-10 bg-gradient-to-r from-[#0F4C81] to-[#3498DB] bg-clip-text text-transparent">
            Matches Sportifs en Direct
          </h1>

          {/* Navigation par jour */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {DAYS.map((day) => {
                const isToday = new Date().getDay() === DAYS.indexOf(day);
                const dayMatches = getMatchesByDay(day);
                const isActive = selectedDay === day;

                return (
                  <Button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    variant={isActive ? "default" : "outline"}
                    className={`
                      ${isActive 
                        ? 'bg-gradient-to-r from-[#0F4C81] to-[#3498DB] text-white border-none' 
                        : 'bg-card border-border hover:border-[#3498DB] text-white/70'
                      }
                      ${isToday ? 'ring-2 ring-[#3498DB]' : ''}
                      text-xs sm:text-sm font-medium px-3 sm:px-4 py-2
                    `}
                  >
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    {DAY_NAMES_FR[day]}
                    {(() => {
                      const liveMatchesForDay = getLiveMatchesForDay(day);
                      const liveCount = liveMatchesForDay.length;
                      if (liveCount > 0) {
                        return (
                          <span className="ml-2 px-1.5 py-0.5 rounded-full bg-red-600/80 text-white text-xs font-bold">
                            {liveCount}
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Matches du jour sélectionné */}
          {groupedMatches.length > 0 ? (
            <div className="space-y-8 sm:space-y-12">
              {sortedSports.map((sport) => {
                const sportMatches = matchesBySport.get(sport) || [];
                
                return (
                  <div key={sport} className="space-y-4 sm:space-y-6">
                    {/* Titre du sport */}
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#3498DB]/50 to-transparent"></div>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white whitespace-nowrap">
                        {sport}
                      </h2>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#3498DB]/50 to-transparent"></div>
                      <span className="text-white/60 text-sm sm:text-base font-label">
                        {sportMatches.length} match{sportMatches.length > 1 ? 'es' : ''}
                      </span>
                    </div>
                    
                    {/* Grille de matches pour ce sport */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
                      {sportMatches.map((match, index) => {
                const hasMultipleSources = match.sources.length > 1;
                const primarySource = match.sources[0];
                const matchId = createMatchId(match.name, primarySource.url);
                
                return (
                  <Card
                    key={`${match.name}-${index}`}
                    className="overflow-hidden hover:shadow-2xl hover:shadow-[#3498DB]/30 hover:border-white/20 transition-all duration-300 border-white/10 bg-white/5 backdrop-blur-xl group relative h-full flex flex-col"
                  >
                    <div className="p-4 sm:p-6 relative flex flex-col flex-1">
                      {/* Badge LIVE en haut à droite */}
                      <div className="absolute top-3 right-3 z-10">
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold shadow-lg">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          LIVE
                        </span>
                      </div>

                      {/* En-tête avec heure */}
                      <div className="flex items-center gap-2 text-[#3498DB] mb-3 pr-20">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span className="font-bold text-sm sm:text-base">{match.time}</span>
                      </div>

                      {/* Nom du match */}
                      <h3 className="text-white font-bold text-base sm:text-lg mb-3 line-clamp-2 group-hover:text-[#3498DB] transition-colors pr-2 flex-grow">
                        {match.name}
                      </h3>

                      {/* Nombre de sources */}
                      {hasMultipleSources && (
                        <div className="mb-3 flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-white/50 font-medium">
                            {match.sources.length} source{match.sources.length > 1 ? 's' : ''} disponible{match.sources.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}

                      {/* Actions - Toujours en bas */}
                      <div className="mt-auto pt-2">
                        {hasMultipleSources ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                className="w-full bg-gradient-to-r from-[#0F4C81] to-[#3498DB] hover:from-[#0F4C81]/90 hover:to-[#3498DB]/90 text-white font-semibold"
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
                              className="w-full bg-gradient-to-r from-[#0F4C81] to-[#3498DB] hover:from-[#0F4C81]/90 hover:to-[#3498DB]/90 text-white font-semibold"
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
                  </div>
                );
              })}
            </div>
          ) : (
            <Card className="p-8 sm:p-12 text-center border-border bg-card">
              <Calendar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-white/30" />
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Aucun match programmé
              </h3>
              <p className="text-white/60 text-sm sm:text-base">
                Aucun match n'est prévu pour le {DAY_NAMES_FR[selectedDay]}.
              </p>
            </Card>
          )}

          {/* Stats */}
          {groupedMatches.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-white/50 text-sm text-center">
                {groupedMatches.length} match{groupedMatches.length > 1 ? 'es' : ''} programmé{groupedMatches.length > 1 ? 's' : ''} le {DAY_NAMES_FR[selectedDay]}
                {matches.length > groupedMatches.length && ` (${matches.length} source${matches.length > 1 ? 's' : ''} au total)`}
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

