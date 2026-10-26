import React from 'react';

/**
 * High-definition vector SVG logos for major sports broadcasters and streaming apps
 */

export function ChannelLogo({
  name,
  className = 'h-4 w-auto',
}: {
  name: string;
  className?: string;
}) {
  const norm = name.toLowerCase();

  // Disney+
  if (norm.includes('disney')) {
    return (
      <span className="inline-flex items-center gap-1 font-black tracking-tight text-white">
        <svg viewBox="0 0 100 40" className={className} fill="currentColor">
          <path d="M12.5 12c-3.5 0-6.5 2.5-6.5 6s3 6 6.5 6c2.5 0 4.5-1.5 5.5-3.5h-3c-.5 1-1.5 1.5-2.5 1.5-2 0-3.5-1.5-3.5-4s1.5-4 3.5-4c1 0 2 .5 2.5 1.5h3c-1-2-3-3.5-5.5-3.5z" />
          <text x="2" y="27" fontSize="22" fontWeight="900" fontFamily="sans-serif" fontStyle="italic" fill="#00D2FF">
            Disney<tspan fill="#FFFFFF" fontSize="26" fontStyle="normal" dy="-2">+</tspan>
          </text>
        </svg>
      </span>
    );
  }

  // ESPN (All variations: ESPN, ESPN 2, ESPN 4, etc.)
  if (norm.includes('espn')) {
    const sub = norm.match(/espn\s*(\d+|extra)?/i);
    const suffix = sub && sub[1] ? sub[1] : '';
    return (
      <span className="inline-flex items-center gap-1 font-extrabold italic text-red-500">
        <span className="tracking-tighter text-sm font-black">ESPN</span>
        {suffix && <span className="text-[11px] font-bold text-white not-italic">{suffix}</span>}
      </span>
    );
  }

  // SporTV (SporTV, SporTV 2, SporTV 3)
  if (norm.includes('sportv')) {
    const sub = norm.match(/sportv\s*(\d+)?/i);
    const suffix = sub && sub[1] ? sub[1] : '';
    return (
      <span className="inline-flex items-center gap-1">
        <span className="rounded bg-sky-500 px-1 py-0.2 text-[11px] font-black tracking-wider text-slate-950 uppercase">
          spor<span className="text-white">TV</span>
        </span>
        {suffix && <span className="text-[11px] font-bold text-sky-400">{suffix}</span>}
      </span>
    );
  }

  // Premiere
  if (norm.includes('premiere')) {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-gradient-to-r from-emerald-600 to-green-700 px-1.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-white shadow-sm">
        <span className="text-amber-300">P</span>REMIERE
      </span>
    );
  }

  // Globo
  if (norm.includes('globo')) {
    return (
      <span className="inline-flex items-center gap-1.5 font-bold text-white">
        <span className="relative flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-400 via-pink-500 to-amber-400 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-white shadow-inner" />
        </span>
        <span className="text-xs font-black tracking-tight text-white">GLOBO</span>
      </span>
    );
  }

  // Max / HBO Max
  if (norm.includes('max')) {
    return (
      <span className="inline-flex items-center rounded bg-blue-600 px-1.5 py-0.2 text-xs font-black tracking-wider text-white uppercase shadow-sm">
        MAX
      </span>
    );
  }

  // Prime Video
  if (norm.includes('prime') || norm.includes('amazon')) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-black text-sky-400">
        prime<span className="text-white font-normal">video</span>
      </span>
    );
  }

  // CazéTV
  if (norm.includes('cazé') || norm.includes('caze')) {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-amber-400 px-1.5 py-0.2 text-[11px] font-black text-slate-950 tracking-tight shadow-sm">
        CAZÉ<span className="text-red-600">TV</span>
      </span>
    );
  }

  // YouTube
  if (norm.includes('youtube')) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-white">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-red-600">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
        <span className="text-[11px] font-semibold">YouTube</span>
      </span>
    );
  }

  // Band / BandSports
  if (norm.includes('band')) {
    const isSports = norm.includes('sports');
    return (
      <span className="inline-flex items-center gap-1">
        <span className="rounded bg-emerald-600 px-1 py-0.2 text-[11px] font-black text-white">
          BAND
        </span>
        {isSports && <span className="text-[10px] font-extrabold text-amber-400">SPORTS</span>}
      </span>
    );
  }

  // SBT
  if (norm.includes('sbt')) {
    return (
      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-yellow-400 via-pink-500 to-sky-400 px-1.5 py-0.2 text-[11px] font-black text-slate-950 shadow-sm">
        sbt
      </span>
    );
  }

  // Record
  if (norm.includes('record')) {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-blue-700 px-1.5 py-0.2 text-[11px] font-black text-white">
        RECORD
      </span>
    );
  }

  // Paramount+
  if (norm.includes('paramount')) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-black text-sky-400">
        Paramount<span className="text-white text-sm font-light">+</span>
      </span>
    );
  }

  // Canal GOAT
  if (norm.includes('goat')) {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-emerald-500 px-1.5 py-0.2 text-[11px] font-black text-black">
        GOAT
      </span>
    );
  }

  // SportyNet
  if (norm.includes('sportynet')) {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-indigo-600 px-1.5 py-0.2 text-[11px] font-black text-white">
        Sporty<span className="text-amber-400">Net</span>
      </span>
    );
  }

  // Fallback default clean badge
  return <span className="text-xs font-semibold">{name}</span>;
}
