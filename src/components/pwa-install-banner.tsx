import { useState, useEffect } from 'react';
import { Download, Share2, X, PlusSquare, BellRing, Smartphone, Check } from 'lucide-react';
import { isStandaloneApp, isIosDevice } from '../lib/push-notifications';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_KEY = 'jogosdehoje_pwa_banner_dismissed';

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);
  const [isInstalledSuccess, setIsInstalledSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const standalone = isStandaloneApp();
    setIsStandalone(standalone);
    setIsIos(isIosDevice());

    const dismissed = localStorage.getItem(DISMISS_KEY);
    // Se foi dispensado nas últimas 48h, não exibe
    if (dismissed && Date.now() - parseInt(dismissed, 10) < 48 * 60 * 60 * 1000) {
      setIsDismissed(true);
    } else {
      setIsDismissed(false);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    const handleAppInstalled = () => {
      setIsInstalledSuccess(true);
      setDeferredPrompt(null);
      setTimeout(() => setIsDismissed(true), 4000);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (isStandalone || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalledSuccess(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn('[PWA] Erro ao disparar prompt de instalação:', err);
      }
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  return (
    <>
      {/* Banner flutuante no rodapé para mobile */}
      <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-md z-45 animate-in slide-in-from-bottom duration-300">
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-card/95 p-3.5 sm:p-4 shadow-2xl backdrop-blur-xl ring-1 ring-black/10 dark:ring-white/10">
          {/* Efeito luminoso de fundo */}
          <div className="absolute -top-12 -right-12 h-28 w-28 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none" />

          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-md shadow-emerald-500/25">
              <Smartphone className="h-5 w-5 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <BellRing className="h-3 w-3 animate-bounce" />
                  Instale o App Oficial
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-foreground leading-snug">
                Receba alertas de gols e jogos no celular
              </h4>
              <p className="mt-0.5 text-[11px] text-muted-foreground leading-normal">
                Notificações em tempo real direto na tela, mesmo com o app fechado.
              </p>

              <div className="mt-2.5 flex items-center gap-2">
                {isInstalledSuccess ? (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <Check className="h-4 w-4" /> App Instalado com Sucesso!
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:from-emerald-500 hover:to-green-500 active:scale-95 transition-all cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{isIos ? 'Como Adicionar' : 'Instalar App Grátis'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="rounded-xl px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition cursor-pointer"
                >
                  Depois
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition"
              title="Dispensar"
              aria-label="Dispensar aviso"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal / Dica de instalação para iPhone / iPad no iOS */}
      {showIosGuide && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowIosGuide(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-border bg-card p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Smartphone className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-foreground">Como Instalar no iPhone</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-foreground">
              <div className="flex items-center gap-3 rounded-2xl bg-muted/60 p-3 border border-border/50">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-black text-xs">
                  1
                </div>
                <p>
                  Toque no botão de <strong>Compartilhar</strong>{' '}
                  <Share2 className="inline h-4 w-4 text-primary align-middle mx-1" /> na barra inferior do Safari.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-muted/60 p-3 border border-border/50">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-black text-xs">
                  2
                </div>
                <p>
                  Role para baixo e selecione{' '}
                  <strong className="inline-flex items-center gap-1 font-bold text-foreground">
                    <PlusSquare className="h-4 w-4 text-primary" /> Adicionar à Tela de Início
                  </strong>
                  .
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-muted/60 p-3 border border-border/50">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-black text-xs">
                  3
                </div>
                <p>
                  Abra o ícone <strong>Jogos de Hoje</strong> criado na tela inicial e ative as notificações push!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow transition active:scale-98"
            >
              Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
