import { MatchItem } from './types';

export interface LiveScoreData {
  score_home: number;
  score_away: number;
  status_desc?: string;
  is_live: boolean;
  is_finished: boolean;
}

function safeTimeoutSignal(ms: number): AbortSignal | undefined {
  try {
    if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
      return AbortSignal.timeout(ms);
    }
  } catch {}
  return undefined;
}

// Major leagues covered automatically and freely by ESPN Scoreboard API (no API key required)
const ESPN_LEAGUES = [
  'bra.1', // Brasileirão Série A
  'bra.2', // Brasileirão Série B
  'bra.copa_do_brasil', // Copa do Brasil
  'conmebol.libertadores', // Copa Libertadores
  'conmebol.sudamericana', // Copa Sul-Americana
  'arg.1', // Campeonato Argentino
  'uefa.champions', // UEFA Champions League
  'uefa.europa', // UEFA Europa League
  'uefa.europa.conf', // UEFA Conference League
  'eng.1', // Premier League
  'esp.1', // La Liga
  'ita.1', // Serie A Italiana
  'ger.1', // Bundesliga
  'fra.1', // Ligue 1
  'por.1', // Liga Portugal
  'fifa.world', // Eliminatórias / Copa do Mundo
  'conmebol.world_cup_qualifying', // Eliminatórias Sul-Americanas
];

export function normalizeTeamNameForMatching(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(fc|ec|cr|sc|ac|clube|futebol|de|la|esporte|associacao|atletica)\b/gi, '')
    .replace(/mineiro/gi, 'mg')
    .replace(/paranaense/gi, 'pr')
    .replace(/goiano/gi, 'go')
    .replace(/gaucho/gi, 'rs')
    .replace(/catarinense/gi, 'sc')
    .replace(/paulista/gi, 'sp')
    .replace(/carioca/gi, 'rj')
    .replace(/[\(\)\-\.\,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function areTeamsMatching(nameA: string, nameB: string): boolean {
  const normA = normalizeTeamNameForMatching(nameA);
  const normB = normalizeTeamNameForMatching(nameB);
  if (!normA || !normB) return false;
  if (normA === normB) return true;
  if (normA.includes(normB) || normB.includes(normA)) return true;

  const tokensA = normA.split(' ').filter(t => t.length > 2);
  const tokensB = normB.split(' ').filter(t => t.length > 2);
  const common = tokensA.filter(t => tokensB.includes(t));
  return common.length > 0;
}

interface RawEspnEvent {
  status?: {
    type?: {
      name?: string;
      description?: string;
      completed?: boolean;
      state?: 'pre' | 'in' | 'post';
    };
    displayClock?: string;
  };
  competitions?: Array<{
    competitors?: Array<{
      homeAway?: 'home' | 'away';
      score?: string;
      team?: {
        displayName?: string;
        name?: string;
        shortDisplayName?: string;
      };
    }>;
  }>;
}

/**
 * Fetches scoreboards for all major leagues from ESPN
 */
async function fetchEspnScores(): Promise<Array<{
  homeName: string;
  awayName: string;
  scoreHome: number;
  scoreAway: number;
  statusDesc: string;
  isLive: boolean;
  isFinished: boolean;
}>> {
  const results: Array<{
    homeName: string;
    awayName: string;
    scoreHome: number;
    scoreAway: number;
    statusDesc: string;
    isLive: boolean;
    isFinished: boolean;
  }> = [];

  const promises = ESPN_LEAGUES.map(async league => {
    try {
      const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        signal: safeTimeoutSignal(6000),
      });

      if (!res.ok) return;
      const data = (await res.json()) as { events?: RawEspnEvent[] };
      if (!data?.events) return;

      for (const ev of data.events) {
        const comp = ev.competitions?.[0];
        if (!comp?.competitors) continue;

        const home = comp.competitors.find(c => c.homeAway === 'home');
        const away = comp.competitors.find(c => c.homeAway === 'away');
        if (!home?.team || !away?.team) continue;

        const rawHomeScore = parseInt(home.score || '0', 10);
        const rawAwayScore = parseInt(away.score || '0', 10);
        const scoreHome = isNaN(rawHomeScore) ? 0 : rawHomeScore;
        const scoreAway = isNaN(rawAwayScore) ? 0 : rawAwayScore;

        const state = ev.status?.type?.state;
        const isFinished = state === 'post' || ev.status?.type?.completed === true;
        const isLive = state === 'in';

        // Only register if match is live or finished (or has scored)
        if (!isLive && !isFinished) continue;

        let statusDesc = ev.status?.type?.description || '';
        if (isLive && ev.status?.displayClock) {
          statusDesc = `Ao vivo • ${ev.status.displayClock}`;
        } else if (isLive) {
          statusDesc = 'Ao vivo';
        } else if (isFinished) {
          statusDesc = 'Encerrado';
        }

        results.push({
          homeName: home.team.displayName || home.team.name || '',
          awayName: away.team.displayName || away.team.name || '',
          scoreHome,
          scoreAway,
          statusDesc,
          isLive,
          isFinished,
        });
      }
    } catch {
      // Ignore individual league network errors
    }
  });

  await Promise.allSettled(promises);
  return results;
}

/**
 * Optional API-Football (RapidAPI) integration for users who add a free API key
 */
async function fetchApiFootballScores(apiKey: string): Promise<Array<{
  homeName: string;
  awayName: string;
  scoreHome: number;
  scoreAway: number;
  statusDesc: string;
  isLive: boolean;
  isFinished: boolean;
}>> {
  const results: Array<{
    homeName: string;
    awayName: string;
    scoreHome: number;
    scoreAway: number;
    statusDesc: string;
    isLive: boolean;
    isFinished: boolean;
  }> = [];

  try {
    const res = await fetch('https://v3.football.api-sports.io/fixtures?live=all', {
      headers: {
        'x-apisports-key': apiKey,
      },
      signal: safeTimeoutSignal(6000),
    });

    if (!res.ok) return results;
    const data = (await res.json()) as any;
    if (!data?.response) return results;

    for (const item of data.response) {
      const homeName = item.teams?.home?.name || '';
      const awayName = item.teams?.away?.name || '';
      const scoreHome = item.goals?.home ?? 0;
      const scoreAway = item.goals?.away ?? 0;
      const shortStatus = item.fixture?.status?.short || '';
      const elapsed = item.fixture?.status?.elapsed;

      const isFinished = ['FT', 'AET', 'PEN'].includes(shortStatus);
      const isLive = ['1H', '2H', 'HT', 'ET', 'P', 'BT'].includes(shortStatus);

      let statusDesc = isFinished ? 'Encerrado' : 'Ao vivo';
      if (isLive && elapsed) {
        statusDesc = `Ao vivo • ${elapsed}'`;
      }

      results.push({
        homeName,
        awayName,
        scoreHome,
        scoreAway,
        statusDesc,
        isLive,
        isFinished,
      });
    }
  } catch (e) {
    console.warn('[API-Football] Erro ao buscar placares:', e);
  }

  return results;
}

/**
 * Main service to fetch all available scores and map them to target matches
 */
export async function getLiveScoresForMatches(matches: MatchItem[]): Promise<Record<string, LiveScoreData>> {
  const scoresMap: Record<string, LiveScoreData> = {};
  if (!matches || matches.length === 0) return scoresMap;

  // 1. Fetch from ESPN (free, zero configuration required)
  const allEvents = await fetchEspnScores();

  // 2. Fetch from API-Football if key configured in server environment
  const optionalApiKey =
    process.env.FOOTBALL_API_KEY ||
    process.env.API_FOOTBALL_KEY ||
    (typeof process !== 'undefined' ? (process as any).env?.VITE_FOOTBALL_API_KEY : undefined);

  if (optionalApiKey) {
    const apiFootballEvents = await fetchApiFootballScores(optionalApiKey);
    allEvents.push(...apiFootballEvents);
  }

  // 3. Match each MatchItem against scoreboard events
  for (const match of matches) {
    const eventMatch = allEvents.find(ev => {
      const homeMatches = areTeamsMatching(match.team_home, ev.homeName);
      const awayMatches = areTeamsMatching(match.team_away, ev.awayName);
      return homeMatches && awayMatches;
    });

    if (eventMatch) {
      scoresMap[match.id] = {
        score_home: eventMatch.scoreHome,
        score_away: eventMatch.scoreAway,
        status_desc: eventMatch.statusDesc,
        is_live: eventMatch.isLive,
        is_finished: eventMatch.isFinished,
      };
    }
  }

  return scoresMap;
}

/**
 * Enriches matches with retrieved live score data
 */
export function enrichMatchesWithScores(
  matches: MatchItem[],
  scoresMap: Record<string, LiveScoreData>
): MatchItem[] {
  if (!scoresMap || Object.keys(scoresMap).length === 0) return matches;

  return matches.map(m => {
    const score = scoresMap[m.id];
    if (score) {
      return {
        ...m,
        score_home: score.score_home,
        score_away: score.score_away,
        status_desc: score.status_desc || m.status_desc,
        is_live: score.is_live,
        is_finished: score.is_finished,
      };
    }
    return m;
  });
}
