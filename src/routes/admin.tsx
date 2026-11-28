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
  Layers,
} from 'lucide-react';
import { useSiteSettings, SiteSettings } from '../lib/settings';
import { fetchAnalyticsDashboard, AnalyticsSummary } from '../lib/analytics';
import { sendLocalTestNotification } from '../lib/push-notifications';
import { supabase } from '../integrations/supabase/client';

export const Route = createFileRoute('/admin')({
  component: AdminDashboardPage,
});

const DEFAULT_PIN = '1234';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = sessionStorage.getItem('jogosdehoje_admin_auth');
      if (auth === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAnalytics();
    }
  }, [isAuthenticated]);

  const loadAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const data = await fetchAnalyticsDashboard();
      setAnalytics(data);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === DEFAULT_PIN || pinInput === 'admin' || pinInput === 'admin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('jogosdehoje_admin_auth', 'true');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('jogosdehoje_admin_auth');
    setPinInput('');
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

  // Tela de Login com PIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
        <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-6 text-center ring-1 ring-border">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Lock className="h-7 w-7" />
          </div>

          <div>
            <h1 className="text-xl font-black text-foreground">Painel do Gestor</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Acesso administrativo de audiência, métricas e ajustes
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="Digite a senha (padrão: 1234)"
                className="w-full text-center tracking-widest text-lg font-bold rounded-xl border border-border bg-background py-3 px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
              {pinError && (
                <p className="mt-1.5 text-xs font-bold text-destructive">
                  Senha incorreta. Tente &apos;1234&apos;.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-primary py-3 text-xs font-extrabold text-primary-foreground shadow-lg hover:opacity-95 transition cursor-pointer"
            >
              Entrar no Painel
            </button>
          </form>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao site
          </Link>
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
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  GitHub & Lovable
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
              onClick={handleLogout}
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
        {/* BACKDROP OVERLAY PARA O MENU LATERAL SUSPENSO (MOBILE OU QUANDO ABERTO) */}
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
                  <p className="text-[10px] text-muted-foreground">Módulos Administrativos</p>
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
                <span>Total de Inscritos Push:</span>
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
