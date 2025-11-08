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
  "SATURDAY": {
    "HD1": "ENGLISH",
    "HD2": "ENGLISH",
    "HD5": "ENGLISH",
    "HD6": "SPANISH",
    "HD9": "SPANISH",
    "HD10": "SPANISH",
    "HD11": "ENGLISH",
    "BR1": "BRAZILIAN",
    "BR4": "BRAZILIAN",
    "BR5": "BRAZILIAN",
    "BR6": "BRAZILIAN"
  },
  "SUNDAY": {
    "HD1": "ENGLISH",
    "HD2": "ENGLISH",
    "HD3": "GERMAN",
    "HD4": "FRENCH",
    "HD5": "ENGLISH",
    "HD6": "SPANISH",
    "HD7": "ITALIAN",
    "HD8": "ITALIAN & SPANISH",
    "HD9": "GREEK & SPANISH",
    "HD10": "DUTCH & ENGLISH & SPANISH",
    "HD11": "ENGLISH & SPANISH",
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
    "HD5": "ENGLISH",
    "HD6": "SPANISH",
    "HD7": "ITALIAN",
    "HD8": "SPANISH",
    "HD9": "ROMANIAN & SPANISH",
    "HD10": "SPANISH",
    "HD11": "SPANISH",
    "BR1": "BRAZILIAN",
    "BR2": "BRAZILIAN",
    "BR4": "BRAZILIAN",
    "BR6": "BRAZILIAN"
  },
  "TUESDAY": {
    "HD1": "ENGLISH",
    "HD2": "ENGLISH",
    "HD5": "ENGLISH",
    "HD6": "SPANISH",
    "HD7": "ITALIAN",
    "HD9": "ENGLISH",
    "HD10": "ENGLISH",
    "BR2": "BRAZILIAN",
    "BR6": "BRAZILIAN"
  },
  "WEDNESDAY": {
    "HD1": "ENGLISH",
    "HD2": "ENGLISH",
    "HD5": "ENGLISH",
    "HD6": "SPANISH",
    "HD7": "ITALIAN",
    "HD8": "ITALIAN",
    "HD10": "ENGLISH",
    "HD11": "RUSSIAN",
    "BR1": "BRAZILIAN"
  }
},
  matches: {
  "SATURDAY": [
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
      "name": "Inter Miami x Nashville SC",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
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
      "name": "NBA: Los Angeles Lakers @ Altanta Hawks",
      "url": "https://sportzonline.live/channels/pt/sporttv2.php"
    },
    {
      "time": "01:00",
      "name": "NBA: Los Angeles Lakers @ Altanta Hawks",
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
  ],
  "SUNDAY": [
    {
      "time": "07:00",
      "name": "DP World Tour: Abu Dhabi Championship - D4",
      "url": "https://sportzonline.live/channels/pt/sporttv3.php"
    },
    {
      "time": "10:00",
      "name": "Moto2: Grand Prix of Portugal",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "10:00",
      "name": "Moto2: Grand Prix of Portugal",
      "url": "https://sportzonline.live/channels/pt/sporttv4.php"
    },
    {
      "time": "10:00",
      "name": "Moto2: Grand Prix of Portugal",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "11:00",
      "name": "Leixões x Torreense",
      "url": "https://sportzonline.live/channels/pt/sporttv1.php"
    },
    {
      "time": "11:15",
      "name": "Utrecht x Ajax",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "11:15",
      "name": "Utrecht x Ajax",
      "url": "https://sportzonline.live/channels/pt/eleven1.php"
    },
    {
      "time": "11:30",
      "name": "Atalanta x Sassuolo",
      "url": "https://sportzonline.live/channels/hd/hd7.php"
    },
    {
      "time": "11:30",
      "name": "Atalanta x Sassuolo",
      "url": "https://sportzonline.live/channels/pt/sporttv2.php"
    },
    {
      "time": "12:15",
      "name": "MotoGP: GP of Portugal",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "12:15",
      "name": "MotoGP: GP of Portugal",
      "url": "https://sportzonline.live/channels/pt/sporttv4.php"
    },
    {
      "time": "12:15",
      "name": "MotoGP: GP of Portugal",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "13:00",
      "name": "Athletic Club x Real Oviedo",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "13:00",
      "name": "Athletic Club x Real Oviedo",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "13:00",
      "name": "Athletic Club x Real Oviedo",
      "url": "https://sportzonline.live/channels/pt/eleven2.php"
    },
    {
      "time": "13:00",
      "name": "Athletic Club x Real Oviedo",
      "url": "https://sportzonline.live/channels/bra/br3.php"
    },
    {
      "time": "13:00",
      "name": "Kifisia x Olympiakos Piraeus",
      "url": "https://sportzonline.live/channels/hd/hd9.php"
    },
    {
      "time": "14:00",
      "name": "Nottingham Forest x Leeds United",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    },
    {
      "time": "14:00",
      "name": "Aston Villa x AFC Bournemouth",
      "url": "https://sportzonline.live/channels/hd/hd5.php"
    },
    {
      "time": "14:00",
      "name": "Aston Villa x AFC Bournemouth",
      "url": "https://sportzonline.live/channels/bra/br2.php"
    },
    {
      "time": "14:00",
      "name": "Brentford x Newcastle United",
      "url": "https://sportzonline.live/channels/hd/hd11.php"
    },
    {
      "time": "14:00",
      "name": "Crystal Palace x Brighton & Hove Albion",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "14:00",
      "name": "Crystal Palace x Brighton & Hove Albion",
      "url": "https://sportzonline.live/channels/pt/eleven1.php"
    },
    {
      "time": "14:00",
      "name": "Bologna x Napoli",
      "url": "https://sportzonline.live/channels/hd/hd7.php"
    },
    {
      "time": "14:00",
      "name": "Genoa x Fiorentina",
      "url": "https://sportzonline.live/channels/hd/hd8.php"
    },
    {
      "time": "14:00",
      "name": "Lorient x Toulouse",
      "url": "https://sportzonline.live/channels/hd/hd4.php"
    },
    {
      "time": "14:00",
      "name": "Lorient x Toulouse",
      "url": "https://sportzonline.live/channels/pt/sporttv5.php"
    },
    {
      "time": "14:30",
      "name": "Freiburg x St. Pauli",
      "url": "https://sportzonline.live/channels/hd/hd3.php"
    },
    {
      "time": "15:00",
      "name": "Rugby: Wales x Argentina",
      "url": "https://sportzonline.live/channels/pt/sporttv5.php"
    },
    {
      "time": "15:15",
      "name": "Rayo Vallecano x Real Madrid",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "15:15",
      "name": "Rayo Vallecano x Real Madrid",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "15:15",
      "name": "Rayo Vallecano x Real Madrid",
      "url": "https://sportzonline.live/channels/pt/eleven2.php"
    },
    {
      "time": "15:15",
      "name": "Rayo Vallecano x Real Madrid",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "15:30",
      "name": "OFI x AEK Athens",
      "url": "https://sportzonline.live/channels/hd/hd9.php"
    },
    {
      "time": "15:30",
      "name": "AVS x Gil Vicente",
      "url": "https://sportzonline.live/channels/pt/sporttv1.php"
    },
    {
      "time": "15:30",
      "name": "Marítimo x Paços de Ferreira",
      "url": "https://sportzonline.live/channels/pt/sporttv3.php"
    },
    {
      "time": "15:30",
      "name": "Estrela x Nacional",
      "url": "https://sportzonline.live/channels/pt/sporttv2.php"
    },
    {
      "time": "15:45",
      "name": "AZ x PSV",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "16:15",
      "name": "Strasbourg x Lille",
      "url": "https://sportzonline.live/channels/hd/hd4.php"
    },
    {
      "time": "16:15",
      "name": "Strasbourg x Lille",
      "url": "https://sportzonline.live/channels/pt/sporttv5.php"
    },
    {
      "time": "16:30",
      "name": "Manchester City x Liverpool",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    },
    {
      "time": "16:30",
      "name": "Manchester City x Liverpool",
      "url": "https://sportzonline.live/channels/pt/eleven1.php"
    },
    {
      "time": "16:30",
      "name": "Manchester City x Liverpool",
      "url": "https://sportzonline.live/channels/bra/br2.php"
    },
    {
      "time": "16:30",
      "name": "Stuttgart x Augsburg",
      "url": "https://sportzonline.live/channels/hd/hd3.php"
    },
    {
      "time": "16:30",
      "name": "Stuttgart x Augsburg",
      "url": "https://sportzonline.live/channels/bra/br1.php"
    },
    {
      "time": "17:00",
      "name": "Roma x Udinese",
      "url": "https://sportzonline.live/channels/hd/hd7.php"
    },
    {
      "time": "17:00",
      "name": "Roma x Udinese",
      "url": "https://sportzonline.live/channels/pt/sporttv4.php"
    },
    {
      "time": "17:00",
      "name": "Roma x Udinese",
      "url": "https://sportzonline.live/channels/bra/br3.php"
    },
    {
      "time": "17:00",
      "name": "Formula 1: Sao Paulo F1 Grand Prix",
      "url": "https://sportzonline.live/channels/hd/hd5.php"
    },
    {
      "time": "17:00",
      "name": "Formula 1: Sao Paulo F1 Grand Prix",
      "url": "https://sportzonline.live/channels/hd/hd8.php"
    },
    {
      "time": "17:00",
      "name": "Formula 1: Sao Paulo F1 Grand Prix",
      "url": "https://sportzonline.live/channels/bra/br5.php"
    },
    {
      "time": "17:30",
      "name": "Valencia x Real Betis",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "17:30",
      "name": "Valencia x Real Betis",
      "url": "https://sportzonline.live/channels/hd/hd11.php"
    },
    {
      "time": "17:30",
      "name": "Valencia x Real Betis",
      "url": "https://sportzonline.live/channels/pt/eleven2.php"
    },
    {
      "time": "17:30",
      "name": "Valencia x Real Betis",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "17:30",
      "name": "Mallorca x Getafe",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "18:00",
      "name": "Famalicão x Porto",
      "url": "https://sportzonline.live/channels/pt/sporttv1.php"
    },
    {
      "time": "18:30",
      "name": "Eintracht Frankfurt x Mainz 05",
      "url": "https://sportzonline.live/channels/hd/hd3.php"
    },
    {
      "time": "19:00",
      "name": "Go Ahead Eagles x Feyenoord",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "19:00",
      "name": "Hockey: Sporting CP x OC Barcelos",
      "url": "https://sportzonline.live/channels/pt/eleven1.php"
    },
    {
      "time": "19:00",
      "name": "Panathinaikos x PAOK",
      "url": "https://sportzonline.live/channels/hd/hd9.php"
    },
    {
      "time": "19:00",
      "name": "Corinthians x Ceará",
      "url": "https://sportzonline.live/channels/bra/br4.php"
    },
    {
      "time": "19:00",
      "name": "Cruzeiro x Fluminense",
      "url": "https://sportzonline.live/channels/bra/br2.php"
    },
    {
      "time": "19:00",
      "name": "Vitória x Botafogo",
      "url": "https://sportzonline.live/channels/bra/br1.php"
    },
    {
      "time": "19:30",
      "name": "Boca Juniors x River Plate",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "19:30",
      "name": "Boca Juniors x River Plate",
      "url": "https://sportzonline.live/channels/hd/hd11.php"
    },
    {
      "time": "19:45",
      "name": "Internazionale x Lazio",
      "url": "https://sportzonline.live/channels/hd/hd5.php"
    },
    {
      "time": "19:45",
      "name": "Internazionale x Lazio",
      "url": "https://sportzonline.live/channels/hd/hd7.php"
    },
    {
      "time": "19:45",
      "name": "Internazionale x Lazio",
      "url": "https://sportzonline.live/channels/pt/sporttv4.php"
    },
    {
      "time": "19:45",
      "name": "Internazionale x Lazio",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "19:45",
      "name": "Olympique Lyonnais x PSG",
      "url": "https://sportzonline.live/channels/hd/hd4.php"
    },
    {
      "time": "19:45",
      "name": "Olympique Lyonnais x PSG",
      "url": "https://sportzonline.live/channels/pt/sporttv3.php"
    },
    {
      "time": "20:00",
      "name": "Celta de Vigo x Barcelona",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "20:00",
      "name": "Celta de Vigo x Barcelona",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "20:00",
      "name": "Celta de Vigo x Barcelona",
      "url": "https://sportzonline.live/channels/pt/eleven2.php"
    },
    {
      "time": "20:00",
      "name": "Celta de Vigo x Barcelona",
      "url": "https://sportzonline.live/channels/bra/br5.php"
    },
    {
      "time": "20:30",
      "name": "Benfica x Casa Pia",
      "url": "https://sportzonline.live/channels/pt/btv.php"
    },
    {
      "time": "20:30",
      "name": "Sporting Braga x Moreirense",
      "url": "https://sportzonline.live/channels/pt/sporttv2.php"
    },
    {
      "time": "20:30",
      "name": "Universidad Chile x Deportes Limache",
      "url": "https://sportzonline.live/channels/hd/hd8.php"
    },
    {
      "time": "21:15",
      "name": "NFL: Los Angeles Rams @ San Francisco 49Ers",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    },
    {
      "time": "21:30",
      "name": "Flamengo x Santos",
      "url": "https://sportzonline.live/channels/bra/br3.php"
    },
    {
      "time": "23:00",
      "name": "Cobresal x Everton",
      "url": "https://sportzonline.live/channels/hd/hd8.php"
    },
    {
      "time": "23:00",
      "name": "Santos Laguna x Pachuca",
      "url": "https://sportzonline.live/channels/hd/hd9.php"
    },
    {
      "time": "23:00",
      "name": "NBA: Boston Celtics @ Orlando Magic",
      "url": "https://sportzonline.live/channels/pt/sporttv1.php"
    },
    {
      "time": "23:30",
      "name": "Mirassol x Palmeiras",
      "url": "https://sportzonline.live/channels/bra/br4.php"
    },
    {
      "time": "23:30",
      "name": "Fortaleza x Grêmio",
      "url": "https://sportzonline.live/channels/bra/br1.php"
    },
    {
      "time": "00:30",
      "name": "Atlético Tucumán x Godoy Cruz",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "00:30",
      "name": "Tigre x Estudiantes",
      "url": "https://sportzonline.live/channels/hd/hd11.php"
    },
    {
      "time": "01:10",
      "name": "NFL: Pittsburgh Steelers @ Los Angeles Chargers",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    }
  ],
  "MONDAY": [
    {
      "time": "12:30",
      "name": "Switzerland U17 x Mexico U17",
      "url": "https://sportzonline.live/channels/hd/hd5.php"
    },
    {
      "time": "13:00",
      "name": "ATP World Finals",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    },
    {
      "time": "13:00",
      "name": "ATP World Finals",
      "url": "https://sportzonline.live/channels/pt/sporttv1.php"
    },
    {
      "time": "13:30",
      "name": "El Salvador U17 x Germany U17",
      "url": "https://sportzonline.live/channels/hd/hd8.php"
    },
    {
      "time": "14:45",
      "name": "Zambia U17 x Brazil U17",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "15:45",
      "name": "Venezuela U17 x Haiti U17",
      "url": "https://sportzonline.live/channels/hd/hd8.php"
    },
    {
      "time": "15:45",
      "name": "Egypt U17 x England U17",
      "url": "https://sportzonline.live/channels/hd/hd5.php"
    },
    {
      "time": "17:00",
      "name": "Freiburg W x Bayer Leverkusen W",
      "url": "https://sportzonline.live/channels/hd/hd3.php"
    },
    {
      "time": "17:30",
      "name": "ASA Târgu Mureş x CSMS Iaşi",
      "url": "https://sportzonline.live/channels/hd/hd9.php"
    },
    {
      "time": "19:00",
      "name": "Grand Slam of Darts: D3 Wolverhampton",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    },
    {
      "time": "19:30",
      "name": "Burgos x CD Castellon",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "19:30",
      "name": "Salernitana x Crotone",
      "url": "https://sportzonline.live/channels/hd/hd7.php"
    },
    {
      "time": "20:00",
      "name": "Cheltenham Town x Notts County",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "20:00",
      "name": "Gimnasia La Plata x Vélez Sarsfield",
      "url": "https://sportzonline.live/channels/hd/hd11.php"
    },
    {
      "time": "22:00",
      "name": "Chapecoense x América Mineiro",
      "url": "https://sportzonline.live/channels/bra/br2.php"
    },
    {
      "time": "22:00",
      "name": "Deportivo Riestra x Independiente",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "22:00",
      "name": "Deportivo Riestra x Independiente",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "22:30",
      "name": "Palmeiras W x Corinthians W",
      "url": "https://sportzonline.live/channels/bra/br1.php"
    },
    {
      "time": "00:00",
      "name": "NBA: Los Angeles Lakers @ Charlotte Hornets",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "00:00",
      "name": "NBA: Washington Wizards @ Detroit Pistons",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "00:00",
      "name": "Aucas x Delfin",
      "url": "https://sportzonline.live/channels/hd/hd9.php"
    },
    {
      "time": "00:15",
      "name": "Argentinos Juniors x Belgrano",
      "url": "https://sportzonline.live/channels/hd/hd11.php"
    },
    {
      "time": "00:15",
      "name": "Independiente Rivadavia x Central Córdoba SdE",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "00:30",
      "name": "NBA: Cleveland Cavaliers @ Miami Heat",
      "url": "https://sportzonline.live/channels/pt/sporttv1.php"
    },
    {
      "time": "01:00",
      "name": "NFL: Philadelphia Eagles @ Green Bay Packers",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    },
    {
      "time": "01:00",
      "name": "NFL: Philadelphia Eagles @ Green Bay Packers",
      "url": "https://sportzonline.live/channels/bra/br4.php"
    },
    {
      "time": "03:30",
      "name": "NBA: Atlanta Hawks @ LA Clippers",
      "url": "https://sportzonline.live/channels/hd/hd5.php"
    }
  ],
  "TUESDAY": [
    {
      "time": "12:30",
      "name": "Uganda U17 x France U17",
      "url": "https://sportzonline.live/channels/hd/hd5.php"
    },
    {
      "time": "12:30",
      "name": "Chile U17 x Canada U17",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "13:00",
      "name": "ATP World Finals",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    },
    {
      "time": "13:00",
      "name": "ATP World Finals",
      "url": "https://sportzonline.live/channels/pt/sporttv1.php"
    },
    {
      "time": "13:30",
      "name": "Republic of Ireland U17 x Paraguay U17",
      "url": "https://sportzonline.live/channels/hd/hd9.php"
    },
    {
      "time": "14:45",
      "name": "Czechia U17 x United States U17",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "14:45",
      "name": "Czechia U17 x United States U17",
      "url": "https://sportzonline.live/channels/hd/hd5.php"
    },
    {
      "time": "17:45",
      "name": "Roma W x Vålerenga W",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "17:45",
      "name": "Roma W x Vålerenga W",
      "url": "https://sportzonline.live/channels/hd/hd7.php"
    },
    {
      "time": "17:45",
      "name": "Roma W x Vålerenga W",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "17:45",
      "name": "Roma W x Vålerenga W",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "18:00",
      "name": "Basketball EuroCup: Aris x Bahcesehir",
      "url": "https://sportzonline.live/channels/pt/sporttv2.php"
    },
    {
      "time": "19:00",
      "name": "Grand Slam of Darts: D4 Wolverhampton",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    },
    {
      "time": "19:45",
      "name": "East Kilbride x Celtic B",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "20:00",
      "name": "Real Madrid W x Paris FC W",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "20:00",
      "name": "OL Lyonnes W x Wolfsburg W",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "20:00",
      "name": "OL Lyonnes W x Wolfsburg W",
      "url": "https://sportzonline.live/channels/bra/br6.php"
    },
    {
      "time": "20:00",
      "name": "St. Pölten x Chelsea FC",
      "url": "https://sportzonline.live/channels/bra/br2.php"
    },
    {
      "time": "20:00",
      "name": "Basketball: La Laguna Tenerife x Tofas Bursa",
      "url": "https://sportzonline.live/channels/pt/sporttv3.php"
    },
    {
      "time": "01:00",
      "name": "NBA: Boston Celtics @ Philadelphia 76ers",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    },
    {
      "time": "01:00",
      "name": "NBA: Boston Celtics @ Philadelphia 76ers",
      "url": "https://sportzonline.live/channels/pt/sporttv1.php"
    },
    {
      "time": "04:00",
      "name": "NBA: Denver Nuggets @ Sacramento Kings",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    }
  ],
  "WEDNESDAY": [
    {
      "time": "13:00",
      "name": "ATP World Finals",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    },
    {
      "time": "13:00",
      "name": "ATP World Finals",
      "url": "https://sportzonline.live/channels/pt/sporttv1.php"
    },
    {
      "time": "14:00",
      "name": "Italy U19 x Moldova U19",
      "url": "https://sportzonline.live/channels/hd/hd7.php"
    },
    {
      "time": "17:00",
      "name": "Russia x Peru",
      "url": "https://sportzonline.live/channels/hd/hd11.php"
    },
    {
      "time": "17:45",
      "name": "Bayern W x Arsenal W",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "17:45",
      "name": "Barcelona W x OH Leuven W",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "17:45",
      "name": "Handball: GOG X PSG",
      "url": "https://sportzonline.live/channels/pt/sporttv4.php"
    },
    {
      "time": "19:00",
      "name": "Grand Slam of Darts: D5 Wolverhampton",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    },
    {
      "time": "19:15",
      "name": "Euro League Basketball: Olympiakos x Zalgiris Kaunas",
      "url": "https://sportzonline.live/channels/pt/sporttv3.php"
    },
    {
      "time": "20:00",
      "name": "Atletico Madrid W x Juventus W",
      "url": "https://sportzonline.live/channels/hd/hd10.php"
    },
    {
      "time": "20:00",
      "name": "Atletico Madrid W x Juventus W",
      "url": "https://sportzonline.live/channels/hd/hd6.php"
    },
    {
      "time": "20:00",
      "name": "Atletico Madrid W x Juventus W",
      "url": "https://sportzonline.live/channels/hd/hd8.php"
    },
    {
      "time": "20:00",
      "name": "Manchester United W x PSG W",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "20:00",
      "name": "SL Benfica W x Twente W",
      "url": "https://sportzonline.live/channels/pt/sporttv5.php"
    },
    {
      "time": "23:30",
      "name": "Atlético Mineiro x Fortaleza",
      "url": "https://sportzonline.live/channels/bra/br1.php"
    },
    {
      "time": "00:00",
      "name": "NBA: Orlando Magic @ New York Knicks",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "00:00",
      "name": "NBA: Orlando Magic @ New York Knicks",
      "url": "https://sportzonline.live/channels/pt/sporttv1.php"
    },
    {
      "time": "00:30",
      "name": "NBA: Memphis Grizzlies @ Boston Celtics",
      "url": "https://sportzonline.live/channels/hd/hd1.php"
    },
    {
      "time": "01:00",
      "name": "NBA: Golden State Warriors @ San Antonio Spurs",
      "url": "https://sportzonline.live/channels/hd/hd5.php"
    },
    {
      "time": "02:30",
      "name": "NBA: Los Angeles Lakers @ Oklahoma City Thunder",
      "url": "https://sportzonline.live/channels/hd/hd2.php"
    },
    {
      "time": "02:30",
      "name": "NBA: Los Angeles Lakers @ Oklahoma City Thunder",
      "url": "https://sportzonline.live/channels/pt/sporttv2.php"
    }
  ]
}
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
