import { useState, useMemo, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Trophy,
  Clock,
  Tv,
  Satellite,
  Play,
  Search,
  Share2,
  ChevronLeft,
  ChevronRight,
  Star,
  RefreshCw,
  X,
  Filter,
  Check,
  Sparkles,
  Radio,
  SlidersHorizontal,
} from "lucide-react";
import { fetchMatchesServerFn } from "../lib/server-fn";
import { DaySchedule, MatchItem, ChannelType } from "../lib/types";
import { getChannelBadgeStyles } from "../lib/channel-helper";
import { shareMatchesOnWhatsApp } from "../lib/whatsapp";
import { useFavorites } from "../lib/favorites";
import { scrapeGoalMatches, getBrasiliaTimeString } from "../lib/scraper";

export const Route = createFileRoute("/")({
  component: FutebolNaTv,
  loader: async () => {
    try {
      const data = await fetchMatchesServerFn();
      return data;
    } catch {
      // Fallback in loader
      const local = await scrapeGoalMatches();
      return {
        success: local.success,
        days: local.days,
        lastUpdated: local.lastUpdated,
        source: local.source,
      };
    }
  },
  head: () => ({
    meta: [
      { title: "Futebol na TV — Jogos de Hoje, Horários e Onde Assistir" },
      {
        name: "description",
        content:
          "Guia completo com os jogos de futebol do dia no horário de Brasília, canais de TV aberta, TV fechada e streaming.",
      },
    ],
  }),
});

const POPULAR_TEAMS = [
  "Flamengo",
  "Palmeiras",
  "Corinthians",
  "São Paulo",
  "Vasco",
  "Fluminense",
  "Botafogo",
  "Grêmio",
  "Internacional",
  "Cruzeiro",
  "Atlético-MG",
  "Santos",
  "Real Madrid",
  "Barcelona",
  "Manchester City",
];

function FutebolNaTv() {
  const loaderData = Route.useLoaderData();

  const [days, setDays] = useState<DaySchedule[]>(loaderData?.days || []);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<string>(
    loaderData?.lastUpdated || getBrasiliaTimeString()
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChampionship, setSelectedChampionship] = useState<string>("all");
  const [selectedChannelType, setSelectedChannelType] = useState<ChannelType | "all">("all");
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

  const { favorites, toggleFavorite, isFavorite, matchHasFavorite } = useFavorites();

  // Pick today's index initially if present
  useEffect(() => {
    if (days && days.length > 0) {
      const todayIdx = days.findIndex((d) => d.isToday);
      if (todayIdx >= 0) {
        setSelectedDayIndex(todayIdx);
      }
    }
  }, [days]);

  // Current selected day
  const currentDay: DaySchedule | undefined = days[selectedDayIndex] || days[0];

  // Refresh handler
  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const res = await scrapeGoalMatches();
      if (res && res.days && res.days.length > 0) {
        setDays(res.days);
        setLastUpdated(res.lastUpdated);
      }
    } catch (e) {
      console.warn("Erro ao atualizar:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // List of unique championships for the active day
  const availableChampionships = useMemo(() => {
    if (!currentDay) return [];
    const set = new Set<string>();
    currentDay.matches.forEach((m) => {
      if (m.championship) set.add(m.championship);
    });
    return Array.from(set).sort();
  }, [currentDay]);

  // Filtered matches for the active day
  const filteredMatches = useMemo(() => {
    if (!currentDay) return [];

    return currentDay.matches.filter((match) => {
      // 1. Search Query filter (matches team_home or team_away or match_title)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = match.match_title.toLowerCase().includes(q);
        const matchesHome = match.team_home.toLowerCase().includes(q);
        const matchesAway = match.team_away.toLowerCase().includes(q);
        const matchesChamp = match.championship.toLowerCase().includes(q);
        if (!matchesTitle && !matchesHome && !matchesAway && !matchesChamp) {
          return false;
        }
      }

      // 2. Championship filter
      if (selectedChampionship !== "all" && match.championship !== selectedChampionship) {
        return false;
      }

      // 3. Channel Type filter
      if (selectedChannelType !== "all") {
        const hasType = match.channel_types.includes(selectedChannelType);
        if (!hasType) return false;
      }

      return true;
    });
  }, [currentDay, searchQuery, selectedChampionship, selectedChannelType]);

  // Group matches by favorite vs non-favorite
  const favoriteMatches = useMemo(() => {
    return filteredMatches.filter((m) => matchHasFavorite(m));
  }, [filteredMatches, matchHasFavorite]);

  // Group all filtered matches by championship, sorted by time
  const groupedByChampionship = useMemo(() => {
    const groups: { championship: string; matches: MatchItem[] }[] = [];
    const map = new Map<string, MatchItem[]>();

    for (const match of filteredMatches) {
      const champ = match.championship || "Outros";
      if (!map.has(champ)) {
        map.set(champ, []);
      }
      map.get(champ)!.push(match);
    }

    map.forEach((matches, championship) => {
      // Sort matches chronologically by time_br
      matches.sort((a, b) => a.time_br.localeCompare(b.time_br));
      groups.push({ championship, matches });
    });

    // Sort groups alphabetically by championship name
    groups.sort((a, b) => a.championship.localeCompare(b.championship));

    return groups;
  }, [filteredMatches]);

  // Navigation handlers
  const canGoPrev = selectedDayIndex > 0;
  const canGoNext = selectedDayIndex < days.length - 1;

  const handlePrevDay = () => {
    if (canGoPrev) setSelectedDayIndex((prev) => prev - 1);
  };

  const handleNextDay = () => {
    if (canGoNext) setSelectedDayIndex((prev) => prev + 1);
  };

  // WhatsApp share handler
  const handleShareWhatsApp = () => {
    if (!currentDay) return;
    shareMatchesOnWhatsApp(currentDay.displayDate, filteredMatches);
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedChampionship !== "all" ||
    selectedChannelType !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedChampionship("all");
    setSelectedChannelType("all");
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-16 antialiased selection:bg-primary/20 selection:text-primary">
      {/* Top ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-[radial-gradient(ellipse_at_top,_oklch(0.78_0.22_145_/_0.15),_transparent_70%)] pointer-events-none z-0" />

      {/* HEADER */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/85 border-b border-border/80 px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          {/* Logo & App Title */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-[0_0_20px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400/40">
              <Tv className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight sm:text-xl text-white">
                  Futebol <span className="text-primary">na TV</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/25">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Brasília (UTC-3)
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <span>Atualizado às</span>
                <strong className="text-foreground font-semibold">{lastUpdated}</strong>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  title="Atualizar jogos agora"
                  className="inline-flex items-center text-primary hover:text-emerald-300 transition-colors ml-1 p-0.5 rounded"
                >
                  <RefreshCw
                    className={`h-3 w-3 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`}
                  />
                </button>
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Favorites Manager Button */}
            <button
              type="button"
              onClick={() => setShowFavoritesModal(true)}
              className="relative flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 py-2 text-xs font-medium text-foreground backdrop-blur hover:border-primary/50 hover:bg-card transition"
              title="Gerenciar times favoritos"
            >
              <Star
                className={`h-4 w-4 ${favorites.length > 0 ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
              />
              <span className="hidden sm:inline">Favoritos</span>
              {favorites.length > 0 && (
                <span className="ml-0.5 rounded-full bg-primary/20 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* WhatsApp Share Button */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-500 active:scale-95 transition"
              title="Compartilhar jogos no WhatsApp"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="relative z-10 mx-auto max-w-4xl px-4 pt-4 sm:px-6">
        {/* DATE SELECTOR BAR */}
        <section className="mb-4 rounded-2xl border border-border bg-card/70 p-3 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handlePrevDay}
              disabled={!canGoPrev}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background/60 text-foreground transition hover:border-primary hover:bg-background disabled:opacity-30 disabled:pointer-events-none"
              title="Dia anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="text-center min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5">
                {currentDay?.isToday && (
                  <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[11px] font-bold text-primary tracking-wide uppercase">
                    Hoje
                  </span>
                )}
                <h2 className="text-sm sm:text-base font-bold text-white truncate">
                  {currentDay?.displayDate || "Jogos do Dia"}
                </h2>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {filteredMatches.length} {filteredMatches.length === 1 ? "jogo" : "jogos"}{" "}
                encontrados
              </p>
            </div>

            <button
              type="button"
              onClick={handleNextDay}
              disabled={!canGoNext}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background/60 text-foreground transition hover:border-primary hover:bg-background disabled:opacity-30 disabled:pointer-events-none"
              title="Próximo dia"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Date Pills */}
          {days.length > 1 && (
            <div className="mt-3 flex items-center justify-center gap-1.5 overflow-x-auto pt-2 border-t border-border/50 no-scrollbar">
              {days.map((d, idx) => {
                const isActive = idx === selectedDayIndex;
                return (
                  <button
                    key={d.date}
                    type="button"
                    onClick={() => setSelectedDayIndex(idx)}
                    className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                        : "bg-background/50 text-muted-foreground hover:text-foreground hover:bg-background border border-border/50"
                    }`}
                  >
                    {d.isToday ? "Hoje" : d.dayOfWeek} ({d.shortDate})
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* SEARCH AND FILTERS */}
        <section className="mb-6 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por time (ex: Flamengo, Real Madrid, Palmeiras...)"
              className="w-full rounded-xl border border-border bg-card/60 pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 backdrop-blur transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Pills: Channel Types */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-muted-foreground mr-1 flex items-center gap-1">
              <SlidersHorizontal className="h-3 w-3" /> Transmissão:
            </span>
            <button
              type="button"
              onClick={() => setSelectedChannelType("all")}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                selectedChannelType === "all"
                  ? "bg-foreground text-background font-semibold"
                  : "bg-card/70 text-muted-foreground border border-border hover:text-foreground"
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setSelectedChannelType("aberta")}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium flex items-center gap-1 transition ${
                selectedChannelType === "aberta"
                  ? "bg-emerald-500 text-white font-semibold shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                  : "bg-card/70 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10"
              }`}
            >
              <Tv className="h-3 w-3" /> TV Aberta
            </button>
            <button
              type="button"
              onClick={() => setSelectedChannelType("fechada")}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium flex items-center gap-1 transition ${
                selectedChannelType === "fechada"
                  ? "bg-sky-500 text-white font-semibold shadow-[0_0_12px_rgba(14,165,233,0.3)]"
                  : "bg-card/70 text-sky-400 border border-sky-500/30 hover:bg-sky-500/10"
              }`}
            >
              <Satellite className="h-3 w-3" /> TV Fechada
            </button>
            <button
              type="button"
              onClick={() => setSelectedChannelType("streaming")}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium flex items-center gap-1 transition ${
                selectedChannelType === "streaming"
                  ? "bg-violet-500 text-white font-semibold shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                  : "bg-card/70 text-violet-400 border border-violet-500/30 hover:bg-violet-500/10"
              }`}
            >
              <Play className="h-3 w-3" /> Streaming
            </button>
          </div>

          {/* Championship Filter Dropdown/Chips */}
          {availableChampionships.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-[11px] font-medium text-muted-foreground shrink-0 flex items-center gap-1">
                <Trophy className="h-3 w-3" /> Campeonato:
              </span>
              <button
                type="button"
                onClick={() => setSelectedChampionship("all")}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  selectedChampionship === "all"
                    ? "bg-primary/20 text-primary border border-primary/40 font-semibold"
                    : "bg-card/60 text-muted-foreground border border-border/70 hover:text-foreground"
                }`}
              >
                Todos ({availableChampionships.length})
              </button>
              {availableChampionships.map((champ) => {
                const isSelected = selectedChampionship === champ;
                return (
                  <button
                    key={champ}
                    type="button"
                    onClick={() => setSelectedChampionship(champ)}
                    className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      isSelected
                        ? "bg-primary/20 text-primary border border-primary/50 font-semibold"
                        : "bg-card/60 text-muted-foreground border border-border/70 hover:text-foreground hover:border-primary/30"
                    }`}
                  >
                    {champ}
                  </button>
                );
              })}
            </div>
          )}

          {/* Active filter summary bar */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between rounded-xl bg-card/40 border border-border/60 px-3 py-1.5 text-xs text-muted-foreground">
              <span>Filtros ativos aplicados</span>
              <button
                type="button"
                onClick={clearFilters}
                className="text-primary hover:underline font-semibold flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Limpar filtros
              </button>
            </div>
          )}
        </section>

        {/* PINNED FAVORITE TEAMS SECTION */}
        {favoriteMatches.length > 0 && (
          <section className="mb-8 rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-card/70 to-card/90 p-4 shadow-[0_0_30px_rgba(245,158,11,0.12)]">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-amber-950 font-bold shadow-md">
                  <Star className="h-4 w-4 fill-amber-950" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Seus Times em Campo
                    <span className="rounded-full bg-amber-400/20 px-2 py-0.2 text-[10px] font-bold text-amber-300">
                      {favoriteMatches.length}
                    </span>
                  </h3>
                  <p className="text-[10px] text-amber-200/80">
                    Jogos com times que você favoritou
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {favoriteMatches.map((match) => (
                <MatchCard
                  key={`fav_${match.id}`}
                  match={match}
                  isFavorite={isFavorite}
                  onToggleFavorite={toggleFavorite}
                  highlightFavorite
                />
              ))}
            </div>
          </section>
        )}

        {/* MATCHES LIST GROUPED BY CHAMPIONSHIP */}
        {groupedByChampionship.length > 0 ? (
          <div className="space-y-6">
            {groupedByChampionship.map(({ championship, matches }) => (
              <section key={championship} className="space-y-3">
                {/* Championship Header */}
                <div className="flex items-center justify-between border-b border-border/80 pb-2 px-1">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    <h3 className="font-bold text-sm sm:text-base text-foreground tracking-tight">
                      {championship}
                    </h3>
                  </div>
                  <span className="rounded-full bg-card px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground border border-border">
                    {matches.length} {matches.length === 1 ? "jogo" : "jogos"}
                  </span>
                </div>

                {/* Match Cards inside this Championship */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {matches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      isFavorite={isFavorite}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="my-12 rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center backdrop-blur">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Nenhum jogo encontrado
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              Nenhuma partida corresponde aos filtros selecionados para este dia.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow hover:scale-105 transition"
              >
                Limpar todos os filtros
              </button>
            )}
          </div>
        )}
      </main>

      {/* FLOATING ACTION BUTTON: WHATSAPP SHARE (Mobile & Desktop) */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={handleShareWhatsApp}
          className="group flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-[0_4px_25px_rgba(16,185,129,0.5)] hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all"
        >
          <Share2 className="h-4 w-4" />
          <span className="font-semibold">Compartilhar Jogos</span>
        </button>
      </div>

      {/* FAVORITE TEAMS MODAL */}
      {showFavoritesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <h3 className="font-bold text-base text-foreground">Meus Times Favoritos</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFavoritesModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-3">
                Selecione seus times para que os jogos apareçam destacados no topo da página:
              </p>

              {/* Popular Brazilian Teams Chips */}
              <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto p-1">
                {POPULAR_TEAMS.map((team) => {
                  const active = isFavorite(team);
                  return (
                    <button
                      key={team}
                      type="button"
                      onClick={() => toggleFavorite(team)}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                        active
                          ? "bg-amber-400 text-amber-950 shadow-md ring-2 ring-amber-300"
                          : "bg-background/80 text-foreground border border-border hover:border-primary/50"
                      }`}
                    >
                      <Star
                        className={`h-3 w-3 ${active ? "fill-amber-950" : "text-muted-foreground"}`}
                      />
                      {team}
                    </button>
                  );
                })}
              </div>

              {favorites.length > 0 && (
                <div className="mt-4 pt-3 border-t border-border/60">
                  <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">
                    Times selecionados ({favorites.length}):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {favorites.map((f) => (
                      <span
                        key={f}
                        className="inline-flex items-center gap-1 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 text-[11px] font-medium"
                      >
                        {f}
                        <button
                          type="button"
                          onClick={() => toggleFavorite(f)}
                          className="hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowFavoritesModal(false)}
                className="w-full rounded-xl bg-primary py-2.5 text-center text-xs font-bold text-primary-foreground shadow hover:bg-emerald-400 transition"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// MATCH CARD COMPONENT
// ----------------------------------------------------------------------
function MatchCard({
  match,
  isFavorite,
  onToggleFavorite,
  highlightFavorite = false,
}: {
  match: MatchItem;
  isFavorite: (team: string) => boolean;
  onToggleFavorite: (team: string) => void;
  highlightFavorite?: boolean;
}) {
  const homeFav = isFavorite(match.team_home);
  const awayFav = isFavorite(match.team_away);

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border p-4 transition-all hover:scale-[1.01] ${
        highlightFavorite
          ? "border-amber-500/50 bg-card/90 shadow-[0_0_20px_rgba(245,158,11,0.08)]"
          : "border-border/80 bg-card/60 backdrop-blur-sm hover:border-primary/50 hover:bg-card/90 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
      }`}
    >
      {/* Top Card Info: Championship tag + Time Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[11px] font-semibold text-muted-foreground truncate max-w-[170px]">
          {match.championship}
        </span>
        <div className="flex items-center gap-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-xs font-bold text-emerald-400">
          <Clock className="h-3 w-3" />
          <span>{match.time_br}</span>
        </div>
      </div>

      {/* Teams Display */}
      <div className="my-1 space-y-2">
        {/* Team Home */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-background/80 border border-border text-[11px] font-extrabold text-white">
              {match.team_home.substring(0, 2).toUpperCase()}
            </div>
            <span
              className={`text-sm font-semibold truncate ${
                homeFav ? "text-amber-300 font-bold" : "text-foreground"
              }`}
            >
              {match.team_home}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onToggleFavorite(match.team_home)}
            className="p-1 text-muted-foreground hover:text-amber-400 transition"
            title={homeFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Star
              className={`h-4 w-4 ${homeFav ? "fill-amber-400 text-amber-400" : "opacity-40 group-hover:opacity-100"}`}
            />
          </button>
        </div>

        {/* Team Away */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-background/80 border border-border text-[11px] font-extrabold text-white">
              {match.team_away ? match.team_away.substring(0, 2).toUpperCase() : "VS"}
            </div>
            <span
              className={`text-sm font-semibold truncate ${
                awayFav ? "text-amber-300 font-bold" : "text-foreground"
              }`}
            >
              {match.team_away || "A definir"}
            </span>
          </div>
          {match.team_away && (
            <button
              type="button"
              onClick={() => onToggleFavorite(match.team_away)}
              className="p-1 text-muted-foreground hover:text-amber-400 transition"
              title={awayFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Star
                className={`h-4 w-4 ${awayFav ? "fill-amber-400 text-amber-400" : "opacity-40 group-hover:opacity-100"}`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Channels Badges Section */}
      <div className="mt-4 pt-3 border-t border-border/50">
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
            Onde Assistir
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {match.channels && match.channels.length > 0 ? (
            match.channels.map((ch, idx) => {
              const styles = getChannelBadgeStyles(ch.type);
              return (
                <span
                  key={`${ch.name}_${idx}`}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${styles.bg} ${styles.text} ${styles.border} ${styles.glow}`}
                >
                  {styles.iconName === "tv" && <Tv className="h-3 w-3" />}
                  {styles.iconName === "satellite" && <Satellite className="h-3 w-3" />}
                  {styles.iconName === "play" && <Play className="h-3 w-3" />}
                  {ch.name}
                </span>
              );
            })
          ) : (
            <span className="text-xs text-muted-foreground italic">
              Transmissão a confirmar
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
