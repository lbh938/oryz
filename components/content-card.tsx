import Link from 'next/link';
import Image from 'next/image';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { ContentItem } from '@/lib/content';
import { Play, Star } from 'lucide-react';

interface ContentCardProps {
  content: ContentItem;
}

export function ContentCard({ content }: ContentCardProps) {
  return (
    <Link href={`/watch/${content.id}`} className="block group">
      <Card className="overflow-hidden hover:shadow-2xl hover:shadow-[#3498DB]/20 transition-all duration-300 cursor-pointer border-[#333333] bg-[#1a1a1a]">
        <div className="relative aspect-[3/4] bg-[#0a0a0a] overflow-hidden">
          <Image
            src={content.thumbnail}
            alt={content.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Overlay avec icône play */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="bg-[#3498DB] rounded-full p-4 transform scale-0 group-hover:scale-100 transition-transform duration-300">
              <Play className="h-6 w-6 text-white fill-white" />
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
            {content.isLive && (
              <div className="flex items-center gap-1.5 bg-red-600 text-white px-2 py-1 rounded-md text-xs font-label font-bold">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
            )}
            {content.quality && (
              <Badge className="bg-[#3498DB] text-white border-none font-label text-xs">
                {content.quality}
              </Badge>
            )}
          </div>

          {/* Badges bas */}
          <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
            {content.isNew && (
              <Badge className="bg-green-600 text-white border-none font-label text-xs">
                NOUVEAU
              </Badge>
            )}
            {content.isPopular && (
              <Badge className="bg-white/10 backdrop-blur-md text-white border border-white/20 font-label text-xs">
                POPULAIRE
              </Badge>
            )}
          </div>
        </div>

        <div className="p-3">
          <h3 className="font-display font-bold text-white text-sm sm:text-base line-clamp-1 group-hover:text-[#3498DB] transition-colors mb-1">
            {content.name}
          </h3>
          
          {/* Info supplémentaire */}
          <div className="flex items-center gap-2 text-xs text-white/60 font-sans mb-1">
            {content.year && <span>{content.year}</span>}
            {content.duration && (
              <>
                {content.year && <span>•</span>}
                <span>{content.duration}</span>
              </>
            )}
            {content.rating && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  <span>{content.rating.toFixed(1)}</span>
                </div>
              </>
            )}
          </div>

          {/* Genre */}
          {content.genre && content.genre.length > 0 && (
            <p className="text-xs text-white/40 font-sans line-clamp-1">
              {content.genre.slice(0, 2).join(', ')}
            </p>
          )}

          {/* Description courte */}
          {!content.genre && (
            <p className="text-xs text-white/40 font-sans line-clamp-2">
              {content.description}
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}

