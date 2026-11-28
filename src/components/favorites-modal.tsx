import { useState, useMemo } from 'react';
import { Star, Trophy, X, Search, Check, Globe } from 'lucide-react';
import { TeamBadge } from './team-badge';
import {
  WORLD_CHAMPIONSHIPS,
  WORLD_TEAMS_CATALOG,
  normalizeChampionshipName,
} from '../lib/world-teams';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: string[];
  isFavorite: (team: string) => boolean;
  onToggleFavorite: (team: string) => void;
  favoriteChampionships?: string[];
  isFavoriteChampionship?: (champ: string) => boolean;
  onToggleFavoriteChampionship?: (champ: string) => void;
  onOpenNotifications?: () => void;
}

export function FavoritesModal({
  isOpen,
  onClose,
  favorites,
  isFavorite,
  onToggleFavorite,
  favoriteChampionships = [],
  isFavoriteChampionship,
  onToggleFavoriteChampionship,
  onOpenNotifications,
}: FavoritesModalProps) {
  const [activeTab, setActiveTab] = useState<'teams' | 'championships'>('teams');
  const [selectedRegionIdx, setSelectedRegionIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Busca rápida de times
  const filteredTeams = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return WORLD_TEAMS_CATALOG[selectedRegionIdx]?.teams || [];
    }
    // Se digitou algo na busca, pesquisa em todas as ligas mundiais
    const results: string[] = [];
    for (const group of WORLD_TEAMS_CATALOG) {
      for (const team of group.teams) {
        if (team.toLowerCase().includes(q) && !results.includes(team)) {
          results.push(team);
        }
      }
    }
    return results;
  }, [searchQuery, selectedRegionIdx]);

  // Busca rápida de campeonatos
  const filteredChampionships = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return WORLD_CHAMPIONSHIPS;
    return WORLD_CHAMPIONSHIPS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.aliases.some((a) => a.includes(q))
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  const totalSelections = favorites.length + favoriteChampionships.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-border bg-card shadow-2xl overflow-hidden ring-1 ring-border text-foreground"
      >
        {/* Top Header */}
        <div className="relative px-5 py-4 border-b border-border bg-muted/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950 font-black shadow-md shadow-amber-500/20">
              <Star className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                Meus Favoritos e Alertas
              </h3>
              <p className="text-xs text-muted-foreground">
                Escolha seus times ou campeonatos para receber notificações
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher: Times x Campeonatos */}
        <div className="px-5 pt-3 shrink-0">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/70 border border-border">
            <button
              type="button"
              onClick={() => {
                setActiveTab('teams');
                setSearchQuery('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'teams'
                  ? 'bg-card text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Star className="h-4 w-4 text-amber-400" />
              <span>Times Favoritos</span>
              {favorites.length > 0 && (
                <span className="rounded-full bg-amber-400/25 px-1.5 py-0.2 text-[10px] font-black text-amber-800 dark:text-amber-300">
                  {favorites.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('championships');
                setSearchQuery('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'championships'
                  ? 'bg-card text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>Alertas por Campeonato</span>
              {favoriteChampionships.length > 0 && (
                <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                  {favoriteChampionships.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-5 pt-3 pb-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'teams'
                  ? 'Buscar clube no mundo (ex: Flamengo, Real Madrid, City, PSG, Bayern)...'
                  : 'Buscar campeonato (ex: Champions, Brasileirão, Premier League, Libertadores)...'
              }
              className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-8 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-5 py-2 space-y-4">
          {activeTab === 'teams' ? (
            <>
              {/* Region / League Tabs when not searching */}
              {!searchQuery && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {WORLD_TEAMS_CATALOG.map((group, idx) => (
                    <button
                      key={group.region}
                      type="button"
                      onClick={() => setSelectedRegionIdx(idx)}
                      className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                        selectedRegionIdx === idx
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <span>{group.flag}</span>
                      <span>{group.region}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Grid of Teams */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filteredTeams.map((team) => {
                  const active = isFavorite(team);
                  return (
                    <button
                      key={team}
                      type="button"
                      onClick={() => onToggleFavorite(team)}
                      className={`flex items-center justify-between gap-2 rounded-2xl p-2.5 text-left text-xs font-bold transition cursor-pointer border ${
                        active
                          ? 'border-amber-400 bg-amber-400/15 text-amber-900 dark:text-amber-200 ring-1 ring-amber-400 shadow-sm'
                          : 'border-border bg-muted/30 text-foreground hover:border-primary/50 hover:bg-muted/70'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <TeamBadge teamName={team} size="sm" />
                        <span className="truncate">{team}</span>
                      </div>
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                          active
                            ? 'border-amber-500 bg-amber-400 text-amber-950'
                            : 'border-border bg-card text-transparent'
                        }`}
                      >
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {filteredTeams.length === 0 && (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  Nenhum time encontrado para &quot;{searchQuery}&quot;.
                </div>
              )}
            </>
          ) : (
            /* Championships Section */
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ao favoritar um campeonato, você receberá alertas de <strong>todas as partidas</strong> dessa competição (gols, início de jogo e fim de partida no celular).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredChampionships.map((champ) => {
                  const isChecked = isFavoriteChampionship
                    ? isFavoriteChampionship(champ.name)
                    : favoriteChampionships.includes(champ.name);

                  return (
                    <button
                      key={champ.id}
                      type="button"
                      onClick={() => {
                        if (onToggleFavoriteChampionship) {
                          onToggleFavoriteChampionship(champ.name);
                        }
                      }}
                      className={`flex items-center justify-between gap-3 rounded-2xl p-3 text-left transition cursor-pointer border ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-500/15 text-foreground ring-1 ring-emerald-500 shadow-sm'
                          : 'border-border bg-muted/30 text-foreground hover:border-emerald-500/40 hover:bg-muted/70'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl select-none">{champ.flag}</span>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-extrabold truncate">
                            {champ.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {champ.country} • Todos os jogos
                          </p>
                        </div>
                      </div>

                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-xl border transition ${
                          isChecked
                            ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm'
                            : 'border-border bg-card text-transparent'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Selections Summary & Action */}
        <div className="px-5 py-3.5 border-t border-border bg-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Globe className="h-4 w-4 text-primary shrink-0" />
            <span>
              {favorites.length} time(s) e {favoriteChampionships.length} campeonato(s) selecionados.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenNotifications && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenNotifications();
                }}
                className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition cursor-pointer"
              >
                Configurar Alertas Push
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-primary px-5 py-2 text-xs font-extrabold text-primary-foreground shadow hover:opacity-95 transition cursor-pointer"
            >
              Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
