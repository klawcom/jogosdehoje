// Utilitário de Som: Apito Clássico de Árbitro de Futebol
// Som suave por padrão (25%), com controle de volume e sintetizador Web Audio

const VOLUME_STORAGE_KEY = 'jogosdehoje_whistle_volume';
const ENABLED_STORAGE_KEY = 'jogosdehoje_whistle_enabled';

const DEFAULT_VOLUME = 0.25; // 25% (som baixo/suave por padrão)

export function getWhistleVolume(): number {
  if (typeof window === 'undefined') return DEFAULT_VOLUME;
  try {
    const raw = localStorage.getItem(VOLUME_STORAGE_KEY);
    if (raw === null) return DEFAULT_VOLUME;
    const parsed = parseFloat(raw);
    return isNaN(parsed) ? DEFAULT_VOLUME : Math.max(0, Math.min(1, parsed));
  } catch {
    return DEFAULT_VOLUME;
  }
}

export function setWhistleVolume(volume: number): void {
  if (typeof window === 'undefined') return;
  try {
    const clamped = Math.max(0, Math.min(1, volume));
    localStorage.setItem(VOLUME_STORAGE_KEY, clamped.toString());
  } catch {}
}

export function isWhistleEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = localStorage.getItem(ENABLED_STORAGE_KEY);
    if (raw === null) return true;
    return raw !== 'false';
  } catch {
    return true;
  }
}

export function setWhistleEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ENABLED_STORAGE_KEY, enabled ? 'true' : 'false');
  } catch {}
}

let audioContextCache: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioContextCache || audioContextCache.state === 'closed') {
    audioContextCache = new AudioContextClass();
  }
  if (audioContextCache.state === 'suspended') {
    audioContextCache.resume().catch(() => {});
  }
  return audioContextCache;
}

/**
 * Toca o som autêntico de apito clássico de árbitro de futebol
 * Utiliza síntese de áudio dupla frequência (~2780Hz e ~2960Hz) com tremolo de câmara
 */
export async function playRefereeWhistle(customVolume?: number): Promise<void> {
  const enabled = isWhistleEnabled();
  if (!enabled && customVolume === undefined) return;

  const targetVolume = customVolume !== undefined ? customVolume : getWhistleVolume();
  if (targetVolume <= 0) return;

  try {
    const ctx = getAudioContext();
    if (ctx) {
      const now = ctx.currentTime;
      const duration = 0.52; // 520ms

      // Master Gain para o volume do apito
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(targetVolume * 0.45, now);
      masterGain.connect(ctx.destination);

      // Tremolo / flutter LFO (oscilação de ar característica da câmara do apito)
      const flutterLfo = ctx.createOscillator();
      flutterLfo.frequency.setValueAtTime(26, now); // 26 Hz trill

      const flutterGain = ctx.createGain();
      flutterGain.gain.setValueAtTime(0.25, now);

      flutterLfo.connect(flutterGain.gain);

      // Oscilador 1: Frequência fundamental 1 (2780 Hz)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(2780, now);

      // Oscilador 2: Frequência fundamental 2 (2960 Hz) - cria o batimento clássico
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(2960, now);

      // Oscilador 3: Harmônico agudo (5560 Hz)
      const osc3 = ctx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(5560, now);

      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();
      const gain3 = ctx.createGain();

      gain1.gain.setValueAtTime(0.5, now);
      gain2.gain.setValueAtTime(0.4, now);
      gain3.gain.setValueAtTime(0.1, now);

      // Envelope de volume geral do apito
      const envGain = ctx.createGain();
      envGain.gain.setValueAtTime(0.001, now);
      envGain.gain.exponentialRampToValueAtTime(1.0, now + 0.03); // Ataque rápido (30ms)
      envGain.gain.setValueAtTime(1.0, now + duration - 0.09);
      envGain.gain.exponentialRampToValueAtTime(0.001, now + duration); // Decaimento suave

      osc1.connect(gain1);
      osc2.connect(gain2);
      osc3.connect(gain3);

      gain1.connect(envGain);
      gain2.connect(envGain);
      gain3.connect(envGain);

      envGain.connect(masterGain);

      flutterLfo.start(now);
      osc1.start(now);
      osc2.start(now);
      osc3.start(now);

      flutterLfo.stop(now + duration);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
      osc3.stop(now + duration);
      return;
    }
  } catch (err) {
    // Fallback para arquivo de áudio estático caso Web Audio falhe
  }

  // Fallback via elemento HTML Audio
  try {
    const audio = new Audio('/audio/referee-whistle.wav');
    audio.volume = targetVolume;
    await audio.play();
  } catch {}
}
