import Link from 'next/link';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Channel } from '@/lib/channels';

interface ChannelCardProps {
  channel: Channel;
}

export function ChannelCard({ channel }: ChannelCardProps) {
  return (
    <Link href={`/watch/${channel.id}`} className="block">
      <Card className="overflow-hidden hover:shadow-2xl hover:shadow-[#3498DB]/30 hover:border-white/20 transition-all duration-300 cursor-pointer border-white/10 bg-white/5 backdrop-blur-xl group">
        <div className="relative aspect-video bg-gradient-to-br from-black/20 to-black/40 overflow-hidden rounded-t-2xl">
          <img
            src={channel.thumbnail}
            alt={channel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback vers une image par défaut si l'image ne charge pas
              const target = e.target as HTMLImageElement;
              if (target.src && !target.src.includes('placeholder')) {
                target.src = '/images/placeholder-channel.jpg';
              }
            }}
          />
          {channel.isLive && (
            <div className="absolute top-2 right-2 flex items-center gap-2 bg-red-600 text-white px-2 py-1 rounded-md text-xs font-semibold">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              LIVE
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              {channel.name}
            </h3>
            <Badge variant="secondary">{channel.category}</Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {channel.description}
          </p>
        </div>
      </Card>
    </Link>
  );
}

