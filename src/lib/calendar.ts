import { MatchItem } from "./types";

/**
 * Creates Google Calendar URL for a match (2 hour event in Brasília time)
 */
export function getGoogleCalendarUrl(match: MatchItem, displayDate?: string): string {
  try {
    const [year, month, day] = (match.date || "").split("-").map(Number);
    const [hh, mm] = (match.time_br || "16:00").split(":").map(Number);
    // Brasília is UTC-3, so UTC is hh + 3
    const startUtc = new Date(Date.UTC(year || new Date().getFullYear(), (month || 1) - 1, day || 1, (hh || 16) + 3, mm || 0, 0));
    const endUtc = new Date(startUtc.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration
    const formatUtc = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

    const startIso = formatUtc(startUtc);
    const endIso = formatUtc(endUtc);

    const title = `⚽ ${match.match_title || "Jogo"} (${match.championship || "Futebol"})`;
    const channelsText = (match.channels || []).map((c) => c.name).join(", ") || "A definir";
    const details = `⚽ Jogo: ${match.match_title}\n🏆 Campeonato: ${match.championship}\n⏰ Horário de Brasília: ${match.time_br} (Duração: 2h)${displayDate ? `\n📅 Data: ${displayDate}` : ""}\n📺 Onde Assistir: ${channelsText}\n\n📲 Acompanhe todos os jogos no Jogos de Hoje:\nhttps://jogosdehoje.lovable.app`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&dates=${startIso}/${endIso}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(channelsText)}`;
  } catch {
    return "https://calendar.google.com/";
  }
}
