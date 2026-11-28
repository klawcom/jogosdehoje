import { useState, useEffect, useCallback } from 'react';
import { MatchItem } from './types';
import { supabase } from '../integrations/supabase/client';
import { isChampionshipMatching } from './world-teams';

const STORAGE_KEY_TEAMS = 'futebol_na_tv_favorite_teams';
const STORAGE_KEY_CHAMPS = 'futebol_na_tv_favorite_championships';
const STORAGE_KEY_MATCHES = 'futebol_na_tv_match_alerts';

// -------------------------------------------------------------
// Times Favoritos
// -------------------------------------------------------------
export function getStoredFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEAMS);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function saveStoredFavorites(favorites: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_TEAMS, JSON.stringify(favorites));
  } catch (err) {
    console.warn('[Favorites] Falha ao salvar favoritos:', err);
  }
}

// -------------------------------------------------------------
// Campeonatos Favoritos
// -------------------------------------------------------------
export function getStoredFavoriteChampionships(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHAMPS);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function saveStoredFavoriteChampionships(champs: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CHAMPS, JSON.stringify(champs));
  } catch (err) {
    console.warn('[Favorites] Falha ao salvar campeonatos favoritos:', err);
  }
}

// -------------------------------------------------------------
// Alertas Individuais por Partida
// -------------------------------------------------------------
export function getStoredMatchAlerts(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MATCHES);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function saveStoredMatchAlerts(matchIds: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(matchIds));
  } catch (err) {
    console.warn('[Favorites] Falha ao salvar alertas de partidas:', err);
  }
}

// Sincroniza preferências salvas com Supabase Push Subscriptions se houver inscrição ativa
async function syncFavoritesWithSupabase(teams: string[], champs: string[]) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !supabase) return;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;

    await (supabase.from('push_subscriptions') as any)
      .update({
        favorite_teams: teams,
        favorite_championships: champs,
        updated_at: new Date().toISOString(),
      })
      .eq('endpoint', sub.endpoint);
  } catch (err) {
    console.warn('[Favorites] Falha ao sincronizar favoritos no banco:', err);
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteChampionships, setFavoriteChampionships] = useState<string[]>([]);
  const [matchAlerts, setMatchAlerts] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(getStoredFavorites());
    setFavoriteChampionships(getStoredFavoriteChampionships());
    setMatchAlerts(getStoredMatchAlerts());
  }, []);

  const toggleFavorite = useCallback((teamName: string) => {
    if (!teamName) return;
    const clean = teamName.trim();
    setFavorites((prev) => {
      const exists = prev.some((t) => t.toLowerCase() === clean.toLowerCase());
      const next = exists
        ? prev.filter((t) => t.toLowerCase() !== clean.toLowerCase())
        : [...prev, clean];
      saveStoredFavorites(next);
      syncFavoritesWithSupabase(next, getStoredFavoriteChampionships());
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (teamName: string): boolean => {
      if (!teamName) return false;
      const clean = teamName.trim().toLowerCase();
      return favorites.some((t) => t.toLowerCase() === clean);
    },
    [favorites]
  );

  const toggleFavoriteChampionship = useCallback((championshipName: string) => {
    if (!championshipName) return;
    const clean = championshipName.trim();
    setFavoriteChampionships((prev) => {
      const exists = prev.some((c) => c.toLowerCase() === clean.toLowerCase());
      const next = exists
        ? prev.filter((c) => c.toLowerCase() !== clean.toLowerCase())
        : [...prev, clean];
      saveStoredFavoriteChampionships(next);
      syncFavoritesWithSupabase(getStoredFavorites(), next);
      return next;
    });
  }, []);

  const isFavoriteChampionship = useCallback(
    (championshipName: string): boolean => {
      if (!championshipName) return false;
      return isChampionshipMatching(championshipName, favoriteChampionships);
    },
    [favoriteChampionships]
  );

  const toggleMatchAlert = useCallback((matchId: string) => {
    if (!matchId) return;
    setMatchAlerts((prev) => {
      const exists = prev.includes(matchId);
      const next = exists ? prev.filter((id) => id !== matchId) : [...prev, matchId];
      saveStoredMatchAlerts(next);
      return next;
    });
  }, []);

  const isMatchAlertActive = useCallback(
    (matchId: string): boolean => {
      if (!matchId) return false;
      return matchAlerts.includes(matchId);
    },
    [matchAlerts]
  );

  // Retorna se o jogo tem algum dos times favoritados
  const matchHasFavorite = useCallback(
    (match: MatchItem): boolean => {
      if (favorites.length === 0) return false;
      return isFavorite(match.team_home) || isFavorite(match.team_away);
    },
    [favorites, isFavorite]
  );

  // Retorna se a partida possui alerta ativo (por partida individual, por time OU por campeonato)
  const matchHasAlert = useCallback(
    (match: MatchItem): boolean => {
      if (matchAlerts.includes(match.id)) return true;
      if (isFavorite(match.team_home) || isFavorite(match.team_away)) return true;
      if (isFavoriteChampionship(match.championship)) return true;
      return false;
    },
    [matchAlerts, isFavorite, isFavoriteChampionship]
  );

  return {
    favorites,
    favoriteChampionships,
    matchAlerts,
    toggleFavorite,
    isFavorite,
    toggleFavoriteChampionship,
    isFavoriteChampionship,
    toggleMatchAlert,
    isMatchAlertActive,
    matchHasFavorite,
    matchHasAlert,
  };
}
