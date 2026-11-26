import { getBrasiliaTimeString } from './scraper';
import { StandingsResponse, StandingRow, StandingZone } from './types';

const ESPN_BRA1_STANDINGS_URL =
  'https://site.api.espn.com/apis/v2/sports/soccer/bra.1/standings';

// 15-second in-memory cache so bursts share responses while 30s polling always gets fresh data
let standingsCache: { timestamp: number; data: StandingsResponse } | null = null;
const CACHE_TTL_MS = 15_000;

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

export function getStandingZone(rank: number): StandingZone {
  if (rank >= 1 && rank <= 4) return 'libertadores';
  if (rank >= 5 && rank <= 6) return 'pre-libertadores';
  if (rank >= 7 && rank <= 12) return 'sul-americana';
  if (rank >= 17) return 'rebaixamento';
  return 'none';
}

interface RawEspnStat {
  name?: string;
  value?: number;
  displayValue?: string;
  summary?: string;
}

interface RawEspnStandingEntry {
  team?: {
    id?: string;
    name?: string;
    displayName?: string;
    shortDisplayName?: string;
    abbreviation?: string;
    logos?: Array<{ href?: string }>;
  };
  stats?: RawEspnStat[];
}

interface RawEspnStandingsPayload {
  name?: string;
  abbreviation?: string;
  children?: Array<{
    name?: string;
    standings?: {
      season?: number;
      seasonDisplayName?: string;
      entries?: RawEspnStandingEntry[];
    };
  }>;
}

function getStatValue(stats: RawEspnStat[] | undefined, name: string): number {
  const found = stats?.find(s => s.name === name);
  return typeof found?.value === 'number' && !Number.isNaN(found.value) ? found.value : 0;
}

function getStatSummary(stats: RawEspnStat[] | undefined, name: string): string {
  const found = stats?.find(s => s.name === name);
  return found?.summary || found?.displayValue || '';
}

export async function fetchBrasileiraoStandings(): Promise<StandingsResponse> {
  const now = Date.now();
  if (standingsCache && now - standingsCache.timestamp < CACHE_TTL_MS && standingsCache.data.entries.length > 0) {
    return {
      ...standingsCache.data,
      lastUpdated: getBrasiliaTimeString(),
    };
  }

  try {
    const res = await fetch(ESPN_BRA1_STANDINGS_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
      signal: safeTimeoutSignal(7000),
    });

    if (!res.ok) {
      throw new Error(`ESPN Standings HTTP ${res.status}`);
    }

    const payload = (await res.json()) as RawEspnStandingsPayload;
    const group = payload.children?.[0];
    const standingsBlock = group?.standings;
    const rawEntries = standingsBlock?.entries || [];

    if (rawEntries.length === 0) {
      throw new Error('Tabela do Brasileirão sem registros retornados');
    }

    const entries: StandingRow[] = rawEntries.map((entry, idx) => {
      const stats = entry.stats || [];
      const rank = getStatValue(stats, 'rank') || idx + 1;
      const points = getStatValue(stats, 'points');
      const gamesPlayed = getStatValue(stats, 'gamesPlayed');
      const wins = getStatValue(stats, 'wins');
      const draws = getStatValue(stats, 'ties');
      const losses = getStatValue(stats, 'losses');
      const goalsFor = getStatValue(stats, 'pointsFor');
      const goalsAgainst = getStatValue(stats, 'pointsAgainst');
      const goalDifference = getStatValue(stats, 'pointDifferential');
      const rankChange = getStatValue(stats, 'rankChange');
      const overallSummary = getStatSummary(stats, 'overall');
      const winPercentage =
        gamesPlayed > 0 ? Math.round((points / (gamesPlayed * 3)) * 100) : 0;

      const teamName =
        entry.team?.displayName ||
        entry.team?.shortDisplayName ||
        entry.team?.name ||
        `Time ${idx + 1}`;

      return {
        rank,
        teamId: entry.team?.id || String(idx + 1),
        teamName,
        abbreviation: entry.team?.abbreviation || teamName.slice(0, 3).toUpperCase(),
        logoUrl: entry.team?.logos?.[0]?.href,
        points,
        gamesPlayed,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        goalDifference,
        winPercentage,
        rankChange,
        overallSummary,
        zone: getStandingZone(rank),
      };
    });

    entries.sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });

    // Recompute zone strictly from sorted position to keep table zones consistent
    entries.forEach((row, index) => {
      const pos = row.rank > 0 ? row.rank : index + 1;
      row.rank = pos;
      row.zone = getStandingZone(pos);
    });

    const response: StandingsResponse = {
      success: true,
      season: standingsBlock?.season || new Date().getFullYear(),
      seasonDisplayName:
        standingsBlock?.seasonDisplayName ||
        `${standingsBlock?.season || new Date().getFullYear()} Brasileirão Série A`,
      entries,
      lastUpdated: getBrasiliaTimeString(),
      source: 'espn',
    };

    standingsCache = { timestamp: now, data: response };
    return response;
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn('[Standings] Falha ao buscar classificação:', errMsg);

    if (standingsCache && standingsCache.data.entries.length > 0) {
      return {
        ...standingsCache.data,
        lastUpdated: getBrasiliaTimeString(),
        message: 'Exibindo última classificação em cache',
      };
    }

    return {
      success: false,
      season: new Date().getFullYear(),
      seasonDisplayName: 'Brasileirão Série A',
      entries: [],
      lastUpdated: getBrasiliaTimeString(),
      source: 'error',
      message: errMsg || 'Não foi possível carregar a tabela no momento.',
    };
  }
}

