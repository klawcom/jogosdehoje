// Supabase Edge Function: sync-matches
// Executada às 7h e 12h de Brasília (10h e 15h UTC)
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GOAL_URL = 'https://www.goal.com/br/listas/futebol-programacao-jogos-tv-aberta-fechada-onde-assistir-online-app/bltc0a7361374657315';

serve(async (req: Request) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const res = await fetch(GOAL_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    if (!res.ok) {
      throw new Error(`Goal.com retornou status ${res.status}`);
    }

    const html = await res.text();
    // Extrai seções e partidas
    const sections = html.split(/<h2[^>]*>/i);
    const matches: any[] = [];

    const monthsMap: Record<string, string> = {
      janeiro: '01', fevereiro: '02', 'março': '03', marco: '03',
      abril: '04', maio: '05', junho: '06', julho: '07',
      agosto: '08', setembro: '09', outubro: '10', novembro: '11', dezembro: '12'
    };

    for (let i = 1; i < sections.length; i++) {
      const h2 = sections[i].split(/<\/h2>/i)[0].replace(/<[^>]+>/g, '').trim();
      if (!h2.toLowerCase().includes('jogos de')) continue;

      const dateMatch = h2.match(/(\d{1,2})\s+de\s+([a-zA-ZçÇ]+)\s+(?:de\s+)?(\d{4})/i);
      if (!dateMatch) continue;

      const day = dateMatch[1].padStart(2, '0');
      const month = monthsMap[dateMatch[2].toLowerCase()];
      const year = dateMatch[3];
      if (!month) continue;
      const dateStr = `${year}-${month}-${day}`;

      const tableMatch = sections[i].match(/<table[^>]*>([\s\S]*?)<\/table>/i);
      if (!tableMatch) continue;

      const rows = [...tableMatch[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
      for (const row of rows) {
        const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(c =>
          c[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
        );
        if (cells.length < 4 || cells[0].toUpperCase() === 'JOGO') continue;

        const matchStr = cells[0];
        const championship = cells[1] || 'Futebol';
        const timeRaw = cells[2] || '';
        const channelsRaw = cells[3] || '';

        let teamHome = matchStr;
        let teamAway = '';
        if (matchStr.includes(' x ')) {
          [teamHome, teamAway] = matchStr.split(' x ');
        }

        // Normalização de horário
        let time_br = timeRaw;
        const mH = timeRaw.match(/^(\d{1,2})h(?:(\d{2}))?$/i);
        if (mH) {
          time_br = `${mH[1].padStart(2, '0')}:${(mH[2] || '00').padStart(2, '0')}`;
        }

        const id = `${dateStr}_${teamHome}_${teamAway}_${time_br}`.replace(/[\s\W]+/g, '_').toLowerCase();

        matches.push({
          id,
          date: dateStr,
          match_title: matchStr,
          team_home: teamHome.trim(),
          team_away: teamAway.trim(),
          championship: championship.trim(),
          time_br,
          channels: [{ name: channelsRaw, type: 'streaming' }],
          channel_types: ['streaming'],
          source: 'goal.com',
          updated_at: new Date().toISOString(),
        });
      }
    }

    if (matches.length > 0 && supabaseUrl && supabaseKey) {
      await supabase.from('matches').upsert(matches, { onConflict: 'id' });
      await supabase.from('sync_logs').insert({
        status: 'success',
        total_matches: matches.length,
        message: 'Sincronização agendada concluída com sucesso',
        last_sync_at: new Date().toISOString(),
      });
    }

    return new Response(JSON.stringify({ success: true, count: matches.length }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
