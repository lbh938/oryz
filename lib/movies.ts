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

  {
    id: 'interstellar-2014',
    title: 'Interstellar',
    description: 'Dans un futur proche, la Terre est devenue inhospitalière pour l\'humanité. Un groupe d\'explorateurs part dans l\'espace à travers un trou de ver pour trouver un nouveau foyer pour l\'humanité.',
    thumbnail: 'https://image.tmdb.org/t/p/original/1pnigkWWy8W032o9TKDneBa3eVK.jpg',
    isFullUrl: true,
    year: 2014,
    duration: '2h 49min',
    genre: ['Science-Fiction', 'Drame', 'Aventure'],
    rating: 8.6,
    category: 'Movies',
    isNew: false,
    isPopular: true,
    viewCount: 125000,
    sources: [
      {
        name: 'VOSTFR - Dood.Stream',
        url: 'https://kakaflix.lol/d00d//newPlayer.php?id=206eb9ba-8d81-4fea-9efe-d7ee9012fb6c',
        language: 'VOSTFR'
      },
      {
        name: 'VOSTFR - Voe',
        url: 'https://kakaflix.lol/sydney/newPlayer.php?id=7545eac5-408f-47b6-8a34-0808bc5e0d43',
        language: 'VOSTFR'
      },
      {
        name: 'VOSTFR - Uqload',
        url: 'https://uqload.cx/embed-82tezkb63oqc.html',
        language: 'VOSTFR'
      },
      {
        name: 'VOSTFR - Netu',
        url: 'https://1.multiup.us/player/embed_player.php?vid=g5VzCrui0FG2&autoplay=no',
        language: 'VOSTFR'
      },
      {
        name: 'Default - ViDZY',
        url: 'https://vidzy.org/embed-klmzta4kjysa.html',
        language: 'VO'
      },
      {
        name: 'Default - Dood.Stream',
        url: 'https://dsvplay.com/e/cbzyds92yiqv',
        language: 'VO'
      },
      {
        name: 'Default - Voe',
        url: 'https://sandratableother.com/e/1g9r6ellsil8',
        language: 'VO'
      },
      {
        name: 'Default - Uqload',
        url: 'https://uqload.cx/embed-v8dv65a48f6x.html',
        language: 'VO'
      },
      {
        name: 'Default - Netu',
        url: 'https://1.multiup.us/player/embed_player.php?vid=&autoplay=no',
        language: 'VO'
      },
      {
        name: 'Default - Filmoon',
        url: 'https://filemoon.sx/e/su5g8zqbs5wr',
        language: 'VO'
      }
    ]
  },

  {
    id: 'les-4-fantastiques-premiers-pas-2025',
    title: 'Les 4 Fantastiques : Premiers pas',
    description: 'L\'origine des Quatre Fantastiques, une équipe de super-héros dotés de pouvoirs extraordinaires après une exposition à des radiations cosmiques.',
    thumbnail: 'https://image.tmdb.org/t/p/original/rNc4KARs6fVa4axzvuv3NfUiNy1.jpg',
    isFullUrl: true,
    year: 2025,
    duration: '2h 5min',
    genre: ['Action', 'Science-Fiction', 'Aventure'],
    rating: 6.8,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 89500,
    sources: [
      {
        name: 'VF',
        url: 'https://supervideo.cc/e/r0fk25ukvjye',
        language: 'VF'
      }
    ]
  },

  {
    id: 'superman-2025',
    title: 'Superman',
    description: 'Le retour du plus célèbre super-héros de tous les temps dans une nouvelle aventure épique.',
    thumbnail: 'https://image.tmdb.org/t/p/original/bL1U8TDb2ZiThIBFAdKHOfpv8lk.jpg',
    isFullUrl: true,
    year: 2025,
    duration: '2h 15min',
    genre: ['Action', 'Science-Fiction', 'Aventure'],
    rating: 7.5,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 112000,
    sources: [
      {
        name: 'VF',
        url: 'https://supervideo.cc/e/20t9hc2fuozm',
        language: 'VF'
      }
    ]
  },

  {
    id: 'mission-impossible-the-final-reckoning-2025',
    title: 'Mission : Impossible - The Final Reckoning',
    description: 'Ethan Hunt et son équipe de l\'IMF font face à leur mission la plus dangereuse et personnelle à ce jour.',
    thumbnail: 'https://image.tmdb.org/t/p/original/AozMgdALZuR1hDPZt2a1aXiWmL4.jpg',
    isFullUrl: true,
    year: 2025,
    duration: '2h 30min',
    genre: ['Action', 'Thriller', 'Espionnage'],
    rating: 8.2,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 156000,
    sources: [
      {
        name: 'VF',
        url: 'https://supervideo.cc/e/tkgkxmohp9e5',
        language: 'VF'
      }
    ]
  },

  {
    id: 'f1-le-film-2025',
    title: 'F1® Le Film',
    description: 'Un film dramatique sur le monde de la Formule 1, suivant les défis et les triomphes des pilotes et des équipes.',
    thumbnail: 'https://image.tmdb.org/t/p/original/up0kyZZlLX24dE9SzDuTjXe6HFl.jpg',
    isFullUrl: true,
    year: 2025,
    duration: '2h 10min',
    genre: ['Drame', 'Action', 'Sport'],
    rating: 7.8,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 98000,
    sources: [
      {
        name: 'VF',
        url: 'https://supervideo.cc/e/6eb7e5dfi8h1',
        language: 'VF'
      }
    ]
  },

  {
    id: 'jurassic-world-renaissance-2025',
    title: 'Jurassic World : Renaissance',
    description: 'Une nouvelle ère commence dans le parc Jurassic World avec de nouvelles créatures et de nouveaux défis.',
    thumbnail: 'https://image.tmdb.org/t/p/original/39BWHFc5J2Pp7gHcykwOkm3tWTA.jpg',
    isFullUrl: true,
    year: 2025,
    duration: '2h 5min',
    genre: ['Action', 'Science-Fiction', 'Aventure'],
    rating: 7.3,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 134000,
    sources: [
      {
        name: 'VF',
        url: 'https://uqload.cx/embed-l33f2dgn9x7o.html',
        language: 'VF'
      }
    ]
  },

  {
    id: 'night-carnage-2025',
    title: 'Night Carnage',
    description: 'Un thriller d\'horreur intense qui se déroule dans une nuit de terreur et de violence.',
    thumbnail: 'https://image.tmdb.org/t/p/original/w0wjPQKhlqisSbylf1sWZiNyc2h.jpg',
    isFullUrl: true,
    year: 2025,
    duration: '1h 45min',
    genre: ['Horreur', 'Thriller'],
    rating: 6.9,
    category: 'Movies',
    isNew: true,
    isPopular: false,
    viewCount: 42000,
    sources: [
      {
        name: 'VF',
        url: 'https://uqload.cx/embed-1iwygjdfnsme.html',
        language: 'VF'
      }
    ]
  },

  {
    id: 'a-contre-sens-3-2025',
    title: 'À contre-sens 3',
    description: 'Troisième opus de la série À contre-sens, poursuivant les aventures et les défis des personnages principaux.',
    thumbnail: '/images/movies/a-contre-sens-3.jpg',
    year: 2025,
    duration: '1h 50min',
    genre: ['Action', 'Thriller'],
    rating: 7.0,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 56000,
    sources: [
      {
        name: 'VF',
        url: 'https://supervideo.cc/e/uvvw94aar6z4',
        language: 'VF'
      }
    ]
  },

  {
    id: 'les-sneetches-2025',
    title: 'Les Sneetches',
    description: 'Adaptation animée de la célèbre histoire du Dr. Seuss sur l\'acceptation et la diversité.',
    thumbnail: '/images/movies/les-sneetches.jpg',
    year: 2025,
    duration: '1h 25min',
    genre: ['Animation', 'Famille'],
    rating: 7.5,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 48000,
    sources: [
      {
        name: 'VF',
        url: 'https://supervideo.cc/e/3b0jdu79pi41',
        language: 'VF'
      }
    ]
  },

  {
    id: 'yoroi-2025',
    title: 'Yoroï',
    description: 'Un film d\'action épique mettant en scène des samouraïs et leurs armures légendaires.',
    thumbnail: '/images/movies/yoroi.jpg',
    year: 2025,
    duration: '2h 10min',
    genre: ['Action', 'Aventure', 'Historique'],
    rating: 7.8,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 72000,
    sources: [
      {
        name: 'VF',
        url: 'https://player.videasy.net/movie/1358491',
        language: 'VF'
      }
    ]
  },

  {
    id: 'man-of-steel-2013',
    title: 'Man of Steel',
    description: 'L\'origine de Superman, de son enfance sur Krypton à son arrivée sur Terre où il devient le plus puissant héros de la planète.',
    thumbnail: 'https://image.tmdb.org/t/p/original/7rIPjn5TUK04O25Z3mMf3ZXXP1X.jpg',
    isFullUrl: true,
    year: 2013,
    duration: '2h 23min',
    genre: ['Action', 'Science-Fiction', 'Aventure'],
    rating: 7.1,
    category: 'Movies',
    isNew: false,
    isPopular: true,
    viewCount: 189000,
    sources: [
      {
        name: 'VF - Mixdrop',
        url: 'https://mixdrop.ag/e/owqxqvpmazmkv7',
        language: 'VF'
      },
      {
        name: 'VF - Streamtape',
        url: 'https://streamtape.com/e/0RpVg9p229hbOD7',
        language: 'VF'
      },
      {
        name: 'VF - Dood.Stream',
        url: 'https://dsvplay.com/e/p3k93xchaw6c',
        language: 'VF'
      },
      {
        name: 'VF - Voe',
        url: 'https://voe.sx/e/uigarreh8onu',
        language: 'VF'
      }
    ]
  },

  {
    id: 'avengers-l-ere-d-ultron-2015',
    title: 'Avengers : L\'Ère d\'Ultron',
    description: 'Les Avengers doivent faire équipe pour arrêter Ultron, une intelligence artificielle terrifiante créée par Tony Stark.',
    thumbnail: 'https://image.tmdb.org/t/p/original/4ssDuvEDkSArWEdyBl2X5Hv78NX.jpg',
    isFullUrl: true,
    year: 2015,
    duration: '2h 21min',
    genre: ['Action', 'Science-Fiction', 'Aventure'],
    rating: 7.3,
    category: 'Movies',
    isNew: false,
    isPopular: true,
    viewCount: 245000,
    sources: [
      {
        name: 'VF - Dood.Stream',
        url: 'https://dsvplay.com/e/0mh33fyc3dhe',
        language: 'VF'
      },
      {
        name: 'VF - Streamtape',
        url: 'https://streamtape.com/e/D2g4kWvL9BskzzJ',
        language: 'VF'
      },
      {
        name: 'VF - Mixdrop',
        url: 'https://mixdrop.ag/e/ele0q63da7eq1p',
        language: 'VF'
      }
    ]
  },

  {
    id: 'xeno-2025',
    title: 'Xeno',
    description: 'Un thriller de science-fiction suivant une rencontre avec une forme de vie extraterrestre mystérieuse.',
    thumbnail: '/images/movies/xeno.jpg',
    year: 2025,
    duration: '1h 55min',
    genre: ['Science-Fiction', 'Thriller', 'Horreur'],
    rating: 7.2,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 64000,
    sources: [
      {
        name: 'VF',
        url: 'https://supervideo.cc/e/71b22wnvzhwk',
        language: 'VF'
      }
    ]
  },

  {
    id: 'batman-azteca-choque-de-imperios-2025',
    title: 'Batman Azteca: Choque de imperios',
    description: 'Une version alternative de Batman dans un univers inspiré de la culture aztèque, où le héros doit affronter de puissants empires.',
    thumbnail: '/images/movies/batman-azteca.jpg',
    year: 2025,
    duration: '1h 40min',
    genre: ['Animation', 'Action', 'Aventure'],
    rating: 7.6,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 58000,
    sources: [
      {
        name: 'VF',
        url: 'https://supervideo.cc/e/73jwhqfybz0l',
        language: 'VF'
      }
    ]
  },

  {
    id: 'mcwalter-2025',
    title: 'McWalter',
    description: 'Un film dramatique suivant les défis et les triomphes d\'un personnage dans un monde moderne complexe.',
    thumbnail: '/images/movies/mcwalter.jpg',
    year: 2025,
    duration: '1h 45min',
    genre: ['Drame'],
    rating: 6.8,
    category: 'Movies',
    isNew: true,
    isPopular: false,
    viewCount: 32000,
    sources: [
      {
        name: 'VF',
        url: 'https://supervideo.cc/e/sczrbnx20rtv',
        language: 'VF'
      }
    ]
  },

  {
    id: 'thunderbolts-2025',
    title: 'Thunderbolts*',
    description: 'Une équipe de super-vilains réformés qui travaillent pour le gouvernement dans des missions secrètes et dangereuses.',
    thumbnail: '/images/movies/thunderbolts.jpg',
    year: 2025,
    duration: '2h 15min',
    genre: ['Action', 'Science-Fiction', 'Aventure'],
    rating: 7.4,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 156000,
    sources: [
      {
        name: 'VF - Mixdrop',
        url: 'https://mixdrop.ag/e/r6n7o74dtvpddz',
        language: 'VF'
      },
      {
        name: 'VF - Dood.Stream',
        url: 'https://dsvplay.com/e/u30ovgkszrap',
        language: 'VF'
      }
    ]
  },

  {
    id: 'karate-kid-legends-2025',
    title: 'Karate Kid: Legends',
    description: 'Une nouvelle génération de héros du karaté émerge, suivant les traces des légendes qui les ont précédés.',
    thumbnail: '/images/movies/karate-kid-legends.jpg',
    year: 2025,
    duration: '2h 5min',
    genre: ['Action', 'Drame', 'Sport'],
    rating: 7.7,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 98000,
    sources: [
      {
        name: 'VF',
        url: 'https://supervideo.cc/e/v7cvb8oy84um',
        language: 'VF'
      }
    ]
  },

  {
    id: 'lilo-stitch-2025',
    title: 'Lilo & Stitch',
    description: 'Une jeune fille hawaïenne adopte un chien qui s\'avère être un expériment génétique extraterrestre en fuite.',
    thumbnail: 'https://image.tmdb.org/t/p/original/56I6d8IZaNeXo8Yqcyvj7qPf3vZ.jpg',
    isFullUrl: true,
    year: 2025,
    duration: '1h 25min',
    genre: ['Animation', 'Famille', 'Comédie'],
    rating: 7.5,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 178000,
    sources: [
      {
        name: 'VF - Mixdrop',
        url: 'https://mixdrop.ag/e/03rjvqwmcenjlm',
        language: 'VF'
      },
      {
        name: 'VF - Dood.Stream',
        url: 'https://dsvplay.com/e/l3tqjj7b7tnu',
        language: 'VF'
      }
    ]
  },

  {
    id: 'happy-gilmore-2-2025',
    title: 'Happy Gilmore 2',
    description: 'Suite des aventures du golfeur excentrique Happy Gilmore qui retourne sur les greens pour de nouvelles compétitions.',
    thumbnail: '/images/movies/happy-gilmore-2.jpg',
    year: 2025,
    duration: '1h 50min',
    genre: ['Comédie', 'Sport'],
    rating: 7.1,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 112000,
    sources: [
      {
        name: 'VF - Mixdrop',
        url: 'https://mixdrop.ag/e/elz1w9xwh771q',
        language: 'VF'
      },
      {
        name: 'VF - Dood.Stream',
        url: 'https://dsvplay.com/e/mv18ypy8rd1m',
        language: 'VF'
      }
    ]
  },

  {
    id: 'the-pickup-2025',
    title: 'The Pickup',
    description: 'Un thriller moderne suivant les conséquences d\'une rencontre apparemment innocente qui tourne mal.',
    thumbnail: '/images/movies/the-pickup.jpg',
    year: 2025,
    duration: '1h 40min',
    genre: ['Thriller', 'Drame'],
    rating: 6.9,
    category: 'Movies',
    isNew: true,
    isPopular: false,
    viewCount: 45000,
    sources: [
      {
        name: 'VF - Mixdrop',
        url: 'https://mixdrop.ag/e/360n0410av7147',
        language: 'VF'
      },
      {
        name: 'VF - Dood.Stream',
        url: 'https://dsvplay.com/e/vkvjr54zy97n',
        language: 'VF'
      }
    ]
  },

  {
    id: 'the-occupant-2025',
    title: 'The Occupant',
    description: 'Un thriller psychologique où un nouveau résident découvre que sa maison cache des secrets terrifiants.',
    thumbnail: '/images/movies/the-occupant.jpg',
    year: 2025,
    duration: '1h 45min',
    genre: ['Thriller', 'Horreur'],
    rating: 7.0,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 67000,
    sources: [
      {
        name: 'VF',
        url: 'https://uqload.cx/embed-u412j09xolbj.html',
        language: 'VF'
      }
    ]
  },

  {
    id: 'together-2025',
    title: 'Together',
    description: 'Un drame émotionnel explorant les liens familiaux et les défis de rester unis face à l\'adversité.',
    thumbnail: '/images/movies/together.jpg',
    year: 2025,
    duration: '1h 55min',
    genre: ['Drame', 'Famille'],
    rating: 7.3,
    category: 'Movies',
    isNew: true,
    isPopular: false,
    viewCount: 38000,
    sources: [
      {
        name: 'VF',
        url: 'https://supervideo.cc/e/mri79gvan4xt',
        language: 'VF'
      }
    ]
  },

  {
    id: 'souviens-toi-l-ete-dernier-2025',
    title: 'Souviens-toi… l\'été dernier',
    description: 'Un thriller d\'horreur où un groupe d\'amis est hanté par les secrets d\'un été passé qui refont surface.',
    thumbnail: '/images/movies/souviens-toi-l-ete-dernier.jpg',
    year: 2025,
    duration: '1h 50min',
    genre: ['Horreur', 'Thriller'],
    rating: 7.2,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 89000,
    sources: [
      {
        name: 'VF',
        url: 'https://supervideo.cc/e/yg1530hdx7pj',
        language: 'VF'
      }
    ]
  },

  {
    id: 'captain-america-brave-new-world-2025',
    title: 'Captain America : Brave New World',
    description: 'Sam Wilson endosse le rôle de Captain America dans un nouveau monde où il doit faire face à de nouveaux défis et ennemis.',
    thumbnail: 'https://image.tmdb.org/t/p/original/7gKI9hpEMcZUQpNgKrkmzQ5b90u.jpg',
    isFullUrl: true,
    year: 2025,
    duration: '2h 10min',
    genre: ['Action', 'Science-Fiction', 'Aventure'],
    rating: 7.6,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 198000,
    sources: [
      {
        name: 'VF',
        url: 'https://kakaflix.lol/doo2/newPlayer.php?id=24e2d15c-9791-42d3-9cc7-57051eec07aa',
        language: 'VF'
      }
    ]
  },

  {
    id: 'borderlands-2024',
    title: 'Borderlands',
    description: 'Adaptation du célèbre jeu vidéo, suivant un groupe de chasseurs de trésors sur la planète Pandora.',
    thumbnail: 'https://image.tmdb.org/t/p/original/8x9z7FpZ8K7q3K5L2M1N9O0P1Q2R.jpg',
    isFullUrl: true,
    year: 2024,
    duration: '2h 5min',
    genre: ['Action', 'Science-Fiction', 'Comédie'],
    rating: 6.8,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 142000,
    sources: [
      {
        name: 'VF - ViDZY',
        url: 'https://vidzy.org/embed-9234br9fd081.html',
        language: 'VF'
      },
      {
        name: 'VF - Uqload',
        url: 'https://uqload.cx/embed-wkuw3v39wrkq.html',
        language: 'VF'
      }
    ]
  },

  {
    id: 'the-crow-2024',
    title: 'The Crow',
    description: 'Remake du classique de 1994, suivant un musicien ressuscité qui cherche à venger sa mort et celle de sa fiancée.',
    thumbnail: 'https://image.tmdb.org/t/p/original/9x8y7zFpZ8K7q3K5L2M1N9O0P1Q2R.jpg',
    isFullUrl: true,
    year: 2024,
    duration: '2h 0min',
    genre: ['Action', 'Thriller', 'Horreur'],
    rating: 6.9,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 156000,
    sources: [
      {
        name: 'VF - ViDZY',
        url: 'https://vidzy.org/embed-0almbrj7q4na.html',
        language: 'VF'
      },
      {
        name: 'VF - Uqload',
        url: 'https://uqload.cx/embed-yqoqhsyoyrpq.html',
        language: 'VF'
      },
      {
        name: 'VF - Dood.Stream',
        url: 'https://kakaflix.lol/bigwar5//newPlayer.php?id=e0412b9a-0c41-45a2-955a-d54eee5d2225',
        language: 'VF'
      }
    ]
  },

  {
    id: 'back-in-action-2025',
    title: 'Back in Action',
    description: 'Un film d\'action palpitant où des héros doivent revenir sur le terrain pour affronter une nouvelle menace.',
    thumbnail: '/images/movies/back-in-action.jpg',
    year: 2025,
    duration: '1h 55min',
    genre: ['Action', 'Thriller'],
    rating: 7.1,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 98000,
    sources: [
      {
        name: 'VF - Uqload',
        url: 'https://uqload.cx/embed-17rr42egsvgf.html',
        language: 'VF'
      },
      {
        name: 'VF - Dood.Stream',
        url: 'https://kakaflix.lol//bigwar/newPlayer.php?id=92b703b0-3155-4e18-bd70-6868d015e367',
        language: 'VF'
      }
    ]
  },

  {
    id: 'the-substance-2024',
    title: 'The Substance',
    description: 'Un thriller psychologique intense explorant les limites de la science et de l\'humanité.',
    thumbnail: 'https://image.tmdb.org/t/p/original/8x9y7zFpZ8K7q3K5L2M1N9O0P1Q2R.jpg',
    isFullUrl: true,
    year: 2024,
    duration: '2h 15min',
    genre: ['Thriller', 'Horreur', 'Science-Fiction'],
    rating: 7.8,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 134000,
    sources: [
      {
        name: 'VF - ViDZY',
        url: 'https://vidzy.org/embed-xlgv16pt5ipd.html',
        language: 'VF'
      },
      {
        name: 'VF - Uqload',
        url: 'https://uqload.cx/embed-b1q2azkgnn0b.html',
        language: 'VF'
      }
    ]
  },

  {
    id: 'heretic-2024',
    title: 'Heretic',
    description: 'Un thriller d\'horreur où un groupe de personnes est confronté à des forces maléfiques et des secrets terrifiants.',
    thumbnail: '/images/movies/heretic.jpg',
    year: 2024,
    duration: '1h 50min',
    genre: ['Horreur', 'Thriller'],
    rating: 7.0,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 87000,
    sources: [
      {
        name: 'VF - ViDZY',
        url: 'https://vidzy.org/embed-fabsqbr4fnnc.html',
        language: 'VF'
      },
      {
        name: 'VF - Uqload',
        url: 'https://uqload.cx/embed-5m77mjqxmbe6.html',
        language: 'VF'
      }
    ]
  },

  {
    id: 'novocaine-2025',
    title: 'Novocaïne',
    description: 'Un thriller médical où un dentiste se retrouve impliqué dans une conspiration mortelle.',
    thumbnail: '/images/movies/novocaine.jpg',
    year: 2025,
    duration: '1h 45min',
    genre: ['Thriller', 'Drame'],
    rating: 6.9,
    category: 'Movies',
    isNew: true,
    isPopular: false,
    viewCount: 54000,
    sources: [
      {
        name: 'VF - ViDZY',
        url: 'https://vidzy.org/embed-rcfrj13z2ibs.html',
        language: 'VF'
      },
      {
        name: 'VF - Uqload',
        url: 'https://uqload.cx/embed-nzouxlt2zdhl.html',
        language: 'VF'
      },
      {
        name: 'VF - Dood.Stream',
        url: 'https://kakaflix.lol/doo2/newPlayer.php?id=3605af59-ca34-4c0b-bc6b-3a5c65e86dc6',
        language: 'VF'
      }
    ]
  },

  {
    id: 'smile-2-2024',
    title: 'Smile 2',
    description: 'Suite du film d\'horreur Smile, où le maléfique sourire continue de se propager et de terroriser de nouvelles victimes.',
    thumbnail: 'https://image.tmdb.org/t/p/original/7x8y9zFpZ8K7q3K5L2M1N9O0P1Q2R.jpg',
    isFullUrl: true,
    year: 2024,
    duration: '1h 55min',
    genre: ['Horreur', 'Thriller'],
    rating: 7.3,
    category: 'Movies',
    isNew: true,
    isPopular: true,
    viewCount: 167000,
    sources: [
      {
        name: 'VF - Uqload',
        url: 'https://uqload.cx/embed-6ftyubpclf1r.html',
        language: 'VF'
      },
      {
        name: 'VF - Dood.Stream',
        url: 'https://kakaflix.lol//bigwar/newPlayer.php?id=f6ccacf1-035b-4d4f-8e14-fe67a147e636',
        language: 'VF'
      }
    ]
  },

];

