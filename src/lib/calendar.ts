import { MatchItem } from "./types";

/**
 * Creates Google Calendar URL for a match (2 hour event in Brasília time)
 */
export function getGoogleCalendarUrl(match: MatchItem, displayDate?: string): string {
  try {
    const [year, month, day] = (match.date || "").split("-").map(Number);
    const [hh, mm] = (match.time_br || "16:00").split(":").map(Number);
    // Brasília is UTC-3, so UTC is hh + 3
    const startUtc = new Date(Date.UTC(year, month - 1, day, hh + 3, mm, 0));
    const endUtc = new Date(startUtc.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration
    const formatUtc = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

    const startIso = formatUtc(startUtc);
    const endIso = formatUtc(endUtc);

    const title = `⚽ ${match.match_title} (${match.championship})`;
    const channelsText = match.channels.map((c) => c.name).join(", ") || "A definir";
    const details = `⚽ Jogo: ${match.match_title}\n🏆 Campeonato: ${match.championship}\n⏰ Horário de Brasília: ${match.time_br} (Duração: 2h)${displayDate ? `\n📅 Data: ${displayDate}` : ""}\n📺 Onde Assistir: ${channelsText}\n\n📲 Acompanhe todos os jogos no Jogos de Hoje:\nhttps://jogosdehoje.lovable.app`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&dates=${startIso}/${endIso}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(channelsText)}`;
  } catch {
    return "#";
  }
}

/**
 * Generates and downloads a universal .ics calendar file with a 15-minute alarm
 * Works seamlessly on iOS (iPhone), macOS Apple Calendar, Outlook and Android
 */
export function downloadCalendarIcs(match: MatchItem, displayDate?: string) {
  try {
    const [year, month, day] = (match.date || "").split("-").map(Number);
    const [hh, mm] = (match.time_br || "16:00").split(":").map(Number);
    const startUtc = new Date(Date.UTC(year, month - 1, day, hh + 3, mm, 0));
    const endUtc = new Date(startUtc.getTime() + 2 * 60 * 60 * 1000);
    const formatUtc = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

    const channelsText = match.channels.map((c) => c.name).join(", ") || "A definir";
    const title = `${match.match_title} (${match.championship})`;
    const details = `Jogo: ${match.match_title}\\nCampeonato: ${match.championship}\\nHorário: ${match.time_br} (Brasília)\\nOnde Assistir: ${channelsText}\\n\\nMais informações: https://jogosdehoje.lovable.app`;

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Jogos de Hoje//BR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${match.id || Date.now()}@jogosdehoje.lovable.app`,
      `DTSTAMP:${formatUtc(new Date())}`,
      `DTSTART:${formatUtc(startUtc)}`,
      `DTEND:${formatUtc(endUtc)}`,
      `SUMMARY:⚽ ${title}`,
      `DESCRIPTION:${details}`,
      `LOCATION:${channelsText}`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "DESCRIPTION:Lembrete: O jogo vai começar em 15 minutos!",
      "TRIGGER:-PT15M",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    const safeFilename = `${match.team_home}-vs-${match.team_away}`.toLowerCase().replace(/[^a-z0-9]/g, "-");
    link.setAttribute("download", `${safeFilename}-jogosdehoje.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Erro ao gerar lembrete .ics:", err);
  }
}
