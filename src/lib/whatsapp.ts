import { MatchItem } from './types';

/**
 * Shares all matches of the day or filtered matches on WhatsApp
 */
export function shareMatchesOnWhatsApp(dateTitle: string, matches: MatchItem[]) {
  if (!matches || matches.length === 0) return;

  const header = `⚽ *JOGOS DE HOJE* 📺\n📅 *${dateTitle}* (Horário de Brasília)\n`;

  // Sort chronologically by time
  const sorted = [...matches].sort((a, b) => a.time_br.localeCompare(b.time_br));

  let body = '';
  for (const m of sorted) {
    const channelsText = m.channels.map(c => c.name).join(', ') || 'A definir';
    body += `\n⏰ *${m.time_br}* • ${m.match_title}\n🏆 _${m.championship}_\n📺 _${channelsText}_\n`;
  }

  const footer = `\n📲 *Acompanhe todos os jogos e onde assistir:*\nhttps://jogosdehoje.lovable.app`;
  const fullText = `${header}${body}${footer}`.trim();

  openWhatsApp(fullText);
}

/**
 * Shares a single match on WhatsApp
 */
export function shareSingleMatchOnWhatsApp(match: MatchItem, displayDate?: string) {
  const channelsText = match.channels.map(c => c.name).join(', ') || 'A definir';
  const text = `⚽ *JOGOS DE HOJE* 📺\n\n` +
    `🏆 *${match.championship}*\n` +
    `⏰ *${match.time_br}* (Horário de Brasília)${displayDate ? ` • ${displayDate}` : ''}\n` +
    `🆚 *${match.match_title}*\n\n` +
    `📺 *Onde assistir:* ${channelsText}\n\n` +
    `📲 Veja a programação completa em:\nhttps://jogosdehoje.lovable.app`;

  openWhatsApp(text);
}

function openWhatsApp(text: string) {
  if (typeof navigator !== 'undefined' && navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
    navigator.share({
      title: 'Jogos de Hoje',
      text,
    }).catch(() => {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    });
  } else {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  }
}
