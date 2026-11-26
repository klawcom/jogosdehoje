import { Link } from '@tanstack/react-router';
import { RefreshCw, Star, Sun, Moon, Trophy, Calendar } from 'lucide-react';
import { WhatsAppIcon } from './icons/whatsapp-icon';

interface SiteHeaderProps {
  activePage: 'matches' | 'brasileirao';
  lastUpdated: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  refreshTitle?: string;
  isDark: boolean;
  onToggleTheme: () => void;
  favoritesCount: number;
  onOpenFavorites?: () => void;
  onShareWhatsApp: () => void;
  shareTitle?: string;
}

/**
 * Shared sticky site header with navigation between Jogos de Hoje and Tabela Série A.
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
  onShareWhatsApp,
  shareTitle = 'Compartilhar no WhatsApp',
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/90 border-b border-border/80 px-4 pt-3 pb-2.5 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2.5 group min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-[0_0_15px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400/40 group-hover:scale-105 transition-transform">
              <span className="text-xl">⚽</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-black tracking-tight sm:text-xl text-foreground truncate">
                  Jogos <span className="text-primary font-black">de Hoje</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500 dark:text-emerald-400 border border-emerald-500/25 shrink-0">
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

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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

            <button
              type="button"
              onClick={onShareWhatsApp}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-500 active:scale-95 transition cursor-pointer"
              title={shareTitle}
            >
              <WhatsAppIcon className="h-4 w-4 fill-white" />
              <span className="font-bold hidden xs:inline sm:inline">WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav
          aria-label="Navegação principal"
          className="mt-2.5 flex items-center gap-1.5 rounded-xl bg-muted/50 p-1 border border-border/60"
        >
          <Link
            to="/"
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              activePage === 'matches'
                ? 'bg-card text-foreground shadow-sm border border-border/80'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className={`h-3.5 w-3.5 ${activePage === 'matches' ? 'text-primary' : ''}`} />
            <span>Jogos de Hoje</span>
          </Link>

          <Link
            to="/brasileirao"
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              activePage === 'brasileirao'
                ? 'bg-card text-foreground shadow-sm border border-border/80'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Trophy className={`h-3.5 w-3.5 ${activePage === 'brasileirao' ? 'text-amber-500' : ''}`} />
            <span>Tabela Brasileirão A</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

