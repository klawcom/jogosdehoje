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

-- ==============================================================================
-- 5. NOTIFICAÇÕES PUSH EM SEGUNDO PLANO (WEB PUSH API)
-- ==============================================================================

-- Tabela de Inscrições de Celulares e Dispositivos
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  favorite_teams TEXT[] NOT NULL DEFAULT '{}',
  favorite_championships TEXT[] NOT NULL DEFAULT '{}',
  notify_pregame BOOLEAN NOT NULL DEFAULT true,       -- Alerta 10 min antes
  notify_kickoff BOOLEAN NOT NULL DEFAULT true,       -- Início de partida
  notify_goals BOOLEAN NOT NULL DEFAULT true,         -- Gols em tempo real
  notify_halftime BOOLEAN NOT NULL DEFAULT false,     -- Intervalo
  notify_end BOOLEAN NOT NULL DEFAULT true,           -- Fim de jogo
  notify_lineups BOOLEAN NOT NULL DEFAULT true,       -- Escalação oficial
  notify_table_change BOOLEAN NOT NULL DEFAULT true,  -- Subiu / caiu na tabela
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_subs_endpoint ON push_subscriptions (endpoint);
CREATE INDEX IF NOT EXISTS idx_push_subs_teams ON push_subscriptions USING gin (favorite_teams);

-- Tabela de Histórico de Notificações Enviadas (Garante idempotência / sem repetições)
CREATE TABLE IF NOT EXISTS sent_notifications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'pregame', 'kickoff', 'goal_home_X', 'goal_away_Y', 'lineup', 'end', 'table'
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  recipient_count INT DEFAULT 0,
  sent_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_match_event UNIQUE (match_id, event_type)
);

CREATE INDEX IF NOT EXISTS idx_sent_notif_match ON sent_notifications_log (match_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sent_notifications_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso a inscrições push" ON push_subscriptions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acesso a logs de notificações" ON sent_notifications_log
  FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 6. ANALYTICS, AUDIÊNCIA E INTERATIVIDADE
-- ==============================================================================

-- Tabela de Visitas e Acessos ao Site (Dia, Semana, Mês)
CREATE TABLE IF NOT EXISTS site_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  page TEXT NOT NULL DEFAULT '/',
  user_agent TEXT,
  referrer TEXT,
  visited_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_visits_visited_at ON site_visits (visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_visits_visitor_id ON site_visits (visitor_id);

-- Tabela de Interações e Alertas Criados
CREATE TABLE IF NOT EXISTS site_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_type TEXT NOT NULL, -- 'favorite_team', 'favorite_championship', 'match_alert', 'like', 'share_whatsapp', 'calendar_add'
  target_id TEXT,
  visitor_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interactions_type ON site_interactions (interaction_type);
CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON site_interactions (created_at DESC);

-- ==============================================================================
-- 7. CONFIGURAÇÕES E AJUSTES DO GESTOR (PAINEL ADMIN)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  site_title TEXT NOT NULL DEFAULT 'Jogos ao Vivo',
  site_tagline TEXT NOT NULL DEFAULT 'Onde assistir futebol na TV e streaming com placar e alertas em tempo real',
  announcement_enabled BOOLEAN NOT NULL DEFAULT false,
  announcement_text TEXT DEFAULT '',
  announcement_link TEXT DEFAULT '',
  whatsapp_group_url TEXT DEFAULT '',
  custom_logo_url TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso a visitas" ON site_visits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso a interacoes" ON site_interactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso a configuracoes" ON site_settings FOR ALL USING (true) WITH CHECK (true);

-- Inserir configuração padrão inicial
INSERT INTO site_settings (key, site_title, site_tagline)
VALUES ('general', 'Jogos ao Vivo', 'Onde assistir futebol na TV e streaming com placar e alertas em tempo real')
ON CONFLICT (key) DO NOTHING;


