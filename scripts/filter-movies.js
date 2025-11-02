const fs = require('fs');

// Lire le fichier movies.ts
const content = fs.readFileSync('lib/movies.ts', 'utf8');

// Extraire la partie movies
const moviesMatch = content.match(/export const movies: Movie\[\] = \[([\s\S]*)\];/);
if (!moviesMatch) {
  console.error('Impossible de trouver le tableau movies');
  process.exit(1);
}

const moviesPart = moviesMatch[1];

// Séparer par films complets
const filmRegex = /(\s*\{\s*id:[^}]+sources:\s*\[[^\]]+\]\s*\},?)/gs;
const films = moviesPart.match(filmRegex) || [];

console.log(`Nombre total de films: ${films.length}`);

// Filtrer les films qui n'utilisent PAS sharecloudy
const filteredFilms = films.filter(film => !film.includes('sharecloudy.com'));

console.log(`Films sans ShareCloudy: ${filteredFilms.length}`);

// Reconstruire le contenu
const header = content.substring(0, content.indexOf('export const movies: Movie[]'));
const footer = content.substring(content.indexOf('];', content.indexOf('export const movies: Movie[]')) + 2);

const newContent = header + 'export const movies: Movie[] = [\n' + filteredFilms.join('\n') + '\n];' + footer;

// Sauvegarder
fs.writeFileSync('lib/movies.ts', newContent, 'utf8');
console.log('Fichier mis à jour!');

