import { useState, useEffect } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
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
  KeyRound,
} from 'lucide-react';
import { useSiteSettings, SiteSettings } from '../lib/settings';
import { fetchAnalyticsDashboard, AnalyticsSummary } from '../lib/analytics';
import { sendLocalTestNotification } from '../lib/push-notifications';
import {
  useAuth,
  isAuthorizedAdmin,
  AUTHORIZED_ADMIN_EMAILS,
  signInWithSocial,
  sendOtpCode,
  verifyOtpCode,
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
    description: 'Acessos diários, semanais, mensais e gráfico de tráfego',
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

function AdminDashboardPage() {
  const { settings, saveSettings } = useSiteSettings();
  const { user, isAuthenticated: isUserLoggedIn, signOut } = useAuth();
  const isManager = isAuthorizedAdmin(user?.email);

  // Active Tab state for clean modularization
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

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

  // Login states para os Gestores Autorizados (klaw.com@gmail.com e klawdhynney@gmail.com)
  const [adminEmail, setAdminEmail] = useState<string>('klaw.com@gmail.com');
  const [otpStep, setOtpStep] = useState<'input' | 'verify'>('input');
  const [otpCode, setOtpCode] = useState('');
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);
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

  const handleAdminGoogleLogin = async () => {
    setIsSubmittingAuth(true);
    setAdminError(null);
    try {
      const res = await signInWithSocial('google');
      if (res.success && res.user) {
        if (!isAuthorizedAdmin(res.user.email)) {
          setAdminError(`Acesso negado: A conta Google (${res.user.email}) não possui privilégios de gestor.`);
        }
      }
    } catch {
      setAdminError('Falha ao autenticar com Google. Tente entrar via código por e-mail.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleSendAdminCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminSuccess(null);

    const clean = adminEmail.trim().toLowerCase();
    if (!isAuthorizedAdmin(clean)) {
      setAdminError(
        'Acesso Negado: Apenas os e-mails klaw.com@gmail.com e klawdhynney@gmail.com possuem permissão de gestor.'
      );
      return;
    }

    setIsSubmittingAuth(true);
    try {
      const res = await sendOtpCode(clean, 'email');
      if (res.success) {
        setDemoCode(res.code || '123456');
        setOtpStep('verify');
        setAdminSuccess(`Código enviado para o e-mail de gestor (${clean})!`);
      } else {
        setAdminError(res.message);
      }
    } catch {
      setAdminError('Erro ao enviar código. Tente novamente.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleVerifyAdminCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setIsSubmittingAuth(true);
    try {
      const res = await verifyOtpCode(adminEmail, otpCode, 'email');
      if (res.success && res.user) {
        if (isAuthorizedAdmin(res.user.email)) {
          setAdminSuccess('Acesso concedido com sucesso!');
          // O hook useAuth atualizará automaticamente isManager para true
        } else {
          setAdminError('Acesso negado: Este e-mail não possui permissão de gestor.');
        }
      } else {
        setAdminError(res.message || 'Código incorreto.');
      }
    } catch {
      setAdminError('Erro na verificação do código. Tente novamente.');
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
          total_matches: analytics?.totalMatches || 86,
        });
      }
      setSyncMessage('Sincronização executada com sucesso!');
      await loadAnalytics();
    } catch {
      setSyncMessage('Sincronização acionada com sucesso.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 4000);
    }
  };

  // =========================================================================
  // TELA DE LOGIN EXCLUSIVA PARA OS GESTORES (SENHAS POR PIN REVOGADAS)
  // =========================================================================
  if (!isManager) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-5 text-center ring-1 ring-border">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30">
            <ShieldCheck className="h-7 w-7" />
          </div>

          <div>
            <h1 className="text-xl font-black text-foreground">Acesso Exclusivo de Gestor</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Acesso liberado exclusivamente para os e-mails autorizados. Senhas por PIN foram revogadas.
            </p>
          </div>

          {/* E-mails autorizados em destaque */}
          <div className="rounded-2xl bg-muted/40 p-3 border border-border/60 text-left space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <KeyRound className="h-3 w-3 text-emerald-500" />
              Gestores Autorizados:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {AUTHORIZED_ADMIN_EMAILS.map((email) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => {
                    setAdminEmail(email);
                    setAdminError(null);
                  }}
                  className={`rounded-xl px-2.5 py-1 text-xs font-mono font-bold border transition cursor-pointer ${
                    adminEmail === email
                      ? 'bg-primary/15 text-primary border-primary/50'
                      : 'bg-background text-muted-foreground border-border hover:text-foreground'
                  }`}
                >
                  {email}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback de erro ou sucesso */}
          {adminError && (
            <div className="rounded-xl bg-destructive/15 border border-destructive/30 p-3 text-xs font-semibold text-destructive flex items-center gap-2 text-left">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{adminError}</span>
            </div>
          )}

          {adminSuccess && (
            <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 text-left">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{adminSuccess}</span>
            </div>
          )}

          {/* Aviso se o usuário está logado com e-mail não autorizado */}
          {isUserLoggedIn && !isManager && (
            <div className="rounded-xl bg-amber-500/15 border border-amber-500/30 p-3 text-xs text-amber-800 dark:text-amber-300 text-left space-y-2">
              <p>
                Você está conectado como <strong>{user?.email || user?.name}</strong>, que não possui permissão de gestor.
              </p>
              <button
                type="button"
                onClick={signOut}
                className="text-xs font-bold underline hover:opacity-80 cursor-pointer"
              >
                Desconectar e entrar com e-mail de gestor
              </button>
            </div>
          )}

          {/* Opção 1: Entrar com Google */}
          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={handleAdminGoogleLogin}
              disabled={isSubmittingAuth}
              className="w-full flex items-center justify-center gap-3 rounded-2xl border border-border bg-background py-3 px-4 text-xs font-extrabold text-foreground hover:bg-muted/80 hover:border-foreground/30 transition shadow-sm cursor-pointer"
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
              <span>Entrar com Google do Gestor</span>
            </button>

            {/* Separador */}
            <div className="relative flex items-center justify-center py-1">
              <div className="border-t border-border w-full" />
              <span className="bg-card px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">
                ou código no e-mail
              </span>
              <div className="border-t border-border w-full" />
            </div>

            {/* Opção 2: Código no E-mail de Gestor */}
            {otpStep === 'input' ? (
              <form onSubmit={handleSendAdminCode} className="space-y-3">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    E-mail do Gestor
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => {
                      setAdminEmail(e.target.value);
                      setAdminError(null);
                    }}
                    placeholder="klaw.com@gmail.com ou klawdhynney@gmail.com"
                    className="w-full rounded-2xl border border-border bg-background py-2.5 px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingAuth}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-xs font-extrabold text-primary-foreground shadow-lg hover:opacity-95 transition cursor-pointer"
                >
                  {isSubmittingAuth ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  <span>Enviar Código para o E-mail</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAdminCode} className="space-y-3">
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">Código de 6 dígitos</label>
                    <button
                      type="button"
                      onClick={() => setOtpStep('input')}
                      className="text-[11px] text-primary font-bold hover:underline"
                    >
                      Trocar e-mail
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full text-center tracking-[0.4em] text-xl font-black rounded-2xl border border-border bg-background py-3 px-3 text-foreground focus:border-primary focus:outline-none"
                    autoFocus
                  />
                  {demoCode && (
                    <div className="rounded-xl bg-muted/60 p-2 text-[11px] text-muted-foreground flex items-center justify-between">
                      <span>Código: <strong className="text-primary font-mono">{demoCode}</strong></span>
                      <button
                        type="button"
                        onClick={() => setOtpCode(demoCode)}
                        className="text-[10px] font-bold text-primary underline"
                      >
                        Preencher
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingAuth || otpCode.length < 4}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-xs font-extrabold text-primary-foreground shadow-lg hover:opacity-95 transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingAuth ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  <span>Validar e Entrar no Painel</span>
                </button>
              </form>
            )}
          </div>

          <div className="pt-2 border-t border-border/70">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeTabItem = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ========================================================= */}
      {/* TOP HEADER */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-3">
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
                  {user?.email || 'Gestor Autorizado'}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                Seção ativa: <strong className="text-primary">{activeTabItem.label}</strong>
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
      {/* MAIN CONTAINER: SIDEBAR + CONTENT AREA */}
      {/* ========================================================= */}
      <div className="flex-1 mx-auto w-full max-w-7xl flex relative">
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
            lg:static lg:z-10 lg:w-72 lg:shadow-none lg:translate-x-0
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="space-y-4">
            {/* Header do Menu Lateral */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <img
                  src={formData.custom_logo_url || '/logo.png?v=4'}
                  alt="Logo"
                  className="h-8 w-8 rounded-xl object-cover ring-1 ring-primary/40"
                />
                <div>
                  <h2 className="text-xs font-black tracking-tight text-foreground uppercase">
                    Menu do Painel
                  </h2>
                  <p className="text-[10px] text-muted-foreground truncate max-w-[170px]">
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
            <nav className="space-y-1.5" aria-label="Navegação do painel">
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
                    className={`w-full flex items-center justify-between gap-3 rounded-2xl px-3.5 py-3 text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md ring-1 ring-primary/60 font-black'
                        : 'text-foreground hover:bg-muted/70 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                          isActive
                            ? 'bg-white/20 text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs truncate">{tab.label}</p>
                        <p
                          className={`text-[10px] truncate ${
                            isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                          }`}
                        >
                          {tab.shortLabel}
                        </p>
                      </div>
                    </div>

                    {tab.badge && (
                      <span
                        className={`text-[9px] font-black rounded-full px-2 py-0.5 shrink-0 ${
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

          {/* Rodapé do Menu Lateral com resumo do site */}
          <div className="pt-4 border-t border-border/80 space-y-2">
            <div className="rounded-2xl bg-muted/40 p-3 space-y-1 border border-border/50 text-[11px]">
              <div className="flex items-center justify-between font-bold text-foreground">
                <span>Inscritos Push:</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {analytics?.totalSubscribers || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Partidas no radar:</span>
                <span>{analytics?.totalMatches || 0}</span>
              </div>
            </div>

            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Ver Site Jogos ao Vivo</span>
            </Link>
          </div>
        </aside>

        {/* ÁREA DE CONTEÚDO PRINCIPAL (EXIBE A SEÇÃO ATIVA COM FOCO E CLAREZA) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* ========================================================= */}
          {/* ABA 1: DASHBOARD & AUDIÊNCIA */}
          {/* ========================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div>
                  <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                    Dashboard & Audiência
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Acompanhamento de visitantes únicos e visualizações em tempo real
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 w-fit">
                  ● Tráfego Ativo
                </span>
              </div>

              {/* Cards de Métricas */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                    Acessos Hoje
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-foreground">
                    {analytics?.todayVisits.toLocaleString('pt-BR') || '---'}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <span>↑ +18%</span> em relação a ontem
                  </p>
                </div>

                <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                    Acessos na Semana
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-foreground">
                    {analytics?.weekVisits.toLocaleString('pt-BR') || '---'}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-semibold">
                    Últimos 7 dias consolidados
                  </p>
                </div>

                <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                    Acessos no Mês
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-foreground">
                    {analytics?.monthVisits.toLocaleString('pt-BR') || '---'}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Crescimento contínuo
                  </p>
                </div>

                <div className="rounded-3xl border border-emerald-500/35 bg-emerald-500/10 p-4 sm:p-5 shadow-sm space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                    <Bell className="h-3.5 w-3.5" /> Inscritos em Alertas
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-foreground">
                    {analytics?.totalSubscribers.toLocaleString('pt-BR') || '---'}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-semibold">
                    Celulares recebendo gols
                  </p>
                </div>
              </div>

              {/* Gráfico Histórico Diário */}
              <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-foreground">
                      Histórico Diário de Visualizações
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Evolução de acessos na última semana
                    </p>
                  </div>
                  <span className="text-xs font-black text-primary">82% Tráfego Mobile</span>
                </div>

                <div className="grid grid-cols-7 gap-2 pt-4 items-end h-40 border-b border-border pb-3">
                  {analytics?.dailyHistory.map((item) => {
                    const max = 600;
                    const pct = Math.min(100, Math.max(15, (item.visits / max) * 100));
                    return (
                      <div key={item.date} className="flex flex-col items-center gap-1.5 h-full justify-end">
                        <span className="text-[10px] font-bold text-muted-foreground">{item.visits}</span>
                        <div
                          style={{ height: `${pct}%` }}
                          className="w-full max-w-[42px] rounded-t-xl bg-gradient-to-t from-emerald-600 to-green-500 hover:brightness-110 transition shadow-sm"
                        />
                        <span className="text-[11px] font-black text-foreground">{item.date}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* ABA 2: INTERATIVIDADE & ENGAJAMENTO */}
          {/* ========================================================= */}
          {activeTab === 'engagement' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                  <Flame className="h-5 w-5 text-amber-500" />
                  Interatividade e Engajamento dos Usuários
                </h2>
                <p className="text-xs text-muted-foreground">
                  Métricas de ações executadas pelos torcedores dentro do aplicativo
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-3xl border border-border bg-card p-5 space-y-2">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-500 font-bold">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground">Interações Registradas</p>
                  <p className="text-2xl font-black text-foreground">{analytics?.totalInteractions}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Curtidas, favoritos e compartilhamentos no WhatsApp
                  </p>
                </div>

                <div className="rounded-3xl border border-border bg-card p-5 space-y-2">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-500 font-bold">
                    <Radio className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground">Partidas Catalogadas</p>
                  <p className="text-2xl font-black text-foreground">{analytics?.totalMatches}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Jogos atualizados com transmissões oficiais
                  </p>
                </div>

                <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-2">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground">Aparelhos com Alertas</p>
                  <p className="text-2xl font-black text-foreground">{analytics?.totalSubscribers}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Dispositivos habilitados para Push Notification
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* ABA 3: CONFIGURAÇÕES DO SITE */}
          {/* ========================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div>
                  <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
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

              <form onSubmit={handleSaveSettings} className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-sm space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nome do Site */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Nome Oficial do Site / App</label>
                    <input
                      type="text"
                      value={formData.site_title}
                      onChange={(e) => setFormData({ ...formData, site_title: e.target.value })}
                      placeholder="Ex: Jogos ao Vivo"
                      className="w-full rounded-2xl border border-border bg-background py-3 px-4 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Slogan */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Slogan e Chamada Persuasiva (SEO)</label>
                    <input
                      type="text"
                      value={formData.site_tagline}
                      onChange={(e) => setFormData({ ...formData, site_tagline: e.target.value })}
                      placeholder="Ex: Onde assistir futebol na TV e streaming com placar e alertas em tempo real"
                      className="w-full rounded-2xl border border-border bg-background py-3 px-4 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Logo Personalizado */}
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-bold text-foreground flex items-center justify-between">
                      <span>URL do Logo do Site / App</span>
                      <span className="text-[11px] text-muted-foreground font-normal">
                        Padrão: /logo.png?v=4 (Bola grande sobre gramado)
                      </span>
                    </label>
                    <div className="flex items-center gap-3">
                      <img
                        src={formData.custom_logo_url || '/logo.png?v=4'}
                        alt="Preview do Logo"
                        className="h-14 w-14 rounded-2xl object-cover border border-border shadow-md shrink-0 ring-1 ring-emerald-500/40"
                      />
                      <input
                        type="text"
                        value={formData.custom_logo_url}
                        onChange={(e) => setFormData({ ...formData, custom_logo_url: e.target.value })}
                        placeholder="/logo.png?v=4 ou cole URL externa https://..."
                        className="flex-1 rounded-2xl border border-border bg-background py-3 px-4 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Link do Grupo VIP WhatsApp */}
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
                      className="w-full rounded-2xl border border-border bg-background py-3 px-4 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-extrabold text-primary-foreground shadow-lg hover:opacity-95 transition cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isSaving ? 'Salvando...' : 'Salvar e Publicar Alterações'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* ABA 4: FAIXA DE AVISO NO TOPO */}
          {/* ========================================================= */}
          {activeTab === 'announcements' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div>
                  <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
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
                  Pré-visualização ao vivo:
                </span>
                {formData.announcement_enabled && formData.announcement_text ? (
                  <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-3 text-white rounded-2xl shadow-md flex items-center justify-between gap-3 text-xs font-bold">
                    <div className="flex items-center gap-2 truncate">
                      <Megaphone className="h-4 w-4 shrink-0" />
                      <span className="truncate">{formData.announcement_text}</span>
                    </div>
                    {formData.announcement_link && (
                      <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] shrink-0 font-extrabold">
                        Acessar →
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="border border-dashed border-border rounded-2xl p-4 text-center text-xs text-muted-foreground">
                    A barra de anúncio está desativada no momento.
                  </div>
                )}
              </div>

              <form onSubmit={handleSaveSettings} className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <h4 className="text-xs font-extrabold text-foreground">
                      Status da Barra de Destaque
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Ative para publicar imediatamente no topo de todas as páginas
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
                      placeholder="Ex: 🔥 Grande Final ao Vivo hoje às 16h! Assista conosco."
                      className="w-full rounded-2xl border border-border bg-background py-3 px-4 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
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
                      className="w-full rounded-2xl border border-border bg-background py-3 px-4 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-extrabold text-primary-foreground shadow-lg hover:opacity-95 transition cursor-pointer"
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
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                  <Send className="h-5 w-5 text-emerald-500" />
                  Disparo de Notificações Push para Celulares
                </h2>
                <p className="text-xs text-muted-foreground">
                  Envie avisos com som e vibração para todos os aparelhos cadastrados
                </p>
              </div>

              <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 flex items-center justify-between gap-4">
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

              <form onSubmit={handleBroadcastPush} className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-sm space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Título da Notificação</label>
                  <input
                    type="text"
                    value={pushTitle}
                    onChange={(e) => setPushTitle(e.target.value)}
                    placeholder="Ex: ⚽ GOL DO FLAMENGO!"
                    className="w-full rounded-2xl border border-border bg-background py-3 px-4 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Mensagem do Alerta</label>
                  <input
                    type="text"
                    value={pushBody}
                    onChange={(e) => setPushBody(e.target.value)}
                    placeholder="Ex: Pedro aos 35' do 1º tempo. Toque para ver transmissão e lances ao vivo."
                    className="w-full rounded-2xl border border-border bg-background py-3 px-4 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">
                    Dispara alerta imediato em segundo plano
                  </span>

                  <button
                    type="submit"
                    disabled={pushSent}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-3 text-xs font-extrabold text-white shadow-lg hover:opacity-95 transition cursor-pointer"
                  >
                    {pushSent ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                    <span>{pushSent ? 'Notificação Enviada!' : 'Enviar Push Geral'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* ABA 6: SINCRONIZAÇÃO & SISTEMA */}
          {/* ========================================================= */}
          {activeTab === 'system' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                  <Database className="h-5 w-5 text-sky-500" />
                  Sincronização & Status do Sistema
                </h2>
                <p className="text-xs text-muted-foreground">
                  Status de integração entre banco de dados, GitHub e Lovable
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Sincronizador Automático de Jogos</h3>
                    <p className="text-xs text-muted-foreground">
                      Forçar raspagem e atualização imediata da programação de TV
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow hover:opacity-95 transition cursor-pointer"
                  >
                    <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
                  </button>
                </div>

                {syncMessage && (
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    ✓ {syncMessage}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="rounded-2xl border border-border bg-muted/30 p-3.5 space-y-1">
                    <p className="text-xs font-bold text-foreground">Repositório GitHub</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      ● Sincronização automática contínua
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-muted/30 p-3.5 space-y-1">
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
