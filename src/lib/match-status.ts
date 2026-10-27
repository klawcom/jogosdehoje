import { MatchItem } from './types';
import { getBrasiliaDateString, getBrasiliaTimeString } from './scraper';

export type MatchState = 'em_breve' | 'ao_vivo' | 'encerrado';

export interface MatchStatusInfo {
  state: MatchState;
  label: string;
  isLive: boolean;
  isFinished: boolean;
  isUpcoming: boolean;
  badgeStyle: {
    bg: string;
    text: string;
    border: string;
    pulse?: boolean;
  };
}

/**
 * Calculates real-time match status (Em breve, Ao vivo com minuto, ou Encerrado)
 */
export function getMatchStatus(match: MatchItem): MatchStatusInfo {
  const todayBrt = getBrasiliaDateString();
  const nowBrt = getBrasiliaTimeString(); // "19:55"

  // 1. Past dates
  if (match.date < todayBrt) {
    return {
      state: 'encerrado',
      label: 'Encerrado',
      isLive: false,
      isFinished: true,
      isUpcoming: false,
      badgeStyle: {
        bg: 'bg-muted/40',
        text: 'text-muted-foreground/80',
        border: 'border-border/40',
      },
    };
  }

  // 2. Future dates
  if (match.date > todayBrt) {
    return {
      state: 'em_breve',
      label: 'Em breve',
      isLive: false,
      isFinished: false,
      isUpcoming: true,
      badgeStyle: {
        bg: 'bg-slate-800/40',
        text: 'text-slate-300',
        border: 'border-slate-700/50',
      },
    };
  }

  // 3. Today's match
  const [matchH, matchM] = (match.time_br || '00:00').split(':').map(n => parseInt(n, 10) || 0);
  const [nowH, nowM] = nowBrt.split(':').map(n => parseInt(n, 10) || 0);

  const matchMinutes = matchH * 60 + matchM;
  const currentMinutes = nowH * 60 + nowM;
  const diff = currentMinutes - matchMinutes;

  // Not started yet
  if (diff < 0) {
    return {
      state: 'em_breve',
      label: 'Em breve',
      isLive: false,
      isFinished: false,
      isUpcoming: true,
      badgeStyle: {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
      },
    };
  }

  // Live in progress (typically soccer lasts ~105-115 mins with halftime and added time)
  if (diff >= 0 && diff <= 115) {
    let liveText = 'Ao vivo';
    if (diff <= 45) {
      liveText = `Ao vivo • ${Math.max(1, diff)}'`;
    } else if (diff > 45 && diff <= 60) {
      liveText = 'Ao vivo • Intervalo';
    } else if (diff > 60 && diff <= 105) {
      liveText = `Ao vivo • ${diff - 15}'`;
    } else {
      liveText = 'Ao vivo • Acréscimos';
    }

    return {
      state: 'ao_vivo',
      label: liveText,
      isLive: true,
      isFinished: false,
      isUpcoming: false,
      badgeStyle: {
        bg: 'bg-rose-500/20',
        text: 'text-rose-400',
        border: 'border-rose-500/50',
        pulse: true,
      },
    };
  }

  // Finished
  return {
    state: 'encerrado',
    label: 'Encerrado',
    isLive: false,
    isFinished: true,
    isUpcoming: false,
    badgeStyle: {
      bg: 'bg-muted/40',
      text: 'text-muted-foreground/75',
      border: 'border-border/40',
    },
  };
}
