/**
 * Script pour parser le planning de matches sportifs
 * Usage: node scripts/parse-sports-schedule.js <fichier-texte.txt>
 * 
 * Format attendu:
 * - JOURS DE LA SEMAINE (SUNDAY, MONDAY, etc.)
 * - Liste des chaînes (HD1 ENGLISH, BR1 BRAZILIAN, etc.)
 * - Matches: Heure | Nom du match | URL
 */

const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '../lib/sports-schedule.ts');

function parseSchedule(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const schedule = {
    channels: {},
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
      currentChannels = {};
      continue;
    }
    
    // Détecter une chaîne (format: HD1 ENGLISH ou BR1 BRAZILIAN)
    const channelMatch = line.match(/^(HD\d+|BR\d+)\s+(.+)$/i);
    if (channelMatch && currentDay) {
      const [, channelId, languages] = channelMatch;
      currentChannels[channelId] = languages;
      schedule.channels[channelId] = languages;
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

function generateTypeScriptFile(schedule) {
  let tsContent = `// Planning des matches sportifs généré automatiquement
export interface SportMatch {
  time: string;
  name: string;
  url: string;
}

export interface SportsSchedule {
  channels: Record<string, string>;
  matches: Record<string, SportMatch[]>;
}

export const sportsSchedule: SportsSchedule = {
  channels: ${JSON.stringify(schedule.channels, null, 2)},
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
`;

  return tsContent;
}

// Point d'entrée
const inputFile = process.argv[2];

if (!inputFile) {
  console.log(`
📋 Utilisation:
  node scripts/parse-sports-schedule.js <fichier-texte.txt>

📝 Le script va parser le fichier et créer lib/sports-schedule.ts
  `);
  process.exit(1);
}

if (!fs.existsSync(inputFile)) {
  console.error(`❌ Fichier non trouvé: ${inputFile}`);
  process.exit(1);
}

console.log(`📖 Lecture du fichier: ${inputFile}\n`);

const content = fs.readFileSync(inputFile, 'utf-8');
const schedule = parseSchedule(content);

console.log(`✅ Parsing terminé:`);
console.log(`   - Chaînes trouvées: ${Object.keys(schedule.channels).length}`);
Object.entries(schedule.matches).forEach(([day, matches]) => {
  console.log(`   - ${day}: ${matches.length} matches`);
});

const tsContent = generateTypeScriptFile(schedule);
fs.writeFileSync(outputPath, tsContent, 'utf-8');

console.log(`\n✨ Fichier généré: ${outputPath}`);
console.log(`   Total: ${Object.values(schedule.matches).flat().length} matches\n`);

