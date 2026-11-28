import { useState } from 'react';
import {
  X,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import {
  UserProfile,
  signInWithSocial,
  sendEmailOtp,
  verifyEmailOtp,
} from '../lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: UserProfile) => void;
  title?: string;
  subtitle?: string;
}

type AuthStep = 'methods' | 'email-input' | 'email-verify';

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Entre na sua Conta',
  subtitle = 'Acesse para receber alertas e notificações de gols, partidas e escalações no celular.',
}: AuthModalProps) {
  const [step, setStep] = useState<AuthStep>('methods');
  const [emailInput, setEmailInput] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const resetState = () => {
    setStep('methods');
    setEmailInput('');
    setOtpCode('');
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
      if (res.success) {
        setFeedback({ type: 'info', text: res.message });
      } else {
        setFeedback({ type: 'error', text: res.message });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Não foi possível conectar. Tente com outro método.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) {
      setFeedback({ type: 'error', text: 'Digite um endereço de e-mail válido.' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);
    try {
      const res = await sendEmailOtp(emailInput);
      if (res.success) {
        setStep('email-verify');
        setFeedback({ type: 'success', text: res.message });
      } else {
        setFeedback({ type: 'error', text: res.message });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Falha no envio do e-mail. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim().length < 6) {
      setFeedback({ type: 'error', text: 'Digite o código de 6 dígitos enviado ao seu e-mail.' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);
    try {
      const res = await verifyEmailOtp(emailInput, otpCode);
      if (res.success && res.user) {
        setFeedback({ type: 'success', text: 'Login confirmado com sucesso!' });
        setTimeout(() => {
          onSuccess?.(res.user!);
          handleClose();
        }, 1000);
      } else {
        setFeedback({ type: 'error', text: res.message });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Código inválido ou expirado.' });
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
        className="relative w-full max-w-md my-auto rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto"
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
        <div className="text-center space-y-1 pt-1">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30">
            <Lock className="h-5 w-5" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`rounded-xl p-3 text-xs font-semibold flex items-center gap-2 ${
              feedback.type === 'error'
                ? 'bg-destructive/15 text-destructive border border-destructive/30'
                : feedback.type === 'success'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-primary/15 text-primary border border-primary/30'
            }`}
          >
            {feedback.type === 'error' && <AlertCircle className="h-4 w-4 shrink-0" />}
            {feedback.type === 'success' && <CheckCircle2 className="h-4 w-4 shrink-0" />}
            {feedback.type === 'info' && <Loader2 className="h-4 w-4 shrink-0 animate-spin" />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* STEP 1: Main Methods */}
        {step === 'methods' && (
          <div className="space-y-3.5">
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
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-border w-full" />
              <span className="bg-card px-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">
                ou acesse por e-mail
              </span>
              <div className="border-t border-border w-full" />
            </div>

            <button
              type="button"
              onClick={() => {
                setStep('email-input');
                setFeedback(null);
              }}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-border bg-muted/60 hover:bg-muted py-2.5 px-4 text-xs font-bold text-foreground transition cursor-pointer"
            >
              <Mail className="h-4 w-4 text-primary" />
              <span>Entrar com Código por E-mail</span>
            </button>

            <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Login oficial e criptografado. Seus dados estão protegidos.
            </p>
          </div>
        )}

        {/* STEP 2: Input Email */}
        {step === 'email-input' && (
          <form onSubmit={handleSendEmail} className="space-y-3.5">
            <button
              type="button"
              onClick={() => {
                setStep('methods');
                setFeedback(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar
            </button>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary" />
                Digite seu endereço de e-mail
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full rounded-2xl border border-border bg-background py-3 px-4 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Enviaremos um código oficial para confirmar seu acesso.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-xs font-extrabold text-primary-foreground shadow-lg hover:opacity-95 transition cursor-pointer"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              <span>Enviar Código por E-mail</span>
            </button>
          </form>
        )}

        {/* STEP 3: Verify OTP Code */}
        {step === 'email-verify' && (
          <form onSubmit={handleVerifyOtp} className="space-y-3.5">
            <button
              type="button"
              onClick={() => {
                setStep('email-input');
                setFeedback(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Trocar e-mail
            </button>

            <div className="space-y-2 text-center">
              <p className="text-xs text-foreground font-semibold">
                Digite o código de 6 dígitos enviado para:
              </p>
              <p className="text-xs font-black text-primary truncate">{emailInput}</p>

              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full text-center tracking-[0.4em] text-2xl font-black rounded-2xl border border-border bg-background py-3.5 px-4 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otpCode.length < 6}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-xs font-extrabold text-primary-foreground shadow-lg hover:opacity-95 transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              <span>Confirmar Código</span>
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={isLoading}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                Não recebeu? <span className="text-primary font-bold">Reenviar código</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
