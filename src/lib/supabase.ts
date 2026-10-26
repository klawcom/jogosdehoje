import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MatchItem } from './types';

// Supabase environment keys (supports Lovable standard env variables)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    })
  : null;

/**
 * Saves or updates matches in the Supabase database
 */
export async function saveMatchesToSupabase(matches: MatchItem[]): Promise<{ count: number; error?: string }> {
  if (!supabase) {
    return { count: 0, error: 'Supabase não configurado (.env ausente)' };
  }

  try {
    const rows = matches.map(m => ({
      id: m.id,
      date: m.date,
      match_title: m.match_title,
      team_home: m.team_home,
      team_away: m.team_away,
      championship: m.championship,
      time_br: m.time_br,
      channels: m.channels,
      channel_types: m.channel_types,
      source: m.source || 'goal.com',
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('matches')
      .upsert(rows, { onConflict: 'id' })
      .select('id');

    if (error) {
      console.error('[Supabase] Erro no upsert de jogos:', error);
      return { count: 0, error: error.message };
    }

    return { count: data?.length || rows.length };
  } catch (err: any) {
    console.error('[Supabase] Exceção ao salvar jogos:', err);
    return { count: 0, error: err.message };
  }
}

/**
 * Loads matches for a given date from Supabase
 */
export async function loadMatchesFromSupabase(dateStr: string): Promise<MatchItem[] | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('date', dateStr)
      .order('time_br', { ascending: true });

    if (error || !data || data.length === 0) {
      return null;
    }

    return data as MatchItem[];
  } catch (err) {
    console.error('[Supabase] Erro ao carregar jogos:', err);
    return null;
  }
}

/**
 * Records a sync log entry in Supabase
 */
export async function recordSyncLog(
  status: 'success' | 'warning' | 'error',
  totalMatches: number,
  message?: string
) {
  if (!supabase) return;

  try {
    await supabase.from('sync_logs').insert({
      status,
      total_matches: totalMatches,
      message,
      last_sync_at: new Date().toISOString(),
      source: 'goal.com',
    });
  } catch (err) {
    console.warn('[Supabase] Erro ao gravar log de sincronização:', err);
  }
}
