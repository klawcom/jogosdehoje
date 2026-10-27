import React from 'react';

/**
 * Standardized channel logo and brand badge components
 * All channel badges share identical heights, paddings, and font sizes.
 */

export function ChannelLogo({
  name,
  className = 'h-3.5 w-auto object-contain',
}: {
  name: string;
  className?: string;
}) {
  const norm = name.toLowerCase().trim();

  // Disney+
  if (norm.includes('disney')) {
    return (
      <span className="inline-flex items-center gap-1 font-black text-sky-800 dark:text-sky-300">
        <svg viewBox="0 0 80 32" className={className} fill="currentColor">
          <text x="2" y="24" fontSize="20" fontWeight="900" fontFamily="sans-serif" fontStyle="italic" fill="#0284c7">
            Disney<tspan fill="#ea580c" fontSize="22" fontStyle="normal" dy="-2">+</tspan>
          </text>
        </svg>
      </span>
    );
  }

  // Premiere
  if (norm.includes('premiere')) {
    return (
      <span className="inline-flex items-center gap-1 font-black text-emerald-900 dark:text-emerald-300 tracking-wider">
        <span className="text-amber-500 dark:text-amber-400 font-black">P</span>REMIERE
      </span>
    );
  }

  // SporTV (SporTV, SporTV 2, SporTV 3)
  if (norm.includes('sportv')) {
    const sub = norm.match(/sportv\s*(\d+)?/i);
    const suffix = sub && sub[1] ? ` ${sub[1]}` : '';
    return (
      <span className="inline-flex items-center gap-1 font-black text-sky-600 dark:text-sky-400 tracking-wider">
        spor<span className="text-slate-900 dark:text-white">TV</span>
        {suffix && <span className="text-amber-600 dark:text-amber-400">{suffix}</span>}
      </span>
    );
  }

  // ESPN (ESPN, ESPN 2, ESPN 4, etc.)
  if (norm.includes('espn')) {
    const sub = norm.match(/espn\s*(\d+|extra)?/i);
    const suffix = sub && sub[1] ? ` ${sub[1]}` : '';
    return (
      <span className="inline-flex items-center gap-1 font-black italic text-rose-600 dark:text-rose-500 tracking-tighter">
        <span>ESPN</span>
        {suffix && <span className="text-slate-900 dark:text-white not-italic">{suffix}</span>}
      </span>
    );
  }

  // Globo
  if (norm.includes('globo')) {
    return (
      <span className="inline-flex items-center gap-1 font-black text-slate-900 dark:text-white tracking-wider">
        <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-tr from-cyan-400 via-pink-500 to-amber-400" />
        <span>GLOBO</span>
      </span>
    );
  }

  // Max / HBO Max
  if (norm.includes('max')) {
    return (
      <span className="inline-flex items-center font-black tracking-wider text-blue-600 dark:text-blue-400">
        MAX
      </span>
    );
  }

  // Prime Video
  if (norm.includes('prime') || norm.includes('amazon')) {
    return (
      <span className="inline-flex items-center font-black text-sky-600 dark:text-sky-400 tracking-tight">
        PRIME <span className="text-slate-900 dark:text-white font-semibold">VIDEO</span>
      </span>
    );
  }

  // CazéTV
  if (norm.includes('cazé') || norm.includes('caze')) {
    return (
      <span className="inline-flex items-center font-black text-amber-600 dark:text-amber-400 tracking-tight">
        CAZÉ<span className="text-rose-600 dark:text-rose-500">TV</span>
      </span>
    );
  }

  // YouTube
  if (norm.includes('youtube')) {
    return (
      <span className="inline-flex items-center gap-1 font-black text-slate-900 dark:text-white">
        <span className="text-rose-600 dark:text-rose-500 text-[10px]">▶</span>
        <span>YOUTUBE</span>
      </span>
    );
  }

  // Band / BandSports
  if (norm.includes('band')) {
    const isSports = norm.includes('sports');
    return (
      <span className="inline-flex items-center gap-1 font-black text-emerald-400">
        BAND{isSports ? <span className="text-amber-400">SPORTS</span> : ''}
      </span>
    );
  }

  // SBT
  if (norm.includes('sbt')) {
    return (
      <span className="inline-flex items-center font-black text-amber-300">
        SBT
      </span>
    );
  }

  // Record
  if (norm.includes('record')) {
    return (
      <span className="inline-flex items-center font-black text-blue-300">
        RECORD
      </span>
    );
  }

  // Paramount+
  if (norm.includes('paramount')) {
    return (
      <span className="inline-flex items-center font-black text-sky-400">
        PARAMOUNT+
      </span>
    );
  }

  // Canal GOAT
  if (norm.includes('goat')) {
    return (
      <span className="inline-flex items-center font-black text-emerald-300">
        GOAT
      </span>
    );
  }

  // SportyNet
  if (norm.includes('sportynet')) {
    return (
      <span className="inline-flex items-center font-black text-indigo-300">
        SPORTYNET
      </span>
    );
  }

  // Clean fallback in identical font size and uppercase style
  return (
    <span className="inline-flex items-center font-black uppercase tracking-wider">
      {name}
    </span>
  );
}
