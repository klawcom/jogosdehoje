import { useState } from 'react';
import { getTeamLogo, getTeamInitialsBadge } from '../lib/team-logos';

/**
 * Displays the club's official local SVG crest, an optional remote fallback logo,
 * or a gradient circular badge with the team initials.
 */
export function TeamBadge({
  teamName,
  size = 'md',
  fallbackLogoUrl,
}: {
  teamName: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  fallbackLogoUrl?: string;
}) {
  const [localError, setLocalError] = useState(false);
  const [remoteError, setRemoteError] = useState(false);

  const localLogo = getTeamLogo(teamName);
  const initialsInfo = getTeamInitialsBadge(teamName);

  const sizeClasses = {
    xs: 'h-4 w-4 text-[8px]',
    sm: 'h-5 w-5 text-[9px]',
    md: 'h-7 w-7 text-[11px]',
    lg: 'h-16 w-16 sm:h-20 sm:w-20 text-xl',
  }[size];

  if (localLogo && !localError) {
    return (
      <img
        src={localLogo}
        alt={teamName}
        onError={() => setLocalError(true)}
        className={`${sizeClasses} shrink-0 object-contain drop-shadow-sm`}
        loading="lazy"
      />
    );
  }

  if (fallbackLogoUrl && !remoteError) {
    return (
      <img
        src={fallbackLogoUrl}
        alt={teamName}
        onError={() => setRemoteError(true)}
        className={`${sizeClasses} shrink-0 object-contain drop-shadow-sm`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`flex ${sizeClasses} shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${initialsInfo.gradient} font-black text-white shadow-md ring-1 ring-white/20 select-none`}
    >
      {initialsInfo.initials}
    </div>
  );
}

