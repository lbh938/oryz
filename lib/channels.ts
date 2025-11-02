export interface ChannelSource {
  name: string;
  url: string;
  provider: string;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  url: string;
  category: string;
  isLive: boolean;
  streamUrl?: string; // URL directe du flux HLS (optionnel)
  useIframe?: boolean; // Si true, utilise iframe au lieu de Video.js
  sources?: ChannelSource[]; // Sources alternatives
  // Nouveaux badges
  isNew?: boolean; // Chaîne ajoutée récemment (< 7 jours)
  isPopular?: boolean; // Chaîne populaire (nombre de vues élevé)
  quality?: 'HD' | '4K' | 'SD'; // Qualité du stream
  addedDate?: string; // Date d'ajout (format ISO)
  viewCount?: number; // Nombre de vues simulé
}

export const channels: Channel[] = [
  {
    id: '1',
    name: 'beINSPORT 1',
    description: 'Sports en direct - Couverture complète des événements sportifs mondiaux',
    thumbnail: '/images/channels/beIN SPORT.png',
    url: 'https://directfr.sbs/player/player.php?id=8',
    category: 'Sports',
    isLive: true,
    useIframe: true,
    isPopular: true,
    quality: 'HD',
    viewCount: 15420,
    sources: [
      {
        name: 'Source 1',
        url: 'https://directfr.sbs/player/player.php?id=8',
        provider: 'DirectFR'
      },
      {
        name: 'Source 2',
        url: 'https://tutvlive.ru/player/2/1',
        provider: 'TutVLive'
      },
      {
        name: 'Source 3',
        url: 'https://fstv.lol/player/fsplayer.php?id=44',
        provider: 'FSTV'
      },
      {
        name: 'Source 4',
        url: 'https://match-live.lol/ty/2/1',
        provider: 'MatchLive'
      }
    ]
  },
  {
    id: '2',
    name: 'beINSPORT 2',
    description: 'Sports en direct - Événements sportifs et compétitions internationales',
    thumbnail: '/images/channels/beIN SPORT.png',
    url: 'https://tutvlive.ru/player/2/2',
    category: 'Sports',
    isLive: true,
    useIframe: true,
    quality: 'HD',
    viewCount: 12890,
    sources: [
      {
        name: 'Source 1',
        url: 'https://tutvlive.ru/player/2/2',
        provider: 'TutVLive'
      },
      {
        name: 'Source 2',
        url: 'https://directfr.lat/player/player.php?id=9',
        provider: 'DirectFR'
      }
    ]
  },
  {
    id: '3',
    name: 'beINSPORT 3',
    description: 'Sports en direct - Matchs et événements sportifs exclusifs',
    thumbnail: '/images/channels/beIN SPORT.png',
    url: 'https://directfr.sbs/player/player.php?id=11',
    category: 'Sports',
    isLive: true,
    useIframe: true,
    sources: [
      {
        name: 'Source 1',
        url: 'https://directfr.sbs/player/player.php?id=11',
        provider: 'DirectFR'
      },
      {
        name: 'Source 2',
        url: 'https://fstv.lol/player/fsplayer.php?id=50',
        provider: 'FSTV'
      }
    ]
  },
  {
    id: '4',
    name: 'CANAL+',
    description: 'Chaîne premium - Films, séries et sports en exclusivité',
    thumbnail: '/images/channels/CANAL+.jpg',
    url: 'https://fstv.lol/player/fsplayer.php?id=106',
    category: 'Premium',
    isLive: true,
    useIframe: true,
    sources: [
      {
        name: 'Source 1',
        url: 'https://fstv.lol/player/fsplayer.php?id=106',
        provider: 'FSTV'
      },
      {
        name: 'Source 2',
        url: 'https://tutvlive.ru/player/2/11',
        provider: 'TutVLive'
      },
      {
        name: 'Source 3',
        url: 'https://match-live.lol/ty/2/11',
        provider: 'MatchLive'
      }
    ]
  },
  {
    id: '5',
    name: 'CANAL+ FOOT',
    description: 'Football en direct - Championnats et compétitions européennes',
    thumbnail: '/images/channels/canal-foot.jpg',
    url: 'https://fstv.lol/player/fsplayer.php?id=88',
    category: 'Sports',
    isLive: true,
    useIframe: true,
    sources: [
      {
        name: 'Source 1',
        url: 'https://fstv.lol/player/fsplayer.php?id=88',
        provider: 'FSTV'
      },
      {
        name: 'Source 2',
        url: 'https://directfr.sbs/2495c3df-f1ab-49bc-b894-283a4866d9a4',
        provider: 'DirectFR'
      },
      {
        name: 'Source 3',
        url: 'https://tutvlive.ru/player/2/12',
        provider: 'TutVLive'
      },
      {
        name: 'Source 4',
        url: 'https://match-live.lol/ty/2/12',
        provider: 'MatchLive'
      }
    ]
  },
  {
    id: '6',
    name: 'CANAL+ SPORT',
    description: 'Multi-sports en direct - Tous les événements sportifs',
    thumbnail: '/images/channels/canal-plus-sport.jpg',
    url: 'https://fstv.lol/player/fsplayer.php?id=88',
    category: 'Sports',
    isLive: true,
    useIframe: true,
    sources: [
      {
        name: 'Source 1',
        url: 'https://fstv.lol/player/fsplayer.php?id=88',
        provider: 'FSTV'
      }
    ]
  },
  {
    id: '7',
    name: 'CANAL+ SPORT 1',
    description: 'Sports premium - Événements sportifs en haute qualité',
    thumbnail: '/images/channels/canal-plus-sport.jpg',
    url: 'https://fstv.lol/player/fsplayer.php?id=55',
    category: 'Sports',
    isLive: true,
    useIframe: true,
    sources: [
      {
        name: 'Source 1',
        url: 'https://fstv.lol/player/fsplayer.php?id=55',
        provider: 'FSTV'
      }
    ]
  },
  {
    id: '8',
    name: 'DAZN 1',
    description: 'Sports en streaming - Football, boxing et événements majeurs',
    thumbnail: '/images/channels/DAZN.jpg',
    url: 'https://tutvlive.ru/player/2/20',
    category: 'Sports',
    isLive: true,
    useIframe: true,
    sources: [
      {
        name: 'Source 1',
        url: 'https://tutvlive.ru/player/2/20',
        provider: 'TutVLive'
      },
      {
        name: 'Source 2',
        url: 'https://fstv.lol/player/fsplayer.php?id=150',
        provider: 'FSTV'
      }
    ]
  },
  {
    id: '9',
    name: 'DAZN 2',
    description: 'Sports en streaming - Compétitions et championnats',
    thumbnail: '/images/channels/DAZN.jpg',
    url: 'https://fstv.lol/player/fsplayer.php?id=151',
    category: 'Sports',
    isLive: true,
    useIframe: true,
    sources: [
      {
        name: 'Source 1',
        url: 'https://fstv.lol/player/fsplayer.php?id=151',
        provider: 'FSTV'
      }
    ]
  },
  {
    id: '10',
    name: 'DAZN 3',
    description: 'Sports en streaming - Matchs et tournois internationaux',
    thumbnail: '/images/channels/DAZN.jpg',
    url: 'https://fstv.lol/player/fsplayer.php?id=160',
    category: 'Sports',
    isLive: true,
    useIframe: true,
    sources: [
      {
        name: 'Source 1',
        url: 'https://fstv.lol/player/fsplayer.php?id=160',
        provider: 'FSTV'
      }
    ]
  },
  {
    id: '11',
    name: 'EUROSPORT 1',
    description: 'Multi-sports européens - Tous les sports en direct',
    thumbnail: '/images/channels/Eurosport-Logo-2001.png',
    url: 'https://tutvlive.ru/player/2/15',
    category: 'Sports',
    isLive: true,
    useIframe: true,
    sources: [
      {
        name: 'Source 1',
        url: 'https://tutvlive.ru/player/2/15',
        provider: 'TutVLive'
      }
    ]
  },
  {
    id: '16',
    name: 'EUROSPORT 2',
    description: 'Multi-sports européens - Événements sportifs en direct',
    thumbnail: '/images/channels/Eurosport-Logo-2001.png',
    url: 'https://directfr.sbs/player/player.php?id=15',
    category: 'Sports',
    isLive: true,
    useIframe: true,
    quality: 'HD',
    viewCount: 11200,
    sources: [
      {
        name: 'Source 1',
        url: 'https://directfr.sbs/player/player.php?id=15',
        provider: 'DirectFR'
      }
    ]
  },
  {
    id: '12',
    name: 'WARNER TV',
    description: 'Séries et divertissement - Vos séries préférées en streaming',
    thumbnail: '/images/channels/warnertv.WEBP',
    url: 'https://fstv.lol/player/fsplayer.php?id=183',
    category: 'Series',
    isLive: true,
    useIframe: true,
    quality: 'HD',
    viewCount: 8450,
    sources: [
      {
        name: 'Source 1',
        url: 'https://fstv.lol/player/fsplayer.php?id=183',
        provider: 'FSTV'
      },
      {
        name: 'Source 2',
        url: 'https://directfr.lat/player/player.php?id=53',
        provider: 'DirectFR'
      }
    ]
  },
  {
    id: '13',
    name: 'RMC SPORT 1',
    description: 'Sports en direct - Football, rugby et sports de combat',
    thumbnail: '/images/channels/rmc.PNG',
    url: 'https://directfr.lat/player/player.php?id=1',
    category: 'Sports',
    isLive: true,
    useIframe: true,
    isPopular: true,
    quality: 'HD',
    viewCount: 16200,
    sources: [
      {
        name: 'Source 1',
        url: 'https://directfr.lat/player/player.php?id=1',
        provider: 'DirectFR'
      },
      {
        name: 'Source 2',
        url: 'https://fstv.lol/player/fsplayer.php?id=33',
        provider: 'FSTV'
      }
    ]
  },
  {
    id: '14',
    name: 'RMC SPORT 2',
    description: 'Sports en direct - Compétitions sportives et événements exclusifs',
    thumbnail: '/images/channels/rmc2.PNG',
    url: 'https://directfr.lat/player/player.php?id=2',
    category: 'Sports',
    isLive: true,
    useIframe: true,
    quality: 'HD',
    viewCount: 13850,
    sources: [
      {
        name: 'Source 1',
        url: 'https://directfr.lat/player/player.php?id=2',
        provider: 'DirectFR'
      },
      {
        name: 'Source 2',
        url: 'https://fstv.lol/player/fsplayer.php?id=40',
        provider: 'FSTV'
      }
    ]
  },
  {
    id: '15',
    name: 'RMC SPORT 3',
    description: 'Sports en direct - Couverture sportive complète et variée',
    thumbnail: '/images/channels/rmc3.PNG',
    url: 'https://directfr.lat/player/player.php?id=4',
    category: 'Sports',
    isLive: true,
    useIframe: true,
    quality: 'HD',
    viewCount: 11670,
    sources: [
      {
        name: 'Source 1',
        url: 'https://directfr.lat/player/player.php?id=4',
        provider: 'DirectFR'
      },
      {
        name: 'Source 2',
        url: 'https://fstv.lol/player/fsplayer.php?id=42',
        provider: 'FSTV'
      }
    ]
  },
  {
    id: '17',
    name: 'DAZN IT',
    description: 'Sports en streaming Italie - Football, boxe et événements majeurs',
    thumbnail: '/images/channels/DAZN.jpg',
    url: 'https://ar.kora-plus.top/frame.php?ch=daznit_1&p=12&token=ca053014-8310-4f36-9643-591d3f09b27b&kt=1762113478',
    category: 'Sports',
    isLive: true,
    useIframe: true,
    quality: 'HD',
    isPopular: true,
    viewCount: 18900,
    sources: [
      {
        name: 'Source 1',
        url: 'https://ar.kora-plus.top/frame.php?ch=daznit_1&p=12&token=ca053014-8310-4f36-9643-591d3f09b27b&kt=1762113478',
        provider: 'KoraPlus'
      }
    ]
  },
];

