export interface ChampionshipCategory {
  id: string;
  name: string;
  shortName: string;
  country: string;
  flag: string;
  aliases: string[];
  popularTeams: string[];
}

export const WORLD_CHAMPIONSHIPS: ChampionshipCategory[] = [
  {
    id: 'brasileirao-a',
    name: 'Brasileirão Série A',
    shortName: 'Série A',
    country: 'Brasil',
    flag: '🇧🇷',
    aliases: ['brasileirao', 'brasileiro', 'serie a', 'brasileirão', 'campeonato brasileiro'],
    popularTeams: [
      'Flamengo', 'Palmeiras', 'São Paulo', 'Corinthians', 'Santos',
      'Grêmio', 'Internacional', 'Atlético-MG', 'Cruzeiro', 'Vasco',
      'Fluminense', 'Botafogo', 'Bahia', 'Fortaleza', 'Athletico-PR',
      'Bragantino', 'Vitória', 'Juventude', 'Criciúma', 'Cuiabá'
    ]
  },
  {
    id: 'brasileirao-b',
    name: 'Brasileirão Série B',
    shortName: 'Série B',
    country: 'Brasil',
    flag: '🇧🇷',
    aliases: ['serie b', 'série b', 'segunda divisao'],
    popularTeams: [
      'Sport', 'Ceará', 'Goiás', 'Coritiba', 'América-MG', 'Novorizontino',
      'Mirassol', 'Vila Nova', 'Avaí', 'Chapecoense', 'Ponte Preta',
      'Operário-PR', 'CRB', 'Paysandu', 'Botafogo-SP', 'Amazonas'
    ]
  },
  {
    id: 'copa-do-brasil',
    name: 'Copa do Brasil',
    shortName: 'Copa do Brasil',
    country: 'Brasil',
    flag: '🇧🇷',
    aliases: ['copa do brasil', 'copa brasil'],
    popularTeams: ['Flamengo', 'Palmeiras', 'São Paulo', 'Corinthians', 'Grêmio', 'Atlético-MG', 'Cruzeiro', 'Fluminense']
  },
  {
    id: 'champions-league',
    name: 'UEFA Champions League',
    shortName: 'Champions League',
    country: 'Europa',
    flag: '⭐',
    aliases: ['champions', 'uefa champions league', 'liga dos campeoes', 'liga dos campeões'],
    popularTeams: [
      'Real Madrid', 'Manchester City', 'Bayern de Munique', 'Barcelona',
      'Paris Saint-Germain', 'Liverpool', 'Arsenal', 'Inter de Milão',
      'Juventus', 'Borussia Dortmund', 'Atlético de Madrid', 'Bayer Leverkusen'
    ]
  },
  {
    id: 'libertadores',
    name: 'CONMEBOL Libertadores',
    shortName: 'Libertadores',
    country: 'América do Sul',
    flag: '🏆',
    aliases: ['libertadores', 'conmebol libertadores', 'copa libertadores'],
    popularTeams: [
      'Flamengo', 'Palmeiras', 'River Plate', 'Boca Juniors', 'São Paulo',
      'Fluminense', 'Atlético-MG', 'Botafogo', 'Grêmio', 'Peñarol',
      'Nacional (URU)', 'Olimpia', 'LDU Quito', 'Colo-Colo'
    ]
  },
  {
    id: 'premier-league',
    name: 'Premier League (Inglês)',
    shortName: 'Premier League',
    country: 'Inglaterra',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    aliases: ['premier league', 'ingles', 'inglês', 'campeonato ingles', 'campeonato inglês', 'fa cup', 'copa da liga inglesa'],
    popularTeams: [
      'Manchester City', 'Arsenal', 'Liverpool', 'Manchester United',
      'Chelsea', 'Tottenham', 'Aston Villa', 'Newcastle',
      'Brighton', 'West Ham', 'Everton', 'Wolverhampton',
      'Fulham', 'Brentford', 'Crystal Palace', 'Nottingham Forest'
    ]
  },
  {
    id: 'la-liga',
    name: 'La Liga (Espanhol)',
    shortName: 'La Liga',
    country: 'Espanha',
    flag: '🇪🇸',
    aliases: ['la liga', 'laliga', 'espanhol', 'campeonato espanhol', 'copa do rei', 'copa del rey'],
    popularTeams: [
      'Real Madrid', 'Barcelona', 'Atlético de Madrid', 'Athletic Bilbao',
      'Real Sociedad', 'Villarreal', 'Real Betis', 'Sevilla',
      'Valencia', 'Girona', 'Celta de Vigo', 'Osasuna'
    ]
  },
  {
    id: 'bundesliga',
    name: 'Bundesliga (Alemão)',
    shortName: 'Bundesliga',
    country: 'Alemanha',
    flag: '🇩🇪',
    aliases: ['bundesliga', 'alemao', 'alemão', 'campeonato alemao', 'copa da alemanha', 'dfb pokal'],
    popularTeams: [
      'Bayern de Munique', 'Borussia Dortmund', 'Bayer Leverkusen',
      'RB Leipzig', 'Eintracht Frankfurt', 'VfB Stuttgart',
      'Borussia Mönchengladbach', 'Wolfsburg', 'Freiburg', 'Hoffenheim'
    ]
  },
  {
    id: 'serie-a-italia',
    name: 'Serie A Italiana',
    shortName: 'Serie A',
    country: 'Itália',
    flag: '🇮🇹',
    aliases: ['serie a italia', 'italiano', 'campeonato italiano', 'calcio', 'copa da italia'],
    popularTeams: [
      'Inter de Milão', 'Milan', 'Juventus', 'Napoli',
      'Roma', 'Lazio', 'Atalanta', 'Fiorentina',
      'Bologna', 'Torino', 'Genoa', 'Monza'
    ]
  },
  {
    id: 'ligue-1',
    name: 'Ligue 1 (Francês)',
    shortName: 'Ligue 1',
    country: 'França',
    flag: '🇫🇷',
    aliases: ['ligue 1', 'frances', 'francês', 'campeonato frances', 'copa da frança'],
    popularTeams: [
      'Paris Saint-Germain', 'Monaco', 'Olympique de Marselha',
      'Lyon', 'Lille', 'Rennes', 'Nice', 'Lens'
    ]
  },
  {
    id: 'liga-portugal',
    name: 'Liga Portugal',
    shortName: 'Liga Portugal',
    country: 'Portugal',
    flag: '🇵🇹',
    aliases: ['liga portugal', 'portugues', 'português', 'campeonato portugues', 'primeira liga'],
    popularTeams: [
      'Benfica', 'Porto', 'Sporting', 'Braga',
      'Vitória de Guimarães', 'Famalicão', 'Boavista', 'Rio Ave'
    ]
  },
  {
    id: 'europa-league',
    name: 'UEFA Europa League',
    shortName: 'Europa League',
    country: 'Europa',
    flag: '🟠',
    aliases: ['europa league', 'uefa europa league', 'liga europa'],
    popularTeams: ['Manchester United', 'Tottenham', 'Roma', 'Lazio', 'Athletic Bilbao', 'Porto', 'Ajax', 'Galatasaray']
  },
  {
    id: 'conference-league',
    name: 'UEFA Conference League',
    shortName: 'Conference League',
    country: 'Europa',
    flag: '🟢',
    aliases: ['conference league', 'uefa conference league'],
    popularTeams: ['Chelsea', 'Fiorentina', 'Real Betis', 'Panathinaikos', 'Heidenheim', 'Gent']
  },
  {
    id: 'sul-americana',
    name: 'CONMEBOL Sul-Americana',
    shortName: 'Sul-Americana',
    country: 'América do Sul',
    flag: '🟡',
    aliases: ['sul-americana', 'sudamericana', 'conmebol sul-americana', 'copa sul-americana'],
    popularTeams: ['Corinthians', 'Cruzeiro', 'Racing Club', 'Boca Juniors', 'Fortaleza', 'Athletico-PR', 'Lanús', 'Independiente']
  },
  {
    id: 'copa-do-mundo',
    name: 'Copa do Mundo FIFA & Eliminatórias',
    shortName: 'Copa do Mundo',
    country: 'Mundial',
    flag: '🌍',
    aliases: ['copa do mundo', 'fifa', 'eliminatorias', 'eliminatórias', 'copa america', 'copa américa', 'eurocopa', 'euro', 'amistoso'],
    popularTeams: [
      'Brasil', 'Argentina', 'França', 'Inglaterra', 'Alemanha',
      'Espanha', 'Portugal', 'Itália', 'Holanda', 'Uruguai',
      'Colômbia', 'Bélgica', 'Croácia', 'Marrocos', 'Japão', 'Estados Unidos'
    ]
  }
];

export interface TeamGroup {
  region: string;
  flag: string;
  teams: string[];
}

export const WORLD_TEAMS_CATALOG: TeamGroup[] = [
  {
    region: 'Brasil (Série A & B)',
    flag: '🇧🇷',
    teams: [
      'Flamengo', 'Palmeiras', 'São Paulo', 'Corinthians', 'Santos',
      'Grêmio', 'Internacional', 'Atlético-MG', 'Cruzeiro', 'Vasco',
      'Fluminense', 'Botafogo', 'Bahia', 'Fortaleza', 'Athletico-PR',
      'Coritiba', 'Sport', 'Ceará', 'Goiás', 'Vitória',
      'Bragantino', 'Juventude', 'Cuiabá', 'América-MG', 'Mirassol',
      'Avaí', 'Chapecoense', 'Ponte Preta', 'Vila Nova', 'Novorizontino'
    ]
  },
  {
    region: 'Inglaterra (Premier League)',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    teams: [
      'Manchester City', 'Arsenal', 'Liverpool', 'Manchester United',
      'Chelsea', 'Tottenham', 'Aston Villa', 'Newcastle',
      'Brighton', 'West Ham', 'Everton', 'Wolverhampton',
      'Fulham', 'Brentford', 'Crystal Palace', 'Nottingham Forest',
      'Bournemouth', 'Leicester City'
    ]
  },
  {
    region: 'Espanha (La Liga)',
    flag: '🇪🇸',
    teams: [
      'Real Madrid', 'Barcelona', 'Atlético de Madrid', 'Athletic Bilbao',
      'Real Sociedad', 'Villarreal', 'Real Betis', 'Sevilla',
      'Valencia', 'Girona', 'Celta de Vigo', 'Osasuna', 'Mallorca'
    ]
  },
  {
    region: 'Alemanha (Bundesliga)',
    flag: '🇩🇪',
    teams: [
      'Bayern de Munique', 'Borussia Dortmund', 'Bayer Leverkusen',
      'RB Leipzig', 'Eintracht Frankfurt', 'VfB Stuttgart',
      'Borussia Mönchengladbach', 'Wolfsburg', 'Freiburg', 'Hoffenheim'
    ]
  },
  {
    region: 'Itália (Serie A)',
    flag: '🇮🇹',
    teams: [
      'Inter de Milão', 'Milan', 'Juventus', 'Napoli',
      'Roma', 'Lazio', 'Atalanta', 'Fiorentina',
      'Bologna', 'Torino', 'Genoa', 'Monza'
    ]
  },
  {
    region: 'França (Ligue 1)',
    flag: '🇫🇷',
    teams: [
      'Paris Saint-Germain', 'Monaco', 'Olympique de Marselha',
      'Lyon', 'Lille', 'Rennes', 'Nice', 'Lens', 'Brest'
    ]
  },
  {
    region: 'Portugal (Primeira Liga)',
    flag: '🇵🇹',
    teams: [
      'Benfica', 'Porto', 'Sporting', 'Braga',
      'Vitória de Guimarães', 'Famalicão', 'Boavista', 'Rio Ave'
    ]
  },
  {
    region: 'América do Sul (Libertadores)',
    flag: '🌎',
    teams: [
      'Boca Juniors', 'River Plate', 'Racing Club', 'Independiente',
      'San Lorenzo', 'Vélez Sarsfield', 'Estudiantes', 'Peñarol',
      'Nacional (URU)', 'Olimpia', 'Cerro Porteño', 'LDU Quito',
      'Independiente del Valle', 'Colo-Colo', 'Bolívar'
    ]
  },
  {
    region: 'Seleções Mundiais',
    flag: '🌍',
    teams: [
      'Brasil', 'Argentina', 'França', 'Inglaterra', 'Alemanha',
      'Espanha', 'Portugal', 'Itália', 'Holanda', 'Bélgica',
      'Croácia', 'Uruguai', 'Colômbia', 'Marrocos', 'Japão',
      'Estados Unidos', 'México', 'Suíça', 'Dinamarca', 'Chile'
    ]
  }
];

/**
 * Normaliza o nome do campeonato para bater com o cadastro
 */
export function normalizeChampionshipName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Verifica se um campeonato bate com algum selecionado pelo usuário
 */
export function isChampionshipMatching(championshipName: string, selectedList: string[]): boolean {
  if (!championshipName || !selectedList || selectedList.length === 0) return false;
  const normTarget = normalizeChampionshipName(championshipName);

  return selectedList.some((sel) => {
    const category = WORLD_CHAMPIONSHIPS.find((c) => c.name === sel || c.id === sel);
    if (category) {
      if (normTarget.includes(normalizeChampionshipName(category.name))) return true;
      if (normTarget.includes(normalizeChampionshipName(category.shortName))) return true;
      for (const alias of category.aliases) {
        if (normTarget.includes(normalizeChampionshipName(alias))) return true;
      }
    }
    const normSel = normalizeChampionshipName(sel);
    return normTarget.includes(normSel) || normSel.includes(normTarget);
  });
}
