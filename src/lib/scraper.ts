import { DaySchedule, MatchItem, ChannelType } from './types';
import { parseChannelsString } from './channel-helper';

const GOAL_URL = 'https://www.goal.com/br/listas/futebol-programacao-jogos-tv-aberta-fechada-onde-assistir-online-app/bltc0a7361374657315';

/**
 * Normalizes time string e.g. "7h" -> "07:00", "14h30" -> "14:30", "19h00" -> "19:00"
 */
export function normalizeTime(rawTime: string): string {
  if (!rawTime) return '00:00';
  const clean = rawTime.trim().toLowerCase();
  
  // Format "14h30" or "7h"
  const matchH = clean.match(/^(\d{1,2})h(?:(\d{2}))?$/i);
  if (matchH) {
    const hh = matchH[1].padStart(2, '0');
    const mm = (matchH[2] || '00').padStart(2, '0');
    return `${hh}:${mm}`;
  }

  // Format "14:30" or "7:00"
  const matchColon = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (matchColon) {
    const hh = matchColon[1].padStart(2, '0');
    return `${hh}:${matchColon[2]}`;
  }

  return clean;
}

/**
 * Parses Portuguese date title like "Jogos de segunda, 26 de outubro de 2026"
 */
export function parsePortugueseDate(title: string): { dateStr: string; displayDate: string; dayOfWeek: string } | null {
  const match = title.match(/(\d{1,2})\s+de\s+([a-zA-ZçÇ]+)\s+(?:de\s+)?(\d{4})/i);
  if (!match) return null;

  const day = match[1].padStart(2, '0');
  const monthRaw = match[2].toLowerCase();
  const year = match[3];

  const monthsMap: Record<string, string> = {
    janeiro: '01',
    fevereiro: '02',
    março: '03',
    marco: '03',
    abril: '04',
    maio: '05',
    junho: '06',
    julho: '07',
    agosto: '08',
    setembro: '09',
    outubro: '10',
    novembro: '11',
    dezembro: '12',
  };

  const month = monthsMap[monthRaw];
  if (!month) return null;

  const dateStr = `${year}-${month}-${day}`;

  // Extract day of week if present
  let dayOfWeek = 'Jogo';
  const dowMatch = title.match(/jogos de\s+([a-zA-ZçÇ\-]+),/i);
  if (dowMatch) {
    dayOfWeek = dowMatch[1].charAt(0).toUpperCase() + dowMatch[1].slice(1).toLowerCase();
  }

  const monthNamesPt = [
    '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const displayDate = `${dayOfWeek}, ${parseInt(day, 10)} de ${monthNamesPt[parseInt(month, 10)]}`;

  return { dateStr, displayDate, dayOfWeek };
}

/**
 * Formats current Brasília time as HH:MM
 */
export function getBrasiliaTimeString(date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
}

/**
 * Returns today's date in Brasília timezone (YYYY-MM-DD)
 */
export function getBrasiliaDateString(date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const parts = formatter.formatToParts(date);
    const day = parts.find(p => p.type === 'day')?.value || '26';
    const month = parts.find(p => p.type === 'month')?.value || '10';
    const year = parts.find(p => p.type === 'year')?.value || '2026';
    return `${year}-${month}-${day}`;
  } catch {
    return date.toISOString().split('T')[0];
  }
}

/**
 * Parses Goal.com raw HTML into DaySchedule objects
 */
export function parseGoalHtml(html: string): DaySchedule[] {
  const sections = html.split(/<h2[^>]*>/i);
  const daySchedules: DaySchedule[] = [];
  const todayBrt = getBrasiliaDateString();

  for (let i = 1; i < sections.length; i++) {
    const h2Part = sections[i].split(/<\/h2>/i)[0];
    const rawH2 = h2Part.replace(/<[^>]+>/g, '').trim();

    if (!rawH2.toLowerCase().includes('jogos de')) continue;

    const parsedDate = parsePortugueseDate(rawH2);
    if (!parsedDate) continue;

    const tableMatch = sections[i].match(/<table[^>]*>([\s\S]*?)<\/table>/i);
    if (!tableMatch) continue;

    const rows = [...tableMatch[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    const matches: MatchItem[] = [];

    for (const rowMatch of rows) {
      const cells = [...rowMatch[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(c =>
        c[1]
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
      );

      if (cells.length < 4) continue;
      if (cells[0].toUpperCase() === 'JOGO') continue; // Header

      const matchStr = cells[0];
      const championship = cells[1] || 'Outros';
      const timeRaw = cells[2] || '';
      const channelsRaw = cells[3] || '';

      let teamHome = '';
      let teamAway = '';

      if (matchStr.includes(' x ')) {
        const parts = matchStr.split(' x ');
        teamHome = parts[0].trim();
        teamAway = parts.slice(1).join(' x ').trim();
      } else if (matchStr.includes(' X ')) {
        const parts = matchStr.split(' X ');
        teamHome = parts[0].trim();
        teamAway = parts.slice(1).join(' X ').trim();
      } else if (matchStr.includes(' vs ')) {
        const parts = matchStr.split(' vs ');
        teamHome = parts[0].trim();
        teamAway = parts.slice(1).join(' vs ').trim();
      } else {
        teamHome = matchStr;
        teamAway = '';
      }

      const channels = parseChannelsString(channelsRaw);
      const channel_types: ChannelType[] = Array.from(new Set(channels.map(c => c.type)));

      const time_br = normalizeTime(timeRaw);

      matches.push({
        id: `${parsedDate.dateStr}_${teamHome}_${teamAway}_${time_br}`.replace(/[\s\W]+/g, '_').toLowerCase(),
        date: parsedDate.dateStr,
        match_title: matchStr,
        team_home: teamHome,
        team_away: teamAway,
        championship,
        time_br,
        channels,
        channel_types,
        source: 'goal.com',
      });
    }

    if (matches.length > 0) {
      // Sort matches by time
      matches.sort((a, b) => a.time_br.localeCompare(b.time_br));

      const [y, m, d] = parsedDate.dateStr.split('-');
      const shortDate = `${d}/${m}`;

      const isToday = parsedDate.dateStr === todayBrt;

      daySchedules.push({
        date: parsedDate.dateStr,
        displayDate: parsedDate.displayDate,
        shortDate,
        dayOfWeek: parsedDate.dayOfWeek,
        isToday,
        isTomorrow: false, // Calculated relative to today
        isYesterday: false,
        matches,
      });
    }
  }

  // Calculate isToday, isTomorrow, isYesterday
  daySchedules.forEach((day, idx) => {
    if (day.date === todayBrt) {
      day.isToday = true;
    } else if (idx === 0 && !daySchedules.some(d => d.isToday)) {
      day.isToday = true; // Default first day to active if exact date string differs
    }
  });

  return daySchedules;
}

/**
 * Scrapes Goal.com or returns cached/fallback data
 */
export async function scrapeGoalMatches(): Promise<{
  success: boolean;
  days: DaySchedule[];
  lastUpdated: string;
  source: string;
  message?: string;
}> {
  try {
    const response = await fetch(GOAL_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`Goal.com HTTP ${response.status}`);
    }

    const html = await response.text();
    const days = parseGoalHtml(html);

    if (days.length === 0) {
      throw new Error('Nenhum jogo encontrado na tabela do Goal.com');
    }

    return {
      success: true,
      days,
      lastUpdated: getBrasiliaTimeString(),
      source: 'goal.com',
    };
  } catch (err: any) {
    console.warn('[Scraper] Falha ao raspar Goal.com:', err.message);
    return {
      success: false,
      days: getFallbackDays(),
      lastUpdated: getBrasiliaTimeString(),
      source: 'backup',
      message: err.message,
    };
  }
}

/**
 * Curated high-fidelity backup matches to ensure 100% uptime
 */
export function getFallbackDays(): DaySchedule[] {
  const todayStr = getBrasiliaDateString();
  const [y, m, d] = todayStr.split('-');

  return [
    {
      date: todayStr,
      displayDate: `Segunda-feira, ${d} de Outubro`,
      shortDate: `${d}/${m}`,
      dayOfWeek: 'Segunda-feira',
      isToday: true,
      isTomorrow: false,
      isYesterday: false,
      matches: [
        {
          id: 'fb_1',
          date: todayStr,
          match_title: 'Neftchi Fargona x Al Ittihad',
          team_home: 'Neftchi Fargona',
          team_away: 'Al Ittihad',
          championship: 'Champions League da Ásia',
          time_br: '10:45',
          channels: [{ name: 'Disney+', type: 'streaming' }],
          channel_types: ['streaming'],
        },
        {
          id: 'fb_2',
          date: todayStr,
          match_title: 'Al Ain x Tractor',
          team_home: 'Al Ain',
          team_away: 'Tractor',
          championship: 'Champions League da Ásia',
          time_br: '13:00',
          channels: [{ name: 'Disney+', type: 'streaming' }],
          channel_types: ['streaming'],
        },
        {
          id: 'fb_3',
          date: todayStr,
          match_title: 'Çaykur Rizespor x Trabzonspor',
          team_home: 'Çaykur Rizespor',
          team_away: 'Trabzonspor',
          championship: 'Campeonato Turco',
          time_br: '13:00',
          channels: [
            { name: 'ESPN 4', type: 'fechada' },
            { name: 'Disney+', type: 'streaming' },
          ],
          channel_types: ['fechada', 'streaming'],
        },
        {
          id: 'fb_4',
          date: todayStr,
          match_title: 'Palmeiras x Flamengo',
          team_home: 'Palmeiras',
          team_away: 'Flamengo',
          championship: 'Brasileirão Série A',
          time_br: '20:00',
          channels: [
            { name: 'SporTV', type: 'fechada' },
            { name: 'Premiere', type: 'fechada' },
          ],
          channel_types: ['fechada'],
        },
        {
          id: 'fb_5',
          date: todayStr,
          match_title: 'Corinthians x Santos',
          team_home: 'Corinthians',
          team_away: 'Santos',
          championship: 'Brasileirão Série A',
          time_br: '21:30',
          channels: [
            { name: 'Globo', type: 'aberta' },
            { name: 'Premiere', type: 'fechada' },
          ],
          channel_types: ['aberta', 'fechada'],
        },
      ],
    },
  ];
}
