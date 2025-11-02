import { Channel } from '@/lib/channels';
import { Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChannelBadgesProps {
  channel: Channel;
  variant?: 'default' | 'compact';
}

export function ChannelBadges({ channel, variant = 'default' }: ChannelBadgesProps) {
  const badges = [];

  // Badge NOUVEAU - Style épuré Next.js
  if (channel.isNew) {
    badges.push({
      key: 'new',
      text: 'New',
      className: 'bg-[#3498DB]/10 text-[#3498DB] border border-[#3498DB]/20'
    });
  }

  // Badge POPULAIRE - Style épuré Next.js
  if (channel.isPopular) {
    badges.push({
      key: 'popular',
      text: 'Popular',
      className: 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
    });
  }

  // Badge QUALITÉ - Style épuré Next.js
  if (channel.quality) {
    badges.push({
      key: 'quality',
      text: channel.quality,
      className: 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
    });
  }

  if (badges.length === 0) return null;

  if (variant === 'compact') {
    // Version compacte - Style Next.js épuré
    return (
      <div className="flex gap-1.5">
        {badges.map((badge) => (
          <div
            key={badge.key}
            className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-medium leading-none backdrop-blur-sm transition-all hover:scale-105",
              badge.className
            )}
          >
            {badge.text}
          </div>
        ))}
      </div>
    );
  }

  // Version par défaut - Style Next.js épuré
  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((badge) => (
        <div
          key={badge.key}
          className={cn(
            "px-2 py-1 rounded-md text-xs font-medium leading-none backdrop-blur-sm transition-all hover:scale-105",
            badge.className
          )}
        >
          {badge.text}
        </div>
      ))}
    </div>
  );
}

