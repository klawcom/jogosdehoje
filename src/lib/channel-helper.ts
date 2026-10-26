import { ChannelBadge, ChannelType } from './types';

/**
 * Classifies a channel name into Aberta, Fechada, or Streaming
 */
export function classifyChannel(channelName: string): ChannelType {
  const norm = channelName.toLowerCase().trim();

  // TV Aberta
  if (
    norm.includes('globo') ||
    norm.includes('band') ||
    norm.includes('sbt') ||
    norm.includes('record') ||
    norm.includes('tv brasil') ||
    norm.includes('redetv') ||
    norm.includes('cultura') ||
    norm.includes('tv cultura')
  ) {
    if (norm.includes('bandsports')) return 'fechada';
    if (norm.includes('globoplay')) return 'streaming';
    return 'aberta';
  }

  // TV Fechada
  if (
    norm.includes('sportv') ||
    norm.includes('espn') ||
    norm.includes('premiere') ||
    norm.includes('bandsports') ||
    norm.includes('tnt') ||
    norm.includes('space') ||
    norm.includes('combate') ||
    norm.includes('sportynet') ||
    norm.includes('nosso futebol')
  ) {
    return 'fechada';
  }

  // Default to streaming (Disney+, Max, CazéTV, Prime Video, Globoplay, Paramount+, YouTube, DAZN, Canal GOAT, Apple TV+)
  return 'streaming';
}

/**
 * Parses channel string into individual badges
 */
export function parseChannelsString(raw: string): ChannelBadge[] {
  if (!raw || typeof raw !== 'string') return [];

  // Protect ' e ' inside parentheses, e.g. "SportyNet (TV e YouTube)"
  const protectedStr = raw.replace(/\(([^)]+)\)/g, (_, inner) => {
    return '(' + inner.replace(/\s+e\s+/gi, ' & ') + ')';
  });

  // Split on comma, isolated ' e ', semicolon, slash (avoiding splitting '+')
  const tokens = protectedStr
    .split(/(?:,|\s+\be\b\s+|\s*;\s*|\s*\/\s*)/gi)
    .map(s => s.replace(/\s+&\s+/g, ' e ').trim())
    .filter(s => s.length > 0);

  const seen = new Set<string>();
  const badges: ChannelBadge[] = [];

  for (const token of tokens) {
    // Clean trailing or leading punctuation
    const cleanName = token.replace(/^[•\-\s]+|[•\-\s]+$/g, '');
    if (!cleanName || seen.has(cleanName.toLowerCase())) continue;

    seen.add(cleanName.toLowerCase());
    badges.push({
      name: cleanName,
      type: classifyChannel(cleanName),
    });
  }

  return badges;
}

/**
 * Returns color classes for channel tags in dark mode
 */
export function getChannelBadgeStyles(type: ChannelType): {
  bg: string;
  text: string;
  border: string;
  glow: string;
  iconName: 'tv' | 'satellite' | 'play';
  label: string;
} {
  switch (type) {
    case 'aberta':
      return {
        bg: 'bg-emerald-950/80',
        text: 'text-emerald-300',
        border: 'border-emerald-500/40',
        glow: 'shadow-[0_0_12px_rgba(16,185,129,0.18)]',
        iconName: 'tv',
        label: 'TV Aberta',
      };
    case 'fechada':
      return {
        bg: 'bg-sky-950/80',
        text: 'text-sky-300',
        border: 'border-sky-500/40',
        glow: 'shadow-[0_0_12px_rgba(14,165,233,0.18)]',
        iconName: 'satellite',
        label: 'TV Fechada',
      };
    case 'streaming':
      return {
        bg: 'bg-violet-950/80',
        text: 'text-violet-300',
        border: 'border-violet-500/40',
        glow: 'shadow-[0_0_12px_rgba(168,85,247,0.18)]',
        iconName: 'play',
        label: 'Streaming',
      };
  }
}
