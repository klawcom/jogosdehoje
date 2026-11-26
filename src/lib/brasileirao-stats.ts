import { getBrasiliaTimeString } from './scraper';
import { fetchBrasileiraoStandings } from './standings';
import {
  BrasileiraoStatsResponse,
  PlayerStatLeader,
  StandingRow,
  TeamStatHighlight,
} from './types';

const ESPN_BRA1_STATISTICS_URL =
  'https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/statistics';

// 20-second cache for full stats payload; athlete names cached for 24h to minimize subrequests
let statsCache: { timestamp: number; data: BrasileiraoStatsResponse } | null = null;
const STATS_CACHE_TTL_MS = 20_000;
const athleteNameCache = new Map<string, { displayName: string; shortName: string }>();

function safeTimeoutSignal(ms: number): AbortSignal | undefined {
  try {
    if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
      return AbortSignal.timeout(ms);
    }
  } catch {
    // Fallback without signal in older runtimes
  }
  return undefined;
}

interface RawStatEntry {
  name?: string;
  value?: number;
}

interface RawStatisticsLeader {
  value?: number;
  athlete?: {
    id?: string;
    displayName?: string;
    shortName?: string;
    team?: {
      id?: string;
      displayName?: string;
      shortDisplayName?: string;
      name?: string;
      logos?: Array<{ href?: string }>;
    };
    statistics?: RawStatEntry[];
  };
}

interface RawStatisticsCategory {
  name?: string;
  leaders?: RawStatisticsLeader[];
}

interface RawStatisticsPayload {
  season?: {
    year?: number;
    displayName?: string;
    name?: string;
  };
  stats?: RawStatisticsCategory[];
}

interface RawCoreLeaderEntry {
  value?: number;
  athlete?: { $ref?: string };
  team?: { $ref?: string };
}

interface RawCoreLeadersPayload {
  categories?: Array<{
    name?: string;
    leaders?: RawCoreLeaderEntry[];
  }>;
}

function getPlayerStat(stats: RawStatEntry[] | undefined, statName: string): number {
  const found = stats?.find((s) => s.name === statName);
  return typeof found?.value === 'number' && !Number.isNaN(found.value) ? found.value : 0;
}

function mapSiteLeaders(leaders: RawStatisticsLeader[] | undefined, limit = 25): PlayerStatLeader[] {
  if (!leaders || leaders.length === 0) return [];
  return leaders.slice(0, limit).map((item, idx) => {
    const athlete = item.athlete;
    const team = athlete?.team;
    const stats = athlete?.statistics;

    const displayName = athlete?.displayName || athlete?.shortName || `Jogador ${idx + 1}`;
    const shortName = athlete?.shortName || displayName;
    const teamName = team?.displayName || team?.shortDisplayName || team?.name || 'Clube';

    if (athlete?.id) {
      athleteNameCache.set(athlete.id, { displayName, shortName });
    }

    return {
      rank: idx + 1,
      athleteId: athlete?.id || String(idx + 1),
      playerName: displayName,
      shortName,
      teamId: team?.id || '',
      teamName,
      teamLogoUrl: team?.logos?.[0]?.href,
      value: typeof item.value === 'number' ? item.value : 0,
      appearances: getPlayerStat(stats, 'appearances'),
      goals: getPlayerStat(stats, 'totalGoals'),
      assists: getPlayerStat(stats, 'goalAssists'),
    };
  });
}

function extractIdFromRef(refUrl: string | undefined, segment: 'athletes' | 'teams'): string {
  if (!refUrl) return '';
  const match = refUrl.match(new RegExp(`/${segment}/(\\d+)`, 'i'));
  return match?.[1] || '';
}

async function resolveCoreCategoryLeaders(
  entries: RawCoreLeaderEntry[] | undefined,
  teamMap: Map<string, StandingRow>,
  limit = 10
): Promise<PlayerStatLeader[]> {
  if (!entries || entries.length === 0) return [];
  const slice = entries.slice(0, limit);

  const missingRefs: Array<{ athleteId: string; url: string }> = [];
  for (const item of slice) {
    const ref = item.athlete?.$ref;
    const athleteId = extractIdFromRef(ref, 'athletes');
    if (athleteId && ref && !athleteNameCache.has(athleteId)) {
      if (!missingRefs.some((m) => m.athleteId === athleteId)) {
        missingRefs.push({
          athleteId,
          url: ref.replace(/^http:\/\//i, 'https://'),
        });
      }
    }
  }

  if (missingRefs.length > 0) {
    await Promise.allSettled(
      missingRefs.map(async ({ athleteId, url }) => {
        try {
          const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: safeTimeoutSignal(3500),
          });
          if (!res.ok) return;
          const data = (await res.json()) as { displayName?: string; shortName?: string };
          if (data?.displayName || data?.shortName) {
            athleteNameCache.set(athleteId, {
              displayName: data.displayName || data.shortName || 'Jogador',
              shortName: data.shortName || data.displayName || 'Jogador',
            });
          }
        } catch {
          // Ignore individual athlete resolution failure
        }
      })
    );
  }

  return slice.map((item, idx) => {
    const athleteId = extractIdFromRef(item.athlete?.$ref, 'athletes') || String(idx + 1);
    const teamId = extractIdFromRef(item.team?.$ref, 'teams');
    const cachedAthlete = athleteNameCache.get(athleteId);
    const teamInfo = teamId ? teamMap.get(teamId) : undefined;

    return {
      rank: idx + 1,
      athleteId,
      playerName: cachedAthlete?.displayName || `Jogador #${athleteId}`,
      shortName: cachedAthlete?.shortName || `Jogador #${athleteId}`,
      teamId,
      teamName: teamInfo?.teamName || 'Série A',
      teamLogoUrl: teamInfo?.logoUrl,
      value: typeof item.value === 'number' ? item.value : 0,
    };
  });
}

export async function fetchBrasileiraoStats(): Promise<BrasileiraoStatsResponse> {
  const now = Date.now();
  if (statsCache && now - statsCache.timestamp < STATS_CACHE_TTL_MS && statsCache.data.success) {
    return {
      ...statsCache.data,
      lastUpdated: getBrasiliaTimeString(),
    };
  }

  try {
    const [statsRes, standingsRes] = await Promise.all([
      fetch(ESPN_BRA1_STATISTICS_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        signal: safeTimeoutSignal(7000),
      }),
      fetchBrasileiraoStandings(),
    ]);

    if (!statsRes.ok) {
      throw new Error(`ESPN Statistics HTTP ${statsRes.status}`);
    }

    const payload = (await statsRes.json()) as RawStatisticsPayload;
    const season = payload.season?.year || standingsRes.season || new Date().getFullYear();
    const seasonDisplayName =
      payload.season?.name ||
      payload.season?.displayName ||
      standingsRes.seasonDisplayName ||
      `Brasileirão Série A ${season}`;

    const goalsCat = payload.stats?.find((c) => c.name === 'goalsLeaders');
    const assistsCat = payload.stats?.find((c) => c.name === 'assistsLeaders');

    const goalsLeaders = mapSiteLeaders(goalsCat?.leaders, 25);
    const assistsLeaders = mapSiteLeaders(assistsCat?.leaders, 25);

    // Map teams from standings for yellow/red cards and team attack/defense highlights
    const teamMap = new Map<string, StandingRow>();
    for (const row of standingsRes.entries) {
      if (row.teamId) teamMap.set(row.teamId, row);
    }

    // Fetch yellowCards and redCards from ESPN Core Leaders (with graceful fallback if unavailable)
    let yellowCardsLeaders: PlayerStatLeader[] = [];
    let redCardsLeaders: PlayerStatLeader[] = [];
    try {
      const coreUrl = `https://sports.core.api.espn.com/v2/sports/soccer/leagues/bra.1/seasons/${season}/types/1/leaders`;
      const coreRes = await fetch(coreUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: safeTimeoutSignal(5000),
      });
      if (coreRes.ok) {
        const corePayload = (await coreRes.json()) as RawCoreLeadersPayload;
        const yellowCat = corePayload.categories?.find((c) => c.name === 'yellowCards');
        const redCat = corePayload.categories?.find((c) => c.name === 'redCards');

        const [yellows, reds] = await Promise.all([
          resolveCoreCategoryLeaders(yellowCat?.leaders, teamMap, 10),
          resolveCoreCategoryLeaders(redCat?.leaders, teamMap, 10),
        ]);
        yellowCardsLeaders = yellows;
        redCardsLeaders = reds;
      }
    } catch (coreErr) {
      console.warn('[Stats] Cartões indisponíveis no momento:', coreErr);
    }

    // Team highlights & league totals from standings
    const teamHighlights: TeamStatHighlight[] = standingsRes.entries.map((row) => ({
      teamId: row.teamId,
      teamName: row.teamName,
      logoUrl: row.logoUrl,
      gamesPlayed: row.gamesPlayed,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      goalDifference: row.goalDifference,
      wins: row.wins,
      points: row.points,
    }));

    const bestOffense = [...teamHighlights].sort((a, b) => b.goalsFor - a.goalsFor);
    const bestDefense = [...teamHighlights].sort((a, b) => a.goalsAgainst - b.goalsAgainst);

    const totalGoals = teamHighlights.reduce((sum, t) => sum + t.goalsFor, 0);
    const totalTeamGames = teamHighlights.reduce((sum, t) => sum + t.gamesPlayed, 0);
    const totalMatches = Math.round(totalTeamGames / 2);
    const goalsPerMatch = totalMatches > 0 ? Number((totalGoals / totalMatches).toFixed(2)) : 0;

    const result: BrasileiraoStatsResponse = {
      success: true,
      season,
      seasonDisplayName,
      lastUpdated: getBrasiliaTimeString(),
      source: 'espn',
      goalsLeaders,
      assistsLeaders,
      yellowCardsLeaders,
      redCardsLeaders,
      bestOffense,
      bestDefense,
      leagueTotals: {
        totalGoals,
        totalMatches,
        goalsPerMatch,
      },
    };

    statsCache = { timestamp: now, data: result };
    return result;
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn('[Stats] Falha ao carregar estatísticas:', errMsg);

    if (statsCache && statsCache.data.success) {
      return {
        ...statsCache.data,
        lastUpdated: getBrasiliaTimeString(),
        message: 'Exibindo estatísticas em cache',
      };
    }

    return {
      success: false,
      season: new Date().getFullYear(),
      seasonDisplayName: 'Brasileirão Série A',
      lastUpdated: getBrasiliaTimeString(),
      source: 'error',
      message: errMsg || 'Não foi possível carregar as estatísticas no momento.',
      goalsLeaders: [],
      assistsLeaders: [],
      yellowCardsLeaders: [],
      redCardsLeaders: [],
      bestOffense: [],
      bestDefense: [],
      leagueTotals: {
        totalGoals: 0,
        totalMatches: 0,
        goalsPerMatch: 0,
      },
    };
  }
}

