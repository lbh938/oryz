const fs = require('fs');
const path = require('path');

// Fonction de parsing identique à celle de l'API route
function parseSchedule(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const schedule = {
    channelsByDay: {},
    matches: {}
  };
  
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  let currentDay = null;
  let currentChannels = {};
  
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

// Générer le contenu TypeScript (identique à l'API route)
function generateTypeScriptFile(schedule) {
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

// Point d'entrée
const inputFile = process.argv[2] || 'sports-schedule-new.txt';
const outputFile = path.join(process.cwd(), 'lib', 'sports-schedule.ts');

try {
  console.log(`📖 Lecture du fichier: ${inputFile}`);
  const text = fs.readFileSync(inputFile, 'utf-8');
  
  console.log('🔍 Parsing du planning...');
  const schedule = parseSchedule(text);
  
  console.log('📝 Génération du fichier TypeScript...');
  const tsContent = generateTypeScriptFile(schedule);
  
  console.log(`💾 Écriture dans: ${outputFile}`);
  fs.writeFileSync(outputFile, tsContent, 'utf-8');
  
  // Stats
  const totalMatches = Object.values(schedule.matches).flat().length;
  const matchesByDay = {};
  Object.entries(schedule.matches).forEach(([day, matches]) => {
    matchesByDay[day] = matches.length;
  });
  
  console.log('\n✅ Planning sportif mis à jour avec succès!');
  console.log(`📊 Total de matches: ${totalMatches}`);
  console.log('📅 Matches par jour:');
  Object.entries(matchesByDay).forEach(([day, count]) => {
    console.log(`   ${day}: ${count} matches`);
  });
} catch (error) {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
}

