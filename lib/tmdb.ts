/**
 * Utilitaire TMDB pour récupérer automatiquement les informations des films
 * Usage: Récupère titre, description, affiche, année, note, etc. depuis l'API TMDB
 * 
 * Pour obtenir une clé API TMDB (gratuite):
 * 1. Créer un compte sur https://www.themoviedb.org/
 * 2. Aller dans Settings > API
 * 3. Demander une clé API
 * 4. Ajouter la clé dans .env.local: NEXT_PUBLIC_TMDB_API_KEY=votre_cle
 */

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  runtime: number | null;
  genres: Array<{ id: number; name: string }>;
}

export interface TMDBMovieResult {
  title: string;
  description: string;
  year: number;
  duration: string | null;
  genres: string[];
  rating: number;
  posterUrl: string | null;
  backdropUrl: string | null;
}

/**
 * Rechercher un film par titre
 */
export async function searchMovieByTitle(title: string): Promise<TMDBMovie | null> {
  if (!TMDB_API_KEY) {
    console.warn('TMDB_API_KEY non configurée. Veuillez ajouter NEXT_PUBLIC_TMDB_API_KEY dans .env.local');
    return null;
  }

  try {
    const searchUrl = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&language=fr-FR`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      // Retourner le premier résultat (le plus pertinent)
      const movie = data.results[0];
      
      // Récupérer les détails complets du film
      return await getMovieDetails(movie.id);
    }

    return null;
  } catch (error) {
    console.error('Erreur lors de la recherche TMDB:', error);
    return null;
  }
}

/**
 * Récupérer les détails complets d'un film par ID
 */
export async function getMovieDetails(movieId: number): Promise<TMDBMovie | null> {
  if (!TMDB_API_KEY) {
    return null;
  }

  try {
    const detailsUrl = `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=fr-FR`;
    const response = await fetch(detailsUrl);
    
    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status}`);
    }

    const movie: TMDBMovie = await response.json();
    return movie;
  } catch (error) {
    console.error('Erreur lors de la récupération des détails TMDB:', error);
    return null;
  }
}

/**
 * Convertir un résultat TMDB en format utilisable pour notre bibliothèque
 */
export function formatTMDBMovie(movie: TMDBMovie): TMDBMovieResult {
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : new Date().getFullYear();
  const duration = movie.runtime ? formatDuration(movie.runtime) : null;
  const genres = movie.genres.map(g => g.name);
  const rating = movie.vote_average / 10; // Convertir de 0-10 à 0-1, puis on multipliera par 10 pour affichage
  
  return {
    title: movie.title || movie.original_title,
    description: movie.overview || '',
    year,
    duration,
    genres,
    rating: movie.vote_average, // Note sur 10
    posterUrl: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null,
    backdropUrl: movie.backdrop_path ? `${TMDB_IMAGE_BASE_URL}${movie.backdrop_path}` : null,
  };
}

/**
 * Formater la durée en minutes vers "Xh Ymin"
 */
function formatDuration(minutes: number): string {
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

/**
 * Rechercher un film et retourner les informations formatées
 */
export async function getMovieInfoByTitle(title: string): Promise<TMDBMovieResult | null> {
  const movie = await searchMovieByTitle(title);
  
  if (!movie) {
    return null;
  }
  
  return formatTMDBMovie(movie);
}

