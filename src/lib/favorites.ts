import { useState, useEffect } from 'react';
import { MatchItem } from './types';

const STORAGE_KEY = 'futebol_na_tv_favorite_teams';

export function getStoredFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function saveStoredFavorites(favorites: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (err) {
    console.warn('[Favorites] Falha ao salvar favoritos:', err);
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(getStoredFavorites());
  }, []);

  const toggleFavorite = (teamName: string) => {
    if (!teamName) return;
    const clean = teamName.trim();
    setFavorites(prev => {
      const exists = prev.some(t => t.toLowerCase() === clean.toLowerCase());
      const next = exists
        ? prev.filter(t => t.toLowerCase() !== clean.toLowerCase())
        : [...prev, clean];
      saveStoredFavorites(next);
      return next;
    });
  };

  const isFavorite = (teamName: string): boolean => {
    if (!teamName) return false;
    const clean = teamName.trim().toLowerCase();
    return favorites.some(t => t.toLowerCase() === clean);
  };

  const matchHasFavorite = (match: MatchItem): boolean => {
    if (favorites.length === 0) return false;
    return isFavorite(match.team_home) || isFavorite(match.team_away);
  };

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    matchHasFavorite,
  };
}
