// Planning des matches sportifs généré automatiquement
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
  channelsByDay: {
  "SUNDAY": {
    "HD1": "ENGLISH",
    "HD2": "ENGLISH",
    "HD3": "GERMAN",
    "HD4": "FRENCH",
    "HD5": "ENGLISH",
    "HD6": "SPANISH",
    "HD7": "ITALIAN",
    "HD8": "SPANISH",
    "HD9": "GREEK & SPANISH",
    "HD10": "SPANISH",
    "HD11": "SPANISH",
    "BR1": "BRAZILIAN",
    "BR2": "BRAZILIAN",
    "BR3": "BRAZILIAN",
    "BR4": "BRAZILIAN",
    "BR5": "BRAZILIAN",
    "BR6": "BRAZILIAN"
  },
  "MONDAY": {
    "HD1": "ENGLISH",
    "HD2": "ENGLISH",
    "HD3": "GERMAN",
    "HD4": "FRENCH",
    "HD5": "ENGLISH & SPANISH",
    "HD6": "SPANISH",
    "HD7": "ITALIAN",
    "HD8": "ITALIAN & SPANISH",
    "HD9": "SPANISH",
    "HD10": "ENGLISH & DUTCH & SPANISH",
    "HD11": "SPANISH",
    "BR1": "BRAZILIAN",
    "BR2": "BRAZILIAN",
    "BR3": "BRAZILIAN",
    "BR4": "BRAZILIAN",
    "BR5": "BRAZILIAN",
    "BR6": "BRAZILIAN"
  },
  "TUESDAY": {
    "HD1": "ENGLISH",
    "HD2": "ENGLISH",
    "HD3": "GERMAN",
    "HD4": "FRENCH",
    "HD5": "ENGLISH & SPANISH",
    "HD6": "SPANISH",
    "HD7": "ITALIAN",
    "HD8": "ITALIAN & SPANISH",
    "HD9": "SPANISH",
    "HD10": "ENGLISH & DUTCH & SPANISH",
    "HD11": "SPANISH",
    "BR1": "BRAZILIAN",
    "BR2": "BRAZILIAN",
    "BR3": "BRAZILIAN",
    "BR4": "BRAZILIAN",
    "BR5": "BRAZILIAN",
    "BR6": "BRAZILIAN"
  },
  "WEDNESDAY": {
    "HD1": "ENGLISH",
    "HD2": "ENGLISH",
    "HD3": "GERMAN",
    "HD4": "FRENCH",
    "HD5": "ENGLISH & SPANISH",
    "HD6": "SPANISH",
    "HD7": "ITALIAN",
    "HD8": "ITALIAN & SPANISH",
    "HD9": "SPANISH",
    "HD10": "ENGLISH & DUTCH & SPANISH",
    "HD11": "SPANISH",
    "BR1": "BRAZILIAN",
    "BR2": "BRAZILIAN",
    "BR3": "BRAZILIAN",
    "BR4": "BRAZILIAN",
    "BR5": "BRAZILIAN",
    "BR6": "BRAZILIAN"
  },
  "THURSDAY": {
    "HD1": "ENGLISH",
    "HD2": "ENGLISH",
    "HD3": "GERMAN",
    "HD4": "FRENCH",
    "HD5": "ENGLISH & SPANISH",
    "HD6": "SPANISH",
    "HD7": "ITALIAN",
    "HD8": "ITALIAN & SPANISH",
    "HD9": "SPANISH",
    "HD10": "ENGLISH & DUTCH & SPANISH",
    "HD11": "SPANISH",
    "BR1": "BRAZILIAN",
    "BR2": "BRAZILIAN",
    "BR3": "BRAZILIAN",
    "BR4": "BRAZILIAN",
    "BR5": "BRAZILIAN",
    "BR6": "BRAZILIAN"
  },
  "FRIDAY": {
    "HD1": "ENGLISH",
    "HD2": "ENGLISH",
    "HD3": "GERMAN",
    "HD4": "FRENCH",
    "HD5": "ENGLISH & SPANISH",
    "HD6": "SPANISH",
    "HD7": "ITALIAN",
    "HD8": "ITALIAN & SPANISH",
    "HD9": "SPANISH",
    "HD10": "ENGLISH & DUTCH & SPANISH",
    "HD11": "SPANISH",
    "BR1": "BRAZILIAN",
    "BR2": "BRAZILIAN",
    "BR3": "BRAZILIAN",
    "BR4": "BRAZILIAN",
    "BR5": "BRAZILIAN",
    "BR6": "BRAZILIAN"
  },
  "SATURDAY": {
    "HD1": "ENGLISH",
    "HD2": "ENGLISH",
    "HD3": "GERMAN",
    "HD4": "FRENCH",
    "HD5": "ENGLISH",
    "HD6": "SPANISH",
    "HD7": "ITALIAN",
    "HD8": "ITALIAN",
    "HD9": "ENGLISH & DUTCH & SPANISH",
    "HD10": "GERMAN & TURKISH & SPANISH",
    "HD11": "GERMAN & ENGLISH & SPANISH",
    "BR1": "BRAZILIAN",
    "BR2": "BRAZILIAN",
    "BR3": "BRAZILIAN",
    "BR4": "BRAZILIAN",
    "BR5": "BRAZILIAN",
    "BR6": "BRAZILIAN"
  }
},
  matches: {
  "SUNDAY": [
    {
      "time": "19:00",
      "name": "AEK Athens x Panaitolikos",
      "url": "https://sportzonline.live/channels/hd/hd9.php"
    },
    {
      "time": "19:00",
      "name": "Estudiantes x Boca Juniors",
      "url": "https://sportzonline.live/channels/hd/hd11.php"
    },
    {
      "time": "19:00",
      "name": "Estudiantes x Boca Juniors",
      "url": "https://sportzonline.live/channels/pt/sporttv5.php"
    },
    {
      "time": "19:00",
      "name": "Corinthians x Grêmio",
      "url": "https://sportzonline.live/channels/bra/br4.php"
    },
    {
      "time": "19:00",
      "name": "Bahia x RB Bragantino",
      "url": "https://sportzonline.live/channels/bra/br5.php"
    },
    {
      "time": "19:00",
      "name": "Ceará x Fluminense",
      "url": "https://sportzonline.live/channels/bra/br3.php"
    },
    {
      "time": "19:45",
      "name": "Milan x Roma",
      "url": "https://sportzonline.live/channels/hd/hd5.php"
    },
    {
      "time": "19:45",
      "name": "Milan x Roma",
      "url": "https://sportzonline.live/channels/hd/hd7.php"
    },
    {
      "time": "19:45",
      "name": "Milan x Roma",
      "url": "https://sportzonline.live/channels/hd/hd3.php"
    },
    {
      "time": "19:45",
      "name": "Milan x Roma",
      "url": "https://sportzonline.live/channels/pt/sporttv3.php"
    },
    {
      "time": "19:45",
      "name": "Milan x Roma",
      "url": "https://sportzonline.live/channels/bra/br2.php"
    },
    {
      "time": "19:45",
      "name": "Brest x Olympique Lyonnais",
      "url": "https://sportzonline.live/channels/hd/hd4.php"
    },
    {
      "time": "20:00",
      "name": "Real Betis x Mallorca",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "20:00",
      "name": "Real Betis x Mallorca",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "20:00",
      "name": "Real Betis x Mallorca",
      "url": "https://sportzonline.live/channels/pt/eleven1.php"
    },
    {
      "time": "20:00",
      "name": "Real Zaragoza x Deportivo La Coruña",
      "url": "https://sportzonline.live/channels/pt/eleven3.php"
    },
    {
      "time": "20:30",
      "name": "Porto x Sporting Braga",
      "url": "https://sportzonline.live/channels/pt/sporttv1.php"
    },
    {
      "time": "20:30",
      "name": "Atlético Grau x Alianza Atlético",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "20:30",
      "name": "Coquimbo Unido x Unión La Calera",
      "url": "https://sportzonline.live/channels/hd/hd8.php"
    },
    {
      "time": "20:30",
      "name": "NBA: New Orleans Pelicans @ Oklahoma City Thunder",
      "url": "https://sportzonline.live/channels/pt/sporttv2.php"
    },
    {
      "time": "21:15",
      "name": "NFL: Kansas City Chiefs @ Buffalo Bills",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    },
    {
      "time": "21:15",
      "name": "NFL: Kansas City Chiefs @ Buffalo Bills",
      "url": "https://sportzonline.live/channels/pt/eleven2.php"
    },
    {
      "time": "21:30",
      "name": "Juventude x Palmeiras",
      "url": "https://sportzonline.live/channels/bra/br1.php"
    },
    {
      "time": "21:30",
      "name": "Internacional x Atlético Mineiro",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "23:00",
      "name": "Sport Boys x UTC Cajamarca",
      "url": "https://sportzonline.live/channels/hd/hd11.php"
    },
    {
      "time": "23:00",
      "name": "Cienciano x Juan Pablo II College",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "23:00",
      "name": "Querétaro x Mazatlán",
      "url": "https://sportzonline.live/channels/hd/hd9.php"
    },
    {
      "time": "23:30",
      "name": "Everton x Unión Española",
      "url": "https://sportzonline.live/channels/hd/hd8.php"
    },
    {
      "time": "23:30",
      "name": "River Plate x Gimnasia La Plata",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "23:30",
      "name": "River Plate x Gimnasia La Plata",
      "url": "https://sportzonline.live/channels/pt/sporttv2.php"
    },
    {
      "time": "23:30",
      "name": "Vasco da Gama x São Paulo",
      "url": "https://sportzonline.live/channels/bra/br5.php"
    },
    {
      "time": "00:00",
      "name": "NBA: Chicago Bulls @ New York Knicks",
      "url": "https://sportzonline.live/channels/pt/sporttv1.php"
    },
    {
      "time": "01:10",
      "name": "NFL: Seattle Seahawks @ Washington Commanders",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    },
    {
      "time": "01:45",
      "name": "Austin x Los Angeles FC",
      "url": "https://sportzonline.live/channels/hd/hd5.php"
    }
  ],
  "MONDAY": [
    {
      "time": "13:00",
      "name": "ATP World Tour 250: Metz",
      "url": "https://sportzonline.live/channels/pt/sporttv3.php"
    },
    {
      "time": "13:45",
      "name": "Nasaf x Al Wahda",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "16:00",
      "name": "Al Duhail x Shabab Al Ahli",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "17:00",
      "name": "Wisła Płock x Pogoń Szczecin",
      "url": "https://sportzonline.live/channels/hd/hd3.php"
    },
    {
      "time": "17:00",
      "name": "Alanyaspor x Gaziantep FK",
      "url": "https://sportzonline.live/channels/hd/hd11.php"
    },
    {
      "time": "17:30",
      "name": "Sassuolo x Genoa",
      "url": "https://sportzonline.live/channels/hd/hd7.php"
    },
    {
      "time": "17:30",
      "name": "Sassuolo x Genoa",
      "url": "https://sportzonline.live/channels/pt/sporttv2.php"
    },
    {
      "time": "18:00",
      "name": "UD Oliveirense x Marítimo",
      "url": "https://sportzonline.live/channels/pt/sporttv4.php"
    },
    {
      "time": "18:15",
      "name": "Al Gharafa x Al Hilal",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "19:30",
      "name": "Tamworth x Leyton Orient",
      "url": "https://sportzonline.live/channels/hd/hd5.php"
    },
    {
      "time": "19:30",
      "name": "Real Valladolid x Granada",
      "url": "https://sportzonline.live/channels/hd/hd9.php"
    },
    {
      "time": "19:30",
      "name": "Real Valladolid x Granada",
      "url": "https://sportzonline.live/channels/pt/eleven3.php"
    },
    {
      "time": "19:30",
      "name": "Cracovia Kraków x Zagłębie Lubin",
      "url": "https://sportzonline.live/channels/hd/hd3.php"
    },
    {
      "time": "19:45",
      "name": "Lazio x Cagliari",
      "url": "https://sportzonline.live/channels/hd/hd8.php"
    },
    {
      "time": "19:45",
      "name": "Lazio x Cagliari",
      "url": "https://sportzonline.live/channels/bra/br3.php"
    },
    {
      "time": "19:45",
      "name": "Pau x Troyes",
      "url": "https://sportzonline.live/channels/hd/hd4.php"
    },
    {
      "time": "19:45",
      "name": "Defensa y Justicia x Huracán",
      "url": "https://sportzonline.live/channels/hd/hd11.php"
    },
    {
      "time": "20:00",
      "name": "Sunderland x Everton",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    },
    {
      "time": "20:00",
      "name": "Sunderland x Everton",
      "url": "https://sportzonline.live/channels/pt/eleven1.php"
    },
    {
      "time": "20:00",
      "name": "Sunderland x Everton",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "20:00",
      "name": "Real Oviedo x Osasuna",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "20:00",
      "name": "Real Oviedo x Osasuna",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "20:00",
      "name": "Real Oviedo x Osasuna",
      "url": "https://sportzonline.live/channels/pt/eleven2.php"
    },
    {
      "time": "20:00",
      "name": "União de Leiria x Chaves",
      "url": "https://sportzonline.live/channels/pt/sporttv2.php"
    },
    {
      "time": "20:45",
      "name": "Gil Vicente x Santa Clara",
      "url": "https://sportzonline.live/channels/pt/sporttv1.php"
    },
    {
      "time": "22:00",
      "name": "Palestino x Deportes Limache",
      "url": "https://sportzonline.live/channels/hd/hd8.php"
    },
    {
      "time": "22:00",
      "name": "Central Córdoba SdE x Racing Club",
      "url": "https://sportzonline.live/channels/hd/hd9.php"
    },
    {
      "time": "22:00",
      "name": "Central Córdoba SdE x Racing Club",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "22:00",
      "name": "América Mineiro x Novorizontino",
      "url": "https://sportzonline.live/channels/bra/br2.php"
    },
    {
      "time": "23:20",
      "name": "América de Cali x Unión Magdalena",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "00:00",
      "name": "Libertad x Independiente del Valle",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "00:00",
      "name": "NBA: Brooklyn Nets @ Minnesota Timberwolves",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "00:15",
      "name": "Banfield x Lanús",
      "url": "https://sportzonline.live/channels/hd/hd9.php"
    },
    {
      "time": "00:15",
      "name": "Belgrano x Tigre",
      "url": "https://sportzonline.live/channels/hd/hd11.php"
    },
    {
      "time": "01:00",
      "name": "NFL: Arizona Cardinals @ Dallas Cowboys",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    },
    {
      "time": "01:00",
      "name": "NFL: Arizona Cardinals @ Dallas Cowboys",
      "url": "https://sportzonline.live/channels/bra/br3.php"
    },
    {
      "time": "01:00",
      "name": "NBA: Dallas Mavericks @ Houston Rockets",
      "url": "https://sportzonline.live/channels/pt/sporttv1.php"
    },
    {
      "time": "01:30",
      "name": "Deportes Tolima x Llaneros",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "03:00",
      "name": "NBA: Los Angeles Lakers @ Portland Trail Blazers",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "03:45",
      "name": "Seattle Sounders FC x Minnesota United",
      "url": "https://sportzonline.live/channels/hd/hd5.php"
    }
  ],
  "TUESDAY": [
    {
      "time": "09:00",
      "name": "England U16 x Portugal U16",
      "url": "https://sportzonline.live/channels/pt/sporttv1.php"
    },
    {
      "time": "13:00",
      "name": "PSG U19 x Bayern U19",
      "url": "https://sportzonline.live/channels/hd/hd4.php"
    },
    {
      "time": "13:00",
      "name": "PSG U19 x Bayern U19",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "13:00",
      "name": "PSG U19 x Bayern U19",
      "url": "https://sportzonline.live/channels/pt/eleven1.php"
    },
    {
      "time": "13:00",
      "name": "Wales U16 x Turkey U16",
      "url": "https://sportzonline.live/channels/pt/sporttv1.php"
    },
    {
      "time": "13:00",
      "name": "ATP World Tour 250: Metz",
      "url": "https://sportzonline.live/channels/pt/sporttv3.php"
    },
    {
      "time": "15:00",
      "name": "Liverpool U19 x Real Madrid U19",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "15:00",
      "name": "Liverpool U19 x Real Madrid U19",
      "url": "https://sportzonline.live/channels/hd/hd4.php"
    },
    {
      "time": "15:00",
      "name": "Liverpool U19 x Real Madrid U19",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "15:00",
      "name": "Liverpool U19 x Real Madrid U19",
      "url": "https://sportzonline.live/channels/pt/eleven2.php"
    },
    {
      "time": "15:00",
      "name": "Atlético Madrid U19 x R. Union SG U19",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "16:00",
      "name": "Torreense x Felgueiras 1932",
      "url": "https://sportzonline.live/channels/pt/sporttv4.php"
    },
    {
      "time": "16:00",
      "name": "Al Sadd x Al-Ahli",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "17:45",
      "name": "Slavia Praha x Arsenal",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    },
    {
      "time": "17:45",
      "name": "Slavia Praha x Arsenal",
      "url": "https://sportzonline.live/channels/hd/hd4.php"
    },
    {
      "time": "17:45",
      "name": "Slavia Praha x Arsenal",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "17:45",
      "name": "Slavia Praha x Arsenal",
      "url": "https://sportzonline.live/channels/hd/hd8.php"
    },
    {
      "time": "17:45",
      "name": "Slavia Praha x Arsenal",
      "url": "https://sportzonline.live/channels/pt/eleven1.php"
    },
    {
      "time": "17:45",
      "name": "Slavia Praha x Arsenal",
      "url": "https://sportzonline.live/channels/bra/br3.php"
    },
    {
      "time": "17:45",
      "name": "Napoli x Eintracht Frankfurt",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "17:45",
      "name": "Napoli x Eintracht Frankfurt",
      "url": "https://sportzonline.live/channels/hd/hd7.php"
    },
    {
      "time": "17:45",
      "name": "Napoli x Eintracht Frankfurt",
      "url": "https://sportzonline.live/channels/pt/eleven2.php"
    },
    {
      "time": "17:45",
      "name": "Napoli x Eintracht Frankfurt",
      "url": "https://sportzonline.live/channels/bra/br4.php"
    },
    {
      "time": "18:00",
      "name": "Academico Viseu x Lusitania FC Lourosa",
      "url": "https://sportzonline.live/channels/pt/sporttv1.php"
    },
    {
      "time": "18:15",
      "name": "Al Ittihad x Al Sharjah",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "20:00",
      "name": "PSG x Bayern München",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "20:00",
      "name": "PSG x Bayern München",
      "url": "https://sportzonline.live/channels/hd/hd3.php"
    },
    {
      "time": "20:00",
      "name": "PSG x Bayern München",
      "url": "https://sportzonline.live/channels/hd/hd4.php"
    },
    {
      "time": "20:00",
      "name": "PSG x Bayern München",
      "url": "https://sportzonline.live/channels/pt/eleven2.php"
    },
    {
      "time": "20:00",
      "name": "PSG x Bayern München",
      "url": "https://sportzonline.live/channels/bra/br4.php"
    },
    {
      "time": "20:00",
      "name": "Juventus x Sporting CP",
      "url": "https://sportzonline.live/channels/hd/hd9.php"
    },
    {
      "time": "20:00",
      "name": "Juventus x Sporting CP",
      "url": "https://sportzonline.live/channels/hd/hd7.php"
    },
    {
      "time": "20:00",
      "name": "Juventus x Sporting CP",
      "url": "https://sportzonline.live/channels/pt/sporttv5.php"
    },
    {
      "time": "20:00",
      "name": "Juventus x Sporting CP",
      "url": "https://sportzonline.live/channels/bra/br2.php"
    },
    {
      "time": "20:00",
      "name": "Tottenham Hotspur x København",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    },
    {
      "time": "20:00",
      "name": "Tottenham Hotspur x København",
      "url": "https://sportzonline.live/channels/bra/br1.php"
    },
    {
      "time": "20:00",
      "name": "Liverpool x Real Madrid",
      "url": "https://sportzonline.live/channels/hd/hd5.php"
    },
    {
      "time": "20:00",
      "name": "Liverpool x Real Madrid",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "20:00",
      "name": "Liverpool x Real Madrid",
      "url": "https://sportzonline.live/channels/pt/eleven1.php"
    },
    {
      "time": "20:00",
      "name": "Liverpool x Real Madrid",
      "url": "https://sportzonline.live/channels/bra/br3.php"
    },
    {
      "time": "20:00",
      "name": "Atlético Madrid x Union Saint-Gilloise",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "20:00",
      "name": "Atlético Madrid x Union Saint-Gilloise",
      "url": "https://sportzonline.live/channels/pt/eleven3.php"
    },
    {
      "time": "20:00",
      "name": "Atlético Madrid x Union Saint-Gilloise",
      "url": "https://sportzonline.live/channels/bra/br5.php"
    },
    {
      "time": "20:00",
      "name": "Olympiakos Piraeus x PSV",
      "url": "https://sportzonline.live/channels/hd/hd11.php"
    },
    {
      "time": "20:00",
      "name": "Olympiakos Piraeus x PSV",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "20:00",
      "name": "Bodø / Glimt x Monaco",
      "url": "https://sportzonline.live/channels/hd/hd8.php"
    },
    {
      "time": "20:00",
      "name": "Coventry City x Sheffield United",
      "url": "https://sportzonline.live/channels/pt/sporttv2.php"
    },
    {
      "time": "00:00",
      "name": "LDU Quito x Orense",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "01:00",
      "name": "NBA: Orlando Magic @ Atlanta Hawks",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    },
    {
      "time": "01:00",
      "name": "NBA: Orlando Magic @ Atlanta Hawks",
      "url": "https://sportzonline.live/channels/pt/sporttv1.php"
    },
    {
      "time": "04:00",
      "name": "NBA: Oklahoma City @ La Clippers",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    }
  ],
  "WEDNESDAY": [
    {
      "time": "11:00",
      "name": "Benfica U19 x Bayer Leverkusen U19",
      "url": "https://sportzonline.live/channels/pt/eleven1.php"
    },
    {
      "time": "13:00",
      "name": "Ajax U19 x Galatasaray U19",
      "url": "https://sportzonline.live/channels/hd/hd9.php"
    },
    {
      "time": "13:00",
      "name": "ATP World Tour 250: Metz",
      "url": "https://sportzonline.live/channels/pt/sporttv3.php"
    },
    {
      "time": "13:35",
      "name": "FC Arkadag x Al Ahli SC",
      "url": "https://sportzonline.live/channels/hd/hd11.php"
    },
    {
      "time": "15:00",
      "name": "Newcastle U19 x Athletic U19",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "15:00",
      "name": "Newcastle U19 x Athletic U19",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "15:00",
      "name": "Porto U19 x Bravo U19",
      "url": "https://sportzonline.live/channels/pt/eleven1.php"
    },
    {
      "time": "17:45",
      "name": "Qarabağ x Chelsea",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "17:45",
      "name": "Qarabağ x Chelsea",
      "url": "https://sportzonline.live/channels/hd/hd3.php"
    },
    {
      "time": "17:45",
      "name": "Qarabağ x Chelsea",
      "url": "https://sportzonline.live/channels/pt/eleven1.php"
    },
    {
      "time": "17:45",
      "name": "Qarabağ x Chelsea",
      "url": "https://sportzonline.live/channels/bra/br3.php"
    },
    {
      "time": "17:45",
      "name": "Paphos x Villarreal",
      "url": "https://sportzonline.live/channels/hd/hd5.php"
    },
    {
      "time": "17:45",
      "name": "Paphos x Villarreal",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "17:45",
      "name": "Paphos x Villarreal",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "17:45",
      "name": "Paphos x Villarreal",
      "url": "https://sportzonline.live/channels/pt/eleven2.php"
    },
    {
      "time": "17:45",
      "name": "Paphos x Villarreal",
      "url": "https://sportzonline.live/channels/bra/br4.php"
    },
    {
      "time": "18:15",
      "name": "Al Nassr x Goa",
      "url": "https://sportzonline.live/channels/hd/hd4.php"
    },
    {
      "time": "18:15",
      "name": "Al Nassr x Goa",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "20:00",
      "name": "Newcastle United x Athletic Club",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "20:00",
      "name": "Newcastle United x Athletic Club",
      "url": "https://sportzonline.live/channels/hd/hd9.php"
    },
    {
      "time": "20:00",
      "name": "Newcastle United x Athletic Club",
      "url": "https://sportzonline.live/channels/bra/br4.php"
    },
    {
      "time": "20:00",
      "name": "Manchester City x Borussia Dortmund",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    },
    {
      "time": "20:00",
      "name": "Manchester City x Borussia Dortmund",
      "url": "https://sportzonline.live/channels/hd/hd3.php"
    },
    {
      "time": "20:00",
      "name": "Manchester City x Borussia Dortmund",
      "url": "https://sportzonline.live/channels/pt/eleven1.php"
    },
    {
      "time": "20:00",
      "name": "Manchester City x Borussia Dortmund",
      "url": "https://sportzonline.live/channels/bra/br1.php"
    },
    {
      "time": "20:00",
      "name": "Club Brugge x Barcelona",
      "url": "https://sportzonline.live/channels/hd/hd5.php"
    },
    {
      "time": "20:00",
      "name": "Club Brugge x Barcelona",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "20:00",
      "name": "Club Brugge x Barcelona",
      "url": "https://sportzonline.live/channels/pt/eleven2.php"
    },
    {
      "time": "20:00",
      "name": "Club Brugge x Barcelona",
      "url": "https://sportzonline.live/channels/bra/br3.php"
    },
    {
      "time": "20:00",
      "name": "Internazionale x Kairat",
      "url": "https://sportzonline.live/channels/hd/hd11.php"
    },
    {
      "time": "20:00",
      "name": "Internazionale x Kairat",
      "url": "https://sportzonline.live/channels/hd/hd7.php"
    },
    {
      "time": "20:00",
      "name": "Internazionale x Kairat",
      "url": "https://sportzonline.live/channels/pt/eleven3.php"
    },
    {
      "time": "20:00",
      "name": "Internazionale x Kairat",
      "url": "https://sportzonline.live/channels/bra/br2.php"
    },
    {
      "time": "20:00",
      "name": "Benfica x Bayer Leverkusen",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "20:00",
      "name": "Benfica x Bayer Leverkusen",
      "url": "https://sportzonline.live/channels/pt/sporttv5.php"
    },
    {
      "time": "20:00",
      "name": "Benfica x Bayer Leverkusen",
      "url": "https://sportzonline.live/channels/bra/br5.php"
    },
    {
      "time": "20:00",
      "name": "Olympique Marseille x Atalanta",
      "url": "https://sportzonline.live/channels/hd/hd8.php"
    },
    {
      "time": "20:00",
      "name": "Ajax x Galatasaray",
      "url": "https://sportzonline.live/channels/hd/hd4.php"
    },
    {
      "time": "20:00",
      "name": "Portsmouth x Wrexham",
      "url": "https://sportzonline.live/channels/pt/sporttv1.php"
    },
    {
      "time": "22:00",
      "name": "RB Bragantino x Corinthians",
      "url": "https://sportzonline.live/channels/bra/br1.php"
    },
    {
      "time": "22:00",
      "name": "Sport Recife x Juventude",
      "url": "https://sportzonline.live/channels/bra/br2.php"
    },
    {
      "time": "22:00",
      "name": "Vitória x Internacional",
      "url": "https://sportzonline.live/channels/bra/br3.php"
    },
    {
      "time": "22:30",
      "name": "Botafogo x Vasco da Gama",
      "url": "https://sportzonline.live/channels/bra/br4.php"
    },
    {
      "time": "23:00",
      "name": "Grêmio x Cruzeiro",
      "url": "https://sportzonline.live/channels/bra/br5.php"
    },
    {
      "time": "23:00",
      "name": "Atlético Mineiro x Bahia",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "00:10",
      "name": "Independiente Rivadavia x Argentinos Juniors",
      "url": "https://sportzonline.live/channels/hd/hd11.php"
    },
    {
      "time": "00:10",
      "name": "Independiente Rivadavia x Argentinos Juniors",
      "url": "https://sportzonline.live/channels/pt/sporttv2.php"
    },
    {
      "time": "00:30",
      "name": "São Paulo x Flamengo",
      "url": "https://sportzonline.live/channels/bra/br1.php"
    },
    {
      "time": "00:30",
      "name": "São Paulo x Flamengo",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "00:30",
      "name": "NBA: Washington Wizards @ Boston Celtics",
      "url": "https://sportzonline.live/channels/pt/sporttv1.php"
    },
    {
      "time": "00:30",
      "name": "NBA: Minnesota Timberwolves @ New York Knicks",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "03:00",
      "name": "NBA: San Antonio Spurs @ Los Angeles Lakers",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "03:00",
      "name": "NBA: San Antonio Spurs @ Los Angeles Lakers",
      "url": "https://sportzonline.live/channels/pt/sporttv2.php"
    }
  ],
  "THURSDAY": [
    {
      "time": "07:00",
      "name": "DP World Tour: Abu Dhabi Championship - D1",
      "url": "https://sportzonline.live/channels/pt/sporttv3.php"
    },
    {
      "time": "07:45",
      "name": "Macarthur x Cong An Hanoi",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "10:00",
      "name": "Pohang Steelers x Tampines Rovers",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "10:00",
      "name": "Lion City Sailors x Bangkok United",
      "url": "https://sportzonline.live/channels/hd/hd3.php"
    },
    {
      "time": "12:15",
      "name": "Selangor x Persib",
      "url": "https://sportzonline.live/channels/hd/hd3.php"
    },
    {
      "time": "12:15",
      "name": "Bangkok Glass x Kaya",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "13:00",
      "name": "ATP World Tour 250: Metz",
      "url": "https://sportzonline.live/channels/pt/sporttv2.php"
    },
    {
      "time": "14:15",
      "name": "Al Ahly FC x Ceramica Cleopatra",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "17:15",
      "name": "Zamalek x Pyramids",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "17:45",
      "name": "Sturm Graz x Nottingham Forest",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    },
    {
      "time": "17:45",
      "name": "Midtjylland x Celtic",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "17:45",
      "name": "Nice x Freiburg",
      "url": "https://sportzonline.live/channels/hd/hd4.php"
    },
    {
      "time": "17:45",
      "name": "Nice x Freiburg",
      "url": "https://sportzonline.live/channels/pt/eleven2.php"
    },
    {
      "time": "17:45",
      "name": "Dinamo Zagreb x Celta de Vigo",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "17:45",
      "name": "Utrecht x Porto",
      "url": "https://sportzonline.live/channels/hd/hd9.php"
    },
    {
      "time": "17:45",
      "name": "Utrecht x Porto",
      "url": "https://sportzonline.live/channels/pt/sporttv5.php"
    },
    {
      "time": "17:45",
      "name": "Crvena Zvezda x Lille",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "17:45",
      "name": "Crvena Zvezda x Lille",
      "url": "https://sportzonline.live/channels/pt/eleven3.php"
    },
    {
      "time": "17:45",
      "name": "Malmö FF x Panathinaikos",
      "url": "https://sportzonline.live/channels/hd/hd11.php"
    },
    {
      "time": "17:45",
      "name": "Salzburg x Go Ahead Eagles",
      "url": "https://sportzonline.live/channels/hd/hd8.php"
    },
    {
      "time": "17:45",
      "name": "Basel x FCSB",
      "url": "https://sportzonline.live/channels/hd/hd3.php"
    },
    {
      "time": "17:45",
      "name": "Mainz 05 x Fiorentina",
      "url": "https://sportzonline.live/channels/hd/hd7.php"
    },
    {
      "time": "17:45",
      "name": "AEK Athens x Shamrock Rovers",
      "url": "https://sportzonline.live/channels/hd/hd5.php"
    },
    {
      "time": "20:00",
      "name": "Rangers x Roma",
      "url": "https://sportzonline.live/channels/hd/hd5.php"
    },
    {
      "time": "20:00",
      "name": "Rangers x Roma",
      "url": "https://sportzonline.live/channels/hd/hd7.php"
    },
    {
      "time": "20:00",
      "name": "Crystal Palace x AZ",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    },
    {
      "time": "20:00",
      "name": "Aston Villa x Maccabi Tel Aviv",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "20:00",
      "name": "Häcken x Strasbourg",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "20:00",
      "name": "Real Betis x Olympique Lyonnais",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "20:00",
      "name": "Real Betis x Olympique Lyonnais",
      "url": "https://sportzonline.live/channels/pt/eleven3.php"
    },
    {
      "time": "20:00",
      "name": "Stuttgart x Feyenoord",
      "url": "https://sportzonline.live/channels/hd/hd3.php"
    },
    {
      "time": "20:00",
      "name": "Stuttgart x Feyenoord",
      "url": "https://sportzonline.live/channels/pt/eleven2.php"
    },
    {
      "time": "20:00",
      "name": "Bologna x Brann",
      "url": "https://sportzonline.live/channels/hd/hd8.php"
    },
    {
      "time": "20:00",
      "name": "PAOK x Young Boys",
      "url": "https://sportzonline.live/channels/hd/hd11.php"
    },
    {
      "time": "20:00",
      "name": "Viktoria Plzeň x Fenerbahçe",
      "url": "https://sportzonline.live/channels/hd/hd9.php"
    },
    {
      "time": "20:00",
      "name": "Sporting Braga x Genk",
      "url": "https://sportzonline.live/channels/pt/eleven1.php"
    },
    {
      "time": "20:00",
      "name": "Rayo Vallecano x Lech Poznań",
      "url": "https://sportzonline.live/channels/hd/hd4.php"
    },
    {
      "time": "22:30",
      "name": "Fluminense x Mirassol",
      "url": "https://sportzonline.live/channels/bra/br3.php"
    },
    {
      "time": "23:00",
      "name": "Ceará x Fortaleza",
      "url": "https://sportzonline.live/channels/bra/br4.php"
    },
    {
      "time": "00:30",
      "name": "Palmeiras x Santos",
      "url": "https://sportzonline.live/channels/bra/br1.php"
    },
    {
      "time": "02:00",
      "name": "NBA: LA Clippers @ Phoenix Suns",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "02:00",
      "name": "NBA: LA Clippers @ Phoenix Suns",
      "url": "https://sportzonline.live/channels/pt/sporttv1.php"
    }
  ],
  "FRIDAY": [
    {
      "time": "07:00",
      "name": "DP World Tour: Abu Dhabi Championship - D1",
      "url": "https://sportzonline.live/channels/pt/sporttv3.php"
    },
    {
      "time": "09:00",
      "name": "MotoGP: Portugal FP1",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "09:00",
      "name": "MotoGP: Portugal FP1",
      "url": "https://sportzonline.live/channels/pt/sporttv4.php"
    },
    {
      "time": "09:00",
      "name": "MotoGP: Portugal FP1",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "13:00",
      "name": "ATP World Tour 250: Metz",
      "url": "https://sportzonline.live/channels/pt/sporttv2.php"
    },
    {
      "time": "13:15",
      "name": "MotoGP: Portugal Practice",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "13:15",
      "name": "MotoGP: Portugal Practice",
      "url": "https://sportzonline.live/channels/pt/sporttv4.php"
    },
    {
      "time": "13:15",
      "name": "MotoGP: Portugal Practice",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "14:00",
      "name": "Formula 1: Sao Paulo Grand Prix: Practice 1",
      "url": "https://sportzonline.live/channels/hd/hd5.php"
    },
    {
      "time": "14:00",
      "name": "Formula 1: Sao Paulo Grand Prix: Practice 1",
      "url": "https://sportzonline.live/channels/bra/br5.php"
    },
    {
      "time": "16:15",
      "name": "MotoE: Portugal Qualifying",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "16:15",
      "name": "MotoE: Portugal Qualifying",
      "url": "https://sportzonline.live/channels/pt/sporttv4.php"
    },
    {
      "time": "17:00",
      "name": "Radomiak Radom x Cracovia Kraków",
      "url": "https://sportzonline.live/channels/hd/hd5.php"
    },
    {
      "time": "17:30",
      "name": "Al Najma x Al Hilal",
      "url": "https://sportzonline.live/channels/hd/hd11.php"
    },
    {
      "time": "17:30",
      "name": "Al Najma x Al Hilal",
      "url": "https://sportzonline.live/channels/pt/sporttv1.php"
    },
    {
      "time": "18:00",
      "name": "Cusco x Sport Boys",
      "url": "https://sportzonline.live/channels/hd/hd9.php"
    },
    {
      "time": "18:00",
      "name": "Feirense x Farense",
      "url": "https://sportzonline.live/channels/pt/sporttv5.php"
    },
    {
      "time": "18:00",
      "name": "Formula 1: Sao Paulo Grand Prix: Sprint Qualifying",
      "url": "https://sportzonline.live/channels/hd/hd5.php"
    },
    {
      "time": "18:00",
      "name": "Formula 1: Sao Paulo Grand Prix: Sprint Qualifying",
      "url": "https://sportzonline.live/channels/bra/br5.php"
    },
    {
      "time": "19:00",
      "name": "Twente x Telstar",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "19:30",
      "name": "Werder Bremen x Wolfsburg",
      "url": "https://sportzonline.live/channels/hd/hd3.php"
    },
    {
      "time": "19:30",
      "name": "Werder Bremen x Wolfsburg",
      "url": "https://sportzonline.live/channels/bra/br1.php"
    },
    {
      "time": "19:30",
      "name": "Spezia x Bari 1908",
      "url": "https://sportzonline.live/channels/hd/hd8.php"
    },
    {
      "time": "19:30",
      "name": "Zagłębie Lubin x Górnik Zabrze",
      "url": "https://sportzonline.live/channels/hd/hd5.php"
    },
    {
      "time": "19:30",
      "name": "Basketball Euro League: Barcelona @ Real Madrid",
      "url": "https://sportzonline.live/channels/pt/sporttv4.php"
    },
    {
      "time": "19:45",
      "name": "Pisa x Cremonese",
      "url": "https://sportzonline.live/channels/hd/hd7.php"
    },
    {
      "time": "19:45",
      "name": "Pisa x Cremonese",
      "url": "https://sportzonline.live/channels/hd/hd11.php"
    },
    {
      "time": "19:45",
      "name": "Pisa x Cremonese",
      "url": "https://sportzonline.live/channels/pt/sporttv2.php"
    },
    {
      "time": "19:45",
      "name": "Paris x Rennes",
      "url": "https://sportzonline.live/channels/hd/hd4.php"
    },
    {
      "time": "19:45",
      "name": "Paris x Rennes",
      "url": "https://sportzonline.live/channels/pt/sporttv3.php"
    },
    {
      "time": "20:00",
      "name": "Elche x Real Sociedad",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "20:00",
      "name": "Elche x Real Sociedad",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "20:00",
      "name": "Elche x Real Sociedad",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "20:00",
      "name": "Watford x Bristol City",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    },
    {
      "time": "20:15",
      "name": "Estoril x Arouca",
      "url": "https://sportzonline.live/channels/pt/sporttv1.php"
    },
    {
      "time": "20:15",
      "name": "Sporting Cristal x Cienciano",
      "url": "https://sportzonline.live/channels/hd/hd9.php"
    },
    {
      "time": "23:00",
      "name": "Unión La Calera x Deportes Iquique",
      "url": "https://sportzonline.live/channels/hd/hd8.php"
    },
    {
      "time": "00:00",
      "name": "Rosario Central x San Lorenzo",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "00:00",
      "name": "Rosario Central x San Lorenzo",
      "url": "https://sportzonline.live/channels/pt/sporttv1.php"
    },
    {
      "time": "00:00",
      "name": "Deportivo Cuenca x Macará",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "00:30",
      "name": "Boxing: Nicklaus Flaz x Tiger Johnson",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "01:00",
      "name": "Juárez x Querétaro",
      "url": "https://sportzonline.live/channels/hd/hd11.php"
    },
    {
      "time": "02:00",
      "name": "Universitario x Deportivo Garcilaso",
      "url": "https://sportzonline.live/channels/hd/hd9.php"
    },
    {
      "time": "02:00",
      "name": "One Fight Night 37: Kryklia vs Agdeve",
      "url": "https://sportzonline.live/channels/pt/sporttv2.php"
    },
    {
      "time": "03:00",
      "name": "Mazatlán x Necaxa",
      "url": "https://sportzonline.live/channels/hd/hd5.php"
    }
  ],
  "SATURDAY": [
    {
      "time": "04:00",
      "name": "AFLW: Carlton v WC Eagles",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "06:00",
      "name": "Wellington x Auckland FC",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "07:00",
      "name": "DP World Tour: Abu Dhabi Championship - D2",
      "url": "https://sportzonline.live/channels/pt/sporttv3.php"
    },
    {
      "time": "08:30",
      "name": "Moto2/3: Portugal FP2",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "08:30",
      "name": "Moto2/3: Portugal FP2",
      "url": "https://sportzonline.live/channels/pt/sporttv4.php"
    },
    {
      "time": "08:30",
      "name": "Moto2/3: Portugal FP2",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "10:00",
      "name": "MotoGP: Portugal Qualifying",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "10:00",
      "name": "MotoGP: Portugal Qualifying",
      "url": "https://sportzonline.live/channels/pt/sporttv4.php"
    },
    {
      "time": "10:00",
      "name": "MotoGP: Portugal Qualifying",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "11:00",
      "name": "Penafiel x Sporting CP B",
      "url": "https://sportzonline.live/channels/pt/sporttv1.php"
    },
    {
      "time": "12:00",
      "name": "Schalke 04 x Elversberg",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "12:00",
      "name": "Schalke 04 x Elversberg",
      "url": "https://sportzonline.live/channels/pt/eleven3.php"
    },
    {
      "time": "12:30",
      "name": "Tottenham Hotspur x Manchester United",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    },
    {
      "time": "12:30",
      "name": "Tottenham Hotspur x Manchester United",
      "url": "https://sportzonline.live/channels/pt/eleven1.php"
    },
    {
      "time": "12:30",
      "name": "Tottenham Hotspur x Manchester United",
      "url": "https://sportzonline.live/channels/bra/br3.php"
    },
    {
      "time": "12:30",
      "name": "Millwall x Preston North End",
      "url": "https://sportzonline.live/channels/hd/hd9.php"
    },
    {
      "time": "12:30",
      "name": "Blackburn Rovers x Derby County",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "12:30",
      "name": "Blackburn Rovers x Derby County",
      "url": "https://sportzonline.live/channels/bra/br2.php"
    },
    {
      "time": "12:45",
      "name": "Moto2/3: Portugal Qualifying",
      "url": "https://sportzonline.live/channels/pt/sporttv4.php"
    },
    {
      "time": "12:45",
      "name": "Moto2/3: Portugal Qualifying",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "13:00",
      "name": "Girona x Deportivo Alavés",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "13:00",
      "name": "Girona x Deportivo Alavés",
      "url": "https://sportzonline.live/channels/pt/eleven2.php"
    },
    {
      "time": "13:00",
      "name": "Formula 1: Sao Paulo Grand Prix: Sprint",
      "url": "https://sportzonline.live/channels/hd/hd5.php"
    },
    {
      "time": "13:00",
      "name": "Formula 1: Sao Paulo Grand Prix: Sprint",
      "url": "https://sportzonline.live/channels/hd/hd8.php"
    },
    {
      "time": "13:00",
      "name": "Formula 1: Sao Paulo Grand Prix: Sprint",
      "url": "https://sportzonline.live/channels/bra/br5.php"
    },
    {
      "time": "13:50",
      "name": "NEOM x Al Nassr",
      "url": "https://sportzonline.live/channels/pt/sporttv3.php"
    },
    {
      "time": "13:50",
      "name": "NEOM x Al Nassr",
      "url": "https://sportzonline.live/channels/bra/br1.php"
    },
    {
      "time": "14:00",
      "name": "Como x Cagliari",
      "url": "https://sportzonline.live/channels/hd/hd7.php"
    },
    {
      "time": "14:00",
      "name": "Como x Cagliari",
      "url": "https://sportzonline.live/channels/pt/sporttv1.php"
    },
    {
      "time": "14:00",
      "name": "Lecce x Hellas Verona",
      "url": "https://sportzonline.live/channels/hd/hd8.php"
    },
    {
      "time": "14:30",
      "name": "Union Berlin x Bayern München",
      "url": "https://sportzonline.live/channels/hd/hd11.php"
    },
    {
      "time": "14:30",
      "name": "Bayer Leverkusen x Heidenheim",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "14:30",
      "name": "Hamburger SV x Borussia Dortmund",
      "url": "https://sportzonline.live/channels/hd/hd3.php"
    },
    {
      "time": "14:45",
      "name": "MotoGP: Portugal Sprint Race",
      "url": "https://sportzonline.live/channels/pt/sporttv4.php"
    },
    {
      "time": "14:45",
      "name": "MotoGP: Portugal Sprint Race",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "15:00",
      "name": "Everton x Fulham",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "15:00",
      "name": "Everton x Fulham",
      "url": "https://sportzonline.live/channels/pt/eleven1.php"
    },
    {
      "time": "15:00",
      "name": "West Ham United x Burnley",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    },
    {
      "time": "15:00",
      "name": "West Ham United x Burnley",
      "url": "https://sportzonline.live/channels/pt/eleven3.php"
    },
    {
      "time": "15:00",
      "name": "West Ham United x Burnley",
      "url": "https://sportzonline.live/channels/bra/br2.php"
    },
    {
      "time": "15:00",
      "name": "Stoke City x Coventry City",
      "url": "https://sportzonline.live/channels/hd/hd9.php"
    },
    {
      "time": "15:00",
      "name": "Stoke City x Coventry City",
      "url": "https://sportzonline.live/channels/pt/sporttv5.php"
    },
    {
      "time": "15:15",
      "name": "Sevilla x Osasuna",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "15:15",
      "name": "Sevilla x Osasuna",
      "url": "https://sportzonline.live/channels/pt/eleven2.php"
    },
    {
      "time": "15:15",
      "name": "Sevilla x Osasuna",
      "url": "https://sportzonline.live/channels/bra/br4.php"
    },
    {
      "time": "15:30",
      "name": "Alverca x Rio Ave",
      "url": "https://sportzonline.live/channels/pt/sporttv2.php"
    },
    {
      "time": "16:00",
      "name": "Olympique Marseille x Brest",
      "url": "https://sportzonline.live/channels/hd/hd4.php"
    },
    {
      "time": "16:00",
      "name": "Olympique Marseille x Brest",
      "url": "https://sportzonline.live/channels/pt/sporttv3.php"
    },
    {
      "time": "17:00",
      "name": "Juventus x Torino",
      "url": "https://sportzonline.live/channels/hd/hd11.php"
    },
    {
      "time": "17:00",
      "name": "Juventus x Torino",
      "url": "https://sportzonline.live/channels/hd/hd7.php"
    },
    {
      "time": "17:00",
      "name": "Juventus x Torino",
      "url": "https://sportzonline.live/channels/pt/sporttv5.php"
    },
    {
      "time": "17:00",
      "name": "Juventus x Torino",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "17:00",
      "name": "Antalyaspor x Beşiktaş",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "17:00",
      "name": "Formula 1: Sao Paulo Grand Prix: Qualifying",
      "url": "https://sportzonline.live/channels/hd/hd5.php"
    },
    {
      "time": "17:00",
      "name": "Formula 1: Sao Paulo Grand Prix: Qualifying",
      "url": "https://sportzonline.live/channels/hd/hd8.php"
    },
    {
      "time": "17:00",
      "name": "Formula 1: Sao Paulo Grand Prix: Qualifying",
      "url": "https://sportzonline.live/channels/bra/br5.php"
    },
    {
      "time": "17:30",
      "name": "Sunderland x Arsenal",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    },
    {
      "time": "17:30",
      "name": "Sunderland x Arsenal",
      "url": "https://sportzonline.live/channels/pt/eleven1.php"
    },
    {
      "time": "17:30",
      "name": "Sunderland x Arsenal",
      "url": "https://sportzonline.live/channels/bra/br2.php"
    },
    {
      "time": "17:30",
      "name": "Borussia M'gladbach x Köln",
      "url": "https://sportzonline.live/channels/hd/hd3.php"
    },
    {
      "time": "17:30",
      "name": "Borussia M'gladbach x Köln",
      "url": "https://sportzonline.live/channels/pt/eleven3.php"
    },
    {
      "time": "17:30",
      "name": "Atlético Madrid x Levante",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "17:30",
      "name": "Atlético Madrid x Levante",
      "url": "https://sportzonline.live/channels/pt/eleven2.php"
    },
    {
      "time": "17:30",
      "name": "Atlético Madrid x Levante",
      "url": "https://sportzonline.live/channels/bra/br4.php"
    },
    {
      "time": "17:30",
      "name": "Al Ittihad x Al Ahli",
      "url": "https://sportzonline.live/channels/pt/sporttv4.php"
    },
    {
      "time": "17:30",
      "name": "Al Ittihad x Al Ahli",
      "url": "https://sportzonline.live/channels/bra/br1.php"
    },
    {
      "time": "17:45",
      "name": "St. Mirren x Hibernian",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "17:45",
      "name": "Volendam x NAC Breda",
      "url": "https://sportzonline.live/channels/hd/hd9.php"
    },
    {
      "time": "18:00",
      "name": "Le Havre x Nantes",
      "url": "https://sportzonline.live/channels/hd/hd4.php"
    },
    {
      "time": "18:00",
      "name": "Le Havre x Nantes",
      "url": "https://sportzonline.live/channels/pt/sporttv3.php"
    },
    {
      "time": "18:00",
      "name": "Tondela x Vitória Guimarães",
      "url": "https://sportzonline.live/channels/pt/sporttv2.php"
    },
    {
      "time": "19:00",
      "name": "Novorizontino x Remo",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "19:00",
      "name": "Sport Recife x Atlético Mineiro",
      "url": "https://sportzonline.live/channels/bra/br5.php"
    },
    {
      "time": "19:30",
      "name": "Kaiserslautern x Hertha BSC",
      "url": "https://sportzonline.live/channels/hd/hd3.php"
    },
    {
      "time": "19:45",
      "name": "Parma x Milan",
      "url": "https://sportzonline.live/channels/hd/hd11.php"
    },
    {
      "time": "19:45",
      "name": "Parma x Milan",
      "url": "https://sportzonline.live/channels/hd/hd7.php"
    },
    {
      "time": "19:45",
      "name": "Parma x Milan",
      "url": "https://sportzonline.live/channels/pt/sporttv4.php"
    },
    {
      "time": "19:45",
      "name": "Parma x Milan",
      "url": "https://sportzonline.live/channels/bra/br3.php"
    },
    {
      "time": "20:00",
      "name": "Chelsea x Wolverhampton Wanderers",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    },
    {
      "time": "20:00",
      "name": "Chelsea x Wolverhampton Wanderers",
      "url": "https://sportzonline.live/channels/pt/eleven1.php"
    },
    {
      "time": "20:00",
      "name": "Chelsea x Wolverhampton Wanderers",
      "url": "https://sportzonline.live/channels/bra/br2.php"
    },
    {
      "time": "20:00",
      "name": "Espanyol x Villarreal",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "20:00",
      "name": "Espanyol x Villarreal",
      "url": "https://sportzonline.live/channels/pt/eleven2.php"
    },
    {
      "time": "20:00",
      "name": "PEC Zwolle x Sparta Rotterdam",
      "url": "https://sportzonline.live/channels/hd/hd9.php"
    },
    {
      "time": "20:00",
      "name": "Racing x Defensa y Justicia",
      "url": "https://sportzonline.live/channels/pt/sporttv5.php"
    },
    {
      "time": "20:05",
      "name": "Monaco x Lens",
      "url": "https://sportzonline.live/channels/hd/hd4.php"
    },
    {
      "time": "20:05",
      "name": "Monaco x Lens",
      "url": "https://sportzonline.live/channels/pt/sporttv3.php"
    },
    {
      "time": "20:30",
      "name": "Santa Clara x Sporting CP",
      "url": "https://sportzonline.live/channels/pt/sporttv1.php"
    },
    {
      "time": "20:30",
      "name": "Santa Clara x Sporting CP",
      "url": "https://sportzonline.live/channels/bra/br4.php"
    },
    {
      "time": "20:30",
      "name": "Palestino x Coquimbo Unido",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "21:00",
      "name": "Inter Miami x Nashville SC",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "21:00",
      "name": "Vasco da Gama x Juventude",
      "url": "https://sportzonline.live/channels/bra/br1.php"
    },
    {
      "time": "21:30",
      "name": "Internacional x Bahia",
      "url": "https://sportzonline.live/channels/bra/br5.php"
    },
    {
      "time": "22:00",
      "name": "UFC Fight Night: Prelims",
      "url": "https://sportzonline.live/channels/hd/hd11.php"
    },
    {
      "time": "22:15",
      "name": "Talleres Córdoba x Platense",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "23:30",
      "name": "O'Higgins x Ñublense",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "00:00",
      "name": "São Paulo x RB Bragantino",
      "url": "https://sportzonline.live/channels/bra/br1.php"
    },
    {
      "time": "00:00",
      "name": "UFC Fight Night: Gabriel Bonfim v Randy Brown",
      "url": "https://sportzonline.live/channels/hd/hd11.php"
    },
    {
      "time": "00:00",
      "name": "UFC Fight Night: Gabriel Bonfim v Randy Brown",
      "url": "https://sportzonline.live/channels/pt/sporttv1.php"
    },
    {
      "time": "00:30",
      "name": "San Martín San Juan x Lanús",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "01:00",
      "name": "Toluca x América",
      "url": "https://sportzonline.live/channels/hd/hd9.php"
    },
    {
      "time": "01:00",
      "name": "Boxing: Vergil Ortiz x Erickson Lubin",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "01:00",
      "name": "NBA: Los Angeles Lakers @ Atlanta Hawks",
      "url": "https://sportzonline.live/channels/hd/hd5.php"
    },
    {
      "time": "01:00",
      "name": "NBA: Los Angeles Lakers @ Atlanta Hawks",
      "url": "https://sportzonline.live/channels/pt/sporttv2.php"
    },
    {
      "time": "01:00",
      "name": "NBA: Los Angeles Lakers @ Atlanta Hawks",
      "url": "https://sportzonline.live/channels/bra/br4.php"
    },
    {
      "time": "03:05",
      "name": "Cruz Azul x Pumas UNAM",
      "url": "https://sportzonline.live/channels/hd/hd9.php"
    },
    {
      "time": "03:30",
      "name": "NBA: Phoenix Suns @ LA Clippers",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    },
    {
      "time": "03:30",
      "name": "NBA: Phoenix Suns @ LA Clippers",
      "url": "https://sportzonline.live/channels/bra/br4.php"
    }
  ]
}
};

// Fonctions utilitaires
export function getMatchesByDay(day: string): SportMatch[] {
  return sportsSchedule.matches[day.toUpperCase()] || [];
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
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
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
    const key = `${match.time}-${match.name}`;
    
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
      label = label.replace(/HD(\d+)/, 'HD $1');
    } else if (label.includes('BR')) {
      label = label.replace(/BR(\d+)/, 'BR $1');
    } else if (label.includes('SPORTTV')) {
      label = label.replace(/SPORTTV(\d+)/, 'Sport TV $1');
    } else if (label.includes('ELEVEN')) {
      label = label.replace(/ELEVEN(\d+)/, 'Eleven $1');
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
 * Obtenir les prochains matches à venir (dans les prochaines 24h)
 */
export function getUpcomingMatchesIn24h(): SportMatch[] {
  const now = new Date();
  const currentDay = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][now.getDay()];
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
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
