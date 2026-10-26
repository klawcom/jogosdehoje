import { useState, useMemo, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Clock,
  Search,
  Share2,
  ChevronLeft,
  ChevronRight,
  Star,
  RefreshCw,
  X,
  SlidersHorizontal,
  Trophy,
  Heart,
  Calendar,
  ChevronRight as ChevronRightIcon,
  Tv,
} from "lucide-react";
import { fetchMatchesServerFn } from "../lib/server-fn";
import { DaySchedule, MatchItem, ChannelType } from "../lib/types";
import { getChannelBadgeStyles } from "../lib/channel-helper";
import { ChannelLogo } from "../lib/channel-logos";
import { getTeamLogo, getTeamInitialsBadge } from "../lib/team-logos";
import { shareMatchesOnWhatsApp, shareSingleMatchOnWhatsApp } from "../lib/whatsapp";
import { useFavorites } from "../lib/favorites";
import { useLikes } from "../lib/likes";
import { scrapeGoalMatches, getBrasiliaTimeString } from "../lib/scraper";

export const Route = createFileRoute("/")({
  component: JogosDeHoje,
  loader: async () => {
    try {
      const data = await fetchMatchesServerFn();
      return data;
    } catch {
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
      { title: "Jogos de Hoje — Futebol na TV, Horários e Onde Assistir" },
      {
        name: "description",
        content:
          "Confira todos os jogos de futebol de hoje por horário de Brasília, com canais de TV aberta, TV fechada e streaming.",
      },
    ],
  }),
});

const POPULAR_TEAMS = [
  "Flamengo",
  "Grêmio",
  "Palmeiras",
  "Corinthians",
  "São Paulo",
  "Vasco",
  "Fluminense",
  "Botafogo",
  "Internacional",
  "Cruzeiro",
  "Atlético-MG",
  "Santos",
  "Coritiba",
  "América-MG",
  "Cuiabá",
  "Juventude",
  "Náutico",
  "Real Madrid",
  "Barcelona",
  "Boca Juniors",
  "River Plate",
  "Estudiantes",
  "Union Santa Fe",
];

// Color sequence themes for time slot differentiation
interface TimeSlotTheme {
  name: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  iconBg: string;
  iconText: string;
  cardBorder: string;
  cardHover: string;
  cardGlow: string;
  cardBgGradient: string;
  timeBadgeBg: string;
  timeBadgeText: string;
  timeBadgeBorder: string;
}

function getTimeSlotTheme(slotIndex: number): TimeSlotTheme {
  const themes: TimeSlotTheme[] = [
    // 1. Esmeralda / Verde (Padrão Principal do Site)
    {
      name: "emerald",
      badgeBg: "bg-emerald-500/15",
      badgeText: "text-emerald-400",
      badgeBorder: "border-emerald-500/30",
      iconBg: "bg-emerald-500/20",
      iconText: "text-emerald-400",
      cardBorder: "border-emerald-500/25",
      cardHover: "hover:border-emerald-400/60",
      cardGlow: "hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]",
      cardBgGradient: "bg-gradient-to-b from-card/90 to-card/75",
      timeBadgeBg: "bg-emerald-500/15",
      timeBadgeText: "text-emerald-300",
      timeBadgeBorder: "border-emerald-500/40",
    },
    // 2. Azul Céu (Padrão TV Fechada)
    {
      name: "sky",
      badgeBg: "bg-sky-500/15",
      badgeText: "text-sky-400",
      badgeBorder: "border-sky-500/30",
      iconBg: "bg-sky-500/20",
      iconText: "text-sky-400",
      cardBorder: "border-sky-500/25",
      cardHover: "hover:border-sky-400/60",
      cardGlow: "hover:shadow-[0_0_20px_rgba(14,165,233,0.12)]",
      cardBgGradient: "bg-gradient-to-b from-card/90 to-card/75",
      timeBadgeBg: "bg-sky-500/15",
      timeBadgeText: "text-sky-300",
      timeBadgeBorder: "border-sky-500/40",
    },
    // 3. Roxo / Violeta (Padrão Streaming)
    {
      name: "violet",
      badgeBg: "bg-violet-500/15",
      badgeText: "text-violet-400",
      badgeBorder: "border-violet-500/30",
      iconBg: "bg-violet-500/20",
      iconText: "text-violet-400",
      cardBorder: "border-violet-500/25",
      cardHover: "hover:border-violet-400/60",
      cardGlow: "hover:shadow-[0_0_20px_rgba(168,85,247,0.12)]",
      cardBgGradient: "bg-gradient-to-b from-card/90 to-card/75",
      timeBadgeBg: "bg-violet-500/15",
      timeBadgeText: "text-violet-300",
      timeBadgeBorder: "border-violet-500/40",
    },
    // 4. Dourado / Âmbar (Padrão Destaques & Favoritos)
    {
      name: "amber",
      badgeBg: "bg-amber-500/15",
      badgeText: "text-amber-400",
      badgeBorder: "border-amber-500/30",
      iconBg: "bg-amber-500/20",
      iconText: "text-amber-400",
      cardBorder: "border-amber-500/25",
      cardHover: "hover:border-amber-400/60",
      cardGlow: "hover:shadow-[0_0_20px_rgba(245,158,11,0.12)]",
      cardBgGradient: "bg-gradient-to-b from-card/90 to-card/75",
      timeBadgeBg: "bg-amber-500/15",
      timeBadgeText: "text-amber-300",
      timeBadgeBorder: "border-amber-500/40",
    },
    // 5. Turquesa / Teal (Padrão Especial)
    {
      name: "teal",
      badgeBg: "bg-teal-500/15",
      badgeText: "text-teal-400",
      badgeBorder: "border-teal-500/30",
      iconBg: "bg-teal-500/20",
      iconText: "text-teal-400",
      cardBorder: "border-teal-500/25",
      cardHover: "hover:border-teal-400/60",
      cardGlow: "hover:shadow-[0_0_20px_rgba(20,184,166,0.12)]",
      cardBgGradient: "bg-gradient-to-b from-card/90 to-card/75",
      timeBadgeBg: "bg-teal-500/15",
      timeBadgeText: "text-teal-300",
      timeBadgeBorder: "border-teal-500/40",
    },
  ];

  return themes[slotIndex % themes.length];
}

function JogosDeHoje() {
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

  // Active match for details modal/page
  const [activeMatch, setActiveMatch] = useState<MatchItem | null>(null);

  const { favorites, toggleFavorite, isFavorite, matchHasFavorite } = useFavorites();
  const { isLiked, getLikeCount, toggleLike } = useLikes();

  useEffect(() => {
    if (days && days.length > 0) {
      const todayIdx = days.findIndex((d) => d.isToday);
      if (todayIdx >= 0) {
        setSelectedDayIndex(todayIdx);
      }
    }
  }, [days]);

  const currentDay: DaySchedule | undefined = days[selectedDayIndex] || days[0];

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

  const availableChampionships = useMemo(() => {
    if (!currentDay) return [];
    const set = new Set<string>();
    currentDay.matches.forEach((m) => {
      if (m.championship) set.add(m.championship);
    });
    return Array.from(set).sort();
  }, [currentDay]);

  const filteredMatches = useMemo(() => {
    if (!currentDay) return [];

    return currentDay.matches.filter((match) => {
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

      if (selectedChampionship !== "all" && match.championship !== selectedChampionship) {
        return false;
      }

      if (selectedChannelType !== "all") {
        const hasType = match.channel_types.includes(selectedChannelType);
        if (!hasType) return false;
      }

      return true;
    });
  }, [currentDay, searchQuery, selectedChampionship, selectedChannelType]);

  const favoriteMatches = useMemo(() => {
    return filteredMatches.filter((m) => matchHasFavorite(m));
  }, [filteredMatches, matchHasFavorite]);

  // SEQUÊNCIA DE CARDS POR HORÁRIO
  const groupedByTime = useMemo(() => {
    const timeMap = new Map<string, MatchItem[]>();
    const sorted = [...filteredMatches].sort((a, b) => a.time_br.localeCompare(b.time_br));

    for (const match of sorted) {
      const timeKey = match.time_br || "00:00";
      if (!timeMap.has(timeKey)) {
        timeMap.set(timeKey, []);
      }
      timeMap.get(timeKey)!.push(match);
    }

    const groups: { time: string; matches: MatchItem[] }[] = [];
    timeMap.forEach((matches, time) => {
      groups.push({ time, matches });
    });

    groups.sort((a, b) => a.time.localeCompare(b.time));
    return groups;
  }, [filteredMatches]);

  const canGoPrev = selectedDayIndex > 0;
  const canGoNext = selectedDayIndex < days.length - 1;

  const handlePrevDay = () => {
    if (canGoPrev) setSelectedDayIndex((prev) => prev - 1);
  };

  const handleNextDay = () => {
    if (canGoNext) setSelectedDayIndex((prev) => prev + 1);
  };

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
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-56 bg-[radial-gradient(ellipse_at_top,_oklch(0.78_0.22_145_/_0.12),_transparent_70%)] pointer-events-none z-0" />

      {/* HEADER: Jogos de Hoje */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/90 border-b border-border/80 px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          {/* Logo & App Title: Jogos de Hoje */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-[0_0_15px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400/40">
              <span className="text-xl">⚽</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-black tracking-tight sm:text-xl text-white">
                  Jogos <span className="text-primary font-black">de Hoje</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/25">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Brasília (UTC-3)
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <span>Atualizado às</span>
                <strong className="text-foreground font-semibold">{lastUpdated}</strong>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  title="Atualizar jogos agora"
                  className="inline-flex items-center text-primary hover:text-emerald-300 transition-colors ml-0.5 p-0.5 rounded"
                >
                  <RefreshCw
                    className={`h-3 w-3 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`}
                  />
                </button>
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFavoritesModal(true)}
              className="relative flex items-center gap-1.5 rounded-xl border border-border bg-card/70 px-3 py-2 text-xs font-bold text-foreground backdrop-blur hover:border-primary/50 hover:bg-card transition"
              title="Meus times favoritos"
            >
              <Star
                className={`h-4 w-4 ${favorites.length > 0 ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
              />
              <span className="hidden sm:inline">Favoritos</span>
              {favorites.length > 0 && (
                <span className="rounded-full bg-amber-400/20 px-1.5 py-0.2 text-[10px] font-bold text-amber-300">
                  {favorites.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-500 active:scale-95 transition"
              title="Compartilhar lista completa no WhatsApp"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 mx-auto max-w-3xl px-3 sm:px-6 pt-3">
        {/* DATE SELECTOR BAR */}
        <section className="mb-3 rounded-2xl border border-border bg-card/80 p-2.5 backdrop-blur-md shadow-md">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handlePrevDay}
              disabled={!canGoPrev}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background/60 text-foreground transition hover:border-primary hover:bg-background disabled:opacity-30 disabled:pointer-events-none"
              title="Dia anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="text-center min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5">
                {currentDay?.isToday && (
                  <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary tracking-wide uppercase">
                    HOJE
                  </span>
                )}
                <h2 className="text-sm sm:text-base font-extrabold text-white truncate">
                  {currentDay?.displayDate || "Jogos de Hoje"}
                </h2>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {filteredMatches.length} {filteredMatches.length === 1 ? "jogo encontrado" : "jogos encontrados"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleNextDay}
              disabled={!canGoNext}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background/60 text-foreground transition hover:border-primary hover:bg-background disabled:opacity-30 disabled:pointer-events-none"
              title="Próximo dia"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Date Pills */}
          {days.length > 1 && (
            <div className="mt-2.5 flex items-center justify-center gap-1.5 overflow-x-auto pt-2 border-t border-border/50 no-scrollbar">
              {days.map((d, idx) => {
                const isActive = idx === selectedDayIndex;
                return (
                  <button
                    key={d.date}
                    type="button"
                    onClick={() => setSelectedDayIndex(idx)}
                    className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(16,185,129,0.35)]"
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

        {/* SEARCH & FILTERS */}
        <section className="mb-4 space-y-2.5">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por time (ex: Flamengo, Real Madrid, Palmeiras...)"
              className="w-full rounded-xl border border-border bg-card/70 pl-10 pr-9 py-2.5 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 backdrop-blur transition"
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

          {/* Filter: Channel Type */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground mr-1 flex items-center gap-1">
              <SlidersHorizontal className="h-3 w-3" /> Transmissão:
            </span>
            <button
              type="button"
              onClick={() => setSelectedChannelType("all")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                selectedChannelType === "all"
                  ? "bg-foreground text-background"
                  : "bg-card/70 text-muted-foreground border border-border hover:text-foreground"
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setSelectedChannelType("aberta")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition flex items-center gap-1 ${
                selectedChannelType === "aberta"
                  ? "bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  : "bg-card/70 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10"
              }`}
            >
              <Tv className="h-3 w-3" /> TV Aberta
            </button>
            <button
              type="button"
              onClick={() => setSelectedChannelType("fechada")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition flex items-center gap-1 ${
                selectedChannelType === "fechada"
                  ? "bg-sky-500 text-white shadow-[0_0_10px_rgba(14,165,233,0.3)]"
                  : "bg-card/70 text-sky-400 border border-sky-500/30 hover:bg-sky-500/10"
              }`}
            >
              TV Fechada
            </button>
            <button
              type="button"
              onClick={() => setSelectedChannelType("streaming")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition flex items-center gap-1 ${
                selectedChannelType === "streaming"
                  ? "bg-violet-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                  : "bg-card/70 text-violet-400 border border-violet-500/30 hover:bg-violet-500/10"
              }`}
            >
              Streaming
            </button>
          </div>

          {/* Filter: Championship */}
          {availableChampionships.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-[11px] font-semibold text-muted-foreground shrink-0 flex items-center gap-1">
                <Trophy className="h-3 w-3" /> Campeonato:
              </span>
              <button
                type="button"
                onClick={() => setSelectedChampionship("all")}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  selectedChampionship === "all"
                    ? "bg-primary/20 text-primary border border-primary/40"
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
                    className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      isSelected
                        ? "bg-primary/20 text-primary border border-primary/50"
                        : "bg-card/60 text-muted-foreground border border-border/70 hover:text-foreground hover:border-primary/30"
                    }`}
                  >
                    {champ}
                  </button>
                );
              })}
            </div>
          )}

          {hasActiveFilters && (
            <div className="flex items-center justify-between rounded-xl bg-card/50 border border-border/60 px-3 py-1.5 text-xs text-muted-foreground">
              <span>Filtros ativos aplicados</span>
              <button
                type="button"
                onClick={clearFilters}
                className="text-primary hover:underline font-bold flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Limpar filtros
              </button>
            </div>
          )}
        </section>

        {/* PINNED FAVORITE TEAMS */}
        {favoriteMatches.length > 0 && (
          <section className="mb-5 rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-500/15 via-card/80 to-card/90 p-3.5 shadow-[0_0_25px_rgba(245,158,11,0.12)]">
            <div className="mb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-400 text-amber-950 font-bold shadow-sm">
                  <Star className="h-3.5 w-3.5 fill-amber-950" />
                </div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  Seus Times em Campo
                  <span className="rounded-full bg-amber-400/20 px-2 py-0.2 text-[10px] font-bold text-amber-300">
                    {favoriteMatches.length}
                  </span>
                </h3>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {favoriteMatches.map((match) => (
                <CompactMatchCard
                  key={`fav_${match.id}`}
                  match={match}
                  isFavorite={isFavorite}
                  onToggleFavorite={toggleFavorite}
                  onOpenDetails={() => setActiveMatch(match)}
                  isLiked={isLiked(match.id)}
                  likeCount={getLikeCount(match.id)}
                  onToggleLike={() => toggleLike(match.id)}
                  theme={getTimeSlotTheme(3)} // Gold/Amber theme for favorites
                  highlightFavorite
                />
              ))}
            </div>
          </section>
        )}

        {/* SEQUÊNCIA DE CARDS POR HORÁRIO COM CORES DIFERENCIADAS */}
        {groupedByTime.length > 0 ? (
          <div className="space-y-4">
            {groupedByTime.map(({ time, matches }, slotIdx) => {
              const theme = getTimeSlotTheme(slotIdx);

              return (
                <section key={time} className="space-y-2">
                  {/* Time slot header diferenciado por cor seguindo o padrão */}
                  <div className="flex items-center justify-between border-b border-border/80 pb-1.5 px-1">
                    <div className="flex items-center gap-2">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${theme.iconBg} ${theme.iconText} shadow-sm ring-1 ring-white/10`}>
                        <Clock className="h-3.5 w-3.5" />
                      </span>
                      <h3 className="font-black text-sm sm:text-base text-white tracking-wide flex items-center gap-1.5">
                        <span className={theme.badgeText}>{time}</span>
                        <span className="text-[11px] font-medium text-muted-foreground">(Brasília)</span>
                      </h3>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText} border ${theme.badgeBorder}`}>
                      {matches.length} {matches.length === 1 ? "jogo" : "jogos"}
                    </span>
                  </div>

                  {/* Cards na sequência com diferenciação visual elegante */}
                  <div className="grid gap-2 sm:grid-cols-2">
                    {matches.map((match) => (
                      <CompactMatchCard
                        key={match.id}
                        match={match}
                        isFavorite={isFavorite}
                        onToggleFavorite={toggleFavorite}
                        onOpenDetails={() => setActiveMatch(match)}
                        isLiked={isLiked(match.id)}
                        likeCount={getLikeCount(match.id)}
                        onToggleLike={() => toggleLike(match.id)}
                        theme={theme}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="my-10 rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center backdrop-blur">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">Nenhum jogo encontrado</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              Nenhuma partida corresponde aos filtros selecionados para este dia.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow hover:scale-105 transition"
              >
                Limpar todos os filtros
              </button>
            )}
          </div>
        )}
      </main>

      {/* FLOATING ACTION BUTTON */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={handleShareWhatsApp}
          className="group flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-[0_4px_25px_rgba(16,185,129,0.5)] hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all"
        >
          <Share2 className="h-4 w-4" />
          <span className="font-bold">Compartilhar</span>
        </button>
      </div>

      {/* MATCH DETAILS FULL MODAL */}
      {activeMatch && (
        <MatchDetailsModal
          match={activeMatch}
          displayDate={currentDay?.displayDate}
          onClose={() => setActiveMatch(null)}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          isLiked={isLiked(activeMatch.id)}
          likeCount={getLikeCount(activeMatch.id)}
          onToggleLike={() => toggleLike(activeMatch.id)}
        />
      )}

      {/* FAVORITE TEAMS MODAL */}
      {showFavoritesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <h3 className="font-extrabold text-base text-foreground">Meus Times Favoritos</h3>
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
                Selecione seus times para que os jogos apareçam em destaque no topo:
              </p>

              <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto p-1">
                {POPULAR_TEAMS.map((team) => {
                  const active = isFavorite(team);
                  const logo = getTeamLogo(team);
                  return (
                    <button
                      key={team}
                      type="button"
                      onClick={() => toggleFavorite(team)}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        active
                          ? "bg-amber-400 text-amber-950 shadow-md ring-2 ring-amber-300"
                          : "bg-background/80 text-foreground border border-border hover:border-primary/50"
                      }`}
                    >
                      {logo ? (
                        <img src={logo} alt={team} className="h-4 w-4 object-contain" />
                      ) : (
                        <Star className={`h-3 w-3 ${active ? "fill-amber-950" : "text-muted-foreground"}`} />
                      )}
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
                className="w-full rounded-xl bg-primary py-2.5 text-center text-xs font-extrabold text-primary-foreground shadow hover:bg-emerald-400 transition"
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
// COMPACT MATCH CARD WITH COLOR DIFFERENTIATION & UNIFORM CHANNELS
// ----------------------------------------------------------------------
function CompactMatchCard({
  match,
  isFavorite,
  onToggleFavorite,
  onOpenDetails,
  isLiked,
  likeCount,
  onToggleLike,
  theme,
  highlightFavorite = false,
}: {
  match: MatchItem;
  isFavorite: (team: string) => boolean;
  onToggleFavorite: (team: string) => void;
  onOpenDetails: () => void;
  isLiked: boolean;
  likeCount: number;
  onToggleLike: () => void;
  theme: TimeSlotTheme;
  highlightFavorite?: boolean;
}) {
  const homeFav = isFavorite(match.team_home);
  const awayFav = isFavorite(match.team_away);

  const homeLogo = getTeamLogo(match.team_home);
  const awayLogo = getTeamLogo(match.team_away);

  const homeInitials = getTeamInitialsBadge(match.team_home);
  const awayInitials = getTeamInitialsBadge(match.team_away);

  return (
    <div
      onClick={onOpenDetails}
      className={`group relative flex flex-col justify-between rounded-xl border p-3 cursor-pointer transition-all active:scale-[0.99] hover:scale-[1.01] ${
        highlightFavorite
          ? "border-amber-500/50 bg-gradient-to-br from-amber-500/10 via-card/90 to-card shadow-[0_0_15px_rgba(245,158,11,0.08)]"
          : `${theme.cardBorder} ${theme.cardBgGradient} backdrop-blur-sm ${theme.cardHover} ${theme.cardGlow}`
      }`}
    >
      {/* Top row: Championship + Time Badge com cor da sequência */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-semibold text-muted-foreground truncate max-w-[190px]">
          {match.championship}
        </span>
        <div
          className={`flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-black ${
            highlightFavorite
              ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
              : `${theme.timeBadgeBg} ${theme.timeBadgeBorder} ${theme.timeBadgeText}`
          }`}
        >
          <Clock className="h-3 w-3" />
          <span>{match.time_br}</span>
        </div>
      </div>

      {/* Main confrontation: Teams with official crests and larger fonts */}
      <div className="space-y-1.5 py-0.5">
        {/* Team Home */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {homeLogo ? (
              <img
                src={homeLogo}
                alt={match.team_home}
                className="h-6 w-6 shrink-0 object-contain drop-shadow-sm"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${homeInitials.gradient} text-[10px] font-black text-white shadow-sm`}
              >
                {homeInitials.initials}
              </div>
            )}
            <span
              className={`text-[15px] sm:text-base font-bold tracking-tight truncate ${
                homeFav ? "text-amber-300 font-extrabold" : "text-white"
              }`}
            >
              {match.team_home}
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(match.team_home);
            }}
            className="p-1 text-muted-foreground hover:text-amber-400 transition"
            title={homeFav ? "Remover dos favoritos" : "Favoritar time"}
          >
            <Star
              className={`h-3.5 w-3.5 ${homeFav ? "fill-amber-400 text-amber-400" : "opacity-30 group-hover:opacity-100"}`}
            />
          </button>
        </div>

        {/* Team Away */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {awayLogo ? (
              <img
                src={awayLogo}
                alt={match.team_away}
                className="h-6 w-6 shrink-0 object-contain drop-shadow-sm"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${awayInitials.gradient} text-[10px] font-black text-white shadow-sm`}
              >
                {awayInitials.initials}
              </div>
            )}
            <span
              className={`text-[15px] sm:text-base font-bold tracking-tight truncate ${
                awayFav ? "text-amber-300 font-extrabold" : "text-white"
              }`}
            >
              {match.team_away || "A definir"}
            </span>
          </div>
          {match.team_away && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(match.team_away);
              }}
              className="p-1 text-muted-foreground hover:text-amber-400 transition"
              title={awayFav ? "Remover dos favoritos" : "Favoritar time"}
            >
              <Star
                className={`h-3.5 w-3.5 ${awayFav ? "fill-amber-400 text-amber-400" : "opacity-30 group-hover:opacity-100"}`}
              />
            </button>
          )}
        </div>
      </div>

      {/* COMPACT BOTTOM ROW: Channels with identical uniform size & actions */}
      <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between gap-2">
        {/* Uniform channel badges (exact same height and font size) */}
        <div className="flex flex-wrap items-center gap-1.5 min-w-0 flex-1">
          {match.channels && match.channels.length > 0 ? (
            match.channels.map((ch, idx) => {
              const styles = getChannelBadgeStyles(ch.type);
              return (
                <div
                  key={`${ch.name}_${idx}`}
                  className={`inline-flex items-center justify-center h-6 px-2.5 rounded-md border text-[11px] font-black uppercase tracking-wider ${styles.bg} ${styles.border} ${styles.text}`}
                >
                  <ChannelLogo name={ch.name} className="h-3.5 w-auto" />
                </div>
              );
            })
          ) : (
            <span className="text-[11px] text-muted-foreground italic">A definir</span>
          )}
        </div>

        {/* Like counter and details chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike();
            }}
            className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-rose-400 transition p-1"
            title="Curtir jogo"
          >
            <Heart
              className={`h-3.5 w-3.5 ${isLiked ? "fill-rose-500 text-rose-500 animate-pulse" : ""}`}
            />
            <span>{likeCount}</span>
          </button>
          <ChevronRightIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// MATCH DETAILS FULL MODAL / PAGE
// ----------------------------------------------------------------------
function MatchDetailsModal({
  match,
  displayDate,
  onClose,
  isFavorite,
  onToggleFavorite,
  isLiked,
  likeCount,
  onToggleLike,
}: {
  match: MatchItem;
  displayDate?: string;
  onClose: () => void;
  isFavorite: (team: string) => boolean;
  onToggleFavorite: (team: string) => void;
  isLiked: boolean;
  likeCount: number;
  onToggleLike: () => void;
}) {
  const homeFav = isFavorite(match.team_home);
  const awayFav = isFavorite(match.team_away);

  const homeLogo = getTeamLogo(match.team_home);
  const awayLogo = getTeamLogo(match.team_away);

  const homeInitials = getTeamInitialsBadge(match.team_home);
  const awayInitials = getTeamInitialsBadge(match.team_away);

  const createGoogleCalendarLink = () => {
    try {
      const [year, month, day] = match.date.split("-");
      const [hh, mm] = match.time_br.split(":");
      const startHourUtc = (parseInt(hh, 10) + 3) % 24;
      const startHh = String(startHourUtc).padStart(2, "0");
      const startIso = `${year}${month}${day}T${startHh}${mm}00Z`;

      const endHourUtc = (startHourUtc + 2) % 24;
      const endHh = String(endHourUtc).padStart(2, "0");
      const endIso = `${year}${month}${day}T${endHh}${mm}00Z`;

      const title = `${match.match_title} (${match.championship})`;
      const channelsText = match.channels.map((c) => c.name).join(", ");
      const details = `Jogo de Futebol: ${match.match_title}\nCampeonato: ${match.championship}\nOnde Assistir: ${channelsText}\nHorário de Brasília: ${match.time_br}\n\nAcesse: https://jogosdehoje.lovable.app`;

      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        title
      )}&dates=${startIso}/${endIso}&details=${encodeURIComponent(details)}`;
    } catch {
      return "#";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 bg-[radial-gradient(ellipse_at_top,_oklch(0.78_0.22_145_/_0.25),_transparent_70%)] pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-border/70 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <Trophy className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                {match.championship}
              </p>
              <p className="text-[11px] text-muted-foreground">{displayDate}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-background/60 text-muted-foreground hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* HERO CONFRONTATION: Big Official Crests & Team Names */}
        <div className="relative z-10 my-6 rounded-2xl bg-gradient-to-b from-background/90 to-background/50 border border-border/80 p-5 text-center shadow-inner">
          <div className="flex items-center justify-around gap-2">
            {/* Team Home */}
            <div className="flex-1 flex flex-col items-center">
              <div className="relative mb-2">
                {homeLogo ? (
                  <img
                    src={homeLogo}
                    alt={match.team_home}
                    className="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-md"
                  />
                ) : (
                  <div
                    className={`flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${homeInitials.gradient} text-xl font-black text-white shadow-lg`}
                  >
                    {homeInitials.initials}
                  </div>
                )}
                {homeFav && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 shadow">
                    <Star className="h-3 w-3 fill-amber-950 text-amber-950" />
                  </span>
                )}
              </div>
              <h4 className="text-base sm:text-lg font-black text-white leading-tight">
                {match.team_home}
              </h4>
              <button
                type="button"
                onClick={() => onToggleFavorite(match.team_home)}
                className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold transition ${
                  homeFav
                    ? "bg-amber-400 text-amber-950"
                    : "bg-card text-muted-foreground border border-border hover:text-white"
                }`}
              >
                <Star className={`h-3 w-3 ${homeFav ? "fill-amber-950" : ""}`} />
                {homeFav ? "Favoritado" : "Favoritar"}
              </button>
            </div>

            {/* VS & Time */}
            <div className="flex flex-col items-center justify-center px-2">
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-sm font-black text-emerald-400">
                {match.time_br}
              </span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground mt-1 tracking-wider">
                Brasília
              </span>
              <span className="text-xs font-black text-muted-foreground/60 my-1">VS</span>
            </div>

            {/* Team Away */}
            <div className="flex-1 flex flex-col items-center">
              <div className="relative mb-2">
                {awayLogo ? (
                  <img
                    src={awayLogo}
                    alt={match.team_away}
                    className="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-md"
                  />
                ) : (
                  <div
                    className={`flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${awayInitials.gradient} text-xl font-black text-white shadow-lg`}
                  >
                    {awayInitials.initials}
                  </div>
                )}
                {awayFav && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 shadow">
                    <Star className="h-3 w-3 fill-amber-950 text-amber-950" />
                  </span>
                )}
              </div>
              <h4 className="text-base sm:text-lg font-black text-white leading-tight">
                {match.team_away || "A definir"}
              </h4>
              {match.team_away && (
                <button
                  type="button"
                  onClick={() => onToggleFavorite(match.team_away)}
                  className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold transition ${
                    awayFav
                      ? "bg-amber-400 text-amber-950"
                      : "bg-card text-muted-foreground border border-border hover:text-white"
                  }`}
                >
                  <Star className={`h-3 w-3 ${awayFav ? "fill-amber-950" : ""}`} />
                  {awayFav ? "Favoritado" : "Favoritar"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* WHERE TO WATCH: Uniform channel badges */}
        <div className="relative z-10 mb-5 rounded-2xl border border-border/80 bg-background/50 p-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Tv className="h-3.5 w-3.5 text-primary" /> Onde Assistir ao Vivo
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {match.channels.map((ch, idx) => {
              const styles = getChannelBadgeStyles(ch.type);
              return (
                <div
                  key={`${ch.name}_modal_${idx}`}
                  className={`flex items-center justify-between rounded-xl border p-2.5 ${styles.bg} ${styles.border}`}
                >
                  <div className="flex items-center gap-2">
                    <ChannelLogo name={ch.name} className="h-4 w-auto" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${styles.text}`}>
                    {styles.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="relative z-10 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onToggleLike}
            className={`flex flex-col items-center justify-center rounded-2xl border p-3 font-bold transition-all ${
              isLiked
                ? "bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)] scale-[1.02]"
                : "bg-card border-border text-foreground hover:bg-card/80 hover:border-rose-500/40"
            }`}
          >
            <Heart
              className={`h-5 w-5 mb-1 ${
                isLiked ? "fill-rose-500 text-rose-500 scale-110" : "text-muted-foreground"
              }`}
            />
            <span className="text-xs font-black">{isLiked ? "Curtido!" : "Curtir"}</span>
            <span className="text-[10px] text-muted-foreground">{likeCount} curtidas</span>
          </button>

          <button
            type="button"
            onClick={() => shareSingleMatchOnWhatsApp(match, displayDate)}
            className="flex flex-col items-center justify-center rounded-2xl border border-emerald-500/40 bg-emerald-600/20 p-3 font-bold text-emerald-300 hover:bg-emerald-600/30 hover:scale-[1.02] active:scale-95 transition"
          >
            <Share2 className="h-5 w-5 mb-1 text-emerald-400" />
            <span className="text-xs font-black">WhatsApp</span>
            <span className="text-[10px] text-emerald-400/80">Compartilhar</span>
          </button>

          <a
            href={createGoogleCalendarLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-3 font-bold text-foreground hover:bg-card/80 hover:border-primary/40 hover:scale-[1.02] active:scale-95 transition"
          >
            <Calendar className="h-5 w-5 mb-1 text-primary" />
            <span className="text-xs font-black">Lembrete</span>
            <span className="text-[10px] text-muted-foreground">Google Agenda</span>
          </a>
        </div>
      </div>
    </div>
  );
}
