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

// Major leagues and cups covered freely by ESPN Scoreboard API (no API key required)
const ESPN_LEAGUES = [
  'bra.1', // Brasileirão Série A
  'bra.2', // Brasileirão Série B
  'bra.copa_do_brasil', // Copa do Brasil
  'conmebol.libertadores', // Copa Libertadores
  'conmebol.sudamericana', // Copa Sul-Americana
  'uefa.champions', // UEFA Champions League
  'uefa.europa', // UEFA Europa League
  'uefa.europa.conf', // UEFA Conference League
  'eng.1', // Premier League
  'eng.league_cup', // Copa da Liga Inglesa (Carabao Cup / EFL Cup)
  'eng.fa', // Copa da Inglaterra (FA Cup)
  'esp.1', // La Liga
  'esp.copa_del_rey', // Copa do Rei
  'ita.1', // Serie A Italiana
  'ita.coppa_italia', // Coppa Italia
  'ger.1', // Bundesliga
  'ger.dfb_pokal', // Copa da Alemanha (DFB-Pokal)
  'fra.1', // Ligue 1
  'fra.coupe_de_france', // Copa da França
  'por.1', // Liga Portugal
  'tur.1', // Campeonato Turco
  'arg.1', // Campeonato Argentino
  'afc.champions', // Champions League da Ásia (AFC)
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

export interface ScoreboardEvent {
  homeName: string;
  awayName: string;
  scoreHome: number;
  scoreAway: number;
  statusDesc: string;
  isLive: boolean;
  isFinished: boolean;
  dateStr?: string;
}

// 30-second in-memory cache to prevent redundant fetches
let scoreCache: { timestamp: number; events: ScoreboardEvent[] } | null = null;

/**
 * Fetches scoreboards for all major leagues from ESPN, using dates parameter (YYYYMMDD)
 */
async function fetchEspnScores(dates: string[]): Promise<ScoreboardEvent[]> {
  const now = Date.now();
  if (scoreCache && now - scoreCache.timestamp < 30000 && scoreCache.events.length > 0) {
    return scoreCache.events;
  }

  const results: ScoreboardEvent[] = [];
  const targetDates = dates.length > 0 ? dates : [new Date().toISOString().slice(0, 10).replace(/-/g, '')];

  const fetchPromises: Promise<void>[] = [];

  for (const dateParam of targetDates) {
    for (const league of ESPN_LEAGUES) {
      fetchPromises.push(
        (async () => {
          try {
            const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard?dates=${dateParam}`;
            const res = await fetch(url, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
              signal: safeTimeoutSignal(4500),
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
                dateStr: dateParam,
              });
            }
          } catch {
            // Ignore individual league network errors
          }
        })()
      );
    }
  }

  await Promise.allSettled(fetchPromises);
  if (results.length > 0) {
    scoreCache = { timestamp: now, events: results };
  }
  return results;
}

/**
 * Optional API-Football (RapidAPI) integration for users who add a free API key
 */
async function fetchApiFootballScores(apiKey: string): Promise<ScoreboardEvent[]> {
  const results: ScoreboardEvent[] = [];

  try {
    const res = await fetch('https://v3.football.api-sports.io/fixtures?live=all', {
      headers: {
        'x-apisports-key': apiKey,
      },
      signal: safeTimeoutSignal(5000),
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

  // Extract distinct dates from matches (formatted as YYYYMMDD)
  const distinctDates = Array.from(
    new Set(
      matches
        .map(m => (m.date || '').replace(/[-/]/g, '').trim())
        .filter(d => d.length === 8)
    )
  );

  // 1. Fetch from ESPN with date parameters
  const allEvents = await fetchEspnScores(distinctDates);

  // 2. Fetch from API-Football if key configured in server environment
  const optionalApiKey =
    (typeof process !== 'undefined' ? process.env?.FOOTBALL_API_KEY : undefined) ||
    (typeof process !== 'undefined' ? process.env?.API_FOOTBALL_KEY : undefined) ||
    (typeof process !== 'undefined' ? (process as any).env?.VITE_FOOTBALL_API_KEY : undefined);

  if (optionalApiKey) {
    const apiFootballEvents = await fetchApiFootballScores(optionalApiKey);
    allEvents.push(...apiFootballEvents);
  }

  // 3. Match each MatchItem against scoreboard events
  for (const match of matches) {
    const matchDateParam = (match.date || '').replace(/[-/]/g, '').trim();

    const eventMatch = allEvents.find(ev => {
      // If event has dateStr and match has date, prioritize same date
      if (ev.dateStr && matchDateParam && ev.dateStr !== matchDateParam) {
        return false;
      }
      const homeMatches = areTeamsMatching(match.team_home, ev.homeName);
      const awayMatches = areTeamsMatching(match.team_away, ev.awayName);
      return homeMatches && awayMatches;
    });

    if (eventMatch) {
      // Only set scores if the match is live, finished, or has a non-zero score recorded
      if (eventMatch.isLive || eventMatch.isFinished || eventMatch.scoreHome > 0 || eventMatch.scoreAway > 0) {
        scoresMap[match.id] = {
          score_home: eventMatch.scoreHome,
          score_away: eventMatch.scoreAway,
          status_desc: eventMatch.statusDesc,
          is_live: eventMatch.isLive,
          is_finished: eventMatch.isFinished,
        };
      }
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
