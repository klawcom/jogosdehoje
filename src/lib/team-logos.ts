/**
 * Database of 100% verified official club crests
 * Sources:
 * - Brazilian Clubs: GloboEsporte / CBF Broadcast Official SVGs
 * - Argentine & International Clubs: ESPN Sports CDN
 */

const OFFICIAL_CLUB_LOGOS: Record<string, string> = {
  // === BRASIL (Série A, Série B, Estaduais) ===
  'flamengo': 'https://s.sde.globo.com/media/organizations/2018/04/10/Flamengo-2018.svg',
  'cr flamengo': 'https://s.sde.globo.com/media/organizations/2018/04/10/Flamengo-2018.svg',
  'grêmio': 'https://s.sde.globo.com/media/organizations/2018/03/12/gremio.svg',
  'gremio': 'https://s.sde.globo.com/media/organizations/2018/03/12/gremio.svg',
  'palmeiras': 'https://s.sde.globo.com/media/organizations/2019/07/06/Palmeiras.svg',
  'se palmeiras': 'https://s.sde.globo.com/media/organizations/2019/07/06/Palmeiras.svg',
  'corinthians': 'https://s.sde.globo.com/media/organizations/2024/10/09/Corinthians_2024_Q4ahot4.svg',
  'são paulo': 'https://s.sde.globo.com/media/organizations/2018/03/11/sao-paulo.svg',
  'sao paulo': 'https://s.sde.globo.com/media/organizations/2018/03/11/sao-paulo.svg',
  'santos': 'https://s.sde.globo.com/media/organizations/2018/03/12/santos.svg',
  'vasco': 'https://s.sde.globo.com/media/organizations/2021/09/04/vasco_SVG.svg',
  'vasco da gama': 'https://s.sde.globo.com/media/organizations/2021/09/04/vasco_SVG.svg',
  'fluminense': 'https://s.sde.globo.com/media/organizations/2018/03/11/fluminense.svg',
  'botafogo': 'https://s.sde.globo.com/media/organizations/2019/02/04/botafogo-svg.svg',
  'internacional': 'https://s.sde.globo.com/media/organizations/2018/03/11/internacional.svg',
  'cruzeiro': 'https://s.sde.globo.com/media/organizations/2021/02/13/cruzeiro_2021.svg',
  'atlético-mg': 'https://s.sde.globo.com/media/organizations/2018/03/10/atletico-mg.svg',
  'atletico-mg': 'https://s.sde.globo.com/media/organizations/2018/03/10/atletico-mg.svg',
  'atlético mineiro': 'https://s.sde.globo.com/media/organizations/2018/03/10/atletico-mg.svg',
  'atletico mineiro': 'https://s.sde.globo.com/media/organizations/2018/03/10/atletico-mg.svg',
  'bahia': 'https://s.sde.globo.com/media/organizations/2018/03/11/bahia.svg',
  'fortaleza': 'https://s.sde.globo.com/media/organizations/2021/09/19/Fortaleza_2021_1.svg',
  'coritiba': 'https://s.sde.globo.com/media/organizations/2018/03/11/coritiba.svg',
  'cuiabá': 'https://s.sde.globo.com/media/organizations/2018/12/26/Cuiaba_EC.svg',
  'cuiaba': 'https://s.sde.globo.com/media/organizations/2018/12/26/Cuiaba_EC.svg',
  'juventude': 'https://s.sde.globo.com/media/organizations/2021/04/29/Juventude-2021-01.svg',
  'náutico': 'https://s.sde.globo.com/media/organizations/2019/01/03/Nautico.svg',
  'nautico': 'https://s.sde.globo.com/media/organizations/2019/01/03/Nautico.svg',
  'américa-mg': 'https://s.sde.globo.com/media/organizations/2024/05/07/America-MG-branco.svg',
  'america-mg': 'https://s.sde.globo.com/media/organizations/2024/05/07/America-MG-branco.svg',
  'américa mineiro': 'https://s.sde.globo.com/media/organizations/2024/05/07/America-MG-branco.svg',
  'athletico-pr': 'https://s.sde.globo.com/media/organizations/2026/01/07/Athletico-PR.svg',
  'athletico': 'https://s.sde.globo.com/media/organizations/2026/01/07/Athletico-PR.svg',
  'bragantino': 'https://s.sde.globo.com/media/organizations/2021/06/28/bragantino.svg',
  'red bull bragantino': 'https://s.sde.globo.com/media/organizations/2021/06/28/bragantino.svg',
  'vitória': 'https://s.sde.globo.com/media/organizations/2025/12/18/Vitoria_2025.svg',
  'vitoria': 'https://s.sde.globo.com/media/organizations/2025/12/18/Vitoria_2025.svg',
  'sport': 'https://s.sde.globo.com/media/organizations/2018/03/11/sport.svg',
  'sport recife': 'https://s.sde.globo.com/media/organizations/2018/03/11/sport.svg',
  'ceará': 'https://s.sde.globo.com/media/organizations/2019/10/10/ceara.svg',
  'ceara': 'https://s.sde.globo.com/media/organizations/2019/10/10/ceara.svg',
  'goiás': 'https://s.sde.globo.com/media/organizations/2021/03/01/GOIAS-2021.svg',
  'goias': 'https://s.sde.globo.com/media/organizations/2021/03/01/GOIAS-2021.svg',
  'avaí': 'https://s.sde.globo.com/media/organizations/2024/05/12/avaí.svg',
  'avai': 'https://s.sde.globo.com/media/organizations/2024/05/12/avaí.svg',
  'chapecoense': 'https://s.sde.globo.com/media/organizations/2021/06/21/CHAPECOENSE-2018.svg',
  'ponte preta': 'https://s.sde.globo.com/media/organizations/2019/03/17/ponte-preta.svg',
  'vila nova': 'https://s.sde.globo.com/media/organizations/2021/04/07/vilanova.svg',
  'mirassol': 'https://s.sde.globo.com/media/organizations/2026/07/17/MIrassol.svg',
  'remo': 'https://s.sde.globo.com/media/organizations/2021/02/25/Remo-PA.svg',
  'crb': 'https://s.sde.globo.com/media/organizations/2018/03/11/crb.svg',
  'novorizontino': 'https://s.sde.globo.com/media/organizations/2019/01/08/Novohorizontino.svg',
  'operário-pr': 'https://s.sde.globo.com/media/organizations/2018/12/27/Operário-PR.svg',
  'operario-pr': 'https://s.sde.globo.com/media/organizations/2018/12/27/Operário-PR.svg',
  'são bernardo': 'https://s.sde.globo.com/media/organizations/2022/01/20/Sao_Bernardo.svg',
  'londrina': 'https://s.sde.globo.com/media/organizations/2018/03/11/londrina.svg',

  // === ARGENTINA & AMÉRICA DO SUL (ESPN CDN) ===
  'estudiantes': 'https://a.espncdn.com/i/teamlogos/soccer/500/8.png',
  'estudiantes de la plata': 'https://a.espncdn.com/i/teamlogos/soccer/500/8.png',
  'union santa fe': 'https://a.espncdn.com/i/teamlogos/soccer/500/21.png',
  'unión santa fe': 'https://a.espncdn.com/i/teamlogos/soccer/500/21.png',
  'unión de santa fe': 'https://a.espncdn.com/i/teamlogos/soccer/500/21.png',
  'union': 'https://a.espncdn.com/i/teamlogos/soccer/500/21.png',
  'boca juniors': 'https://a.espncdn.com/i/teamlogos/soccer/500/5.png',
  'boca': 'https://a.espncdn.com/i/teamlogos/soccer/500/5.png',
  'river plate': 'https://a.espncdn.com/i/teamlogos/soccer/500/16.png',
  'river': 'https://a.espncdn.com/i/teamlogos/soccer/500/16.png',
  'racing': 'https://a.espncdn.com/i/teamlogos/soccer/500/15.png',
  'racing club': 'https://a.espncdn.com/i/teamlogos/soccer/500/15.png',
  'independiente': 'https://a.espncdn.com/i/teamlogos/soccer/500/9.png',
  'san lorenzo': 'https://a.espncdn.com/i/teamlogos/soccer/500/17.png',
  'vélez sarsfield': 'https://a.espncdn.com/i/teamlogos/soccer/500/20.png',
  'velez': 'https://a.espncdn.com/i/teamlogos/soccer/500/20.png',
  'lanús': 'https://a.espncdn.com/i/teamlogos/soccer/500/11.png',
  'lanus': 'https://a.espncdn.com/i/teamlogos/soccer/500/11.png',
  'rosario central': 'https://a.espncdn.com/i/teamlogos/soccer/500/18.png',
  'newell\'s': 'https://a.espncdn.com/i/teamlogos/soccer/500/13.png',
  'talleres': 'https://a.espncdn.com/i/teamlogos/soccer/500/19.png',
  'belgrano': 'https://a.espncdn.com/i/teamlogos/soccer/500/2.png',
  'defensa y justicia': 'https://a.espncdn.com/i/teamlogos/soccer/500/6.png',
  'argentinos juniors': 'https://a.espncdn.com/i/teamlogos/soccer/500/1.png',
  'huracán': 'https://a.espncdn.com/i/teamlogos/soccer/500/10.png',
  'gimnasia': 'https://a.espncdn.com/i/teamlogos/soccer/500/7.png',

  // === INTERNACIONAIS (EUROPA & ÁSIA) ===
  'real madrid': 'https://a.espncdn.com/i/teamlogos/soccer/500/86.png',
  'barcelona': 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png',
  'atlético de madrid': 'https://a.espncdn.com/i/teamlogos/soccer/500/1068.png',
  'atletico de madrid': 'https://a.espncdn.com/i/teamlogos/soccer/500/1068.png',
  'manchester city': 'https://s.sde.globo.com/media/organizations/2018/03/11/manchester-city.svg',
  'liverpool': 'https://s.sde.globo.com/media/organizations/2026/07/30/Liverpool.svg',
  'arsenal': 'https://a.espncdn.com/i/teamlogos/soccer/500/359.png',
  'chelsea': 'https://a.espncdn.com/i/teamlogos/soccer/500/363.png',
  'manchester united': 'https://a.espncdn.com/i/teamlogos/soccer/500/360.png',
  'tottenham': 'https://s.sde.globo.com/media/organizations/2018/03/11/tottenham.svg',
  'aston villa': 'https://s.sde.globo.com/media/organizations/2025/04/15/aston-villa-75878.svg',
  'newcastle': 'https://s.sde.globo.com/media/organizations/2023/09/04/Newcastle_United.svg',
  'bayern de munique': 'https://s.sde.globo.com/media/organizations/2018/03/11/bayern-de-munique.svg',
  'bayern': 'https://s.sde.globo.com/media/organizations/2018/03/11/bayern-de-munique.svg',
  'borussia dortmund': 'https://a.espncdn.com/i/teamlogos/soccer/500/124.png',
  'dortmund': 'https://a.espncdn.com/i/teamlogos/soccer/500/124.png',
  'psg': 'https://a.espncdn.com/i/teamlogos/soccer/500/160.png',
  'paris saint-germain': 'https://a.espncdn.com/i/teamlogos/soccer/500/160.png',
  'juventus': 'https://s.sde.globo.com/media/organizations/2025/06/27/Juventus.svg',
  'inter de milão': 'https://s.sde.globo.com/media/organizations/2021/03/31/Inter_de_Milão_2021.svg',
  'inter': 'https://s.sde.globo.com/media/organizations/2021/03/31/Inter_de_Milão_2021.svg',
  'milan': 'https://a.espncdn.com/i/teamlogos/soccer/500/103.png',
  'roma': 'https://a.espncdn.com/i/teamlogos/soccer/500/104.png',
  'napoli': 'https://s.sde.globo.com/media/organizations/2024/07/05/napoli-svg-70751_zoSpRjw.svg',
  'monaco': 'https://s.sde.globo.com/media/organizations/2018/03/11/monaco.svg',
  'al-nassr': 'https://s.sde.globo.com/media/organizations/2025/07/01/al-nassr-65.png',
  'al nassr': 'https://s.sde.globo.com/media/organizations/2025/07/01/al-nassr-65.png',
};

/**
 * Returns clean team logo URL or null
 */
export function getTeamLogo(teamName: string): string | null {
  if (!teamName) return null;
  const clean = teamName
    .toLowerCase()
    .trim()
    .replace(/^(esporte clube|clube de regatas|sociedade esportiva|futebol clube|club atlético|clube atlético|c\.a\.|e\.c\.|s\.e\.|f\.c\.)\s+/i, '')
    .trim();

  // 1. Direct exact lookup
  if (OFFICIAL_CLUB_LOGOS[clean]) {
    return OFFICIAL_CLUB_LOGOS[clean];
  }

  // 2. Exact lookup by original trimmed name
  const rawClean = teamName.toLowerCase().trim();
  if (OFFICIAL_CLUB_LOGOS[rawClean]) {
    return OFFICIAL_CLUB_LOGOS[rawClean];
  }

  // 3. Normalized search
  for (const [key, url] of Object.entries(OFFICIAL_CLUB_LOGOS)) {
    if (clean === key || key.startsWith(clean) || clean.startsWith(key)) {
      return url;
    }
  }

  // 4. Word boundary check
  for (const [key, url] of Object.entries(OFFICIAL_CLUB_LOGOS)) {
    if (key.length >= 4 && clean.includes(key)) {
      return url;
    }
  }

  return null;
}

/**
 * Returns initials and a clean sports gradient for fallback badges
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
