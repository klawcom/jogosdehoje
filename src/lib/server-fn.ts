import { createServerFn } from '@tanstack/react-start';
import { scrapeGoalMatches } from './scraper';
import { saveMatchesToSupabase, recordSyncLog } from './supabase';
import { getLiveScoresForMatches, enrichMatchesWithScores, LiveScoreData } from './live-scores';
import { MatchItem } from './types';

export const fetchMatchesServerFn = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const scrapeRes = await scrapeGoalMatches();

    if (scrapeRes.success && scrapeRes.days.length > 0) {
      // Flatten all matches across days for Supabase upsert
      const allMatches = scrapeRes.days.flatMap(d => d.matches);

      // Fetch live scores
      try {
        const scoresMap = await getLiveScoresForMatches(allMatches);
        if (scoresMap && Object.keys(scoresMap).length > 0) {
          scrapeRes.days = scrapeRes.days.map(d => ({
            ...d,
            matches: enrichMatchesWithScores(d.matches, scoresMap),
          }));
        }
      } catch (scoreErr) {
        console.warn('[fetchMatchesServerFn] Falha ao enriquecer placares:', scoreErr);
      }

      saveMatchesToSupabase(allMatches).catch(err => {
        console.warn('[Sync] Falha assíncrona ao salvar no Supabase:', err);
      });
      recordSyncLog('success', allMatches.length, 'Sincronização via Goal.com').catch(() => {});
    }

    return {
      success: scrapeRes.success,
      days: scrapeRes.days,
      lastUpdated: scrapeRes.lastUpdated,
      source: scrapeRes.source,
      message: scrapeRes.message,
    };
  } catch (err: any) {
    console.error('[fetchMatchesServerFn] Erro:', err);
    return {
      success: false,
      days: [],
      lastUpdated: '--:--',
      source: 'error',
      message: err.message || 'Erro inesperado ao buscar jogos',
    };
  }
});

/**
 * Silent background endpoint to fetch updated live scores without reloading the page
 */
export const fetchLiveScoresServerFn = createServerFn({ method: 'POST' }).handler(
  async (ctx: any) => {
    try {
      const matches: MatchItem[] = ctx?.data || [];
      const scores = await getLiveScoresForMatches(matches);
      return { success: true, scores };
    } catch (err: any) {
      console.warn('[fetchLiveScoresServerFn] Erro:', err);
      return { success: false, scores: {} as Record<string, LiveScoreData> };
    }
  }
);

