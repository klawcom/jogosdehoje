import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  ShieldCheck,
  Bell,
  Sparkles,
  Lock,
  Tv,
  HelpCircle,
  X,
  EyeOff,
  CheckCircle2,
  Trophy,
} from 'lucide-react';
import { useSiteSettings } from '../lib/settings';

interface SiteFooterProps {
  onOpenNotifications?: () => void;
}

type FooterModalType = 'no-ads' | 'sources' | 'lgpd' | 'about' | null;

export function SiteFooter({ onOpenNotifications }: SiteFooterProps) {
  const { settings } = useSiteSettings();
  const [activeModal, setActiveModal] = useState<FooterModalType>(null);

  const handleOpenAlerts = () => {
    if (onOpenNotifications) {
      onOpenNotifications();
    } else {
      window.dispatchEvent(new CustomEvent('jogosdehoje_open_notifications'));
    }
  };

  return (
    <footer className="mt-14 border-t border-border/80 bg-card/60 backdrop-blur-md text-foreground transition-colors">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
        
        {/* TOPO DO RODAPÉ: IDENTIDADE E BOTÃO DE ALERTAS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/70">
          <div className="flex items-center gap-3">
            <img
              src={settings.custom_logo_url || '/logo.png?v=6'}
              alt="Logo Jogos ao Vivo"
              className="h-10 w-10 rounded-2xl object-cover shadow-md ring-2 ring-emerald-500/30 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-foreground">
                  {settings.site_title || 'Jogos ao Vivo'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.2 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                  <EyeOff className="h-3 w-3" />
                  Sem Anúncios
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Onde assistir futebol na TV e streaming • Dados 100% reais em tempo real
              </p>
            </div>
          </div>

          {/* Botão de Destaque: Ativar Alertas */}
          <button
            type="button"
            onClick={handleOpenAlerts}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white px-4 py-2.5 text-xs font-black shadow-md shadow-emerald-600/25 transition cursor-pointer hover:scale-105 active:scale-95 shrink-0 self-start sm:self-auto"
          >
            <Bell className="h-3.5 w-3.5 animate-bounce" />
            <span>Ativar Alertas no Celular</span>
          </button>
        </div>

        {/* GRADE DE BOTÕES E LINKS INTERATIVOS */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
          {/* Botão 1: Sem Propagandas Chatas */}
          <button
            type="button"
            onClick={() => setActiveModal('no-ads')}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3.5 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 transition cursor-pointer shadow-sm hover:border-emerald-500/50"
          >
            <EyeOff className="h-3.5 w-3.5 text-emerald-500" />
            <span>100% Sem Propagandas Chatas</span>
          </button>

          {/* Botão 2: Dados Reais & Fontes Seguras */}
          <button
            type="button"
            onClick={() => setActiveModal('sources')}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/60 hover:bg-muted px-3.5 py-2 text-xs font-bold text-foreground transition cursor-pointer shadow-sm"
          >
            <Tv className="h-3.5 w-3.5 text-primary" />
            <span>Dados Reais & Fontes Seguras</span>
          </button>

          {/* Botão 3: LGPD & Privacidade */}
          <button
            type="button"
            onClick={() => setActiveModal('lgpd')}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/60 hover:bg-muted px-3.5 py-2 text-xs font-bold text-foreground transition cursor-pointer shadow-sm"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Privacidade & LGPD</span>
          </button>

          {/* Botão 4: Tabela Brasileirão */}
          <Link
            to="/brasileirao"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/60 hover:bg-muted px-3.5 py-2 text-xs font-bold text-foreground transition cursor-pointer shadow-sm"
          >
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            <span>Tabela Brasileirão</span>
          </Link>

          {/* Botão 5: Sobre Nós */}
          <button
            type="button"
            onClick={() => setActiveModal('about')}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/60 hover:bg-muted px-3.5 py-2 text-xs font-bold text-foreground transition cursor-pointer shadow-sm"
          >
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Sobre o Site</span>
          </button>
        </div>

        {/* LINHA INFERIOR: DIREITOS RESERVADOS */}
        <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} <strong>Jogos ao Vivo</strong>. Todos os direitos reservados.
          </p>

          <p className="text-center sm:text-right text-[11px]">
            Horários de Brasília • Transmissões conferidas • Sem propagandas invasivas
          </p>
        </div>
      </div>

      {/* MODAL 1: POR QUE USAR / 100% SEM PROPAGANDAS */}
      {activeModal === 'no-ads' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setActiveModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 rounded-full bg-muted p-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30">
                <EyeOff className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground">Por que usar o Jogos ao Vivo?</h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">100% Limpo e Sem Anúncios Chatos</p>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-3 leading-relaxed">
              <p>
                A finalidade do <strong>Jogos ao Vivo</strong> é entregar as informações essenciais sobre futebol ao vivo com rapidez absoluta e <strong>zero propagandas chatas ou anúncios invasivos</strong> que travam a tela, abrem pop-ups ou atrapalham a sua navegação.
              </p>
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-1.5 text-foreground">
                <p className="font-bold flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  Vale a pena usar nossos serviços porque:
                </p>
                <ul className="list-disc pl-5 text-[11px] space-y-1 text-muted-foreground">
                  <li>Você não perde tempo fechando banners irritantes ou vídeos automáticos.</li>
                  <li>Descobre em segundos onde o jogo vai passar na TV aberta, fechada ou streaming.</li>
                  <li>Acompanha placar e gols ao vivo com atualização instantânea.</li>
                  <li>Recebe alertas no celular sem pagar nada e sem receber spams.</li>
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow hover:opacity-95 transition cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: DADOS REAIS & FONTES SEGURAS */}
      {activeModal === 'sources' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setActiveModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 rounded-full bg-muted p-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30">
                <Tv className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground">Dados Reais e Fontes Seguras</h3>
                <p className="text-xs text-muted-foreground">Transmissões e horários auditados</p>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-3 leading-relaxed">
              <p>
                Todas as partidas, horários no fuso de Brasília, canais de transmissão e alertas são <strong>dados 100% reais extraídos e monitorados continuamente de fontes oficiais e seguras</strong> em tempo real.
              </p>
              <div className="rounded-2xl border border-border bg-muted/30 p-3 space-y-2">
                <p className="font-bold text-foreground text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Canais e Plataformas Monitoradas:
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  TV Globo, SporTV, Premiere, CazéTV, ESPN, Disney+, Prime Video, Paramount+, Max, canais abertos e streamings oficiais.
                </p>
              </div>
              <p className="text-[11px] italic">
                Nossos sistemas de inteligência sincronizam os dados ao longo do dia para assegurar que você nunca perca o início de uma partida ou uma troca de canal.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow hover:opacity-95 transition cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: LGPD & PRIVACIDADE */}
      {activeModal === 'lgpd' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setActiveModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 rounded-full bg-muted p-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground">Privacidade e LGPD</h3>
                <p className="text-xs text-muted-foreground">Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</p>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-3 leading-relaxed">
              <p>
                O <strong>Jogos ao Vivo</strong> respeita rigorosamente a legislação brasileira de proteção de dados:
              </p>
              <ul className="list-disc pl-5 text-[11px] space-y-1.5">
                <li>
                  <strong>Dados Usados Exclusivamente para Alertas:</strong> Seus dados de contato ou chave de notificação do navegador são utilizados unicamente para enviar os alertas que você solicitou.
                </li>
                <li>
                  <strong>Zero Compartilhamento com Terceiros:</strong> Não vendemos, não alugamos e não compartilhamos seus dados com anunciantes ou parceiros comerciais.
                </li>
                <li>
                  <strong>Criptografia Segura:</strong> As notificações push utilizam o protocolo VAPID criptografado de ponta a ponta.
                </li>
                <li>
                  <strong>Controle Total do Usuário:</strong> Você pode desativar alertas ou cancelar sua inscrição a qualquer momento com apenas 1 clique nas configurações.
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow hover:opacity-95 transition cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: SOBRE O SITE */}
      {activeModal === 'about' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setActiveModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 rounded-full bg-muted p-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground">Sobre o Jogos ao Vivo</h3>
                <p className="text-xs text-muted-foreground">Desenvolvido para torcedores apaixonados</p>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-3 leading-relaxed">
              <p>
                O <strong>Jogos ao Vivo</strong> foi desenvolvido para solucionar a frustração dos torcedores com portais de futebol pesados, poluídos por anúncios intrusivos e lentos no celular.
              </p>
              <p>
                Aqui você encontra programação diária completa, canais de TV e streaming, escalações oficiais, placares em tempo real e tabela do Brasileirão, tudo em uma interface leve, rápida e moderna que funciona como aplicativo no seu celular (PWA).
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow hover:opacity-95 transition cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}