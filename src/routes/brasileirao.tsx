import { useState, useEffect, useMemo, useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  Search,
  X,
  Trophy,
  Star,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
  BarChart3,
  Target,
  Sparkles,
  Flame,
  Shield,
  Square,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  fetchBrasileiraoStandingsServerFn,
  fetchBrasileiraoStatsServerFn,
} from '../lib/server-fn';
import { fetchBrasileiraoStandings } from '../lib/standings';
import { fetchBrasileiraoStats } from '../lib/brasileirao-stats';
import { getBrasiliaTimeString } from '../lib/scraper';
import {
  BrasileiraoStatsResponse,
  PlayerStatLeader,
  StandingRow,
  StandingZone,
} from '../lib/types';
import { useTheme } from '../lib/theme';
import { useFavorites } from '../lib/favorites';
import {
  shareBrasileiraoStandingsOnWhatsApp,
  shareBrasileiraoStatsOnWhatsApp,
} from '../lib/whatsapp';
import { SiteHeader } from '../components/site-header';
import { TeamBadge } from '../components/team-badge';
import { FloatingWhatsAppButton } from '../components/floating-whatsapp-button';

type MobileSectionTab = 'classificacao' | 'estatisticas';
type StatCategoryTab = 'goals' | 'assists' | 'yellow' | 'red' | 'clubs';

export const Route = createFileRoute('/brasileirao')({
  component: BrasileiraoTabelaPage,
  validateSearch: (search: Record<string, unknown>): { tab?: MobileSectionTab } => {
    const raw = search?.tab;
    if (raw === 'estatisticas' || raw === 'classificacao') {
      return { tab: raw };
    }
    return {};
  },
  loader: async () => {
    const [standings, stats] = await Promise.all([
      (async () => {
        try {
          const data = await fetchBrasileiraoStandingsServerFn();
          if (data && data.success && data.entries.length > 0) return data;
        } catch (err) {
          console.warn('fetchBrasileiraoStandingsServerFn loader warning:', err);
        }
        return fetchBrasileiraoStandings();
      })(),
      (async () => {
        try {
          const data = await fetchBrasileiraoStatsServerFn();
          if (data && data.success) return data;
        } catch (err) {
          console.warn('fetchBrasileiraoStatsServerFn loader warning:', err);
        }
        return fetchBrasileiraoStats();
      })(),
    ]);

    return { standings, stats };
  },
  head: () => ({
    meta: [
      {
        title:
          'Brasileirão Série A — Classificação e Estatísticas Atualizadas | Jogos de Hoje',
      },
      {
        name: 'description',
        content:
          'Confira a tabela de classificação e estatísticas completas do Brasileirão Série A atualizadas automaticamente: pontos, G-4, Z-4, artilharia, assistências, cartões e melhores ataques e defesas.',
      },
    ],
  }),
});

const ZONE_META: Record<
  StandingZone,
  {
    label: string;
    barClass: string;
    rankTextClass: string;
  }
> = {
  libertadores: {
    label: 'Fase de grupos da Libertadores',
    barClass: 'bg-emerald-500',
    rankTextClass: 'text-emerald-600 dark:text-emerald-400',
  },
  'pre-libertadores': {
    label: 'Pré-Libertadores',
    barClass: 'bg-sky-500',
    rankTextClass: 'text-sky-600 dark:text-sky-400',
  },
  'sul-americana': {
    label: 'Copa Sul-Americana',
    barClass: 'bg-amber-500',
    rankTextClass: 'text-amber-600 dark:text-amber-400',
  },
  rebaixamento: {
    label: 'Zona de rebaixamento',
    barClass: 'bg-rose-500',
    rankTextClass: 'text-rose-600 dark:text-rose-400',
  },
  none: {
    label: 'Zona intermediária',
    barClass: 'bg-transparent',
    rankTextClass: 'text-muted-foreground',
  },
};

function BrasileiraoTabelaPage() {
  const loaderData = Route.useLoaderData();
  const searchParams = Route.useSearch();

  const [entries, setEntries] = useState<StandingRow[]>(
    loaderData?.standings?.entries || []
  );
  const [season, setSeason] = useState<number>(
    loaderData?.standings?.season ||
      loaderData?.stats?.season ||
      new Date().getFullYear()
  );
  const [stats, setStats] = useState<BrasileiraoStatsResponse>(loaderData.stats);
  const [lastUpdated, setLastUpdated] = useState<string>(
    loaderData?.standings?.lastUpdated ||
      loaderData?.stats?.lastUpdated ||
      getBrasiliaTimeString()
  );
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    loaderData?.standings?.success ? undefined : loaderData?.standings?.message
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mobile view switcher (desktop always shows both side-by-side)
  const [mobileTab, setMobileTab] = useState<MobileSectionTab>(
    searchParams?.tab || 'classificacao'
  );

  // Standings filters
  const [teamQuery, setTeamQuery] = useState('');
  const [zoneFilter, setZoneFilter] = useState<StandingZone | 'all' | 'favorites'>(
    'all'
  );

  // Stats filters
  const [statTab, setStatTab] = useState<StatCategoryTab>('goals');
  const [statQuery, setStatQuery] = useState('');
  const [showAllStats, setShowAllStats] = useState(false);

  const { isDark, toggleTheme } = useTheme();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    if (searchParams?.tab) {
      setMobileTab(searchParams.tab);
    }
  }, [searchParams?.tab]);

  const syncAll = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const [standingsRes, statsRes] = await Promise.all([
        (async () => {
          try {
            return await fetchBrasileiraoStandingsServerFn();
          } catch {
            return await fetchBrasileiraoStandings();
          }
        })(),
        (async () => {
          try {
            return await fetchBrasileiraoStatsServerFn();
          } catch {
            return await fetchBrasileiraoStats();
          }
        })(),
      ]);

      if (standingsRes && standingsRes.success && standingsRes.entries.length > 0) {
        setEntries(standingsRes.entries);
        setSeason(standingsRes.season);
        setLastUpdated(standingsRes.lastUpdated);
        setErrorMessage(undefined);
      } else if (standingsRes && !standingsRes.success) {
        setEntries((prev) => {
          if (prev.length === 0) {
            setErrorMessage(standingsRes.message);
          }
          return prev;
        });
      }

      if (statsRes && statsRes.success) {
        setStats(statsRes);
      }
    } catch (err) {
      console.warn('[Brasileirão] Falha na atualização:', err);
    } finally {
      if (showSpinner) setIsRefreshing(false);
    }
  }, []);

  // Silent background auto-update every 30s + on tab focus
  useEffect(() => {
    let isCancelled = false;

    const runSilentSync = async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      if (isCancelled) return;
      await syncAll(false);
    };

    const timer = setInterval(runSilentSync, 30_000);
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        runSilentSync();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      isCancelled = true;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [syncAll]);

  const filteredEntries = useMemo(() => {
    return entries.filter((row) => {
      if (teamQuery.trim()) {
        const q = teamQuery.toLowerCase().trim();
        const matchesName = row.teamName.toLowerCase().includes(q);
        const matchesAbbr = row.abbreviation.toLowerCase().includes(q);
        if (!matchesName && !matchesAbbr) return false;
      }

      if (zoneFilter === 'favorites') {
        return isFavorite(row.teamName);
      }

      if (zoneFilter !== 'all' && row.zone !== zoneFilter) {
        return false;
      }

      return true;
    });
  }, [entries, teamQuery, zoneFilter, isFavorite]);

  const filterPlayers = useCallback(
    (list: PlayerStatLeader[]) => {
      if (!statQuery.trim()) return list;
      const q = statQuery.toLowerCase().trim();
      return list.filter(
        (p) =>
          p.playerName.toLowerCase().includes(q) ||
          p.teamName.toLowerCase().includes(q)
      );
    },
    [statQuery]
  );

  const activePlayerList = useMemo(() => {
    if (statTab === 'goals') return filterPlayers(stats.goalsLeaders);
    if (statTab === 'assists') return filterPlayers(stats.assistsLeaders);
    if (statTab === 'yellow') return filterPlayers(stats.yellowCardsLeaders);
    if (statTab === 'red') return filterPlayers(stats.redCardsLeaders);
    return [];
  }, [statTab, filterPlayers, stats]);

  const displayedPlayerList = useMemo(() => {
    if (showAllStats || statQuery.trim()) return activePlayerList;
    return activePlayerList.slice(0, 12);
  }, [activePlayerList, showAllStats, statQuery]);

  const filteredBestOffense = useMemo(() => {
    const base = statQuery.trim()
      ? stats.bestOffense.filter((t) =>
          t.teamName.toLowerCase().includes(statQuery.toLowerCase().trim())
        )
      : stats.bestOffense;
    return showAllStats || statQuery.trim() ? base : base.slice(0, 10);
  }, [stats.bestOffense, statQuery, showAllStats]);

  const filteredBestDefense = useMemo(() => {
    const base = statQuery.trim()
      ? stats.bestDefense.filter((t) =>
          t.teamName.toLowerCase().includes(statQuery.toLowerCase().trim())
        )
      : stats.bestDefense;
    return showAllStats || statQuery.trim() ? base : base.slice(0, 10);
  }, [stats.bestDefense, statQuery, showAllStats]);

  const leader = entries[0];
  const fourth = entries[3];
  const seventeenth = entries[16];
  const topScorer = stats.goalsLeaders[0];
  const topAssist = stats.assistsLeaders[0];
  const bestAttack = stats.bestOffense[0];
  const bestDefense = stats.bestDefense[0];

  const handleShareWhatsApp = () => {
    if (mobileTab === 'estatisticas' && stats.success) {
      shareBrasileiraoStatsOnWhatsApp(stats);
      return;
    }
    shareBrasileiraoStandingsOnWhatsApp(season, entries, lastUpdated);
  };

  const statTabsMeta: Array<{
    id: StatCategoryTab;
    label: string;
    activeClass: string;
    valueHeader: string;
    valueTitle: string;
  }> = [
    {
      id: 'goals',
      label: 'Gols',
      activeClass: 'bg-emerald-500 text-white shadow-sm',
      valueHeader: 'Gols',
      valueTitle: 'Gols marcados',
    },
    {
      id: 'assists',
      label: 'Assistências',
      activeClass: 'bg-sky-500 text-white shadow-sm',
      valueHeader: 'Assist.',
      valueTitle: 'Assistências',
    },
    {
      id: 'yellow',
      label: 'Amarelos',
      activeClass: 'bg-amber-500 text-amber-950 shadow-sm',
      valueHeader: 'CA',
      valueTitle: 'Cartões amarelos',
    },
    {
      id: 'red',
      label: 'Vermelhos',
      activeClass: 'bg-rose-500 text-white shadow-sm',
      valueHeader: 'CV',
      valueTitle: 'Cartões vermelhos',
    },
    {
      id: 'clubs',
      label: 'Clubes',
      activeClass: 'bg-violet-500 text-white shadow-sm',
      valueHeader: '',
      valueTitle: '',
    },
  ];

  const currentStatTabMeta = statTabsMeta.find((t) => t.id === statTab)!;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-16 antialiased selection:bg-primary/20 selection:text-primary">
      {/* Top ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-64 bg-[radial-gradient(ellipse_at_top,_oklch(0.78_0.22_145_/_0.12),_transparent_70%)] pointer-events-none z-0" />

      <SiteHeader
        activePage="brasileirao"
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={() => syncAll(true)}
        refreshTitle="Atualizar tabela e estatísticas agora"
        isDark={isDark}
        onToggleTheme={toggleTheme}
        favoritesCount={favorites.length}
      />

      <main className="relative z-10 mx-auto max-w-6xl px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-5">
        {/* HERO SUMMARY CARD */}
        <section className="mb-4 rounded-2xl border border-border bg-card/85 p-3.5 sm:p-5 backdrop-blur-md shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-xl font-black text-foreground">
                    Brasileirão Série A {season}
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Auto-sync 30s
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Classificação e estatísticas oficiais • {entries.length} clubes
                  {stats.leagueTotals.totalGoals > 0
                    ? ` • ${stats.leagueTotals.totalGoals} gols em ${stats.leagueTotals.totalMatches} jogos (${stats.leagueTotals.goalsPerMatch}/jogo)`
                    : ''}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => syncAll(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background/70 px-3.5 py-2 text-xs font-bold text-foreground hover:border-primary/50 transition cursor-pointer disabled:opacity-60"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-primary ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>{isRefreshing ? 'Atualizando...' : 'Atualizar'}</span>
            </button>
          </div>

          {/* 4 Balanced KPI Highlights */}
          {(entries.length >= 17 || topScorer) && (
            <div className="mt-3.5 pt-3.5 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {leader && (
                <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-3 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <TeamBadge
                      teamName={leader.teamName}
                      size="sm"
                      fallbackLogoUrl={leader.logoUrl}
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Líder
                      </p>
                      <p className="text-xs font-extrabold text-foreground truncate">
                        {leader.teamName}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                    {leader.points} pts
                  </span>
                </div>
              )}

              {fourth && (
                <div className="flex items-center justify-between rounded-xl bg-sky-500/10 border border-sky-500/25 px-3 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <TeamBadge
                      teamName={fourth.teamName}
                      size="sm"
                      fallbackLogoUrl={fourth.logoUrl}
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                        Corte G-4 (4º)
                      </p>
                      <p className="text-xs font-extrabold text-foreground truncate">
                        {fourth.teamName}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-sky-600 dark:text-sky-400 shrink-0">
                    {fourth.points} pts
                  </span>
                </div>
              )}

              {seventeenth && (
                <div className="flex items-center justify-between rounded-xl bg-rose-500/10 border border-rose-500/25 px-3 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <TeamBadge
                      teamName={seventeenth.teamName}
                      size="sm"
                      fallbackLogoUrl={seventeenth.logoUrl}
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                        Abre Z-4 (17º)
                      </p>
                      <p className="text-xs font-extrabold text-foreground truncate">
                        {seventeenth.teamName}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-rose-600 dark:text-rose-400 shrink-0">
                    {seventeenth.points} pts
                  </span>
                </div>
              )}

              {topScorer && (
                <div className="flex items-center justify-between rounded-xl bg-amber-500/10 border border-amber-500/25 px-3 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <TeamBadge
                      teamName={topScorer.teamName}
                      size="sm"
                      fallbackLogoUrl={topScorer.teamLogoUrl}
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Target className="h-3 w-3" /> Artilheiro
                      </p>
                      <p className="text-xs font-extrabold text-foreground truncate">
                        {topScorer.playerName}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-amber-600 dark:text-amber-400 shrink-0">
                    {topScorer.value} gols
                  </span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* MOBILE SECTION SWITCHER (Classificação vs Estatísticas) */}
        <div className="mb-4 flex lg:hidden items-center gap-1.5 rounded-xl bg-muted/60 p-1 border border-border/70">
          <button
            type="button"
            onClick={() => setMobileTab('classificacao')}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
              mobileTab === 'classificacao'
                ? 'bg-card text-foreground shadow-sm border border-border/80'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Trophy
              className={`h-3.5 w-3.5 ${mobileTab === 'classificacao' ? 'text-amber-500' : ''}`}
            />
            <span>Classificação</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('estatisticas')}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
              mobileTab === 'estatisticas'
                ? 'bg-card text-foreground shadow-sm border border-border/80'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3
              className={`h-3.5 w-3.5 ${mobileTab === 'estatisticas' ? 'text-sky-500' : ''}`}
            />
            <span>Estatísticas</span>
          </button>
        </div>

        {/* DESKTOP PROPORTIONAL 2-COLUMN DASHBOARD (Table 7 cols | Stats 5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN: STANDINGS TABLE */}
          <div
            className={`lg:col-span-7 space-y-3 ${
              mobileTab === 'classificacao' ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* Search & Zone Filters */}
            <div className="space-y-2 rounded-2xl border border-border bg-card/80 p-3 backdrop-blur-md shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={teamQuery}
                  onChange={(e) => setTeamQuery(e.target.value)}
                  placeholder="Buscar clube na tabela (ex: Flamengo, Palmeiras, Cruzeiro...)"
                  className="w-full rounded-xl border border-border bg-background/70 pl-9 pr-9 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                />
                {teamQuery && (
                  <button
                    type="button"
                    onClick={() => setTeamQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto lg:flex-wrap no-scrollbar">
                <button
                  type="button"
                  onClick={() => setZoneFilter('all')}
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                    zoneFilter === 'all'
                      ? 'bg-foreground text-background'
                      : 'bg-background/60 text-muted-foreground border border-border hover:text-foreground'
                  }`}
                >
                  Todos ({entries.length})
                </button>
                <button
                  type="button"
                  onClick={() => setZoneFilter('libertadores')}
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                    zoneFilter === 'libertadores'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-background/60 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10'
                  }`}
                >
                  G-4 Libertadores
                </button>
                <button
                  type="button"
                  onClick={() => setZoneFilter('pre-libertadores')}
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                    zoneFilter === 'pre-libertadores'
                      ? 'bg-sky-500 text-white'
                      : 'bg-background/60 text-sky-600 dark:text-sky-400 border border-sky-500/30 hover:bg-sky-500/10'
                  }`}
                >
                  Pré-Liberta
                </button>
                <button
                  type="button"
                  onClick={() => setZoneFilter('sul-americana')}
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                    zoneFilter === 'sul-americana'
                      ? 'bg-amber-500 text-white'
                      : 'bg-background/60 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/10'
                  }`}
                >
                  Sul-Americana
                </button>
                <button
                  type="button"
                  onClick={() => setZoneFilter('rebaixamento')}
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                    zoneFilter === 'rebaixamento'
                      ? 'bg-rose-500 text-white'
                      : 'bg-background/60 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/10'
                  }`}
                >
                  Z-4
                </button>
                {favorites.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setZoneFilter('favorites')}
                    className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
                      zoneFilter === 'favorites'
                        ? 'bg-amber-400 text-amber-950'
                        : 'bg-background/60 text-amber-600 dark:text-amber-300 border border-amber-400/30 hover:bg-amber-400/10'
                    }`}
                  >
                    <Star className="h-3 w-3 fill-current" />
                    Favoritos ({favorites.length})
                  </button>
                )}
              </div>
            </div>

            {/* Standings Table */}
            {entries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
                <ShieldAlert className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="text-base font-bold text-foreground">
                  Não foi possível carregar a classificação
                </h3>
                <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                  {errorMessage || 'Verifique sua conexão e tente atualizar novamente.'}
                </p>
                <button
                  type="button"
                  onClick={() => syncAll(true)}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow hover:scale-105 transition cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Tentar novamente
                </button>
              </div>
            ) : (
              <section className="rounded-2xl border border-border bg-card/90 shadow-sm overflow-hidden backdrop-blur-md">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs sm:text-[13px]">
                    <thead>
                      <tr className="border-b border-border bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="sticky left-0 z-20 bg-muted/95 backdrop-blur py-2.5 pl-3 pr-2 min-w-[165px] sm:min-w-[205px]">
                          Clube
                        </th>
                        <th
                          className="py-2.5 px-2 text-center font-black text-foreground"
                          title="Pontos"
                        >
                          PTS
                        </th>
                        <th className="py-2.5 px-1.5 text-center" title="Jogos">
                          J
                        </th>
                        <th className="py-2.5 px-1.5 text-center" title="Vitórias">
                          V
                        </th>
                        <th className="py-2.5 px-1.5 text-center" title="Empates">
                          E
                        </th>
                        <th className="py-2.5 px-1.5 text-center" title="Derrotas">
                          D
                        </th>
                        <th className="py-2.5 px-1.5 text-center" title="Gols Pró">
                          GP
                        </th>
                        <th className="py-2.5 px-1.5 text-center" title="Gols Contra">
                          GC
                        </th>
                        <th className="py-2.5 px-1.5 text-center" title="Saldo de Gols">
                          SG
                        </th>
                        <th
                          className="py-2.5 pl-1.5 pr-3 text-center"
                          title="Aproveitamento"
                        >
                          %
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredEntries.length > 0 ? (
                        filteredEntries.map((row) => {
                          const zoneMeta = ZONE_META[row.zone];
                          const fav = isFavorite(row.teamName);
                          const sgDisplay =
                            row.goalDifference > 0
                              ? `+${row.goalDifference}`
                              : String(row.goalDifference);

                          return (
                            <tr
                              key={row.teamId}
                              className={`group transition-colors ${
                                fav
                                  ? 'bg-amber-500/10 hover:bg-amber-500/15'
                                  : 'hover:bg-muted/40'
                              }`}
                            >
                              <td
                                className={`sticky left-0 z-10 py-2 pl-0 pr-2 backdrop-blur transition-colors ${
                                  fav
                                    ? 'bg-amber-500/15 group-hover:bg-amber-500/20'
                                    : 'bg-card/95 group-hover:bg-muted/70'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`w-1 self-stretch rounded-r-full shrink-0 ${zoneMeta.barClass}`}
                                    aria-hidden="true"
                                  />
                                  <span
                                    className={`w-5 text-center font-black tabular-nums shrink-0 ${zoneMeta.rankTextClass}`}
                                  >
                                    {row.rank}
                                  </span>
                                  <TeamBadge
                                    teamName={row.teamName}
                                    size="sm"
                                    fallbackLogoUrl={row.logoUrl}
                                  />
                                  <span
                                    className={`font-bold truncate max-w-[100px] sm:max-w-[155px] ${
                                      fav
                                        ? 'text-amber-600 dark:text-amber-300 font-extrabold'
                                        : 'text-foreground'
                                    }`}
                                    title={row.teamName}
                                  >
                                    {row.teamName}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => toggleFavorite(row.teamName)}
                                    title={
                                      fav
                                        ? 'Remover dos favoritos'
                                        : 'Favoritar clube'
                                    }
                                    className="ml-auto p-1 text-muted-foreground hover:text-amber-400 transition shrink-0 cursor-pointer"
                                  >
                                    <Star
                                      className={`h-3.5 w-3.5 ${
                                        fav
                                          ? 'fill-amber-400 text-amber-400'
                                          : 'opacity-25 group-hover:opacity-100'
                                      }`}
                                    />
                                  </button>
                                </div>
                              </td>

                              <td className="py-2 px-2 text-center font-black tabular-nums text-foreground bg-muted/20">
                                {row.points}
                              </td>
                              <td className="py-2 px-1.5 text-center tabular-nums text-muted-foreground font-semibold">
                                {row.gamesPlayed}
                              </td>
                              <td className="py-2 px-1.5 text-center tabular-nums text-foreground font-semibold">
                                {row.wins}
                              </td>
                              <td className="py-2 px-1.5 text-center tabular-nums text-muted-foreground">
                                {row.draws}
                              </td>
                              <td className="py-2 px-1.5 text-center tabular-nums text-muted-foreground">
                                {row.losses}
                              </td>
                              <td className="py-2 px-1.5 text-center tabular-nums text-muted-foreground">
                                {row.goalsFor}
                              </td>
                              <td className="py-2 px-1.5 text-center tabular-nums text-muted-foreground">
                                {row.goalsAgainst}
                              </td>
                              <td
                                className={`py-2 px-1.5 text-center tabular-nums font-bold ${
                                  row.goalDifference > 0
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : row.goalDifference < 0
                                    ? 'text-rose-600 dark:text-rose-400'
                                    : 'text-muted-foreground'
                                }`}
                              >
                                {sgDisplay}
                              </td>
                              <td className="py-2 pl-1.5 pr-3 text-center tabular-nums text-muted-foreground font-medium">
                                {row.winPercentage}%
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={10}
                            className="py-8 text-center text-xs text-muted-foreground"
                          >
                            Nenhum clube encontrado para o filtro selecionado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Zones Legend */}
            <section className="rounded-2xl border border-border bg-card/80 p-3.5 sm:p-4 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-foreground mb-2.5">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <span>Legenda de Classificação</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm bg-emerald-500 shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">1º–4º:</strong> Libertadores
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm bg-sky-500 shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">5º–6º:</strong> Pré-Libertadores
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm bg-amber-500 shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">7º–12º:</strong> Sul-Americana
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm bg-rose-500 shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">17º–20º:</strong> Rebaixamento (Z-4)
                  </span>
                </div>
              </div>

              <p className="mt-2.5 pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                <strong>Desempate:</strong> Pontos, Vitórias, Saldo de Gols, Gols Pró e
                confronto direto.
              </p>
            </section>
          </div>

          {/* RIGHT COLUMN: INTEGRATED STATISTICS PANEL */}
          <aside
            className={`lg:col-span-5 space-y-3 ${
              mobileTab === 'estatisticas' ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* Stats Header & Quick Highlights */}
            <section className="rounded-2xl border border-border bg-card/85 p-3 sm:p-3.5 backdrop-blur-md shadow-sm space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 text-sky-500 border border-sky-500/30">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-foreground">
                      Estatísticas da Série A
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Jogadores e clubes em tempo real
                    </p>
                  </div>
                </div>

                {topAssist && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 border border-sky-500/25 px-2 py-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-400">
                    <Sparkles className="h-3 w-3" />
                    {topAssist.shortName}: {topAssist.value}A
                  </span>
                )}
              </div>

              {/* Compact Attack / Defense / Assist Cards */}
              {stats.success && (
                <div className="grid grid-cols-2 gap-2">
                  {bestAttack && (
                    <div className="flex items-center justify-between rounded-xl bg-amber-500/10 border border-amber-500/25 px-2.5 py-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <TeamBadge
                          teamName={bestAttack.teamName}
                          size="xs"
                          fallbackLogoUrl={bestAttack.logoUrl}
                        />
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                            <Flame className="h-2.5 w-2.5" /> Ataque
                          </p>
                          <p className="text-[11px] font-extrabold text-foreground truncate">
                            {bestAttack.teamName}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400 shrink-0">
                        {bestAttack.goalsFor}
                      </span>
                    </div>
                  )}

                  {bestDefense && (
                    <div className="flex items-center justify-between rounded-xl bg-violet-500/10 border border-violet-500/25 px-2.5 py-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <TeamBadge
                          teamName={bestDefense.teamName}
                          size="xs"
                          fallbackLogoUrl={bestDefense.logoUrl}
                        />
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-0.5">
                            <Shield className="h-2.5 w-2.5" /> Defesa
                          </p>
                          <p className="text-[11px] font-extrabold text-foreground truncate">
                            {bestDefense.teamName}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-violet-600 dark:text-violet-400 shrink-0">
                        {bestDefense.goalsAgainst}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Search Player/Club */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={statQuery}
                  onChange={(e) => setStatQuery(e.target.value)}
                  placeholder="Buscar jogador ou clube..."
                  className="w-full rounded-xl border border-border bg-background/70 pl-8 pr-8 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                />
                {statQuery && (
                  <button
                    type="button"
                    onClick={() => setStatQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Stat Category Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto lg:flex-wrap no-scrollbar">
                {statTabsMeta.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatTab(tab.id)}
                    className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                      statTab === tab.id
                        ? tab.activeClass
                        : 'bg-background/60 text-muted-foreground border border-border hover:text-foreground'
                    }`}
                  >
                    {tab.id === 'yellow' && (
                      <Square className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                    )}
                    {tab.id === 'red' && (
                      <Square className="h-2.5 w-2.5 fill-rose-500 text-rose-500" />
                    )}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Stats Data Container */}
            {!stats.success ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center">
                <ShieldAlert className="mx-auto h-7 w-7 text-muted-foreground mb-2" />
                <p className="text-xs font-bold text-foreground">
                  Estatísticas temporariamente indisponíveis
                </p>
                <button
                  type="button"
                  onClick={() => syncAll(true)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" /> Recarregar
                </button>
              </div>
            ) : statTab === 'clubs' ? (
              <div className="space-y-3">
                {/* Best Offense */}
                <section className="rounded-2xl border border-border bg-card/90 shadow-sm overflow-hidden">
                  <div className="border-b border-border bg-muted/50 px-3.5 py-2 flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <Flame className="h-3.5 w-3.5 text-amber-500" />
                      Melhor Ataque (Gols Pró)
                    </span>
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      GP • Média
                    </span>
                  </div>
                  <div className="divide-y divide-border/60">
                    {filteredBestOffense.map((team, idx) => {
                      const fav = isFavorite(team.teamName);
                      const avg =
                        team.gamesPlayed > 0
                          ? (team.goalsFor / team.gamesPlayed).toFixed(2)
                          : '0.00';
                      return (
                        <div
                          key={`off_${team.teamId}`}
                          className={`flex items-center justify-between px-3.5 py-2 text-xs ${
                            fav ? 'bg-amber-500/10' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 text-center font-black text-muted-foreground tabular-nums">
                              {idx + 1}
                            </span>
                            <TeamBadge
                              teamName={team.teamName}
                              size="xs"
                              fallbackLogoUrl={team.logoUrl}
                            />
                            <span className="font-bold text-foreground truncate">
                              {team.teamName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 tabular-nums">
                            <span className="font-black text-emerald-600 dark:text-emerald-400">
                              {team.goalsFor}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              ({avg}/j)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Best Defense */}
                <section className="rounded-2xl border border-border bg-card/90 shadow-sm overflow-hidden">
                  <div className="border-b border-border bg-muted/50 px-3.5 py-2 flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-sky-500" />
                      Melhor Defesa (Menos Vazados)
                    </span>
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      GC • Média
                    </span>
                  </div>
                  <div className="divide-y divide-border/60">
                    {filteredBestDefense.map((team, idx) => {
                      const fav = isFavorite(team.teamName);
                      const avg =
                        team.gamesPlayed > 0
                          ? (team.goalsAgainst / team.gamesPlayed).toFixed(2)
                          : '0.00';
                      return (
                        <div
                          key={`def_${team.teamId}`}
                          className={`flex items-center justify-between px-3.5 py-2 text-xs ${
                            fav ? 'bg-amber-500/10' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 text-center font-black text-muted-foreground tabular-nums">
                              {idx + 1}
                            </span>
                            <TeamBadge
                              teamName={team.teamName}
                              size="xs"
                              fallbackLogoUrl={team.logoUrl}
                            />
                            <span className="font-bold text-foreground truncate">
                              {team.teamName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 tabular-nums">
                            <span className="font-black text-sky-600 dark:text-sky-400">
                              {team.goalsAgainst}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              ({avg}/j)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            ) : (
              <section className="rounded-2xl border border-border bg-card/90 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="py-2.5 pl-3 pr-1.5 w-8 text-center">#</th>
                        <th className="py-2.5 px-2">Jogador</th>
                        {(statTab === 'goals' || statTab === 'assists') && (
                          <th className="py-2.5 px-1.5 text-center" title="Jogos">
                            J
                          </th>
                        )}
                        <th
                          className="py-2.5 pl-1.5 pr-3 text-center font-black text-foreground"
                          title={currentStatTabMeta.valueTitle}
                        >
                          {currentStatTabMeta.valueHeader}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {displayedPlayerList.length > 0 ? (
                        displayedPlayerList.map((player) => {
                          const fav = isFavorite(player.teamName);
                          return (
                            <tr
                              key={`${statTab}_${player.rank}_${player.athleteId}`}
                              className={`transition-colors ${
                                fav
                                  ? 'bg-amber-500/10 hover:bg-amber-500/15'
                                  : 'hover:bg-muted/40'
                              }`}
                            >
                              <td className="py-2 pl-3 pr-1.5 text-center font-black tabular-nums text-muted-foreground">
                                {player.rank <= 3 ? (
                                  <span
                                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
                                      player.rank === 1
                                        ? 'bg-amber-400 text-amber-950'
                                        : player.rank === 2
                                        ? 'bg-slate-300 text-slate-900'
                                        : 'bg-amber-700/80 text-white'
                                    }`}
                                  >
                                    {player.rank}
                                  </span>
                                ) : (
                                  player.rank
                                )}
                              </td>
                              <td className="py-2 px-2">
                                <div className="min-w-0">
                                  <p className="font-bold text-foreground truncate max-w-[165px] sm:max-w-[220px]">
                                    {player.playerName}
                                  </p>
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <TeamBadge
                                      teamName={player.teamName}
                                      size="xs"
                                      fallbackLogoUrl={player.teamLogoUrl}
                                    />
                                    <span
                                      className={`text-[11px] truncate ${
                                        fav
                                          ? 'text-amber-600 dark:text-amber-300 font-semibold'
                                          : 'text-muted-foreground'
                                      }`}
                                    >
                                      {player.teamName}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              {(statTab === 'goals' || statTab === 'assists') && (
                                <td className="py-2 px-1.5 text-center tabular-nums text-muted-foreground">
                                  {player.appearances ?? '-'}
                                </td>
                              )}
                              <td className="py-2 pl-1.5 pr-3 text-center font-black tabular-nums bg-muted/20 text-sm">
                                <span
                                  className={
                                    statTab === 'goals'
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : statTab === 'assists'
                                      ? 'text-sky-600 dark:text-sky-400'
                                      : statTab === 'yellow'
                                      ? 'text-amber-600 dark:text-amber-400'
                                      : 'text-rose-600 dark:text-rose-400'
                                  }
                                >
                                  {player.value}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-8 text-center text-xs text-muted-foreground"
                          >
                            Nenhum dado encontrado para o filtro atual.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {!statQuery.trim() && activePlayerList.length > 12 && (
                  <button
                    type="button"
                    onClick={() => setShowAllStats((prev) => !prev)}
                    className="w-full border-t border-border/60 bg-muted/30 py-2 text-xs font-bold text-primary hover:bg-muted/50 transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {showAllStats ? (
                      <>
                        <ChevronUp className="h-3.5 w-3.5" />
                        <span>Mostrar Top 12</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3.5 w-3.5" />
                        <span>Ver todos ({activePlayerList.length})</span>
                      </>
                    )}
                  </button>
                )}
              </section>
            )}

            {statTab === 'clubs' && !statQuery.trim() && stats.bestOffense.length > 10 && (
              <button
                type="button"
                onClick={() => setShowAllStats((prev) => !prev)}
                className="w-full rounded-xl border border-border bg-card/80 py-2 text-xs font-bold text-primary hover:bg-card transition flex items-center justify-center gap-1 cursor-pointer"
              >
                {showAllStats ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    <span>Mostrar Top 10 clubes</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    <span>Ver todos os 20 clubes</span>
                  </>
                )}
              </button>
            )}
          </aside>
        </div>
      </main>

      {/* FLOATING WHATSAPP SHARE BUTTON */}
      {entries.length > 0 && (
        <FloatingWhatsAppButton
          onClick={handleShareWhatsApp}
          title={
            mobileTab === 'estatisticas'
              ? 'Compartilhar estatísticas no WhatsApp'
              : 'Compartilhar classificação no WhatsApp'
          }
        />
      )}
    </div>
  );
}
