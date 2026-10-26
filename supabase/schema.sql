-- ==============================================================================
-- SCHEMA DO BANCO DE DADOS: FUTEBOL NA TV (SUPABASE)
-- Recriação das tabelas de jogos e logs de sincronização
-- ==============================================================================

-- 1. Tabela de Jogos
DROP TABLE IF EXISTS matches CASCADE;
CREATE TABLE matches (
  id TEXT PRIMARY KEY,                       -- Ex: "2026_10_26_flamengo_palmeiras_16_00"
  date DATE NOT NULL,                        -- Data da partida (YYYY-MM-DD)
  match_title TEXT NOT NULL,                 -- "Flamengo x Palmeiras"
  team_home TEXT NOT NULL,                   -- "Flamengo"
  team_away TEXT NOT NULL,                   -- "Palmeiras"
  championship TEXT NOT NULL,                -- "Brasileirão Série A"
  time_br TEXT NOT NULL,                     -- "16:00" (Horário de Brasília)
  channels JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{ name: "Globo", type: "aberta" }]
  channel_types TEXT[] NOT NULL DEFAULT '{}',  -- ['aberta', 'fechada', 'streaming']
  source TEXT DEFAULT 'goal.com',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches (date);
CREATE INDEX IF NOT EXISTS idx_matches_championship ON matches (championship);
CREATE INDEX IF NOT EXISTS idx_matches_team_home ON matches (team_home);
CREATE INDEX IF NOT EXISTS idx_matches_team_away ON matches (team_away);
CREATE INDEX IF NOT EXISTS idx_matches_time_br ON matches (time_br);

-- 2. Tabela de Logs de Sincronização
DROP TABLE IF EXISTS sync_logs CASCADE;
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_sync_at TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL,                      -- 'success', 'warning', 'error'
  total_matches INT DEFAULT 0,
  message TEXT,
  source TEXT DEFAULT 'goal.com'
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON sync_logs (last_sync_at DESC);

-- 3. Políticas de Segurança (Row Level Security - RLS)
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- Leitura pública aberta para visualização no site
CREATE POLICY "Leitura pública de jogos" ON matches
  FOR SELECT USING (true);

-- Inserção/atualização para servidor ou função autenticada/anon
CREATE POLICY "Gravação de jogos sincronizados" ON matches
  FOR ALL USING (true);

CREATE POLICY "Leitura pública de logs" ON sync_logs
  FOR SELECT USING (true);

CREATE POLICY "Gravação de logs" ON sync_logs
  FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- 4. AGENDAMENTO AUTOMÁTICO VIA PG_CRON (7h e 12h no Horário de Brasília)
-- Horário de Brasília = UTC-3
-- 07:00 Brasília = 10:00 UTC
-- 12:00 Brasília = 15:00 UTC
-- ==============================================================================

-- Se sua instância Supabase tiver a extensão pg_cron e pg_net habilitadas:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- CREATE EXTENSION IF NOT EXISTS pg_net;

-- Sincronização matutina às 7h Brasília:
-- SELECT cron.schedule(
--   'sync-matches-07h-brasilia',
--   '0 10 * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://jogosdehoje.lovable.app/api/sync',
--     headers := '{"Content-Type": "application/json"}'::jsonb
--   );
--   $$
-- );

-- Sincronização do meio-dia às 12h Brasília:
-- SELECT cron.schedule(
--   'sync-matches-12h-brasilia',
--   '0 15 * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://jogosdehoje.lovable.app/api/sync',
--     headers := '{"Content-Type": "application/json"}'::jsonb
--   );
--   $$
-- );
