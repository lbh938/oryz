/**
 * Script pour ajouter un film automatiquement depuis TMDB
 * Usage: node scripts/add-movie-from-tmdb.js "Titre du film" "https://lien-embed.com"
 * 
 * Ce script:
 * 1. Recherche le film sur TMDB
 * 2. Télécharge l'affiche
 * 3. Génère l'entrée pour lib/movies.ts
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';

async function searchMovie(title) {
  if (!TMDB_API_KEY) {
    console.error('❌ TMDB_API_KEY non configurée. Ajoutez NEXT_PUBLIC_TMDB_API_KEY dans .env.local');
    return null;
  }

  const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&language=fr-FR`;
  
  try {
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const movie = data.results[0];
      const details = await getMovieDetails(movie.id);
      return details;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur:', error);
    return null;
  }
}

async function getMovieDetails(movieId) {
  const detailsUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=fr-FR`;
  
  try {
    const response = await fetch(detailsUrl);
    return await response.json();
  } catch (error) {
    console.error('Erreur:', error);
    return null;
  }
}

function formatDuration(minutes) {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}min`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}min`;
  }
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(filepath);
        });
      } else {
        reject(new Error(`Erreur ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

function generateMovieEntry(movie, embedUrl, language = 'VF') {
  const id = movie.title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') + `-${new Date(movie.release_date).getFullYear()}`;
  
  const year = new Date(movie.release_date).getFullYear();
  const duration = formatDuration(movie.runtime);
  const genres = movie.genres.map(g => `'${g.name}'`).join(', ');
  
  return `  {
    id: '${id}',
    title: '${movie.title.replace(/'/g, "\\'")}',
    description: '${(movie.overview || '').replace(/'/g, "\\'")}',
    thumbnail: '/images/movies/${id}.jpg',
    year: ${year},
    duration: ${duration ? `'${duration}'` : 'null'},
    genre: [${genres}],
    rating: ${(movie.vote_average / 10).toFixed(1)},
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: ${Math.floor(Math.random() * 30000) + 15000},
    sources: [
      {
        name: '${language}',
        url: '${embedUrl}',
        language: '${language}'
      }
    ]
  },`;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node scripts/add-movie-from-tmdb.js "Titre du film" "https://lien-embed.com" [VF|VOSTFR|VO]');
    process.exit(1);
  }
  
  const title = args[0];
  const embedUrl = args[1];
  const language = args[2] || 'VF';
  
  console.log(`🔍 Recherche du film "${title}" sur TMDB...`);
  
  const movie = await searchMovie(title);
  
  if (!movie) {
    console.error('❌ Film non trouvé sur TMDB');
    process.exit(1);
  }
  
  console.log(`✅ Film trouvé: ${movie.title} (${new Date(movie.release_date).getFullYear()})`);
  
  // Télécharger l'affiche
  if (movie.poster_path) {
    const posterUrl = `https://image.tmdb.org/t/p/original${movie.poster_path}`;
    const imagePath = path.join(__dirname, '../public/images/movies', `${movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${new Date(movie.release_date).getFullYear()}.jpg`);
    
    console.log(`📥 Téléchargement de l'affiche...`);
    try {
      await downloadImage(posterUrl, imagePath);
      console.log(`✅ Affiche téléchargée: ${imagePath}`);
    } catch (error) {
      console.error('⚠️  Erreur lors du téléchargement de l\'affiche:', error.message);
    }
  }
  
  // Générer l'entrée
  const entry = generateMovieEntry(movie, embedUrl, language);
  console.log('\n📝 Entrée à ajouter dans lib/movies.ts:\n');
  console.log(entry);
  console.log('\n✅ Copiez cette entrée dans lib/movies.ts');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { searchMovie, getMovieInfoByTitle: getMovieDetails };

