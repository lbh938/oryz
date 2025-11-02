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
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
        <div className="relative aspect-video bg-gray-900 overflow-hidden">
          <img
            src={channel.thumbnail}
            alt={channel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

