import { useState, useEffect, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import {
  RefreshCw,
  Star,
  Sun,
  Moon,
  Trophy,
  Calendar,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

export type ActiveSitePage = 'matches' | 'brasileirao';

interface NavPageItem {
  id: ActiveSitePage;
  to: '/' | '/brasileirao';
  label: string;
  shortLabel: string;
  description: string;
  icon: typeof Calendar;
  accentClass: string;
}

const NAV_PAGES: NavPageItem[] = [
  {
    id: 'matches',
    to: '/',
    label: 'Jogos de Hoje',
    shortLabel: 'Jogos de Hoje',
    description: 'Horários de Brasília, canais de TV e placares ao vivo',
    icon: Calendar,
    accentClass: 'text-primary',
  },
  {
    id: 'brasileirao',
    to: '/brasileirao',
    label: 'Brasileirão Série A',
    shortLabel: 'Brasileirão Série A',
    description: 'Classificação, artilharia, assistências e estatísticas',
    icon: Trophy,
    accentClass: 'text-amber-500',
  },
];

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
}

/**
 * Shared responsive site header:
 * - Desktop: balanced single row with brand left, nav tabs center, actions + Menu right
 * - Mobile: compact top bar + full-width quick page switcher below
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

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/90 border-b border-border/80 px-3.5 py-2.5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-3">
          {/* Brand + Live Timestamp */}
          <Link to="/" className="flex items-center gap-2.5 group min-w-0 shrink-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-[0_0_15px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400/40 group-hover:scale-105 transition-transform">
              <span className="text-xl">⚽</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-foreground truncate">
                  Jogos <span className="text-primary font-black">de Hoje</span>
                </h1>
                <span className="hidden xl:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500 dark:text-emerald-400 border border-emerald-500/25 shrink-0">
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
            className="hidden md:flex items-center gap-1 rounded-xl bg-muted/60 p-1 border border-border/70"
          >
            {NAV_PAGES.map((page) => {
              const Icon = page.icon;
              const isActive = activePage === page.id;
              return (
                <Link
                  key={page.id}
                  to={page.to}
                  className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                    isActive
                      ? 'bg-card text-foreground shadow-sm border border-border/80'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? page.accentClass : ''}`} />
                  <span>{page.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Theme + Favorites + Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0" ref={menuContainerRef}>
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card/70 text-foreground backdrop-blur hover:border-primary/50 hover:bg-card transition cursor-pointer"
              title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
              aria-label="Alternar tema claro e escuro"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-600" />
              )}
            </button>

            {onOpenFavorites && (
              <button
                type="button"
                onClick={onOpenFavorites}
                className="relative flex items-center gap-1.5 rounded-xl border border-border bg-card/70 px-2.5 sm:px-3 py-2 text-xs font-bold text-foreground backdrop-blur hover:border-primary/50 hover:bg-card transition cursor-pointer"
                title="Meus times favoritos"
              >
                <Star
                  className={`h-4 w-4 ${favoritesCount > 0 ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`}
                />
                <span className="hidden sm:inline">Favoritos</span>
                {favoritesCount > 0 && (
                  <span className="rounded-full bg-amber-400/20 px-1.5 py-0.2 text-[10px] font-bold text-amber-700 dark:text-amber-300">
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
                    ? 'border-primary bg-primary/15 text-primary shadow-sm'
                    : 'border-border bg-card/80 text-foreground hover:border-primary/50 hover:bg-card'
                }`}
              >
                {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                <span>Menu</span>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border border-border bg-card/98 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95"
                >
                  <div className="px-2.5 py-1.5 border-b border-border/60 mb-1.5 flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      Navegação do Site
                    </span>
                    <span className="text-[10px] font-semibold text-primary">
                      {NAV_PAGES.length} seções
                    </span>
                  </div>

                  <div className="space-y-1">
                    {NAV_PAGES.map((page) => {
                      const Icon = page.icon;
                      const isActive = activePage === page.id;
                      return (
                        <Link
                          key={page.id}
                          to={page.to}
                          role="menuitem"
                          onClick={() => setMenuOpen(false)}
                          className={`flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition ${
                            isActive
                              ? 'bg-primary/15 border border-primary/30 text-foreground'
                              : 'hover:bg-muted/60 text-foreground border border-transparent'
                          }`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                              isActive
                                ? 'bg-primary/20 border-primary/40'
                                : 'bg-background/70 border-border/70'
                            }`}
                          >
                            <Icon className={`h-4 w-4 ${page.accentClass}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-extrabold truncate">{page.label}</p>
                              {isActive && (
                                <span className="rounded-full bg-primary/20 px-1.5 py-0.2 text-[9px] font-black uppercase text-primary">
                                  Atual
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {page.description}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Quick Navigation Tabs */}
        <nav
          aria-label="Navegação rápida"
          className="mt-2.5 flex md:hidden items-center gap-1 rounded-xl bg-muted/50 p-1 border border-border/60"
        >
          {NAV_PAGES.map((page) => {
            const Icon = page.icon;
            const isActive = activePage === page.id;
            return (
              <Link
                key={page.id}
                to={page.to}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-card text-foreground shadow-sm border border-border/80'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? page.accentClass : ''}`} />
                <span>{page.shortLabel}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
