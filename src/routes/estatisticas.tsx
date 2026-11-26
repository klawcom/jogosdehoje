import { useState, useEffect, useMemo, useCallback } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  BarChart3,
  Search,
  X,
  RefreshCw,
  Target,
  Sparkles,
  Shield,
  Flame,
  Square,
  Trophy,
  ShieldAlert,
  Star,
} from 'lucide-react';
import { fetchBrasileiraoStatsServerFn } from '../lib/server-fn';
import { fetchBrasileiraoStats } from '../lib/brasileirao-stats';
import { getBrasiliaTimeString } from '../lib/scraper';
import { BrasileiraoStatsResponse, PlayerStatLeader } from '../lib/types';
import { useTheme } from '../lib/theme';
import { useFavorites } from '../lib/favorites';
import { shareBrasileiraoStatsOnWhatsApp } from '../lib/whatsapp';
import { SiteHeader } from '../components/site-header';
import { TeamBadge } from '../components/team-badge';
import { FloatingWhatsAppButton } from '../components/floating-whatsapp-button';

export const Route = createFileRoute('/estatisticas')({
  component: BrasileiraoEstatisticasPage,
  loader: async () => {
    try {
      const data = await fetchBrasileiraoStatsServerFn();
      if (data && data.success) {
        return data;
      }
    } catch (err) {
      console.warn('fetchBrasileiraoStatsServerFn loader warning:', err);
    }
    return fetchBrasileiraoStats();
  },
  head: () => ({
    meta: [
      { title: 'Estatísticas do Brasileirão Série A — Artilharia e Líderes | Jogos de Hoje' },
      {
        name: 'description',
        content:
          'Confira as estatísticas atualizadas do Brasileirão Série A: artilheiros, líderes em assistências, cartões amarelos e vermelhos, melhores ataques e defesas.',
      },
    ],
  }),
});

type StatTab = 'goals' | 'assists' | 'yellow' | 'red' | 'clubs';

function BrasileiraoEstatisticasPage() {
  const loaderData = Route.useLoaderData();

  const [stats, setStats] = useState<BrasileiraoStatsResponse>(loaderData);
  const [lastUpdated, setLastUpdated] = useState<string>(
    loaderData?.lastUpdated || getBrasiliaTimeString()
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<StatTab>('goals');
  const [searchQuery, setSearchQuery] = useState('');

  const { isDark, toggleTheme } = useTheme();
  const { favorites, isFavorite } = useFavorites();

  const syncStats = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      let res: BrasileiraoStatsResponse | null = null;
      try {
        res = await fetchBrasileiraoStatsServerFn();
      } catch {
        res = await fetchBrasileiraoStats();
      }
      if (res && res.success) {
        setStats(res);
        setLastUpdated(res.lastUpdated);
      }
    } catch (err) {
      console.warn('[Estatísticas] Falha na atualização:', err);
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
      await syncStats(false);
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
  }, [syncStats]);

  const filterPlayers = useCallback(
    (list: PlayerStatLeader[]) => {
      if (!searchQuery.trim()) return list;
      const q = searchQuery.toLowerCase().trim();
      return list.filter(
        (p) =>
          p.playerName.toLowerCase().includes(q) ||
          p.teamName.toLowerCase().includes(q)
      );
    },
    [searchQuery]
  );

  const activePlayerList = useMemo(() => {
    if (activeTab === 'goals') return filterPlayers(stats.goalsLeaders);
    if (activeTab === 'assists') return filterPlayers(stats.assistsLeaders);
    if (activeTab === 'yellow') return filterPlayers(stats.yellowCardsLeaders);
    if (activeTab === 'red') return filterPlayers(stats.redCardsLeaders);
    return [];
  }, [activeTab, filterPlayers, stats]);

  const filteredBestOffense = useMemo(() => {
    if (!searchQuery.trim()) return stats.bestOffense;
    const q = searchQuery.toLowerCase().trim();
    return stats.bestOffense.filter((t) => t.teamName.toLowerCase().includes(q));
  }, [stats.bestOffense, searchQuery]);

  const filteredBestDefense = useMemo(() => {
    if (!searchQuery.trim()) return stats.bestDefense;
    const q = searchQuery.toLowerCase().trim();
    return stats.bestDefense.filter((t) => t.teamName.toLowerCase().includes(q));
  }, [stats.bestDefense, searchQuery]);

  const topScorer = stats.goalsLeaders[0];
  const topAssist = stats.assistsLeaders[0];
  const bestAttack = stats.bestOffense[0];
  const bestDefense = stats.bestDefense[0];

  const handleShareWhatsApp = () => {
    shareBrasileiraoStatsOnWhatsApp(stats);
  };

  const tabConfig: Array<{
    id: StatTab;
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

  const currentTabMeta = tabConfig.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-16 antialiased selection:bg-primary/20 selection:text-primary">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-56 bg-[radial-gradient(ellipse_at_top,_oklch(0.78_0.22_145_/_0.12),_transparent_70%)] pointer-events-none z-0" />

      <SiteHeader
        activePage="estatisticas"
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={() => syncStats(true)}
        refreshTitle="Atualizar estatísticas agora"
        isDark={isDark}
        onToggleTheme={toggleTheme}
        favoritesCount={favorites.length}
      />

      <main className="relative z-10 mx-auto max-w-3xl px-3 sm:px-6 pt-3">
        {/* HERO SUMMARY CARD */}
        <section className="mb-3 rounded-2xl border border-border bg-card/85 p-3.5 sm:p-4 backdrop-blur-md shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-500 border border-sky-500/30">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-foreground">
                    Estatísticas Série A {stats.season}
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Auto-sync 30s
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {stats.leagueTotals.totalGoals} gols em {stats.leagueTotals.totalMatches} jogos
                  {stats.leagueTotals.goalsPerMatch > 0
                    ? ` • Média de ${stats.leagueTotals.goalsPerMatch} gols/jogo`
                    : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                to="/brasileirao"
                className="inline-flex items-center gap-1 rounded-xl border border-border bg-background/70 px-2.5 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:border-primary/40 transition"
              >
                <Trophy className="h-3.5 w-3.5 text-amber-500" />
                <span>Ver Tabela</span>
              </Link>
              <button
                type="button"
                onClick={() => syncStats(true)}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background/70 px-3 py-1.5 text-xs font-bold text-foreground hover:border-primary/50 transition cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">
                  {isRefreshing ? 'Atualizando...' : 'Atualizar'}
                </span>
              </button>
            </div>
          </div>

          {/* Season leaders highlights */}
          {stats.success && (
            <div className="mt-3 pt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {topScorer && (
                <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <TeamBadge
                      teamName={topScorer.teamName}
                      size="sm"
                      fallbackLogoUrl={topScorer.teamLogoUrl}
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Target className="h-3 w-3" /> Artilheiro
                      </p>
                      <p className="text-xs font-extrabold text-foreground truncate">
                        {topScorer.playerName}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {topScorer.teamName}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                    {topScorer.value} gols
                  </span>
                </div>
              )}

              {topAssist && (
                <div className="flex items-center justify-between rounded-xl bg-sky-500/10 border border-sky-500/25 px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <TeamBadge
                      teamName={topAssist.teamName}
                      size="sm"
                      fallbackLogoUrl={topAssist.teamLogoUrl}
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> Líder em Assistências
                      </p>
                      <p className="text-xs font-extrabold text-foreground truncate">
                        {topAssist.playerName}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {topAssist.teamName}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-sky-600 dark:text-sky-400 shrink-0">
                    {topAssist.value} assist.
                  </span>
                </div>
              )}

              {bestAttack && (
                <div className="flex items-center justify-between rounded-xl bg-amber-500/10 border border-amber-500/25 px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <TeamBadge
                      teamName={bestAttack.teamName}
                      size="sm"
                      fallbackLogoUrl={bestAttack.logoUrl}
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Flame className="h-3 w-3" /> Melhor Ataque
                      </p>
                      <p className="text-xs font-extrabold text-foreground truncate">
                        {bestAttack.teamName}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-amber-600 dark:text-amber-400 shrink-0">
                    {bestAttack.goalsFor} GP
                  </span>
                </div>
              )}

              {bestDefense && (
                <div className="flex items-center justify-between rounded-xl bg-violet-500/10 border border-violet-500/25 px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <TeamBadge
                      teamName={bestDefense.teamName}
                      size="sm"
                      fallbackLogoUrl={bestDefense.logoUrl}
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-1">
                        <Shield className="h-3 w-3" /> Melhor Defesa
                      </p>
                      <p className="text-xs font-extrabold text-foreground truncate">
                        {bestDefense.teamName}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-violet-600 dark:text-violet-400 shrink-0">
                    {bestDefense.goalsAgainst} GC
                  </span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* SEARCH & STAT CATEGORY TABS */}
        <section className="mb-3 space-y-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar jogador ou clube (ex: Pedro, Viveros, Flamengo...)"
              className="w-full rounded-xl border border-border bg-card/70 pl-10 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 backdrop-blur transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {tabConfig.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? tab.activeClass
                    : 'bg-card/70 text-muted-foreground border border-border hover:text-foreground'
                }`}
              >
                {tab.id === 'yellow' && <Square className="h-3 w-3 fill-amber-400 text-amber-400" />}
                {tab.id === 'red' && <Square className="h-3 w-3 fill-rose-500 text-rose-500" />}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* CONTENT */}
        {!stats.success ? (
          <div className="my-8 rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
            <ShieldAlert className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="text-base font-bold text-foreground">
              Não foi possível carregar as estatísticas
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              {stats.message || 'Verifique sua conexão e tente atualizar novamente.'}
            </p>
            <button
              type="button"
              onClick={() => syncStats(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow hover:scale-105 transition cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Tentar novamente
            </button>
          </div>
        ) : activeTab === 'clubs' ? (
          <div className="grid gap-3 md:grid-cols-2">
            {/* Best Offense */}
            <section className="rounded-2xl border border-border bg-card/90 shadow-lg overflow-hidden">
              <div className="border-b border-border bg-muted/50 px-3.5 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-foreground">
                  <Flame className="h-4 w-4 text-amber-500" />
                  <span>Ataque (Gols Pró)</span>
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground">GP • Média</span>
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
                        <span className="font-bold text-foreground truncate">{team.teamName}</span>
                        {fav && <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 tabular-nums">
                        <span className="font-black text-emerald-600 dark:text-emerald-400">
                          {team.goalsFor}
                        </span>
                        <span className="text-[11px] text-muted-foreground">({avg}/j)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Best Defense */}
            <section className="rounded-2xl border border-border bg-card/90 shadow-lg overflow-hidden">
              <div className="border-b border-border bg-muted/50 px-3.5 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-foreground">
                  <Shield className="h-4 w-4 text-sky-500" />
                  <span>Defesa (Menos Vazados)</span>
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground">GC • Média</span>
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
                        <span className="font-bold text-foreground truncate">{team.teamName}</span>
                        {fav && <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 tabular-nums">
                        <span className="font-black text-sky-600 dark:text-sky-400">
                          {team.goalsAgainst}
                        </span>
                        <span className="text-[11px] text-muted-foreground">({avg}/j)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        ) : (
          <section className="rounded-2xl border border-border bg-card/90 shadow-lg overflow-hidden backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="py-2.5 pl-3 pr-2 w-9 text-center">#</th>
                    <th className="py-2.5 px-2">Jogador</th>
                    <th className="py-2.5 px-2">Clube</th>
                    {(activeTab === 'goals' || activeTab === 'assists') && (
                      <>
                        <th className="py-2.5 px-2 text-center" title="Jogos">
                          J
                        </th>
                        <th
                          className="py-2.5 px-2 text-center hidden sm:table-cell"
                          title={activeTab === 'goals' ? 'Assistências' : 'Gols'}
                        >
                          {activeTab === 'goals' ? 'A' : 'G'}
                        </th>
                      </>
                    )}
                    <th
                      className="py-2.5 pl-2 pr-3 text-center font-black text-foreground"
                      title={currentTabMeta.valueTitle}
                    >
                      {currentTabMeta.valueHeader}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {activePlayerList.length > 0 ? (
                    activePlayerList.map((player) => {
                      const fav = isFavorite(player.teamName);
                      return (
                        <tr
                          key={`${activeTab}_${player.rank}_${player.athleteId}`}
                          className={`transition-colors ${
                            fav
                              ? 'bg-amber-500/10 hover:bg-amber-500/15'
                              : 'hover:bg-muted/40'
                          }`}
                        >
                          <td className="py-2.5 pl-3 pr-2 text-center font-black tabular-nums text-muted-foreground">
                            {player.rank <= 3 ? (
                              <span
                                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black ${
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
                          <td className="py-2.5 px-2 font-bold text-foreground">
                            <span className="block truncate max-w-[140px] sm:max-w-[220px]">
                              {player.playerName}
                            </span>
                          </td>
                          <td className="py-2.5 px-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <TeamBadge
                                teamName={player.teamName}
                                size="xs"
                                fallbackLogoUrl={player.teamLogoUrl}
                              />
                              <span
                                className={`text-xs truncate max-w-[100px] sm:max-w-[160px] ${
                                  fav
                                    ? 'text-amber-600 dark:text-amber-300 font-bold'
                                    : 'text-muted-foreground font-medium'
                                }`}
                              >
                                {player.teamName}
                              </span>
                            </div>
                          </td>
                          {(activeTab === 'goals' || activeTab === 'assists') && (
                            <>
                              <td className="py-2.5 px-2 text-center tabular-nums text-muted-foreground">
                                {player.appearances ?? '-'}
                              </td>
                              <td className="py-2.5 px-2 text-center tabular-nums text-muted-foreground hidden sm:table-cell">
                                {activeTab === 'goals'
                                  ? (player.assists ?? 0)
                                  : (player.goals ?? 0)}
                              </td>
                            </>
                          )}
                          <td className="py-2.5 pl-2 pr-3 text-center font-black tabular-nums text-foreground bg-muted/20">
                            <span
                              className={
                                activeTab === 'goals'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : activeTab === 'assists'
                                  ? 'text-sky-600 dark:text-sky-400'
                                  : activeTab === 'yellow'
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
                      <td colSpan={6} className="py-8 text-center text-xs text-muted-foreground">
                        Nenhum dado encontrado para o filtro atual.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      <FloatingWhatsAppButton
        onClick={handleShareWhatsApp}
        title="Compartilhar estatísticas no WhatsApp"
      />
    </div>
  );
}

