// Fichier unifié pour gérer à la fois les channels et les movies
import { channels, type Channel } from './channels';
import { movies, type Movie } from './movies';

// Type unifié pour afficher tout le contenu
export interface ContentItem {
  id: string;
  name: string; // Utilise 'title' pour movies, 'name' pour channels
  description: string;
  thumbnail: string;
  url: string;
  category: string;
  isLive: boolean;
  useIframe?: boolean;
  sources?: Array<{
    name: string;
    url: string;
    provider?: string;
    language?: 'VF' | 'VOSTFR' | 'VO';
  }>;
  isNew?: boolean;
  isPopular?: boolean;
  quality?: 'HD' | '4K' | 'SD';
  viewCount?: number;
  // Spécifique aux films
  year?: number;
  duration?: string;
  genre?: string[];
  rating?: number;
  type: 'channel' | 'movie'; // Pour différencier
}

// Convertir un Movie en ContentItem
function movieToContentItem(movie: Movie): ContentItem {
  // S'assurer que les sources sont toujours définies comme un tableau
  const sources = movie.sources && Array.isArray(movie.sources) && movie.sources.length > 0
    ? movie.sources.map(source => ({
        name: `${source.name} (${source.language})`,
        url: source.url,
        provider: source.name,
        language: source.language
      }))
    : [];
  
  return {
    id: movie.id,
    name: movie.title,
    description: movie.description,
    thumbnail: movie.thumbnail,
    url: `/watch/${movie.id}`, // URL de visionnage
    category: movie.category,
    isLive: false, // Les films ne sont pas en direct
    useIframe: true, // Les films utilisent iframe
    sources: sources, // Toujours un tableau, même s'il est vide
    isNew: movie.isNew,
    isPopular: movie.isPopular,
    viewCount: movie.viewCount,
    year: movie.year,
    duration: movie.duration,
    genre: movie.genre,
    rating: movie.rating,
    type: 'movie'
  };
}

// Convertir un Channel en ContentItem
function channelToContentItem(channel: Channel): ContentItem {
  // S'assurer que les sources sont toujours définies comme un tableau
  const sources = channel.sources && Array.isArray(channel.sources) && channel.sources.length > 0
    ? channel.sources
    : [];
  
  return {
    id: channel.id,
    name: channel.name,
    description: channel.description,
    thumbnail: channel.thumbnail,
    url: `/watch/${channel.id}`,
    category: channel.category,
    isLive: channel.isLive,
    useIframe: channel.useIframe,
    sources: sources, // Toujours un tableau, même s'il est vide
    isNew: channel.isNew,
    isPopular: channel.isPopular,
    quality: channel.quality,
    viewCount: channel.viewCount,
    type: 'channel'
  };
}

// Obtenir tout le contenu (channels + movies) unifié
export function getAllContent(): ContentItem[] {
  const channelItems = channels.map(channelToContentItem);
  const movieItems = movies.map(movieToContentItem);
  return [...channelItems, ...movieItems];
}

// Filtrer par catégorie
export function getContentByCategory(category: string): ContentItem[] {
  const allContent = getAllContent();
  return allContent.filter(item => item.category === category);
}

// Rechercher du contenu
export function searchContent(query: string): ContentItem[] {
  const allContent = getAllContent();
  const lowerQuery = query.toLowerCase();
  return allContent.filter(item =>
    item.name.toLowerCase().includes(lowerQuery) ||
    item.description.toLowerCase().includes(lowerQuery) ||
    item.genre?.some(g => g.toLowerCase().includes(lowerQuery))
  );
}

// Obtenir un élément par ID (cherche dans channels ET movies)
export function getContentById(id: string): ContentItem | undefined {
  const allContent = getAllContent();
  return allContent.find(item => item.id === id);
}

// Obtenir les nouveaux contenus
export function getNewContent(): ContentItem[] {
  const allContent = getAllContent();
  return allContent.filter(item => item.isNew);
}

// Obtenir les contenus populaires
export function getPopularContent(): ContentItem[] {
  const allContent = getAllContent();
  return allContent.filter(item => item.isPopular)
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
}

// Export direct des données originales pour compatibilité
export { channels } from './channels';
export { movies } from './movies';

