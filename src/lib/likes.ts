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

  const getLikeCount = (matchId: string, initialBase = 12): number => {
    // Generate a pleasant deterministic pseudo base count if not modified
    let base = initialBase;
    if (matchId) {
      let h = 0;
      for (let i = 0; i < matchId.length; i++) {
        h = (h * 31 + matchId.charCodeAt(i)) % 89;
      }
      base = 15 + Math.abs(h);
    }
    return (likeCounts[matchId] ?? base) + (isLiked(matchId) ? 1 : 0);
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
