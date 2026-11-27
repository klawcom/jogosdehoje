import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import {
  RefreshCw,
  Star,
  Sun,
  Moon,
  Trophy,
  Calendar,
  BarChart3,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { DaySchedule } from '../lib/types';
import { getBrasiliaDateString } from '../lib/scraper';

export type ActiveSitePage = 'matches' | 'brasileirao';

interface MenuDateOption {
  date: string;
  shortDate: string;
  label: string;
  sublabel: string;
  matchCount?: number;
}

function buildFallbackMenuDates(): MenuDateOption[] {
  const todayStr = getBrasiliaDateString();
  const [y, m, d] = todayStr.split('-').map((n) => parseInt(n, 10));
  const baseMs = Date.UTC(y, m - 1, d, 12, 0, 0);
  const oneDay = 86_400_000;

  return [0, 1, 2].map((offset) => {
    const dt = new Date(baseMs + offset * oneDay);
    const iso = dt.toISOString().slice(0, 10);
    const [, mm, dd] = iso.split('-');
    const shortDate = `${dd}/${mm}`;
    const rawDow = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      timeZone: 'UTC',
    }).format(dt);
    const dow = rawDow.charAt(0).toUpperCase() + rawDow.slice(1);

    const label =
      offset === 0
        ? `Jogos de Hoje (${shortDate})`
        : offset === 1
        ? `Jogos de Amanhã (${shortDate})`
        : `Jogos de ${dow} (${shortDate})`;

    const sublabel =
      offset === 0
        ? `${dow} • Programação de hoje`
        : offset === 1
        ? `${dow} • Programação de amanhã`
        : `Programação de ${dow.toLowerCase()}`;

    return { date: iso, shortDate, label, sublabel };
  });
}

interface SiteHeaderProps {
  activePage: ActiveSitePage;
  lastUpdated: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  refreshTitle?: string;
  isDark: boolean;
  onToggleTheme: () => void;
  favoritesCount: number;
  onOpenFavorites?: () => void;
  days?: DaySchedule[];
  selectedDate?: string;
  onSelectDate?: (dateStr: string) => void;
}

/**
 * Shared responsive site header with stadium-themed styling and complete dated navigation menu.
 */
export function SiteHeader({
  activePage,
  lastUpdated,
  isRefreshing,
  onRefresh,
  refreshTitle = 'Atualizar agora',
  isDark,
  onToggleTheme,
  favoritesCount,
  onOpenFavorites,
  days,
  selectedDate,
  onSelectDate,
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const dateMenuItems = useMemo<MenuDateOption[]>(() => {
    if (days && days.length > 0) {
      return days.map((day) => {
        const label = day.isToday
          ? `Jogos de Hoje (${day.shortDate})`
          : day.isTomorrow
          ? `Jogos de Amanhã (${day.shortDate})`
          : `Jogos de ${day.dayOfWeek} (${day.shortDate})`;

        return {
          date: day.date,
          shortDate: day.shortDate,
          label,
          sublabel: day.displayDate,
          matchCount: day.matches.length,
        };
      });
    }
    return buildFallbackMenuDates();
  }, [days]);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-card/85 dark:bg-card/80 border-b border-border px-3.5 py-2.5 sm:px-6 lg:px-8 shadow-sm">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-3">
          {/* Brand + Live Timestamp */}
          <Link to="/" className="flex items-center gap-2.5 group min-w-0 shrink-0">
            <img
              src="/logo.png"
              alt="Logo Jogos de Hoje"
              className="h-10 w-10 shrink-0 rounded-xl object-cover shadow-[0_0_16px_rgba(16,185,129,0.4)] ring-1 ring-emerald-400/60 group-hover:scale-105 transition-transform"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-foreground truncate">
                  Jogos <span className="text-primary font-black">de Hoje</span>
                </h1>
                <span className="hidden xl:inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/35 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                  Brasília (UTC-3)
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                <span>Atualizado às</span>
                <strong className="text-foreground font-semibold">{lastUpdated}</strong>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRefresh();
                  }}
                  disabled={isRefreshing}
                  title={refreshTitle}
                  className="inline-flex items-center text-primary hover:text-emerald-500 dark:hover:text-emerald-300 transition-colors ml-0.5 p-0.5 rounded cursor-pointer"
                >
                  <RefreshCw
                    className={`h-3 w-3 ${isRefreshing ? 'animate-spin text-emerald-500 dark:text-emerald-400' : ''}`}
                  />
                </button>
              </div>
            </div>
          </Link>

          {/* Desktop Center Navigation */}
          <nav
            aria-label="Navegação desktop"
            className="hidden md:flex items-center gap-1 rounded-xl bg-muted/80 p-1 border border-border"
          >
            <Link
              to="/"
              className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                activePage === 'matches'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>Jogos de Hoje</span>
            </Link>

            <Link
              to="/brasileirao"
              className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                activePage === 'brasileirao'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Trophy
                className={`h-3.5 w-3.5 shrink-0 ${
                  activePage === 'brasileirao' ? '' : 'text-amber-500'
                }`}
              />
              <span>Brasileirão Série A</span>
            </Link>
          </nav>

          {/* Right Controls: Theme + Favorites + Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0" ref={menuContainerRef}>
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background/70 text-foreground hover:border-primary/60 hover:bg-background transition cursor-pointer"
              title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
              aria-label="Alternar tema claro e escuro"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-emerald-700" />
              )}
            </button>

            {onOpenFavorites && (
              <button
                type="button"
                onClick={onOpenFavorites}
                className="relative flex items-center gap-1.5 rounded-xl border border-border bg-background/70 px-2.5 sm:px-3 py-2 text-xs font-bold text-foreground hover:border-amber-400/60 hover:bg-background transition cursor-pointer"
                title="Meus times favoritos"
              >
                <Star
                  className={`h-4 w-4 ${favoritesCount > 0 ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`}
                />
                <span className="hidden sm:inline">Favoritos</span>
                {favoritesCount > 0 && (
                  <span className="rounded-full bg-amber-400/25 px-1.5 py-0.2 text-[10px] font-extrabold text-amber-800 dark:text-amber-300">
                    {favoritesCount}
                  </span>
                )}
              </button>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label="Abrir menu de navegação"
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition cursor-pointer ${
                  menuOpen
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-background/80 text-foreground hover:border-primary/60 hover:bg-background'
                }`}
              >
                {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                <span>Menu</span>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[80vh] overflow-y-auto rounded-2xl border border-border bg-card/98 p-2.5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95"
                >
                  {/* Group 1: Programação por Data */}
                  <div className="px-2 py-1 flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                      Programação por Data
                    </span>
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      Horário de Brasília
                    </span>
                  </div>

                  <div className="mt-1 space-y-1">
                    {dateMenuItems.map((item) => {
                      const isActive =
                        activePage === 'matches' && selectedDate === item.date;
                      return (
                        <Link
                          key={item.date}
                          to="/"
                          search={{ date: item.date }}
                          role="menuitem"
                          onClick={() => {
                            if (onSelectDate) onSelectDate(item.date);
                            setMenuOpen(false);
                          }}
                          className={`flex items-center gap-3 rounded-xl px-2.5 py-2 transition ${
                            isActive
                              ? 'bg-emerald-500/15 border border-emerald-500/40 text-foreground'
                              : 'hover:bg-muted/70 text-foreground border border-transparent'
                          }`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-[11px] font-black ${
                              isActive
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            }`}
                          >
                            {item.shortDate}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-extrabold truncate">{item.label}</p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {item.sublabel}
                            </p>
                          </div>
                          {typeof item.matchCount === 'number' && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground shrink-0">
                              {item.matchCount}
                            </span>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </Link>
                      );
                    })}
                  </div>

                  {/* Group 2: Campeonatos e Classificação */}
                  <div className="mt-2.5 pt-2 border-t border-border/70 px-2 py-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Campeonatos & Estatísticas
                    </span>
                  </div>

                  <div className="mt-1 space-y-1">
                    <Link
                      to="/brasileirao"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-2.5 py-2 transition ${
                        activePage === 'brasileirao'
                          ? 'bg-amber-500/15 border border-amber-500/40 text-foreground'
                          : 'hover:bg-muted/70 text-foreground border border-transparent'
                      }`}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-500/35 bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        <Trophy className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-extrabold truncate">
                          Brasileirão Série A — Tabela
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          Classificação, G-4, Z-4 e pontuação ao vivo
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </Link>

                    <Link
                      to="/brasileirao"
                      search={{ tab: 'estatisticas' }}
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-2.5 py-2 transition hover:bg-muted/70 text-foreground border border-transparent"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-500/35 bg-sky-500/15 text-sky-600 dark:text-sky-400">
                        <BarChart3 className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-extrabold truncate">
                          Brasileirão Série A — Estatísticas
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          Artilharia, assistências, cartões e clubes
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Quick Navigation Tabs */}
        <nav
          aria-label="Navegação rápida"
          className="mt-2.5 flex md:hidden items-center gap-1 rounded-xl bg-muted/80 p-1 border border-border"
        >
          <Link
            to="/"
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition whitespace-nowrap ${
              activePage === 'matches'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>Jogos de Hoje</span>
          </Link>

          <Link
            to="/brasileirao"
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition whitespace-nowrap ${
              activePage === 'brasileirao'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Trophy
              className={`h-3.5 w-3.5 shrink-0 ${
                activePage === 'brasileirao' ? '' : 'text-amber-500'
              }`}
            />
            <span>Brasileirão Série A</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
