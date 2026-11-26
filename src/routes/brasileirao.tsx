import { useState, useEffect, useMemo, useCallback } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Search,
  X,
  Trophy,
  Star,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { fetchBrasileiraoStandingsServerFn } from '../lib/server-fn';
import { fetchBrasileiraoStandings } from '../lib/standings';
import { getBrasiliaTimeString } from '../lib/scraper';
import { StandingRow, StandingZone } from '../lib/types';
import { useTheme } from '../lib/theme';
import { useFavorites } from '../lib/favorites';
import { shareBrasileiraoStandingsOnWhatsApp } from '../lib/whatsapp';
import { SiteHeader } from '../components/site-header';
import { TeamBadge } from '../components/team-badge';
import { FloatingWhatsAppButton } from '../components/floating-whatsapp-button';

export const Route = createFileRoute('/brasileirao')({
  component: BrasileiraoTabelaPage,
  loader: async () => {
    try {
      const data = await fetchBrasileiraoStandingsServerFn();
      if (data && data.success && data.entries.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn('fetchBrasileiraoStandingsServerFn loader warning:', err);
    }
    return fetchBrasileiraoStandings();
  },
  head: () => ({
    meta: [
      { title: 'Tabela do Brasileirão Série A — Classificação Atualizada | Jogos de Hoje' },
      {
        name: 'description',
        content:
          'Confira a tabela de classificação do Brasileirão Série A atualizada automaticamente com pontos, jogos, vitórias, saldo de gols e zonas de Libertadores e rebaixamento.',
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
    pillClass: string;
  }
> = {
  libertadores: {
    label: 'Fase de grupos da Libertadores',
    barClass: 'bg-emerald-500',
    rankTextClass: 'text-emerald-600 dark:text-emerald-400',
    pillClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  },
  'pre-libertadores': {
    label: 'Pré-Libertadores',
    barClass: 'bg-sky-500',
    rankTextClass: 'text-sky-600 dark:text-sky-400',
    pillClass: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
  },
  'sul-americana': {
    label: 'Copa Sul-Americana',
    barClass: 'bg-amber-500',
    rankTextClass: 'text-amber-600 dark:text-amber-400',
    pillClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  },
  rebaixamento: {
    label: 'Zona de rebaixamento',
    barClass: 'bg-rose-500',
    rankTextClass: 'text-rose-600 dark:text-rose-400',
    pillClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
  },
  none: {
    label: 'Zona intermediária',
    barClass: 'bg-transparent',
    rankTextClass: 'text-muted-foreground',
    pillClass: 'bg-muted/40 text-muted-foreground border-border',
  },
};

function BrasileiraoTabelaPage() {
  const loaderData = Route.useLoaderData();

  const [entries, setEntries] = useState<StandingRow[]>(loaderData?.entries || []);
  const [season, setSeason] = useState<number>(loaderData?.season || new Date().getFullYear());
  const [lastUpdated, setLastUpdated] = useState<string>(
    loaderData?.lastUpdated || getBrasiliaTimeString()
  );
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    loaderData?.success ? undefined : loaderData?.message
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoneFilter, setZoneFilter] = useState<StandingZone | 'all' | 'favorites'>('all');

  const { isDark, toggleTheme } = useTheme();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const syncStandings = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      let res = null;
      try {
        res = await fetchBrasileiraoStandingsServerFn();
      } catch {
        res = await fetchBrasileiraoStandings();
      }
      if (res && res.success && res.entries.length > 0) {
        setEntries(res.entries);
        setSeason(res.season);
        setLastUpdated(res.lastUpdated);
        setErrorMessage(undefined);
      } else if (res && !res.success) {
        setEntries((prev) => {
          if (prev.length === 0) {
            setErrorMessage(res.message);
          }
          return prev;
        });
      }
    } catch (err) {
      console.warn('[Brasileirão] Falha na atualização:', err);
    } finally {
      if (showSpinner) setIsRefreshing(false);
    }
  }, []);

  // Silent background auto-update every 30s (matches live scores on homepage) + on tab focus
  useEffect(() => {
    let isCancelled = false;

    const runSilentSync = async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      if (isCancelled) return;
      await syncStandings(false);
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
  }, [syncStandings]);

  const filteredEntries = useMemo(() => {
    return entries.filter((row) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
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
  }, [entries, searchQuery, zoneFilter, isFavorite]);

  const leader = entries[0];
  const fourth = entries[3];
  const seventeenth = entries[16];

  const handleShareWhatsApp = () => {
    shareBrasileiraoStandingsOnWhatsApp(season, entries, lastUpdated);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-16 antialiased selection:bg-primary/20 selection:text-primary">
      {/* Top ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-56 bg-[radial-gradient(ellipse_at_top,_oklch(0.78_0.22_145_/_0.12),_transparent_70%)] pointer-events-none z-0" />

      <SiteHeader
        activePage="brasileirao"
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={() => syncStandings(true)}
        refreshTitle="Atualizar tabela agora"
        isDark={isDark}
        onToggleTheme={toggleTheme}
        favoritesCount={favorites.length}
      />

      <main className="relative z-10 mx-auto max-w-3xl px-3 sm:px-6 pt-3">
        {/* HERO SUMMARY CARD */}
        <section className="mb-3 rounded-2xl border border-border bg-card/85 p-3.5 sm:p-4 backdrop-blur-md shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-foreground">
                    Brasileirão Série A {season}
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Auto-sync 30s
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Classificação oficial atualizada automaticamente • {entries.length} clubes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                to="/estatisticas"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background/70 px-2.5 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:border-primary/40 transition"
              >
                <BarChart3 className="h-3.5 w-3.5 text-sky-500" />
                <span>Estatísticas</span>
              </Link>
              <button
                type="button"
                onClick={() => syncStandings(true)}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background/70 px-3 py-1.5 text-xs font-bold text-foreground hover:border-primary/50 transition cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Atualizando...' : 'Atualizar'}</span>
              </button>
            </div>
          </div>

          {/* Quick leader / G-4 / Z-4 highlights */}
          {entries.length >= 17 && (
            <div className="mt-3 pt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {leader && (
                <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <TeamBadge teamName={leader.teamName} size="sm" fallbackLogoUrl={leader.logoUrl} />
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
                <div className="flex items-center justify-between rounded-xl bg-sky-500/10 border border-sky-500/25 px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <TeamBadge teamName={fourth.teamName} size="sm" fallbackLogoUrl={fourth.logoUrl} />
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
                <div className="flex items-center justify-between rounded-xl bg-rose-500/10 border border-rose-500/25 px-3 py-2">
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
            </div>
          )}
        </section>

        {/* SEARCH & ZONE FILTERS */}
        <section className="mb-3 space-y-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar clube na tabela (ex: Flamengo, Palmeiras, Cruzeiro...)"
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
            <button
              type="button"
              onClick={() => setZoneFilter('all')}
              className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                zoneFilter === 'all'
                  ? 'bg-foreground text-background'
                  : 'bg-card/70 text-muted-foreground border border-border hover:text-foreground'
              }`}
            >
              Todos (20)
            </button>
            <button
              type="button"
              onClick={() => setZoneFilter('libertadores')}
              className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                zoneFilter === 'libertadores'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-card/70 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10'
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
                  : 'bg-card/70 text-sky-600 dark:text-sky-400 border border-sky-500/30 hover:bg-sky-500/10'
              }`}
            >
              Pré-Liberta (5º–6º)
            </button>
            <button
              type="button"
              onClick={() => setZoneFilter('sul-americana')}
              className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                zoneFilter === 'sul-americana'
                  ? 'bg-amber-500 text-white'
                  : 'bg-card/70 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/10'
              }`}
            >
              Sul-Americana (7º–12º)
            </button>
            <button
              type="button"
              onClick={() => setZoneFilter('rebaixamento')}
              className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                zoneFilter === 'rebaixamento'
                  ? 'bg-rose-500 text-white'
                  : 'bg-card/70 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/10'
              }`}
            >
              Z-4 Rebaixamento
            </button>
            {favorites.length > 0 && (
              <button
                type="button"
                onClick={() => setZoneFilter('favorites')}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
                  zoneFilter === 'favorites'
                    ? 'bg-amber-400 text-amber-950'
                    : 'bg-card/70 text-amber-600 dark:text-amber-300 border border-amber-400/30 hover:bg-amber-400/10'
                }`}
              >
                <Star className="h-3 w-3 fill-current" />
                Favoritos ({favorites.length})
              </button>
            )}
          </div>
        </section>

        {/* STANDINGS TABLE */}
        {entries.length === 0 ? (
          <div className="my-8 rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
            <ShieldAlert className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="text-base font-bold text-foreground">
              Não foi possível carregar a classificação
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              {errorMessage || 'Verifique sua conexão e tente atualizar novamente.'}
            </p>
            <button
              type="button"
              onClick={() => syncStandings(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow hover:scale-105 transition cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Tentar novamente
            </button>
          </div>
        ) : (
          <section className="rounded-2xl border border-border bg-card/90 shadow-lg overflow-hidden backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="sticky left-0 z-20 bg-muted/95 backdrop-blur py-2.5 pl-3 pr-2 min-w-[170px] sm:min-w-[220px]">
                      Clube
                    </th>
                    <th className="py-2.5 px-2 text-center font-black text-foreground" title="Pontos">
                      PTS
                    </th>
                    <th className="py-2.5 px-2 text-center" title="Jogos">
                      J
                    </th>
                    <th className="py-2.5 px-2 text-center" title="Vitórias">
                      V
                    </th>
                    <th className="py-2.5 px-2 text-center" title="Empates">
                      E
                    </th>
                    <th className="py-2.5 px-2 text-center" title="Derrotas">
                      D
                    </th>
                    <th className="py-2.5 px-2 text-center" title="Gols Pró">
                      GP
                    </th>
                    <th className="py-2.5 px-2 text-center" title="Gols Contra">
                      GC
                    </th>
                    <th className="py-2.5 px-2 text-center" title="Saldo de Gols">
                      SG
                    </th>
                    <th className="py-2.5 pl-2 pr-3 text-center" title="Aproveitamento">
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
                          {/* Sticky position + zone bar + club crest + name */}
                          <td
                            className={`sticky left-0 z-10 py-2.5 pl-0 pr-2 backdrop-blur transition-colors ${
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
                                className={`font-bold truncate max-w-[110px] sm:max-w-[165px] ${
                                  fav ? 'text-amber-600 dark:text-amber-300 font-extrabold' : 'text-foreground'
                                }`}
                                title={row.teamName}
                              >
                                {row.teamName}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleFavorite(row.teamName)}
                                title={fav ? 'Remover dos favoritos' : 'Favoritar clube'}
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

                          <td className="py-2.5 px-2 text-center font-black tabular-nums text-foreground bg-muted/20">
                            {row.points}
                          </td>
                          <td className="py-2.5 px-2 text-center tabular-nums text-muted-foreground font-semibold">
                            {row.gamesPlayed}
                          </td>
                          <td className="py-2.5 px-2 text-center tabular-nums text-foreground font-semibold">
                            {row.wins}
                          </td>
                          <td className="py-2.5 px-2 text-center tabular-nums text-muted-foreground">
                            {row.draws}
                          </td>
                          <td className="py-2.5 px-2 text-center tabular-nums text-muted-foreground">
                            {row.losses}
                          </td>
                          <td className="py-2.5 px-2 text-center tabular-nums text-muted-foreground">
                            {row.goalsFor}
                          </td>
                          <td className="py-2.5 px-2 text-center tabular-nums text-muted-foreground">
                            {row.goalsAgainst}
                          </td>
                          <td
                            className={`py-2.5 px-2 text-center tabular-nums font-bold ${
                              row.goalDifference > 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : row.goalDifference < 0
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {sgDisplay}
                          </td>
                          <td className="py-2.5 pl-2 pr-3 text-center tabular-nums text-muted-foreground font-medium">
                            {row.winPercentage}%
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-xs text-muted-foreground">
                        Nenhum clube encontrado para o filtro selecionado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ZONES LEGEND & TIE-BREAKERS */}
        <section className="mt-4 rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-foreground mb-2.5">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span>Legenda de Classificação</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-emerald-500 shrink-0" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">1º–4º:</strong> Fase de grupos da Libertadores
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
                <strong className="text-foreground">7º–12º:</strong> Copa Sul-Americana
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-rose-500 shrink-0" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">17º–20º:</strong> Rebaixamento (Série B)
              </span>
            </div>
          </div>

          <p className="mt-3 pt-2.5 border-t border-border/60 text-[11px] text-muted-foreground">
            <strong>Critérios de desempate:</strong> Pontos (PTS), Vitórias (V), Saldo de Gols (SG),
            Gols Pró (GP) e confronto direto. Atualização automática em tempo real a cada 30
            segundos.
          </p>
        </section>
      </main>

      {/* FLOATING WHATSAPP SHARE BUTTON */}
      {entries.length > 0 && (
        <FloatingWhatsAppButton
          onClick={handleShareWhatsApp}
          title="Compartilhar classificação no WhatsApp"
        />
      )}
    </div>
  );
}

