import { useState } from 'react';
import {
  Bell,
  BellRing,
  CheckCircle2,
  AlertTriangle,
  Send,
  Star,
  Smartphone,
  ShieldCheck,
  X,
  Loader2,
  Sparkles,
} from 'lucide-react';
import {
  usePushNotifications,
  NotificationPreferences,
} from '../lib/push-notifications';
import { TeamBadge } from './team-badge';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: string[];
  onOpenFavorites?: () => void;
}

export function NotificationModal({
  isOpen,
  onClose,
  favorites,
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

  const [testSent, setTestSent] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggle = async () => {
    setFeedbackMessage(null);
    const result = await toggleSubscription(favorites);
    setFeedbackMessage(result.message);
  };

  const handleTestNotification = async () => {
    setTestSent(true);
    const sampleTeam = favorites.length > 0 ? favorites[0] : 'Flamengo';
    await sendLocalTestNotification(sampleTeam);
    setTimeout(() => setTestSent(false), 3000);
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

          {/* Times Favoritos Vinculados */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Seus Times Monitorados
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
                  {favorites.length > 0 ? 'Alterar Times' : '+ Escolher Times'}
                </button>
              )}
            </div>

            {favorites.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
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
              <div className="rounded-xl border border-dashed border-border p-3 text-center">
                <p className="text-xs text-muted-foreground">
                  Nenhum time favoritado ainda. Você receberá notificações dos principais jogos do dia.
                </p>
                {onOpenFavorites && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenFavorites();
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-400/30 transition cursor-pointer"
                  >
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    Escolher meus times agora
                  </button>
                )}
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
    </div>
  );
}
