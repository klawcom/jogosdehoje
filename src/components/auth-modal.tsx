import { useState } from 'react';
import {
  X,
  Mail,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Lock,
} from 'lucide-react';
import {
  UserProfile,
  signInWithSocial,
  sendOtpCode,
  verifyOtpCode,
} from '../lib/auth';
import { WhatsAppIcon } from './icons/whatsapp-icon';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: UserProfile) => void;
  title?: string;
  subtitle?: string;
}

type AuthMethod = 'select' | 'email' | 'whatsapp' | 'verify-code';

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Entre para Ativar Alertas',
  subtitle = 'Escolha como deseja se conectar para receber notificações de gols, escalações e jogos no seu celular.',
}: AuthModalProps) {
  const [method, setMethod] = useState<AuthMethod>('select');
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [targetType, setTargetType] = useState<'email' | 'whatsapp'>('whatsapp');

  const [otpCode, setOtpCode] = useState('');
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const resetState = () => {
    setMethod('select');
    setEmailInput('');
    setPhoneInput('');
    setOtpCode('');
    setDemoCode(null);
    setFeedback(null);
    setIsLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSocialLogin = async (provider: 'google' | 'microsoft' | 'apple') => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const res = await signInWithSocial(provider);
      if (res.success && res.user) {
        setFeedback({ type: 'success', text: res.message });
        setTimeout(() => {
          onSuccess?.(res.user!);
          handleClose();
        }, 1200);
      } else {
        setFeedback({ type: 'error', text: res.message || 'Erro ao conectar. Tente novamente.' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Não foi possível conectar. Tente com outro método.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCode = async (type: 'email' | 'whatsapp') => {
    const value = type === 'email' ? emailInput : phoneInput;
    if (!value.trim()) {
      setFeedback({
        type: 'error',
        text: type === 'email' ? 'Digite um e-mail válido.' : 'Digite seu número de WhatsApp com DDD.',
      });
      return;
    }

    setIsLoading(true);
    setFeedback(null);
    try {
      const res = await sendOtpCode(value, type);
      if (res.success) {
        setTargetValue(value.trim());
        setTargetType(type);
        setDemoCode(res.code || '123456');
        setMethod('verify-code');
        setFeedback({ type: 'info', text: res.message });
      } else {
        setFeedback({ type: 'error', text: res.message });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Falha no envio do código. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setFeedback({ type: 'error', text: 'Digite o código de 6 dígitos.' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);
    try {
      const res = await verifyOtpCode(targetValue, otpCode, targetType);
      if (res.success && res.user) {
        setFeedback({ type: 'success', text: res.message });
        setTimeout(() => {
          onSuccess?.(res.user!);
          handleClose();
        }, 1200);
      } else {
        setFeedback({ type: 'error', text: res.message });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Código incorreto. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md p-3 sm:p-4 flex min-h-screen items-center justify-center animate-in fade-in"
      role="dialog"
      aria-modal="true"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md my-auto rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-2xl space-y-3.5 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 pt-0.5">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30">
            <Lock className="h-5 w-5" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight">
            {title}
          </h3>
          <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`rounded-xl p-2.5 text-xs font-semibold flex items-center gap-2 ${
              feedback.type === 'error'
                ? 'bg-destructive/15 text-destructive border border-destructive/30'
                : feedback.type === 'success'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-primary/15 text-primary border border-primary/30'
            }`}
          >
            {feedback.type === 'error' && <AlertCircle className="h-4 w-4 shrink-0" />}
            {feedback.type === 'success' && <CheckCircle2 className="h-4 w-4 shrink-0" />}
            {feedback.type === 'info' && <Sparkles className="h-4 w-4 shrink-0" />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* STEP 1: Main Method Selection */}
        {method === 'select' && (
          <div className="space-y-3.5">
            {/* Social Logins: Google, Microsoft, Apple */}
            <div className="space-y-2">
              {/* Google */}
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 rounded-2xl border border-border bg-background py-2.5 px-4 text-xs font-extrabold text-foreground hover:bg-muted/80 hover:border-foreground/30 transition shadow-sm cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continuar com Google</span>
              </button>

              {/* Microsoft */}
              <button
                type="button"
                onClick={() => handleSocialLogin('microsoft')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 rounded-2xl border border-border bg-background py-2.5 px-4 text-xs font-extrabold text-foreground hover:bg-muted/80 hover:border-foreground/30 transition shadow-sm cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#f25022" d="M1 1h10v10H1z" />
                  <path fill="#00a4ef" d="M1 13h10v10H1z" />
                  <path fill="#7fba00" d="M13 1h10v10H13z" />
                  <path fill="#ffb900" d="M13 13h10v10H13z" />
                </svg>
                <span>Continuar com Microsoft</span>
              </button>

              {/* Apple */}
              <button
                type="button"
                onClick={() => handleSocialLogin('apple')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 rounded-2xl border border-border bg-background py-2.5 px-4 text-xs font-extrabold text-foreground hover:bg-muted/80 hover:border-foreground/30 transition shadow-sm cursor-pointer"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.64-.78 1.08-1.87.96-2.96-.93.04-2.06.62-2.72 1.4-.58.67-1.09 1.77-.95 2.84 1.04.08 2.1-.53 2.71-1.28" />
                </svg>
                <span>Continuar com Apple</span>
              </button>
            </div>

            {/* Separator */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-border w-full" />
              <span className="bg-card px-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">
                ou receba um código
              </span>
              <div className="border-t border-border w-full" />
            </div>

            {/* Code Options: WhatsApp & E-mail */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMethod('whatsapp');
                  setFeedback(null);
                }}
                className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-emerald-500/35 bg-emerald-500/10 p-2.5 sm:p-3 text-center transition hover:bg-emerald-500/20 hover:border-emerald-500/60 cursor-pointer"
              >
                <WhatsAppIcon className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                  Via WhatsApp
                </span>
                <span className="text-[10px] text-muted-foreground">Código no celular</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod('email');
                  setFeedback(null);
                }}
                className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-sky-500/35 bg-sky-500/10 p-2.5 sm:p-3 text-center transition hover:bg-sky-500/20 hover:border-sky-500/60 cursor-pointer"
              >
                <Mail className="h-4 w-4 text-sky-500" />
                <span className="text-xs font-black text-sky-700 dark:text-sky-300">
                  Via E-mail
                </span>
                <span className="text-[10px] text-muted-foreground">Código na caixa</span>
              </button>
            </div>

            <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
              Seus dados são 100% seguros e utilizados apenas para envio dos alertas.
            </p>
          </div>
        )}

        {/* STEP 2A: Form WhatsApp */}
        {method === 'whatsapp' && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setMethod('select');
                setFeedback(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar às opções
            </button>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <WhatsAppIcon className="h-4 w-4 text-emerald-500" />
                Número do seu WhatsApp (com DDD)
              </label>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="Ex: (11) 98765-4321"
                className="w-full rounded-2xl border border-border bg-background py-3 px-4 text-sm font-semibold text-foreground focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                autoFocus
              />
              <p className="text-[11px] text-muted-foreground">
                Enviaremos um código de 6 dígitos para você confirmar sua entrada.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleSendCode('whatsapp')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 py-3.5 px-4 text-xs font-extrabold text-white shadow-lg hover:opacity-95 transition cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <WhatsAppIcon className="h-4 w-4" />
              )}
              <span>Enviar Código no WhatsApp</span>
            </button>
          </div>
        )}

        {/* STEP 2B: Form E-mail */}
        {method === 'email' && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setMethod('select');
                setFeedback(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar às opções
            </button>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-sky-500" />
                Seu endereço de e-mail
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="exemplo@gmail.com"
                className="w-full rounded-2xl border border-border bg-background py-3 px-4 text-sm font-semibold text-foreground focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                autoFocus
              />
              <p className="text-[11px] text-muted-foreground">
                Você receberá um código de confirmação no seu e-mail.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleSendCode('email')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 py-3.5 px-4 text-xs font-extrabold text-white shadow-lg hover:opacity-95 transition cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              <span>Enviar Código por E-mail</span>
            </button>
          </div>
        )}

        {/* STEP 3: Verify 6-digit Code */}
        {method === 'verify-code' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setMethod(targetType);
                setFeedback(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Alterar {targetType === 'whatsapp' ? 'número' : 'e-mail'}
            </button>

            <div className="space-y-2 text-center">
              <p className="text-xs text-foreground font-semibold">
                Digite o código de 6 dígitos enviado para:
              </p>
              <p className="text-sm font-black text-primary truncate">{targetValue}</p>

              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full text-center tracking-[0.4em] text-2xl font-black rounded-2xl border border-border bg-background py-3.5 px-4 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />

              {demoCode && (
                <div className="rounded-xl bg-muted/60 p-2 text-[11px] text-muted-foreground">
                  <span>Código de verificação gerado: </span>
                  <strong className="text-primary font-mono text-xs">{demoCode}</strong>
                  <button
                    type="button"
                    onClick={() => setOtpCode(demoCode)}
                    className="ml-2 text-[10px] font-bold text-primary underline hover:opacity-80"
                  >
                    Preencher automático
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || otpCode.length < 4}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 px-4 text-xs font-extrabold text-primary-foreground shadow-lg hover:opacity-95 transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <span>Confirmar e Ativar Alertas</span>
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => handleSendCode(targetType)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition"
              >
                Não recebeu o código? <span className="text-primary font-bold">Reenviar</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
