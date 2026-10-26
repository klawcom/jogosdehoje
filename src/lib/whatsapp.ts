import { MatchItem } from './types';

/**
 * Formats a list of matches into a beautiful WhatsApp message and opens WhatsApp
 */
export function shareMatchesOnWhatsApp(
  dateTitle: string,
  matches: MatchItem[],
  customChampionshipFilter?: string
) {
  if (!matches || matches.length === 0) return;

  const header = `⚽ *FUTEBOL NA TV* 📺\n📅 *${dateTitle}* (Horário de Brasília)\n`;

  // Group by championship
  const grouped: Record<string, MatchItem[]> = {};
  for (const m of matches) {
    if (!grouped[m.championship]) {
      grouped[m.championship] = [];
    }
    grouped[m.championship].push(m);
  }

  let body = '';
  for (const [champ, champMatches] of Object.entries(grouped)) {
    body += `\n🏆 *${champ.toUpperCase()}*\n`;
    for (const m of champMatches) {
      const channelsText = m.channels.map(c => c.name).join(', ') || 'A definir';
      body += `⏰ *${m.time_br}* • ${m.match_title}\n📺 _${channelsText}_\n\n`;
    }
  }

  const footer = `📲 *Acompanhe todos os jogos ao vivo:*\nhttps://jogosdehoje.lovable.app`;
  const fullText = `${header}${body}${footer}`.trim();

  // Try navigator.share on mobile if supported
  if (typeof navigator !== 'undefined' && navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
    navigator.share({
      title: 'Futebol na TV - Jogos de Hoje',
      text: fullText,
    }).catch(() => {
      openWhatsAppWeb(fullText);
    });
  } else {
    openWhatsAppWeb(fullText);
  }
}

function openWhatsAppWeb(text: string) {
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
