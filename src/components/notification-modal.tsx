import { useState } from 'react';
import {
  Bell,
  BellRing,
  CheckCircle2,
  AlertTriangle,
  Send,
  Star,
  Trophy,
  Smartphone,
  ShieldCheck,
  X,
  Loader2,
  Sparkles,
  Lock,
  LogIn,
  User,
  Volume2,
  VolumeX,
  Play,
} from 'lucide-react';
import {
  usePushNotifications,
  NotificationPreferences,
} from '../lib/push-notifications';
import { TeamBadge } from './team-badge';
import { useAuth } from '../lib/auth';
import { AuthModal } from './auth-modal';
import {
  getWhistleVolume,
  setWhistleVolume,
  isWhistleEnabled,
  setWhistleEnabled,
  playRefereeWhistle,
} from '../lib/whistle-audio';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: string[];
  favoriteChampionships?: string[];
  onOpenFavorites?: () => void;
}

export function NotificationModal({
  isOpen,
  onClose,
  favorites,
  favoriteChampionships = [],
  onOpenFavorites,
}: NotificationModalProps) {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    preferences,
    updatePreference,
    toggleSubscription,
    sendLocalTestNotification,
  } = usePushNotifications();

  const { user, isAuthenticated, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Som de Apito de Futebol (Personalizável, baixo por padrão em 25%)
  const [whistleOn, setWhistleOn] = useState(() => isWhistleEnabled());
  const [whistleVol, setWhistleVol] = useState(() => getWhistleVolume());
  const [isPlayingWhistle, setIsPlayingWhistle] = useState(false);

  if (!isOpen) return null;

  const handleToggle = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    setFeedbackMessage(null);
    const result = await toggleSubscription(favorites, favoriteChampionships);
    setFeedbackMessage(result.message);
  };

  const handleTestNotification = async () => {
    setTestSent(true);
    if (whistleOn) {
      playRefereeWhistle(whistleVol);
    }
    const sampleTeam = favorites.length > 0 ? favorites[0] : 'Flamengo';
    await sendLocalTestNotification(sampleTeam);
    setTimeout(() => setTestSent(false), 3000);
  };

  const handlePlayWhistleTest = async () => {
    setIsPlayingWhistle(true);
    await playRefereeWhistle(whistleVol);
    setTimeout(() => setIsPlayingWhistle(false), 600);
  };

  const handleWhistleToggle = (enabled: boolean) => {
    setWhistleOn(enabled);
    setWhistleEnabled(enabled);
  };

  const handleWhistleVolumeChange = (vol: number) => {
    setWhistleVol(vol);
    setWhistleVolume(vol);
  };

  const prefItems: Array<{
    key: keyof NotificationPreferences;
    title: string;
    description: string;
    icon: string;
  }> = [
    {
      key: 'notify_pregame',
      title: 'Jogo em 10 minutos',
      description: 'Lembrete antes da bola rolar com os canais de TV e streaming',
      icon: '🔔',
    },
    {
      key: 'notify_goals',
      title: 'Gols e Placar em Tempo Real',
      description: 'Notificação imediata a cada gol do seu time',
      icon: '⚽',
    },
    {
      key: 'notify_kickoff',
      title: 'Início da Partida',
      description: 'Aviso do apito inicial assim que o jogo começar',
      icon: '⏱️',
    },
    {
      key: 'notify_lineups',
      title: 'Escalações Oficiais',
      description: 'Quem vai para o jogo cerca de 45 a 60 minutos antes',
      icon: '📋',
    },
    {
      key: 'notify_end',
      title: 'Fim de Jogo e Placar Final',
      description: 'Resumo com resultado ao término do confronto',
      icon: '🏁',
    },
    {
      key: 'notify_table_change',
      title: 'Mudança na Tabela do Brasileirão',
      description: 'Alerta quando o seu time sobe ou cai de posição',
      icon: '📈',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-3.5 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl border border-emerald-500/30 bg-card shadow-2xl overflow-hidden ring-1 ring-border text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="relative px-5 py-4 border-b border-border bg-muted/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/20">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                Alertas e Notificações
              </h3>
              <p className="text-xs text-muted-foreground">
                Receba gols e jogos no celular mesmo com o app fechado
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

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 space-y-5">
          {/* Account Authentication Banner */}
          {!isAuthenticated ? (
            <div className="rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/10 via-emerald-500/10 to-primary/10 p-4 space-y-3 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black shadow-md">
                  <Lock className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-xs sm:text-sm text-foreground">
                    Login Necessário para Receber Alertas
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Conecte sua conta com <strong>Google</strong>, <strong>Microsoft</strong>, <strong>Apple</strong> ou código no <strong>E-mail</strong> para receber alertas no celular.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 px-4 text-xs font-black text-primary-foreground shadow-md hover:opacity-95 transition cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                <span>Entrar com Google, Microsoft, Apple ou E-mail</span>
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-500/35 bg-emerald-500/10 p-3.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white font-black">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-foreground truncate flex items-center gap-1.5">
                    {user?.name}
                    <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
                      {user?.provider.toUpperCase()}
                    </span>
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {user?.email || 'Conta conectada aos alertas'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={signOut}
                className="text-[11px] font-bold text-destructive hover:underline shrink-0 cursor-pointer"
              >
                Sair
              </button>
            </div>
          )}

          {/* Status Banner */}
          {!isSupported ? (
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3.5 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <p className="font-bold">Notificações Push não suportadas neste navegador.</p>
                <p className="mt-0.5 text-muted-foreground">
                  No iPhone, instale o app adicionando à Tela de Início (Safari) para ativar os alertas.
                </p>
              </div>
            </div>
          ) : permission === 'denied' ? (
            <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-3.5 flex items-start gap-3 text-xs text-red-700 dark:text-red-300">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
              <div>
                <p className="font-bold">Notificações bloqueadas pelo navegador.</p>
                <p className="mt-0.5 text-muted-foreground">
                  Para receber alertas, toque no ícone de cadeado na barra de endereço do navegador e mude Notificações para Permitir.
                </p>
              </div>
            </div>
          ) : (
            <div className={`rounded-2xl border p-4 transition-all ${
              isSubscribed
                ? 'bg-emerald-500/10 border-emerald-500/40'
                : 'bg-muted/50 border-border'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    isSubscribed
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {isSubscribed ? <CheckCircle2 className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">
                      {isSubscribed ? 'Alertas Ativos no seu Dispositivo' : 'Alertas Desativados'}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {isSubscribed
                        ? 'Você receberá avisos em tempo real.'
                        : 'Ative para não perder nenhum lance do seu time.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggle}
                  disabled={isLoading}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer ${
                    isSubscribed
                      ? 'bg-muted hover:bg-destructive/15 text-muted-foreground hover:text-destructive border border-border'
                      : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-emerald-600/30'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isSubscribed ? (
                    'Desativar'
                  ) : (
                    'Ativar Alertas no Celular'
                  )}
                </button>
              </div>

              {feedbackMessage && (
                <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {feedbackMessage}
                </p>
              )}
            </div>
          )}

          {/* Times e Campeonatos Monitorados */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Seus Alertas de Times & Campeonatos
                </h4>
              </div>
              {onOpenFavorites && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenFavorites();
                  }}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  Gerenciar
                </button>
              )}
            </div>

            {/* Times */}
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">
                Times ({favorites.length}):
              </p>
              {favorites.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {favorites.map((team) => (
                    <div
                      key={team}
                      className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/60 px-2.5 py-1 text-xs font-bold"
                    >
                      <TeamBadge teamName={team} size="sm" />
                      <span>{team}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Nenhum time individual selecionado.</p>
              )}
            </div>

            {/* Campeonatos */}
            <div className="pt-2 border-t border-border/50">
              <p className="text-[11px] font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5 text-amber-500" />
                Campeonatos com alerta para todos os jogos ({favoriteChampionships.length}):
              </p>
              {favoriteChampionships.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {favoriteChampionships.map((champ) => (
                    <span
                      key={champ}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300"
                    >
                      <span>🏆</span>
                      <span>{champ}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Nenhum campeonato completo selecionado.</p>
              )}
            </div>

            {favorites.length === 0 && favoriteChampionships.length === 0 && onOpenFavorites && (
              <div className="rounded-xl border border-dashed border-border p-3 text-center">
                <p className="text-xs text-muted-foreground">
                  Você ainda não escolheu times ou campeonatos.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenFavorites();
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-400/30 transition cursor-pointer"
                >
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  Escolher times e campeonatos
                </button>
              </div>
            )}
          </div>

          {/* Tipos de Alertas Personalizáveis */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              O que você deseja receber:
            </h4>

            <div className="grid gap-2">
              {prefItems.map((item) => {
                const checked = preferences[item.key];
                return (
                  <label
                    key={item.key}
                    className={`flex items-start justify-between gap-3 rounded-2xl border p-3 cursor-pointer transition-colors ${
                      checked
                        ? 'border-emerald-500/35 bg-emerald-500/5'
                        : 'border-border bg-card/60 opacity-75'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="text-lg leading-none select-none">{item.icon}</span>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-foreground">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground leading-snug">
                          {item.description}
                        </div>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => updatePreference(item.key, e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary accent-emerald-500 cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* SOM DO APITO CLÁSSICO DE ÁRBITRO DE FUTEBOL */}
          <div className="rounded-2xl border border-emerald-500/30 bg-card p-4 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  {whistleOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div>
                  <h4 className="text-xs font-black text-foreground flex items-center gap-1.5">
                    Som de Apito do Árbitro
                    <span className="rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 text-[9px] font-bold">
                      Futebol
                    </span>
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Apito clássico de futebol ao receber notificações e gols
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={whistleOn}
                  onChange={(e) => handleWhistleToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
              </label>
            </div>

            {whistleOn && (
              <div className="space-y-2 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-semibold">
                    Volume: <strong className="text-foreground">{Math.round(whistleVol * 100)}%</strong> {whistleVol <= 0.3 ? '(Suave / Baixo)' : whistleVol <= 0.7 ? '(Médio)' : '(Alto)'}
                  </span>

                  <button
                    type="button"
                    onClick={handlePlayWhistleTest}
                    disabled={isPlayingWhistle}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 text-[11px] font-extrabold hover:bg-emerald-500/25 transition cursor-pointer"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>{isPlayingWhistle ? 'Tocando...' : 'Ouvir Apito'}</span>
                  </button>
                </div>

                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={whistleVol}
                  onChange={(e) => handleWhistleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Botão de Teste no Celular */}
          <div className="rounded-2xl border border-border bg-muted/40 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <Smartphone className="h-4 w-4 text-primary shrink-0" />
              <span>Quer ver como a notificação aparece no seu celular?</span>
            </div>

            <button
              type="button"
              onClick={handleTestNotification}
              disabled={testSent}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:border-primary/60 hover:bg-muted transition cursor-pointer shrink-0"
            >
              <Send className="h-3.5 w-3.5 text-primary" />
              <span>{testSent ? '✓ Alerta Enviado!' : 'Testar Notificação'}</span>
            </button>
          </div>
        </div>

        {/* Bottom Trust Footer */}
        <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-between text-[11px] text-muted-foreground shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>100% Gratuito • Sem propagandas chatas</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-foreground hover:text-primary transition cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>

      {/* Auth Modal Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          handleToggle();
        }}
        title="Entre para Ativar Notificações"
        subtitle="Conecte sua conta para garantir que você receba todos os gols, escalações e partidas em tempo real."
      />
    </div>
  );
}
