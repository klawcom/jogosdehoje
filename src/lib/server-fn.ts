import { createServerFn } from '@tanstack/react-start';
import { scrapeGoalMatches } from './scraper';
import { saveMatchesToSupabase, recordSyncLog } from './supabase';

export const fetchMatchesServerFn = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const scrapeRes = await scrapeGoalMatches();

    if (scrapeRes.success && scrapeRes.days.length > 0) {
      // Flatten all matches across days for Supabase upsert
      const allMatches = scrapeRes.days.flatMap(d => d.matches);
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
