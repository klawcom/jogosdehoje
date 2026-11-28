import { useState, useEffect } from 'react';
import { Users, X, Bell, BellRing, Clock, AlertCircle, ShieldCheck } from 'lucide-react';
import { MatchItem } from '../lib/types';
import { TeamBadge } from './team-badge';
import { getMatchStatus } from '../lib/match-status';

interface LineupModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: MatchItem | null;
  displayDate?: string;
  hasMatchAlert: boolean;
  onToggleMatchAlert: () => void;
}

export function LineupModal({
  isOpen,
  onClose,
  match,
  displayDate,
  hasMatchAlert,
  onToggleMatchAlert,
}: LineupModalProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'away'>('home');

  if (!isOpen || !match) return null;

  const status = getMatchStatus(match);
  const isStartedOrLive = status.isLive || status.isFinished;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl border border-border bg-card shadow-2xl overflow-hidden ring-1 ring-border text-foreground"
      >
        {/* Modal Top Header */}
        <div className="relative px-5 py-4 border-b border-border bg-muted/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/20">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                Escalação da Partida
              </h3>
              <p className="text-xs text-muted-foreground truncate max-w-[240px] sm:max-w-xs">
                {match.team_home} x {match.team_away}
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

        {/* Status Bar */}
        <div className="px-5 pt-4 pb-2 shrink-0">
          <div
            className={`flex items-center justify-between gap-2 rounded-2xl p-3 border ${
              isStartedOrLive
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold">
              {isStartedOrLive ? (
                <>
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Escalações Oficiais Confirmadas</span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>Aguardando Confirmação Oficial</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={onToggleMatchAlert}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                hasMatchAlert
                  ? 'bg-amber-400 text-amber-950 shadow-sm'
                  : 'bg-card text-foreground border border-border hover:bg-muted'
              }`}
              title="Avisar no celular quando sair a escalação"
            >
              {hasMatchAlert ? (
                <>
                  <BellRing className="h-3.5 w-3.5 fill-current animate-pulse" />
                  <span>Alerta Ativo</span>
                </>
              ) : (
                <>
                  <Bell className="h-3.5 w-3.5" />
                  <span>Avisar Escalação</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
          {/* Confrontation Mini Card */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-muted/60 border border-border">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-card text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <TeamBadge teamName={match.team_home} size="sm" />
              <span className="truncate">{match.team_home}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('away')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'away'
                  ? 'bg-card text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <TeamBadge teamName={match.team_away} size="sm" />
              <span className="truncate">{match.team_away || 'Visitante'}</span>
            </button>
          </div>

          {/* Lineup Pitch / Card Display */}
          <div className="relative rounded-3xl border border-emerald-500/25 bg-gradient-to-b from-emerald-950/40 via-emerald-900/20 to-card p-5 overflow-hidden">
            <div className="pitch-field-lines opacity-20 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <TeamBadge
                teamName={activeTab === 'home' ? match.team_home : match.team_away}
                size="lg"
              />
              <h4 className="mt-2 text-base font-black text-foreground">
                {activeTab === 'home' ? match.team_home : match.team_away}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {match.championship} • {match.time_br} (Brasília)
              </p>

              {isStartedOrLive ? (
                <div className="mt-5 w-full space-y-3">
                  <div className="rounded-2xl bg-card/85 p-3.5 border border-border/80 text-left">
                    <p className="text-xs font-extrabold text-foreground mb-2 flex items-center justify-between">
                      <span>Titulares em Campo</span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                        Súmula Oficial
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Time titular confirmado pelo departamento de futebol da equipe para o confronto.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-5 w-full space-y-3">
                  <div className="rounded-2xl bg-card/85 p-4 border border-border/80 text-left space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                      <AlertCircle className="h-4 w-4 text-primary shrink-0" />
                      <span>Divulgação Oficial</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Pelos regulamentos da CBF, FIFA, UEFA e CONMEBOL, as escalações oficiais de cada clube são entregues à arbitragem e publicadas cerca de <strong>45 a 60 minutos antes</strong> do apito inicial.
                    </p>
                    <div className="pt-2">
                      <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        🔔 Ative o alerta desta partida para receber quem entra em campo no seu celular assim que a súmula for liberada!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onToggleMatchAlert}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              hasMatchAlert
                ? 'bg-amber-400 text-amber-950 shadow-sm'
                : 'border border-border bg-card text-foreground hover:bg-muted'
            }`}
          >
            {hasMatchAlert ? (
              <>
                <BellRing className="h-4 w-4 fill-current" />
                <span>Alerta Ativado</span>
              </>
            ) : (
              <>
                <Bell className="h-4 w-4" />
                <span>Ativar Alerta do Jogo</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-primary px-5 py-1.5 text-xs font-extrabold text-primary-foreground shadow hover:opacity-95 transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
