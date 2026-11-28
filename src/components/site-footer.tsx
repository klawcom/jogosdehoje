import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  ShieldCheck,
  Bell,
  Sparkles,
  Lock,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Tv,
  Radio,
  FileText,
  HelpCircle,
  X,
  Smartphone,
  EyeOff,
} from 'lucide-react';
import { useSiteSettings } from '../lib/settings';

interface SiteFooterProps {
  onOpenNotifications?: () => void;
}

type ModalType = 'privacy' | 'lgpd' | 'about' | null;

export function SiteFooter({ onOpenNotifications }: SiteFooterProps) {
  const { settings } = useSiteSettings();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const handleOpenAlerts = () => {
    if (onOpenNotifications) {
      onOpenNotifications();
    } else {
      window.dispatchEvent(new CustomEvent('jogosdehoje_open_notifications'));
    }
  };

  return (
    <footer className="mt-12 border-t border-border/80 bg-gradient-to-b from-card/80 to-background text-foreground transition-colors">
      {/* Container Principal Padronizado (max-w-6xl) */}
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14 space-y-10">
        
        {/* BANNER DE DESTAQUE: SEM PROPAGANDAS CHATAS + ALERTA PUSH */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/35 bg-gradient-to-br from-emerald-950/40 via-card to-emerald-950/20 p-5 sm:p-7 shadow-xl shadow-emerald-950/20">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                <EyeOff className="h-3.5 w-3.5" />
                <span>100% LIMPO: SEM PROPAGANDAS OU ANÚNCIOS CHATOS</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
                Por que milhares de torcedores preferem o Jogos ao Vivo?
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                A finalidade do <strong>Jogos ao Vivo</strong> é entregar a programação completa, escalações e lances em tempo real <strong>sem anúncios invasivos, banners que travam a tela ou pop-ups irritantes</strong>. 
                Futebol direto ao ponto com horários oficiais de Brasília e canais de transmissão conferidos.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5">
              <button
                type="button"
                onClick={handleOpenAlerts}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-3 text-xs sm:text-sm font-black text-white shadow-lg shadow-emerald-600/25 hover:from-emerald-400 hover:to-green-500 hover:scale-105 active:scale-95 transition cursor-pointer"
              >
                <Bell className="h-4 w-4 animate-bounce" />
                <span>Ativar Notificações no Celular</span>
              </button>
              <span className="text-[10px] text-center text-muted-foreground font-semibold">
                Gratuito • Alertas mesmo com app fechado
              </span>
            </div>
          </div>
        </div>

        {/* GRID PRINCIPAL: 4 COLUNAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Coluna 1: Identidade do Site */}
          <div className="space-y-3">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <img
                src={settings.custom_logo_url || '/logo.png?v=5'}
                alt="Logo Jogos ao Vivo"
                className="h-10 w-10 rounded-2xl object-cover shadow-md ring-2 ring-emerald-500/30 group-hover:scale-105 transition"
              />
              <div>
                <span className="text-base font-black tracking-tight text-foreground block">
                  {settings.site_title || 'Jogos ao Vivo'}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block -mt-0.5">
                  Futebol na TV e Streaming
                </span>
              </div>
            </Link>

            <p className="text-xs text-muted-foreground leading-relaxed">
              O seu guia definitivo para saber onde assistir aos jogos de futebol hoje, placares ao vivo, escalações e alertas instantâneos no celular.
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Dados reais de fontes seguras</span>
            </div>
          </div>

          {/* Coluna 2: Navegação Rápida */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
              Navegação do Site
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-foreground transition flex items-center gap-1.5"
                >
                  <ChevronRight className="h-3 w-3 text-emerald-500" />
                  <span>Jogos de Hoje e Ao Vivo</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/brasileirao"
                  className="text-muted-foreground hover:text-foreground transition flex items-center gap-1.5"
                >
                  <ChevronRight className="h-3 w-3 text-emerald-500" />
                  <span>Brasileirão Série A & B (Tabela e Estatísticas)</span>
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleOpenAlerts}
                  className="text-muted-foreground hover:text-foreground transition flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <ChevronRight className="h-3 w-3 text-emerald-500" />
                  <span>Configurar Alertas dos seus Times</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('about')}
                  className="text-muted-foreground hover:text-foreground transition flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <ChevronRight className="h-3 w-3 text-emerald-500" />
                  <span>Sobre o Projeto</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Transparência & Confiabilidade */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
              Fontes & Confiabilidade
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Todas as informações de partidas, canais e horários são extraídas continuamente de <strong>fontes seguras e auditadas</strong>, sem atrasos e sem intermediários duvidosos.
            </p>
            <div className="rounded-xl border border-border/70 bg-muted/30 p-2.5 space-y-1 text-[11px] text-muted-foreground">
              <p className="font-bold text-foreground flex items-center gap-1">
                <Tv className="h-3 w-3 text-primary" /> Transmissões Verificadas
              </p>
              <p>Globo, SporTV, Premiere, CazéTV, Prime Video, ESPN, Disney+, Paramount+ e Max.</p>
            </div>
          </div>

          {/* Coluna 4: Privacidade e LGPD */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Privacidade & LGPD
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Respeitamos rigorosamente a <strong>LGPD (Lei Geral de Proteção de Dados - Lei 13.709/2018)</strong>. Seus dados de contato são usados estritamente para o envio dos alertas que você solicitar.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveModal('lgpd')}
                className="rounded-lg border border-border/80 bg-muted/40 px-2.5 py-1 text-[11px] font-bold text-foreground hover:bg-muted transition cursor-pointer"
              >
                Conformidade LGPD
              </button>
              <button
                type="button"
                onClick={() => setActiveModal('privacy')}
                className="rounded-lg border border-border/80 bg-muted/40 px-2.5 py-1 text-[11px] font-bold text-foreground hover:bg-muted transition cursor-pointer"
              >
                Política de Privacidade
              </button>
            </div>
          </div>
        </div>

        {/* LINHA DE RODAPÉ INFERIOR (DIREITOS RESERVADOS) */}
        <div className="pt-8 border-t border-border/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} <strong>Jogos ao Vivo</strong>. Todos os direitos reservados.
          </p>

          <p className="text-center sm:text-right text-[11px]">
            Desenvolvido para torcedores que exigem rapidez, dados reais e zero anúncios invasivos.
          </p>
        </div>
      </div>

      {/* MODAL 1: POLÍTICA DE PRIVACIDADE */}
      {activeModal === 'privacy' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setActiveModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 rounded-full bg-muted p-1.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground">Política de Privacidade</h3>
                <p className="text-xs text-muted-foreground">Transparência total e respeito à sua privacidade</p>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-3 leading-relaxed">
              <p>
                No <strong>Jogos ao Vivo</strong>, a sua privacidade é tratada com seriedade absoluta. Não comercializamos, não cedemos e não compartilhamos quaisquer dados pessoais de nossos torcedores com agências de publicidade ou parceiros comerciais.
              </p>
              <h5 className="font-black text-foreground text-xs">1. Quais dados coletamos?</h5>
              <p>
                Coletamos exclusivamente os dados necessários para o funcionamento dos alertas que você configurar: identificador de push notification do seu navegador e, caso escolha se autenticar, o endereço de e-mail informado para sincronizar seus times prediletos.
              </p>
              <h5 className="font-black text-foreground text-xs">2. Finalidade dos dados</h5>
              <p>
                A única finalidade é enviar os alertas esportivos selecionados por você (gols, escalações, início e fim de partidas).
              </p>
              <h5 className="font-black text-foreground text-xs">3. Sem anúncios invasivos</h5>
              <p>
                Não exibimos anúncios abusivos, nem utilizamos rastreadores de navegação de terceiros para publicidade comportamental.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow"
            >
              Entendido e Fechar
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: LGPD (LEI GERAL DE PROTEÇÃO DE DADOS) */}
      {activeModal === 'lgpd' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setActiveModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 rounded-full bg-muted p-1.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground">Conformidade com a LGPD</h3>
                <p className="text-xs text-muted-foreground">Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</p>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-3 leading-relaxed">
              <p>
                O <strong>Jogos ao Vivo</strong> adota as melhores práticas de governança e segurança de dados previstas na legislação brasileira:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Princípio da Necessidade:</strong> Apenas os dados estritamente necessários para o envio de alertas esportivos são processados.
                </li>
                <li>
                  <strong>Consentimento e Controle:</strong> Você pode desativar suas notificações ou excluir sua inscrição a qualquer momento com apenas um clique nas configurações.
                </li>
                <li>
                  <strong>Segurança e Criptografia:</strong> Inscrições push utilizam chaves VAPID criptografadas em padrão industrial (Web Push Protocol).
                </li>
                <li>
                  <strong>Direitos do Titular:</strong> O usuário tem o direito de solicitar a exclusão total de seus dados de nossa base de alertas a qualquer instante.
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow"
            >
              Confirmar e Fechar
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: SOBRE O JOGOS AO VIVO */}
      {activeModal === 'about' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setActiveModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 rounded-full bg-muted p-1.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground">Sobre o Jogos ao Vivo</h3>
                <p className="text-xs text-muted-foreground">Tecnologia feita para quem ama futebol de verdade</p>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-3 leading-relaxed">
              <p>
                O <strong>Jogos ao Vivo</strong> nasceu para solucionar a maior dor dos torcedores na internet: sites esportivos lentos, cheios de propagandas que abrem sozinhas e banners que cobrem o placar.
              </p>
              <p>
                Nosso compromisso é entregar:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Design ultraleve e responsivo, adaptado para qualquer celular (Android e iOS).</li>
                <li>Notificações push em tempo real, avisando quando o jogo vai começar e quando tem gol.</li>
                <li>Horários oficiais no fuso de Brasília e canais de transmissão conferidos.</li>
                <li>Zero anúncios intrusivos e zero rastreamento comercial.</li>
              </ul>
              <p className="font-semibold text-foreground pt-1">
                Acompanhe o seu clube do coração com clareza, velocidade e tranquilidade!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}