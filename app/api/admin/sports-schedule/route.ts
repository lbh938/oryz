import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import fs from 'fs';
import path from 'path';

interface SportMatch {
  time: string;
  name: string;
  url: string;
}

interface ParsedSchedule {
  channelsByDay: Record<string, Record<string, string>>;
  matches: Record<string, SportMatch[]>;
}

/**
 * Parser le texte du planning sportif
 */
function parseSchedule(text: string): ParsedSchedule {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const schedule: ParsedSchedule = {
    channelsByDay: {},
    matches: {}
  };
  
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  let currentDay: string | null = null;
  let currentChannels: Record<string, string> = {};
  
  for (const line of lines) {
    const upperLine = line.toUpperCase();
    
    // Détecter un jour de la semaine
    const dayMatch = days.find(d => upperLine.includes(d));
    if (dayMatch) {
      currentDay = dayMatch;
      schedule.matches[currentDay] = [];
      schedule.channelsByDay[currentDay] = {};
      currentChannels = {};
      continue;
    }
    
    // Détecter une chaîne (format: HD1 ENGLISH ou BR1 BRAZILIAN)
    const channelMatch = line.match(/^(HD\d+|BR\d+)\s+(.+)$/i);
    if (channelMatch && currentDay) {
      const [, channelId, languages] = channelMatch;
      currentChannels[channelId] = languages;
      schedule.channelsByDay[currentDay][channelId] = languages;
      continue;
    }
    
    // Détecter un match (format: Heure   Nom du match | URL)
    const matchMatch = line.match(/^(\d{1,2}:\d{2})\s+(.+?)\s+\|\s+(https?:\/\/.+)$/);
    if (matchMatch && currentDay) {
      const [, time, matchName, url] = matchMatch;
      schedule.matches[currentDay].push({
        time,
        name: matchName.trim(),
        url: url.trim()
      });
    }
  }
  
  return schedule;
}

/**
 * Générer le contenu TypeScript du fichier sports-schedule.ts
 */
function generateTypeScriptFile(schedule: ParsedSchedule): string {
  return `// Planning des matches sportifs généré automatiquement
export interface SportMatch {
  time: string;
  name: string;
  url: string;
}

export interface SportsSchedule {
  channelsByDay: Record<string, Record<string, string>>;
  matches: Record<string, SportMatch[]>;
}

export const sportsSchedule: SportsSchedule = {
  channelsByDay: ${JSON.stringify(schedule.channelsByDay, null, 2)},
  matches: ${JSON.stringify(schedule.matches, null, 2)}
};

// Fonctions utilitaires
export function getMatchesByDay(day: string): SportMatch[] {
  return sportsSchedule.matches[day.toUpperCase()] || [];
}

export function getTodayMatches(): SportMatch[] {
  const today = new Date();
  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const todayName = dayNames[today.getDay()];
  return getMatchesByDay(todayName);
}

export function getUpcomingMatches(): SportMatch[] {
  const allMatches: Array<{day: string, match: SportMatch}> = [];
  Object.entries(sportsSchedule.matches).forEach(([day, matches]) => {
    matches.forEach(match => {
      allMatches.push({ day, match });
    });
  });
  
  // Trier par jour et heure
  const dayOrder = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  return allMatches
    .sort((a, b) => {
      const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return a.match.time.localeCompare(b.match.time);
    })
    .map(item => item.match);
}

/**
 * Détermine la durée maximale d'un match en minutes selon son type
 * Foot normal : 90 min + arrêts de jeu = 100 minutes
 * Ligue des Champions : 90 min + prolongations + tirs au but = 150 minutes
 */
export function getMatchMaxDuration(matchName: string): number {
  const nameLower = matchName.toLowerCase();
  
  // Détecter les matchs de Ligue des Champions
  if (
    nameLower.includes('champions league') ||
    nameLower.includes('ligue des champions') ||
    nameLower.includes('uefa champions') ||
    nameLower.includes('champions league')
  ) {
    return 150; // 90 min + prolongations possibles (30 min) + tirs au but (5 min) = 150 min
  }
  
  // Pour les autres matchs de foot, 100 minutes suffit
  // (90 minutes + arrêts de jeu max 10 minutes)
  return 100;
}

/**
 * Obtenir les matches en cours maintenant
 */
export function getLiveMatches(): SportMatch[] {
  const now = new Date();
  const dayOrder = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const currentDayIndex = now.getDay();
  const currentDay = dayOrder[currentDayIndex];
  const currentTime = \`\${now.getHours().toString().padStart(2, '0')}:\${now.getMinutes().toString().padStart(2, '0')}\`;
  
  const [currentHour, currentMin] = currentTime.split(':').map(Number);
  const currentMinutes = currentHour * 60 + currentMin;
  
  const liveMatches: SportMatch[] = [];
  
  // Vérifier les matches d'aujourd'hui
  const todayMatches = getMatchesByDay(currentDay);
  todayMatches.forEach(match => {
    const matchTime = match.time;
    const [matchHour, matchMin] = matchTime.split(':').map(Number);
    const matchMinutes = matchHour * 60 + matchMin;
    
    // Calculer la durée maximale pour ce match
    const maxDuration = getMatchMaxDuration(match.name);
    
    // Match en cours si l'heure actuelle est >= heure du match
    // et si le match n'est pas terminé (n'a pas dépassé sa durée maximale)
    const diff = currentMinutes - matchMinutes;
    if (diff >= 0 && diff <= maxDuration) {
      liveMatches.push(match);
    }
  });
  
  // Vérifier aussi les matches d'hier qui ont commencé tard et pourraient encore être en cours
  // (par exemple un match qui a commencé hier à 23:00 et continue après minuit)
  const previousDayIndex = (currentDayIndex - 1 + 7) % 7;
  const previousDay = dayOrder[previousDayIndex];
  const yesterdayMatches = getMatchesByDay(previousDay);
  
  yesterdayMatches.forEach(match => {
    const matchTime = match.time;
    const [matchHour, matchMin] = matchTime.split(':').map(Number);
    const matchMinutes = matchHour * 60 + matchMin;
    
    // Calculer la durée maximale pour ce match
    const maxDuration = getMatchMaxDuration(match.name);
    
    // Si le match d'hier a commencé après 21:00 (21h00 = 21*60 = 1260 minutes)
    // et que l'heure actuelle est tôt le matin (avant 4h = 4*60 = 240 minutes)
    // alors il pourrait encore être en cours
    if (matchMinutes >= 1260 && currentMinutes <= 240) {
      // Calculer le temps écoulé depuis le début du match
      // Temps écoulé = (24h - heure début match) + heure actuelle
      const elapsedMinutes = (24 * 60 - matchMinutes) + currentMinutes;
      if (elapsedMinutes <= maxDuration) {
        liveMatches.push(match);
      }
    }
  });
  
  return liveMatches;
}

/**
 * Interface pour un match groupé avec plusieurs sources
 */
export interface GroupedSportMatch {
  time: string;
  name: string;
  sport: string;
  sources: Array<{ url: string; label?: string }>;
}

/**
 * Détecter le sport d'un match basé sur son nom
 */
export function detectSport(matchName: string): string {
  const nameLower = matchName.toLowerCase();
  
  // Football / Soccer
  if (
    nameLower.includes('vs') || nameLower.includes('x') || nameLower.includes(' v ') ||
    nameLower.includes('football') || nameLower.includes('soccer') ||
    nameLower.includes('premier league') || nameLower.includes('la liga') ||
    nameLower.includes('serie a') || nameLower.includes('bundesliga') ||
    nameLower.includes('ligue 1') || nameLower.includes('champions league') ||
    nameLower.includes('europa league') || nameLower.includes('world cup') ||
    nameLower.includes('euro') || nameLower.includes('copa') ||
    nameLower.includes('fc') || nameLower.includes('united') ||
    nameLower.includes('city') || nameLower.includes('real') ||
    nameLower.includes('barcelona') || nameLower.includes('bayern') ||
    nameLower.includes('juventus') || nameLower.includes('milan') ||
    nameLower.includes('arsenal') || nameLower.includes('chelsea') ||
    nameLower.includes('liverpool') || nameLower.includes('manchester')
  ) {
    return 'Football';
  }
  
  // MotoGP / Motorcycle
  if (
    nameLower.includes('motogp') || nameLower.includes('moto2') ||
    nameLower.includes('moto3') || nameLower.includes('moto e') ||
    nameLower.includes('motoe') || nameLower.includes('motorcycle') ||
    nameLower.includes('portugal fp') || nameLower.includes('portugal qualifying') ||
    nameLower.includes('portugal sprint')
  ) {
    return 'MotoGP';
  }
  
  // Formula 1
  if (
    nameLower.includes('formula 1') || nameLower.includes('f1') ||
    nameLower.includes('grand prix') || nameLower.includes('gp:') ||
    nameLower.includes('qualifying') || nameLower.includes('sprint') ||
    nameLower.includes('practice') || nameLower.includes('fp1') ||
    nameLower.includes('fp2') || nameLower.includes('fp3')
  ) {
    return 'Formula 1';
  }
  
  // Basketball
  if (
    nameLower.includes('nba') || nameLower.includes('basketball') ||
    nameLower.includes('basket') || nameLower.includes('lakers') ||
    nameLower.includes('warriors') || nameLower.includes('celtics') ||
    nameLower.includes('bulls') || nameLower.includes('heat') ||
    nameLower.includes('clippers') || nameLower.includes('suns')
  ) {
    return 'Basketball';
  }
  
  // UFC / MMA / Boxing
  if (
    nameLower.includes('ufc') || nameLower.includes('mma') ||
    nameLower.includes('boxing') || nameLower.includes('fight night') ||
    nameLower.includes('prelims') || nameLower.includes('main event') ||
    nameLower.includes('vs') && (nameLower.includes('ufc') || nameLower.includes('boxing'))
  ) {
    return 'Combat Sports';
  }
  
  // Tennis
  if (
    nameLower.includes('tennis') || nameLower.includes('atp') ||
    nameLower.includes('wta') || nameLower.includes('wimbledon') ||
    nameLower.includes('french open') || nameLower.includes('us open') ||
    nameLower.includes('australian open') || nameLower.includes('roland garros')
  ) {
    return 'Tennis';
  }
  
  // Golf
  if (
    nameLower.includes('golf') || nameLower.includes('pga') ||
    nameLower.includes('masters') || nameLower.includes('dp world tour') ||
    nameLower.includes('championship')
  ) {
    return 'Golf';
  }
  
  // Rugby
  if (
    nameLower.includes('rugby') || nameLower.includes('six nations') ||
    nameLower.includes('world cup') && nameLower.includes('rugby')
  ) {
    return 'Rugby';
  }
  
  // Autres sports
  if (
    nameLower.includes('aflw') || nameLower.includes('australian football')
  ) {
    return 'Australian Football';
  }
  
  // Par défaut, considérer comme Football si c'est un match entre deux équipes
  if (nameLower.includes('x') || nameLower.includes('vs') || nameLower.includes(' v ')) {
    return 'Football';
  }
  
  return 'Autre';
}

/**
 * Grouper les matches par nom et heure (pour gérer les sources multiples)
 */
export function groupMatchesByTimeAndName(matches: SportMatch[]): GroupedSportMatch[] {
  const grouped = new Map<string, GroupedSportMatch>();
  
  matches.forEach(match => {
    const key = \`\${match.time}-\${match.name}\`;
    
    if (!grouped.has(key)) {
      grouped.set(key, {
        time: match.time,
        name: match.name,
        sport: detectSport(match.name),
        sources: []
      });
    }
    
    const group = grouped.get(key)!;
    
    // Extraire un label depuis l'URL (ex: hd9.php -> HD9)
    let label = match.url.split('/').pop()?.replace('.php', '').toUpperCase() || 'Source';
    
    // Améliorer les labels
    if (label.includes('HD')) {
      label = label.replace(/HD(\\d+)/, 'HD $1');
    } else if (label.includes('BR')) {
      label = label.replace(/BR(\\d+)/, 'BR $1');
    } else if (label.includes('SPORTTV')) {
      label = label.replace(/SPORTTV(\\d+)/, 'Sport TV $1');
    } else if (label.includes('ELEVEN')) {
      label = label.replace(/ELEVEN(\\d+)/, 'Eleven $1');
    }
    
    group.sources.push({
      url: match.url,
      label
    });
  });
  
  return Array.from(grouped.values());
}

/**
 * Grouper les matches par sport
 */
export function groupMatchesBySport(matches: GroupedSportMatch[]): Map<string, GroupedSportMatch[]> {
  const grouped = new Map<string, GroupedSportMatch[]>();
  
  matches.forEach(match => {
    const sport = match.sport || 'Autre';
    
    if (!grouped.has(sport)) {
      grouped.set(sport, []);
    }
    
    grouped.get(sport)!.push(match);
  });
  
  // Trier les matches dans chaque sport par heure
  grouped.forEach((matches, sport) => {
    matches.sort((a, b) => a.time.localeCompare(b.time));
  });
  
  return grouped;
}

/**
 * Ordre d'affichage des sports (priorité)
 */
const SPORT_ORDER = [
  'Football',
  'Basketball',
  'Formula 1',
  'MotoGP',
  'Combat Sports',
  'Tennis',
  'Golf',
  'Rugby',
  'Australian Football',
  'Autre'
];

/**
 * Trier les sports selon l'ordre de priorité
 */
export function sortSportsByPriority(sports: string[]): string[] {
  return sports.sort((a, b) => {
    const indexA = SPORT_ORDER.indexOf(a);
    const indexB = SPORT_ORDER.indexOf(b);
    
    // Si les deux sports sont dans l'ordre, les trier selon l'ordre
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    
    // Si un seul est dans l'ordre, le mettre en premier
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    
    // Sinon, trier alphabétiquement
    return a.localeCompare(b);
  });
}

/**
 * Obtenir les langues des chaînes pour un jour donné
 */
export function getChannelsByDay(day: string): Record<string, string> {
  return sportsSchedule.channelsByDay[day.toUpperCase()] || {};
}

/**
 * Obtenir la langue d'une chaîne spécifique pour un jour donné
 */
export function getChannelLanguage(day: string, channelId: string): string {
  const dayChannels = getChannelsByDay(day);
  return dayChannels[channelId.toUpperCase()] || '';
}

/**
 * Obtenir les prochains matches à venir (dans les prochaines 24h)
 */
export function getUpcomingMatchesIn24h(): SportMatch[] {
  const now = new Date();
  const currentDay = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][now.getDay()];
  const currentTime = \`\${now.getHours().toString().padStart(2, '0')}:\${now.getMinutes().toString().padStart(2, '0')}\`;
  const dayOrder = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const currentDayIndex = dayOrder.indexOf(currentDay);
  
  const upcomingMatches: Array<{day: string, match: SportMatch}> = [];
  
  // Matches d'aujourd'hui à venir
  const todayMatches = getMatchesByDay(currentDay);
  const [currentHour, currentMin] = currentTime.split(':').map(Number);
  const currentMinutes = currentHour * 60 + currentMin;
  
  todayMatches.forEach(match => {
    const [matchHour, matchMin] = match.time.split(':').map(Number);
    const matchMinutes = matchHour * 60 + matchMin;
    
    // Matches qui commencent dans les prochaines 24h
    if (matchMinutes >= currentMinutes || (matchMinutes < currentMinutes && matchMinutes + (24 * 60 - currentMinutes) < 24 * 60)) {
      upcomingMatches.push({ day: currentDay, match });
    }
  });
  
  // Matches des prochains jours (jusqu'à 24h)
  for (let i = 1; i < 7; i++) {
    const nextDayIndex = (currentDayIndex + i) % 7;
    const nextDay = dayOrder[nextDayIndex];
    const nextDayMatches = getMatchesByDay(nextDay);
    
    // Prendre seulement les premiers matches du jour suivant (jusqu'à compléter 24h)
    nextDayMatches.forEach(match => {
      upcomingMatches.push({ day: nextDay, match });
    });
    
    // Limiter à environ 24h de matches
    if (upcomingMatches.length > 50) break;
  }
  
  // Trier par jour et heure
  return upcomingMatches
    .sort((a, b) => {
      const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return a.match.time.localeCompare(b.match.time);
    })
    .slice(0, 30) // Limiter à 30 matches
    .map(item => item.match);
}
`;
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier si l'utilisateur est admin
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('is_super_admin')
      .eq('id', user.id)
      .maybeSingle();

    if (!adminData?.is_super_admin) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const { scheduleText } = await request.json();

    if (!scheduleText || typeof scheduleText !== 'string') {
      return NextResponse.json(
        { error: 'Le texte du planning est requis' },
        { status: 400 }
      );
    }

    // Parser le texte
    const schedule = parseSchedule(scheduleText);

    // Générer le contenu TypeScript
    const tsContent = generateTypeScriptFile(schedule);

    // Chemin vers le fichier sports-schedule.ts
    const filePath = path.join(process.cwd(), 'lib', 'sports-schedule.ts');

    // Écrire le fichier
    fs.writeFileSync(filePath, tsContent, 'utf-8');

    // Compter les matches par jour
    const matchesByDay: Record<string, number> = {};
    Object.entries(schedule.matches).forEach(([day, matches]) => {
      matchesByDay[day] = matches.length;
    });

    const totalMatches = Object.values(schedule.matches).flat().length;
    const totalChannels = Object.keys(schedule.channelsByDay).length;

    return NextResponse.json({
      success: true,
      message: 'Planning sportif mis à jour avec succès',
      stats: {
        totalMatches,
        totalChannels,
        matchesByDay
      }
    });
  } catch (error: any) {
    console.error('Error updating sports schedule:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour du planning' },
      { status: 500 }
    );
  }
}

