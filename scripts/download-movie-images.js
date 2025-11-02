/**
 * Script pour télécharger automatiquement les images des films
 * Usage: node scripts/download-movie-images.js
 * 
 * Ce script parcourt tous les films dans lib/movies.ts et télécharge leurs affiches
 * depuis les URLs fournies dans le fichier (TMDB ou autres sources).
 * Aucune API nécessaire - utilise directement les URLs d'images !
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Lire le fichier movies.ts
const moviesFilePath = path.join(__dirname, '../lib/movies.ts');
const moviesContent = fs.readFileSync(moviesFilePath, 'utf-8');

// Extraire les informations des films avec leur thumbnail (peut être une URL complète)
const movieMatches = moviesContent.matchAll(/{\s*id:\s*'([^']+)',\s*title:\s*'([^']+)',[\s\S]*?thumbnail:\s*'([^']+)',[\s\S]*?year:\s*(\d+),/g);

const movies = [];
for (const match of movieMatches) {
  const thumbnail = match[3];
  movies.push({
    id: match[1],
    title: match[2],
    thumbnail: thumbnail,
    year: parseInt(match[4]),
    // Si c'est déjà une URL complète (commence par http), l'utiliser directement
    isFullUrl: thumbnail.startsWith('http')
  });
}

console.log(`📽️  Trouvé ${movies.length} films dans la bibliothèque\n`);

/**
 * Télécharger une image depuis une URL
 */
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const file = fs.createWriteStream(filepath);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200 || response.statusCode === 301 || response.statusCode === 302) {
        // Gérer les redirections
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          return downloadImage(redirectUrl, filepath).then(resolve).catch(reject);
        }
        
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(filepath);
        });
      } else if (response.statusCode === 404) {
        file.close();
        fs.unlinkSync(filepath);
        reject(new Error(`Image non trouvée (404)`));
      } else {
        file.close();
        fs.unlinkSync(filepath);
        reject(new Error(`Erreur ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });
  });
}

/**
 * Extraire l'URL de l'image depuis différentes sources
 */
function extractImageUrl(thumbnail) {
  // Si c'est déjà une URL complète (TMDB ou autre), la retourner
  if (thumbnail.startsWith('http://') || thumbnail.startsWith('https://')) {
    return thumbnail;
  }
  
  // Si c'est un chemin local qui commence par /images/movies/
  // on peut essayer de construire une URL TMDB si on a le nom du fichier
  if (thumbnail.startsWith('/images/movies/')) {
    const filename = path.basename(thumbnail);
    // Si le nom du fichier correspond à un pattern connu, on peut essayer TMDB
    // Mais sans API, on ne peut pas vraiment le faire
    return null;
  }
  
  return null;
}

/**
 * Télécharger l'affiche d'un film
 */
async function downloadMoviePoster(movie) {
  const imageDir = path.join(__dirname, '../public/images/movies');
  
  // Créer le dossier si il n'existe pas
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }
  
  // Chemin local de destination
  const localImagePath = path.join(imageDir, `${movie.id}.jpg`);
  
  // Vérifier si l'image existe déjà localement
  if (fs.existsSync(localImagePath)) {
    console.log(`✅ ${movie.title} - Image déjà présente`);
    // Vérifier si le chemin dans movies.ts est correct
    if (!movie.thumbnail.includes(movie.id)) {
      updateMovieThumbnail(movie.id, `/images/movies/${movie.id}.jpg`);
    }
    return;
  }
  
  // Si le thumbnail est déjà une URL complète (http/https)
  if (movie.isFullUrl && (movie.thumbnail.includes('http://') || movie.thumbnail.includes('https://'))) {
    console.log(`📥 Téléchargement de ${movie.title} depuis URL fournie...`);
    try {
      await downloadImage(movie.thumbnail, localImagePath);
      console.log(`✅ ${movie.title} - Image téléchargée`);
      
      // Mettre à jour le chemin dans movies.ts pour pointer vers le fichier local
      updateMovieThumbnail(movie.id, `/images/movies/${movie.id}.jpg`);
    } catch (error) {
      console.error(`❌ ${movie.title} - Erreur: ${error.message}`);
    }
    return;
  }
  
  // Si c'est un chemin local mais que le fichier n'existe pas
  if (movie.thumbnail.startsWith('/images/movies/')) {
    const existingPath = path.join(__dirname, '..', 'public', movie.thumbnail.replace(/^\//, ''));
    if (!fs.existsSync(existingPath)) {
      console.warn(`⚠️  ${movie.title} - Fichier local manquant: ${movie.thumbnail}`);
      console.log(`   💡 Vous pouvez fournir une URL d'image complète dans movies.ts pour ce film`);
    }
    return;
  }
  
  console.warn(`⚠️  ${movie.title} - Pas d'URL d'image valide trouvée`);
  console.log(`   💡 Ajoutez une URL complète (TMDB ou autre) dans le champ thumbnail de ce film`);
}

/**
 * Mettre à jour le chemin de l'image dans movies.ts
 */
function updateMovieThumbnail(movieId, newPath) {
  try {
    let content = fs.readFileSync(moviesFilePath, 'utf-8');
    // Pattern plus robuste pour trouver et remplacer le thumbnail
    const regex = new RegExp(`(id:\\s*'${movieId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'[\\s\\S]*?thumbnail:\\s*)'[^']+'`, 'g');
    
    if (regex.test(content)) {
      content = content.replace(regex, `$1'${newPath}'`);
      fs.writeFileSync(moviesFilePath, content, 'utf-8');
      console.log(`   📝 Chemin mis à jour dans movies.ts`);
    }
  } catch (error) {
    console.error(`   ⚠️  Erreur lors de la mise à jour: ${error.message}`);
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🚀 Démarrage du téléchargement des images...\n');
  
  for (const movie of movies) {
    await downloadMoviePoster(movie);
    // Petite pause pour éviter de surcharger l'API
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n✨ Téléchargement terminé!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { downloadMoviePoster, searchMovieOnTMDB };

