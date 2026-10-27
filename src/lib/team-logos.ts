/**
 * Local verified official team crests stored directly in /teams/
 * Zero external network dependency - 100% reliable and fast
 */

const LOCAL_TEAM_LOGOS: Record<string, string> = {
  // === BRASIL ===
  'flamengo': '/teams/flamengo.svg',
  'cr flamengo': '/teams/flamengo.svg',
  'grêmio': '/teams/gremio.svg',
  'gremio': '/teams/gremio.svg',
  'palmeiras': '/teams/palmeiras.svg',
  'se palmeiras': '/teams/palmeiras.svg',
  'corinthians': '/teams/corinthians.svg',
  'são paulo': '/teams/sao-paulo.svg',
  'sao paulo': '/teams/sao-paulo.svg',
  'santos': '/teams/santos.svg',
  'vasco': '/teams/vasco.svg',
  'vasco da gama': '/teams/vasco.svg',
  'fluminense': '/teams/fluminense.svg',
  'botafogo': '/teams/botafogo.svg',
  'internacional': '/teams/internacional.svg',
  'cruzeiro': '/teams/cruzeiro.svg',
  'atlético-mg': '/teams/atletico-mg.svg',
  'atletico-mg': '/teams/atletico-mg.svg',
  'atlético mineiro': '/teams/atletico-mg.svg',
  'atletico mineiro': '/teams/atletico-mg.svg',
  'bahia': '/teams/bahia.svg',
  'fortaleza': '/teams/fortaleza.svg',
  'coritiba': '/teams/coritiba.svg',
  'cuiabá': '/teams/cuiaba.svg',
  'cuiaba': '/teams/cuiaba.svg',
  'juventude': '/teams/juventude.svg',
  'náutico': '/teams/nautico.svg',
  'nautico': '/teams/nautico.svg',
  'américa-mg': '/teams/america-mg.svg',
  'america-mg': '/teams/america-mg.svg',
  'américa mineiro': '/teams/america-mg.svg',
  'athletico-pr': '/teams/athletico-pr.svg',
  'athletico': '/teams/athletico-pr.svg',
  'bragantino': '/teams/bragantino.svg',
  'red bull bragantino': '/teams/bragantino.svg',
  'vitória': '/teams/vitoria.svg',
  'vitoria': '/teams/vitoria.svg',
  'sport': '/teams/sport.svg',
  'sport recife': '/teams/sport.svg',
  'ceará': '/teams/ceara.svg',
  'ceara': '/teams/ceara.svg',
  'goiás': '/teams/goias.svg',
  'goias': '/teams/goias.svg',
  'avaí': '/teams/avai.svg',
  'avai': '/teams/avai.svg',
  'chapecoense': '/teams/chapecoense.svg',
  'ponte preta': '/teams/ponte-preta.svg',
  'vila nova': '/teams/vila-nova.svg',
  'mirassol': '/teams/mirassol.svg',
  'remo': '/teams/remo.svg',
  'crb': '/teams/crb.svg',
  'novorizontino': '/teams/novorizontino.svg',
  'operário-pr': '/teams/operario-pr.svg',
  'operario-pr': '/teams/operario-pr.svg',

  // === ARGENTINA & AMÉRICA DO SUL ===
  'estudiantes': '/teams/estudiantes.png',
  'estudiantes de la plata': '/teams/estudiantes.png',
  'union santa fe': '/teams/union-santa-fe.png',
  'unión santa fe': '/teams/union-santa-fe.png',
  'unión de santa fe': '/teams/union-santa-fe.png',
  'union': '/teams/union-santa-fe.png',
  'boca juniors': '/teams/boca-juniors.png',
  'boca': '/teams/boca-juniors.png',
  'river plate': '/teams/river-plate.png',
  'river': '/teams/river-plate.png',
  'racing': '/teams/racing.png',
  'racing club': '/teams/racing.png',
  'independiente': '/teams/independiente.png',

  // === INTERNACIONAIS ===
  'real madrid': '/teams/real-madrid.png',
  'barcelona': '/teams/barcelona.png',
  'manchester city': '/teams/manchester-city.svg',
  'liverpool': '/teams/liverpool.svg',
  'arsenal': '/teams/arsenal.png',
  'bayern de munique': '/teams/bayern.svg',
  'bayern': '/teams/bayern.svg',
  'psg': '/teams/psg.png',
  'juventus': '/teams/juventus.svg',
  'inter de milão': '/teams/inter-milao.svg',
  'inter': '/teams/inter-milao.svg',
};

/**
 * Returns local team logo URL or null
 */
export function getTeamLogo(teamName: string): string | null {
  if (!teamName) return null;
  const clean = teamName
    .toLowerCase()
    .trim()
    .replace(/^(esporte clube|clube de regatas|sociedade esportiva|futebol clube|club atlético|clube atlético|c\.a\.|e\.c\.|s\.e\.|f\.c\.)\s+/i, '')
    .trim();

  // 1. Direct match
  if (LOCAL_TEAM_LOGOS[clean]) {
    return LOCAL_TEAM_LOGOS[clean];
  }

  // 2. Original lowercase match
  const rawClean = teamName.toLowerCase().trim();
  if (LOCAL_TEAM_LOGOS[rawClean]) {
    return LOCAL_TEAM_LOGOS[rawClean];
  }

  // 3. Partial prefix match
  for (const [key, path] of Object.entries(LOCAL_TEAM_LOGOS)) {
    if (clean === key || key.startsWith(clean) || clean.startsWith(key)) {
      return path;
    }
  }

  // 4. Word match
  for (const [key, path] of Object.entries(LOCAL_TEAM_LOGOS)) {
    if (key.length >= 4 && clean.includes(key)) {
      return path;
    }
  }

  return null;
}

/**
 * Clean sports circular badge with gradient and team initials
 */
export function getTeamInitialsBadge(teamName: string): { initials: string; gradient: string } {
  if (!teamName) return { initials: 'FC', gradient: 'from-emerald-600 via-teal-700 to-emerald-900' };

  const words = teamName.trim().split(/\s+/).filter(w => w.length > 0 && !/^(de|da|do|e|dos|das)$/i.test(w));
  let initials = '';
  if (words.length >= 2) {
    initials = (words[0][0] + words[1][0]).toUpperCase();
  } else if (words.length === 1) {
    initials = words[0].substring(0, 2).toUpperCase();
  } else {
    initials = 'FC';
  }

  let hash = 0;
  for (let i = 0; i < teamName.length; i++) {
    hash = teamName.charCodeAt(i) + ((hash << 5) - hash);
  }

  const gradients = [
    'from-emerald-600 via-teal-700 to-emerald-950',
    'from-blue-600 via-indigo-700 to-blue-950',
    'from-rose-600 via-red-700 to-rose-950',
    'from-amber-500 via-orange-600 to-amber-950',
    'from-violet-600 via-purple-700 to-violet-950',
    'from-cyan-600 via-teal-700 to-cyan-950',
    'from-slate-600 via-zinc-700 to-neutral-900',
  ];

  const gradient = gradients[Math.abs(hash) % gradients.length];
  return { initials, gradient };
}
