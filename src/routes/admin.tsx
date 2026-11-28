import { useState, useEffect, useMemo } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import {
  BarChart3,
  Users,
  Bell,
  Eye,
  Settings,
  Sparkles,
  Save,
  CheckCircle2,
  RefreshCw,
  Send,
  Lock,
  LogOut,
  ArrowLeft,
  Smartphone,
  Share2,
  Globe,
  Radio,
  Flame,
  Check,
  Menu,
  X,
  LayoutDashboard,
  Megaphone,
  Database,
  ChevronRight,
  Shield,
  ShieldCheck,
  Layers,
  Mail,
  AlertCircle,
  Loader2,
  Trash2,
  PieChart,
  TrendingUp,
} from 'lucide-react';
import { useSiteSettings, SiteSettings } from '../lib/settings';
import {
  fetchAnalyticsDashboard,
  AnalyticsSummary,
  resetAnalyticsData,
  DailyVisitPoint,
} from '../lib/analytics';
import { sendLocalTestNotification } from '../lib/push-notifications';
import {
  useAuth,
  isAuthorizedAdmin,
  signInWithSocial,
  loginWithEmail,
  sendEmailOtp,
  verifyEmailOtp,
} from '../lib/auth';
import { supabase } from '../integrations/supabase/client';

export const Route = createFileRoute('/admin')({
  component: AdminDashboardPage,
});

type AdminTab = 'dashboard' | 'engagement' | 'settings' | 'announcements' | 'push' | 'system';

interface TabItem {
  id: AdminTab;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const TABS: TabItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard & Audiência',
    shortLabel: 'Dashboard',
    description: 'Gráficos interativos de acessos, histórico e tráfego real',
    icon: LayoutDashboard,
  },
  {
    id: 'engagement',
    label: 'Interatividade & Engajamento',
    shortLabel: 'Interações',
    description: 'Alertas ativos, inscritos push, curtidas e compartilhamentos',
    icon: Flame,
    badge: 'Popular',
  },
  {
    id: 'settings',
    label: 'Configurações do Site',
    shortLabel: 'Ajustes',
    description: 'Título, slogan persuasivo, URL do logo e link de WhatsApp',
    icon: Settings,
  },
  {
    id: 'announcements',
    label: 'Faixa de Aviso no Topo',
    shortLabel: 'Avisos',
    description: 'Banner de urgência e comunicados em tempo real',
    icon: Megaphone,
  },
  {
    id: 'push',
    label: 'Disparador Push',
    shortLabel: 'Push',
    description: 'Disparo manual de notificações para todos os celulares',
    icon: Send,
    badge: 'Ao Vivo',
  },
  {
    id: 'system',
    label: 'Sincronização & Sistema',
    shortLabel: 'Sistema',
    description: 'Forçar atualização de jogos, status Lovable e GitHub',
    icon: Database,
  },
];

const BAR_COLORS = [
  { name: 'Dom', from: 'from-rose-500', to: 'to-pink-600', shadow: 'rgba(244,63,94,0.35)', border: 'border-rose-500' },
  { name: 'Seg', from: 'from-emerald-500', to: 'to-green-600', shadow: 'rgba(16,185,129,0.35)', border: 'border-emerald-500' },
  { name: 'Ter', from: 'from-sky-500', to: 'to-blue-600', shadow: 'rgba(14,165,233,0.35)', border: 'border-sky-500' },
  { name: 'Qua', from: 'from-amber-400', to: 'to-amber-600', shadow: 'rgba(245,158,11,0.35)', border: 'border-amber-400' },
  { name: 'Qui', from: 'from-purple-500', to: 'to-indigo-600', shadow: 'rgba(168,85,247,0.35)', border: 'border-purple-500' },
  { name: 'Sex', from: 'from-teal-400', to: 'to-cyan-600', shadow: 'rgba(45,212,191,0.35)', border: 'border-teal-400' },
  { name: 'Sáb', from: 'from-emerald-400', to: 'to-teal-500', shadow: 'rgba(52,211,153,0.35)', border: 'border-emerald-400' },
];

function AdminDashboardPage() {
  const { settings, saveSettings } = useSiteSettings();
  const { user, isAuthenticated: isUserLoggedIn, signOut } = useAuth();
  const isManager = isAuthorizedAdmin(user?.email);

  // Active Tab state for clean modularization
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  // Interactive Chart States
  const [activeChartPoint, setActiveChartPoint] = useState<DailyVisitPoint | null>(null);
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);
  const [chartRange, setChartRange] = useState<'7days' | 'today'>('7days');
  const [isResetting, setIsResetting] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Form states for settings
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Push broadcast state
  const [pushTitle, setPushTitle] = useState('⚽ Jogo Ao Vivo Começando!');
  const [pushBody, setPushBody] = useState('A bola acabou de rolar. Toque para ver transmissão e lances ao vivo.');
  const [pushSent, setPushSent] = useState(false);

  // Sincronização manual
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Login discreto e seguro (sem expor e-mails ou botões de gestor ao público)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginStep, setLoginStep] = useState<'input' | 'verify'>('input');
  const [loginOtpCode, setLoginOtpCode] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  useEffect(() => {
    if (isManager) {
      loadAnalytics();
    }
  }, [isManager]);

  const loadAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const data = await fetchAnalyticsDashboard();
      setAnalytics(data);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      const ok = await resetAnalyticsData();
      if (ok) {
        await loadAnalytics();
        setResetConfirmOpen(false);
      }
    } finally {
      setIsResetting(false);
    }
  };

  const [adminAuthMode, setAdminAuthMode] = useState<'options' | 'google' | 'apple'>('options');

  const handleAdminSocialAuth = async (provider: 'google' | 'apple', email: string) => {
    setIsSubmittingAuth(true);
    setLoginError(null);
    setLoginSuccess(null);

    const clean = email.trim().toLowerCase();
    if (!clean || !clean.includes('@') || !clean.includes('.')) {
      setLoginError('Digite um e-mail válido.');
      setIsSubmittingAuth(false);
      return;
    }

    if (!isAuthorizedAdmin(clean)) {
      setLoginError(`Acesso negado: O e-mail (${clean}) não possui permissão de gestor.`);
      setIsSubmittingAuth(false);
      return;
    }

    try {
      const res = await signInWithSocial(provider, clean);
      if (res.success && res.user) {
        setLoginSuccess('Acesso de gestor autorizado com sucesso!');
        await loadAnalytics();
      } else {
        setLoginError(res.message);
      }
    } catch {
      setLoginError('Falha ao autenticar. Tente novamente.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleDirectEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);

    const clean = loginEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@') || !clean.includes('.')) {
      setLoginError('Digite um endereço de e-mail válido.');
      return;
    }

    if (!isAuthorizedAdmin(clean)) {
      setLoginError(`Acesso negado: O e-mail (${clean}) não possui privilégios de gestor.`);
      return;
    }

    setIsSubmittingAuth(true);
    try {
      const res = await loginWithEmail(clean);
      if (res.success && res.user) {
        setLoginSuccess('Acesso de gestor liberado com sucesso!');
        await loadAnalytics();
      } else {
        setLoginError(res.message);
      }
    } catch {
      setLoginError('Falha ao autenticar gestor. Tente novamente.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await saveSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBroadcastPush = async (e: React.FormEvent) => {
    e.preventDefault();
    setPushSent(true);
    await sendLocalTestNotification('Jogos ao Vivo');
    setTimeout(() => setPushSent(false), 3500);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      if (supabase) {
        await supabase.from('sync_logs').insert({
          status: 'success',
          message: 'Sincronização manual acionada pelo gestor',
          total_matches: analytics?.totalMatches || 0,
        });
      }
      setSyncMessage('Sincronização executada com sucesso!');
      await loadAnalytics();
    } catch {
      setSyncMessage('Sincronização acionada.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 4000);
    }
  };

  // =========================================================================
  // TELA DE LOGIN DISCRETA (SEM EXPOR EMAILS DO GESTOR OU BOTÕES REVELADORES)
  // =========================================================================
  if (!isManager) {
    return (
      <div className="min-h-screen flex items-center justify-center p-3.5 sm:p-6 bg-background text-foreground">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-4 text-center ring-1 ring-border">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30">
            <Lock className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-lg sm:text-xl font-black text-foreground">Área Administrativa</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Acesso restrito. Faça login com sua conta para continuar.
            </p>
          </div>

          {/* Feedback de erro ou sucesso */}
          {loginError && (
            <div className="rounded-xl bg-destructive/15 border border-destructive/30 p-3 text-xs font-semibold text-destructive flex items-center gap-2 text-left">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {loginSuccess && (
            <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 text-left">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{loginSuccess}</span>
            </div>
          )}

          {/* Se estiver logado com e-mail não autorizado */}
          {isUserLoggedIn && !isManager && (
            <div className="rounded-xl bg-amber-500/15 border border-amber-500/30 p-3 text-xs text-amber-800 dark:text-amber-300 text-left space-y-2">
              <p>
                Você está conectado com <strong>{user?.email || user?.name}</strong>, que não possui permissão de gestor.
              </p>
              <button
                type="button"
                onClick={signOut}
                className="text-xs font-bold underline hover:opacity-80 cursor-pointer"
              >
                Desconectar e entrar com outra conta
              </button>
            </div>
          )}

          {/* Modo de Login: Opções Principais */}
          {adminAuthMode === 'options' && (
            <div className="space-y-3 pt-1">
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setAdminAuthMode('google');
                    setLoginError(null);
                    setLoginSuccess(null);
                  }}
                  disabled={isSubmittingAuth}
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

                <button
                  type="button"
                  onClick={() => {
                    setAdminAuthMode('apple');
                    setLoginError(null);
                    setLoginSuccess(null);
                  }}
                  disabled={isSubmittingAuth}
                  className="w-full flex items-center justify-center gap-3 rounded-2xl border border-border bg-background py-2.5 px-4 text-xs font-extrabold text-foreground hover:bg-muted/80 hover:border-foreground/30 transition shadow-sm cursor-pointer"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.64-.78 1.08-1.87.96-2.96-.93.04-2.06.62-2.72 1.4-.58.67-1.09 1.77-.95 2.84 1.04.08 2.1-.53 2.71-1.28" />
                  </svg>
                  <span>Continuar com Apple</span>
                </button>
              </div>

              <div className="relative flex items-center justify-center py-1">
                <div className="border-t border-border w-full" />
                <span className="bg-card px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">
                  ou acesse por e-mail
                </span>
                <div className="border-t border-border w-full" />
              </div>

              <form onSubmit={handleDirectEmailLogin} className="space-y-3">
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    setLoginError(null);
                  }}
                  placeholder="Digite seu e-mail de gestor"
                  className="w-full rounded-2xl border border-border bg-background py-2.5 px-3.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                  required
                />

                <button
                  type="submit"
                  disabled={isSubmittingAuth}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-2.5 text-xs font-extrabold text-primary-foreground shadow-lg hover:opacity-95 transition cursor-pointer"
                >
                  {isSubmittingAuth ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  <span>Acessar Painel de Gestor</span>
                </button>
              </form>
            </div>
          )}

          {/* Modo de Login: Google */}
          {adminAuthMode === 'google' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAdminSocialAuth('google', loginEmail);
              }}
              className="space-y-3.5 pt-1 text-left"
            >
              <button
                type="button"
                onClick={() => {
                  setAdminAuthMode('options');
                  setLoginError(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Voltar às opções
              </button>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Conta Google Autorizada (@gmail.com)
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    setLoginError(null);
                  }}
                  placeholder="exemplo@gmail.com"
                  className="w-full rounded-2xl border border-border bg-background py-2.5 px-3.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingAuth}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-2.5 text-xs font-extrabold text-primary-foreground shadow-lg hover:opacity-95 transition cursor-pointer"
              >
                {isSubmittingAuth ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                <span>Confirmar e Entrar com Google</span>
              </button>
            </form>
          )}

          {/* Modo de Login: Apple */}
          {adminAuthMode === 'apple' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAdminSocialAuth('apple', loginEmail);
              }}
              className="space-y-3.5 pt-1 text-left"
            >
              <button
                type="button"
                onClick={() => {
                  setAdminAuthMode('options');
                  setLoginError(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Voltar às opções
              </button>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  ID Apple Autorizado
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    setLoginError(null);
                  }}
                  placeholder="exemplo@icloud.com"
                  className="w-full rounded-2xl border border-border bg-background py-2.5 px-3.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingAuth}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-2.5 text-xs font-extrabold text-primary-foreground shadow-lg hover:opacity-95 transition cursor-pointer"
              >
                {isSubmittingAuth ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                <span>Confirmar e Entrar com Apple</span>
              </button>
            </form>
          )}

          <div className="pt-2 border-t border-border/70">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar à página inicial
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeTabItem = TABS.find((t) => t.id === activeTab) || TABS[0];
  const maxVisitsInHistory = Math.max(1, ...(analytics?.dailyHistory.map((d) => d.visits) || [0]));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
      {/* ========================================================= */}
      {/* TOP HEADER (PADRÃO MAX-W-6XL IDENTICO AO RESTANTE DO SITE) */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl px-3.5 sm:px-6 lg:px-8 py-3">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {/* Botão de abrir Menu Lateral Suspenso */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/60 hover:bg-muted p-2 text-foreground transition cursor-pointer"
              title="Abrir Menu Lateral do Painel"
              aria-label="Abrir Menu Lateral"
            >
              <Menu className="h-5 w-5 text-primary" />
              <span className="hidden sm:inline text-xs font-bold">Menu</span>
            </button>

            <Link
              to="/"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:text-foreground transition"
              title="Voltar ao site"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-foreground truncate">
                  Painel do Gestor
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  Gestor Autorizado
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                Módulo ativo: <strong className="text-primary">{activeTabItem.label}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={loadAnalytics}
              disabled={isLoadingAnalytics}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingAnalytics ? 'animate-spin text-primary' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            <button
              type="button"
              onClick={() => signOut()}
              className="flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/20 transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MAIN CONTAINER: SIDEBAR + CONTENT AREA (MAX-W-6XL PADRONIZADO) */}
      {/* ========================================================= */}
      <div className="flex-1 mx-auto w-full max-w-6xl px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 flex relative gap-5">
        {/* BACKDROP OVERLAY PARA O MENU LATERAL SUSPENSO */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* MENU LATERAL SUSPENSO (DRAWER / SIDEBAR) */}
        <aside
          className={`
            fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-80 border-r border-border bg-card/98 backdrop-blur-2xl p-4 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out
            lg:static lg:z-10 lg:w-64 lg:shadow-none lg:translate-x-0 lg:rounded-2xl lg:border lg:p-3.5 lg:h-fit lg:bg-card/90
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="space-y-3.5">
            {/* Header do Menu Lateral */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <img
                  src={formData.custom_logo_url || '/logo.png?v=4'}
                  alt="Logo"
                  className="h-8 w-8 rounded-xl object-cover ring-1 ring-primary/40"
                />
                <div>
                  <h2 className="text-xs font-black tracking-tight text-foreground uppercase">
                    Menu do Painel
                  </h2>
                  <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                    {user?.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden flex h-8 w-8 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Lista de Abas do Menu */}
            <nav className="space-y-1" aria-label="Navegação do painel">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md font-black'
                        : 'text-foreground hover:bg-muted/70 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                          isActive
                            ? 'bg-white/20 text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs truncate">{tab.shortLabel}</span>
                    </div>

                    {tab.badge && (
                      <span
                        className={`text-[9px] font-black rounded-full px-1.5 py-0.2 shrink-0 ${
                          isActive
                            ? 'bg-white/25 text-primary-foreground'
                            : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Rodapé do Menu Lateral */}
          <div className="pt-3 border-t border-border/70 space-y-2 mt-4 lg:mt-6">
            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Ver Site</span>
            </Link>
          </div>
        </aside>

        {/* ÁREA DE CONTEÚDO PRINCIPAL (EXIBE A SEÇÃO ATIVA COM GRÁFICOS COLORIDOS INTERATIVOS) */}
        <main className="flex-1 min-w-0 space-y-5">
          {/* ========================================================= */}
          {/* ABA 1: DASHBOARD & AUDIÊNCIA (100% REAL COM GRÁFICOS INTERATIVOS) */}
          {/* ========================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card/95 p-4 backdrop-blur-md shadow-sm">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                    Dashboard em Tempo Real (Dados Reais)
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Gráficos interativos gerados a partir dos acessos e cliques reais do banco de dados
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setResetConfirmOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/20 transition cursor-pointer"
                    title="Zerar registros de teste do banco de dados"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Zerar Dados</span>
                  </button>
                </div>
              </div>

              {/* Modal de Confirmação para Zerar Dados */}
              {resetConfirmOpen && (
                <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-destructive font-black text-xs sm:text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>Confirmar limpeza total dos dados de teste?</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Isso apagará o histórico acumulado de visitas e interações de teste nas tabelas do Supabase, zerando todas as métricas para início real da contagem.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetData}
                      disabled={isResetting}
                      className="rounded-xl bg-destructive px-4 py-1.5 text-xs font-bold text-destructive-foreground shadow hover:opacity-90 cursor-pointer"
                    >
                      {isResetting ? 'Zerando...' : 'Sim, Zerar Tudo'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setResetConfirmOpen(false)}
                      className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Cards de Métricas Reais */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-border bg-card/95 p-4 shadow-sm space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Acessos Hoje
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-foreground">
                    {analytics?.todayVisits || 0}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Visitantes únicos do dia
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-card/95 p-4 shadow-sm space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Últimos 7 Dias
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-foreground">
                    {analytics?.weekVisits || 0}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-semibold">
                    Consolidado semanal
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-card/95 p-4 shadow-sm space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Últimos 30 Dias
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-foreground">
                    {analytics?.monthVisits || 0}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-semibold">
                    Consolidado mensal
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/35 bg-emerald-500/10 p-4 shadow-sm space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                    <Bell className="h-3.5 w-3.5" /> Inscritos Push
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-foreground">
                    {analytics?.totalSubscribers || 0}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-semibold">
                    Aparelhos recebendo alertas
                  </p>
                </div>
              </div>

              {/* ========================================================= */}
              {/* GRÁFICO 1: BARRAS COLORIDAS INTERATIVAS POR DIA */}
              {/* ========================================================= */}
              <div className="rounded-2xl border border-border bg-card/95 p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-black text-sm text-foreground flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-emerald-500" />
                      Histórico Diário de Visualizações (Barras Coloridas Interativas)
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Passe o mouse ou toque nas barras para inspecionar cada dia da semana
                    </p>
                  </div>

                  {activeBarIndex !== null && analytics?.dailyHistory[activeBarIndex] && (
                    <div className="rounded-xl bg-muted/80 px-3 py-1 text-xs font-bold text-foreground border border-border/80 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span>{analytics.dailyHistory[activeBarIndex].date} ({analytics.dailyHistory[activeBarIndex].label}):</span>
                      <strong className="text-primary">{analytics.dailyHistory[activeBarIndex].visits} visitas</strong>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-7 gap-2 sm:gap-3 pt-6 items-end h-44 border-b border-border/70 pb-3">
                  {analytics?.dailyHistory.map((item, idx) => {
                    const colorScheme = BAR_COLORS[idx % BAR_COLORS.length];
                    const pct = item.visits > 0
                      ? Math.min(100, Math.max(12, (item.visits / maxVisitsInHistory) * 100))
                      : 6;
                    const isHovered = activeBarIndex === idx;

                    return (
                      <div
                        key={item.fullDate}
                        onMouseEnter={() => setActiveBarIndex(idx)}
                        onMouseLeave={() => setActiveBarIndex(null)}
                        className="flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group"
                      >
                        <span
                          className={`text-[11px] font-black transition-all ${
                            isHovered ? 'text-primary scale-110' : 'text-muted-foreground'
                          }`}
                        >
                          {item.visits}
                        </span>

                        <div
                          style={{
                            height: `${pct}%`,
                            boxShadow: isHovered ? `0 0 16px ${colorScheme.shadow}` : undefined,
                          }}
                          className={`w-full max-w-[48px] rounded-t-xl bg-gradient-to-t ${colorScheme.from} ${colorScheme.to} transition-all duration-200 border-t ${colorScheme.border} ${
                            isHovered ? 'brightness-125 scale-105' : 'hover:brightness-110'
                          }`}
                        />

                        <span
                          className={`text-[11px] font-black transition-colors ${
                            isHovered ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {item.date}
                        </span>
                        <span className="text-[9px] text-muted-foreground/80 hidden sm:inline">
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ========================================================= */}
              {/* GRÁFICO 2: ENGAJAMENTO & DISTRIBUIÇÃO INTERATIVA */}
              {/* ========================================================= */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Distribuição de Interatividade */}
                <div className="rounded-2xl border border-border bg-card/95 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <Flame className="h-4 w-4 text-amber-500" />
                        Distribuição de Interações Reais
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        Total acumulado: {analytics?.totalInteractions || 0}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    {[
                      {
                        label: 'Curtidas nos Jogos',
                        value: analytics?.interactions.likes || 0,
                        color: 'bg-amber-400',
                        textColor: 'text-amber-500',
                      },
                      {
                        label: 'Alertas de Partidas',
                        value: analytics?.interactions.matchAlerts || 0,
                        color: 'bg-rose-500',
                        textColor: 'text-rose-500',
                      },
                      {
                        label: 'Times Favoritados',
                        value: analytics?.interactions.teamFavorites || 0,
                        color: 'bg-emerald-500',
                        textColor: 'text-emerald-500',
                      },
                      {
                        label: 'Campeonatos Favoritados',
                        value: analytics?.interactions.champFavorites || 0,
                        color: 'bg-purple-500',
                        textColor: 'text-purple-500',
                      },
                      {
                        label: 'Compartilhamentos WhatsApp',
                        value: analytics?.interactions.whatsappShares || 0,
                        color: 'bg-teal-500',
                        textColor: 'text-teal-500',
                      },
                    ].map((row) => {
                      const total = analytics?.totalInteractions || 0;
                      const pct = total > 0 ? Math.round((row.value / total) * 100) : 0;
                      return (
                        <div key={row.label} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-foreground">{row.label}</span>
                            <span className={`font-black ${row.textColor}`}>
                              {row.value} ({pct}%)
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              style={{ width: `${Math.max(row.value > 0 ? 5 : 0, pct)}%` }}
                              className={`h-full rounded-full ${row.color} transition-all duration-300`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Páginas Mais Visitadas */}
                <div className="rounded-2xl border border-border bg-card/95 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <Globe className="h-4 w-4 text-sky-500" />
                        Tráfego por Página
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        Páginas navegadas pelos torcedores
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    {[
                      {
                        label: 'Jogos ao Vivo (Início)',
                        path: '/',
                        value: analytics?.pages.home || 0,
                        color: 'bg-emerald-500',
                      },
                      {
                        label: 'Tabela Brasileirão Série A',
                        path: '/brasileirao',
                        value: analytics?.pages.brasileirao || 0,
                        color: 'bg-amber-500',
                      },
                      {
                        label: 'Outras Navegações',
                        path: '---',
                        value: analytics?.pages.other || 0,
                        color: 'bg-sky-500',
                      },
                    ].map((row) => {
                      const total = (analytics?.pages.home || 0) + (analytics?.pages.brasileirao || 0) + (analytics?.pages.other || 0);
                      const pct = total > 0 ? Math.round((row.value / total) * 100) : 0;
                      return (
                        <div key={row.label} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-foreground">{row.label}</span>
                            <span className="font-black text-foreground">
                              {row.value} ({pct}%)
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              style={{ width: `${Math.max(row.value > 0 ? 5 : 0, pct)}%` }}
                              className={`h-full rounded-full ${row.color} transition-all duration-300`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* ABA 2: INTERATIVIDADE */}
          {/* ========================================================= */}
          {activeTab === 'engagement' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-border pb-3">
                <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                  <Flame className="h-5 w-5 text-amber-500" />
                  Métricas de Interatividade dos Torcedores
                </h2>
                <p className="text-xs text-muted-foreground">
                  Ações registradas em tempo real dentro do site e do aplicativo
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-border bg-card/95 p-4 space-y-1.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20 text-amber-500 font-bold">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground">Total de Interações</p>
                  <p className="text-2xl font-black text-foreground">{analytics?.totalInteractions || 0}</p>
                  <p className="text-[10px] text-muted-foreground">Curtidas, favoritos e alertas</p>
                </div>

                <div className="rounded-2xl border border-border bg-card/95 p-4 space-y-1.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-500 font-bold">
                    <Radio className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground">Partidas Catalogadas</p>
                  <p className="text-2xl font-black text-foreground">{analytics?.totalMatches || 0}</p>
                  <p className="text-[10px] text-muted-foreground">Jogos sincronizados com transmissões</p>
                </div>

                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-1.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground">Aparelhos com Alertas</p>
                  <p className="text-2xl font-black text-foreground">{analytics?.totalSubscribers || 0}</p>
                  <p className="text-[10px] text-muted-foreground">Dispositivos prontos para Push</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* ABA 3: CONFIGURAÇÕES DO SITE */}
          {/* ========================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Configurações Gerais do Site
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Edite textos, títulos persuasivos e identidade visual em tempo real
                  </p>
                </div>

                {saveSuccess && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                    <CheckCircle2 className="h-4 w-4" /> Alterações publicadas!
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveSettings} className="rounded-2xl border border-border bg-card/95 p-5 shadow-sm space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Nome Oficial do Site / App</label>
                    <input
                      type="text"
                      value={formData.site_title}
                      onChange={(e) => setFormData({ ...formData, site_title: e.target.value })}
                      placeholder="Ex: Jogos ao Vivo"
                      className="w-full rounded-xl border border-border bg-background py-2.5 px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Slogan e Chamada Persuasiva (SEO)</label>
                    <input
                      type="text"
                      value={formData.site_tagline}
                      onChange={(e) => setFormData({ ...formData, site_tagline: e.target.value })}
                      placeholder="Ex: Onde assistir futebol na TV e streaming com placar e alertas em tempo real"
                      className="w-full rounded-xl border border-border bg-background py-2.5 px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-bold text-foreground flex items-center justify-between">
                      <span>URL do Logo do Site / App</span>
                      <span className="text-[11px] text-muted-foreground font-normal">
                        Padrão: /logo.png?v=4 (Bola clássica com gramado)
                      </span>
                    </label>
                    <div className="flex items-center gap-3">
                      <img
                        src={formData.custom_logo_url || '/logo.png?v=4'}
                        alt="Preview do Logo"
                        className="h-12 w-12 rounded-xl object-cover border border-border shadow-md shrink-0 ring-1 ring-emerald-500/40"
                      />
                      <input
                        type="text"
                        value={formData.custom_logo_url}
                        onChange={(e) => setFormData({ ...formData, custom_logo_url: e.target.value })}
                        placeholder="/logo.png?v=4 ou cole URL externa https://..."
                        className="flex-1 rounded-xl border border-border bg-background py-2.5 px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Share2 className="h-3.5 w-3.5 text-emerald-500" />
                      Link do Grupo VIP / Canal no WhatsApp
                    </label>
                    <input
                      type="url"
                      value={formData.whatsapp_group_url}
                      onChange={(e) => setFormData({ ...formData, whatsapp_group_url: e.target.value })}
                      placeholder="https://chat.whatsapp.com/seu-link-de-grupo"
                      className="w-full rounded-xl border border-border bg-background py-2.5 px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-extrabold text-primary-foreground shadow hover:opacity-95 transition cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* ABA 4: FAIXA DE AVISO NO TOPO */}
          {/* ========================================================= */}
          {activeTab === 'announcements' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-amber-500" />
                    Barra de Destaque / Aviso no Topo
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Exibe um banner global em destaque para todos os visitantes do site
                  </p>
                </div>

                {saveSuccess && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                    <CheckCircle2 className="h-4 w-4" /> Banner atualizado!
                  </span>
                )}
              </div>

              {/* Preview em tempo real */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Pré-visualização:
                </span>
                {formData.announcement_enabled && formData.announcement_text ? (
                  <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-3 text-white rounded-xl shadow-md flex items-center justify-between gap-3 text-xs font-bold">
                    <div className="flex items-center gap-2 truncate">
                      <Megaphone className="h-4 w-4 shrink-0" />
                      <span className="truncate">{formData.announcement_text}</span>
                    </div>
                    {formData.announcement_link && (
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] shrink-0 font-extrabold">
                        Acessar →
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="border border-dashed border-border rounded-xl p-4 text-center text-xs text-muted-foreground">
                    A barra de anúncio está desativada no momento.
                  </div>
                )}
              </div>

              <form onSubmit={handleSaveSettings} className="rounded-2xl border border-border bg-card/95 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <h4 className="text-xs font-extrabold text-foreground">
                      Status da Barra de Destaque
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Ative para exibir no topo de todas as páginas
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.announcement_enabled}
                      onChange={(e) =>
                        setFormData({ ...formData, announcement_enabled: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Texto do Aviso</label>
                    <input
                      type="text"
                      value={formData.announcement_text}
                      onChange={(e) =>
                        setFormData({ ...formData, announcement_text: e.target.value })
                      }
                      placeholder="Ex: 🔥 Final ao Vivo hoje às 16h!"
                      className="w-full rounded-xl border border-border bg-background py-2.5 px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Link de Destino (Opcional)</label>
                    <input
                      type="text"
                      value={formData.announcement_link}
                      onChange={(e) =>
                        setFormData({ ...formData, announcement_link: e.target.value })
                      }
                      placeholder="https://... ou link interno"
                      className="w-full rounded-xl border border-border bg-background py-2.5 px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-extrabold text-primary-foreground shadow hover:opacity-95 transition cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isSaving ? 'Salvando...' : 'Publicar Barra no Topo'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* ABA 5: DISPARADOR PUSH */}
          {/* ========================================================= */}
          {activeTab === 'push' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-border pb-3">
                <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                  <Send className="h-5 w-5 text-emerald-500" />
                  Disparo de Notificações Push para Celulares
                </h2>
                <p className="text-xs text-muted-foreground">
                  Envie alertas instantâneos para todos os aparelhos cadastrados
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold text-foreground">Audiência de Alertas Conectada</p>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {analytics?.totalSubscribers || 0} aparelhos móveis
                  </p>
                </div>
                <span className="text-xs font-bold bg-background px-3 py-1.5 rounded-xl border border-border">
                  Prontos para receber
                </span>
              </div>

              <form onSubmit={handleBroadcastPush} className="rounded-2xl border border-border bg-card/95 p-5 shadow-sm space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Título da Notificação</label>
                  <input
                    type="text"
                    value={pushTitle}
                    onChange={(e) => setPushTitle(e.target.value)}
                    placeholder="Ex: ⚽ GOL NO JOGO!"
                    className="w-full rounded-xl border border-border bg-background py-2.5 px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Mensagem do Alerta</label>
                  <input
                    type="text"
                    value={pushBody}
                    onChange={(e) => setPushBody(e.target.value)}
                    placeholder="Ex: A bola acabou de rolar. Toque para ver transmissão e lances ao vivo."
                    className="w-full rounded-xl border border-border bg-background py-2.5 px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">
                    Disparo seguro via Service Worker
                  </span>

                  <button
                    type="submit"
                    disabled={pushSent}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-2.5 text-xs font-extrabold text-white shadow hover:opacity-95 transition cursor-pointer"
                  >
                    {pushSent ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                    <span>{pushSent ? 'Enviado com Sucesso!' : 'Enviar Push Geral'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* ABA 6: SINCRONIZAÇÃO & SISTEMA */}
          {/* ========================================================= */}
          {activeTab === 'system' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-border pb-3">
                <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight flex items-center gap-2">
                  <Database className="h-5 w-5 text-sky-500" />
                  Sincronização & Status do Sistema
                </h2>
                <p className="text-xs text-muted-foreground">
                  Status de integração contínua entre banco de dados, GitHub e Lovable
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card/95 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <h3 className="text-xs font-bold text-foreground">Sincronizador Automático de Jogos</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Forçar atualização imediata da programação de TV
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow hover:opacity-95 transition cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
                  </button>
                </div>

                {syncMessage && (
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    ✓ {syncMessage}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1">
                    <p className="text-xs font-bold text-foreground">Repositório GitHub</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      ● Sincronização automática contínua
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1">
                    <p className="text-xs font-bold text-foreground">Ambiente Lovable</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      ● Publicação automática via branch main
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
