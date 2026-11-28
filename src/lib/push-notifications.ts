import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { getStoredFavorites, getStoredFavoriteChampionships } from './favorites';

// Chave Pública VAPID (Web Push RFC 8030)
export const VAPID_PUBLIC_KEY =
  'BORP976UD3nMq3bDhp5Xc0JAbecKXE1hZJUZu8erhoaB7xdigzTYuOBKKXlIKnxsYezhXltsHP73vUks64fU6xo';

const PREFS_STORAGE_KEY = 'jogosdehoje_push_preferences';
const STATUS_STORAGE_KEY = 'jogosdehoje_push_subscribed';

export interface NotificationPreferences {
  notify_pregame: boolean; // 10 min antes
  notify_kickoff: boolean; // Jogo começou
  notify_goals: boolean; // Gols
  notify_halftime: boolean; // Intervalo
  notify_end: boolean; // Fim de jogo
  notify_lineups: boolean; // Escalações
  notify_table_change: boolean; // Subiu/caiu na tabela
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  notify_pregame: true,
  notify_kickoff: true,
  notify_goals: true,
  notify_halftime: false,
  notify_end: true,
  notify_lineups: true,
  notify_table_change: true,
};

export function getStoredPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATION_PREFERENCES;
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_PREFERENCES;
    return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

export function saveStoredPreferences(prefs: NotificationPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch (err) {
    console.warn('[Push] Falha ao salvar preferências:', err);
  }
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function isStandaloneApp(): boolean {
  if (typeof window === 'undefined') return false;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  return isStandalone || isIosStandalone;
}

export function isIosDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'default';
  return Notification.permission;
}

/**
 * Registra o Service Worker do site (/sw.js)
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return reg;
  } catch (err) {
    console.warn('[SW] Falha ao registrar Service Worker:', err);
    return null;
  }
}

/**
 * Inscreve o navegador no Web Push e salva os dados no Supabase
 */
export async function subscribeToPush(
  favoriteTeams?: string[],
  favoriteChampionships?: string[],
  preferences?: NotificationPreferences
): Promise<{ success: boolean; message: string }> {
  if (!isPushSupported()) {
    return {
      success: false,
      message: 'Seu navegador atual não suporta notificações Push em segundo plano.',
    };
  }

  try {
    // 1. Pedir permissão ao usuário
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      return {
        success: false,
        message: 'Permissão de notificação não concedida ou bloqueada.',
      };
    }

    // 2. Garantir service worker ativo
    const reg = await registerServiceWorker();
    if (!reg) {
      return { success: false, message: 'Não foi possível inicializar o Service Worker.' };
    }

    // Aguarda o Service Worker estar pronto
    const readyReg = await navigator.serviceWorker.ready;

    // 3. Obter ou criar Push Subscription
    let sub = await readyReg.pushManager.getSubscription();
    if (!sub) {
      const appServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      sub = await readyReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appServerKey.buffer as ArrayBuffer,
      });
    }

    const subJson = sub.toJSON();
    const endpoint = sub.endpoint;
    const p256dh = subJson.keys?.p256dh || '';
    const auth = subJson.keys?.auth || '';

    if (!endpoint || !p256dh || !auth) {
      return { success: false, message: 'Chaves de criptografia push inválidas.' };
    }

    // 4. Salvar no Supabase
    const teams = favoriteTeams ?? getStoredFavorites();
    const champs = favoriteChampionships ?? getStoredFavoriteChampionships();
    const prefs = preferences ?? getStoredPreferences();

    saveStoredPreferences(prefs);
    localStorage.setItem(STATUS_STORAGE_KEY, 'true');

    if (supabase) {
      await supabase.from('push_subscriptions').upsert(
        {
          endpoint,
          p256dh,
          auth,
          favorite_teams: teams,
          favorite_championships: champs,
          notify_pregame: prefs.notify_pregame,
          notify_kickoff: prefs.notify_kickoff,
          notify_goals: prefs.notify_goals,
          notify_halftime: prefs.notify_halftime,
          notify_end: prefs.notify_end,
          notify_lineups: prefs.notify_lineups,
          notify_table_change: prefs.notify_table_change,
          user_agent: navigator.userAgent,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' }
      );
    }

    return {
      success: true,
      message: 'Alertas no celular ativados com sucesso!',
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[Push] Erro ao inscrever no push:', err);
    return {
      success: false,
      message: `Erro ao ativar notificações: ${errMsg}`,
    };
  }
}

/**
 * Remove a inscrição de push no navegador e no banco
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      const endpoint = sub.endpoint;
      await sub.unsubscribe();
      if (supabase && endpoint) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
      }
    }
    localStorage.removeItem(STATUS_STORAGE_KEY);
    return true;
  } catch (err) {
    console.error('[Push] Falha ao desinscrever:', err);
    return false;
  }
}

/**
 * Dispara uma notificação de demonstração/teste imediata
 */
export async function sendLocalTestNotification(teamName?: string): Promise<boolean> {
  if (!isPushSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const team = teamName || 'Seu Time';
  const title = `⚽ GOL DO ${team.toUpperCase()}!`;
  const body = `Gol confirmado! ${team} 1 x 0 Adversário — 28' 1ºT. Clique para ver a transmissão.`;

  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'test-notification',
      data: { url: '/' },
    } as NotificationOptions);
    return true;
  } catch {
    new Notification(title, {
      body,
      icon: '/icon-192.png',
    });
    return true;
  }
}

/**
 * Hook React para gerenciar permissões, status e preferências de notificações
 */
export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);

  const checkStatus = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const supported = isPushSupported();
    setIsSupported(supported);
    setIsStandalone(isStandaloneApp());
    setIsIos(isIosDevice());
    setPreferences(getStoredPreferences());

    if (!supported) return;

    setPermission(Notification.permission);

    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        setIsSubscribed(Boolean(sub && Notification.permission === 'granted'));
      } else {
        setIsSubscribed(false);
      }
    } catch {
      setIsSubscribed(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const toggleSubscription = async (
    teams?: string[],
    championships?: string[]
  ): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      if (isSubscribed) {
        await unsubscribeFromPush();
        setIsSubscribed(false);
        return { success: true, message: 'Alertas desativados.' };
      } else {
        const res = await subscribeToPush(teams, championships, preferences);
        await checkStatus();
        return res;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    saveStoredPreferences(next);

    // Se já estiver inscrito, atualiza no Supabase em segundo plano
    if (isSubscribed && isPushSupported()) {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub && supabase) {
          const updatePayload: Record<string, unknown> = {
            [key]: value,
            updated_at: new Date().toISOString(),
          };
          await (supabase.from('push_subscriptions') as any)
            .update(updatePayload)
            .eq('endpoint', sub.endpoint);
        }
      } catch (err) {
        console.warn('[Push] Falha ao sincronizar preferência:', err);
      }
    }
  };

  return {
    isSupported,
    isStandalone,
    isIos,
    permission,
    isSubscribed,
    isLoading,
    preferences,
    updatePreference,
    toggleSubscription,
    checkStatus,
    sendLocalTestNotification,
  };
}
