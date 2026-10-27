export type ChannelType = 'aberta' | 'fechada' | 'streaming';

export interface ChannelBadge {
  name: string;
  type: ChannelType;
}

export interface MatchItem {
  id: string;
  date: string; // YYYY-MM-DD
  match_title: string; // "Flamengo x Palmeiras"
  team_home: string;
  team_away: string;
  championship: string;
  time_br: string; // "16:00"
  channels: ChannelBadge[];
  channel_types: ChannelType[];
  source?: string;
  updated_at?: string;
  score_home?: number | null;
  score_away?: number | null;
  status_desc?: string;
  is_live?: boolean;
  is_finished?: boolean;
}

export interface DaySchedule {
  date: string; // YYYY-MM-DD
  displayDate: string; // "Segunda, 26 de Outubro"
  shortDate: string; // "26/10"
  dayOfWeek: string; // "Segunda"
  isToday: boolean;
  isTomorrow: boolean;
  isYesterday: boolean;
  matches: MatchItem[];
}

export interface SyncStatus {
  success: boolean;
  lastUpdatedTime: string; // "14:30"
  lastUpdatedTimestamp: number;
  totalMatches: number;
  source: string;
  message?: string;
}

export interface FilterOptions {
  searchQuery: string;
  selectedChampionship: string;
  selectedChannelType: ChannelType | 'all';
}
