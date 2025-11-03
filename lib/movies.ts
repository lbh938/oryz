export interface MovieSource {
  name: string;
  url: string;
  language: 'VF' | 'VOSTFR' | 'VO';
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  year: number;
  duration?: string; // ex: "1h 37min"
  genre: string[];
  rating?: number; // Note sur 10
  category: 'Movies' | 'Documentaries';
  sources: MovieSource[];
  isNew?: boolean;
  isPopular?: boolean;
  viewCount?: number;
  isFullUrl?: boolean; // Indique si thumbnail est une URL complète (TMDB, etc.)
}

export const movies: Movie[] = [

  {
    id: 'venom-let-there-be-carnage',
    title: 'Venom: Let There Be Carnage',
    description: 'Eddie Brock et Venom doivent faire face à un nouveau défi : Carnage, le tueur en série Cletus Kasady qui a fusionné avec un symbiote.',
    thumbnail: '/images/movies/VENOM2-affiche-450x600.jpg',
    year: 2021,
    duration: '1h 37min',
    genre: ['Action', 'Science-Fiction', 'Thriller'],
    rating: 6.8,
    category: 'Movies',
    isPopular: true,
    viewCount: 24500,
    sources: [
      {
        name: 'VF',
        url: 'https://mdy48tn97.com/e/xozppnzgbo4080',
        language: 'VF'
      },
      {
        name: 'VO',
        url: 'https://lulustream.com/e/r2gcz7nza2fa',
        language: 'VO'
      }
    ]
  },

  {
    id: 'good-boy-2025',
    title: 'Good Boy',
    description: 'Indy, un chien de race Nova Scotia Duck Tolling Retriever, et son propriétaire Todd emménagent dans une maison rurale hantée. Indy perçoit rapidement une présence malveillante et tente de protéger Todd des forces surnaturelles.',
    thumbnail: '/images/movies/good-boy-2025.jpg',
    year: 2025,
    duration: '1h 35min',
    genre: ['Horreur', 'Thriller'],
    rating: 8.9,
    category: 'Movies',
    isPopular: true,
    viewCount: 32500,
    sources: [
      {
        name: 'VF',
        url: 'https://moovtop.fr/iframe/Z46SIWhKTR',
        language: 'VF'
      }
    ]
  },

  {
    id: 'fly-2024',
    title: 'Fly',
    description: 'Un documentaire immersif explorant le monde périlleux du BASE jump et du wingsuit à travers les histoires de trois couples passionnés par ces sports extrêmes sur une période de sept ans.',
    thumbnail: '/images/movies/fly-2024.jpg',
    year: 2024,
    duration: '1h 52min',
    genre: ['Documentaire', 'Aventure', 'Sport'],
    rating: 7.2,
    category: 'Documentaries',
    isNew: true,
    isPopular: true,
    viewCount: 15200,
    sources: [
      {
        name: 'VF',
        url: 'https://sharecloudy.com/iframe/OWd6nogkxn',
        language: 'VF'
      }
    ]
  },

  {
    id: 'stolen-girl-2025',
    title: 'The Stolen Girl',
    description: 'Maureen, une mère célibataire dont la fille de deux ans est enlevée par son père et emmenée au Moyen-Orient. Déterminée à la retrouver, elle s\'associe à Robeson, un ex-marine spécialiste des enlèvements d\'enfants, pour une mission périlleuse à travers des villes inconnues et des systèmes dangereux.',
    thumbnail: 'https://image.tmdb.org/t/p/original/fZlNXEHZsBp7unqw009MeBbMv87.jpg',
    isFullUrl: true,
    year: 2025,
    duration: '1h 50min',
    genre: ['Action', 'Drame', 'Thriller'],
    rating: 6.5,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 12400,
    sources: [
      {
        name: 'VO',
        url: 'https://supervideo.cc/e/94gu4o9ux598',
        language: 'VO'
      }
    ]
  },

  {
    id: 'war-of-the-worlds-2005',
    title: 'La Guerre des mondes',
    description: 'Ray Ferrier, un docker américain divorcé, doit protéger ses enfants lors d\'une invasion extraterrestre dévastatrice. Alors que des machines de guerre émergent du sol, il tente de trouver un refuge sûr dans un monde en chaos.',
    thumbnail: 'https://image.tmdb.org/t/p/original/yvirUYrva23IudARHn3mMGVxWqM.jpg',
    isFullUrl: true,
    year: 2005,
    duration: '1h 56min',
    genre: ['Science-Fiction', 'Thriller', 'Action'],
    rating: 6.5,
    category: 'Movies',
    isPopular: true,
    viewCount: 28700,
    sources: [
      {
        name: 'VF',
        url: 'https://uqload.cx/embed-ln2btqtb0uvi.html',
        language: 'VF'
      }
    ]
  },

  {
    id: 'black-phone-2',
    title: 'Black Phone 2',
    description: 'Quatre ans après que Finney Blake a tué le Grabber, sa sœur Gwen commence à avoir des rêves où elle voit des meurtres survenus au camp Alpine Lake en 1957. Déterminée à comprendre ces visions, Gwen convainc Finney et Ernesto de se rendre au camp pour enquêter, découvrant des liens troublants entre le Grabber et l\'histoire de leur propre famille.',
    thumbnail: '/images/movies/black-phone-2.jpg',
    year: 2025,
    duration: '1h 45min',
    genre: ['Horreur', 'Thriller', 'Surnaturel'],
    rating: 7.2,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 34200,
    sources: [
      {
        name: 'VF',
        url: 'https://uqload.cx/embed-uoiedntbyfvz.html',
        language: 'VF'
      }
    ]
  },

  {
    id: 'marche-ou-creve',
    title: 'Marche ou crève',
    description: 'Dans un futur proche, une compétition annuelle appelée "La Longue Marche" est organisée. Cent adolescents doivent marcher sans interruption à une vitesse minimale imposée, sous la surveillance de militaires. Le dernier survivant remporte le prix ultime. Le jeune Ray Garraty est l\'un des participants de cette édition.',
    thumbnail: 'https://image.tmdb.org/t/p/original/4KXidDT9Z8w23A4r0eoRwwDPYOD.jpg',
    isFullUrl: true,
    year: 2025,
    duration: '1h 48min',
    genre: ['Thriller', 'Science-Fiction', 'Drame'],
    rating: 7.5,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 29800,
    sources: [
      {
        name: 'VF',
        url: 'https://mikaylaarealike.com/e/mhjwcsthjkaj',
        language: 'VF'
      }
    ]
  },

  {
    id: 'a-house-of-dynamite',
    title: 'A House of Dynamite',
    description: 'Thriller politique apocalyptique suivant le gouvernement américain qui élabore une réponse officielle à un missile nucléaire lancé par un ennemi non identifié. Le président des États-Unis et son équipe doivent prendre des décisions cruciales face à une menace nucléaire imminente.',
    thumbnail: 'https://image.tmdb.org/t/p/original/AiJ8L90ftPAwVf3SDx7Fj9IMZoy.jpg',
    isFullUrl: true,
    year: 2025,
    duration: '1h 52min',
    genre: ['Thriller', 'Politique', 'Drame'],
    rating: 8.1,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 41200,
    sources: [
      {
        name: 'VF',
        url: 'https://mikaylaarealike.com/e/uavevwjrrq3g',
        language: 'VF'
      }
    ]
  },

  {
    id: 'ballad-of-a-small-player',
    title: 'Ballad of a Small Player',
    description: 'Lord Doyle, un joueur compulsif se faisant passer pour un noble, se réfugie à Macao après avoir été accusé de vol de près d\'un million de livres sterling. Là-bas, il rencontre Dao Ming, une employée de casino, et est poursuivi par Cynthia Blithe, une enquêtrice privée déterminée à le confronter à son passé.',
    thumbnail: '/images/movies/ballad-of-a-small-player.jpg',
    year: 2025,
    duration: '1h 48min',
    genre: ['Thriller', 'Drame', 'Psychologique'],
    rating: 7.3,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 28500,
    sources: [
      {
        name: 'VF',
        url: 'https://supervideo.cc/e/1ozjxfwhrth7',
        language: 'VF'
      }
    ]
  },

  {
    id: 'les-rats-une-histoire-the-witcher',
    title: 'Les Rats : Une histoire "The Witcher"',
    description: 'Film dérivé de l\'univers de "The Witcher" suivant un groupe de jeunes hors-la-loi appelés "Les Rats". L\'inauguration d\'une arène de combat se transforme en cible idéale pour cette bande d\'ados marginaux qui s\'enrichissent en volant les riches. Ciri rencontre ces hors-la-loi dans ce spin-off.',
    thumbnail: '/images/movies/les-rats-une-histoire-the-witcher.jpg',
    year: 2025,
    duration: '1h 22min',
    genre: ['Fantasy', 'Action', 'Aventure'],
    rating: 7.8,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 38200,
    sources: [
      {
        name: 'VF',
        url: 'https://supervideo.cc/e/v0pbj6d051da',
        language: 'VF'
      }
    ]
  },

  {
    id: 'the-elixir',
    title: 'The Elixir',
    description: 'Film de science-fiction et thriller mettant en scène une quête pour un élixir mystérieux aux propriétés extraordinaires.',
    thumbnail: '/images/movies/the-elixir.jpg',
    year: 2024,
    duration: '1h45',
    genre: ['Science-Fiction', 'Thriller', 'Fantasy'],
    rating: 6.9,
    category: 'Movies',
    isNew: true,
    isPopular: false,
    viewCount: 15600,
    sources: [
      {
        name: 'VF',
        url: 'https://supervideo.cc/e/mtf253irgj2p',
        language: 'VF'
      }
    ]
  },

  {
    id: 'evanouis',
    title: 'Évanouis',
    description: 'Dans la petite ville de Maybrook, en Pennsylvanie, à 2h17 du matin, dix-sept enfants d\'une même classe disparaissent simultanément de leur domicile, laissant derrière eux un seul élève. Cette disparition collective plonge la communauté dans l\'angoisse et la suspicion, notamment envers leur enseignante.',
    thumbnail: '/images/movies/evanouis.jpg',
    year: 2025,
    duration: '1h52',
    genre: ['Thriller', 'Horreur', 'Drame'],
    rating: 8.2,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 46800,
    sources: [
      {
        name: 'VF',
        url: 'https://supervideo.cc/e/3b0d0phbfmmp',
        language: 'VF'
      }
    ]
  },

  {
    id: 'hedda',
    title: 'Hedda',
    description: 'Film dramatique et psychologique.',
    thumbnail: 'https://image.tmdb.org/t/p/original/ecflk7AZf0ij205yDswjlvdxlCO.jpg',
    isFullUrl: true,
    year: 2025,
    duration: '1h 45min',
    genre: ['Drame', 'Psychologique'],
    rating: 7.0,
    category: 'Movies',
    isNew: true,
    isPopular: false,
    viewCount: 0,
    sources: [
      {
        name: 'VF',
        url: 'https://supervideo.cc/e/07otdm2besy4',
        language: 'VF'
      }
    ]
  },

];

