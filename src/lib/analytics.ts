import { supabase } from '../integrations/supabase/client';

export interface DailyVisitPoint {
  date: string;
  label: string;
  fullDate: string;
  visits: number;
}

export interface InteractionBreakdown {
  likes: number;
  matchAlerts: number;
  teamFavorites: number;
  champFavorites: number;
  whatsappShares: number;
}

export interface PageBreakdown {
  home: number;
  brasileirao: number;
  other: number;
}

export interface AnalyticsSummary {
  todayVisits: number;
  weekVisits: number;
  monthVisits: number;
  totalSubscribers: number;
  totalInteractions: number;
  totalMatches: number;
  dailyHistory: DailyVisitPoint[];
  interactions: InteractionBreakdown;
  pages: PageBreakdown;
}

const STORAGE_VISITOR_KEY = 'jogosdehoje_visitor_id';

function getVisitorId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    let id = localStorage.getItem(STORAGE_VISITOR_KEY);
    if (!id) {
      id = 'v_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now();
      localStorage.setItem(STORAGE_VISITOR_KEY, id);
    }
    return id;
  } catch {
    return 'anon';
  }
}

/**
 * Registra visita de página real deduplicada por sessão
 */
export async function trackVisit(page = '/'): Promise<void> {
  if (typeof window === 'undefined') return;

  const sessionKey = `visited_${page}`;
  if (sessionStorage.getItem(sessionKey)) return;
  sessionStorage.setItem(sessionKey, '1');

  const visitorId = getVisitorId();

  if (supabase) {
    try {
      await supabase.from('site_visits').insert({
        visitor_id: visitorId,
        page,
        user_agent: navigator.userAgent.slice(0, 200),
        referrer: document.referrer ? document.referrer.slice(0, 200) : null,
      });
    } catch {
      // Falha silenciosa para não travar a experiência do usuário
    }
  }
}

/**
 * Registra interações reais (curtida, favoritos, compartilhamento)
 */
export async function trackInteraction(
  interactionType: 'favorite_team' | 'favorite_championship' | 'match_alert' | 'like' | 'share_whatsapp',
  targetId?: string
): Promise<void> {
  if (typeof window === 'undefined' || !supabase) return;
  try {
    const visitorId = getVisitorId();
    await supabase.from('site_interactions').insert({
      interaction_type: interactionType,
      target_id: targetId || null,
      visitor_id: visitorId,
    });
  } catch {
    // Falha silenciosa
  }
}

/**
 * Carrega dados 100% REAIS do banco para o Dashboard (zero valores fakes)
 */
export async function fetchAnalyticsDashboard(): Promise<AnalyticsSummary> {
  const zeroState: AnalyticsSummary = {
    todayVisits: 0,
    weekVisits: 0,
    monthVisits: 0,
    totalSubscribers: 0,
    totalInteractions: 0,
    totalMatches: 0,
    dailyHistory: buildEmptyDailyHistory(),
    interactions: {
      likes: 0,
      matchAlerts: 0,
      teamFavorites: 0,
      champFavorites: 0,
      whatsappShares: 0,
    },
    pages: {
      home: 0,
      brasileirao: 0,
      other: 0,
    },
  };

  if (!supabase) return zeroState;

  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();

    const [
      todayRes,
      weekRes,
      monthRes,
      subsRes,
      interactionsRes,
      matchesRes,
      visitsListRes,
      interactionsListRes,
    ] = await Promise.all([
      supabase.from('site_visits').select('*', { count: 'exact', head: true }).gte('visited_at', todayStart),
      supabase.from('site_visits').select('*', { count: 'exact', head: true }).gte('visited_at', sevenDaysAgo),
      supabase.from('site_visits').select('*', { count: 'exact', head: true }).gte('visited_at', thirtyDaysAgo),
      supabase.from('push_subscriptions').select('*', { count: 'exact', head: true }),
      supabase.from('site_interactions').select('*', { count: 'exact', head: true }),
      supabase.from('matches').select('*', { count: 'exact', head: true }),
      supabase.from('site_visits').select('visited_at, page').gte('visited_at', sevenDaysAgo),
      supabase.from('site_interactions').select('interaction_type'),
    ]);

    // Histórico diário real dos últimos 7 dias
    const dailyMap = new Map<string, number>();
    const pageMap = { home: 0, brasileirao: 0, other: 0 };

    if (visitsListRes.data && Array.isArray(visitsListRes.data)) {
      visitsListRes.data.forEach((v: { visited_at: string; page?: string }) => {
        if (v.visited_at) {
          const dayKey = v.visited_at.slice(0, 10);
          dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + 1);
        }
        if (v.page === '/') pageMap.home++;
        else if (v.page === '/brasileirao') pageMap.brasileirao++;
        else pageMap.other++;
      });
    }

    const realDailyHistory = buildRealDailyHistory(dailyMap);

    // Contagem real das interações por tipo
    const interactionsMap: InteractionBreakdown = {
      likes: 0,
      matchAlerts: 0,
      teamFavorites: 0,
      champFavorites: 0,
      whatsappShares: 0,
    };

    if (interactionsListRes.data && Array.isArray(interactionsListRes.data)) {
      interactionsListRes.data.forEach((item: { interaction_type: string }) => {
        if (item.interaction_type === 'like') interactionsMap.likes++;
        else if (item.interaction_type === 'match_alert') interactionsMap.matchAlerts++;
        else if (item.interaction_type === 'favorite_team') interactionsMap.teamFavorites++;
        else if (item.interaction_type === 'favorite_championship') interactionsMap.champFavorites++;
        else if (item.interaction_type === 'share_whatsapp') interactionsMap.whatsappShares++;
      });
    }

    return {
      todayVisits: todayRes.count || 0,
      weekVisits: weekRes.count || 0,
      monthVisits: monthRes.count || 0,
      totalSubscribers: subsRes.count || 0,
      totalInteractions: interactionsRes.count || 0,
      totalMatches: matchesRes.count || 0,
      dailyHistory: realDailyHistory,
      interactions: interactionsMap,
      pages: pageMap,
    };
  } catch (err) {
    console.warn('[Analytics] Falha ao carregar dados do banco:', err);
    return zeroState;
  }
}

/**
 * Cria a estrutura dos últimos 7 dias com datas reais
 */
function buildEmptyDailyHistory(): DailyVisitPoint[] {
  const points: DailyVisitPoint[] = [];
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dayLabel = daysOfWeek[d.getDay()];
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const fullDate = `${dd}/${mm}`;
    points.push({
      date: dayLabel,
      label: fullDate,
      fullDate: d.toISOString().slice(0, 10),
      visits: 0,
    });
  }

  return points;
}

function buildRealDailyHistory(dailyMap: Map<string, number>): DailyVisitPoint[] {
  const points: DailyVisitPoint[] = [];
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const isoDay = d.toISOString().slice(0, 10);
    const dayLabel = daysOfWeek[d.getDay()];
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const fullDate = `${dd}/${mm}`;
    const realCount = dailyMap.get(isoDay) || 0;

    points.push({
      date: dayLabel,
      label: fullDate,
      fullDate: isoDay,
      visits: realCount,
    });
  }

  return points;
}

/**
 * Permite ao gestor zerar ou limpar métricas de teste do banco de dados
 */
export async function resetAnalyticsData(): Promise<boolean> {
  if (!supabase) return false;
  try {
    await Promise.all([
      supabase.from('site_visits').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('site_interactions').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    ]);
    return true;
  } catch (err) {
    console.warn('[Analytics] Falha ao zerar dados:', err);
    return false;
  }
}
