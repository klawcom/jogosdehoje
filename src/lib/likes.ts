import { useState, useEffect } from 'react';

const LIKES_STORAGE_KEY = 'jogos_de_hoje_likes_v1';
const LIKES_COUNT_KEY = 'jogos_de_hoje_likes_counts_v1';

export function getStoredLikes(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LIKES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getStoredLikeCounts(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LIKES_COUNT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function useLikes() {
  const [likedMatches, setLikedMatches] = useState<string[]>([]);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setLikedMatches(getStoredLikes());
    setLikeCounts(getStoredLikeCounts());
  }, []);

  const isLiked = (matchId: string): boolean => {
    return likedMatches.includes(matchId);
  };

  const getLikeCount = (matchId: string): number => {
    if (!matchId) return 0;
    const baseCount = likeCounts[matchId] ?? 0;
    return baseCount + (isLiked(matchId) ? 1 : 0);
  };

  const toggleLike = (matchId: string) => {
    if (!matchId) return;

    setLikedMatches((prev) => {
      const already = prev.includes(matchId);
      const next = already ? prev.filter((id) => id !== matchId) : [...prev, matchId];
      try {
        localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Storage error:', e);
      }
      return next;
    });
  };

  return {
    isLiked,
    getLikeCount,
    toggleLike,
  };
}
