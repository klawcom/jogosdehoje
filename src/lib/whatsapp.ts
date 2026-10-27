import { MatchItem } from './types';

/**
 * Formats match schedule text for WhatsApp or system sharing
 */
export function buildScheduleText(dateTitle: string, matches: MatchItem[]): string {
  const header = `⚽ *JOGOS DE HOJE* 📺\n📅 *${dateTitle}* (Horário de Brasília)\n`;

  // Sort chronologically by time
  const sorted = [...matches].sort((a, b) => a.time_br.localeCompare(b.time_br));

  let body = '';
  for (const m of sorted) {
    const channelsText = m.channels.map(c => c.name).join(', ') || 'A definir';
    const scoreText =
      m.score_home != null && m.score_away != null
        ? ` [${m.score_home} x ${m.score_away}]`
        : '';
    const statusText = m.is_live ? ' • 🔴 Ao vivo' : m.is_finished ? ' • 🏁 Fim' : '';

    body += `\n⏰ *${m.time_br}* • ${m.match_title}${scoreText}${statusText}\n🏆 _${m.championship}_\n📺 _${channelsText}_\n`;
  }

  const footer = `\n📲 *Acompanhe todos os jogos, placares e canais:*\nhttps://jogosdehoje.lovable.app`;
  return `${header}${body}${footer}`.trim();
}

/**
 * Shares all matches of the day or filtered matches directly on WhatsApp
 */
export function shareMatchesOnWhatsApp(dateTitle: string, matches: MatchItem[]) {
  if (!matches || matches.length === 0) return;
  const fullText = buildScheduleText(dateTitle, matches);
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`, '_blank', 'noopener,noreferrer');
}

/**
 * Floating share button handler: uses native share sheet on mobile, fallback to WhatsApp
 */
export function shareFloatingButton(dateTitle: string, matches: MatchItem[]) {
  if (!matches || matches.length === 0) return;
  const fullText = buildScheduleText(dateTitle, matches);

  if (typeof navigator !== 'undefined' && navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
    navigator.share({
      title: 'Jogos de Hoje',
      text: fullText,
    }).catch(() => {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`, '_blank', 'noopener,noreferrer');
    });
  } else {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Shares a single match on WhatsApp
 */
export function shareSingleMatchOnWhatsApp(match: MatchItem, displayDate?: string) {
  const channelsText = match.channels.map(c => c.name).join(', ') || 'A definir';
  const scoreText =
    match.score_home != null && match.score_away != null
      ? `\n⚽ *Placar:* ${match.score_home} x ${match.score_away}`
      : '';

  const text =
    `⚽ *JOGOS DE HOJE* 📺\n\n` +
    `🏆 *${match.championship}*\n` +
    `⏰ *${match.time_br}* (Horário de Brasília)${displayDate ? ` • ${displayDate}` : ''}\n` +
    `🆚 *${match.match_title}*${scoreText}\n\n` +
    `📺 *Onde assistir:* ${channelsText}\n\n` +
    `📲 Veja a programação completa em:\nhttps://jogosdehoje.lovable.app`;

  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
}

