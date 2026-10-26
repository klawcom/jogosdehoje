/**
 * Database of official club crests / logos
 * High-resolution PNG/SVG logos with transparent backgrounds from official sports CDNs
 */

interface TeamInfo {
  logo: string;
  colors?: [string, string]; // [primary, secondary]
}

const TEAM_CRESTS: Record<string, TeamInfo> = {
  // --- Times Brasileiros ---
  flamengo: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9769.png',
    colors: ['#c00', '#000'],
  },
  palmeiras: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10283.png',
    colors: ['#006437', '#ffffff'],
  },
  corinthians: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10284.png',
    colors: ['#000000', '#ffffff'],
  },
  'são paulo': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10282.png',
    colors: ['#ff0000', '#000000'],
  },
  'sao paulo': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10282.png',
    colors: ['#ff0000', '#000000'],
  },
  santos: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10285.png',
    colors: ['#000000', '#ffffff'],
  },
  vasco: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9770.png',
    colors: ['#000000', '#ffffff'],
  },
  'vasco da gama': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9770.png',
    colors: ['#000000', '#ffffff'],
  },
  fluminense: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9768.png',
    colors: ['#790022', '#006437'],
  },
  botafogo: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9771.png',
    colors: ['#000000', '#ffffff'],
  },
  grêmio: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9772.png',
    colors: ['#0d80bf', '#000000'],
  },
  gremio: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9772.png',
    colors: ['#0d80bf', '#000000'],
  },
  internacional: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9773.png',
    colors: ['#e30613', '#ffffff'],
  },
  cruzeiro: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9774.png',
    colors: ['#003a94', '#ffffff'],
  },
  'atlético-mg': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9775.png',
    colors: ['#000000', '#ffffff'],
  },
  'atletico-mg': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9775.png',
    colors: ['#000000', '#ffffff'],
  },
  'atlético mineiro': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9775.png',
    colors: ['#000000', '#ffffff'],
  },
  bahia: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9777.png',
    colors: ['#003a94', '#e30613'],
  },
  fortaleza: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9776.png',
    colors: ['#003a94', '#e30613'],
  },
  'athletico-pr': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9779.png',
    colors: ['#c00', '#000'],
  },
  'athletico paranaense': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9779.png',
    colors: ['#c00', '#000'],
  },
  coritiba: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9780.png',
    colors: ['#006437', '#ffffff'],
  },
  cuiabá: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/292850.png',
    colors: ['#006437', '#eab308'],
  },
  cuiaba: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/292850.png',
    colors: ['#006437', '#eab308'],
  },
  'red bull bragantino': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10287.png',
    colors: ['#c00', '#ffffff'],
  },
  bragantino: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10287.png',
    colors: ['#c00', '#ffffff'],
  },
  vitória: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9783.png',
    colors: ['#c00', '#000'],
  },
  vitoria: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9783.png',
    colors: ['#c00', '#000'],
  },
  juventude: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9781.png',
    colors: ['#006437', '#ffffff'],
  },
  ceará: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9784.png',
    colors: ['#000000', '#ffffff'],
  },
  ceara: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9784.png',
    colors: ['#000000', '#ffffff'],
  },
  sport: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9782.png',
    colors: ['#c00', '#000'],
  },
  'sport recife': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9782.png',
    colors: ['#c00', '#000'],
  },

  // --- Times Argentinos e Sul-Americanos ---
  'union santa fe': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10076.png',
    colors: ['#e30613', '#ffffff'],
  },
  'unión santa fe': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10076.png',
    colors: ['#e30613', '#ffffff'],
  },
  'union': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10076.png',
    colors: ['#e30613', '#ffffff'],
  },
  estudiantes: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10077.png',
    colors: ['#e30613', '#000000'],
  },
  'estudiantes de la plata': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10077.png',
    colors: ['#e30613', '#000000'],
  },
  'boca juniors': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10078.png',
    colors: ['#003a94', '#eab308'],
  },
  'river plate': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10079.png',
    colors: ['#e30613', '#ffffff'],
  },
  racing: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10080.png',
    colors: ['#0d80bf', '#ffffff'],
  },
  'racing club': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10080.png',
    colors: ['#0d80bf', '#ffffff'],
  },
  independiente: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10081.png',
    colors: ['#e30613', '#ffffff'],
  },
  'san lorenzo': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10082.png',
    colors: ['#003a94', '#e30613'],
  },
  velez: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10083.png',
    colors: ['#003a94', '#ffffff'],
  },
  'vélez sarsfield': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10083.png',
    colors: ['#003a94', '#ffffff'],
  },

  // --- Times Internacionais (Champions League, Europa, Ásia) ---
  'real madrid': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8633.png',
    colors: ['#ffffff', '#003a94'],
  },
  barcelona: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8634.png',
    colors: ['#790022', '#003a94'],
  },
  'manchester city': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8456.png',
    colors: ['#6cabdd', '#ffffff'],
  },
  liverpool: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8650.png',
    colors: ['#c00', '#ffffff'],
  },
  arsenal: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9825.png',
    colors: ['#c00', '#ffffff'],
  },
  'inter de milão': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8636.png',
    colors: ['#003a94', '#000000'],
  },
  inter: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8636.png',
    colors: ['#003a94', '#000000'],
  },
  milan: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8564.png',
    colors: ['#c00', '#000000'],
  },
  juventus: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9885.png',
    colors: ['#000000', '#ffffff'],
  },
  roma: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8686.png',
    colors: ['#8e1f2f', '#f0bc42'],
  },
  parma: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10167.png',
    colors: ['#003a94', '#f0bc42'],
  },
  udinese: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8600.png',
    colors: ['#000000', '#ffffff'],
  },
  venezia: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8638.png',
    colors: ['#006437', '#ff7700'],
  },
  trabzonspor: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9912.png',
    colors: ['#790022', '#6cabdd'],
  },
  'çaykur rizespor': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9914.png',
    colors: ['#006437', '#003a94'],
  },
  rizespor: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9914.png',
    colors: ['#006437', '#003a94'],
  },

  // Ásia e Arábia
  'al ittihad': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10255.png',
    colors: ['#f0bc42', '#000000'],
  },
  'al-ittihad': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10255.png',
    colors: ['#f0bc42', '#000000'],
  },
  'al hilal': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10256.png',
    colors: ['#003a94', '#ffffff'],
  },
  'al nassr': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10257.png',
    colors: ['#f0bc42', '#003a94'],
  },
  'al ain': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10258.png',
    colors: ['#592d86', '#ffffff'],
  },
  tractor: {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/211531.png',
    colors: ['#c00', '#ffffff'],
  },
  'al ahli': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10259.png',
    colors: ['#006437', '#ffffff'],
  },
  'al gharafa': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10260.png',
    colors: ['#f0bc42', '#003a94'],
  },
  'neftchi fargona': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/211532.png',
    colors: ['#003a94', '#ffffff'],
  },
  'vissel kobe': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/7806.png',
    colors: ['#790022', '#ffffff'],
  },
  'gamba osaka': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/7808.png',
    colors: ['#003a94', '#000000'],
  },
  'kashima antlers': {
    logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/7804.png',
    colors: ['#790022', '#003a94'],
  },
};

/**
 * Returns clean team logo URL or null
 */
export function getTeamLogo(teamName: string): string | null {
  if (!teamName) return null;
  const clean = teamName.toLowerCase().trim().replace(/^(esporte clube|clube de regatas|sociedade esportiva|futebol clube)\s+/i, '');

  if (TEAM_CRESTS[clean]) {
    return TEAM_CRESTS[clean].logo;
  }

  // Partial match search
  for (const [key, value] of Object.entries(TEAM_CRESTS)) {
    if (clean.includes(key) || key.includes(clean)) {
      return value.logo;
    }
  }

  return null;
}

/**
 * Returns initials and a pleasant gradient for fallback badges
 */
export function getTeamInitialsBadge(teamName: string): { initials: string; gradient: string } {
  if (!teamName) return { initials: 'FC', gradient: 'from-emerald-700 to-teal-900' };

  const words = teamName.trim().split(/\s+/).filter(w => w.length > 0 && !/^(de|da|do|e|dos|das)$/i.test(w));
  let initials = '';
  if (words.length >= 2) {
    initials = (words[0][0] + words[1][0]).toUpperCase();
  } else if (words.length === 1) {
    initials = words[0].substring(0, 2).toUpperCase();
  } else {
    initials = 'FC';
  }

  // Consistent color hash from team name
  let hash = 0;
  for (let i = 0; i < teamName.length; i++) {
    hash = teamName.charCodeAt(i) + ((hash << 5) - hash);
  }

  const gradients = [
    'from-emerald-600 to-teal-800',
    'from-blue-600 to-indigo-900',
    'from-rose-600 to-red-900',
    'from-amber-500 to-orange-800',
    'from-violet-600 to-purple-900',
    'from-cyan-600 to-blue-800',
    'from-slate-700 to-zinc-900',
  ];

  const gradient = gradients[Math.abs(hash) % gradients.length];
  return { initials, gradient };
}
