import { Star, X } from 'lucide-react';
import { TeamBadge } from './team-badge';

const POPULAR_TEAMS = [
  'Flamengo',
  'Grêmio',
  'Palmeiras',
  'Corinthians',
  'São Paulo',
  'Vasco',
  'Fluminense',
  'Botafogo',
  'Internacional',
  'Cruzeiro',
  'Atlético-MG',
  'Santos',
  'Coritiba',
  'América-MG',
  'Cuiabá',
  'Juventude',
  'Náutico',
  'Bahia',
  'Athletico-PR',
  'Bragantino',
  'Vitória',
  'Mirassol',
  'Real Madrid',
  'Barcelona',
  'Boca Juniors',
  'River Plate',
];

/**
 * Shared modal to select and manage favorite clubs (persisted via localStorage).
 */
export function FavoritesModal({
  isOpen,
  onClose,
  favorites,
  isFavorite,
  onToggleFavorite,
}: {
  isOpen: boolean;
  onClose: () => void;
  favorites: string[];
  isFavorite: (team: string) => boolean;
  onToggleFavorite: (team: string) => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl animate-in fade-in zoom-in-95"
      >
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            <h3 className="font-extrabold text-base text-foreground">
              Meus Times Favoritos
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3">
          <p className="text-xs text-muted-foreground mb-3">
            Selecione seus clubes para destacar jogos e posições na tabela:
          </p>

          <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto p-1">
            {POPULAR_TEAMS.map((team) => {
              const active = isFavorite(team);
              return (
                <button
                  key={team}
                  type="button"
                  onClick={() => onToggleFavorite(team)}
                  className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                    active
                      ? 'bg-amber-400 text-amber-950 shadow-md ring-2 ring-amber-300'
                      : 'bg-background/80 text-foreground border border-border hover:border-primary/50'
                  }`}
                >
                  <TeamBadge teamName={team} size="sm" />
                  <span>{team}</span>
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
                    className="inline-flex items-center gap-1 rounded-md bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-500/35 px-2 py-0.5 text-[11px] font-semibold"
                  >
                    {f}
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(f)}
                      className="hover:text-foreground cursor-pointer"
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
            onClick={onClose}
            className="w-full rounded-xl bg-primary py-2.5 text-center text-xs font-extrabold text-primary-foreground shadow hover:opacity-95 transition cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}

