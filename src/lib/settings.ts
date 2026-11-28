import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface SiteSettings {
  site_title: string;
  site_tagline: string;
  announcement_enabled: boolean;
  announcement_text: string;
  announcement_link: string;
  whatsapp_group_url: string;
  custom_logo_url: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  site_title: 'Jogos ao Vivo',
  site_tagline: 'Onde assistir futebol na TV e streaming com placar e alertas em tempo real',
  announcement_enabled: false,
  announcement_text: '🔥 Acompanhe todos os lances, placares e gols ao vivo com transmissão na TV e streaming!',
  announcement_link: '',
  whatsapp_group_url: 'https://chat.whatsapp.com/',
  custom_logo_url: '/logo.png?v=5',
};

const STORAGE_KEY = 'jogosdehoje_site_settings';

export function getStoredSettings(): SiteSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: SiteSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('[Settings] Falha ao salvar localmente:', err);
  }
}

export async function fetchRemoteSettings(): Promise<SiteSettings> {
  if (!supabase) return getStoredSettings();
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', 'general')
      .maybeSingle();

    if (error || !data) {
      return getStoredSettings();
    }

    const merged: SiteSettings = {
      site_title: data.site_title || DEFAULT_SETTINGS.site_title,
      site_tagline: data.site_tagline || DEFAULT_SETTINGS.site_tagline,
      announcement_enabled: Boolean(data.announcement_enabled),
      announcement_text: data.announcement_text || '',
      announcement_link: data.announcement_link || '',
      whatsapp_group_url: data.whatsapp_group_url || '',
      custom_logo_url: data.custom_logo_url || DEFAULT_SETTINGS.custom_logo_url,
    };

    saveStoredSettings(merged);
    return merged;
  } catch {
    return getStoredSettings();
  }
}

export async function updateRemoteSettings(settings: Partial<SiteSettings>): Promise<boolean> {
  const current = getStoredSettings();
  const next: SiteSettings = { ...current, ...settings };
  saveStoredSettings(next);

  if (!supabase) return true;
  try {
    const { error } = await supabase.from('site_settings').upsert({
      key: 'general',
      site_title: next.site_title,
      site_tagline: next.site_tagline,
      announcement_enabled: next.announcement_enabled,
      announcement_text: next.announcement_text,
      announcement_link: next.announcement_link,
      whatsapp_group_url: next.whatsapp_group_url,
      custom_logo_url: next.custom_logo_url,
      updated_at: new Date().toISOString(),
    });

    return !error;
  } catch {
    return false;
  }
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(getStoredSettings());

  useEffect(() => {
    fetchRemoteSettings().then(setSettings);
  }, []);

  const saveSettings = async (partial: Partial<SiteSettings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    await updateRemoteSettings(partial);
  };

  return {
    settings,
    saveSettings,
  };
}
